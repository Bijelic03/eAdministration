CREATE TABLE IF NOT EXISTS course_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courseid UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    studentid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    createdat TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(courseid, studentid)
);
