import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();
    const res = await client.query(`
      SELECT 
        t.*, 
        c.name as organizer
      FROM tournament t 
      INNER JOIN club c ON t.organizedby = c.id
      ORDER BY "from" DESC;`);
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch tournaments' };
    }
});