import * as v from 'valibot'
const ArrowSchema = v.object({
  id: v.string(),
  value: v.union([
    v.literal(''),
    v.picklist(
      ['X','10','9','8','7','6','5','4','3','2','1','M'],
      'Ungültiger Pfeilwert'
    )
  ])
})

const RoundSchema = v.object({
  id: v.string(),
  arrows: v.pipe(
    v.array(ArrowSchema),
    v.minLength(1, 'Mindestens ein Pfeil erforderlich')
  )
})

const TargetGroupSchema = v.object({
  id: v.string(),
  target: v.pipe(
    v.nullable(v.number()),
    v.check(
      value => value !== null,
      'Auflage erforderlich'
    )
  ),
  distance: v.pipe(
    v.number(),
    v.minValue(1, 'Distanz muss größer als 0 sein')
  ),
  rounds: v.pipe(
    v.array(RoundSchema),
    v.minLength(1, 'Mindestens eine Passe erforderlich')
  )
})

export const trainingSchema = v.pipe(
  v.object({
    description: v.pipe(
      v.string(),
      v.minLength(1, 'Beschreibung erforderlich')
    ),
    location: v.pipe(
      v.string(),
      v.minLength(1, 'Ort erforderlich')
    ),
    trainingStart: v.pipe(
      v.string(),
      v.minLength(1)
    ),
    trainingEnd: v.pipe(
      v.string(),
      v.minLength(1)
    ),
    scores: v.pipe(
      v.array(TargetGroupSchema),
      v.minLength(1, 'Mindestens eine Auflagengruppe')
    )
  }),
  v.check(
    ({ trainingStart, trainingEnd }) => 
      new Date(trainingEnd) >= new Date(trainingStart),
    'Die Endzeit muss nach der Startzeit liegen'
  )
)