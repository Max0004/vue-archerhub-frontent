import { defineEventHandler } from 'h3';
import connectToDatabase from '../../connect';

export default defineEventHandler(async (event) => {
  try {
    const client = await connectToDatabase();
    const res = await client.query(`
      SELECT
        t.id AS tournament_id,
        t.name AS tournament_name,
        t.place,
        t."from" as tournament_date,
        t.tournamentGroup as tournament_group,
        t.goldcounted,
        u.id AS user_id,
        u.title,
        u.firstname,
        u.lastname,
        u.active,
        tp.rank,
        tp.totalcenters,
        tp.totaltens,
        tp.totalnines,
        tp.absent,
        COALESCE(SUM(ptr.score), 0) AS total_score,
        COALESCE(SUM(ptr.arrowsshot), 0) AS total_arrows,
        CASE 
          WHEN COALESCE(SUM(ptr.arrowsshot), 0) > 0 THEN ROUND(SUM(ptr.score)::numeric / SUM(ptr.arrowsshot)::numeric, 2)
          ELSE 0
        END AS ring_average
      FROM tournamentParticipation tp
      JOIN tournament t ON tp.tournament = t.id
      JOIN "user" u ON tp.participant = u.id
      LEFT JOIN participantTournamentRound ptr 
        ON ptr.tournament = tp.id
      GROUP BY t.id, t.name, t.place, t."from", t."until", t.tournamentGroup, t.goldcounted, u.id, u.title, u.firstname, u.lastname, u.active, tp.rank, tp.totalcenters, tp.totaltens, tp.totalnines, tp.absent
      HAVING SUM(ptr.arrowsshot) > 0
      ORDER BY u.lastname, u.firstname;`
    );
    if(res.rows.length === 0) {
      return { error: 'No members found' };
    }
    
    return res.rows;
  } catch (error) {
    return { error: 'Failed to fetch members' };
  }
});