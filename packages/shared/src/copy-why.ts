/**
 * The page behind "Why nobody can peek" (Design System §9 and §10, `why.*`; docs/reviews/first-steps-2026-11, F4): what
 * a member is promised, the one thing the app will not pretend, the words, what runs where, and the source. Every claim
 * is one the pitch and PRD §8 already make. The page's name, which every link to it repeats, is `why.title` in `copy`.
 *
 * These lines are kept apart from `copy`, which the app shell carries whole (scripts/build-budget.mjs): only the page
 * imports them, so they arrive with its own chunk. The copy-ids lint reads this file as it reads `copy.ts`.
 */
export const whyCopy = {
  "why.promises.title": "What you are promised",
  "why.promise.read.lead": "No one can read what you gave until the feast.",
  "why.promise.read.body": "Your crumbs are locked to a time, not to a person: independent key holders release the key when the deadline passes, and there is nobody to ask for it early.",
  "why.promise.forge.lead": "We cannot make one up.",
  "why.promise.forge.body": "Yours is signed by you, and one we made up would not carry your signature.",
  "why.promise.drop.lead": "We cannot quietly lose one.",
  "why.promise.drop.body": "The full list is published the moment scattering closes, and you can check that yours is on it.",
  "why.promise.same.lead": "Everyone gets the same numbers.",
  "why.promise.same.body": "The count runs on your own device, so there is no server answer for anyone to argue with.",
  "why.promise.measure.lead": "Nothing about you is measured.",
  "why.promise.measure.body": "No analytics and no telemetry: the app makes the network requests it needs to do its job, and nothing else.",
  "why.limit.title": "One thing we will not pretend",
  "why.limit.body": "Before the feast, nobody can read your scatter, because nobody has the key: not us, not the creator. After the feast the key exists, so anyone in the burrow could work out who gave what. Keeping that private is a rule we enforce, not something the lock does for us.",
  "why.words.title": "The words",
  "why.words.burrow.lead": "Burrow",
  "why.words.burrow.body": "Your group. It stays together from one feast to the next.",
  "why.words.critters.lead": "Critters",
  "why.words.critters.body": "The people or budget options the crumbs are shared between.",
  "why.words.scatter.lead": "Scatter",
  "why.words.scatter.body": "What you give: all your crumbs, shared out as you choose. You can change it until scattering closes.",
  "why.words.feast.lead": "Feast",
  "why.words.feast.body": "The whole event, and the moment at its end when every scatter opens at once.",
  "why.runs.title": "What runs where",
  "why.runs.connect": "You connect with the account app you already use. Signing is free.",
  "why.runs.device.lead": "Your device",
  "why.runs.device.body": "Locks your scatter and signs it, then opens every scatter at the feast and adds them up.",
  "why.runs.store.lead": "Critter Crumbs",
  "why.runs.store.body": "Keeps the locked scatters, which it cannot open before the deadline, posts a receipt for each, and hands them all back at the deadline.",
  "why.runs.gnosis.lead": "Gnosis Chain",
  "why.runs.gnosis.body": "Shutter’s key holders release the key at the deadline. It is split between them, so none of them can open a feast alone, and Shutter covers the fee.",
  "why.runs.base.lead": "Base",
  "why.runs.base.body": "Each scatter is signed as an EAS attestation and kept off the chain. Only a public result, if the burrow chooses one, is written to Base, and that is the one time anyone pays.",
  "why.runs.ethereum.lead": "Ethereum",
  "why.runs.ethereum.body": "Names, looked up once and only ever read.",
  "why.source.title": "The source",
  "why.source.body": "The software is open source under the MIT licence; the critter generator, the art, the sounds and the name are WEFA’s own.",
  "why.source.code": "Read the code on GitHub",
  "why.source.spec": "Read the technical spec on GitHub",
} as const;
export type WhyCopyId = keyof typeof whyCopy;
