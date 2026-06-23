import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params!

  try {

    const client = await connectToDatabase();
    let res = await client.query(`
        SELECT distinct ab.id, ab.name , ab."position"
        FROM ageBracket ab 
        INNER JOIN tournamentparticipation tp ON tp.agebracket = ab.id 
        WHERE tp.tournament = $1
        ORDER BY ab."position";`,[id]);
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch age brackets' };
    }
});