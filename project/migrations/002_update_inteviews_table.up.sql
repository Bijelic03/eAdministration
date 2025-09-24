ALTER TABLE interviews
ADD COLUMN accepted BOOLEAN DEFAULT FALSE;

UPDATE interviews
SET accepted = FALSE
WHERE accepted IS NULL;

ALTER TABLE interviews
ALTER COLUMN accepted SET NOT NULL;
