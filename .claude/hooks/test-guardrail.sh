#!/bin/bash
# Verifies the git guardrail against guardrail-cases.txt, through the exact hook command that
# each tool wires: .claude/settings.json for Claude Code and .codex/hooks.json for Codex. Codex
# is exercised with the command as a string and as an argv split on spaces (a shell's argv,
# ["bash", "-lc", script], joins to the same text). Events the hook cannot read must be refused.
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
  case "$expect" in
    ''|'#'*) continue ;;
    allow|block) ;;
    *) echo "FAIL case file: expectation '$expect' is neither allow nor block: $command"; fails=$((fails+1)); continue ;;
  esac
  as_string=$(printf '%s' "$command" | jq -Rs '{tool_name:"Bash", tool_input:{command:.}}')
  as_argv=$(printf '%s' "$command" | jq -Rs '{tool_name:"Bash", tool_input:{command:split(" ")}}')
  run_case claude "$claude_hook" "$as_string" "$expect" "$command"
  run_case codex "$codex_hook" "$as_string" "$expect" "$command"
  run_case codex-argv "$codex_hook" "$as_argv" "$expect" "$command"
done < "$cases"

unreadable=('{"tool_input":"git status"}' '{"tool_input":42}' 'not json' '{"tool_input":{"action":{"command":"git status"}}}')
for event in "${unreadable[@]}"; do
  run_case claude "$claude_hook" "$event" block "unreadable event: $event"
  run_case codex "$codex_hook" "$event" block "unreadable event: $event"
done

# Shapes a one-line case cannot spell: a line continuation, and a second command field.
destructive=$(printf 'git push \\\n --%s origin main' force)
shapes=(
  "$(jq -n --arg c "$destructive" '{tool_input:{command:$c}}')"
  "$(jq -n --arg c "$(printf 'git reset \\\n --%s' hard)" '{tool_input:{command:$c}}')"
  "$(jq -n --arg c "git push --$(printf force) origin main" '{tool_input:{command:"", cmd:$c}}')"
)
for event in "${shapes[@]}"; do
  run_case claude "$claude_hook" "$event" block "event shape: $event"
  run_case codex "$codex_hook" "$event" block "event shape: $event"
done
for event in '{}' '{"tool_input":null}' '{"tool_input":{}}' '{"tool_input":{"command":""}}'; do
  run_case claude "$claude_hook" "$event" allow "empty event: $event"
done

# A long text (a pull request body, a heredoc) is read in a few seconds, so a tool's hook timeout
# never decides the outcome, and a destructive command on its last line is still found.
long=$(jq -n --arg c "$(for i in $(seq 500); do printf 'line %s of a long body about the app and its tests\n' "$i"; done; printf 'git reset --%s' hard)" '{tool_input:{command:$c}}')
started=$SECONDS
run_case claude "$claude_hook" "$long" block "a 500-line text ending in a hard reset"
if [ $((SECONDS - started)) -gt 10 ]; then
  echo "FAIL the hook took $((SECONDS - started)) s on a 500-line text"; fails=$((fails+1))
fi

n=$(grep -cE '^(allow|block)\|' "$cases")
expected_runs=$((3 * n + 2 * ${#unreadable[@]} + 2 * ${#shapes[@]} + 4 + 1))
if [ $total -ne $expected_runs ]; then
  echo "FAIL ran $total hook calls, expected $expected_runs: a case was skipped"; fails=$((fails+1))
fi
if [ $fails -eq 0 ]; then
  echo "guardrail: $n cases, ${#unreadable[@]} unreadable events and ${#shapes[@]} event shapes pass for Claude Code and Codex ($total runs)"
else
  echo "guardrail: $fails of $total runs FAILED"; exit 1
fi
