import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();

    const body = await readBody(event)

    const team = body.team
    const teamMembers = body.teamMembers

    const inserted = await client.query(`
      INSERT INTO tournamentteam (
        tournament,
        bowclass,
        agebracket,
        rank
      )
      VALUES (
        ${team.tournament},
        ${team.bowClass},
        ${team.ageBracket},
        ${team.rank}
      )
      RETURNING *;
    `);
      
      if(inserted.rows.length === 0) {
        return { error: 'Error during participation insertion' };
      }

      const teamId = inserted.rows[0].id

      for (const memberId of teamMembers) {
        await client.query(`
          INSERT INTO tournamentteammember  (
            teamid,
            participantid
          )
          VALUES (
            ${teamId},
            ${memberId}
          );
        `)
      }
  
      return {
        success: true,
        participationId: teamId,
        insertedRounds: teamMembers.length
      }
    } catch (error) {
        console.error("DB error:", error)
        throw createError({
          statusCode: 500,
          statusMessage: "Database insert failed",
          data: error
        })
    }
});