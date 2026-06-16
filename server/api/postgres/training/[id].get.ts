import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
    const { id } = event.context.params!

    try {
        const client = await connectToDatabase();
        const res = await client.query(`
          SELECT
            utd.id AS training_day_id,
            utd.description,
            utd.trainingStart,
            utd.trainingEnd,
            utd.location,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'target', t.targetTitle,
                'distance', utr.distance,
                'totalCenters', utr.totalCenters,
                'totalTens', utr.totalTens,
                'totalNines', utr.totalNines,
                'totalEights', utr.totalEights,
                'totalSevens', utr.totalSevens,
                'totalSixs', utr.totalSixs,
                'totalFives', utr.totalFives,
                'totalFours', utr.totalFours,
                'totalThrees', utr.totalThrees,
                'totalTwos', utr.totalTwos,
                'totalOnes', utr.totalOnes,
                'missed', utr.missed,
                'score',
                  (
                    (COALESCE(totalCenters, 0) * 10) +
                    (COALESCE(totalTens, 0) * 10) +
                    (COALESCE(totalNines, 0) * 9) +
                    (COALESCE(totalEights, 0) * 8) +
                    (COALESCE(totalSevens, 0) * 7) +
                    (COALESCE(totalSixs, 0) * 6) +
                    (COALESCE(totalFives, 0) * 5) +
                    (COALESCE(totalFours, 0) * 4) +
                    (COALESCE(totalThrees, 0) * 3) +
                    (COALESCE(totalTwos, 0) * 2) +
                    (COALESCE(totalOnes, 0) * 1)
                ),
              'arrowsShot',
                (
                  COALESCE(totalCenters, 0) +
                  COALESCE(totalTens, 0) +
                  COALESCE(totalNines, 0) +
                  COALESCE(totalEights, 0) +
                  COALESCE(totalSevens, 0) +
                  COALESCE(totalSixs, 0) +
                  COALESCE(totalFives, 0) +
                  COALESCE(totalFours, 0) +
                  COALESCE(totalThrees, 0) +
                  COALESCE(totalTwos, 0) +
                  COALESCE(totalOnes, 0) +
                  COALESCE(missed, 0)
                ),
              'avgRingsHit',
              CASE 
                WHEN (
                  COALESCE(totalCenters, 0) +
                  COALESCE(totalTens, 0) +
                  COALESCE(totalNines, 0) +
                  COALESCE(totalEights, 0) +
                  COALESCE(totalSevens, 0) +
                  COALESCE(totalSixs, 0) +
                  COALESCE(totalFives, 0) +
                  COALESCE(totalFours, 0) +
                  COALESCE(totalThrees, 0) +
                  COALESCE(totalTwos, 0) +
                  COALESCE(totalOnes, 0) +
                  COALESCE(missed, 0)
                ) > 0
              THEN (
                (COALESCE(totalCenters, 0) * 10) +
                (COALESCE(totalTens, 0) * 10) +
                (COALESCE(totalNines, 0) * 9) +
                (COALESCE(totalEights, 0) * 8) +
                (COALESCE(totalSevens, 0) * 7) +
                (COALESCE(totalSixs, 0) * 6) +
                (COALESCE(totalFives, 0) * 5) +
                (COALESCE(totalFours, 0) * 4) +
                (COALESCE(totalThrees, 0) * 3) +
                (COALESCE(totalTwos, 0) * 2) +
                (COALESCE(totalOnes, 0) * 1)
              )::numeric
              /
              (
                COALESCE(totalCenters, 0) +
                COALESCE(totalTens, 0) +
                COALESCE(totalNines, 0) +
                COALESCE(totalEights, 0) +
                COALESCE(totalSevens, 0) +
                COALESCE(totalSixs, 0) +
                COALESCE(totalFives, 0) +
                COALESCE(totalFours, 0) +
                COALESCE(totalThrees, 0) +
                COALESCE(totalTwos, 0) +
                COALESCE(totalOnes, 0) +
                COALESCE(missed, 0)
              )
              ELSE NULL
            END
          )
        ) AS training_records
          FROM userTrainingDay utd
            JOIN userTrainingRecord utr
              ON utr.trainingDayId = utd.id
            JOIN target t
              ON t.id = utr.targetId
            WHERE utd.userId = $1
            GROUP BY utd.id
            ORDER BY utd.trainingStart;  
          `,[id]
        );
        if(res.rows.length === 0) {
            return { error: 'No training entry found' };
        }

        return res.rows;
    } catch (error) {
        return { error: 'Failed to fetch training entries' };
    }
});