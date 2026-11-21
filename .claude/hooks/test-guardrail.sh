#!/bin/bash
# Verifies the git guardrail against guardrail-cases.txt, through the exact hook command that
# each tool wires: .claude/settings.json for Claude Code and .codex/hooks.json for Codex. Codex
# is exercised with the command as a string and as an argv array, the two shapes it sends.
# Usage: .claude/hooks/test-guardrail.sh   (exits non-zero if any case fails)
# Run by scripts/test.mjs, so `bun run check` and CI run it too.

root="$(cd "$(dirname "$0")/../.." && pwd)" || exit 1
cd "$root" || exit 1
cases=.claude/hooks/guardrail-cases.txt

claude_hook=$(jq -r '.hooks.PreToolUse[] | select(.matcher == "Bash") | .hooks[0].command' .claude/settings.json)
codex_hook=$(jq -r '.hooks.PreToolUse[] | select(.matcher == "Bash") | .hooks[0].command' .codex/hooks.json)
if [ -z "$claude_hook" ] || [ -z "$codex_hook" ]; then
  echo "guardrail: a Bash PreToolUse hook is missing from .claude/settings.json or .codex/hooks.json"; exit 1
fi

fails=0
total=0
run_case() { # tool, hook command, event json, expectation, command
  local code
  printf '%s' "$3" | CLAUDE_PROJECT_DIR="$root" bash -c "$2" >/dev/null 2>&1
  code=$?
  total=$((total+1))
  if [ "$4" = allow ] && [ $code -ne 0 ]; then
    echo "FAIL $1 (blocked, should allow): $5"; fails=$((fails+1))
  elif [ "$4" = block ] && [ $code -ne 2 ]; then
    echo "FAIL $1 (allowed, should block): $5"; fails=$((fails+1))
  fi
}

while IFS='|' read -r expect command; do
  case "$expect" in ''|'#'*) continue ;; esac
  as_string=$(printf '%s' "$command" | jq -Rs '{tool_name:"Bash", tool_input:{command:.}}')
  as_argv=$(printf '%s' "$command" | jq -Rs '{tool_name:"Bash", tool_input:{command:["bash","-lc",.]}}')
  run_case claude "$claude_hook" "$as_string" "$expect" "$command"
  run_case codex "$codex_hook" "$as_string" "$expect" "$command"
  run_case codex-argv "$codex_hook" "$as_argv" "$expect" "$command"
done < "$cases"

n=$(grep -cE '^(allow|block)\|' "$cases")
if [ $fails -eq 0 ]; then
  echo "guardrail: $n cases pass for Claude Code and Codex ($total runs)"
else
  echo "guardrail: $fails of $total runs FAILED"; exit 1
fi
