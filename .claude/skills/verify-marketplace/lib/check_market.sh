#!/usr/bin/env bash

check_marketplace_consistency() {
  local repo_root="$1"
  local mkt_path="$repo_root/.claude-plugin/marketplace.json"
  local plugins_dir="$repo_root/plugins"

  [[ -f "$mkt_path" ]] || { add_violation "marketplace.json" "consistency" ".claude-plugin/marketplace.json is missing"; return; }

  local listed_plugins
  listed_plugins=$(jq -r '.plugins[].name' "$mkt_path" 2>/dev/null)

  # Compare disk vs manifest
  for pdir in "$plugins_dir"/*; do
    [[ -d "$pdir" ]] || continue
    local pid
    pid=$(basename "$pdir")
    if ! echo "$listed_plugins" | grep -qx "$pid"; then
      add_violation "marketplace.json" "consistency" "plugins/${pid} exists but is not listed in marketplace.json"
    fi
  done
}

sync_readme() {
  local repo_root="$1"
  local readme="$repo_root/README.md"
  local mkt="$repo_root/.claude-plugin/marketplace.json"

  [[ -f "$readme" && -f "$mkt" ]] || return 0

  # Rebuild the markdown table using jq
  local table_rows
  table_rows=$(jq -r '.plugins[] | "| `\(.name)` | \(.description | sub("\\.$"; "")) |"' "$mkt")
  
  # Use Python or awk for safe file-block replacement
  python3 -c "
import sys
readme = open('$readme').read()
start_tag = '| Plugin | Description |\n|---|---|\n'
if start_tag in readme:
    pre, post = readme.split(start_tag, 1)
    content = post.split('\n\n', 1)
    new_readme = pre + start_tag + '''$table_rows''' + '\n\n' + content[1]
    if new_readme != readme:
        open('$readme', 'w').write(new_readme)
        print('📝 README.md plugin table updated.\n')
" 2>/dev/null || true
}
