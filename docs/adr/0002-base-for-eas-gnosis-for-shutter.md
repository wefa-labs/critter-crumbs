# Attestations live on Base; the Shutter registry stays on Gnosis Chain

EAS is not deployed on Gnosis Chain, where Shutter's keyper registry lives. Ballots are EAS off-chain attestations whose EIP-712 domain is EAS on Base, and public results are attested on-chain on Base; the Shutter API performs the Gnosis registration itself, so nobody in a burrow ever touches Gnosis. Considered: waiting for an EAS deployment on Gnosis (unknown timing), or a different attestation scheme (loses EAS tooling). See `docs/04-technical-spec.md` §6–§7.
