CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT UNIQUE COLLATE NOCASE, salt TEXT, hash TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS attempts (name TEXT PRIMARY KEY, n INTEGER, since INTEGER);
CREATE TABLE IF NOT EXISTS leagues (id TEXT PRIMARY KEY, module TEXT, code TEXT UNIQUE, owner TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS memberships (league TEXT, user TEXT, club TEXT, PRIMARY KEY (league, user));

-- Casino online (03-casino): saldo del jugador en el servidor (independiente del silver local del hub) y apuestas
-- deportivas pendientes de resolver contra el resultado real de una liga.
CREATE TABLE IF NOT EXISTS casino_wallet (user TEXT PRIMARY KEY, balance INTEGER, won_total INTEGER DEFAULT 0, big_wins INTEGER DEFAULT 0, updated INTEGER);
CREATE TABLE IF NOT EXISTS casino_sportsbets (
  id TEXT PRIMARY KEY, user TEXT, name TEXT, league TEXT, module TEXT, match TEXT, side TEXT, amount INTEGER, odds REAL,
  status TEXT, payout INTEGER, created INTEGER
);
