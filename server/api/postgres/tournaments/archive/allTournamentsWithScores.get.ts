import connectToDatabase from "../../connect"

export default defineEventHandler(async () => {
  const query = `
    SELECT 
      t.id AS tournament_id,
      t.name AS tournament_name,
      c.name AS organizer_name,
      t."from" AS startdate,
      t."until" AS enddate,
      t.place,
      t.centersCounted,
      t.ninesCounted,
      t.titlebywinning,
      t.earnmedalinabsence,
      COALESCE(
        json_agg(
          json_build_object(
            'ageBracketId', ab.id,
            'ageBracketName', ab.name,
            'ageBracketPosition', ab.position,
            'participants',
            (
              SELECT json_agg(
                json_build_object(
                  'participantId', u.id,
                  'title', u.title,
                  'firstname', u.firstname,
                  'lastname', u.lastname,
                  'clubName', c1.tournamentBoardName,
                  'bowClassId', bc.id,
                  'bowClass', bc.name,
                  'bowClassPosition', bc.position,
                  'rank', tp.rank,
                  'absent', tp.absent,
                  'scores', (
                    SELECT json_agg(
                      json_build_object(
                        'round', ptr.round,
                        'score', ptr.score
                      )
                    )
                    FROM participantTournamentRound ptr
                    WHERE ptr.tournament = tp.id
                  ),
                  'totalCenters', tp.totalCenters,
                  'totalTens', tp.totalTens,
                  'totalNines', tp.totalNines,
                  'totalScore', (
                    SELECT COALESCE(SUM(ptr.score),0)
                    FROM participantTournamentRound ptr
                    WHERE ptr.tournament = tp.id
                  ),
                  'totalArrows', (
                    SELECT COALESCE(SUM(ptr.arrowsshot),0)
                    FROM participantTournamentRound ptr
                    WHERE ptr.tournament = tp.id
                  )
                )
                ORDER BY tp.rank ASC
              )
              FROM tournamentParticipation tp
              JOIN "user" u ON tp.participant = u.id
              JOIN club c1 ON tp.club = c1.id
              JOIN bowClass bc ON tp.bowClass = bc.id
              WHERE tp.tournament = t.id
                AND tp.ageBracket = ab.id
                AND EXISTS (
                  SELECT 1
                  FROM participantTournamentRound ptr
                  WHERE ptr.tournament = tp.id
                )
            )
          )
          ORDER BY ab.minimumage, ab.name
        ) FILTER (WHERE ab.id IS NOT NULL)
        , '[]'
      ) AS ageBrackets
    FROM tournament t
    JOIN club c ON t.organizedBy = c.id
    LEFT JOIN ageBracket ab
      ON ab.id IN (
        SELECT DISTINCT ageBracket
        FROM tournamentParticipation tp2
        WHERE tp2.tournament = t.id
      )
    GROUP BY 
      t.id, t.name, c.name, t."from", t."until", t.place,
      t.centersCounted, t.ninesCounted, t.titlebywinning, t.earnmedalinabsence
    ORDER BY t."from" DESC;
  `

  try {
    const client = await connectToDatabase();
    const result = await client.query(query);

    return result.rows;
  } catch(error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching archive data',
      cause: error instanceof Error ? error.message : String(error)
    });
  }
})