--Table to define different archery clubs
create table club(
id serial4 not null primary key,
name varchar(50) unique not null,
tournamentBoardName varchar(50) unique not null,
description varchar(255) null,
website varchar(255) null
);

--Table to define different users/archers
create table "user"(
id serial4 not null primary key,
firstname varchar(50) not null,
lastname varchar(50) not null,
gender varchar(10) not null,
birthday date null,
title varchar(10) null,
active bool not null default true
);

--Table to define a user's club memberships
create table userClub(
userId serial4 not null,
clubId serial4 not null,
constraint pkUserClub primary key (userId,clubId),
constraint userIdUser foreign key (userId) references "user"(id) on delete cascade,
constraint clubIdClub foreign key (clubId) references club(id) on delete cascade
);

--Table to define different targets and distances
create table target(
id serial4 not null primary key,
targetTitle varchar(50) not null
);

create table tournamentGroup(
id serial4 not null primary key,
description varchar(255) not null
);

--Table to define different tournaments
create table tournament(
id serial4 not null primary key,
name varchar(255) not null,
organizedBy serial4 not null,
"from" date not null default current_date,
"until" date null,
tournamentGroup int not null default 0,
place varchar(50) not null,
centersCounted bool not null,
ninesCounted bool not null,
titleByWinning varchar(20) null,
earnMedalInAbsence bool not null default false,
goldcounted bool not null default true,
constraint tournamentorganizer foreign key (organizedBy) references club(id),
constraint tournamentgrouping foreign key (tournamentGroup) references tournamentGroup(id)
);

--Table to define different age brackets for tournaments
create table ageBracket(
id serial4 not null primary key,
name varchar(50) not null,
minimumAge int null,
maximumAge int null,
position int not null default 0
);

create table bowClass(
id serial4 not null primary key,
name varchar(50) not null,
position int not null default 0
);

--Table to define archers performances in tournaments
create table tournamentParticipation (
id serial4 not null primary key,
tournament serial4 not null,
participant serial4 not null,
ageBracket serial4 not null,
bowClass serial4 not null,
club serial4 not null,
rank int null,
totalCenters int null,
totalTens int null,
totalNines int null,
absent bool not null default false,
constraint bracketScoreboardTournament foreign key (tournament) references tournament(id),
constraint bracketScoreboardTournamentBracket foreign key (ageBracket) references ageBracket(id),
constraint bracketScoreboardParticipant foreign key (participant) references "user"(id),
constraint bracketScoreboardBowClass foreign key (bowClass) references bowClass(id),
constraint bracketScoreboardClub foreign key (club) references "club"(id)
);

-- Table to define a tournament starting list
-- create table startingList (
-- id serial4 primary key,
-- tournament int not null,
-- participant int not null,
-- lane int not null check (lane > 0),
-- position char(1) not null check (position in ('A','B','C','D')),
-- session int not null default 1,
-- constraint fkStartingListTournament foreign key (tournament) references tournament(id),
-- constraint fkStartingListParticipant foreign key (participant) references tournamentParticipation(id),
-- constraint uqLanePositionSession unique (tournament, session, lane, position),
-- constraint uqParticipantSession unique (participant, session)
-- );

-- Table to define a tournament round for individual archers
create table participantTournamentRound (
tournament serial4 not null,
round int not null,
target serial4 not null,
distance int not null check (distance >= 0),
score int not null check (score >= 0),
arrowsShot int not null default 0 check (arrowsShot >= 0),
constraint pkParticipantTournamentRound primary key (tournament, round),
constraint fkTournamentParticipantTournamentRound foreign key (tournament) references tournamentParticipation(id),
constraint fkTargetParticipantTournamentRound foreign key (target) references target(id)
);

-- Table to define a tournament team
create table tournamentteam(
id serial4 not null primary key,
tournament serial4 not null,
bowclass serial4 not null,
agebracket serial4 not null,
rank int null,
constraint fkTournamentTeamTournament foreign key (tournament) references tournament(id),
constraint fkTournamentTeamBowClass foreign key (bowclass) references bowclass(id),
constraint fkTournamentTeamAgeBracket foreign key (agebracket) references agebracket(id)
);

-- Table to define tournament team composition
create table tournamentteammember(
teamid serial4 not null,
participantid serial4 not null,
constraint pkTournamentTeamMember primary key (teamid, participantid),
constraint fkTournamentTeamMemberTournamentTeam foreign key (teamid) references tournamentteam(id),
constraint fkTournamentTeamMemberTournamentParticipation foreign key (participantid) references tournamentparticipation(id)
);

-- Table for single training days per user
create table userTrainingDay(
id serial4 not null primary key,
userId int not null,
description text null,
trainingStart timestamp not null default current_timestamp,
trainingEnd timestamp null,
location varchar(40) null,
constraint fkUserUserTraining foreign key (userId) references "user"(id)
);

-- Table to define records while training on a target on a training day
create table userTrainingRecord(
trainingDayId serial4 not null,
targetId int not null,
distance int not null check (distance >= 0),
totalCenters int null check (totalCenters >= 0),
totalTens int null check (totalTens >= 0),
totalNines int null check (totalNines >= 0),
totalEights int null check (totalEights >= 0),
totalSevens int null check (totalSevens >= 0),
totalSixs int null check (totalSixs >= 0),
totalFives int null check (totalFives >= 0),
totalFours int null check (totalFours >= 0),
totalThrees int null check (totalThrees >= 0),
totalTwos int null check (totalTwos >= 0),
totalOnes int null check (totalOnes >= 0),
missed int null check (missed >= 0),
constraint pkUserTrainingRecord primary key (trainingDayId, targetId, distance),
constraint fkTrainingUserTrainingRecord foreign key (trainingDayId) references userTrainingDay(id),
constraint fkTargetUserTrainingRecord foreign key (targetId) references target(id)
);
