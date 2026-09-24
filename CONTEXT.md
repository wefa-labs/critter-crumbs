# Critter Crumbs

A private way for a group to decide how something gets shared out: everyone gets the same handful of crumbs, scatters them to critters, and nothing opens until the feast. This glossary is the ubiquitous language for every document, ticket, test name and UI string.

## Language

**Critter**:
A target that can receive crumbs: a person or a budget option, generated from an address.
_Avoid_: avatar, character, creature (in UI), recipient, candidate

**Burrow**:
The group. Persistent and reused across feasts; a person can belong to many.
_Avoid_: circle, team, org, DAO, group

**Feast**:
One whole event, and the moment everything opens at its end.
_Avoid_: round, epoch, cycle, vote, election

**Gathering**:
The first phase: everyone writes what they did, hidden from each other.
_Avoid_: submission period, contribution phase

**Scattering**:
The second phase: statements open and everyone scatters crumbs privately.
_Avoid_: voting, allocation period

**Crumbs**:
What each participant has to give: the same handful for everyone in a feast.
_Avoid_: points, tokens, votes, budget

**Scatter**:
The act of giving crumbs to a critter; also a participant's complete allocation, replaceable until scattering closes.
_Avoid_: vote, allocate, cast, submit

**Statement**:
A participant's plain-text account of what they did, or the creator's description of an option; hidden until scattering opens.
_Avoid_: bio, contribution, epoch statement

**Participant**:
A burrow member in a feast's frozen set: they scatter and, in a people feast, are also a critter.
_Avoid_: voter, user, member (when the feast context matters)

**Burrow creator**:
The person who created a burrow. May remove another member, with the removal visible to the remaining members.
_Avoid_: owner, admin (when naming this role)

**Removal**:
A burrow creator ending another person's membership. Distinct from a person choosing to leave.
_Avoid_: deletion (membership history remains)

**Creator**:
The member who set up a feast. May cancel before scattering and extend gathering once. Not an owner or admin.
_Avoid_: owner, admin, host, organiser

**Pile**:
The participant's own remaining crumbs during scattering, shown as a heap that dwindles.
_Avoid_: balance, budget, wallet

**Ballot**:
Code-level only: a participant's signed, encrypted scatter as stored and published. Never appears in the UI.
_Avoid_: vote, submission (in code); any use in copy

**Simple view**:
The 2D rendering of critters used before 3D loads, when WebGL is unavailable, or by choice.
_Avoid_: fallback mode, degraded mode, low-fi
