

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text" DEFAULT NULL::"text", "p_citizen_gov_id" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text", "p_citizen_gov_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_app_role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'citizen');
$$;


ALTER FUNCTION "public"."current_app_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'citizen'
  );
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_gov_id"("p_nic" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
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


ALTER FUNCTION "public"."generate_gov_id"("p_nic" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check for role in user_metadata first, then app_metadata, then default to citizen
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::text,
      (NEW.raw_app_meta_data->>'role')::text,
      'citizen'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL
);


ALTER TABLE "public"."appointment_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "media" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "appointment_feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."appointment_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "citizen_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "assigned_officer_id" "uuid",
    "appointment_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'booked'::"text" NOT NULL,
    "checked_in_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "no_show" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reference_code" "text" GENERATED ALWAYS AS ("substr"("md5"(("id")::"text"), 1, 10)) STORED,
    "slot_id" "uuid",
    "citizen_gov_id" "text",
    "confirmed_at" timestamp with time zone,
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['booked'::"text", 'confirmed'::"text", 'cancelled'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."appointments"."confirmed_at" IS 'Timestamp when the appointment was confirmed by the citizen or system';



CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "location_lat" double precision,
    "location_lng" double precision,
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "logo_path" "text",
    "description_richtext" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "description_updated_at" timestamp with time zone
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "mime_type" "text",
    "size_bytes" bigint,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_gov_id" "text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_temp_id" "uuid" NOT NULL,
    "nic" "text" NOT NULL,
    "nic_front_path" "text",
    "nic_back_path" "text",
    "face_capture_path" "text",
    "status" "text" DEFAULT 'initiated'::"text" NOT NULL,
    "score" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    CONSTRAINT "identity_verifications_status_check" CHECK (("status" = ANY (ARRAY['initiated'::"text", 'phone_verified'::"text", 'pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."identity_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "channel" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "sent_at" timestamp with time zone,
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_channel_check" CHECK (("channel" = ANY (ARRAY['email'::"text", 'sms'::"text", 'inapp'::"text"]))),
    CONSTRAINT "notifications_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'sent'::"text", 'failed'::"text"]))),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['booking_confirmation'::"text", 'reminder'::"text", 'status_update'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."officer_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "officer_id" "uuid" NOT NULL,
    "department_id" "uuid" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."officer_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phone_verification_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_temp_id" "uuid" NOT NULL,
    "phone" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."phone_verification_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phone_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_temp_id" "uuid" NOT NULL,
    "phone" "text" NOT NULL,
    "otp_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone
);


ALTER TABLE "public"."phone_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'citizen'::"text" NOT NULL,
    "full_name" "text",
    "email" "text",
    "nic" "text",
    "verified_status" "text" DEFAULT 'unverified'::"text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gov_id" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['citizen'::"text", 'officer'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_branch_settings" (
    "service_id" "uuid" NOT NULL,
    "branch_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_branch_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "slot_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 15 NOT NULL,
    "capacity" integer DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "branch_id" "uuid" NOT NULL,
    CONSTRAINT "service_slots_capacity_check" CHECK ((("capacity" >= 1) AND ("capacity" <= 100))),
    CONSTRAINT "service_slots_duration_minutes_check" CHECK ((("duration_minutes" >= 5) AND ("duration_minutes" <= 240)))
);


ALTER TABLE "public"."service_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "instructions_richtext" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "instructions_pdf_path" "text",
    "instructions_updated_at" timestamp with time zone
);


ALTER TABLE "public"."services" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointment_documents"
    ADD CONSTRAINT "appointment_documents_appointment_id_document_id_key" UNIQUE ("appointment_id", "document_id");



ALTER TABLE ONLY "public"."appointment_documents"
    ADD CONSTRAINT "appointment_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_feedback"
    ADD CONSTRAINT "appointment_feedback_appointment_id_key" UNIQUE ("appointment_id");



ALTER TABLE ONLY "public"."appointment_feedback"
    ADD CONSTRAINT "appointment_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_reference_code_key" UNIQUE ("reference_code");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_department_id_code_key" UNIQUE ("department_id", "code");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_storage_path_key" UNIQUE ("storage_path");



ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."officer_assignments"
    ADD CONSTRAINT "officer_assignments_officer_id_department_id_key" UNIQUE ("officer_id", "department_id");



ALTER TABLE ONLY "public"."officer_assignments"
    ADD CONSTRAINT "officer_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phone_verification_events"
    ADD CONSTRAINT "phone_verification_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phone_verifications"
    ADD CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_gov_id_key" UNIQUE ("gov_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_nic_key" UNIQUE ("nic");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_branch_settings"
    ADD CONSTRAINT "service_branch_settings_pkey" PRIMARY KEY ("service_id", "branch_id");



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "service_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "service_slots_service_id_slot_at_key" UNIQUE ("service_id", "slot_at");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "uq_service_slots" UNIQUE ("service_id", "branch_id", "slot_at");



CREATE INDEX "idx_appointment_documents_appointment_id" ON "public"."appointment_documents" USING "btree" ("appointment_id");



CREATE INDEX "idx_appointment_documents_document_id" ON "public"."appointment_documents" USING "btree" ("document_id");



CREATE INDEX "idx_appointments_appointment_at" ON "public"."appointments" USING "btree" ("appointment_at");



CREATE INDEX "idx_appointments_assigned_officer_id" ON "public"."appointments" USING "btree" ("assigned_officer_id");



CREATE INDEX "idx_appointments_citizen_gov_id" ON "public"."appointments" USING "btree" ("citizen_gov_id");



CREATE INDEX "idx_appointments_citizen_id" ON "public"."appointments" USING "btree" ("citizen_id");



CREATE INDEX "idx_appointments_service_id" ON "public"."appointments" USING "btree" ("service_id");



CREATE INDEX "idx_appointments_service_id_appointment_at" ON "public"."appointments" USING "btree" ("service_id", "appointment_at");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_branches_department" ON "public"."branches" USING "btree" ("department_id");



CREATE INDEX "idx_documents_owner_gov_id" ON "public"."documents" USING "btree" ("owner_gov_id");



CREATE INDEX "idx_documents_owner_user_id" ON "public"."documents" USING "btree" ("owner_user_id");



CREATE INDEX "idx_identity_verifications_status" ON "public"."identity_verifications" USING "btree" ("status");



CREATE INDEX "idx_identity_verifications_user_temp_id" ON "public"."identity_verifications" USING "btree" ("user_temp_id");



CREATE INDEX "idx_notifications_appointment_id" ON "public"."notifications" USING "btree" ("appointment_id");



CREATE INDEX "idx_notifications_status_partial" ON "public"."notifications" USING "btree" ("status") WHERE ("status" <> 'sent'::"text");



CREATE INDEX "idx_notifications_user_id_created_at" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_officer_assignments_department_id" ON "public"."officer_assignments" USING "btree" ("department_id");



CREATE INDEX "idx_officer_assignments_officer_id" ON "public"."officer_assignments" USING "btree" ("officer_id");



CREATE INDEX "idx_phone_verification_events_phone_created_at" ON "public"."phone_verification_events" USING "btree" ("phone", "created_at" DESC);



CREATE INDEX "idx_phone_verification_events_user_temp_id" ON "public"."phone_verification_events" USING "btree" ("user_temp_id");



CREATE INDEX "idx_phone_verifications_phone" ON "public"."phone_verifications" USING "btree" ("phone");



CREATE INDEX "idx_phone_verifications_user_temp_id" ON "public"."phone_verifications" USING "btree" ("user_temp_id");



CREATE UNIQUE INDEX "idx_profiles_email_unique" ON "public"."profiles" USING "btree" ("email");



CREATE UNIQUE INDEX "idx_profiles_gov_id_unique" ON "public"."profiles" USING "btree" ("gov_id");



CREATE UNIQUE INDEX "idx_profiles_nic_unique" ON "public"."profiles" USING "btree" ("nic");



CREATE INDEX "idx_sbs_branch" ON "public"."service_branch_settings" USING "btree" ("branch_id");



CREATE INDEX "idx_service_slots_branch_id" ON "public"."service_slots" USING "btree" ("branch_id");



CREATE INDEX "idx_service_slots_service_id" ON "public"."service_slots" USING "btree" ("service_id");



CREATE INDEX "idx_service_slots_service_id_slot_at" ON "public"."service_slots" USING "btree" ("service_id", "slot_at");



CREATE INDEX "idx_service_slots_slot_at_desc" ON "public"."service_slots" USING "btree" ("slot_at" DESC);



CREATE INDEX "idx_service_slots_svc_branch_slot" ON "public"."service_slots" USING "btree" ("service_id", "branch_id", "slot_at");



CREATE INDEX "idx_services_department_id" ON "public"."services" USING "btree" ("department_id");



CREATE UNIQUE INDEX "ux_identity_verifications_user_temp" ON "public"."identity_verifications" USING "btree" ("user_temp_id");



CREATE UNIQUE INDEX "ux_phone_verifications_user_temp" ON "public"."phone_verifications" USING "btree" ("user_temp_id");



ALTER TABLE ONLY "public"."appointment_documents"
    ADD CONSTRAINT "appointment_documents_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_documents"
    ADD CONSTRAINT "appointment_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_feedback"
    ADD CONSTRAINT "appointment_feedback_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."service_slots"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "identity_verifications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."officer_assignments"
    ADD CONSTRAINT "officer_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."officer_assignments"
    ADD CONSTRAINT "officer_assignments_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_branch_settings"
    ADD CONSTRAINT "service_branch_settings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_branch_settings"
    ADD CONSTRAINT "service_branch_settings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "service_slots_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "service_slots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."service_slots"
    ADD CONSTRAINT "service_slots_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



CREATE POLICY "Officers can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'officer'::"text")))));



CREATE POLICY "Officers can read department notifications" ON "public"."notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."officer_assignments" "oa" ON (("oa"."officer_id" = "p"."id")))
     JOIN "public"."appointments" "a" ON (("a"."id" = "notifications"."appointment_id")))
     JOIN "public"."services" "s" ON (("s"."id" = "a"."service_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'officer'::"text") AND ("oa"."department_id" = "s"."department_id") AND ("oa"."active" = true)))));



CREATE POLICY "Service role can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((CURRENT_USER = 'service_role'::"name"));



CREATE POLICY "Service role can read all notifications" ON "public"."notifications" FOR SELECT USING ((CURRENT_USER = 'service_role'::"name"));



CREATE POLICY "Users can read own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."appointment_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointments_admin_all" ON "public"."appointments" USING (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "appointments_citizen_insert" ON "public"."appointments" FOR INSERT WITH CHECK (("citizen_id" = "auth"."uid"()));



CREATE POLICY "appointments_citizen_select" ON "public"."appointments" FOR SELECT USING (("citizen_id" = "auth"."uid"()));



CREATE POLICY "appointments_citizen_update" ON "public"."appointments" FOR UPDATE USING (("citizen_id" = "auth"."uid"())) WITH CHECK (("citizen_id" = "auth"."uid"()));



CREATE POLICY "appointments_officer_read" ON "public"."appointments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."departments" "d" ON (("d"."id" = "s"."department_id")))
     JOIN "public"."officer_assignments" "oa" ON (("oa"."department_id" = "d"."id")))
  WHERE (("s"."id" = "appointments"."service_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "appointments_officer_update" ON "public"."appointments" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."departments" "d" ON (("d"."id" = "s"."department_id")))
     JOIN "public"."officer_assignments" "oa" ON (("oa"."department_id" = "d"."id")))
  WHERE (("s"."id" = "appointments"."service_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "appt_docs_officer_read" ON "public"."appointment_documents" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."appointments" "ap"
     JOIN "public"."services" "s" ON (("s"."id" = "ap"."service_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true))))
  WHERE ("ap"."id" = "appointment_documents"."appointment_id"))) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "appt_docs_owner_delete" ON "public"."appointment_documents" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_documents"."appointment_id") AND ("a"."citizen_id" = "auth"."uid"())))));



CREATE POLICY "appt_docs_owner_insert" ON "public"."appointment_documents" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_documents"."appointment_id") AND ("a"."citizen_id" = "auth"."uid"())))));



CREATE POLICY "appt_docs_owner_select" ON "public"."appointment_documents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_documents"."appointment_id") AND ("a"."citizen_id" = "auth"."uid"())))));



ALTER TABLE "public"."branches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "branches_admin_all" ON "public"."branches" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "branches_auth_select" ON "public"."branches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "branches_officer_write" ON "public"."branches" USING ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "branches"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "branches"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active"))));



ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "departments_admin_all" ON "public"."departments" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "departments_auth_select" ON "public"."departments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "departments_officer_update" ON "public"."departments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "departments"."id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "departments"."id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active"))));



ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "documents_admin_all" ON "public"."documents" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "documents_officer_read_scope" ON "public"."documents" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ((("public"."appointment_documents" "ad"
     JOIN "public"."appointments" "ap" ON (("ap"."id" = "ad"."appointment_id")))
     JOIN "public"."services" "s" ON (("s"."id" = "ap"."service_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true))))
  WHERE ("ad"."document_id" = "documents"."id"))) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "documents_owner_insert" ON "public"."documents" FOR INSERT WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "documents_owner_select" ON "public"."documents" FOR SELECT USING (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "documents_owner_update" ON "public"."documents" FOR UPDATE USING (("owner_user_id" = "auth"."uid"())) WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "feedback_citizen_rw" ON "public"."appointment_feedback" USING ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_feedback"."appointment_id") AND ("a"."citizen_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."id" = "appointment_feedback"."appointment_id") AND ("a"."citizen_id" = "auth"."uid"())))));



CREATE POLICY "feedback_officer_read" ON "public"."appointment_feedback" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."appointments" "ap"
     JOIN "public"."services" "s" ON (("s"."id" = "ap"."service_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true))))
  WHERE ("ap"."id" = "appointment_feedback"."appointment_id"))) OR ("public"."current_user_role"() = 'admin'::"text")));



ALTER TABLE "public"."identity_verifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "idv_admin_all" ON "public"."identity_verifications" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "idv_owner_rw" ON "public"."identity_verifications" USING (("user_temp_id" = "auth"."uid"())) WITH CHECK (("user_temp_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_admin_select" ON "public"."notifications" FOR SELECT USING (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "notifications_user_select" ON "public"."notifications" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("public"."current_user_role"() = 'admin'::"text")));



ALTER TABLE "public"."officer_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "officer_assignments_admin_all" ON "public"."officer_assignments" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "officer_assignments_self_select" ON "public"."officer_assignments" FOR SELECT USING ((("officer_id" = "auth"."uid"()) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "phone_admin_read" ON "public"."phone_verifications" FOR SELECT USING (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "phone_events_admin_read" ON "public"."phone_verification_events" FOR SELECT USING (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "phone_events_owner_insert" ON "public"."phone_verification_events" FOR INSERT WITH CHECK (("user_temp_id" = "auth"."uid"()));



CREATE POLICY "phone_events_owner_select" ON "public"."phone_verification_events" FOR SELECT USING (("user_temp_id" = "auth"."uid"()));



CREATE POLICY "phone_owner_insert" ON "public"."phone_verifications" FOR INSERT WITH CHECK (("user_temp_id" = "auth"."uid"()));



CREATE POLICY "phone_owner_rw" ON "public"."phone_verifications" USING (("user_temp_id" = "auth"."uid"())) WITH CHECK (("user_temp_id" = "auth"."uid"()));



CREATE POLICY "phone_owner_select" ON "public"."phone_verifications" FOR SELECT USING (("user_temp_id" = "auth"."uid"()));



CREATE POLICY "phone_owner_update" ON "public"."phone_verifications" FOR UPDATE USING (("user_temp_id" = "auth"."uid"())) WITH CHECK (("user_temp_id" = "auth"."uid"()));



ALTER TABLE "public"."phone_verification_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phone_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_select" ON "public"."profiles" FOR SELECT USING (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "profiles_admin_update" ON "public"."profiles" FOR UPDATE USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "profiles_officer_read_appointments" ON "public"."profiles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."appointments" "ap"
     JOIN "public"."services" "s" ON (("s"."id" = "ap"."service_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true))))
  WHERE ("ap"."citizen_id" = "profiles"."id"))) OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "profiles_self_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_self_select" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR ("public"."current_user_role"() = 'admin'::"text")));



CREATE POLICY "sbs_admin_all" ON "public"."service_branch_settings" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "sbs_officer_write" ON "public"."service_branch_settings" USING ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_branch_settings"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_branch_settings"."service_id") AND ("b"."department_id" = "s"."department_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_branch_settings"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_branch_settings"."service_id") AND ("b"."department_id" = "s"."department_id")))));



CREATE POLICY "sbs_public_select" ON "public"."service_branch_settings" FOR SELECT USING (true);



ALTER TABLE "public"."service_branch_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_branch_settings_admin_all" ON "public"."service_branch_settings" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



ALTER TABLE "public"."service_slots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_slots_admin_all" ON "public"."service_slots" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "service_slots_citizen_select" ON "public"."service_slots" FOR SELECT TO "authenticated" USING ((("active" = true) AND ("slot_at" >= "now"()) AND (EXISTS ( SELECT 1
   FROM "public"."service_branch_settings" "sbs"
  WHERE (("sbs"."service_id" = "service_slots"."service_id") AND ("sbs"."branch_id" = "service_slots"."branch_id") AND ("sbs"."enabled" = true))))));



CREATE POLICY "service_slots_officer_delete" ON "public"."service_slots" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_slots"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_slots"."service_id") AND ("b"."department_id" = "s"."department_id")))));



CREATE POLICY "service_slots_officer_insert" ON "public"."service_slots" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_slots"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_slots"."service_id") AND ("b"."department_id" = "s"."department_id")))));



CREATE POLICY "service_slots_officer_select" ON "public"."service_slots" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_slots"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_slots"."service_id") AND ("b"."department_id" = "s"."department_id")))));



CREATE POLICY "service_slots_officer_update" ON "public"."service_slots" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_slots"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_slots"."service_id") AND ("b"."department_id" = "s"."department_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."services" "s"
     JOIN "public"."branches" "b" ON (("b"."id" = "service_slots"."branch_id")))
     JOIN "public"."officer_assignments" "oa" ON ((("oa"."department_id" = "s"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND "oa"."active")))
  WHERE (("s"."id" = "service_slots"."service_id") AND ("b"."department_id" = "s"."department_id")))));



ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "services_admin_all" ON "public"."services" USING (("public"."current_user_role"() = 'admin'::"text")) WITH CHECK (("public"."current_user_role"() = 'admin'::"text"));



CREATE POLICY "services_auth_select" ON "public"."services" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "services_officer_delete" ON "public"."services" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "services"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))));



CREATE POLICY "services_officer_insert" ON "public"."services" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "services"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))));



CREATE POLICY "services_officer_read" ON "public"."services" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "services"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))));



CREATE POLICY "services_officer_update" ON "public"."services" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "services"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."officer_assignments" "oa"
  WHERE (("oa"."department_id" = "services"."department_id") AND ("oa"."officer_id" = "auth"."uid"()) AND ("oa"."active" = true)))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text", "p_citizen_gov_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text", "p_citizen_gov_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."book_appointment_slot"("p_slot_id" "uuid", "p_citizen_id" "uuid", "p_notes" "text", "p_citizen_gov_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_app_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_app_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_app_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_gov_id"("p_nic" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_gov_id"("p_nic" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_gov_id"("p_nic" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointment_documents" TO "anon";
GRANT ALL ON TABLE "public"."appointment_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_documents" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_feedback" TO "anon";
GRANT ALL ON TABLE "public"."appointment_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."identity_verifications" TO "anon";
GRANT ALL ON TABLE "public"."identity_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."officer_assignments" TO "anon";
GRANT ALL ON TABLE "public"."officer_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."officer_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."phone_verification_events" TO "anon";
GRANT ALL ON TABLE "public"."phone_verification_events" TO "authenticated";
GRANT ALL ON TABLE "public"."phone_verification_events" TO "service_role";



GRANT ALL ON TABLE "public"."phone_verifications" TO "anon";
GRANT ALL ON TABLE "public"."phone_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."phone_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."service_branch_settings" TO "anon";
GRANT ALL ON TABLE "public"."service_branch_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."service_branch_settings" TO "service_role";



GRANT ALL ON TABLE "public"."service_slots" TO "anon";
GRANT ALL ON TABLE "public"."service_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."service_slots" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
