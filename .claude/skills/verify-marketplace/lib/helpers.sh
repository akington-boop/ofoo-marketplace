#!/usr/bin/env bash

# Global state to collect errors and suggestions
TOTAL_VIOLATIONS=0
REPORT_LINES=()

add_violation() {
  local id="$1"
  local check="$2"
  local msg="$3"
  REPORT_LINES+=("${id}/${check}: ${msg}")
  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + 1))
}

add_suggestion() {
  local id="$1"
  local msg="$2"
  REPORT_LINES+=("${id}/suggestion: ${msg}")
}

print_report() {
  echo "# Marketplace Verification"
  echo ""
  if [[ ${#REPORT_LINES[@]} -eq 0 ]]; then
    echo "No violations found."
    exit 0
  fi

  printf '%s\n' "${REPORT_LINES[@]}"
  echo "(${TOTAL_VIOLATIONS} violations)"

  if [[ "$TOTAL_VIOLATIONS" -eq 0 ]]; then
    exit 0
  else
    exit 1
  fi
}
