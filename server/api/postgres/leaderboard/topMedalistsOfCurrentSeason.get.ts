import { defineEventHandler } from 'h3'
import connectToDatabase from '../connect'

export default defineEventHandler(async () => {
  try {
    const client = await connectToDatabase()
    const result = await client.query(`
      WITH season_bounds AS (
        SELECT 
          CASE 
            WHEN CURRENT_DATE >= (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
            THEN (date_trunc('year', CURRENT_DATE) + INTERVAL '9 months')
            ELSE (date_trunc('year', CURRENT_DATE) - INTERVAL '3 months')
          END AS current_season_start
      ),

      season_ranges AS (
        SELECT
          current_season_start,
          (current_season_start + INTERVAL '1 year') AS current_season_end
        FROM season_bounds
      ),

      current_season_individual AS (
        SELECT 
          tp.participant AS archer_id,
          u.title,
          u.firstname,
          u.lastname,
          tp.rank
        FROM tournamentParticipation tp
        JOIN tournament t ON t.id = tp.tournament
        JOIN "user" u ON u.id = tp.participant
        CROSS JOIN season_ranges sr
        WHERE t."from" >= sr.current_season_start
          AND t."from" < sr.current_season_end
          AND tp.rank IS NOT NULL
      ),

      individual_medals AS (
        SELECT 
          archer_id,
          title,
          firstname,
          lastname,
          COUNT(*) FILTER (WHERE rank = 1) AS gold,
          COUNT(*) FILTER (WHERE rank = 2) AS silver,
          COUNT(*) FILTER (WHERE rank = 3) AS bronze
        FROM current_season_individual
        GROUP BY archer_id, title, firstname, lastname
      ),

      team_medals AS (
        SELECT 
          tp.participant AS archer_id,
          u.title,
          u.firstname,
          u.lastname,
          COUNT(*) FILTER (WHERE tt.rank = 1) AS gold,
          COUNT(*) FILTER (WHERE tt.rank = 2) AS silver,
          COUNT(*) FILTER (WHERE tt.rank = 3) AS bronze
        FROM tournamentteam tt
        JOIN tournamentteammember ttm ON tt.id = ttm.teamid
        JOIN tournamentParticipation tp ON ttm.participantid = tp.id
        JOIN "user" u ON u.id = tp.participant
        JOIN tournament t ON t.id = tt.tournament
        CROSS JOIN season_ranges sr
        WHERE t."from" >= sr.current_season_start
          AND t."from" < sr.current_season_end
          AND tt.rank IS NOT NULL
        GROUP BY tp.participant, u.title, u.firstname, u.lastname
      ),

      combined_medals AS (
        SELECT 
          COALESCE(i.title, t.title) AS title,
          COALESCE(i.archer_id, t.archer_id) AS archer_id,
          COALESCE(i.firstname, t.firstname) AS firstname,
          COALESCE(i.lastname, t.lastname) AS lastname,
          COALESCE(i.gold, 0) + COALESCE(t.gold, 0) AS gold,
          COALESCE(i.silver, 0) + COALESCE(t.silver, 0) AS silver,
          COALESCE(i.bronze, 0) + COALESCE(t.bronze, 0) AS bronze
        FROM individual_medals i
        FULL OUTER JOIN team_medals t 
          ON i.archer_id = t.archer_id
      ),

      ranked_leaderboard AS (
        SELECT
          title,
          firstname,
          lastname,
          gold,
          silver,
          bronze,
          DENSE_RANK() OVER (
            ORDER BY gold DESC, silver DESC, bronze DESC
          ) AS place
        FROM combined_medals
      )

      SELECT
        place,
        title,
        firstname,
        lastname,
        gold,
        silver,
        bronze
      FROM ranked_leaderboard
      ORDER BY place, lastname, firstname;
    `)
    return result.rows
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching medalists leaderboard data',
      cause: error instanceof Error ? error.message : String(error)
    });
  }
})