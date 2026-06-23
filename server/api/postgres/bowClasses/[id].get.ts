import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const client = await connectToDatabase();

  const { id } = event.context.params!

  const query = `
    SELECT distinct bc.id, bc."name", bc."position" 
    FROM bowclass bc
    INNER JOIN tournamentparticipation tp on tp.bowclass = bc.id
    WHERE tp.tournament = $1
    ORDER BY bc."position";`;
  try {
    const result = await client.query(query,[id]);

    return result.rows;
  } catch(error) {
    return sendError(event,error);
  }
});