export function buildRoundTrackerRows(
  participants,
  selectedParticipants
) {
  const filtered = participants.filter(p =>
    selectedParticipants.includes(p.participantId)
  )

  if (!filtered.length) {
    return {
      maxRound: 0,
      rows: []
    }
  }

  const maxRound = Math.max(
    ...filtered.flatMap(p =>
      p.rounds.map(r => r.round)
    )
  )

  const rows = filtered.map(p => {
    const rounds = []

    let lastScore = null

    for (let r = 1; r <= maxRound; r++) {
      const entry = p.rounds.find(x => x.round === r)

      if (!entry) {
        rounds.push({
          round: r,
          score: "-",
          diff: null
        })
        continue
      }

      const score = entry.score

      let diff = null

      if (lastScore !== null) {
        diff = ((score - lastScore) / lastScore) * 100
      }

      rounds.push({
        round: r,
        score,
        diff
      })

      lastScore = score
    }

    return {
      id: p.participantId,
      name: `${p.title ? p.title + " " : ""}${p.firstname} ${p.lastname}`,
      total: p.rounds.reduce(
        (sum, r) => sum + r.score,
        0
      ),
      rounds
    }
  })

  return {
    maxRound,
    rows: rows.sort(
      (a, b) => b.total - a.total
    )
  }
}