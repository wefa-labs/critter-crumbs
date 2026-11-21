#!/bin/bash
# Blocks history-destroying and remote-overwriting git commands.
# Ordinary pushes are allowed; force pushes, hard resets and forced deletions are not.
# Customised for Critter Crumbs from mattpocock/skills git-guardrails-claude-code (MIT).
# Claude Code wires it in .claude/settings.json and Codex in .codex/hooks.json; both send the
# event on stdin. Claude sends tool_input.command as a string; Codex may send it as an argv
# array (["bash", "-lc", "<script>"]) or under tool_input.cmd. Every command field present is
# checked, an argv array as its words joined.
#
# The text is cut into simple commands before matching: quotes and backslashes are dropped, line
# continuations joined, and ; & | ( ) and backquotes end a command, so `bash -c "git reset
# --hard"`, `(cd x && git push -f)` and `git restore --staged .; git restore .` are each read as
# the commands they run, and a pattern never reaches into the next command. Any words may sit
# between git and its subcommand (global options such as -C dir, --work-tree dir, -c key=value).
# An event the hook cannot read is refused, never waved through.
# Test cases live in .claude/hooks/guardrail-cases.txt; run .claude/hooks/test-guardrail.sh.

INPUT=$(cat)
[ -z "${INPUT//[[:space:]]/}" ] && exit 0
if ! COMMAND=$(printf '%s' "$INPUT" | jq -er '
  def text: if type == "array" then map(tostring) | join(" ") else tostring end;
  (.tool_input // {})
  | if type != "object" then error("tool_input is not an object")
    elif length == 0 then ""
    elif has("command") or has("cmd") then [.command, .cmd | select(. != null) | text] | join("\n")
    else error("no command field") end
  | gsub("\\\\\n"; " ") | gsub("[\"'\''\\\\]"; "") | gsub("[;&|()`]"; "\n") | gsub("[ \t]+"; " ")' 2>/dev/null); then
  echo "BLOCKED: the git guardrail could not read this command, so it does not run. Run it as a plain shell command." >&2
  exit 2
fi

G='( |/)git( [^ ]+)* '  # git, then any global options before the subcommand
A='( [^ ]+)*'          # any further arguments, within this one simple command
WHOLE='(\.|\./|:/)'    # the whole tree
DANGEROUS_PATTERNS=(
  "${G}push${A} (--force[^ ]*|-[a-zA-Z]*f[a-zA-Z]*)( |$)"   # --force, --force-with-lease, -f, -uf
  "${G}push${A} --mirror( |$)"                               # overwrites every remote ref
  "${G}push${A} (--delete|-[a-zA-Z]*d[a-zA-Z]*)( |$)"        # deletes a remote branch: -d, -ud
  "${G}push${A} :[^ ]"                                       # deletes a remote branch: origin :x
  "${G}push${A} \+[^ ]"                                      # forced refspec: origin +main[:main]
  "${G}reset${A} --hard( |$)"
  "${G}clean${A} (-[a-zA-Z]*f[a-zA-Z]*|--force)( |$)"
  "${G}branch${A} -[a-zA-Z]*(D|d[a-zA-Z]*f|f[a-zA-Z]*d)[a-zA-Z]*( |$)"
  "${G}branch${A} (--delete|-d)${A} (--force|-f)( |$)"
  "${G}branch${A} (--force|-f)${A} (--delete|-d)( |$)"
  "${G}checkout${A} ${WHOLE}( |$)"
  "${G}checkout${A} (-f|--force)( |$)"
  "${G}switch${A} (-f|--force|--discard-changes)( |$)"
  "${G}(filter-branch|filter-repo)( |$)"
  "${G}reflog expire( |$)"
  "${G}gc${A} --prune=now( |$)"
)

while IFS= read -r line; do
  line=" ${line# }"
  for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if [[ $line =~ $pattern ]]; then
      echo "BLOCKED: '${line# }' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
      exit 2
    fi
  done
  # A clean with clean.requireForce turned off deletes without -f.
  if [[ $line =~ ${G}clean( |$) ]] && lower=$(printf '%s' "$line" | tr '[:upper:]' '[:lower:]') && [[ $lower =~ \ clean\.requireforce=(false|no|off|0)( |$) ]]; then
    echo "BLOCKED: '${line# }' turns off clean.requireForce. The user has prevented you from doing this." >&2
    exit 2
  fi
  # git restore of the whole tree discards work unless it only unstages (--staged or -S without
  # --worktree or -W).
  restore="${G}restore${A} ${WHOLE}( |$)" staged=' (--staged|-S)( |$)' worktree=' (--worktree|-W)( |$)'
  if [[ $line =~ $restore ]] && { ! [[ $line =~ $staged ]] || [[ $line =~ $worktree ]]; }; then
    echo "BLOCKED: '${line# }' discards every change in the tree. Restore your own files by name; git restore --staged . only unstages." >&2
    exit 2
  fi
done <<< "$COMMAND"

exit 0
