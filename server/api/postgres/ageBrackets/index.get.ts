import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const tournamentId = getQuery(event)?.tournamentId
  try {

    const client = await connectToDatabase();
    let res = null

    if(tournamentId) {
      res = await client.query(`
        SELECT distinct ab.id, ab.name , ab."position"
        FROM ageBracket ab 
        INNER JOIN tournamentparticipation tp ON tp.agebracket = ab.id 
        WHERE tp.tournament = $1
        ORDER BY ab."position";`,[tournamentId]);
    } else {
      res = await client.query("SELECT * FROM ageBracket ORDER BY minimumage, name;");
    }
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch age brackets' };
    }
});