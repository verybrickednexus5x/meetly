ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS duration_options jsonb NOT NULL DEFAULT '[60]'::jsonb,
ADD COLUMN IF NOT EXISTS allow_sleepover boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS location_suggestions jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.events
SET duration_options = jsonb_build_array(duration_minutes)
WHERE duration_options IS NULL OR duration_options = '[]'::jsonb;

ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS preferred_duration integer NULL,
ADD COLUMN IF NOT EXISTS preferred_location text NULL,
ADD COLUMN IF NOT EXISTS can_sleepover boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS leave_by_minute integer NULL;
