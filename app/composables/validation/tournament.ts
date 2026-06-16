import * as v from 'valibot'
export const tournamentSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Turniernamen eingeben')
    ),

    organizedBy: v.pipe(
      v.number(),
      v.minValue(1, 'Bitte einen Veranstalter auswählen.')
    ),

    tournamentGroup: v.pipe(
      v.number(),
      v.minValue(1, 'Bitte eine Turniergruppe auswählen.')
    ),

    place: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Austragungsort einngeben.')
    ),

    from: v.any(),

    until: v.optional(v.any()),

    centersCounted: v.boolean(),
    ninesCounted: v.boolean(),
    goldCounted: v.boolean(),

    titleByWinning: v.optional(v.nullable(v.string())),
    earnMedalInAbsence: v.boolean()
  }),

  v.forward(
    v.partialCheck(
      [['from'], ['until']],
      (input) => {
        if(!input.until) return true

        return new Date(input.until).getTime() >= new Date(input.from).getTime()
      },
      'Das Enddatum darf nicht vor dem Startdatum liegen.'
    ),
    ['until']
  )
)

export type tournamentSchema = v.InferOutput<typeof tournamentSchema>