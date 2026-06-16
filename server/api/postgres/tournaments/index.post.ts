import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  try {

    const body = await readBody(event);

    console.log("Received tournament data:", body);

    const client = await connectToDatabase();
    const res = await client.query(`
      INSERT INTO 
      tournament (name, organizedBy, "from", "until", tournamentGroup, place, centersCounted, ninesCounted, titlebywinning, earnmedalinabsence, goldcounted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,[
        body.name,
        body.organizedBy,
        body.from,
        body.until,
        body.tournamentGroup,
        body.place,
        body.centersCounted,
        body.ninesCounted,
        body.titleByWinning,
        body.earnMedalInAbsence,
        body.goldCounted
      ]);
  
    if(!res.error) return {...res, statusCode: 200};

    return res
  } catch(error) {
    console.error('Error creating tournament:', error);
    throw new Error('Failed to create tournament');
  }
})