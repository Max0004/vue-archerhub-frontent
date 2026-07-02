import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  try {

    const body = await readBody(event);
    const organizers = body.organizedBy

    const client = await connectToDatabase();
    const inserted = await client.query(`
      INSERT INTO 
      tournament (name, "from", "until", tournamentGroup, place, centersCounted, ninesCounted, titlebywinning, earnmedalinabsence, goldcounted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`,[
        body.name,
        body.from,
        body.until,
        body.tournamentGroup,
        body.place,
        body.centersCounted,
        body.ninesCounted,
        body.titleByWinning,
        body.earnMedalInAbsence,
        body.goldCounted
      ]
    );

    if(inserted.rows.length === 0) {
      return { error: 'Error during participation insertion' };
    }

    const tournamentId = inserted.rows[0].id

    if(tournamentId && organizers && organizers.length) {
      for(const organizer of organizers) {
        await client.query(`
          INSERT INTO tournamentClubs (tournament,club)
          VALUES ($1,$2)
        `,[
          tournamentId,
          organizer
        ])
      }
    }

    return {...inserted,statusCode: 200}
  } catch(error) {
    console.error('Error creating tournament:', error);
    throw new Error('Failed to create tournament');
  }
})