import connectToDatabase from "../connect"
import { formatBirthday } from "~/composables/datetime"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const client = await connectToDatabase()
    const res = await client.query(`
      INSERT INTO
      "user"(firstname, lastname, title, gender, birthday, active)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [body.firstname,body.lastname,body.title,body.gender,formatBirthday(body.birthday),body.active])

    if(!res || !res.rows[0]?.id) {
      throw new Error('Failed to create archer')
    }

    if(body.clubIds && body.clubIds.length > 0) {
      const clubIds = Array.of(body.clubIds).flat()
      clubIds.forEach(async club => {
        await client.query(`INSERT INTO userclub(userid,clubid) VALUES($1,$2)`,[res.rows[0]?.id,club.id])
      })
    }

    return {statusCode: 200,res}
  } catch(error) {
    console.error('Error creating archer:', error)
    throw new Error('Server Error while creating archer')
  }
})