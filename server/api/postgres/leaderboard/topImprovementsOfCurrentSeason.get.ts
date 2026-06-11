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
          END AS current_season_start
      ),

      season_ranges AS (
        SELECT
          current_season_start,
          (current_season_start + INTERVAL '1 year') AS current_season_end,
          (current_season_start - INTERVAL '1 year') AS prev_season_start,
          current_season_start AS prev_season_end
        FROM season_bounds
      ),

      seasonal_data AS (
        SELECT 
          u.id AS archer_id,
          u.title,
          u.firstname,
          u.lastname,
          CASE 
            WHEN t."from" >= sr.prev_season_start AND t."from" < sr.prev_season_end THEN 'prev'
            WHEN t."from" >= sr.current_season_start AND t."from" < sr.current_season_end THEN 'curr'
          END AS season_type,
          SUM(ptr.score)::numeric / NULLIF(SUM(ptr.arrowsshot)::numeric, 0) AS avg_score,
          COUNT(DISTINCT t.id) AS tournament_count
        FROM tournamentParticipation tp
        JOIN "user" u ON u.id = tp.participant
        JOIN tournament t ON t.id = tp.tournament
        JOIN participantTournamentRound ptr ON ptr.tournament = tp.id
        CROSS JOIN season_ranges sr
        WHERE tp.absent IS NOT NULL
          AND (
            t."from" BETWEEN sr.prev_season_start AND sr.current_season_end
          )
        GROUP BY u.id, u.title, u.firstname, u.lastname, season_type
      ),

      pivoted AS (
        SELECT 
          archer_id,
          title,
          firstname,
          lastname,

          MAX(CASE WHEN season_type = 'prev' THEN avg_score END) AS prev_season_avg,
          MAX(CASE WHEN season_type = 'curr' THEN avg_score END) AS curr_season_avg,

          MAX(CASE WHEN season_type = 'prev' THEN tournament_count END) AS prev_season_count,
          MAX(CASE WHEN season_type = 'curr' THEN tournament_count END) AS curr_season_count

        FROM seasonal_data
        GROUP BY archer_id, title, firstname, lastname
      ),

      improvements AS (
        SELECT 
          title,
          firstname,
          lastname,
          (
            (curr_season_avg - prev_season_avg)
            / NULLIF((prev_season_count + curr_season_count), 0)
          ) AS improvement
        FROM pivoted
        WHERE prev_season_avg IS NOT NULL 
          AND curr_season_avg IS NOT NULL
          AND prev_season_count IS NOT NULL
          AND curr_season_count IS NOT NULL
      )

      SELECT 
        title,
        firstname,
        lastname,
        ROUND(improvement, 2) AS improvement
      FROM improvements
      ORDER BY improvement DESC;
    `);
      
    if(res.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No improvements found'
      });
    }
  
    return res.rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching improvements leaderboard data',
      cause: error instanceof Error ? error.message : String(error)
    });
  }
});