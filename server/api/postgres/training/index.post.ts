import { defineEventHandler } from 'h3';
import connectToDatabase from '../connect';

export default defineEventHandler(async (event) => {
  try {

    const { archerId, payload } = await readBody(event)

    const client = await connectToDatabase();
    const trainingDayId = await client.query(`
        INSERT INTO userTrainingDay(userId,description,trainingStart,trainingEnd)
        VALUES($1,$2,$3,$4)
        RETURNING id;
      `,[archerId,payload.description,payload.trainingStart,payload.trainingEnd]);
    
    if(!trainingDayId.rows[0]?.id) {
      return { statusCode: 400 }
    }
      
    payload.records?.forEach(async record => {
      try {
        await client.query(`
          INSERT INTO userTrainingRecord(
            trainingDayId,
            targetId,
            distance,
            totalCenters,
            totalTens,
            totalNines,
            totalEights,
            totalSevens,
            totalSixs,
            totalFives,
            totalFours,
            totalThrees,
            totalTwos,
            totalOnes,
            missed
          )
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        `,[
            trainingDayId.rows[0]?.id,
            record.targetId,
            record.distance,
            record.totalCenters,
            record.totalTens,
            record.totalNines,
            record.totalEights,
            record.totalSevens,
            record.totalSixs,
            record.totalFives,
            record.totalFours,
            record.totalThrees,
            record.totalTwos,
            record.totalOnes,
            record.missed
          ]
        )
      } catch(error) {
        return { error: 'An Error occured while inserting training records: '+error, statusCode: 500 }
      }
    })

    const trainingRecords = payload.records?.map(record => {
      const sum = record.totalCenters * 10 + 
          record.totalTens * 10 + 
          record.totalNines * 9 + 
          record.totalEights * 8 + 
          record.totalSevens * 7 + 
          record.totalSixs * 6 + 
          record.totalFives * 5 +
          record.totalFours * 4 +
          record.totalThrees * 3 +
          record.totalTwos * 2 +
          record.totalOnes
        
        const count = record.totalCenters + 
          record.totalTens + 
          record.totalNines + 
          record.totalEights + 
          record.totalSevens + 
          record.totalSixs + 
          record.totalFives +
          record.totalFours +
          record.totalThrees +
          record.totalTwos +
          record.totalOnes
        
        const avg = count > 0 ? sum / count : 0 
        return {
          target: record.targetId,
          distance: record.distance,
          totalCenters: record.totalCenters,
          totalTens: record.totalTens,
          totalNines: record.totalNines,
          totalEights: record.totalEights,
          totalSevens: record.totalSevens,
          totalSixs: record.totalSixs,
          totalFives: record.totalFives,
          totalFours: record.totalFours,
          totalThrees: record.totalThrees,
          totalTwos: record.totalTwos,
          totalOnes: record.totalOnes,
          missed: record.missed,
          score: sum,
          arrowsShot: count,
          avgRingsHit: avg.toFixed(2)
        }
    })
  
    return { newSession: {
      training_day_id: trainingDayId.rows[0]?.id,
      description: payload.description,
      trainingStart: payload.trainingStart,
      trainingEnd: payload.trainingEnd,
      location: payload.location,
      training_records: trainingRecords
    }, statusCode: 200 };
  } catch (error) {
    return { error: 'Failed to submit training data', statusCode: 500 };
  }
});