INSERT INTO public.singleton (name, ects, courses) VALUES
  ('Informacione Tehnologije', '180', '[]'::jsonb),
  ('Softversko Inženjerstvo', '180', '[]'::jsonb),
  ('Računarske Nauke', '180', '[]'::jsonb);

ALTER TABLE courses
ADD COLUMN singleton_id uuid REFERENCES singleton(id);