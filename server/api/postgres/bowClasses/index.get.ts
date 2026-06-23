import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const tournamentId = getQuery(event)?.tournamentId
  try {

    const client = await connectToDatabase();
    let res = null

    if(tournamentId) {
      res = await client.query(`
        SELECT distinct bc.id, bc."name", bc."position" 
        FROM bowclass bc
        INNER JOIN tournamentparticipation tp on tp.bowclass = bc.id
        WHERE tp.tournament = $1
        ORDER BY bc."position";`,
      [ tournamentId ]);
    } else {
      res = await client.query("SELECT * FROM bowClass ORDER BY name;");
    }
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch bow classes' };
    }
});