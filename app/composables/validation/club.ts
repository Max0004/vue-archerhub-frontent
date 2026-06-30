import * as v from 'valibot'
export const clubSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Namen eingeben')
    ),
    tournamentBoardName: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Anzeigenamen für Turnierlisten eingeben')
    ),
    description: v.optional(v.string()),
    webURL: v.optional(v.string()),
    organization: v.boolean()
  })
)