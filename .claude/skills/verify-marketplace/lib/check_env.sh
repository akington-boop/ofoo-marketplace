#!/usr/bin/env bash

check_plugin_root_env_var() {
  local plugin_dir="$1"
  local plugin_id="$2"
  local files=("$plugin_dir/.mcp.json" "$plugin_dir/hooks/hooks.json")

  for file in "${files[@]}"; do
    [[ -f "$file" ]] || continue
    local rel="${file#$plugin_dir/}"
    
    # Search for hardcoded absolute paths not using ${CLAUDE_PLUGIN_ROOT}
    while IFS= read -r match; do
      [[ -z "$match" ]] && continue
      if [[ "$match" != *'${CLAUDE_PLUGIN_ROOT}'* ]]; then
        add_violation "$plugin_id" "pluginRootEnvVar" "${rel}: hardcoded absolute path ${match} — use \${CLAUDE_PLUGIN_ROOT} instead"
      fi
    done < <(grep -o '"/[^"]*"' "$file" || true)
  done
}
