CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examtime TIMESTAMP NOT NULL,
    courseid TEXT NOT NULL,
    professorid TEXT NOT NULL
);