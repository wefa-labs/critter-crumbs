#!/bin/bash
# Blocks history-destroying and remote-overwriting git commands.
# Ordinary pushes are allowed; force pushes, hard resets and forced deletions are not.
# Customised for Critter Crumbs from mattpocock/skills git-guardrails-claude-code (MIT).
# Test cases live in .claude/hooks/guardrail-cases.txt; run .claude/hooks/test-guardrail.sh.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

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
