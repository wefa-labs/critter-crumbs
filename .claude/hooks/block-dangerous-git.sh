#!/bin/bash
# Blocks history-destroying and remote-overwriting git commands.
# Ordinary pushes are allowed; force pushes, hard resets and forced deletions are not.
# Customised for Critter Crumbs from mattpocock/skills git-guardrails-claude-code (MIT).
# Claude Code wires it in .claude/settings.json and Codex in .codex/hooks.json; both send the
# event on stdin. Claude sends tool_input.command as a string; Codex may send it as an argv
# array (["bash", "-lc", "<script>"]) or under tool_input.cmd. An argv array is read as its words
# joined, plus the script when a shell runs one with -c, so `git -c k=v push --force` cannot hide.
# An event the hook cannot read is refused, never waved through.
# Test cases live in .claude/hooks/guardrail-cases.txt; run .claude/hooks/test-guardrail.sh.

INPUT=$(cat)
if ! COMMAND=$(printf '%s' "$INPUT" | jq -er '
  (.tool_input // {}) | if type == "object" then (.command // .cmd // "") else error("tool_input is not an object") end
  | if type == "array" then
      (map(tostring) | join(" ")) + (if length >= 3 and (.[0] | tostring | test("(^|/)(ba|z|da|k)?sh$")) and (.[1] | tostring | test("^-[A-Za-z]*c$")) then "\n" + (.[2] | tostring) else "" end)
    else tostring end' 2>/dev/null); then
  [ -z "$INPUT" ] && exit 0
  echo "BLOCKED: the git guardrail could not read this command, so it does not run. Run it as a plain shell command." >&2
  exit 2
fi

DANGEROUS_PATTERNS=(
  "push .*--force"        # --force and --force-with-lease
  "push (.* )?-f( |$)"    # -f, in any argument position
  "push .*--mirror"       # overwrites every remote ref
  "push .*--delete"       # deletes a remote branch
  "push (.* )?\+.*:"      # forced refspec, e.g. origin +main:main
  "reset --hard"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "filter-branch"
  "reflog expire"
  "gc --prune=now"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
