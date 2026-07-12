
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  creator_name text NOT NULL,
  creator_token text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  date_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  day_start_minute integer NOT NULL DEFAULT 540,
  day_end_minute integer NOT NULL DEFAULT 1260,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable by all" ON public.events FOR SELECT USING (true);
CREATE POLICY "events insertable by all" ON public.events FOR INSERT WITH CHECK (true);

CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  availability jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responses TO anon, authenticated;
GRANT ALL ON public.responses TO service_role;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses readable by all" ON public.responses FOR SELECT USING (true);
CREATE POLICY "responses insertable by all" ON public.responses FOR INSERT WITH CHECK (true);
CREATE POLICY "responses updatable by all" ON public.responses FOR UPDATE USING (true);

CREATE INDEX idx_responses_event_id ON public.responses(event_id);
CREATE INDEX idx_events_code ON public.events(code);
