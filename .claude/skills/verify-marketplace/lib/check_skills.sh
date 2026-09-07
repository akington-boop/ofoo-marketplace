#!/usr/bin/env bash

KNOWN_SKILL_FIELDS="name description license allowed-tools metadata"

check_skill_frontmatter() {
  local plugin_dir="$1"
  local plugin_id="$2"
  local skills_dir="$plugin_dir/skills"

  [[ -d "$skills_dir" ]] || return 0

  # Get changed SKILL.md files from git HEAD
  local changed_skills
  changed_skills=$(git -C "$REPO_ROOT" diff --name-only HEAD 2>/dev/null | grep 'SKILL\.md$' || true)

  for skill_md in "$skills_dir"/*/SKILL.md; do
    [[ -f "$skill_md" ]] || continue
    local rel="skills/$(basename "$(dirname "$skill_md")")/SKILL.md"

    # Extract YAML block using sed
    local yml
    yml=$(tr -d '\r' < "$skill_md" | awk '/^---$/{n++; next} n==1')

    if [[ -z "$yml" ]]; then
      add_violation "$plugin_id" "skillFrontmatter" "${rel}: missing YAML frontmatter"
      continue
    fi

    # Parse YAML values using python or yq
    local name desc
    name=$(echo "$yml" | python3 -c 'import sys, yaml; print(yaml.safe_load(sys.stdin).get("name", ""))' 2>/dev/null || true)
    desc=$(echo "$yml" | python3 -c 'import sys, yaml; print(yaml.safe_load(sys.stdin).get("description", ""))' 2>/dev/null || true)

    if [[ -z "$name" ]]; then
      add_violation "$plugin_id" "skillFrontmatter" "${rel}: frontmatter missing \"name\""
    fi
    
    if [[ -z "$desc" ]]; then
      add_violation "$plugin_id" "skillFrontmatter" "${rel}: frontmatter missing \"description\""
      continue
    fi

    # Count words
    local word_count
    word_count=$(echo "$desc" | wc -w | tr -d ' ')
    if (( word_count > 50 )); then
      add_violation "$plugin_id" "skillFrontmatter" "${rel}: description is ${word_count} words, exceeds 50-word limit"
    fi

    # Check for unused frontmatter fields on changed files
    local rel_repo="${skill_md#$REPO_ROOT/}"
    if echo "$changed_skills" | grep -q "^$rel_repo$"; then
      local fields
      fields=$(echo "$yml" | python3 -c 'import sys, yaml; print(" ".join(yaml.safe_load(sys.stdin).keys()))' 2>/dev/null || true)
      for f in $fields; do
        if ! [[ " $KNOWN_SKILL_FIELDS " =~ " $f " ]]; then
          add_suggestion "$plugin_id" "${rel}: frontmatter field \"${f}\" is unused by Claude Code — consider removing it"
        fi
      done
    fi
  done
}
