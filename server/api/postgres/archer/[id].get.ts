import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  const client = await connectToDatabase();
  const { id } = event.context.params!
  try {
    const res = await client.query(`
      SELECT 
        u.*,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name
            )
          )
          FROM userClub uc
          JOIN club c ON c.id = uc.clubId
          WHERE uc.userId = u.id
        ) as clubs,
        COUNT(tp.*) as tournamentparticipations,
        jsonb_build_object(
          'gold', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'tournament', t.name,
                'ageBracket', ab.name,
                'bowClass', bc.name,
                'date', t."from",
                'place', t.place,
                'title', t.titlebywinning
              )
              ORDER BY t."from" DESC
            )
            FROM tournamentParticipation tp
            JOIN tournament t ON t.id = tp.tournament
            JOIN ageBracket ab ON ab.id = tp.ageBracket
            JOIN bowClass bc ON bc.id = tp.bowClass
            WHERE tp.participant = u.id AND tp.rank = 1
          ),
          'silver', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'tournament', t.name,
                'ageBracket', ab.name,
                'bowClass', bc.name,
                'date', t."from",
                'place', t.place,
                'title', t.titlebywinning
              )
              ORDER BY t."from" DESC
            )
            FROM tournamentParticipation tp
            JOIN tournament t ON t.id = tp.tournament
            JOIN ageBracket ab ON ab.id = tp.ageBracket
            JOIN bowClass bc ON bc.id = tp.bowClass
            WHERE tp.participant = u.id AND tp.rank = 2
          ),
          'bronze', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'tournament', t.name,
                'ageBracket', ab.name,
                'bowClass', bc.name,
                'date', t."from",
                'place', t.place,
                'title', t.titlebywinning
              )
              ORDER BY t."from" DESC
            )
            FROM tournamentParticipation tp
            JOIN tournament t ON t.id = tp.tournament
            JOIN ageBracket ab ON ab.id = tp.ageBracket
            JOIN bowClass bc ON bc.id = tp.bowClass
            WHERE tp.participant = u.id AND tp.rank = 3
          )
        ) as medals
      FROM "user" u 
      INNER JOIN tournamentparticipation tp ON tp.participant = u.id
      WHERE u.id = $1
      GROUP BY u.id;  
    `,[id]);
    if(res.rows.length === 0) {
      return {error: "No User Data found"}
    }

    return res.rows[0]
  } catch(error) {
    return {error: "Failed to fetch user"}
  }
})