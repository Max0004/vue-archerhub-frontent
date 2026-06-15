import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  const client = await connectToDatabase();

  const query = `
    SELECT 
      u.id,
      u.firstname,
      u.lastname,
      u.title,
      u.gender,
      u.birthday,
      COALESCE(
        jsonb_agg(distinct jsonb_build_object('club_id', c.id, 'club_name', c.name, 'club_url', c.website)) 
        FILTER (WHERE c.id IS NOT NULL),'[]'::jsonb
      ) AS clubs 
    FROM "user" u
    LEFT JOIN userclub uc ON uc.userid = u.id 
    LEFT JOIN club c ON uc.clubid = c.id 
    WHERE u.active IS TRUE
    GROUP BY u.id, u.firstname, u.lastname, u.title, u.gender, u.birthday
    ORDER BY u.lastname ASC;
  `;

  try {
    const result = await client.query(query);

    return result.rows;
  } catch(error) {
    return sendError(event,error);
  }
});