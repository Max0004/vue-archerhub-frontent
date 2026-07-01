import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const client = await connectToDatabase();

  const includeGuest = getQuery(event)?.includeGuest || false

  const query = `
    SELECT *
    FROM club
    ${includeGuest ? '' : 'WHERE specialClass IS FALSE'}
    ORDER BY name;
  `;
  try {
    const result = await client.query(query);

    return result.rows;
  } catch(error) {
    return sendError(event,error);
  }
});