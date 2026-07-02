import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();
    const res = await client.query(`
      SELECT 
        t.*, 
        (
          SELECT json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name
            )
          )
          FROM tournamentClubs tc
          JOIN club c ON tc.club = c.id
          WHERE tc.tournament = t.id
        ) as organizers
      FROM tournament t 
      INNER JOIN tournamentClubs tc ON tc.tournament = t.id
      INNER JOIN club c ON tc.club = c.id
      GROUP BY t.id
      ORDER BY "from" DESC;`);
      
      if(res.rows.length === 0) {
        return { error: 'No entries found' };
      }
  
      return res.rows;
    } catch (error) {
      return { error: 'Failed to fetch tournaments' };
    }
});