#!/bin/bash
# Blocks history-destroying and remote-overwriting git commands.
# Ordinary pushes are allowed; force pushes, hard resets and forced deletions are not.
# Customised for Critter Crumbs from mattpocock/skills git-guardrails-claude-code (MIT).
# Claude Code wires it in .claude/settings.json and Codex in .codex/hooks.json; both send the
# event on stdin. Claude sends tool_input.command as a string; Codex may send it as an argv
# array (["bash", "-lc", "<script>"]) or under tool_input.cmd.
# Test cases live in .claude/hooks/guardrail-cases.txt; run .claude/hooks/test-guardrail.sh.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '
  .tool_input | (.command // .cmd // "")
  | if type == "array" then
      (if length >= 3 and (.[1] | test("^-[A-Za-z]*c$")) then .[2] else map(tostring) | join(" ") end)
    else tostring end')

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
