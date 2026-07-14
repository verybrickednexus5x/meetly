ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS description text NULL;

ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE public.events
ADD CONSTRAINT events_event_type_check CHECK (event_type IN ('flexible', 'fixed'));
