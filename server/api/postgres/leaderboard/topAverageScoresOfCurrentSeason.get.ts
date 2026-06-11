import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {
    const client = await connectToDatabase();
    const res = await client.query(`
      WITH season_bounds AS (
        SELECT 
          CASE 
            WHEN CURRENT_DATE >= (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
            THEN (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
            ELSE (date_trunc('year', CURRENT_DATE) - INTERVAL '3 months')
          END AS season_start,
    
          CASE 
            WHEN CURRENT_DATE >= (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
            THEN (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year' + INTERVAL '9 months')
            ELSE (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
          END AS season_end
      ),

      current_season AS (
        SELECT 
          tp.id AS participation_id,
          tp.participant AS archer_id,
          u.title,
          u.firstname,
          u.lastname,
          tp.bowclass,
          tp.agebracket,
          tp.tournament
        FROM tournamentParticipation tp
        JOIN "user" u ON u.id = tp.participant
        JOIN tournament t ON t.id = tp.tournament
        CROSS JOIN season_bounds sb
        WHERE t."from" >= sb.season_start
          AND t."from" < sb.season_end
          AND tp.absent IS NOT NULL
      ),

      round_scores AS (
        SELECT 
          ptr.tournament AS participation_id,
          SUM(ptr.score) AS total_score,
          SUM(ptr.arrowsshot) AS total_arrows
        FROM participantTournamentRound ptr
        GROUP BY ptr.tournament
      ),

      per_tournament_avg AS (
        SELECT
          cs.archer_id,
          cs.title,
          cs.firstname,
          cs.lastname,
          cs.tournament,
          cs.bowclass,
          cs.agebracket,
          (rs.total_score::numeric / NULLIF(rs.total_arrows::numeric, 0)) AS avg_score
        FROM current_season cs
        JOIN round_scores rs ON rs.participation_id = cs.participation_id
      ),

      best_avg_per_archer AS (
        SELECT DISTINCT ON (archer_id)
          archer_id,
          title,
          firstname,
          lastname,
          tournament,
          bowclass,
          agebracket,
          avg_score AS best_avg
        FROM per_tournament_avg
        ORDER BY archer_id, avg_score DESC
      ),

      ranked AS (
        SELECT
          bap.*,
          DENSE_RANK() OVER (ORDER BY bap.best_avg DESC) AS rnk
        FROM best_avg_per_archer bap
      )

      SELECT
        rnk,
        title,
        firstname,
        lastname,
        ROUND(best_avg, 2) AS yearly_average,
        t.name AS tournament_name,
        bc.name AS bowclass_name,
        ab.name AS agebracket_name
      FROM ranked r
      JOIN tournament t ON t.id = r.tournament
      JOIN bowclass bc ON bc.id = r.bowclass
      JOIN agebracket ab ON ab.id = r.agebracket
      ORDER BY rnk, lastname, firstname;
    `);  
      
    if(res.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No entries found'
      });
    }  
    return res.rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching average scores leaderboard data',
      cause: error instanceof Error ? error.message : String(error)
    });
  }
});