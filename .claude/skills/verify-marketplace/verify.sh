#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${1:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"

# Source library modules
source "$SCRIPT_DIR/lib/helpers.sh"
source "$SCRIPT_DIR/lib/check_manifest.sh"
source "$SCRIPT_DIR/lib/check_skills.sh"
source "$SCRIPT_DIR/lib/check_env.sh"
source "$SCRIPT_DIR/lib/check_market.sh"

main() {
  local plugins_dir="$REPO_ROOT/plugins"
  
  if [[ -d "$plugins_dir" ]]; then
    for plugin_path in "$plugins_dir"/*; do
      [[ -d "$plugin_path" ]] || continue
      local plugin_id
      plugin_id="$(basename "$plugin_path")"

      check_manifest_isolation "$plugin_path" "$plugin_id"
      check_root_placement "$plugin_path" "$plugin_id"
      check_skill_frontmatter "$plugin_path" "$plugin_id"
      check_plugin_root_env_var "$plugin_path" "$plugin_id"
      check_plugin_manifest "$plugin_path" "$plugin_id"
    done
  fi

  check_marketplace_consistency "$REPO_ROOT"
  sync_readme "$REPO_ROOT"

  print_report
}

main
