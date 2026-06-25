# shellcheck shell=bash
# Read a single KEY=value from repo root .env (no export of secrets to logs).
get_root_env() {
  local key="$1"
  local env_file="${ROOT_DIR:-}/.env"
  if [[ ! -f "$env_file" ]]; then
    return 1
  fi
  local line
  line="$(grep -E "^${key}=" "$env_file" | tail -n 1 || true)"
  [[ -n "$line" ]] || return 1
  printf '%s' "${line#*=}"
}
