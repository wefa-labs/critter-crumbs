#!/bin/bash
# Verifies block-dangerous-git.sh against guardrail-cases.txt.
# Usage: .claude/hooks/test-guardrail.sh   (exits non-zero if any case fails)

cd "$(dirname "$0")" || exit 1
fails=0
while IFS='|' read -r expect command; do
  case "$expect" in ''|'#'*) continue ;; esac
  printf '%s' "$command" | jq -Rs '{tool_input:{command:.}}' | ./block-dangerous-git.sh >/dev/null 2>&1
  code=$?
  if [ "$expect" = allow ] && [ $code -ne 0 ]; then
    echo "FAIL (blocked, should allow): $command"; fails=$((fails+1))
  elif [ "$expect" = block ] && [ $code -ne 2 ]; then
    echo "FAIL (allowed, should block): $command"; fails=$((fails+1))
  fi
done < guardrail-cases.txt

total=$(grep -cE '^(allow|block)\|' guardrail-cases.txt)
if [ $fails -eq 0 ]; then
  echo "guardrail: $total/$total cases pass"
else
  echo "guardrail: $fails of $total cases FAILED"; exit 1
fi
