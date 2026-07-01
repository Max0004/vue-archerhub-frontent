import * as v from 'valibot'
export const archerSchema = v.pipe(
  v.object({
    firstname: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Vornamen eingeben')
    ),
    lastname: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'Bitte einen Nachnamen eingeben')
    ),
    title: v.optional(v.string()),
    gender: v.union([
      v.literal(''),
      v.picklist(
        ['MALE','FEMALE','OTHER'],
        'Ungültige Geschlechtseingabe'
      )
    ]),
    birthday: v.optional(
      v.string()
    ),
    active: v.boolean(),
    clubIds: v.optional(
      v.array(v.number())
    )
  })
)