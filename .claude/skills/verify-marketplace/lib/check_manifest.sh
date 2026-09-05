#!/usr/bin/env bash

check_manifest_isolation() {
  local plugin_dir="$1"
  local plugin_id="$2"
  local manifest_dir="$plugin_dir/.claude-plugin"

  if [[ ! -d "$manifest_dir" ]]; then
    add_violation "$plugin_id" "manifestIsolation" ".claude-plugin/ directory is missing"
    return
  fi

  for entry in "$manifest_dir"/*; do
    local fname
    fname=$(basename "$entry")
    if [[ "$fname" != "plugin.json" ]]; then
      add_violation "$plugin_id" "manifestIsolation" ".claude-plugin/${fname} should not exist — .claude-plugin/ must contain only plugin.json"
    fi
  done

  if [[ ! -f "$manifest_dir/plugin.json" ]]; then
    add_violation "$plugin_id" "manifestIsolation" ".claude-plugin/plugin.json is missing"
  fi
}

check_plugin_manifest() {
  local plugin_dir="$1"
  local plugin_id="$2"
  local manifest_path="$plugin_dir/.claude-plugin/plugin.json"

  if [[ ! -f "$manifest_path" ]]; then
    add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json is missing"
    return
  fi

  if ! jq empty "$manifest_path" 2>/dev/null; then
    add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json is not valid JSON"
    return
  fi

  # Required fields validation
  for field in name version description; do
    local val
    val=$(jq -r ".${field} // empty" "$manifest_path")
    if [[ -z "$val" ]]; then
      add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json is missing required field \"${field}\""
    fi
  done

  # Author check (string or object with name)
  local author_val
  author_val=$(jq -r 'if .author | type == "object" then .author.name else .author end // empty' "$manifest_path")
  if [[ -z "$author_val" ]]; then
    add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json is missing required field \"author\""
  fi

  # Name format validation
  local name
  name=$(jq -r '.name // empty' "$manifest_path")
  if [[ -n "$name" ]]; then
    if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json \"name\" must be lowercase kebab-case, got \"${name}\""
    fi
    if [[ "$name" != "$plugin_id" ]]; then
      add_violation "$plugin_id" "pluginManifest" ".claude-plugin/plugin.json \"name\" (\"${name}\") must match its folder name (\"${plugin_id}\")"
    fi
  fi
}

check_root_placement() {
  local plugin_dir="$1"
  local plugin_id="$2"
  local cap_names=("skills" "commands" "agents" "hooks" ".mcp.json")

  while IFS= read -r -d '' path; do
    local rel="${path#$plugin_dir/}"
    local name
    name=$(basename "$path")
    
    # Ignore root level items
    [[ "$rel" == "$name" ]] && continue
    # Ignore .claude-plugin directory
    [[ "$rel" == .claude-plugin* ]] && continue

    for cap in "${cap_names[@]}"; do
      if [[ "$name" == "$cap" ]]; then
        add_violation "$plugin_id" "rootPlacement" "${rel} — \"${name}\" must live directly under the plugin root"
      fi
    done
  done < <(find "$plugin_dir" \( -type f -o -type d \) -print0)
}
