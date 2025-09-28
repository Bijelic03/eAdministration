ALTER TABLE users
ADD COLUMN IF NOT EXISTS singleton_id UUID NULL,
ADD CONSTRAINT fk_users_singleton
    FOREIGN KEY (singleton_id) REFERENCES singleton(id);