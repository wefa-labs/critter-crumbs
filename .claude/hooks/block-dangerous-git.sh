#!/bin/bash
# Blocks history-destroying and remote-overwriting git commands.
# Ordinary pushes are allowed; force pushes, hard resets and forced deletions are not.
# Customised for Critter Crumbs from mattpocock/skills git-guardrails-claude-code (MIT).
# Claude Code wires it in .claude/settings.json and Codex in .codex/hooks.json; both send the
# event on stdin. Claude sends tool_input.command as a string; Codex may send it as an argv
# array (["bash", "-lc", "<script>"]) or under tool_input.cmd. Every command field present is
# checked, an argv array as its words joined.
#
# The text is cut into simple commands before matching. Line continuations are joined and
# redirections such as 2>&1 dropped; each
# $(...) and backquoted span is checked as a command of its own and stands as one word, X, in the
# command around it; quotes and backslashes are dropped; and ; & | ( ) end a command. So
# `bash -c "git reset --hard"`, `(cd x && git push -f)`, `git -C "$(pwd)" reset --hard` and
# `git restore --staged .; git restore .` are each read as the commands they run, and a pattern
# never reaches into the next command. Any words may sit between git and its subcommand (global
# options such as -C dir, --work-tree dir, -c key=value), and a long option may be abbreviated,
# as git allows.
#
# Known limits: a git alias or a variable standing for git or a subcommand (`$g push -f`), a
# command assembled at run time, and ; & | ( ) inside quotes between git and its subcommand. The
# machine-wide guards, where they run, parse the shell properly. Text that only quotes a
# destructive command, such as a commit message, is blocked too.
# An event the hook cannot read is refused, never waved through.
# Test cases live in .claude/hooks/guardrail-cases.txt; run .claude/hooks/test-guardrail.sh.

INPUT=$(cat)
[[ $INPUT =~ ^[[:space:]]*$ ]] && exit 0
unreadable() {
  echo "BLOCKED: the git guardrail could not read this command ($1), so it does not run. Run it as a plain shell command." >&2
  exit 2
}
command -v jq >/dev/null && command -v perl >/dev/null || unreadable "jq and perl are needed"
RAW=$(printf '%s' "$INPUT" | jq -er '
  def text: if type == "array" then map(tostring) | join(" ") else tostring end;
  (.tool_input // {})
  | if type != "object" then error("tool_input is not an object")
    elif length == 0 then ""
    elif has("command") or has("cmd") then [.command, .cmd | select(. != null) | text] | join("\n")
    else error("no command field") end' 2>/dev/null) || unreadable "not a command event"
# One pass in perl, which stays fast on long text: join continuations, lift each $(...) and
# backquoted span out as a command of its own (innermost first) with X in its place, drop
# redirections, quotes and backslashes, end a command at ; & | ( ), and squeeze blanks.
COMMAND=$(printf '%s' "$RAW" | perl -0777 -ne '
  s/\\\n/ /g;
  my @lifted;
  while (s/\$\(([^()]*)\)/ X /) { push @lifted, $1 }
  while (s/`([^`]*)`/ X /) { push @lifted, $1 }
  $_ = join("\n", $_, @lifted);
  s/[0-9]*(?:>&|<&)[0-9-]+|&>>?/ /g;
  s/["\x27\\]//g;
  s/[;&|()]/\n/g;
  s/[ \t]+/ /g;
  print;
') || unreadable "perl failed"

G='( |/)git( [^ ]+)* '                 # git, then any words before the subcommand
O='( |/)git( -[^ ]+( [^ -][^ ]*)?)* '   # git, then only its options before the subcommand
A='( [^ ]+)*'                          # any further arguments, within this one simple command
WHOLE='(\.|\./|\.\.|:/|:|\*)'          # the whole tree
DANGEROUS_PATTERNS=(
  "${G}push${A} (--forc[^ ]*|--force[^ ]*|-[a-zA-Z]*f[a-zA-Z]*)( |$)"   # --force, --force-with-lease, -f, -uf
  "${G}push${A} --mi[a-z-]*( |$)"                                       # --mirror overwrites every remote ref
  "${G}push${A} (--de[a-z-]*|-[a-zA-Z]*d[a-zA-Z]*|--pru[a-z-]*)( |$)"    # --delete, -d, -ud, --prune delete remote branches
  "${G}push${A} :[^ ]"                                                 # deletes a remote branch: origin :x
  "${G}push${A} \+[^ ]"                                                # forced refspec: origin +main[:main]
  "${G}reset${A} --h(a[a-z-]*)?( |$)"                                   # --hard, not --help
  "${G}clean${A} (-[a-zA-Z]*f[a-zA-Z]*|--f[a-z-]*)( |$)"                # -f, --force
  "${G}branch${A} -[a-zA-Z]*(D|d[a-zA-Z]*f|f[a-zA-Z]*d)[a-zA-Z]*( |$)"
  "${G}branch${A} (--de[a-z-]*|-d)${A} (--forc[a-z-]*|-f)( |$)"
  "${G}branch${A} (--forc[a-z-]*|-f)${A} (--de[a-z-]*|-d)( |$)"
  "${G}branch${A} (--forc[a-z-]*|-f)( |$)"                              # moves a branch off its commits
  "${G}checkout${A} ${WHOLE}( |$)"
  "${G}checkout${A} (-[a-zA-Z]*f[a-zA-Z]*|--f[a-z-]*)( |$)"
  "${G}switch${A} (-[a-zA-Z]*f[a-zA-Z]*|--f[a-z-]*|--di[a-z-]*)( |$)"     # --force, --discard-changes
  "${G}(filter-branch|filter-repo)( |$)"
  "(^| |/)git-filter-repo( |$)"
  "${G}reflog (expire|delete)( |$)"
  "${G}gc${A} --prune=(now|all)( |$)"
  "${O}prune( |$)"
)

while IFS= read -r line; do
  [[ $line == *git* ]] || continue
  line=" ${line# }"
  for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if [[ $line =~ $pattern ]]; then
      echo "BLOCKED: '${line# }' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
      exit 2
    fi
  done
  # A clean with clean.requireForce turned off (an empty value is off) deletes without -f.
  if [[ $line =~ ${G}clean( |$) ]] && lower=$(printf '%s' "$line" | tr '[:upper:]' '[:lower:]') && [[ $lower =~ \ clean\.requireforce=(false|no|off|0)?( |$) ]]; then
    echo "BLOCKED: '${line# }' turns off clean.requireForce. The user has prevented you from doing this." >&2
    exit 2
  fi
  # git restore of the whole tree discards work unless it only unstages (--staged or -S without
  # --worktree or -W, each as git abbreviates them).
  restore="${G}restore${A} ${WHOLE}( |$)" staged=' (--st[a-z-]*|-[a-zA-Z]*S[a-zA-Z]*)( |$)' worktree=' (--w[a-z-]*|-[a-zA-Z]*W[a-zA-Z]*)( |$)'
  if [[ $line =~ $restore ]] && { ! [[ $line =~ $staged ]] || [[ $line =~ $worktree ]]; }; then
    echo "BLOCKED: '${line# }' discards every change in the tree. Restore your own files by name; git restore --staged . only unstages." >&2
    exit 2
  fi
done <<< "$COMMAND"

exit 0
