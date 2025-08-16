--
-- PostgreSQL database dump
--

\restrict FxuBslDmIHgfDMvOK4a0BbDLcOQnVrPKIo0hjGYnRlPkXjGwKcBxQnXGfTzlL0w

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: book_appointment_slot(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_service_id uuid;
  v_slot_at timestamptz;
  v_capacity int;
  v_active boolean;
  v_booked_count int;
  v_appt_id uuid;
  v_ref text;
begin
  -- Caller identity check
  if p_citizen_id is null or p_citizen_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'unknown');
  end if;

  -- Lock slot row for update to ensure atomic capacity checks
  select s.service_id, s.slot_at, s.capacity, s.active
  into v_service_id, v_slot_at, v_capacity, v_active
  from public.service_slots s
  where s.id = p_slot_id
  for update;

  if v_service_id is null then
    return jsonb_build_object('ok', false, 'error', 'slot_inactive');
  end if;

  if v_active is not true then
    return jsonb_build_object('ok', false, 'error', 'slot_inactive');
  end if;

  if v_slot_at < now() then
    return jsonb_build_object('ok', false, 'error', 'slot_in_past');
  end if;

  select count(*)::int
  into v_booked_count
  from public.appointments a
  where a.service_id = v_service_id
    and a.appointment_at = v_slot_at;

  if v_booked_count >= v_capacity then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
  end if;

  insert into public.appointments (
    citizen_id,
    service_id,
    slot_id,
    appointment_at,
    status
  ) values (
    p_citizen_id,
    v_service_id,
    p_slot_id,
    v_slot_at,
    'booked'
  ) returning id, reference_code into v_appt_id, v_ref;

  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'unknown');
end;
$$;


ALTER FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text) OWNER TO postgres;

--
-- Name: book_appointment_slot(uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text DEFAULT NULL::text, p_citizen_gov_id text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_service_id uuid;
  v_slot_at timestamptz;
  v_capacity int;
  v_active boolean;
  v_booked_count int;
  v_appt_id uuid;
  v_ref text;
begin
  if p_citizen_id is null or p_citizen_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'unknown');
  end if;

  select s.service_id, s.slot_at, s.capacity, s.active
  into v_service_id, v_slot_at, v_capacity, v_active
  from public.service_slots s
  where s.id = p_slot_id
  for update;

  if v_service_id is null or v_active is not true or v_slot_at < now() then
    return jsonb_build_object('ok', false, 'error', 'slot_inactive');
  end if;

  select count(*)::int into v_booked_count
  from public.appointments a
  where a.service_id = v_service_id and a.appointment_at = v_slot_at;

  if v_booked_count >= v_capacity then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
  end if;

  insert into public.appointments (
    citizen_id,
    service_id,
    slot_id,
    appointment_at,
    status,
    citizen_gov_id
  ) values (
    p_citizen_id,
    v_service_id,
    p_slot_id,
    v_slot_at,
    'booked',
    p_citizen_gov_id
  ) returning id, reference_code into v_appt_id, v_ref;

  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'unknown');
end;
$$;


ALTER FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text, p_citizen_gov_id text) OWNER TO postgres;

--
-- Name: current_app_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_app_role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'citizen');
$$;


ALTER FUNCTION public.current_app_role() OWNER TO postgres;

--
-- Name: current_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_user_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'citizen'
  );
$$;


ALTER FUNCTION public.current_user_role() OWNER TO postgres;

--
-- Name: generate_gov_id(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_gov_id(p_nic text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
declare
  v text;
begin
  if p_nic is null then
    return null;
  end if;
  v := lower(regexp_replace(p_nic, '[^0-9vx]', '', 'g'));
  if v ~ '^[0-9]{9}[vx]$' then
    return substr(v, 1, 9);
  elsif v ~ '^[0-9]{12}$' then
    return v;
  else
    -- Unknown format; return null for now to allow server-side validation to handle.
    return null;
  end if;
end;
$_$;


ALTER FUNCTION public.generate_gov_id(p_nic text) OWNER TO postgres;

--
-- Name: handle_new_auth_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_auth_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::text,
      (new.raw_app_meta_data->>'role')::text,
      'citizen'
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role;
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_auth_user() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: appointment_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    document_id uuid NOT NULL
);


ALTER TABLE public.appointment_documents OWNER TO postgres;

--
-- Name: appointment_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    media jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT appointment_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.appointment_feedback OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    citizen_id uuid NOT NULL,
    service_id uuid NOT NULL,
    assigned_officer_id uuid,
    appointment_at timestamp with time zone NOT NULL,
    status text DEFAULT 'booked'::text NOT NULL,
    checked_in_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    no_show boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reference_code text GENERATED ALWAYS AS (substr(md5((id)::text), 1, 10)) STORED,
    slot_id uuid,
    citizen_gov_id text,
    confirmed_at timestamp with time zone,
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['booked'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: COLUMN appointments.confirmed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.confirmed_at IS 'Timestamp when the appointment was confirmed by the citizen or system';


--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    location_lat double precision,
    location_lng double precision,
    meta jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    logo_path text,
    description_richtext jsonb DEFAULT '{}'::jsonb NOT NULL,
    description_updated_at timestamp with time zone
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_user_id uuid NOT NULL,
    title text NOT NULL,
    storage_path text NOT NULL,
    mime_type text,
    size_bytes bigint,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_gov_id text
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: identity_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_temp_id uuid NOT NULL,
    nic text NOT NULL,
    nic_front_path text,
    nic_back_path text,
    face_capture_path text,
    status text DEFAULT 'initiated'::text NOT NULL,
    score numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    CONSTRAINT identity_verifications_status_check CHECK ((status = ANY (ARRAY['initiated'::text, 'phone_verified'::text, 'pending'::text, 'approved'::text, 'rejected'::text])))
);


ALTER TABLE public.identity_verifications OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    appointment_id uuid,
    channel text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    sent_at timestamp with time zone,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'inapp'::text]))),
    CONSTRAINT notifications_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'sent'::text, 'failed'::text]))),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['booking_confirmation'::text, 'reminder'::text, 'status_update'::text])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: officer_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.officer_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    department_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.officer_assignments OWNER TO postgres;

--
-- Name: phone_verification_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phone_verification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_temp_id uuid NOT NULL,
    phone text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.phone_verification_events OWNER TO postgres;

--
-- Name: phone_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phone_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_temp_id uuid NOT NULL,
    phone text NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone
);


ALTER TABLE public.phone_verifications OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role text DEFAULT 'citizen'::text NOT NULL,
    full_name text,
    email text,
    nic text,
    verified_status text DEFAULT 'unverified'::text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    gov_id text,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['citizen'::text, 'officer'::text, 'admin'::text])))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: service_branch_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_branch_settings (
    service_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_branch_settings OWNER TO postgres;

--
-- Name: service_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    slot_at timestamp with time zone NOT NULL,
    duration_minutes integer DEFAULT 15 NOT NULL,
    capacity integer DEFAULT 1 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    branch_id uuid NOT NULL,
    CONSTRAINT service_slots_capacity_check CHECK (((capacity >= 1) AND (capacity <= 100))),
    CONSTRAINT service_slots_duration_minutes_check CHECK (((duration_minutes >= 5) AND (duration_minutes <= 240)))
);


ALTER TABLE public.service_slots OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    instructions_richtext jsonb DEFAULT '{}'::jsonb NOT NULL,
    instructions_pdf_path text,
    instructions_updated_at timestamp with time zone
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_08_15; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_15 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_16; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_16 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_17 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_18; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_18 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_19; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_19 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: messages_2025_08_15; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_15 FOR VALUES FROM ('2025-08-15 00:00:00') TO ('2025-08-16 00:00:00');


--
-- Name: messages_2025_08_16; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_16 FOR VALUES FROM ('2025-08-16 00:00:00') TO ('2025-08-17 00:00:00');


--
-- Name: messages_2025_08_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_17 FOR VALUES FROM ('2025-08-17 00:00:00') TO ('2025-08-18 00:00:00');


--
-- Name: messages_2025_08_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_18 FOR VALUES FROM ('2025-08-18 00:00:00') TO ('2025-08-19 00:00:00');


--
-- Name: messages_2025_08_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_19 FOR VALUES FROM ('2025-08-19 00:00:00') TO ('2025-08-20 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
59f8425c-6196-4e7f-9db3-9c159edf3a35	postgres_cdc_rls	{"region": "us-east-1", "db_host": "+5JkR7EPoJsAtjz+cdk/ZGMDh4Ck8PWqtZx+VnDSocE=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-08-16 15:54:57	2025-08-16 15:54:57
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-08-16 15:54:48
20220329161857	2025-08-16 15:54:48
20220410212326	2025-08-16 15:54:48
20220506102948	2025-08-16 15:54:48
20220527210857	2025-08-16 15:54:48
20220815211129	2025-08-16 15:54:48
20220815215024	2025-08-16 15:54:48
20220818141501	2025-08-16 15:54:48
20221018173709	2025-08-16 15:54:48
20221102172703	2025-08-16 15:54:48
20221223010058	2025-08-16 15:54:48
20230110180046	2025-08-16 15:54:48
20230810220907	2025-08-16 15:54:48
20230810220924	2025-08-16 15:54:48
20231024094642	2025-08-16 15:54:48
20240306114423	2025-08-16 15:54:48
20240418082835	2025-08-16 15:54:48
20240625211759	2025-08-16 15:54:48
20240704172020	2025-08-16 15:54:48
20240902173232	2025-08-16 15:54:48
20241106103258	2025-08-16 15:54:48
20250424203323	2025-08-16 15:54:48
20250613072131	2025-08-16 15:54:48
20250711044927	2025-08-16 15:54:48
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter) FROM stdin;
417bef1a-9b50-4a78-aadd-baf606cf5dca	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-08-16 15:54:57	2025-08-16 15:54:57	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	63	gen_rpc
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	8eda7a79-0df6-42ae-a0b9-23a47001d3e5	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@civigo.local","user_id":"fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3","user_phone":""}}	2025-08-16 15:57:47.379011+00	
00000000-0000-0000-0000-000000000000	36442abc-d21e-4a3d-bf71-c6ec08aea54a	{"action":"login","actor_id":"fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3","actor_username":"test@civigo.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-16 15:58:15.919322+00	
00000000-0000-0000-0000-000000000000	2f380fbd-ebb5-4c02-8a02-c9d872f22e95	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"officer@civigo.com","user_id":"666717ca-6adf-4d77-a4c8-22e05e18ed45","user_phone":""}}	2025-08-16 15:59:01.472568+00	
00000000-0000-0000-0000-000000000000	16d504c6-ada4-4f4d-b07a-d8f8202549a8	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"officer@civigo.com","user_id":"666717ca-6adf-4d77-a4c8-22e05e18ed45","user_phone":""}}	2025-08-16 15:59:01.483118+00	
00000000-0000-0000-0000-000000000000	1c20b008-bddb-44db-b9f5-b7bea06d037a	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"officer@civigo.com","user_id":"666717ca-6adf-4d77-a4c8-22e05e18ed45","user_phone":""}}	2025-08-16 15:59:01.559025+00	
00000000-0000-0000-0000-000000000000	eded78ee-038f-4f97-867d-858735a07ad1	{"action":"logout","actor_id":"fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3","actor_username":"test@civigo.local","actor_via_sso":false,"log_type":"account"}	2025-08-16 15:59:21.218339+00	
00000000-0000-0000-0000-000000000000	0526bbad-100e-4025-8ffe-6ada857f86f1	{"action":"login","actor_id":"fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3","actor_username":"test@civigo.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-16 16:00:25.425499+00	
00000000-0000-0000-0000-000000000000	67434394-5f26-4bf0-ae0f-11c487a04cdd	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"officer@civigo.com","user_id":"666717ca-6adf-4d77-a4c8-22e05e18ed45","user_phone":""}}	2025-08-16 16:00:35.212504+00	
00000000-0000-0000-0000-000000000000	1dbb6a6c-ece8-4b5e-875b-462ed2fc31c4	{"action":"logout","actor_id":"fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3","actor_username":"test@civigo.local","actor_via_sso":false,"log_type":"account"}	2025-08-16 16:00:38.585244+00	
00000000-0000-0000-0000-000000000000	da8ef62c-8a05-4d4b-b0e0-08f18c8a829b	{"action":"login","actor_id":"666717ca-6adf-4d77-a4c8-22e05e18ed45","actor_name":"test officer","actor_username":"officer@civigo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-16 16:00:47.397162+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3	fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3	{"sub": "fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3", "email": "test@civigo.local", "email_verified": false, "phone_verified": false}	email	2025-08-16 15:57:47.377793+00	2025-08-16 15:57:47.377828+00	2025-08-16 15:57:47.377828+00	ee35950e-e70a-4919-a78c-c5d6dd1cb22d
666717ca-6adf-4d77-a4c8-22e05e18ed45	666717ca-6adf-4d77-a4c8-22e05e18ed45	{"sub": "666717ca-6adf-4d77-a4c8-22e05e18ed45", "email": "officer@civigo.com", "email_verified": false, "phone_verified": false}	email	2025-08-16 15:59:01.471666+00	2025-08-16 15:59:01.471689+00	2025-08-16 15:59:01.471689+00	dc6f870a-0154-4914-b81f-fb4ba3c312f5
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
1980decf-a15d-49fc-bd94-62be2ad3d532	2025-08-16 16:00:47.400677+00	2025-08-16 16:00:47.400677+00	password	7f68197f-f942-4ab1-94e0-43e407866ccf
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	3	z4hfgxuhuaot	666717ca-6adf-4d77-a4c8-22e05e18ed45	f	2025-08-16 16:00:47.399485+00	2025-08-16 16:00:47.399485+00	\N	1980decf-a15d-49fc-bd94-62be2ad3d532
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
1980decf-a15d-49fc-bd94-62be2ad3d532	666717ca-6adf-4d77-a4c8-22e05e18ed45	2025-08-16 16:00:47.398431+00	2025-08-16 16:00:47.398431+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	192.168.65.1	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\N	a2272e1c-735e-4a88-a64a-80726d3dae3a	authenticated	\N	admin@civigo.local	$2a$06$4QfdS4QALeeLAf9GUaWAF.MsRiZML.zJKXFZAaLYvECT2CEIw2NyS	2025-08-16 15:54:53.717408+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "admin"}	\N	\N	\N	\N	\N			\N		0	\N		\N	f	\N	f
\N	3439dcad-5243-4506-88cb-a0d8a4b7430d	authenticated	\N	officer@civigo.local	$2a$06$e9AzQYfQqM2MH1STNX5va.DY3C9XMUlEQkb9Jt4dCBC.vdnJe2zae	2025-08-16 15:54:53.717408+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "officer"}	\N	\N	\N	\N	\N			\N		0	\N		\N	f	\N	f
\N	a222f00a-5890-49b6-afd7-9a94c6febd81	authenticated	\N	citizen@civigo.local	$2a$06$p4/UBspMKJzuUyaFXjFBleb13TAGgUhJgrngJ8JIR.uQQ9r90FI8K	2025-08-16 15:54:53.717408+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "citizen"}	\N	\N	\N	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3	authenticated	authenticated	test@civigo.local	$2a$10$0tLa/ZtaVCzULWNvfffel.b0g/U271IkwfbdqAoNb0ys03l0WkONq	2025-08-16 15:57:47.380951+00	\N		\N		\N			\N	2025-08-16 16:00:25.42662+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-16 15:57:47.367255+00	2025-08-16 16:00:25.430146+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	666717ca-6adf-4d77-a4c8-22e05e18ed45	authenticated	authenticated	officer@civigo.com	$2a$10$amxgBTZCjEUdjGI8WzI9bewREG6h9rkwxVEup/3tsTx02E1F1pq8e	2025-08-16 15:59:01.473518+00	\N		\N		\N			\N	2025-08-16 16:00:47.398323+00	{"role": "officer", "provider": "email", "providers": ["email"]}	{"role": "officer", "full_name": "test officer", "email_verified": true}	\N	2025-08-16 15:59:01.469419+00	2025-08-16 16:00:47.400428+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: appointment_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_documents (id, appointment_id, document_id) FROM stdin;
\.


--
-- Data for Name: appointment_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_feedback (id, appointment_id, rating, comment, media, created_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, citizen_id, service_id, assigned_officer_id, appointment_at, status, checked_in_at, started_at, completed_at, cancelled_at, no_show, created_at, slot_id, citizen_gov_id, confirmed_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, department_id, code, name, address, location_lat, location_lng, meta, created_at) FROM stdin;
6f16d3e4-3370-4bdf-879e-e928ccc5e81f	b40e55b7-c486-400f-9a5d-d7d76e3bd13c	KND	Regional Office - Kandy	Kandy	\N	\N	\N	2025-08-16 15:54:53.717408+00
768aaec3-562b-44cd-9221-a693b05da61e	b40e55b7-c486-400f-9a5d-d7d76e3bd13c	COL	Head Office - Colombo	Suhurupaya, Battaramulla	\N	\N	\N	2025-08-16 15:54:53.717408+00
7fb572b6-c83f-4560-afc0-1c979c03bf7c	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	GAM	District Office - Gampaha	Gampaha	\N	\N	\N	2025-08-16 15:54:53.717408+00
e322fbd1-2b1c-4b56-b330-38cae589548d	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	WEH	Head Office - Werahera	Werahera	\N	\N	\N	2025-08-16 15:54:53.717408+00
7a31265e-b67b-4de0-8ee8-6541df04c1dd	ab85162f-9fd0-41f0-928d-3be1a0b3a20a	KUR	Regional Office - Kurunegala	Kurunegala	\N	\N	\N	2025-08-16 15:54:53.717408+00
462f5fa9-13e5-45dc-94df-e59f6487d8f6	ab85162f-9fd0-41f0-928d-3be1a0b3a20a	BAT	Head Office - Battaramulla	Suhurupaya, Battaramulla	\N	\N	\N	2025-08-16 15:54:53.717408+00
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, code, name, logo_path, description_richtext, description_updated_at) FROM stdin;
b40e55b7-c486-400f-9a5d-d7d76e3bd13c	IMMIG	Department of Immigration & Emigration	\N	{}	\N
3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	DMT	Department of Motor Traffic	\N	{}	\N
ab85162f-9fd0-41f0-928d-3be1a0b3a20a	DRP	Department for Registration of Persons	\N	{}	\N
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, owner_user_id, title, storage_path, mime_type, size_bytes, expires_at, created_at, owner_gov_id) FROM stdin;
\.


--
-- Data for Name: identity_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_verifications (id, user_temp_id, nic, nic_front_path, nic_back_path, face_capture_path, status, score, created_at, reviewed_by, reviewed_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, appointment_id, channel, type, status, sent_at, payload, created_at) FROM stdin;
\.


--
-- Data for Name: officer_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.officer_assignments (id, officer_id, department_id, active, created_at) FROM stdin;
82a1cb1a-3b0e-4b71-92b4-807831e6f9ce	3439dcad-5243-4506-88cb-a0d8a4b7430d	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	t	2025-08-16 15:54:53.717408+00
ae827e78-7dd8-4d70-aa11-b07711846f11	666717ca-6adf-4d77-a4c8-22e05e18ed45	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	t	2025-08-16 15:59:10.102034+00
a1b84633-8833-45a5-bbd9-2d61161670fe	666717ca-6adf-4d77-a4c8-22e05e18ed45	b40e55b7-c486-400f-9a5d-d7d76e3bd13c	t	2025-08-16 15:59:13.368707+00
827681e3-862f-4f46-a546-cfc0aa1addc5	666717ca-6adf-4d77-a4c8-22e05e18ed45	ab85162f-9fd0-41f0-928d-3be1a0b3a20a	t	2025-08-16 15:59:16.713846+00
\.


--
-- Data for Name: phone_verification_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_verification_events (id, user_temp_id, phone, created_at) FROM stdin;
\.


--
-- Data for Name: phone_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_verifications (id, user_temp_id, phone, otp_hash, expires_at, verified_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, role, full_name, email, nic, verified_status, phone, created_at, gov_id) FROM stdin;
a2272e1c-735e-4a88-a64a-80726d3dae3a	admin	\N	admin@civigo.local	\N	unverified	\N	2025-08-16 15:54:53.717408+00	\N
3439dcad-5243-4506-88cb-a0d8a4b7430d	officer	\N	officer@civigo.local	\N	unverified	\N	2025-08-16 15:54:53.717408+00	\N
a222f00a-5890-49b6-afd7-9a94c6febd81	citizen	Test Citizen	citizen@civigo.local	912345678V	unverified	\N	2025-08-16 15:54:53.717408+00	\N
fcc86e9a-bfa1-4b14-8ae8-ec6e3355cdb3	admin	\N	test@civigo.local	\N	unverified	\N	2025-08-16 15:57:47.366596+00	\N
666717ca-6adf-4d77-a4c8-22e05e18ed45	officer	\N	officer@civigo.com	\N	unverified	\N	2025-08-16 15:59:01.46901+00	\N
\.


--
-- Data for Name: service_branch_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_branch_settings (service_id, branch_id, enabled, created_at) FROM stdin;
ad09cce6-0de9-4a9b-ad69-68ea99d804e3	768aaec3-562b-44cd-9221-a693b05da61e	t	2025-08-16 15:54:53.717408+00
ad09cce6-0de9-4a9b-ad69-68ea99d804e3	6f16d3e4-3370-4bdf-879e-e928ccc5e81f	t	2025-08-16 15:54:53.717408+00
af094979-b0ca-43bf-b8b2-266300273ebb	768aaec3-562b-44cd-9221-a693b05da61e	t	2025-08-16 15:54:53.717408+00
af094979-b0ca-43bf-b8b2-266300273ebb	6f16d3e4-3370-4bdf-879e-e928ccc5e81f	t	2025-08-16 15:54:53.717408+00
d0ad60fc-883d-40bc-853a-0bedec23fd6a	e322fbd1-2b1c-4b56-b330-38cae589548d	t	2025-08-16 15:54:53.717408+00
d0ad60fc-883d-40bc-853a-0bedec23fd6a	7fb572b6-c83f-4560-afc0-1c979c03bf7c	t	2025-08-16 15:54:53.717408+00
78040c21-0b73-42d9-91dc-f2da1920feac	e322fbd1-2b1c-4b56-b330-38cae589548d	t	2025-08-16 15:54:53.717408+00
78040c21-0b73-42d9-91dc-f2da1920feac	7fb572b6-c83f-4560-afc0-1c979c03bf7c	t	2025-08-16 15:54:53.717408+00
fb4adc25-948f-4461-924d-a6604aa060e0	462f5fa9-13e5-45dc-94df-e59f6487d8f6	t	2025-08-16 15:54:53.717408+00
fb4adc25-948f-4461-924d-a6604aa060e0	7a31265e-b67b-4de0-8ee8-6541df04c1dd	t	2025-08-16 15:54:53.717408+00
a55699df-87f1-4f0e-88bf-15b4ccdac8c1	462f5fa9-13e5-45dc-94df-e59f6487d8f6	t	2025-08-16 15:54:53.717408+00
a55699df-87f1-4f0e-88bf-15b4ccdac8c1	7a31265e-b67b-4de0-8ee8-6541df04c1dd	t	2025-08-16 15:54:53.717408+00
\.


--
-- Data for Name: service_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_slots (id, service_id, slot_at, duration_minutes, capacity, active, created_by, created_at, branch_id) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, department_id, code, name, instructions_richtext, instructions_pdf_path, instructions_updated_at) FROM stdin;
ad09cce6-0de9-4a9b-ad69-68ea99d804e3	b40e55b7-c486-400f-9a5d-d7d76e3bd13c	PASSPORT_RENEW	Passport Renewal	{}	\N	\N
af094979-b0ca-43bf-b8b2-266300273ebb	b40e55b7-c486-400f-9a5d-d7d76e3bd13c	PASSPORT_NEW	New Passport Application	{}	\N	\N
d0ad60fc-883d-40bc-853a-0bedec23fd6a	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	DL_RENEW	Driving License Renewal	{}	\N	\N
78040c21-0b73-42d9-91dc-f2da1920feac	3c94a28b-ff2c-4eb0-abda-5fd3d2d610b9	DL_NEW	New Driving License	{}	\N	\N
fb4adc25-948f-4461-924d-a6604aa060e0	ab85162f-9fd0-41f0-928d-3be1a0b3a20a	NIC_DUP	Duplicate NIC	{}	\N	\N
a55699df-87f1-4f0e-88bf-15b4ccdac8c1	ab85162f-9fd0-41f0-928d-3be1a0b3a20a	NIC_NEW	New NIC Application	{}	\N	\N
\.


--
-- Data for Name: messages_2025_08_15; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_15 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_16; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_16 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_17; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_18; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_18 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_08_19; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_08_19 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-16 15:54:49
20211116045059	2025-08-16 15:54:49
20211116050929	2025-08-16 15:54:49
20211116051442	2025-08-16 15:54:49
20211116212300	2025-08-16 15:54:50
20211116213355	2025-08-16 15:54:50
20211116213934	2025-08-16 15:54:50
20211116214523	2025-08-16 15:54:50
20211122062447	2025-08-16 15:54:50
20211124070109	2025-08-16 15:54:50
20211202204204	2025-08-16 15:54:50
20211202204605	2025-08-16 15:54:50
20211210212804	2025-08-16 15:54:50
20211228014915	2025-08-16 15:54:50
20220107221237	2025-08-16 15:54:50
20220228202821	2025-08-16 15:54:50
20220312004840	2025-08-16 15:54:50
20220603231003	2025-08-16 15:54:50
20220603232444	2025-08-16 15:54:50
20220615214548	2025-08-16 15:54:50
20220712093339	2025-08-16 15:54:50
20220908172859	2025-08-16 15:54:50
20220916233421	2025-08-16 15:54:50
20230119133233	2025-08-16 15:54:50
20230128025114	2025-08-16 15:54:50
20230128025212	2025-08-16 15:54:50
20230227211149	2025-08-16 15:54:50
20230228184745	2025-08-16 15:54:50
20230308225145	2025-08-16 15:54:50
20230328144023	2025-08-16 15:54:50
20231018144023	2025-08-16 15:54:50
20231204144023	2025-08-16 15:54:50
20231204144024	2025-08-16 15:54:50
20231204144025	2025-08-16 15:54:50
20240108234812	2025-08-16 15:54:50
20240109165339	2025-08-16 15:54:50
20240227174441	2025-08-16 15:54:50
20240311171622	2025-08-16 15:54:50
20240321100241	2025-08-16 15:54:50
20240401105812	2025-08-16 15:54:50
20240418121054	2025-08-16 15:54:50
20240523004032	2025-08-16 15:54:50
20240618124746	2025-08-16 15:54:50
20240801235015	2025-08-16 15:54:50
20240805133720	2025-08-16 15:54:50
20240827160934	2025-08-16 15:54:50
20240919163303	2025-08-16 15:54:50
20240919163305	2025-08-16 15:54:50
20241019105805	2025-08-16 15:54:50
20241030150047	2025-08-16 15:54:50
20241108114728	2025-08-16 15:54:50
20241121104152	2025-08-16 15:54:50
20241130184212	2025-08-16 15:54:50
20241220035512	2025-08-16 15:54:50
20241220123912	2025-08-16 15:54:50
20241224161212	2025-08-16 15:54:50
20250107150512	2025-08-16 15:54:50
20250110162412	2025-08-16 15:54:50
20250123174212	2025-08-16 15:54:50
20250128220012	2025-08-16 15:54:50
20250506224012	2025-08-16 15:54:50
20250523164012	2025-08-16 15:54:50
20250714121412	2025-08-16 15:54:50
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
nic-media	nic-media	\N	2025-08-16 15:54:53.318307+00	2025-08-16 15:54:53.318307+00	f	f	\N	\N	\N	STANDARD
feedback	feedback	\N	2025-08-16 15:54:53.318307+00	2025-08-16 15:54:53.318307+00	f	f	\N	\N	\N	STANDARD
departments	departments	\N	2025-08-16 15:54:53.318307+00	2025-08-16 15:54:53.318307+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_namespaces (id, bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_tables (id, namespace_id, bucket_id, name, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-16 15:54:52.440018
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-16 15:54:52.442611
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-16 15:54:52.443556
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-16 15:54:52.450259
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-16 15:54:52.457521
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-16 15:54:52.458691
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-16 15:54:52.460562
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-16 15:54:52.462461
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-16 15:54:52.463561
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-16 15:54:52.464969
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-16 15:54:52.468064
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-16 15:54:52.470624
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-16 15:54:52.473516
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-16 15:54:52.474938
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-16 15:54:52.476149
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-16 15:54:52.484969
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-16 15:54:52.48734
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-16 15:54:52.488324
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-16 15:54:52.489484
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-16 15:54:52.491573
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-16 15:54:52.492504
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-16 15:54:52.494212
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-16 15:54:52.49857
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-16 15:54:52.501819
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-16 15:54:52.503374
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-16 15:54:52.50461
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-16 15:54:52.505619
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-16 15:54:52.510926
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-16 15:54:52.542028
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-16 15:54:52.543813
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-16 15:54:52.544861
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-16 15:54:52.546181
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-16 15:54:52.547463
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-16 15:54:52.548492
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-16 15:54:52.548718
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-16 15:54:52.550749
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-16 15:54:52.551648
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-16 15:54:52.554427
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-16 15:54:52.555651
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-08-16 15:54:38.762643+00
20210809183423_update_grants	2025-08-16 15:54:38.762643+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250812183328	{BEGIN,"-- Required for gen_random_uuid() and digest(..., 'sha256')\ncreate extension if not exists pgcrypto","-- profiles\ncreate table if not exists public.profiles (\n  id uuid primary key references auth.users(id) on delete cascade,\n  role text not null default 'citizen' check (role in ('citizen','officer','admin')),\n  full_name text,\n  email text unique,\n  nic text unique,\n  verified_status text default 'unverified',\n  phone text,\n  created_at timestamptz not null default now()\n)","-- departments\ncreate table if not exists public.departments (\n  id uuid primary key default gen_random_uuid(),\n  code text not null unique,\n  name text not null\n)","-- services\ncreate table if not exists public.services (\n  id uuid primary key default gen_random_uuid(),\n  department_id uuid not null references public.departments(id) on delete cascade,\n  code text not null unique,\n  name text not null\n)","-- officer_assignments\ncreate table if not exists public.officer_assignments (\n  id uuid primary key default gen_random_uuid(),\n  officer_id uuid not null references public.profiles(id) on delete cascade,\n  department_id uuid not null references public.departments(id) on delete cascade,\n  active boolean not null default true,\n  created_at timestamptz not null default now(),\n  unique (officer_id, department_id)\n)","-- appointments\ncreate table if not exists public.appointments (\n  id uuid primary key default gen_random_uuid(),\n  citizen_id uuid not null references public.profiles(id) on delete cascade,\n  service_id uuid not null references public.services(id) on delete restrict,\n  assigned_officer_id uuid references public.profiles(id) on delete set null,\n  appointment_at timestamptz not null,\n  status text not null default 'booked' check (status in ('booked','cancelled','completed')),\n  checked_in_at timestamptz,\n  started_at timestamptz,\n  completed_at timestamptz,\n  cancelled_at timestamptz,\n  no_show boolean not null default false,\n  created_at timestamptz not null default now(),\n  reference_code text generated always as (\n    substr(md5((id)::text), 1, 10)\n  ) stored,\n  unique (reference_code)\n)","-- appointment_feedback\ncreate table if not exists public.appointment_feedback (\n  id uuid primary key default gen_random_uuid(),\n  appointment_id uuid not null unique references public.appointments(id) on delete cascade,\n  rating integer not null check (rating between 1 and 5),\n  comment text,\n  media jsonb,\n  created_at timestamptz not null default now()\n)","-- notifications\ncreate table if not exists public.notifications (\n  id uuid primary key default gen_random_uuid(),\n  user_id uuid not null references public.profiles(id) on delete cascade,\n  appointment_id uuid references public.appointments(id) on delete set null,\n  channel text not null check (channel in ('email','sms','inapp')),\n  type text not null check (type in ('booking_confirmation','reminder','status_update')),\n  status text not null default 'queued' check (status in ('queued','sent','failed')),\n  sent_at timestamptz,\n  payload jsonb,\n  created_at timestamptz not null default now()\n)","-- documents\ncreate table if not exists public.documents (\n  id uuid primary key default gen_random_uuid(),\n  owner_user_id uuid not null references public.profiles(id) on delete cascade,\n  title text not null,\n  storage_path text not null unique,\n  mime_type text,\n  size_bytes bigint,\n  expires_at timestamptz,\n  created_at timestamptz not null default now()\n)","-- appointment_documents\ncreate table if not exists public.appointment_documents (\n  id uuid primary key default gen_random_uuid(),\n  appointment_id uuid not null references public.appointments(id) on delete cascade,\n  document_id uuid not null references public.documents(id) on delete cascade,\n  unique (appointment_id, document_id)\n)","-- Storage buckets\ninsert into storage.buckets (id, name, public)\nvalues \n  ('nic-media', 'nic-media', false),\n  ('departments', 'departments', false),\n  ('feedback', 'feedback', false)\non conflict (id) do nothing",COMMIT}	001_schema_core
20250812183329	{BEGIN,"-- profiles\ncreate unique index if not exists idx_profiles_email_unique on public.profiles (email)","create unique index if not exists idx_profiles_nic_unique on public.profiles (nic)","-- services\ncreate index if not exists idx_services_department_id on public.services (department_id)","-- officer_assignments\ncreate index if not exists idx_officer_assignments_officer_id on public.officer_assignments (officer_id)","create index if not exists idx_officer_assignments_department_id on public.officer_assignments (department_id)","-- appointments\ncreate index if not exists idx_appointments_citizen_id on public.appointments (citizen_id)","create index if not exists idx_appointments_service_id on public.appointments (service_id)","create index if not exists idx_appointments_assigned_officer_id on public.appointments (assigned_officer_id)","create index if not exists idx_appointments_appointment_at on public.appointments (appointment_at)","create index if not exists idx_appointments_service_id_appointment_at on public.appointments (service_id, appointment_at)","create index if not exists idx_appointments_status on public.appointments (status)","-- notifications\ncreate index if not exists idx_notifications_user_id_created_at on public.notifications (user_id, created_at desc)","create index if not exists idx_notifications_appointment_id on public.notifications (appointment_id)","create index if not exists idx_notifications_status_partial on public.notifications (status) where status <> 'sent'","-- documents\ncreate index if not exists idx_documents_owner_user_id on public.documents (owner_user_id)","-- appointment_documents\ncreate index if not exists idx_appointment_documents_appointment_id on public.appointment_documents (appointment_id)","create index if not exists idx_appointment_documents_document_id on public.appointment_documents (document_id)",COMMIT}	002_indexes
20250812183330	{BEGIN,"-- Enable RLS\nalter table if exists public.profiles enable row level security","alter table if exists public.officer_assignments enable row level security","alter table if exists public.appointments enable row level security","alter table if exists public.appointment_feedback enable row level security","alter table if exists public.notifications enable row level security","alter table if exists public.documents enable row level security","alter table if exists public.appointment_documents enable row level security","-- Departments and services are readable by all; keep RLS disabled for them\n-- (no edits here)\n\n-- Grants: allow anon/authenticated to read open catalogs; allow authenticated to operate on protected tables (RLS gates rows)\ngrant usage on schema public to anon, authenticated","grant select on public.departments to anon, authenticated","grant select on public.services to anon, authenticated","grant select, insert, update, delete on public.profiles to authenticated","grant select, insert, update, delete on public.officer_assignments to authenticated","grant select, insert, update, delete on public.appointments to authenticated","grant select, insert, update, delete on public.appointment_feedback to authenticated","grant select, insert, update, delete on public.notifications to authenticated","grant select, insert, update, delete on public.documents to authenticated","grant select, insert, update, delete on public.appointment_documents to authenticated","-- Helper: function to extract role claim from JWT (text)\ncreate or replace function public.current_app_role()\nreturns text language sql stable as $$\n  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'citizen');\n$$","-- profiles policies\ndrop policy if exists profiles_self_select on public.profiles","create policy profiles_self_select on public.profiles\nfor select using (auth.uid() = id or public.current_app_role() = 'admin')","drop policy if exists profiles_admin_select on public.profiles","create policy profiles_admin_select on public.profiles\nfor select using (public.current_app_role() = 'admin')","drop policy if exists profiles_admin_update on public.profiles","create policy profiles_admin_update on public.profiles\nfor update using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","-- officer_assignments policies\ndrop policy if exists officer_assignments_self_select on public.officer_assignments","create policy officer_assignments_self_select on public.officer_assignments\nfor select using (\n  officer_id = auth.uid() or public.current_app_role() = 'admin'\n)","drop policy if exists officer_assignments_admin_all on public.officer_assignments","create policy officer_assignments_admin_all on public.officer_assignments\nfor all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","-- appointments policies\ndrop policy if exists appointments_citizen_select on public.appointments","create policy appointments_citizen_select on public.appointments\nfor select using (citizen_id = auth.uid())","drop policy if exists appointments_citizen_insert on public.appointments","create policy appointments_citizen_insert on public.appointments\nfor insert with check (citizen_id = auth.uid())","drop policy if exists appointments_citizen_update on public.appointments","create policy appointments_citizen_update on public.appointments\nfor update using (citizen_id = auth.uid()) with check (citizen_id = auth.uid())","drop policy if exists appointments_officer_read on public.appointments","create policy appointments_officer_read on public.appointments\nfor select using (\n  exists (\n    select 1 from public.services s\n    join public.departments d on d.id = s.department_id\n    join public.officer_assignments oa on oa.department_id = d.id\n    where s.id = public.appointments.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  ) or public.current_app_role() = 'admin'\n)","drop policy if exists appointments_officer_update on public.appointments","create policy appointments_officer_update on public.appointments\nfor update using (\n  exists (\n    select 1 from public.services s\n    join public.departments d on d.id = s.department_id\n    join public.officer_assignments oa on oa.department_id = d.id\n    where s.id = public.appointments.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  ) or public.current_app_role() = 'admin'\n) with check (\n  exists (\n    select 1 from public.services s\n    join public.departments d on d.id = s.department_id\n    join public.officer_assignments oa on oa.department_id = d.id\n    where s.id = public.appointments.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  ) or public.current_app_role() = 'admin'\n)","drop policy if exists appointments_admin_all on public.appointments","create policy appointments_admin_all on public.appointments\nfor all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","-- appointment_feedback policies\ndrop policy if exists feedback_citizen_rw on public.appointment_feedback","create policy feedback_citizen_rw on public.appointment_feedback\nfor all using (\n  exists (\n    select 1 from public.appointments a\n    where a.id = appointment_id and a.citizen_id = auth.uid()\n  )\n) with check (\n  exists (\n    select 1 from public.appointments a\n    where a.id = appointment_id and a.citizen_id = auth.uid()\n  )\n)","drop policy if exists feedback_officer_read on public.appointment_feedback","create policy feedback_officer_read on public.appointment_feedback\nfor select using (\n  exists (\n    select 1 from public.appointments ap\n    join public.services s on s.id = ap.service_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true\n    where ap.id = appointment_id\n  ) or public.current_app_role() = 'admin'\n)","-- notifications policies\ndrop policy if exists notifications_user_select on public.notifications","create policy notifications_user_select on public.notifications\nfor select using (user_id = auth.uid() or public.current_app_role() = 'admin')","drop policy if exists notifications_admin_select on public.notifications","create policy notifications_admin_select on public.notifications\nfor select using (public.current_app_role() = 'admin')","-- documents policies\ndrop policy if exists documents_owner_select on public.documents","create policy documents_owner_select on public.documents\nfor select using (owner_user_id = auth.uid())","drop policy if exists documents_owner_insert on public.documents","create policy documents_owner_insert on public.documents\nfor insert with check (owner_user_id = auth.uid())","drop policy if exists documents_owner_update on public.documents","create policy documents_owner_update on public.documents\nfor update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid())","drop policy if exists documents_admin_all on public.documents","create policy documents_admin_all on public.documents\nfor all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","drop policy if exists documents_officer_read_scope on public.documents","create policy documents_officer_read_scope on public.documents\nfor select using (\n  exists (\n    select 1 from public.appointment_documents ad\n    join public.appointments ap on ap.id = ad.appointment_id\n    join public.services s on s.id = ap.service_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true\n    where ad.document_id = public.documents.id\n  ) or public.current_app_role() = 'admin'\n)","-- appointment_documents policies\ndrop policy if exists appt_docs_owner_select on public.appointment_documents","create policy appt_docs_owner_select on public.appointment_documents\nfor select using (\n  exists (\n    select 1 from public.appointments a\n    where a.id = appointment_id and a.citizen_id = auth.uid()\n  )\n)","drop policy if exists appt_docs_owner_insert on public.appointment_documents","create policy appt_docs_owner_insert on public.appointment_documents\nfor insert with check (\n  exists (\n    select 1 from public.appointments a\n    where a.id = appointment_id and a.citizen_id = auth.uid()\n  )\n)","drop policy if exists appt_docs_owner_delete on public.appointment_documents","create policy appt_docs_owner_delete on public.appointment_documents\nfor delete using (\n  exists (\n    select 1 from public.appointments a\n    where a.id = appointment_id and a.citizen_id = auth.uid()\n  )\n)","drop policy if exists appt_docs_officer_read on public.appointment_documents","create policy appt_docs_officer_read on public.appointment_documents\nfor select using (\n  exists (\n    select 1 from public.appointments ap\n    join public.services s on s.id = ap.service_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active = true\n    where ap.id = appointment_id\n  ) or public.current_app_role() = 'admin'\n)",COMMIT}	003_rls_policies
20250813190000	{BEGIN,"-- Enable RLS on services\nalter table if exists public.services enable row level security","-- Admin full access policy (uses existing current_app_role())\ndrop policy if exists services_admin_all on public.services","create policy services_admin_all on public.services\nfor all\nusing (public.current_app_role() = 'admin')\nwith check (public.current_app_role() = 'admin')","-- Officer read policy: officer can read services within departments they are actively assigned to\ndrop policy if exists services_officer_read on public.services","create policy services_officer_read on public.services\nfor select\nusing (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.services.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer insert policy: can create services only in assigned departments\ndrop policy if exists services_officer_insert on public.services","create policy services_officer_insert on public.services\nfor insert\nwith check (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.services.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer update policy: can update services only in assigned departments\ndrop policy if exists services_officer_update on public.services","create policy services_officer_update on public.services\nfor update\nusing (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.services.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)\nwith check (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.services.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer delete policy: can delete services only in assigned departments\ndrop policy if exists services_officer_delete on public.services","create policy services_officer_delete on public.services\nfor delete\nusing (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.services.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)",COMMIT}	005_rls_services
20250813194500	{BEGIN,"-- service_slots table\ncreate table if not exists public.service_slots (\n  id uuid primary key default gen_random_uuid(),\n  service_id uuid not null references public.services(id) on delete cascade,\n  slot_at timestamptz not null,\n  duration_minutes int not null default 15 check (duration_minutes between 5 and 240),\n  capacity int not null default 1 check (capacity between 1 and 100),\n  active boolean not null default true,\n  created_by uuid not null references public.profiles(id) on delete restrict,\n  created_at timestamptz not null default now(),\n  unique (service_id, slot_at)\n)","-- indexes\ncreate index if not exists idx_service_slots_service_id on public.service_slots(service_id)","create index if not exists idx_service_slots_slot_at_desc on public.service_slots(slot_at desc)","create index if not exists idx_service_slots_service_id_slot_at on public.service_slots(service_id, slot_at)","-- appointments linkage\ndo $$ begin\n  alter table public.appointments add column if not exists slot_id uuid references public.service_slots(id) on delete set null;\nexception when duplicate_column then null; end $$","-- Enable RLS\nalter table if exists public.service_slots enable row level security","-- Admin full access\ndrop policy if exists service_slots_admin_all on public.service_slots","create policy service_slots_admin_all on public.service_slots\nfor all using (public.current_app_role() = 'admin')\nwith check (public.current_app_role() = 'admin')","-- Officer SELECT policy (service belongs to officer's assigned department)\ndrop policy if exists service_slots_officer_select on public.service_slots","create policy service_slots_officer_select on public.service_slots\nfor select using (\n  exists (\n    select 1 from public.services s\n    join public.officer_assignments oa on oa.department_id = s.department_id\n    where s.id = public.service_slots.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer INSERT policy\ndrop policy if exists service_slots_officer_insert on public.service_slots","create policy service_slots_officer_insert on public.service_slots\nfor insert with check (\n  exists (\n    select 1 from public.services s\n    join public.officer_assignments oa on oa.department_id = s.department_id\n    where s.id = public.service_slots.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer UPDATE policy\ndrop policy if exists service_slots_officer_update on public.service_slots","create policy service_slots_officer_update on public.service_slots\nfor update using (\n  exists (\n    select 1 from public.services s\n    join public.officer_assignments oa on oa.department_id = s.department_id\n    where s.id = public.service_slots.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)\nwith check (\n  exists (\n    select 1 from public.services s\n    join public.officer_assignments oa on oa.department_id = s.department_id\n    where s.id = public.service_slots.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)","-- Officer DELETE policy\ndrop policy if exists service_slots_officer_delete on public.service_slots","create policy service_slots_officer_delete on public.service_slots\nfor delete using (\n  exists (\n    select 1 from public.services s\n    join public.officer_assignments oa on oa.department_id = s.department_id\n    where s.id = public.service_slots.service_id\n      and oa.officer_id = auth.uid()\n      and oa.active = true\n  )\n)",COMMIT}	006_service_slots
20250814133500	{BEGIN,"-- Ensure upsert/replace semantics by making user_temp_id unique\ncreate unique index if not exists ux_phone_verifications_user_temp\n  on public.phone_verifications(user_temp_id)",COMMIT}	020_phone_verifications_unique
20250814134000	{BEGIN,"-- Ensure one onboarding record per temp user id for idv\ncreate unique index if not exists ux_identity_verifications_user_temp\n  on public.identity_verifications(user_temp_id)",COMMIT}	021_identity_verifications_unique
20250814120001	{BEGIN,"-- Create a profile row whenever a new auth user is created\ncreate or replace function public.handle_new_auth_user()\nreturns trigger\nlanguage plpgsql\nsecurity definer\nset search_path = public\nas $$\nbegin\n  insert into public.profiles (id, email, role)\n  values (new.id, new.email, coalesce((new.raw_user_meta_data->>'role')::text, 'citizen'))\n  on conflict (id) do nothing;\n  return new;\nend;\n$$","drop trigger if exists on_auth_user_created on auth.users","create trigger on_auth_user_created\nafter insert on auth.users\nfor each row execute function public.handle_new_auth_user()","-- Backfill for existing auth users missing a profile\ninsert into public.profiles (id, email, role)\nselect u.id, u.email, 'citizen'\nfrom auth.users u\nleft join public.profiles p on p.id = u.id\nwhere p.id is null","-- RLS: allow self-insert for profiles (safe if we ever create from the app)\ndrop policy if exists profiles_self_insert on public.profiles","create policy profiles_self_insert on public.profiles\nfor insert with check (id = auth.uid())",COMMIT}	008_profiles_trigger
20250814123000	{BEGIN,"-- Atomic booking RPC\n-- SECURITY NOTE:\n-- - SECURITY DEFINER is used to allow this function to read from service_slots and insert into appointments\n--   within a single transaction while enforcing caller identity via `p_citizen_id = auth.uid()`.\n-- - This approach follows Supabase guidance for safely bypassing table RLS inside trusted server-side functions,\n--   provided the function validates inputs and caller identity.\n-- - RLS on appointments is bypassed by definer, so we must explicitly enforce that the inserted row belongs\n--   to the authenticated caller.\n\ncreate or replace function public.book_appointment_slot(\n  p_slot_id uuid,\n  p_citizen_id uuid,\n  p_notes text default null\n)\nreturns jsonb\nlanguage plpgsql\nsecurity definer\nset search_path = public\nas $$\ndeclare\n  v_service_id uuid;\n  v_slot_at timestamptz;\n  v_capacity int;\n  v_active boolean;\n  v_booked_count int;\n  v_appt_id uuid;\n  v_ref text;\nbegin\n  -- Caller identity check\n  if p_citizen_id is null or p_citizen_id <> auth.uid() then\n    return jsonb_build_object('ok', false, 'error', 'unknown');\n  end if;\n\n  -- Lock slot row for update to ensure atomic capacity checks\n  select s.service_id, s.slot_at, s.capacity, s.active\n  into v_service_id, v_slot_at, v_capacity, v_active\n  from public.service_slots s\n  where s.id = p_slot_id\n  for update;\n\n  if v_service_id is null then\n    return jsonb_build_object('ok', false, 'error', 'slot_inactive');\n  end if;\n\n  if v_active is not true then\n    return jsonb_build_object('ok', false, 'error', 'slot_inactive');\n  end if;\n\n  if v_slot_at < now() then\n    return jsonb_build_object('ok', false, 'error', 'slot_in_past');\n  end if;\n\n  select count(*)::int\n  into v_booked_count\n  from public.appointments a\n  where a.service_id = v_service_id\n    and a.appointment_at = v_slot_at;\n\n  if v_booked_count >= v_capacity then\n    return jsonb_build_object('ok', false, 'error', 'slot_full');\n  end if;\n\n  insert into public.appointments (\n    citizen_id,\n    service_id,\n    slot_id,\n    appointment_at,\n    status\n  ) values (\n    p_citizen_id,\n    v_service_id,\n    p_slot_id,\n    v_slot_at,\n    'booked'\n  ) returning id, reference_code into v_appt_id, v_ref;\n\n  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);\nexception when others then\n  return jsonb_build_object('ok', false, 'error', 'unknown');\nend;\n$$","-- Allow authenticated users to execute\ngrant execute on function public.book_appointment_slot(uuid, uuid, text) to authenticated",COMMIT}	009_book_appointment_slot
20250814124500	{BEGIN,"-- Allow public/citizen read access to services for browsing in the citizen app.\n-- Services contain non-sensitive catalog data and should be readable by all roles.\n-- This complements officer/admin policies and preserves SSR + RLS-only access patterns.\n\n-- Ensure RLS is enabled (already enabled by prior migration, but safe to include)\nalter table if exists public.services enable row level security","-- Public read policy (covers anon/authenticated/admin/officer/citizen)\ndrop policy if exists services_public_select on public.services","create policy services_public_select on public.services\nfor select\nusing (true)",COMMIT}	010_services_public_read
20250814124600	{BEGIN,"-- Departments are a public catalog; allow public read to support browsing.\nalter table if exists public.departments enable row level security","drop policy if exists departments_public_select on public.departments","create policy departments_public_select on public.departments\nfor select using (true)",COMMIT}	011_departments_public_read
20250814125500	{BEGIN,"-- Allow authenticated citizens to read open service slots for booking.\n-- Rows are limited to active future slots.\nalter table if exists public.service_slots enable row level security","drop policy if exists service_slots_citizen_select on public.service_slots","create policy service_slots_citizen_select on public.service_slots\nfor select\nto authenticated\nusing (\n  active = true\n  and slot_at >= now()\n)",COMMIT}	012_service_slots_citizen_read
20250814130000	{BEGIN,"-- profiles.gov_id and generator function (stub)\ndo $$ begin\n  alter table public.profiles add column if not exists gov_id text unique;\nexception when duplicate_column then null; end $$","create unique index if not exists idx_profiles_gov_id_unique on public.profiles(gov_id)","-- Stub: generate_gov_id normalizes NIC into a canonical gov_id.\n-- Old NIC format (9 digits + V/X): strip the trailing letter and keep digits.\n-- New NIC format (12 digits): keep as-is.\ncreate or replace function public.generate_gov_id(p_nic text)\nreturns text\nlanguage plpgsql\nimmutable\nas $$\ndeclare\n  v text;\nbegin\n  if p_nic is null then\n    return null;\n  end if;\n  v := lower(regexp_replace(p_nic, '[^0-9vx]', '', 'g'));\n  if v ~ '^[0-9]{9}[vx]$' then\n    return substr(v, 1, 9);\n  elsif v ~ '^[0-9]{12}$' then\n    return v;\n  else\n    -- Unknown format; return null for now to allow server-side validation to handle.\n    return null;\n  end if;\nend;\n$$",COMMIT}	013_profiles_gov_id
20250814130500	{BEGIN,"-- Temporary onboarding identity verification artifacts\ncreate table if not exists public.identity_verifications (\n  id uuid primary key default gen_random_uuid(),\n  user_temp_id uuid not null,\n  nic text not null,\n  nic_front_path text,\n  nic_back_path text,\n  face_capture_path text,\n  status text not null default 'initiated' check (status in ('initiated','phone_verified','pending','approved','rejected')),\n  score numeric,\n  created_at timestamptz not null default now(),\n  reviewed_by uuid references public.profiles(id) on delete set null,\n  reviewed_at timestamptz\n)","create index if not exists idx_identity_verifications_user_temp_id on public.identity_verifications(user_temp_id)","create index if not exists idx_identity_verifications_status on public.identity_verifications(status)","-- OTP phone verification during onboarding\ncreate table if not exists public.phone_verifications (\n  id uuid primary key default gen_random_uuid(),\n  user_temp_id uuid not null,\n  phone text not null,\n  otp_hash text not null,\n  expires_at timestamptz not null,\n  verified_at timestamptz\n)","create index if not exists idx_phone_verifications_user_temp_id on public.phone_verifications(user_temp_id)","create index if not exists idx_phone_verifications_phone on public.phone_verifications(phone)","-- RLS enablement\nalter table if exists public.identity_verifications enable row level security","alter table if exists public.phone_verifications enable row level security","-- Grants\ngrant select, insert, update, delete on public.identity_verifications to authenticated","grant select, insert, update, delete on public.phone_verifications to authenticated","-- Policies: owner (user_temp_id) can read/write their temp data; admin full; officers none\ndrop policy if exists idv_owner_rw on public.identity_verifications","create policy idv_owner_rw on public.identity_verifications\nfor all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid())","drop policy if exists idv_admin_all on public.identity_verifications","create policy idv_admin_all on public.identity_verifications\nfor all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","drop policy if exists phone_owner_rw on public.phone_verifications","drop policy if exists phone_owner_select on public.phone_verifications","drop policy if exists phone_owner_insert on public.phone_verifications","drop policy if exists phone_owner_update on public.phone_verifications","create policy phone_owner_select on public.phone_verifications\nfor select using (user_temp_id = auth.uid())","create policy phone_owner_insert on public.phone_verifications\nfor insert with check (user_temp_id = auth.uid())","create policy phone_owner_update on public.phone_verifications\nfor update using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid())","drop policy if exists phone_admin_read on public.phone_verifications","create policy phone_admin_read on public.phone_verifications\nfor select using (public.current_app_role() = 'admin')",COMMIT}	014_verification_tables
20250814135000	{BEGIN,"-- Allow officers to read minimal citizen profile rows when an appointment\n-- exists in a service within their active department assignment scope.\n-- Read-only; admin already has broader access.\n\ndrop policy if exists profiles_officer_read_appointments on public.profiles","create policy profiles_officer_read_appointments on public.profiles\nfor select using (\n  exists (\n    select 1 from public.appointments ap\n    join public.services s on s.id = ap.service_id\n    join public.officer_assignments oa\n      on oa.department_id = s.department_id\n     and oa.officer_id = auth.uid()\n     and oa.active = true\n    where ap.citizen_id = public.profiles.id\n  ) or public.current_app_role() = 'admin'\n)",COMMIT}	022_profiles_officer_read_appointments
20250814131000	{BEGIN,"-- Storage bucket for NIC media (private)\n-- This uses Supabase Storage policies; bucket creation is idempotent in SQL using extension API if available.\n-- If running locally, ensure the bucket is also created via CLI if needed.\ninsert into storage.buckets (id, name, public)\nvalues ('nic-media', 'nic-media', false)\non conflict (id) do nothing","-- Policies: owner access (path-based by user/{auth.uid()}/...) and admin full\n-- NOTE: If you use front/back/captures folders without user prefix, prefer server-signed URLs for owner access.\n\ndrop policy if exists \\"nic-media owner read\\" on storage.objects","create policy \\"nic-media owner read\\" on storage.objects\nfor select using (\n  bucket_id = 'nic-media' and (\n    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text\n  )\n  or public.current_app_role() = 'admin'\n)","drop policy if exists \\"nic-media owner insert\\" on storage.objects","create policy \\"nic-media owner insert\\" on storage.objects\nfor insert with check (\n  bucket_id = 'nic-media' and (\n    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text\n  )\n)","drop policy if exists \\"nic-media owner update\\" on storage.objects","create policy \\"nic-media owner update\\" on storage.objects\nfor update using (\n  bucket_id = 'nic-media' and (\n    (storage.foldername(name))[1] = 'user' and (storage.foldername(name))[2] = auth.uid()::text\n  )\n)","drop policy if exists \\"nic-media admin all\\" on storage.objects","create policy \\"nic-media admin all\\" on storage.objects\nfor all using (\n  bucket_id = 'nic-media' and public.current_app_role() = 'admin'\n) with check (\n  bucket_id = 'nic-media' and public.current_app_role() = 'admin'\n)",COMMIT}	015_storage_nic_media
20250814131500	{BEGIN,"-- Add gov_id columns to appointments and documents\ndo $$ begin\n  alter table public.appointments add column if not exists citizen_gov_id text;\nexception when duplicate_column then null; end $$","do $$ begin\n  alter table public.documents add column if not exists owner_gov_id text;\nexception when duplicate_column then null; end $$","-- Indexes for new columns\ncreate index if not exists idx_appointments_citizen_gov_id on public.appointments(citizen_gov_id)","create index if not exists idx_documents_owner_gov_id on public.documents(owner_gov_id)",COMMIT}	016_gov_id_columns_appointments_documents
20250814132000	{BEGIN,"-- Log OTP send attempts for basic rate limiting\ncreate table if not exists public.phone_verification_events (\n  id uuid primary key default gen_random_uuid(),\n  user_temp_id uuid not null,\n  phone text not null,\n  created_at timestamptz not null default now()\n)","create index if not exists idx_phone_verification_events_user_temp_id on public.phone_verification_events(user_temp_id)","create index if not exists idx_phone_verification_events_phone_created_at on public.phone_verification_events(phone, created_at desc)","alter table if exists public.phone_verification_events enable row level security","grant select, insert on public.phone_verification_events to authenticated","drop policy if exists phone_events_owner_rw on public.phone_verification_events","drop policy if exists phone_events_owner_select on public.phone_verification_events","drop policy if exists phone_events_owner_insert on public.phone_verification_events","create policy phone_events_owner_select on public.phone_verification_events\nfor select using (user_temp_id = auth.uid())","create policy phone_events_owner_insert on public.phone_verification_events\nfor insert with check (user_temp_id = auth.uid())","drop policy if exists phone_events_admin_read on public.phone_verification_events","create policy phone_events_admin_read on public.phone_verification_events\nfor select using (public.current_app_role() = 'admin')",COMMIT}	017_phone_verification_events
20250814132500	{BEGIN,"-- RLS hardening and officer restriction documentation\n-- identity_verifications: owner read/write; admin full; officers none\n-- phone_verifications: owner read/write; admin read; officers none\n-- storage (nic-media): private; owner and admin read; officers never see facial captures\n\n-- Recreate policies idempotently to ensure intent is applied\n\n-- identity_verifications\nalter table if exists public.identity_verifications enable row level security","drop policy if exists idv_owner_rw on public.identity_verifications","create policy idv_owner_rw on public.identity_verifications\nfor all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid())","drop policy if exists idv_admin_all on public.identity_verifications","create policy idv_admin_all on public.identity_verifications\nfor all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin')","-- phone_verifications\nalter table if exists public.phone_verifications enable row level security","drop policy if exists phone_owner_rw on public.phone_verifications","create policy phone_owner_rw on public.phone_verifications\nfor all using (user_temp_id = auth.uid()) with check (user_temp_id = auth.uid())","drop policy if exists phone_admin_read on public.phone_verifications","create policy phone_admin_read on public.phone_verifications\nfor select using (public.current_app_role() = 'admin')","-- Storage nic-media: reinforce policies; officers have no explicit policies; admin allowed\n-- NOTE: Facial captures are never exposed to officers. Any retrieval must be via server-generated signed GET URLs and only for owner/admin.\n-- Policies were created previously; kept here as documentation.\n\nCOMMIT"}	018_rls_hardening_and_docs
20250814133000	{BEGIN,"-- Extend RPC to accept citizen_gov_id and persist it alongside appointment insert\ncreate or replace function public.book_appointment_slot(\n  p_slot_id uuid,\n  p_citizen_id uuid,\n  p_notes text default null,\n  p_citizen_gov_id text default null\n)\nreturns jsonb\nlanguage plpgsql\nsecurity definer\nset search_path = public\nas $$\ndeclare\n  v_service_id uuid;\n  v_slot_at timestamptz;\n  v_capacity int;\n  v_active boolean;\n  v_booked_count int;\n  v_appt_id uuid;\n  v_ref text;\nbegin\n  if p_citizen_id is null or p_citizen_id <> auth.uid() then\n    return jsonb_build_object('ok', false, 'error', 'unknown');\n  end if;\n\n  select s.service_id, s.slot_at, s.capacity, s.active\n  into v_service_id, v_slot_at, v_capacity, v_active\n  from public.service_slots s\n  where s.id = p_slot_id\n  for update;\n\n  if v_service_id is null or v_active is not true or v_slot_at < now() then\n    return jsonb_build_object('ok', false, 'error', 'slot_inactive');\n  end if;\n\n  select count(*)::int into v_booked_count\n  from public.appointments a\n  where a.service_id = v_service_id and a.appointment_at = v_slot_at;\n\n  if v_booked_count >= v_capacity then\n    return jsonb_build_object('ok', false, 'error', 'slot_full');\n  end if;\n\n  insert into public.appointments (\n    citizen_id,\n    service_id,\n    slot_id,\n    appointment_at,\n    status,\n    citizen_gov_id\n  ) values (\n    p_citizen_id,\n    v_service_id,\n    p_slot_id,\n    v_slot_at,\n    'booked',\n    p_citizen_gov_id\n  ) returning id, reference_code into v_appt_id, v_ref;\n\n  return jsonb_build_object('ok', true, 'appointment_id', v_appt_id, 'reference_code', v_ref);\nexception when others then\n  return jsonb_build_object('ok', false, 'error', 'unknown');\nend;\n$$","grant execute on function public.book_appointment_slot(uuid, uuid, text, text) to authenticated",COMMIT}	019_rpc_gov_id_param
20250815120000	{BEGIN,"-- Rollback notes:\n-- - Drop columns added to departments/services if reverting.\n-- - Drop service_branch_settings and branches tables after removing FKs/policies.\n\n-- 1) branches\ncreate table if not exists public.branches (\n  id uuid primary key default gen_random_uuid(),\n  department_id uuid not null references public.departments(id) on delete cascade,\n  code text not null,\n  name text not null,\n  address text,\n  location_lat double precision,\n  location_lng double precision,\n  meta jsonb,\n  created_at timestamptz not null default now(),\n  unique (department_id, code)\n)","create index if not exists idx_branches_department on public.branches(department_id)","alter table if exists public.branches enable row level security","-- Policies for branches\ndrop policy if exists branches_public_select on public.branches","create policy branches_public_select on public.branches for select using (true)","drop policy if exists branches_admin_all on public.branches","create policy branches_admin_all on public.branches\nfor all using (public.current_app_role() = 'admin')\nwith check (public.current_app_role() = 'admin')","drop policy if exists branches_officer_write on public.branches","create policy branches_officer_write on public.branches\nfor all using (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.branches.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active\n  )\n) with check (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.branches.department_id\n      and oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- 2) service_branch_settings (per-branch enable/disable for services)\ncreate table if not exists public.service_branch_settings (\n  service_id uuid not null references public.services(id) on delete cascade,\n  branch_id uuid not null references public.branches(id) on delete cascade,\n  enabled boolean not null default true,\n  created_at timestamptz not null default now(),\n  primary key (service_id, branch_id)\n)","create index if not exists idx_sbs_branch on public.service_branch_settings(branch_id)","alter table if exists public.service_branch_settings enable row level security","-- Policies for service_branch_settings\ndrop policy if exists sbs_public_select on public.service_branch_settings","create policy sbs_public_select on public.service_branch_settings for select using (true)","drop policy if exists sbs_admin_all on public.service_branch_settings","create policy sbs_admin_all on public.service_branch_settings\nfor all using (public.current_app_role() = 'admin')\nwith check (public.current_app_role() = 'admin')","drop policy if exists sbs_officer_write on public.service_branch_settings","create policy sbs_officer_write on public.service_branch_settings\nfor all using (\n  exists (\n    select 1 from public.services s\n    join public.branches b on b.id = public.service_branch_settings.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_branch_settings.service_id\n      and b.department_id = s.department_id\n  )\n) with check (\n  exists (\n    select 1 from public.services s\n    join public.branches b on b.id = public.service_branch_settings.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_branch_settings.service_id\n      and b.department_id = s.department_id\n  )\n)","-- 3) Presentation/instructions columns\nalter table if exists public.departments add column if not exists logo_path text","alter table if exists public.departments add column if not exists description_richtext jsonb not null default '{}'::jsonb","alter table if exists public.departments add column if not exists description_updated_at timestamptz","alter table if exists public.services add column if not exists instructions_richtext jsonb not null default '{}'::jsonb","alter table if exists public.services add column if not exists instructions_pdf_path text","alter table if exists public.services add column if not exists instructions_updated_at timestamptz",COMMIT}	023_branches_sbs_and_columns
20250815121500	{BEGIN,"-- Restrict catalog browsing to authenticated users (drop public read)\nalter table if exists public.departments enable row level security","drop policy if exists departments_public_select on public.departments","drop policy if exists departments_auth_select on public.departments","create policy departments_auth_select on public.departments\nfor select to authenticated using (true)","alter table if exists public.services enable row level security","drop policy if exists services_public_select on public.services","drop policy if exists services_auth_select on public.services","create policy services_auth_select on public.services\nfor select to authenticated using (true)","-- Branches select to authenticated only (replacing public browse)\nalter table if exists public.branches enable row level security","drop policy if exists branches_public_select on public.branches","drop policy if exists branches_auth_select on public.branches","create policy branches_auth_select on public.branches\nfor select to authenticated using (true)","-- Storage: bucket 'departments' is private; define policies\n-- ensure bucket exists and is private\ninsert into storage.buckets (id, name, public)\nvalues ('departments','departments', false)\non conflict (id) do nothing","update storage.buckets set public=false where id='departments'","-- read: authenticated users can read files in this bucket\ndrop policy if exists \\"departments auth read\\" on storage.objects","create policy \\"departments auth read\\" on storage.objects\nfor select to authenticated using (\n  bucket_id = 'departments'\n)","-- write logos: officers/admins limited by department (logos/{deptId}/...)\ndrop policy if exists \\"departments officers write logos\\" on storage.objects","create policy \\"departments officers write logos\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and oa.department_id = ((storage.foldername(name))[2])::uuid\n  )\n)","-- write files (flat files/ path)\ndrop policy if exists \\"departments officers write files\\" on storage.objects","create policy \\"departments officers write files\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- admin all in departments bucket\ndrop policy if exists \\"departments admin all\\" on storage.objects","create policy \\"departments admin all\\" on storage.objects\nfor all using (bucket_id='departments' and public.current_app_role()='admin')\nwith check (bucket_id='departments' and public.current_app_role()='admin')","-- allow deletes for officers/admins within departments bucket (files/logos flat structure)\ndrop policy if exists \\"departments officers delete\\" on storage.objects","create policy \\"departments officers delete\\" on storage.objects\nfor delete to authenticated using (\n  bucket_id = 'departments'\n  and (\n    public.current_app_role() = 'admin' or exists (\n      select 1 from public.officer_assignments oa where oa.officer_id = auth.uid() and oa.active\n    )\n  )\n)",COMMIT}	024_auth_only_catalog_and_storage_policies
20250815123000	{BEGIN,"-- Add branch_id to service_slots (nullable initial phase)\nalter table if exists public.service_slots\n  add column if not exists branch_id uuid references public.branches(id) on delete cascade","-- Ensure a default branch per department (code: 'main')\ninsert into public.branches (department_id, code, name)\nselect d.id, 'main', 'Main Branch'\nfrom public.departments d\nwhere not exists (\n  select 1 from public.branches b where b.department_id = d.id\n)","-- Backfill service_slots.branch_id to department's default branch\nupdate public.service_slots sl\nset branch_id = b.id\nfrom public.services s\njoin public.branches b on b.department_id = s.department_id and b.code = 'main'\nwhere sl.service_id = s.id and sl.branch_id is null","-- Enforce NOT NULL and constraints\nalter table if exists public.service_slots alter column branch_id set not null","do $$ begin\n  alter table public.service_slots add constraint uq_service_slots unique (service_id, branch_id, slot_at);\nexception when duplicate_object then null; end $$","create index if not exists idx_service_slots_branch_id on public.service_slots(branch_id)","create index if not exists idx_service_slots_svc_branch_slot on public.service_slots(service_id, branch_id, slot_at)","-- Update RLS policies on service_slots for officer and citizen reads\nalter table if exists public.service_slots enable row level security","-- Officer policies: drop and recreate with branch.department check\ndrop policy if exists service_slots_officer_select on public.service_slots","create policy service_slots_officer_select on public.service_slots\nfor select using (\n  exists (\n    select 1\n    from public.services s\n    join public.branches b on b.id = public.service_slots.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_slots.service_id\n      and b.department_id = s.department_id\n  )\n)","drop policy if exists service_slots_officer_insert on public.service_slots","create policy service_slots_officer_insert on public.service_slots\nfor insert with check (\n  exists (\n    select 1\n    from public.services s\n    join public.branches b on b.id = public.service_slots.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_slots.service_id\n      and b.department_id = s.department_id\n  )\n)","drop policy if exists service_slots_officer_update on public.service_slots","create policy service_slots_officer_update on public.service_slots\nfor update using (\n  exists (\n    select 1\n    from public.services s\n    join public.branches b on b.id = public.service_slots.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_slots.service_id\n      and b.department_id = s.department_id\n  )\n) with check (\n  exists (\n    select 1\n    from public.services s\n    join public.branches b on b.id = public.service_slots.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_slots.service_id\n      and b.department_id = s.department_id\n  )\n)","drop policy if exists service_slots_officer_delete on public.service_slots","create policy service_slots_officer_delete on public.service_slots\nfor delete using (\n  exists (\n    select 1\n    from public.services s\n    join public.branches b on b.id = public.service_slots.branch_id\n    join public.officer_assignments oa on oa.department_id = s.department_id and oa.officer_id = auth.uid() and oa.active\n    where s.id = public.service_slots.service_id\n      and b.department_id = s.department_id\n  )\n)","-- Citizen read policy: must be active/future and enabled for branch\ndrop policy if exists service_slots_citizen_select on public.service_slots","create policy service_slots_citizen_select on public.service_slots\nfor select to authenticated using (\n  public.service_slots.active = true\n  and public.service_slots.slot_at >= now()\n  and exists (\n    select 1 from public.service_branch_settings sbs\n    where sbs.service_id = public.service_slots.service_id\n      and sbs.branch_id = public.service_slots.branch_id\n      and sbs.enabled = true\n  )\n)",COMMIT}	025_service_slots_branch_scoping
20250815124500	{BEGIN,"-- Departments write policies (admin all; officer update in assigned department)\nalter table if exists public.departments enable row level security","drop policy if exists departments_admin_all on public.departments","create policy departments_admin_all on public.departments\nfor all using (public.current_app_role() = 'admin')\nwith check (public.current_app_role() = 'admin')","drop policy if exists departments_officer_update on public.departments","create policy departments_officer_update on public.departments\nfor update using (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.departments.id\n      and oa.officer_id = auth.uid()\n      and oa.active\n  )\n) with check (\n  exists (\n    select 1 from public.officer_assignments oa\n    where oa.department_id = public.departments.id\n      and oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- Seed service_branch_settings for all (service, branch same department) as enabled=true\ninsert into public.service_branch_settings (service_id, branch_id, enabled)\nselect s.id, b.id, true\nfrom public.services s\njoin public.branches b on b.department_id = s.department_id\non conflict do nothing",COMMIT}	026_departments_services_write_policies_and_seed_sbs
20250815135022	{BEGIN,"-- Fix storage bucket configuration for departments\n-- Make the bucket public so department logos and instruction PDFs can be accessed\n\n-- Ensure the departments bucket exists and is public\ninsert into storage.buckets (id, name, public)\nvalues ('departments','departments', true)\non conflict (id) do update set public = true","-- Create/recreate read policy for all users to access department files\ndrop policy if exists \\"departments public read\\" on storage.objects","create policy \\"departments public read\\" on storage.objects\nfor select using (\n  bucket_id = 'departments'\n)","-- Also ensure authenticated users can read\ndrop policy if exists \\"departments auth read\\" on storage.objects","create policy \\"departments auth read\\" on storage.objects\nfor select to authenticated using (\n  bucket_id = 'departments'\n)",COMMIT}	fix_storage_bucket_public
20250816000000	{"-- Update storage policies for new file path formats\n-- logos/logo-{dept-code}.{ext} and files/instructions-{service-name}.pdf\n\n-- Update logo write policy to handle new format: logos/logo-{dept-code}.{ext}\ndrop policy if exists \\"departments officers write logos\\" on storage.objects","create policy \\"departments officers write logos\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    join public.departments d on d.id = oa.department_id\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and (storage.filename(name)) like 'logo-' || d.code || '.%'\n  )\n)","-- Update logo update policy for upserts\ndrop policy if exists \\"departments officers update logos\\" on storage.objects","create policy \\"departments officers update logos\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    join public.departments d on d.id = oa.department_id\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and (storage.filename(name)) like 'logo-' || d.code || '.%'\n  )\n)","-- Update file write policy to handle new format: files/instructions-{service-name}.pdf\ndrop policy if exists \\"departments officers write files\\" on storage.objects","create policy \\"departments officers write files\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    join public.services s on s.department_id = oa.department_id\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'\n  )\n)","-- Update file update policy for upserts\ndrop policy if exists \\"departments officers update files\\" on storage.objects","create policy \\"departments officers update files\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    join public.services s on s.department_id = oa.department_id\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'\n  )\n)","-- Delete policies remain unchanged as they check existing paths in the database"}	027_update_storage_paths
20250816000001	{"-- Fix storage policies for better compatibility\n-- Simplified approach for logo and file uploads\n\n-- Update logo write policy with simplified pattern matching\ndrop policy if exists \\"departments officers write logos\\" on storage.objects","create policy \\"departments officers write logos\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and oa.department_id::text = any(\n        select d.id::text from public.departments d \n        where (storage.filename(name)) like 'logo-' || replace(trim(d.code), ' ', '-') || '.%'\n      )\n  )\n)","-- Update logo update policy for upserts  \ndrop policy if exists \\"departments officers update logos\\" on storage.objects","create policy \\"departments officers update logos\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and oa.department_id::text = any(\n        select d.id::text from public.departments d \n        where (storage.filename(name)) like 'logo-' || replace(trim(d.code), ' ', '-') || '.%'\n      )\n  )\n)","-- Update file write policy with simplified pattern matching\ndrop policy if exists \\"departments officers write files\\" on storage.objects","create policy \\"departments officers write files\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and oa.department_id = any(\n        select s.department_id from public.services s \n        where (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'\n      )\n  )\n)","-- Update file update policy for upserts\ndrop policy if exists \\"departments officers update files\\" on storage.objects","create policy \\"departments officers update files\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n      and oa.department_id = any(\n        select s.department_id from public.services s \n        where (storage.filename(name)) like 'instructions-' || lower(replace(trim(s.name), ' ', '-')) || '.pdf'\n      )\n  )\n)"}	028_fix_storage_policies
20250816000002	{"-- Temporary simple policies for testing - more permissive\n-- These can be tightened once we confirm the basic functionality works\n\n-- Simple logo write policy - just check if user is an officer with active assignment\ndrop policy if exists \\"departments officers write logos\\" on storage.objects","create policy \\"departments officers write logos\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- Simple logo update policy  \ndrop policy if exists \\"departments officers update logos\\" on storage.objects","create policy \\"departments officers update logos\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'logos'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- Simple file write policy\ndrop policy if exists \\"departments officers write files\\" on storage.objects","create policy \\"departments officers write files\\" on storage.objects\nfor insert to authenticated with check (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n  )\n)","-- Simple file update policy\ndrop policy if exists \\"departments officers update files\\" on storage.objects","create policy \\"departments officers update files\\" on storage.objects\nfor update to authenticated using (\n  bucket_id = 'departments'\n  and (storage.foldername(name))[1] = 'files'\n  and exists (\n    select 1 from public.officer_assignments oa\n    where oa.officer_id = auth.uid()\n      and oa.active\n  )\n)"}	029_temp_simple_policies
20250816000003	{BEGIN,"-- Add confirmed_at field to appointments table\nALTER TABLE public.appointments \nADD COLUMN confirmed_at timestamptz","-- Add comment for the new field\nCOMMENT ON COLUMN public.appointments.confirmed_at IS 'Timestamp when the appointment was confirmed by the citizen or system'",COMMIT}	030_add_confirmed_at_to_appointments
20250816000004	{BEGIN,"-- Update the status check constraint to include 'confirmed'\nALTER TABLE public.appointments \nDROP CONSTRAINT IF EXISTS appointments_status_check","ALTER TABLE public.appointments \nADD CONSTRAINT appointments_status_check \nCHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed'))",COMMIT}	031_add_confirmed_status
20250816000005	{BEGIN,"-- Enable RLS on notifications table\nALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY","-- Policy: Allow officers to insert notifications for any user\nCREATE POLICY \\"Officers can insert notifications\\" ON public.notifications\n  FOR INSERT \n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM public.profiles \n      WHERE id = auth.uid() \n      AND role = 'officer'\n    )\n  )","-- Policy: Allow users to read their own notifications\nCREATE POLICY \\"Users can read own notifications\\" ON public.notifications\n  FOR SELECT \n  USING (user_id = auth.uid())","-- Policy: Allow officers to read all notifications for their department\nCREATE POLICY \\"Officers can read department notifications\\" ON public.notifications\n  FOR SELECT \n  USING (\n    EXISTS (\n      SELECT 1 FROM public.profiles p\n      JOIN public.officer_assignments oa ON oa.officer_id = p.id\n      JOIN public.appointments a ON a.id = notifications.appointment_id\n      JOIN public.services s ON s.id = a.service_id\n      WHERE p.id = auth.uid() \n      AND p.role = 'officer'\n      AND oa.department_id = s.department_id\n      AND oa.active = true\n    )\n  )","-- Policy: Allow system (service role) to insert notifications\nCREATE POLICY \\"Service role can insert notifications\\" ON public.notifications\n  FOR INSERT \n  WITH CHECK (current_user = 'service_role')","-- Policy: Allow service role to read all notifications  \nCREATE POLICY \\"Service role can read all notifications\\" ON public.notifications\n  FOR SELECT \n  USING (current_user = 'service_role')",COMMIT}	032_notifications_rls
20250816204700	{BEGIN,"-- Fix RLS policies to check public.profiles.role instead of JWT app_metadata.role\n-- This is more reliable and doesn't require JWT app_metadata setup\n\n-- Helper function to get current user's role from profiles table\nCREATE OR REPLACE FUNCTION public.current_user_role()\nRETURNS text\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nAS $$\n  SELECT COALESCE(\n    (SELECT role FROM public.profiles WHERE id = auth.uid()),\n    'citizen'\n  );\n$$","-- Update departments policies to use profile role instead of JWT role\nDROP POLICY IF EXISTS departments_admin_all ON public.departments","CREATE POLICY departments_admin_all ON public.departments\nFOR ALL USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')","-- Update services policies \nDROP POLICY IF EXISTS services_admin_all ON public.services","CREATE POLICY services_admin_all ON public.services\nFOR ALL USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')","-- Update branches policies\nDROP POLICY IF EXISTS branches_admin_all ON public.branches","CREATE POLICY branches_admin_all ON public.branches\nFOR ALL USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')","-- Update service_branch_settings policies\nDROP POLICY IF EXISTS service_branch_settings_admin_all ON public.service_branch_settings","CREATE POLICY service_branch_settings_admin_all ON public.service_branch_settings\nFOR ALL USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')","-- Update service_slots policies\nDROP POLICY IF EXISTS service_slots_admin_all ON public.service_slots","CREATE POLICY service_slots_admin_all ON public.service_slots\nFOR ALL USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')",COMMIT}	033_rls_use_profile_role_instead_of_jwt
20250816204800	{BEGIN,"-- Fix the trigger to allow role specification in user_metadata when creating officers\n-- Update the handle_new_auth_user trigger to check user_metadata for role\n\nCREATE OR REPLACE FUNCTION public.handle_new_auth_user()\nRETURNS trigger\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nBEGIN\n  -- Check for role in user_metadata first, then app_metadata, then default to citizen\n  INSERT INTO public.profiles (id, email, role)\n  VALUES (\n    NEW.id, \n    NEW.email, \n    COALESCE(\n      (NEW.raw_user_meta_data->>'role')::text,\n      (NEW.raw_app_meta_data->>'role')::text,\n      'citizen'\n    )\n  )\n  ON CONFLICT (id) DO UPDATE SET\n    email = EXCLUDED.email,\n    role = EXCLUDED.role,\n    updated_at = NOW();\n  \n  RETURN NEW;\nEND;\n$$",COMMIT}	034_officer_creation_trigger_use_user_metadata
20250816205700	{BEGIN,"-- Fix profiles table RLS policies to use current_user_role() instead of current_app_role()\n\n-- Update profiles_admin_select policy\nDROP POLICY IF EXISTS profiles_admin_select ON public.profiles","CREATE POLICY profiles_admin_select ON public.profiles\nFOR SELECT USING (public.current_user_role() = 'admin')","-- Update profiles_admin_update policy\nDROP POLICY IF EXISTS profiles_admin_update ON public.profiles","CREATE POLICY profiles_admin_update ON public.profiles\nFOR UPDATE USING (public.current_user_role() = 'admin')\nWITH CHECK (public.current_user_role() = 'admin')","-- Update profiles_self_select policy\nDROP POLICY IF EXISTS profiles_self_select ON public.profiles","CREATE POLICY profiles_self_select ON public.profiles\nFOR SELECT USING (auth.uid() = id OR public.current_user_role() = 'admin')","-- Update profiles_officer_read_appointments policy\nDROP POLICY IF EXISTS profiles_officer_read_appointments ON public.profiles","CREATE POLICY profiles_officer_read_appointments ON public.profiles\nFOR SELECT USING (\n  (EXISTS (\n    SELECT 1\n    FROM ((appointments ap\n      JOIN services s ON ((s.id = ap.service_id)))\n      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))\n    WHERE (ap.citizen_id = profiles.id)\n  )) OR (public.current_user_role() = 'admin')\n)",COMMIT}	035_profiles_table_rls_policies
20250816205900	{BEGIN,"-- Fix all remaining RLS policies to use current_user_role() instead of current_app_role()\n\n-- officer_assignments policies\nDROP POLICY IF EXISTS officer_assignments_self_select ON public.officer_assignments","CREATE POLICY officer_assignments_self_select ON public.officer_assignments\nFOR SELECT USING (\n  officer_id = auth.uid() OR public.current_user_role() = 'admin'\n)","DROP POLICY IF EXISTS officer_assignments_admin_all ON public.officer_assignments","CREATE POLICY officer_assignments_admin_all ON public.officer_assignments\nFOR ALL USING (public.current_user_role() = 'admin') \nWITH CHECK (public.current_user_role() = 'admin')","-- appointments policies\nDROP POLICY IF EXISTS appointments_officer_read ON public.appointments","CREATE POLICY appointments_officer_read ON public.appointments\nFOR SELECT USING (\n  (EXISTS (\n    SELECT 1\n    FROM ((services s\n      JOIN departments d ON ((d.id = s.department_id)))\n      JOIN officer_assignments oa ON ((oa.department_id = d.id)))\n    WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))\n  )) OR (public.current_user_role() = 'admin')\n)","DROP POLICY IF EXISTS appointments_officer_update ON public.appointments","CREATE POLICY appointments_officer_update ON public.appointments\nFOR UPDATE USING (\n  (EXISTS (\n    SELECT 1\n    FROM ((services s\n      JOIN departments d ON ((d.id = s.department_id)))\n      JOIN officer_assignments oa ON ((oa.department_id = d.id)))\n    WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))\n  )) OR (public.current_user_role() = 'admin')\n)","DROP POLICY IF EXISTS appointments_admin_all ON public.appointments","CREATE POLICY appointments_admin_all ON public.appointments\nFOR ALL USING (public.current_user_role() = 'admin')","-- appointment_feedback policies\nDROP POLICY IF EXISTS feedback_officer_read ON public.appointment_feedback","CREATE POLICY feedback_officer_read ON public.appointment_feedback\nFOR SELECT USING (\n  (EXISTS (\n    SELECT 1\n    FROM ((appointments ap\n      JOIN services s ON ((s.id = ap.service_id)))\n      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))\n    WHERE (ap.id = appointment_feedback.appointment_id)\n  )) OR (public.current_user_role() = 'admin')\n)","-- notifications policies\nDROP POLICY IF EXISTS notifications_user_select ON public.notifications","CREATE POLICY notifications_user_select ON public.notifications\nFOR SELECT USING (\n  user_id = auth.uid() OR public.current_user_role() = 'admin'\n)","DROP POLICY IF EXISTS notifications_admin_select ON public.notifications","CREATE POLICY notifications_admin_select ON public.notifications\nFOR SELECT USING (public.current_user_role() = 'admin')","-- documents policies\nDROP POLICY IF EXISTS documents_admin_all ON public.documents","CREATE POLICY documents_admin_all ON public.documents\nFOR ALL USING (public.current_user_role() = 'admin') \nWITH CHECK (public.current_user_role() = 'admin')","DROP POLICY IF EXISTS documents_officer_read_scope ON public.documents","CREATE POLICY documents_officer_read_scope ON public.documents\nFOR SELECT USING (\n  (EXISTS (\n    SELECT 1\n    FROM (((appointment_documents ad\n      JOIN appointments ap ON ((ap.id = ad.appointment_id)))\n      JOIN services s ON ((s.id = ap.service_id)))\n      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))\n    WHERE (ad.document_id = documents.id)\n  )) OR (public.current_user_role() = 'admin')\n)","-- appointment_documents policies\nDROP POLICY IF EXISTS appt_docs_officer_read ON public.appointment_documents","CREATE POLICY appt_docs_officer_read ON public.appointment_documents\nFOR SELECT USING (\n  (EXISTS (\n    SELECT 1\n    FROM ((appointments ap\n      JOIN services s ON ((s.id = ap.service_id)))\n      JOIN officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))\n    WHERE (ap.id = appointment_documents.appointment_id)\n  )) OR (public.current_user_role() = 'admin')\n)","-- phone_verification_events policies\nDROP POLICY IF EXISTS phone_events_admin_read ON public.phone_verification_events","CREATE POLICY phone_events_admin_read ON public.phone_verification_events\nFOR SELECT USING (public.current_user_role() = 'admin')","-- identity_verifications policies\nDROP POLICY IF EXISTS idv_admin_all ON public.identity_verifications","CREATE POLICY idv_admin_all ON public.identity_verifications\nFOR ALL USING (public.current_user_role() = 'admin') \nWITH CHECK (public.current_user_role() = 'admin')","-- phone_verifications policies\nDROP POLICY IF EXISTS phone_admin_read ON public.phone_verifications","CREATE POLICY phone_admin_read ON public.phone_verifications\nFOR SELECT USING (public.current_user_role() = 'admin')","-- service_branch_settings was already fixed in previous migration, but let's ensure it\nDROP POLICY IF EXISTS sbs_admin_all ON public.service_branch_settings","CREATE POLICY sbs_admin_all ON public.service_branch_settings\nFOR ALL USING (public.current_user_role() = 'admin') \nWITH CHECK (public.current_user_role() = 'admin')","-- Storage policies (these use current_app_role but may not directly affect officer creation)\n-- We'll leave storage policies as-is for now since they don't affect user creation\n\nCOMMIT"}	036_all_remaining_tables_rls_policies
20250816210000	{BEGIN,"-- Departments (Sri Lanka)\ninsert into public.departments (code, name)\nvalues\n  ('IMMIG', 'Department of Immigration & Emigration'),\n  ('DMT', 'Department of Motor Traffic'),\n  ('DRP', 'Department for Registration of Persons')\non conflict (code) do update set name = excluded.name","-- Branches for each department\nwith dept as (\n  select id, code from public.departments where code in ('IMMIG','DMT','DRP')\n), to_ins as (\n  select d.id as department_id, bcode as code, bname as name, baddr as address\n  from dept d\n  join (\n    values\n      ('IMMIG','COL', 'Head Office - Colombo', 'Suhurupaya, Battaramulla'),\n      ('IMMIG','KND', 'Regional Office - Kandy', 'Kandy'),\n      ('DMT','WEH', 'Head Office - Werahera', 'Werahera'),\n      ('DMT','GAM', 'District Office - Gampaha', 'Gampaha'),\n      ('DRP','BAT', 'Head Office - Battaramulla', 'Suhurupaya, Battaramulla'),\n      ('DRP','KUR', 'Regional Office - Kurunegala', 'Kurunegala')\n  ) as b(dept_code, bcode, bname, baddr) on b.dept_code = d.code\n)\ninsert into public.branches (department_id, code, name, address)\nselect department_id, code, name, address from to_ins\non conflict (department_id, code) do update set\n  name = excluded.name,\n  address = coalesce(excluded.address, public.branches.address)","-- Services under each department\nwith dept as (\n  select id, code from public.departments where code in ('IMMIG','DMT','DRP')\n)\ninsert into public.services (department_id, code, name)\nselect d.id, s.scode, s.sname\nfrom (\n  values\n    ('IMMIG','PASSPORT_NEW','New Passport Application'),\n    ('IMMIG','PASSPORT_RENEW','Passport Renewal'),\n    ('DMT','DL_NEW','New Driving License'),\n    ('DMT','DL_RENEW','Driving License Renewal'),\n    ('DRP','NIC_NEW','New NIC Application'),\n    ('DRP','NIC_DUP','Duplicate NIC')\n) as s(dept_code, scode, sname)\njoin dept d on d.code = s.dept_code\non conflict (code) do update set\n  name = excluded.name,\n  department_id = excluded.department_id","-- Enable services at all branches within the same department\ninsert into public.service_branch_settings (service_id, branch_id, enabled)\nselect s.id, b.id, true\nfrom public.services s\njoin public.branches b on b.department_id = s.department_id\non conflict do nothing","-- Fix auth trigger to not reference non-existent profiles.updated_at\ncreate or replace function public.handle_new_auth_user()\nreturns trigger\nlanguage plpgsql\nsecurity definer\nset search_path = public\nas $$\nbegin\n  insert into public.profiles (id, email, role)\n  values (\n    new.id,\n    new.email,\n    coalesce(\n      (new.raw_user_meta_data->>'role')::text,\n      (new.raw_app_meta_data->>'role')::text,\n      'citizen'\n    )\n  )\n  on conflict (id) do update set\n    email = excluded.email,\n    role = excluded.role;\n  return new;\nend;\n$$","-- Ensure trigger exists and points to the updated function\ndo $$\nbegin\n  if exists (\n    select 1 from pg_trigger t\n    join pg_class c on c.oid = t.tgrelid\n    where c.relname = 'users' and t.tgname = 'on_auth_user_created'\n  ) then\n    execute 'drop trigger on_auth_user_created on auth.users';\n  end if;\n  execute 'create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user()';\nend $$","-- Users\n-- Admin user: admin@civigo.local / 12345678\ndo $$\ndeclare\n  v_user_id uuid;\nbegin\n  if not exists (select 1 from auth.users where email = 'admin@civigo.local') then\n    insert into auth.users (\n      id, email, encrypted_password, email_confirmed_at,\n      raw_user_meta_data, raw_app_meta_data, aud\n    )\n    values (\n      gen_random_uuid(),\n      'admin@civigo.local',\n      crypt('12345678', gen_salt('bf')),\n      now(),\n      jsonb_build_object('role','admin'),\n      jsonb_build_object('provider','email','providers',array['email']),\n      'authenticated'\n    ) returning id into v_user_id;\n  else\n    select id into v_user_id from auth.users where email = 'admin@civigo.local';\n    update auth.users\n    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')\n    where id = v_user_id;\n  end if;\n\n  -- Ensure profile role stays in sync\n  update public.profiles set role = 'admin' where id = v_user_id;\nend$$","-- Officer user: officer@civigo.local / 12345678\ndo $$\ndeclare\n  v_user_id uuid;\n  v_dept_id uuid;\nbegin\n  if not exists (select 1 from auth.users where email = 'officer@civigo.local') then\n    insert into auth.users (\n      id, email, encrypted_password, email_confirmed_at,\n      raw_user_meta_data, raw_app_meta_data, aud\n    )\n    values (\n      gen_random_uuid(),\n      'officer@civigo.local',\n      crypt('12345678', gen_salt('bf')),\n      now(),\n      jsonb_build_object('role','officer'),\n      jsonb_build_object('provider','email','providers',array['email']),\n      'authenticated'\n    ) returning id into v_user_id;\n  else\n    select id into v_user_id from auth.users where email = 'officer@civigo.local';\n    update auth.users\n    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','officer')\n    where id = v_user_id;\n  end if;\n\n  update public.profiles set role = 'officer' where id = v_user_id;\n\n  -- Assign officer to Department of Motor Traffic (DMT)\n  select id into v_dept_id from public.departments where code = 'DMT';\n  insert into public.officer_assignments (officer_id, department_id, active)\n  values (v_user_id, v_dept_id, true)\n  on conflict (officer_id, department_id) do update set active = true;\nend$$","-- Citizen user: citizen@civigo.local / 12345678, with a proper NIC\ndo $$\ndeclare\n  v_user_id uuid;\n  v_nic text := '912345678V';\nbegin\n  if not exists (select 1 from auth.users where email = 'citizen@civigo.local') then\n    insert into auth.users (\n      id, email, encrypted_password, email_confirmed_at,\n      raw_user_meta_data, raw_app_meta_data, aud\n    )\n    values (\n      gen_random_uuid(),\n      'citizen@civigo.local',\n      crypt('12345678', gen_salt('bf')),\n      now(),\n      jsonb_build_object('role','citizen'),\n      jsonb_build_object('provider','email','providers',array['email']),\n      'authenticated'\n    ) returning id into v_user_id;\n  else\n    select id into v_user_id from auth.users where email = 'citizen@civigo.local';\n    update auth.users\n    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','citizen')\n    where id = v_user_id;\n  end if;\n\n  update public.profiles\n  set full_name = coalesce(full_name, 'Test Citizen'),\n      nic = coalesce(nic, v_nic),\n      gov_id = coalesce(gov_id, public.generate_gov_id(v_nic)),\n      verified_status = coalesce(verified_status, 'approved')\n  where id = v_user_id;\nend$$",COMMIT}	040_seed_baseline_srilanka
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 3, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointment_documents appointment_documents_appointment_id_document_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_appointment_id_document_id_key UNIQUE (appointment_id, document_id);


--
-- Name: appointment_documents appointment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_pkey PRIMARY KEY (id);


--
-- Name: appointment_feedback appointment_feedback_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_feedback
    ADD CONSTRAINT appointment_feedback_appointment_id_key UNIQUE (appointment_id);


--
-- Name: appointment_feedback appointment_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_feedback
    ADD CONSTRAINT appointment_feedback_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_reference_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_reference_code_key UNIQUE (reference_code);


--
-- Name: branches branches_department_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_department_id_code_key UNIQUE (department_id, code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_storage_path_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_storage_path_key UNIQUE (storage_path);


--
-- Name: identity_verifications identity_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_verifications
    ADD CONSTRAINT identity_verifications_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: officer_assignments officer_assignments_officer_id_department_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_assignments
    ADD CONSTRAINT officer_assignments_officer_id_department_id_key UNIQUE (officer_id, department_id);


--
-- Name: officer_assignments officer_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_assignments
    ADD CONSTRAINT officer_assignments_pkey PRIMARY KEY (id);


--
-- Name: phone_verification_events phone_verification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_verification_events
    ADD CONSTRAINT phone_verification_events_pkey PRIMARY KEY (id);


--
-- Name: phone_verifications phone_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_verifications
    ADD CONSTRAINT phone_verifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_gov_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_gov_id_key UNIQUE (gov_id);


--
-- Name: profiles profiles_nic_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_nic_key UNIQUE (nic);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: service_branch_settings service_branch_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_branch_settings
    ADD CONSTRAINT service_branch_settings_pkey PRIMARY KEY (service_id, branch_id);


--
-- Name: service_slots service_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_pkey PRIMARY KEY (id);


--
-- Name: service_slots service_slots_service_id_slot_at_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_service_id_slot_at_key UNIQUE (service_id, slot_at);


--
-- Name: services services_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_code_key UNIQUE (code);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: service_slots uq_service_slots; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT uq_service_slots UNIQUE (service_id, branch_id, slot_at);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_15 messages_2025_08_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_15
    ADD CONSTRAINT messages_2025_08_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_16 messages_2025_08_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_16
    ADD CONSTRAINT messages_2025_08_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_17 messages_2025_08_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_17
    ADD CONSTRAINT messages_2025_08_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_18 messages_2025_08_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_18
    ADD CONSTRAINT messages_2025_08_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_19 messages_2025_08_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_19
    ADD CONSTRAINT messages_2025_08_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_appointment_documents_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_documents_appointment_id ON public.appointment_documents USING btree (appointment_id);


--
-- Name: idx_appointment_documents_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_documents_document_id ON public.appointment_documents USING btree (document_id);


--
-- Name: idx_appointments_appointment_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_appointment_at ON public.appointments USING btree (appointment_at);


--
-- Name: idx_appointments_assigned_officer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_assigned_officer_id ON public.appointments USING btree (assigned_officer_id);


--
-- Name: idx_appointments_citizen_gov_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_citizen_gov_id ON public.appointments USING btree (citizen_gov_id);


--
-- Name: idx_appointments_citizen_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_citizen_id ON public.appointments USING btree (citizen_id);


--
-- Name: idx_appointments_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_service_id ON public.appointments USING btree (service_id);


--
-- Name: idx_appointments_service_id_appointment_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_service_id_appointment_at ON public.appointments USING btree (service_id, appointment_at);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_branches_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_department ON public.branches USING btree (department_id);


--
-- Name: idx_documents_owner_gov_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_owner_gov_id ON public.documents USING btree (owner_gov_id);


--
-- Name: idx_documents_owner_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_owner_user_id ON public.documents USING btree (owner_user_id);


--
-- Name: idx_identity_verifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_identity_verifications_status ON public.identity_verifications USING btree (status);


--
-- Name: idx_identity_verifications_user_temp_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_identity_verifications_user_temp_id ON public.identity_verifications USING btree (user_temp_id);


--
-- Name: idx_notifications_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_appointment_id ON public.notifications USING btree (appointment_id);


--
-- Name: idx_notifications_status_partial; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_status_partial ON public.notifications USING btree (status) WHERE (status <> 'sent'::text);


--
-- Name: idx_notifications_user_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id_created_at ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_officer_assignments_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_officer_assignments_department_id ON public.officer_assignments USING btree (department_id);


--
-- Name: idx_officer_assignments_officer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_officer_assignments_officer_id ON public.officer_assignments USING btree (officer_id);


--
-- Name: idx_phone_verification_events_phone_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_verification_events_phone_created_at ON public.phone_verification_events USING btree (phone, created_at DESC);


--
-- Name: idx_phone_verification_events_user_temp_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_verification_events_user_temp_id ON public.phone_verification_events USING btree (user_temp_id);


--
-- Name: idx_phone_verifications_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications USING btree (phone);


--
-- Name: idx_phone_verifications_user_temp_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_phone_verifications_user_temp_id ON public.phone_verifications USING btree (user_temp_id);


--
-- Name: idx_profiles_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_profiles_email_unique ON public.profiles USING btree (email);


--
-- Name: idx_profiles_gov_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_profiles_gov_id_unique ON public.profiles USING btree (gov_id);


--
-- Name: idx_profiles_nic_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_profiles_nic_unique ON public.profiles USING btree (nic);


--
-- Name: idx_sbs_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sbs_branch ON public.service_branch_settings USING btree (branch_id);


--
-- Name: idx_service_slots_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_slots_branch_id ON public.service_slots USING btree (branch_id);


--
-- Name: idx_service_slots_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_slots_service_id ON public.service_slots USING btree (service_id);


--
-- Name: idx_service_slots_service_id_slot_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_slots_service_id_slot_at ON public.service_slots USING btree (service_id, slot_at);


--
-- Name: idx_service_slots_slot_at_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_slots_slot_at_desc ON public.service_slots USING btree (slot_at DESC);


--
-- Name: idx_service_slots_svc_branch_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_slots_svc_branch_slot ON public.service_slots USING btree (service_id, branch_id, slot_at);


--
-- Name: idx_services_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_department_id ON public.services USING btree (department_id);


--
-- Name: ux_identity_verifications_user_temp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_identity_verifications_user_temp ON public.identity_verifications USING btree (user_temp_id);


--
-- Name: ux_phone_verifications_user_temp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_phone_verifications_user_temp ON public.phone_verifications USING btree (user_temp_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (bucket_id, name);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_08_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_15_pkey;


--
-- Name: messages_2025_08_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_16_pkey;


--
-- Name: messages_2025_08_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_17_pkey;


--
-- Name: messages_2025_08_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_18_pkey;


--
-- Name: messages_2025_08_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_19_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: appointment_documents appointment_documents_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_documents appointment_documents_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_documents
    ADD CONSTRAINT appointment_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: appointment_feedback appointment_feedback_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_feedback
    ADD CONSTRAINT appointment_feedback_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_assigned_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_assigned_officer_id_fkey FOREIGN KEY (assigned_officer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_citizen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_citizen_id_fkey FOREIGN KEY (citizen_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;


--
-- Name: appointments appointments_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.service_slots(id) ON DELETE SET NULL;


--
-- Name: branches branches_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: documents documents_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: identity_verifications identity_verifications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_verifications
    ADD CONSTRAINT identity_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: officer_assignments officer_assignments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_assignments
    ADD CONSTRAINT officer_assignments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: officer_assignments officer_assignments_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_assignments
    ADD CONSTRAINT officer_assignments_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: service_branch_settings service_branch_settings_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_branch_settings
    ADD CONSTRAINT service_branch_settings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: service_branch_settings service_branch_settings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_branch_settings
    ADD CONSTRAINT service_branch_settings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_slots service_slots_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: service_slots service_slots_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- Name: service_slots service_slots_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_slots
    ADD CONSTRAINT service_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services services_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: iceberg_namespaces iceberg_namespaces_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications Officers can insert notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Officers can insert notifications" ON public.notifications FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'officer'::text)))));


--
-- Name: notifications Officers can read department notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Officers can read department notifications" ON public.notifications FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (((public.profiles p
     JOIN public.officer_assignments oa ON ((oa.officer_id = p.id)))
     JOIN public.appointments a ON ((a.id = notifications.appointment_id)))
     JOIN public.services s ON ((s.id = a.service_id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'officer'::text) AND (oa.department_id = s.department_id) AND (oa.active = true)))));


--
-- Name: notifications Service role can insert notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT WITH CHECK ((CURRENT_USER = 'service_role'::name));


--
-- Name: notifications Service role can read all notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role can read all notifications" ON public.notifications FOR SELECT USING ((CURRENT_USER = 'service_role'::name));


--
-- Name: notifications Users can read own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: appointment_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointment_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: appointment_feedback; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointment_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_admin_all ON public.appointments USING ((public.current_user_role() = 'admin'::text));


--
-- Name: appointments appointments_citizen_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_citizen_insert ON public.appointments FOR INSERT WITH CHECK ((citizen_id = auth.uid()));


--
-- Name: appointments appointments_citizen_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_citizen_select ON public.appointments FOR SELECT USING ((citizen_id = auth.uid()));


--
-- Name: appointments appointments_citizen_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_citizen_update ON public.appointments FOR UPDATE USING ((citizen_id = auth.uid())) WITH CHECK ((citizen_id = auth.uid()));


--
-- Name: appointments appointments_officer_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_officer_read ON public.appointments FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.departments d ON ((d.id = s.department_id)))
     JOIN public.officer_assignments oa ON ((oa.department_id = d.id)))
  WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: appointments appointments_officer_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_officer_update ON public.appointments FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.departments d ON ((d.id = s.department_id)))
     JOIN public.officer_assignments oa ON ((oa.department_id = d.id)))
  WHERE ((s.id = appointments.service_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: appointment_documents appt_docs_officer_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appt_docs_officer_read ON public.appointment_documents FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((public.appointments ap
     JOIN public.services s ON ((s.id = ap.service_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
  WHERE (ap.id = appointment_documents.appointment_id))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: appointment_documents appt_docs_owner_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appt_docs_owner_delete ON public.appointment_documents FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_documents.appointment_id) AND (a.citizen_id = auth.uid())))));


--
-- Name: appointment_documents appt_docs_owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appt_docs_owner_insert ON public.appointment_documents FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_documents.appointment_id) AND (a.citizen_id = auth.uid())))));


--
-- Name: appointment_documents appt_docs_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appt_docs_owner_select ON public.appointment_documents FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_documents.appointment_id) AND (a.citizen_id = auth.uid())))));


--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: branches branches_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY branches_admin_all ON public.branches USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: branches branches_auth_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY branches_auth_select ON public.branches FOR SELECT TO authenticated USING (true);


--
-- Name: branches branches_officer_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY branches_officer_write ON public.branches USING ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = branches.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = branches.department_id) AND (oa.officer_id = auth.uid()) AND oa.active))));


--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_admin_all ON public.departments USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: departments departments_auth_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_auth_select ON public.departments FOR SELECT TO authenticated USING (true);


--
-- Name: departments departments_officer_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_officer_update ON public.departments FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = departments.id) AND (oa.officer_id = auth.uid()) AND oa.active)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = departments.id) AND (oa.officer_id = auth.uid()) AND oa.active))));


--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY documents_admin_all ON public.documents USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: documents documents_officer_read_scope; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY documents_officer_read_scope ON public.documents FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (((public.appointment_documents ad
     JOIN public.appointments ap ON ((ap.id = ad.appointment_id)))
     JOIN public.services s ON ((s.id = ap.service_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
  WHERE (ad.document_id = documents.id))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: documents documents_owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY documents_owner_insert ON public.documents FOR INSERT WITH CHECK ((owner_user_id = auth.uid()));


--
-- Name: documents documents_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY documents_owner_select ON public.documents FOR SELECT USING ((owner_user_id = auth.uid()));


--
-- Name: documents documents_owner_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY documents_owner_update ON public.documents FOR UPDATE USING ((owner_user_id = auth.uid())) WITH CHECK ((owner_user_id = auth.uid()));


--
-- Name: appointment_feedback feedback_citizen_rw; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY feedback_citizen_rw ON public.appointment_feedback USING ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_feedback.appointment_id) AND (a.citizen_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = appointment_feedback.appointment_id) AND (a.citizen_id = auth.uid())))));


--
-- Name: appointment_feedback feedback_officer_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY feedback_officer_read ON public.appointment_feedback FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((public.appointments ap
     JOIN public.services s ON ((s.id = ap.service_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
  WHERE (ap.id = appointment_feedback.appointment_id))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: identity_verifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: identity_verifications idv_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY idv_admin_all ON public.identity_verifications USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: identity_verifications idv_owner_rw; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY idv_owner_rw ON public.identity_verifications USING ((user_temp_id = auth.uid())) WITH CHECK ((user_temp_id = auth.uid()));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_admin_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_admin_select ON public.notifications FOR SELECT USING ((public.current_user_role() = 'admin'::text));


--
-- Name: notifications notifications_user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_user_select ON public.notifications FOR SELECT USING (((user_id = auth.uid()) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: officer_assignments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.officer_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: officer_assignments officer_assignments_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY officer_assignments_admin_all ON public.officer_assignments USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: officer_assignments officer_assignments_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY officer_assignments_self_select ON public.officer_assignments FOR SELECT USING (((officer_id = auth.uid()) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: phone_verifications phone_admin_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_admin_read ON public.phone_verifications FOR SELECT USING ((public.current_user_role() = 'admin'::text));


--
-- Name: phone_verification_events phone_events_admin_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_events_admin_read ON public.phone_verification_events FOR SELECT USING ((public.current_user_role() = 'admin'::text));


--
-- Name: phone_verification_events phone_events_owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_events_owner_insert ON public.phone_verification_events FOR INSERT WITH CHECK ((user_temp_id = auth.uid()));


--
-- Name: phone_verification_events phone_events_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_events_owner_select ON public.phone_verification_events FOR SELECT USING ((user_temp_id = auth.uid()));


--
-- Name: phone_verifications phone_owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_owner_insert ON public.phone_verifications FOR INSERT WITH CHECK ((user_temp_id = auth.uid()));


--
-- Name: phone_verifications phone_owner_rw; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_owner_rw ON public.phone_verifications USING ((user_temp_id = auth.uid())) WITH CHECK ((user_temp_id = auth.uid()));


--
-- Name: phone_verifications phone_owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_owner_select ON public.phone_verifications FOR SELECT USING ((user_temp_id = auth.uid()));


--
-- Name: phone_verifications phone_owner_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY phone_owner_update ON public.phone_verifications FOR UPDATE USING ((user_temp_id = auth.uid())) WITH CHECK ((user_temp_id = auth.uid()));


--
-- Name: phone_verification_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.phone_verification_events ENABLE ROW LEVEL SECURITY;

--
-- Name: phone_verifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_admin_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_admin_select ON public.profiles FOR SELECT USING ((public.current_user_role() = 'admin'::text));


--
-- Name: profiles profiles_admin_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: profiles profiles_officer_read_appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_officer_read_appointments ON public.profiles FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((public.appointments ap
     JOIN public.services s ON ((s.id = ap.service_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))
  WHERE (ap.citizen_id = profiles.id))) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: profiles profiles_self_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_self_insert ON public.profiles FOR INSERT WITH CHECK ((id = auth.uid()));


--
-- Name: profiles profiles_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_self_select ON public.profiles FOR SELECT USING (((auth.uid() = id) OR (public.current_user_role() = 'admin'::text)));


--
-- Name: service_branch_settings sbs_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sbs_admin_all ON public.service_branch_settings USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: service_branch_settings sbs_officer_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sbs_officer_write ON public.service_branch_settings USING ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_branch_settings.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_branch_settings.service_id) AND (b.department_id = s.department_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_branch_settings.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_branch_settings.service_id) AND (b.department_id = s.department_id)))));


--
-- Name: service_branch_settings sbs_public_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sbs_public_select ON public.service_branch_settings FOR SELECT USING (true);


--
-- Name: service_branch_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_branch_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: service_branch_settings service_branch_settings_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_branch_settings_admin_all ON public.service_branch_settings USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: service_slots; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.service_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: service_slots service_slots_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_admin_all ON public.service_slots USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: service_slots service_slots_citizen_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_citizen_select ON public.service_slots FOR SELECT TO authenticated USING (((active = true) AND (slot_at >= now()) AND (EXISTS ( SELECT 1
   FROM public.service_branch_settings sbs
  WHERE ((sbs.service_id = service_slots.service_id) AND (sbs.branch_id = service_slots.branch_id) AND (sbs.enabled = true))))));


--
-- Name: service_slots service_slots_officer_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_officer_delete ON public.service_slots FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_slots.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_slots.service_id) AND (b.department_id = s.department_id)))));


--
-- Name: service_slots service_slots_officer_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_officer_insert ON public.service_slots FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_slots.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_slots.service_id) AND (b.department_id = s.department_id)))));


--
-- Name: service_slots service_slots_officer_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_officer_select ON public.service_slots FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_slots.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_slots.service_id) AND (b.department_id = s.department_id)))));


--
-- Name: service_slots service_slots_officer_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_slots_officer_update ON public.service_slots FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_slots.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_slots.service_id) AND (b.department_id = s.department_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.services s
     JOIN public.branches b ON ((b.id = service_slots.branch_id)))
     JOIN public.officer_assignments oa ON (((oa.department_id = s.department_id) AND (oa.officer_id = auth.uid()) AND oa.active)))
  WHERE ((s.id = service_slots.service_id) AND (b.department_id = s.department_id)))));


--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: services services_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_admin_all ON public.services USING ((public.current_user_role() = 'admin'::text)) WITH CHECK ((public.current_user_role() = 'admin'::text));


--
-- Name: services services_auth_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_auth_select ON public.services FOR SELECT TO authenticated USING (true);


--
-- Name: services services_officer_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_officer_delete ON public.services FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = services.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))));


--
-- Name: services services_officer_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_officer_insert ON public.services FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = services.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))));


--
-- Name: services services_officer_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_officer_read ON public.services FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = services.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))));


--
-- Name: services services_officer_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY services_officer_update ON public.services FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = services.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.department_id = services.department_id) AND (oa.officer_id = auth.uid()) AND (oa.active = true)))));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: objects departments admin all; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments admin all" ON storage.objects USING (((bucket_id = 'departments'::text) AND (public.current_app_role() = 'admin'::text))) WITH CHECK (((bucket_id = 'departments'::text) AND (public.current_app_role() = 'admin'::text)));


--
-- Name: objects departments auth read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments auth read" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'departments'::text));


--
-- Name: objects departments officers delete; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments officers delete" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'departments'::text) AND ((public.current_app_role() = 'admin'::text) OR (EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.officer_id = auth.uid()) AND oa.active))))));


--
-- Name: objects departments officers update files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments officers update files" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'departments'::text) AND ((storage.foldername(name))[1] = 'files'::text) AND (EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.officer_id = auth.uid()) AND oa.active)))));


--
-- Name: objects departments officers update logos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments officers update logos" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'departments'::text) AND ((storage.foldername(name))[1] = 'logos'::text) AND (EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.officer_id = auth.uid()) AND oa.active)))));


--
-- Name: objects departments officers write files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments officers write files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'departments'::text) AND ((storage.foldername(name))[1] = 'files'::text) AND (EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.officer_id = auth.uid()) AND oa.active)))));


--
-- Name: objects departments officers write logos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments officers write logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'departments'::text) AND ((storage.foldername(name))[1] = 'logos'::text) AND (EXISTS ( SELECT 1
   FROM public.officer_assignments oa
  WHERE ((oa.officer_id = auth.uid()) AND oa.active)))));


--
-- Name: objects departments public read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "departments public read" ON storage.objects FOR SELECT USING ((bucket_id = 'departments'::text));


--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects nic-media admin all; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "nic-media admin all" ON storage.objects USING (((bucket_id = 'nic-media'::text) AND (public.current_app_role() = 'admin'::text))) WITH CHECK (((bucket_id = 'nic-media'::text) AND (public.current_app_role() = 'admin'::text)));


--
-- Name: objects nic-media owner insert; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "nic-media owner insert" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'nic-media'::text) AND (((storage.foldername(name))[1] = 'user'::text) AND ((storage.foldername(name))[2] = (auth.uid())::text))));


--
-- Name: objects nic-media owner read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "nic-media owner read" ON storage.objects FOR SELECT USING ((((bucket_id = 'nic-media'::text) AND (((storage.foldername(name))[1] = 'user'::text) AND ((storage.foldername(name))[2] = (auth.uid())::text))) OR (public.current_app_role() = 'admin'::text)));


--
-- Name: objects nic-media owner update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "nic-media owner update" ON storage.objects FOR UPDATE USING (((bucket_id = 'nic-media'::text) AND (((storage.foldername(name))[1] = 'user'::text) AND ((storage.foldername(name))[2] = (auth.uid())::text))));


--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text) TO anon;
GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text) TO service_role;


--
-- Name: FUNCTION book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text, p_citizen_gov_id text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text, p_citizen_gov_id text) TO anon;
GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text, p_citizen_gov_id text) TO authenticated;
GRANT ALL ON FUNCTION public.book_appointment_slot(p_slot_id uuid, p_citizen_id uuid, p_notes text, p_citizen_gov_id text) TO service_role;


--
-- Name: FUNCTION current_app_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_app_role() TO anon;
GRANT ALL ON FUNCTION public.current_app_role() TO authenticated;
GRANT ALL ON FUNCTION public.current_app_role() TO service_role;


--
-- Name: FUNCTION current_user_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_user_role() TO anon;
GRANT ALL ON FUNCTION public.current_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.current_user_role() TO service_role;


--
-- Name: FUNCTION generate_gov_id(p_nic text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_gov_id(p_nic text) TO anon;
GRANT ALL ON FUNCTION public.generate_gov_id(p_nic text) TO authenticated;
GRANT ALL ON FUNCTION public.generate_gov_id(p_nic text) TO service_role;


--
-- Name: FUNCTION handle_new_auth_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_auth_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_auth_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_auth_user() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE appointment_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointment_documents TO anon;
GRANT ALL ON TABLE public.appointment_documents TO authenticated;
GRANT ALL ON TABLE public.appointment_documents TO service_role;


--
-- Name: TABLE appointment_feedback; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointment_feedback TO anon;
GRANT ALL ON TABLE public.appointment_feedback TO authenticated;
GRANT ALL ON TABLE public.appointment_feedback TO service_role;


--
-- Name: TABLE appointments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointments TO anon;
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO service_role;


--
-- Name: TABLE branches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.branches TO anon;
GRANT ALL ON TABLE public.branches TO authenticated;
GRANT ALL ON TABLE public.branches TO service_role;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.documents TO anon;
GRANT ALL ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.documents TO service_role;


--
-- Name: TABLE identity_verifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.identity_verifications TO anon;
GRANT ALL ON TABLE public.identity_verifications TO authenticated;
GRANT ALL ON TABLE public.identity_verifications TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE officer_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.officer_assignments TO anon;
GRANT ALL ON TABLE public.officer_assignments TO authenticated;
GRANT ALL ON TABLE public.officer_assignments TO service_role;


--
-- Name: TABLE phone_verification_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.phone_verification_events TO anon;
GRANT ALL ON TABLE public.phone_verification_events TO authenticated;
GRANT ALL ON TABLE public.phone_verification_events TO service_role;


--
-- Name: TABLE phone_verifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.phone_verifications TO anon;
GRANT ALL ON TABLE public.phone_verifications TO authenticated;
GRANT ALL ON TABLE public.phone_verifications TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE service_branch_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.service_branch_settings TO anon;
GRANT ALL ON TABLE public.service_branch_settings TO authenticated;
GRANT ALL ON TABLE public.service_branch_settings TO service_role;


--
-- Name: TABLE service_slots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.service_slots TO anon;
GRANT ALL ON TABLE public.service_slots TO authenticated;
GRANT ALL ON TABLE public.service_slots TO service_role;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_08_15; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_15 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_15 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_16; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_16 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_16 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_17 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_18; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_18 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_19; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_19 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict FxuBslDmIHgfDMvOK4a0BbDLcOQnVrPKIo0hjGYnRlPkXjGwKcBxQnXGfTzlL0w

