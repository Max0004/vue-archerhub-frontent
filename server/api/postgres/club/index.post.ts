import connectToDatabase from "../connect";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const client = await connectToDatabase();
    const res = await client.query(`
      INSERT INTO club(name,tournamentBoardName,description,website,organization)
      VALUES($1,$2,$3,$4,$5)`,[
        body.name,
        body.tournamentBoardName,
        body.description,
        body.webURL,
        body.organization
      ])

      if(!res.error) return { ...res, statusCode: 200 }

      return res
  } catch(error) {
    console.error('Error creating club:', error);
    throw new Error('Failed to create club');
  }
})