-- Secret tokens (creator_token, and the new responses.edit_token) currently
-- leak to every reader via a plain `select *`, even though the whole point
-- is that only the browser that generated them should ever know their
-- value. Column-level privileges hide them from SELECT entirely, while
-- still letting them be used as a WHERE-clause match on UPDATE/DELETE --
-- the standard way to gate no-auth, token-based ownership in Postgres.
--
-- The app already keeps its own copy of every token client-side at the
-- moment it generates one (in localStorage), so it never needs the API to
-- read a token back -- it only ever needs to send one as a filter.

ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS edit_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex');

REVOKE SELECT ON public.events FROM anon, authenticated;
GRANT SELECT (
  id, code, title, description, category, event_type, creator_name,
  duration_minutes, duration_options, date_options, day_start_minute,
  day_end_minute, location_suggestions, created_at
) ON public.events TO anon, authenticated;
-- creator_token intentionally excluded above.

REVOKE SELECT ON public.responses FROM anon, authenticated;
GRANT SELECT (
  id, event_id, name, availability, preferred_duration, preferred_location, created_at
) ON public.responses TO anon, authenticated;
-- edit_token intentionally excluded above.

-- Hiding edit_token from SELECT isn't enough on its own: the existing
-- "responses updatable by all" policy (USING (true)) would still let any
-- direct API call update any row, as long as it doesn't bother including an
-- edit_token filter -- RLS can't force a client's query to include one, and
-- this is a public repo, so relying on the app "choosing" to send it isn't
-- real enforcement. Move updates behind a function that checks the token
-- itself, server-side, and remove the direct path entirely.
DROP POLICY IF EXISTS "responses updatable by all" ON public.responses;
REVOKE UPDATE ON public.responses FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_response(
  p_response_id uuid,
  p_edit_token text,
  p_availability jsonb,
  p_preferred_duration integer,
  p_preferred_location text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.responses
  SET availability = p_availability,
      preferred_duration = p_preferred_duration,
      preferred_location = p_preferred_location
  WHERE id = p_response_id AND edit_token = p_edit_token;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.update_response(uuid, text, jsonb, integer, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_response(uuid, text, jsonb, integer, text) TO anon, authenticated;
