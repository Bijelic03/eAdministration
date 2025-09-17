ALTER TABLE jobs
ALTER COLUMN requiredfaculty TYPE BOOLEAN
USING requiredfaculty::BOOLEAN;