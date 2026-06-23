import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();
    const res = await client.query(`
      SELECT 
        u.*, 
        JSON_AGG( c."name" ) AS clubs
      FROM "user" u 
      LEFT JOIN userclub ms ON ms.userid = u.id
      LEFT JOIN club c ON ms.clubid = c.id
      GROUP BY u.id
      ORDER BY lastname, firstname;`);
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch members' };
    }
});