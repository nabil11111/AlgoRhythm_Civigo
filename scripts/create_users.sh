#!/usr/bin/env bash
set -euo pipefail

# Create admin, officer, and citizen users via Supabase Auth admin API
# - Auto-detects SERVICE_ROLE key from environment or docker-compose.yml
# - Defaults to http://localhost:54321 for the API base URL
# - Sets citizen NIC in public.profiles

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}/.."
DOCKER_COMPOSE_FILE="${REPO_ROOT}/docker-compose.yml"

BASE_URL="${SUPABASE_URL:-http://localhost:54321}"
PASSWORD="12345678"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' not found. Please install it." >&2
    exit 1
  fi
}

require curl
require sed
require awk
require tr
require jq

extract_key_from_compose() {
  local key_name="$1"
  if [[ -f "${DOCKER_COMPOSE_FILE}" ]]; then
    # Find the first occurrence of KEY: <jwt>
    # Trim quotes/spaces
    awk -v key="${key_name}:" '$0 ~ key {print $0; exit}' "${DOCKER_COMPOSE_FILE}" \
      | awk -F": " '{print $2}' \
      | tr -d '"' \
      | tr -d '\r' \
      | tr -d '\n'
  fi
}

resolve_service_role_key() {
  # Priority: env var -> compose SUPABASE_SERVICE_ROLE_KEY -> SUPABASE_SERVICE_KEY -> SERVICE_KEY
  if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
    echo -n "${SUPABASE_SERVICE_ROLE_KEY}"
    return
  fi

  local key
  key="$(extract_key_from_compose "SUPABASE_SERVICE_ROLE_KEY")"
  if [[ -n "${key}" ]]; then echo -n "${key}"; return; fi

  key="$(extract_key_from_compose "SUPABASE_SERVICE_KEY")"
  if [[ -n "${key}" ]]; then echo -n "${key}"; return; fi

  key="$(extract_key_from_compose "SERVICE_KEY")"
  if [[ -n "${key}" ]]; then echo -n "${key}"; return; fi

  echo "" # not found
}

SERVICE_ROLE_KEY="$(resolve_service_role_key)"
if [[ -z "${SERVICE_ROLE_KEY}" ]]; then
  echo "Error: Could not determine service role key from env or docker-compose.yml" >&2
  exit 1
fi

create_user() {
  local email="$1"
  local role="$2"
  local full_name="${3:-}"

  local metadata_user
  if [[ -n "${full_name}" ]]; then
    metadata_user=$(jq -cn --arg role "$role" --arg full_name "$full_name" '{role: $role, full_name: $full_name}')
  else
    metadata_user=$(jq -cn --arg role "$role" '{role: $role}')
  fi

  local body
  body=$(jq -cn \
    --arg email "$email" \
    --arg password "$PASSWORD" \
    --argjson user_metadata "$metadata_user" \
    --argjson app_metadata "$metadata_user" \
    '{email: $email, password: $password, email_confirm: true, user_metadata: $user_metadata, app_metadata: $user_metadata}')

  curl -sS -X POST "${BASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    --data "${body}" | jq -r '.'
}

set_citizen_nic() {
  local user_id="$1"
  local nic="$2"
  local full_name="$3"

  local payload
  payload=$(jq -cn --arg nic "$nic" --arg full_name "$full_name" '{nic: $nic, full_name: $full_name}')

  curl -sS -X PATCH "${BASE_URL}/rest/v1/profiles?id=eq.${user_id}" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    --data "${payload}" | jq -r '.'
}

echo "Creating admin user..." >&2
admin_json="$(create_user "admin@civigo.local" "admin" "")"
admin_id="$(jq -r '.user.id // .id // empty' <<<"${admin_json}")"
if [[ -z "${admin_id}" ]]; then
  echo "Warning: could not parse admin user id; response: ${admin_json}" >&2
fi

echo "Creating officer user..." >&2
officer_json="$(create_user "officer@civigo.local" "officer" "")"
officer_id="$(jq -r '.user.id // .id // empty' <<<"${officer_json}")"
if [[ -z "${officer_id}" ]]; then
  echo "Warning: could not parse officer user id; response: ${officer_json}" >&2
fi

echo "Creating citizen user..." >&2
citizen_json="$(create_user "citizen@civigo.local" "citizen" "Test Citizen")"
citizen_id="$(jq -r '.user.id // .id // empty' <<<"${citizen_json}")"
if [[ -z "${citizen_id}" ]]; then
  echo "Warning: could not parse citizen user id; response: ${citizen_json}" >&2
else
  echo "Setting citizen NIC..." >&2
  set_citizen_nic "${citizen_id}" "912345678V" "Test Citizen" >/dev/null || true
fi

echo "Done." >&2


