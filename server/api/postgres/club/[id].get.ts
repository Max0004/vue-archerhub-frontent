import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const client = await connectToDatabase();

  const { id } = event.context.params!

  const query = `
    SELECT distinct c.id, c."name"
    FROM club c
    INNER JOIN tournamentparticipation tp ON tp.club = c.id
    WHERE c.id != 997 and c.id != 998 and c.id  != 999 and tp.tournament = $1`;
  try {
    const result = await client.query(query,[id]);

    return result.rows;
  } catch(error) {
    return sendError(event,error);
  }
});