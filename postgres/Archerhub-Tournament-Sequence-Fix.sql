SELECT setval(
  pg_get_serial_sequence('tournamentparticipation', 'id'),
  (SELECT MAX(id) FROM tournamentparticipation)
);

SELECT setval(
  pg_get_serial_sequence('tournamentteam', 'id'),
  (SELECT MAX(id) FROM tournamentteam)
);

SELECT setval(
  pg_get_serial_sequence('tournament', 'id'),
  (SELECT MAX(id) FROM tournament)
);

SELECT setval(
  pg_get_serial_sequence('user', 'id'),
  (SELECT MAX(id) FROM "user")
);