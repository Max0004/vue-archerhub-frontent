import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {
    const { tournamentId, clubId, ageBracketIds, bowClassId } = getQuery(event)

    const ageIds = ageBracketIds.split(',').map(Number)

    const client = await connectToDatabase();
    const res = await client.query(`
      SELECT tp.id, u.firstname, u.lastname, u.title, u.gender, tp."rank", sum(ptr.score) AS total_score
      FROM tournamentparticipation tp
      INNER JOIN "user" u ON tp.participant = u.id
      INNER JOIN participanttournamentround ptr ON ptr.tournament = tp.id 
      WHERE tp.tournament = $1 and tp.club = $2 and tp.agebracket = ANY($3::int[]) and tp.bowclass = $4
      GROUP BY tp.id, u.firstname, u.lastname, u.title, u.gender, tp."rank"
      ORDER BY u.lastname;`,
      [ tournamentId, clubId, ageIds, bowClassId ]
    );
      
    if(res.rows.length === 0) {
      return { error: 'No entries found' };
    }
  
    return res.rows;
  } catch (error) {
    return { error: 'Failed to fetch Participants, '+error };
  }
});