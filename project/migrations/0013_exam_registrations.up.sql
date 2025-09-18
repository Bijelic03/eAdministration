CREATE TABLE IF NOT EXISTS exam_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examid UUID NOT NULL,
    studentid UUID NOT NULL,
    createdat TIMESTAMP NOT NULL DEFAULT now()
);
