import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();
    const res = await client.query("SELECT * FROM target ORDER BY targetTitle;");
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch targets' };
    }
});