import { defineEventHandler } from 'h3';
import connectToDatabase from '../../connect';

export default defineEventHandler(async (event) => {
  try {

    const client = await connectToDatabase();

    const body = await readBody(event)

    const participation = body.tournamentParticipation
    const rounds = body.participantTournamentRounds

    const inserted = await client.query(`
      INSERT INTO tournamentParticipation (
        tournament,
        participant,
        ageBracket,
        bowClass,
        club,
        rank,
        totalCenters,
        totalTens,
        totalNines,
        absent
      )
      VALUES (
        ${participation.tournament},
        ${participation.participant},
        ${participation.ageBracket},
        ${participation.bowClass},
        ${participation.club},
        ${participation.rank || null},
        ${participation.totalCenters},
        ${participation.totalTens},
        ${participation.totalNines},
        ${participation.absent}
      )
      RETURNING *;
    `);
      
      if(inserted.rows.length === 0) {
        return { error: 'Error during participation insertion' };
      }

      const participationId = inserted.rows[0].id

      for (const r of rounds) {
        await client.query(`
          INSERT INTO participantTournamentRound  (
            tournament,
            round,
            target,
            distance,
            arrowsshot,
            score
          )
          VALUES (
            ${participationId},
            ${r.round},
            ${r.target},
            ${r.distance},
            ${r.arrowsshot},
            ${r.score}
          );
        `)
      }
  
      return {
        success: true,
        participationId,
        insertedRounds: rounds.length
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