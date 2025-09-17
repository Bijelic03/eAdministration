CREATE TABLE jobapplications (
    id UUID PRIMARY KEY,
    jobid UUID NOT NULL,
    candidateid UUID NOT NULL,
    CONSTRAINT uniq_job_candidate UNIQUE (jobid, candidateid)
);