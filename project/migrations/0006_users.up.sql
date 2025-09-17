
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

DROP EXTENSION IF EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    indexno VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    ects INT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employerid UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    requiredfaculty TEXT,
    publishedat TIMESTAMP DEFAULT NOW()
);
