import { defineEventHandler } from 'h3';
import connectToDatabase from '../../connect';

export default defineEventHandler(async () => {
  const query = `
    SELECT
      t.id AS tournament_id,
      t.name AS tournament_name,
      t.place,
      t."from",
      t."until",
      json_agg(DISTINCT jsonb_build_object(
        'ageBracketId', ab.id,
        'ageBracketName', ab.name,
        'ageBracketPosition', ab.position
      )) AS age_brackets,
      json_agg(DISTINCT jsonb_build_object(
        'participantId', u.id,
        'title', u.title,
        'firstname', u.firstname,
        'lastname', u.lastname,
        'ageBracketId', tp.ageBracket,
        'bowClassId', bc.id,
        'bowClassName', bc.name,
        'bowClassPosition', bc.position,
        'rank', tp.rank,
        'rounds', COALESCE(rounds.scores, '[]'::json)
      )) AS participants
    FROM tournament t
    LEFT JOIN tournamentParticipation tp ON tp.tournament = t.id
    LEFT JOIN "user" u ON u.id = tp.participant
    LEFT JOIN ageBracket ab ON ab.id = tp.ageBracket
    LEFT JOIN bowClass bc ON tp.bowclass = bc.id
    LEFT JOIN LATERAL (
      SELECT json_agg(jsonb_build_object(
        'round', ptr.round,
        'score', ptr.score
      )) AS scores
      FROM participantTournamentRound ptr
      WHERE ptr.tournament = tp.id
    ) rounds ON true
    WHERE tp.absent IS false
    GROUP BY t.id
    HAVING COUNT(tp.id) > 0
    ORDER BY t."from" DESC;
  `;

  try {
    const client = await connectToDatabase();
    const result = await client.query(query);

    return result.rows;
  } catch (error) {
    return sendError(event, error);
  }
});