CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY,
    jobapplicationid UUID NOT NULL,
    candidateid UUID NOT NULL,
    jobid UUID NOT NULL,
    datetime TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,
    location TEXT
);
