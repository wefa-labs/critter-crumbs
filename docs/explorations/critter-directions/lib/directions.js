/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated bundle; lint src instead. */
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
    get: (a, b) => (typeof require < "u" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require < "u")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  // packages/shared/dist/copy.js
  var copy = {
    "profile.title": "Your critter",
    "profile.address.copy": "Copy address",
    "profile.address.copied": "Address copied.",
    "notification.label": "Update",
    "notification.dismiss": "Dismiss notification",
    "err.copy": "Couldn't copy. Try again, or select the text and copy it yourself.",
    "gathering.assistant.title": "Start from your notes",
    "gathering.assistant.help": "Copy this prompt into your own assistant with the notes you choose. Nothing is sent from Critter Crumbs.",
    "gathering.assistant.label": "Statement prompt",
    "gathering.assistant.copy": "Copy prompt",
    "gathering.assistant.copied": "Prompt copied.",
    "gathering.assistant.select": "Copying is unavailable. Select the prompt and copy it yourself.",
    "gathering.assistant.prompt": `Help me draft my statement for this feast.
Title: {title}
Context: {context}
Type: {kind}
Gathering ends: {gathering}
Scattering ends: {scattering}

Use only the notes I provide below. Find concrete contributions, work completed, and who benefited. Ask about anything unclear; do not invent achievements. Draft in the first person, in plain text, with at most 2,000 characters. Keep it clear and specific so the burrow can understand what I contributed. I will review and edit it before saving.

My notes:`,
    "results.local.cta": "Record the rehearsal result",
    "results.local.help": "Local Base Sepolia fixture. This exercises recording without gas or a real transaction. Any burrow member can do it.",
    "results.local.done": "Rehearsal result recorded by {name}.",
    "results.local.view": "View the rehearsal record",
    "results.local.transaction": "Transaction reference",
    "results.local.uid": "Record reference",
    "results.public.pending": "The burrow is preparing the public result. It appears here after a member records it.",
    "results.csv.critter": "critter",
    "results.csv.address": "address",
    "results.csv.crumbs": "crumbs",
    "results.csv.share": "share",
    "results.csv.giver": "giver",
    "results.received": "{n} crumbs received",
    "results.verification": "Result fingerprint",
    "err.publicationChanged": "The published scatters do not match the close record, so the feast did not open on this device. Nothing of yours changed. Try again and tell the burrow if this continues.",
    "err.sessionExpired": "Connect again to save. Your changes are still here.",
    "scatter.savedWithChanges": "Scattered. Your newer edits still need to be saved.",
    "app.contextTitle": "{screen} · {burrow} · Critter Crumbs",
    "app.burrowScreen": "Burrow",
    "read.title": "Read statements",
    "scatter.title": "Scatter crumbs",
    "home.critterCount": "{n} critters",
    "home.nextDeadline": "Next deadline: {deadline}",
    "home.noDeadline": "No upcoming deadline",
    "phase.void": "Ended before scattering",
    "setup.option.remove": "Remove option",
    "setup.saved": "Draft saved. Review the details, then open the feast when you're ready.",
    "setup.saved.help": "These details are fixed in this draft. To change them, cancel it and start a new feast.",
    "burrow.remove": "Remove",
    "burrow.remove.label": "Remove from burrow: {name}",
    "burrow.remove.title": "Remove {name}?",
    "burrow.remove.body": "The burrow will see who removed them and when. Feasts already scattering keep their participants and results. They can be added again later.",
    "burrow.remove.done": "{name} was removed from the burrow.",
    "burrow.removals.title": "Membership history",
    "burrow.removals.line": "{actor} removed {name}",
    "err.removeAuthority": "Only the burrow creator can remove another member.",
    "err.removeSelf": "Use Leave this burrow to leave yourself.",
    "err.membershipChanged": "This membership has changed. Refresh the burrow before trying again.",
    "app.pageTitle": "{title} · Critter Crumbs",
    "app.navigation": "Main navigation",
    "connect.title": "Choose how to connect",
    "connect.empty": "No connection is available in this browser yet.",
    "connect.injected": "This browser",
    "connect.rejected": "Connection wasn't confirmed. Try again when you're ready.",
    "connect.resumed": "Connected. Try that again now — nothing you entered was lost.",
    "connect.waiting": "Confirm in {name}",
    "connect.sign.body": "You'll be asked to sign. It costs nothing and nothing goes on-chain.",
    "app.loading": "Opening the burrow…",
    "app.unavailable": "Can't open this right now",
    "action.close": "Close",
    "action.retry": "Try again",
    "burrow.join": "Join this burrow",
    "burrow.historical": "Past members",
    "burrow.preAdded": "Ready to join",
    "session.message": `Critter Crumbs

Connect as {address}

Nonce: {nonce}
Issued: {issued}
Expires: {expires}`,
    "app.name": "Critter Crumbs",
    "app.environment.label": "Development status",
    "app.environment.badge": "Beta · Testnet",
    "app.environment.help": "Still in development. Rehearsal only.",
    "app.tagline": "Everyone gets a handful of crumbs to share.",
    "action.connect": "Connect",
    "action.disconnect": "Disconnect",
    "action.back": "Back",
    "action.cancel": "Cancel",
    "action.settings": "Settings",
    "phase.draft": "Draft",
    "phase.gathering": "Gathering",
    "phase.scattering": "Scattering",
    "phase.feast": "Feast",
    "deadline.gathering": "Gathering closes {relative}",
    "deadline.scattering": "Scattering closes {relative}",
    "deadline.closed": "{phase} closed {relative}",
    "deadline.soon": "Closing soon — {relative}",
    "deadline.absolute": "{weekday} {day} {month}, {time} ({tz})",
    "deadline.line": "{deadline} · {date}",
    "skip.content": "Skip to content",
    "arrive.burrow": "{burrowName} · {n} critters",
    "arrive.explainer": "Everyone here gets the same handful of crumbs to share out. Where they go stays private until the feast.",
    "arrive.asleep": "The critters are asleep until you connect.",
    "arrive.cta": "Connect to join",
    "launch.learn": "How it works",
    "learn.step": "Step {i} of {n}",
    "learn.next": "Next",
    "learn.skip": "Skip",
    "learn.done": "Got it",
    "learn.handful.title": "Everyone gets the same handful",
    "learn.handful.body": "In a feast, everyone has the same crumbs to share out, and gives all of them away.",
    "learn.tap.body": "Try it: give these ten crumbs away. They are only practice.",
    "learn.tap.give": "Give a practice crumb",
    "learn.private.title": "Where they go stays private",
    "learn.private.body": "Nobody sees where anyone’s crumbs went until the feast. Then every scatter opens at once.",
    "learn.results.title": "When the feast opens",
    "learn.results.body": "Four critters had 100 crumbs each in this example. Three scattered {total}.",
    "learn.results.table": "Practice feast results",
    "learn.results.critter": "Critter",
    "learn.results.crumbs": "Crumbs",
    "learn.results.share": "Share",
    "learn.results.explain": "{name} received {crumbs} of {total} crumbs: {share}.",
    "learn.results.absent": "Fern didn’t scatter and still receives a share.",
    "learn.example.moss": "Moss",
    "learn.example.clover": "Clover",
    "learn.example.juniper": "Juniper",
    "learn.example.fern": "Fern",
    "name.title": "What should the burrow call you?",
    "name.help": "There's no ENS name on this address, so pick a name.",
    "name.label": "Display name",
    "name.save": "Save name",
    "critter.meet.title": "Meet your critter",
    "critter.meet.body": "Made from your address. Re-roll up to {max} times, then it's yours.",
    "critter.reroll": "Re-roll ({remaining} left)",
    "critter.reroll.last": "Re-roll (last one)",
    "critter.reroll.announce": "New critter. {remaining} re-rolls left.",
    "critter.keep": "Keep this one",
    "critter.locked": "This one's yours.",
    "home.title": "Your burrows",
    "home.empty.title": "No burrows yet",
    "home.empty.body": "Start one, or ask a friend to add you to theirs.",
    "home.empty.cta": "Start a burrow",
    "burrow.create.title": "Start a burrow",
    "burrow.name.label": "Burrow name",
    "burrow.create.cta": "Create burrow",
    "burrow.members.title": "Critters",
    "burrow.empty.title": "Just you so far",
    "burrow.empty.body": "Add critters by address or ENS name. They get in with the burrow link.",
    "burrow.add.label": "Address or ENS name",
    "burrow.add.cta": "Add",
    "burrow.add.done": "{name} added.",
    "burrow.link.copy": "Copy burrow link",
    "burrow.link.copied": "Link copied.",
    "burrow.feasts.title": "Feasts",
    "burrow.feasts.empty.title": "No feasts yet",
    "burrow.feasts.empty.body": "Start one when the burrow is ready.",
    "burrow.feasts.new": "Start a feast",
    "burrow.leave": "Leave this burrow",
    "burrow.leave.title": "Leave {burrowName}?",
    "burrow.leave.body": "Your critter leaves future feasts. Past feasts stay as they were.",
    "burrow.leave.cta": "Leave burrow",
    "burrow.unknown.title": "This burrow doesn't know you yet",
    "burrow.unknown.body": "Ask someone in {burrowName} to add {shortAddress}.",
    "feast.cancelled": "Cancelled",
    "feast.tooFew": "{feastTitle} ended before scattering: a people feast needs at least 3 critters. Start a new one when the burrow is ready.",
    "setup.title": "Start a feast",
    "setup.draft.chip": "Draft — only you can see this",
    "setup.field.title": "Feast title",
    "setup.field.context": "What is this feast for?",
    "setup.field.context.help": "One line. It shows on the invite.",
    "setup.field.type": "Where do the crumbs go?",
    "setup.type.people": "To people",
    "setup.type.people.help": "Recognising contribution. Everyone writes what they did.",
    "setup.type.options": "To options",
    "setup.type.options.help": "Splitting a budget. You write a line for each option.",
    "setup.options.title": "Options",
    "setup.options.add": "Add an option",
    "setup.option.name": "Option name",
    "setup.option.statement": "What this option is",
    "setup.field.crumbs": "Crumbs per critter",
    "setup.crumbs.help": "100 keeps the maths simple. Anything from 10 to 1,000.",
    "setup.field.gathering": "Gathering closes",
    "setup.field.scattering": "Scattering closes",
    "setup.deadline.help": "Everyone sees these in their own time zone. Yours is {tz}.",
    "setup.deadline.order": "Scattering has to close after gathering.",
    "setup.privacy.title": "Who sees the result?",
    "setup.privacy.aggregate.label": "The result",
    "setup.privacy.aggregate.public": "Public — anyone with the link, and recorded on-chain",
    "setup.privacy.aggregate.burrow": "Burrow only",
    "setup.privacy.individual.label": "Who gave what",
    "setup.privacy.individual.closed": "Closed — nobody sees individual scatters",
    "setup.privacy.individual.open": "Open to the burrow after the feast",
    "setup.privacy.individual.burrow": "Your burrow sees who gave what. Nothing goes public.",
    "setup.privacy.individual.locked": "Stays closed while the result is burrow only.",
    "setup.min.people": "A people feast needs at least 3 critters. This burrow has {n}.",
    "setup.save": "Save draft",
    "setup.open": "Open the feast",
    "setup.open.title": "Open {feastTitle}?",
    "setup.open.body": "Gathering starts now and closes {gatheringDeadline}. You can extend that once.",
    "setup.open.cta": "Open the feast",
    "gathering.yours.title": "Your statement",
    "gathering.prompt": "What did you do this time? Draw on your notes, commits, calendar — anything that helps. Links are welcome.",
    "gathering.counter": "{n} / 2,000",
    "gathering.limit": "That's the limit — 2,000 characters.",
    "gathering.save": "Save statement",
    "gathering.saved": "Saved.",
    "gathering.hidden": "Nobody sees this until scattering opens.",
    "gathering.participation": "{written} of {total} statements written",
    "gathering.notYet": "Not yet: {names}",
    "gathering.options.title": "Option statements",
    "gathering.extend": "Extend gathering (once)",
    "gathering.extend.title": "Extend gathering",
    "gathering.extend.body": "Pick a new close time before scattering closes ({scatteringDeadline}). This is the only extension.",
    "gathering.extend.cta": "Extend",
    "gathering.extended": "Gathering now closes {relative}.",
    "gathering.cancel": "Cancel this feast",
    "gathering.cancel.title": "Cancel {feastTitle}?",
    "gathering.cancel.body": "The feast ends now. This can't be undone.",
    "gathering.cancel.cta": "Cancel the feast",
    "reveal.title": "Statements are open",
    "reveal.body": "Read them first, then scatter your {crumbs} crumbs.",
    "reveal.cta": "Start reading",
    "reveal.announce": "Statements are open. {n} statements to read.",
    "read.position": "{i} of {n}",
    "read.prev": "Previous",
    "read.next": "Next",
    "read.skip": "Go to scattering",
    "read.done": "Start scattering",
    "read.noStatement": "{name} didn't write a statement.",
    "read.option.noStatement": "No description for this option.",
    "scatter.add.symbol": "+",
    "scatter.remove.symbol": "−",
    "pile.label": "Your crumbs",
    "scatter.latest": "Your latest saved scatter is #{seq}. The crumbs shown here are your edits on this screen. Saving them will replace that scatter.",
    "scatter.unsaved": "Your changes have not been saved yet.",
    "scatter.instruction": "Tap to give a crumb. Hold to pour.",
    "scatter.add": "Give a crumb to {name}",
    "scatter.remove": "Take a crumb back from {name}",
    "scatter.count.label": "Crumbs for {name}",
    "scatter.count.announce": "{n} for {name}. {remaining} to go.",
    "scatter.own.label": "Your critter",
    "scatter.own.body": "Asleep, eating what the others give it.",
    "scatter.statement.show": "Show statement",
    "scatter.statement.hide": "Hide statement",
    "element.earth": "Earth",
    "element.water": "Water",
    "element.fire": "Fire",
    "element.air": "Air",
    "scatter.none.left": "No crumbs left. Take some back to move them.",
    "pile.remaining": "{n} to go",
    "pile.remaining.words": "to go",
    "pile.empty": "All scattered",
    "pile.empty.announce": "All scattered. Scatter these when you're ready.",
    "scatter.submit": "Scatter These",
    "scatter.submit.help": "Scatter all {n} first.",
    "scatter.sign.title": "Confirm your scatter",
    "scatter.sign.body": "You'll be asked to sign. It costs nothing and nothing goes on-chain.",
    "scatter.sign.rejected": "Not confirmed. Your crumbs are still here — try again when you're ready.",
    "scatter.saving": "Saving…",
    "scatter.done.title": "Scattered.",
    "scatter.done.body": "You can change this until {scatteringDeadline}.",
    "scatter.done.change": "Change my scatter",
    "scatter.participation": "{done} of {total} have scattered",
    "scatter.notYet": "Not yet: {names}",
    "scatter.closed": "Scattering has closed. The feast is on its way.",
    "feast.waiting.title": "The feast is being laid out",
    "feast.waiting.body": "Fetching the key and opening every scatter. This takes a moment.",
    "feast.keyNotYet": "The key isn't out yet. Try again in a few minutes.",
    "feast.replay": "Replay Feast",
    "feast.skip": "Skip to results",
    "feast.announce": "Results are ready. {topName} received the most crumbs.",
    "results.recording": "Recording the result…",
    "results.title": "Results",
    "results.caption": "Crumbs received in {feastTitle}",
    "results.col.critter": "Critter",
    "results.col.crumbs": "Crumbs",
    "results.col.share": "Share",
    "results.public.summary": "{scatterers} scattered · {totalCrumbs} crumbs in all",
    "results.summary": "{scatterers} of {total} scattered · {totalCrumbs} crumbs in all",
    "results.didNotScatter": "{names} didn't scatter.",
    "results.everyone": "Everyone scattered.",
    "results.one": "Only {name} scattered.",
    "results.nobody": "Nobody scattered, so there's nothing to share out.",
    "results.tie": "{names} tied.",
    "results.givers.title": "Who gave what",
    "results.givers.caption": "Individual scatters are open to the burrow for this feast.",
    "results.col.giver": "Giver",
    "results.giver.you": "{name} (you)",
    "results.givers.none": "—",
    "results.export": "Download CSV",
    "results.export.givers": "Download CSV (who gave what)",
    "results.private": "Only the burrow can see these results.",
    "results.public": "Anyone with the link can see these results.",
    "results.attest.cta": "Record the result on-chain",
    "results.attest.help": "Anyone in the burrow can do this. It costs a little gas.",
    "results.attest.done": "Recorded on-chain by {name}.",
    "results.attest.view": "View the record",
    "settings.title": "Settings",
    "sound.effects.label": "Sounds",
    "sound.effects.help": "Little crumb noises.",
    "sound.music.label": "Music",
    "sound.music.help": "Tunes in the background.",
    "motion.still.label": "Still critters",
    "motion.still.help": "No wobbling or bouncing.",
    "view.simple.label": "Simple view",
    "view.simple.help": "Flat critters. Easier on the battery.",
    "view.dark.label": "Dark mode",
    "view.dark.help": "Easier on the eyes at night.",
    "fallback.initial": "Showing the simple view — 3D isn't available in this browser right now.",
    "fallback.midSession": "The 3D view stopped, so this is the simple view. Nothing else has changed.",
    "fallback.retry": "Try 3D again",
    "err.offline": "You're offline. Your crumbs are safe on this screen until you're back.",
    "err.online": "Back online.",
    "err.saveFailed": "Couldn't save your scatter. Check your connection and try again — nothing was lost.",
    "err.saveUnverified": "Saved, but not confirmed yet. Keep this open a moment.",
    "err.saveVerified": "Your scatter is in.",
    "err.clockSkew": "Your device clock is off by about {minutes} minutes. Deadlines here use the feast's clock, not yours.",
    "err.uidMissing": "Your scatter isn't in the published set. Keep this: {uid}. Tell the burrow.",
    "err.ensUnavailable": "Couldn't look up ENS names right now, so addresses are shown instead.",
    "err.storeUnreachable": "Can't reach the burrow right now. Try again in a moment.",
    "err.rehearsalOnly": "Only the local rehearsal can sign and open feasts in this build. Your crumbs stay as you left them.",
    "err.keyUnreachable": "Can't fetch the key right now. Nothing is lost — try again in a few minutes.",
    "err.generic": "Something went wrong. Nothing you did was lost.",
    "err.notParticipant": "This feast started before you joined the burrow. You'll be in the next one.",
    "err.feastCapacity": "A feast can include at most 49 critters.",
    "results.unreadable": "{names} scattered, but their crumbs couldn't be read, so they count as not having scattered.",
    "scatter.own.short": "You",
    "results.export.short": "Download",
    "feast.sequence": "Everyone wakes, then each critter eats and grows in turn.",
    "read.statement": "Read {name}’s statement",
    "game.profile": "Your critter and settings",
    "game.share.separator": " · ",
    "game.sleep.symbol": "z"
  };
  // packages/shared/dist/feel.js
  var RIG = { scale: [0.9, 1.4], lean: 3, posture: [-3, 0], headTilt: 8, ear: [-25, 15], lid: [0.12, 1], pupil: 0.3, cheekThreshold: 0.5, mouthThreshold: 0.35, mouthOpacity: 0.6, mouthTriangles: 40 }, IDLE = {
    awake: { breath: 0.012, breathHz: 0.4, wobble: 1.5, wobbleHz: 0.2 },
    asleep: { breath: 0.015, breathHz: 0.25, wobble: 0, earDroop: 25, nod: -4, nodMs: 600, nodEveryMs: 8000 },
    pleased: { threshold: 0.75, breath: 0.015, breathHz: 0.5, wobble: 2, wobbleHz: 0.3, hopScale: [1.04, 0.97], hopHeight: 0.03, hopMs: 260, hopEveryMs: [6000, 1e4] },
    blinkEveryMs: [3000, 6000],
    blinkMs: 120,
    pupilDrift: 0.05,
    pupilEveryMs: [4000, 9000]
  };
  var GROWTH = { fairShareCap: 2.5, exponent: 0.75, scaleGain: 0.35, minimumContentMood: 0.25 };
  var PILE_RULE = "exact", CIRCLE_FEEL = { presentationMs: 100, turnMs: 320, stirMs: 850, sleepGlyphMs: 1100, sleepReleaseMs: 130, sleepLifeMs: 840, sleepDriftX: 16, sleepDriftY: 32, playEveryMs: [900, 2100], playMs: 480, phone: { focus: 140, back: 66, front: 100 }, desktop: { focus: 248, back: 120, front: 172 }, huddle: { phone: 66, desktop: 150 } };
  // packages/shared/dist/validate.js
  class ValidationError extends Error {
    copyId;
    constructor(copyId = "err.generic") {
      super(copyId);
      this.copyId = copyId, this.name = "ValidationError";
    }
  }
  function integer(value, min, max, id = "err.generic") {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max)
      throw new ValidationError(id);
    return value;
  }
  function hex(value, bytes) {
    if (typeof value !== "string" || !/^0x(?:[0-9a-fA-F]{2})*$/.test(value) || bytes !== void 0 && value.length !== 2 + bytes * 2)
      throw new ValidationError;
    return value.toLowerCase();
  }
  // packages/core/src/generator/index.ts
  var GEN_VERSION = "1";
  function cyrb53(value) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0;i < value.length; i++) {
      let ch = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761), h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909), h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909), 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry32(seed) {
    let state = seed | 0;
    return () => {
      state = state + 1831565813 | 0;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      return value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function generate(address, variant) {
    let input = hex(address, address.length === 42 ? 20 : 32);
    integer(variant, 0, 4);
    let rng = mulberry32(cyrb53(`${input}:${variant}:${GEN_VERSION}`)), uniform = (min, max) => min + (max - min) * rng();
    function choice(values) {
      let draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0), threshold = 0;
      for (let [value, weight] of values)
        if (threshold += weight, draw < threshold)
          return value;
      throw RangeError("Invalid generator weights");
    }
    return {
      bodyShape: choice([["egg", 35], ["bean", 25], ["capsule", 25], ["round", 15]]),
      bodyHeight: uniform(0.85, 1.25),
      bodyWidth: uniform(0.75, 1.15),
      belly: uniform(0, 0.3),
      headShape: choice([["round", 45], ["egg", 30], ["squarish", 25]]),
      headSize: uniform(0.5, 0.72),
      headTilt: uniform(-8, 8),
      earType: choice([["round", 1], ["pointed", 1], ["long", 1], ["floppy", 1], ["tufts", 1], ["none", 1]]),
      earSize: uniform(0.18, 0.5),
      earSpread: uniform(35, 75),
      eyeStyle: choice([["round", 50], ["oval", 30], ["half-lid", 20]]),
      eyeSize: uniform(0.1, 0.2),
      eyeSpacing: uniform(0.32, 0.62),
      eyeHeight: uniform(0.45, 0.62),
      pupilSize: uniform(0.45, 0.7),
      snout: choice([["none", 40], ["button", 35], ["muzzle", 25]]),
      cheeks: rng() < 0.3,
      armType: choice([["stubs", 50], ["paws", 30], ["none", 20]]),
      legLength: uniform(0.15, 0.35),
      tailType: choice([["none", 30], ["puff", 25], ["curl", 25], ["stub", 20]]),
      markings: choice([["none", 55], ["belly patch", 25], ["spots", 20]]),
      hue: uniform(0, 360),
      chroma: uniform(0.06, 0.13),
      lightness: uniform(0.58, 0.76),
      accentShift: uniform(15, 45),
      idlePhase: uniform(0, 1)
    };
  }
  // packages/core/src/generator/versioned.ts
  var GEN_VERSION_2 = "2";
  function cyrb532(value) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0;i < value.length; i++) {
      let ch = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761), h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909), h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909), 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry322(seed) {
    let state = seed | 0;
    return () => {
      state = state + 1831565813 | 0;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      return value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function draws(seedText) {
    let rng = mulberry322(cyrb532(seedText)), uniform = (min, max) => min + (max - min) * rng();
    function choice(values) {
      let draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0), threshold = 0;
      for (let [value, weight] of values)
        if (threshold += weight, draw < threshold)
          return value;
      throw RangeError("Invalid generator weights");
    }
    return { rng, uniform, choice, equal: (list) => choice(list.map((value) => [value, 1])) };
  }
  var ELEMENTS = {
    earth: { ears: ["leaf", "round"], crests: [["sapling", 60], ["none", 40]], tails: ["branch", "puff"], marking: "moss", bands: [[130, 160], [60, 80]], glow: "#E9C46A", spot: "chest" },
    water: { ears: ["fin", "round"], crests: [["droplet", 50], ["reed", 50]], tails: ["tadpole", "stub"], marking: "dew", bands: [[180, 210]], glow: "#9FE1DC", spot: "throat" },
    fire: { ears: ["flame", "pointed"], crests: [["ember", 50], ["seedpods", 50]], tails: ["spark", "emberwisp"], marking: "belly", bands: [[20, 40], [40, 55]], glow: "#F28C38", spot: "chest" },
    air: { ears: ["cloud", "fern"], crests: [["none", 100]], tails: ["cloudwisp", "longwisp"], marking: "sky", bands: [[200, 220]], glow: "#BFE3F5", spot: "brow" }
  };
  function generate2(address, variant) {
    let input = hex(address, address.length === 42 ? 20 : 32);
    integer(variant, 0, 4);
    let { rng, uniform, choice, equal } = draws(`${input}:${variant}:2`), element = equal(["earth", "water", "fire", "air"]), set = ELEMENTS[element], params = {
      version: GEN_VERSION_2,
      element,
      bodyShape: choice([["egg", 35], ["bean", 25], ["capsule", 25], ["round", 15]]),
      bodyHeight: uniform(0.85, 1.25),
      bodyWidth: uniform(0.75, 1.15),
      belly: uniform(0, 0.3),
      headShape: choice([["round", 45], ["egg", 30], ["squarish", 25]]),
      headSize: uniform(0.5, 0.72),
      headTilt: uniform(-8, 8),
      earType: equal(set.ears),
      earSize: uniform(0.18, 0.5),
      earSpread: uniform(35, 75),
      crest: choice(set.crests),
      eyeStyle: choice([["round", 50], ["oval", 30], ["half-lid", 20]]),
      eyeSize: uniform(0.1, 0.2),
      eyeSpacing: uniform(0.32, 0.62),
      eyeHeight: uniform(0.45, 0.62),
      pupilSize: uniform(0.45, 0.7),
      snout: choice([["none", 40], ["button", 35], ["muzzle", 25]]),
      cheeks: rng() < 0.3,
      armType: choice([["stubs", 50], ["paws", 30], ["none", 20]]),
      legLength: uniform(0.15, 0.35),
      tailType: equal(set.tails),
      markings: choice([["none", 40], [set.marking, 60]])
    }, band = set.bands[Math.floor(rng() * set.bands.length)];
    return { ...params, hue: uniform(band[0], band[1]), chroma: uniform(0.06, 0.13), lightness: uniform(0.58, 0.76), accentShift: uniform(15, 45), idlePhase: uniform(0, 1), glow: set.glow, spot: set.spot };
  }
  // packages/core/dist/generator/index.js
  function layout2(params) {
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr, earLen = params.earSize * 2 * hr * 1.8;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen };
  }
  // packages/core/dist/generator/versioned.js
  function layoutCritter2(params) {
    if (params.version === "1")
      return layout2(params);
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen: params.earSize * 2 * hr * 1.8 };
  }
  // packages/app/src/portraits/colour.ts
  var multiply = (matrix, vector) => matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
  function linear(lightness, chroma, hue) {
    let angle = hue * Math.PI / 180, lms = multiply([[1, 0.3963377773761749, 0.2158037573099136], [1, -0.1055613458156586, -0.0638541728258133], [1, -0.0894841775298119, -1.2914855480194092]], [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)]), xyz = multiply([[1.2268798758459243, -0.5578149944602171, 0.2813910456659647], [-0.0405757452148008, 1.112286803280317, -0.0717110580655164], [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]], lms.map((value) => value ** 3));
    return multiply([[3.2409699419045226, -1.537383177570094, -0.4986107602930034], [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559], [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]], xyz);
  }
  function colour(lightness, chroma, hue) {
    let low = 0, high = chroma, rgb = linear(lightness, chroma, hue), inGamut = (values) => values.every((value) => value >= -0.0000001 && value <= 1.0000001);
    if (!inGamut(rgb)) {
      for (let step = 0;step < 24; step++) {
        let candidate = (low + high) / 2;
        if (inGamut(linear(lightness, candidate, hue)))
          low = candidate;
        else
          high = candidate;
      }
      rgb = linear(lightness, low, hue);
    }
    rgb = rgb.map((value) => Math.max(0, Math.min(1, value)));
    let css = "#" + rgb.map((value) => Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** 0.4166666666666667 - 0.055)).toString(16).padStart(2, "0")).join("");
    return { linear: rgb, css };
  }
  function palette(params) {
    return { body: colour(params.lightness, params.chroma, params.hue), accent: colour(params.lightness + 0.12, params.chroma, params.hue + params.accentShift) };
  }

  // packages/app/src/styles/tokens.ts
  var tokens = {
    oat: "#F6F0E4",
    surface: "#F6F0E4",
    sunken: "#EADFD2",
    burrow: "#2E2226",
    soil: "#6B5B5E",
    bark: "#6B5B5E",
    line: "rgb(46 34 38 / .14)",
    "line-strong": "#2E2226",
    honey: "#CFA552",
    crust: "#A86B14",
    "honey-tint": "#F5E6C4",
    moss: "#6B7F4A",
    "moss-ink": "#43552B",
    "moss-tint": "#DDE5CC",
    clay: "#C2563C",
    "clay-ink": "#973A26",
    "clay-tint": "#F3D9D0",
    dusk: "#7C7A94",
    text: "var(--cc-burrow)",
    bg: "var(--cc-oat)",
    focus: "var(--cc-burrow)",
    ink: "var(--cc-burrow)",
    action: "#D9A441",
    "action-text": "var(--cc-burrow)",
    ok: "var(--cc-moss)",
    error: "var(--cc-clay)",
    crumb: "var(--cc-honey)",
    "font-display": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-wordmark": 'Grandstander, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-body": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-data": 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    "text-xs": ".75rem",
    "text-sm": ".875rem",
    "text-lg": "1rem",
    "text-xl": "1.25rem",
    "space-1": "0.25rem",
    "space-2": "0.5rem",
    "space-3": "0.75rem",
    "space-4": "1rem",
    "space-5": "1.25rem",
    "space-6": "1.5rem",
    "space-7": "2rem",
    "space-8": "2.5rem",
    "space-9": "3rem",
    "space-10": "4rem",
    "radius-pill": "999px",
    "shadow-1": "2px 2px 0 rgb(46 107 114 / .32)",
    "shadow-2": "3px 3px 0 rgb(46 107 114 / .32)",
    "shadow-3": "3px 3px 0 rgb(46 107 114 / .32)",
    "ground-glow": "radial-gradient(120% 60% at 15% -10%, #FBF4E6 0%, transparent 60%)",
    "ease-out": "cubic-bezier(.2,.8,.2,1)",
    "ease-hop": "cubic-bezier(.3,1.4,.5,1)",
    "z-canvas": "0",
    "z-content": "1",
    "z-sticky": "10",
    "z-sheet": "20",
    "dur-1": "120ms",
    "dur-2": "200ms",
    "dur-3": "320ms",
    "dur-4": "600ms",
    "text-md": "1rem",
    "text-2xl": "1.75rem",
    "text-3xl": "1.75rem",
    "radius-sm": "8px",
    "radius-md": "999px",
    "radius-lg": "22px",
    "shadow-up": "3px 3px 0 rgb(46 107 114 / .32)",
    border: "1.5px solid var(--cc-line-strong)",
    "border-strong": "1.5px solid var(--cc-line-strong)",
    "ease-in-out": "cubic-bezier(.6,0,.2,1)",
    "text-2": "var(--cc-soil)",
    "text-3": "var(--cc-bark)",
    "bg-raised": "var(--cc-surface)",
    "bg-sunken": "var(--cc-sunken)",
    "ok-text": "var(--cc-moss-ink)",
    "ok-bg": "var(--cc-moss-tint)",
    "error-text": "var(--cc-clay-ink)",
    "error-bg": "var(--cc-clay-tint)",
    "crumb-edge": "var(--cc-crust)",
    "light-day-sky": "#FFF4E3",
    "light-day-ground": "#C7A67C",
    "light-day-sky-intensity": 0.9,
    "light-day-sun": "#FFE2B8",
    "light-day-sun-intensity": 1.5,
    "light-day-sun-x": 3,
    "light-day-sun-y": 6,
    "light-day-sun-z": 4,
    "light-day-ambient": "#F1E7D6",
    "light-day-ambient-intensity": 0.2,
    "light-dusk-sky": "#E9E2F0",
    "light-dusk-ground": "#8C7C90",
    "light-dusk-sky-intensity": 0.6,
    "light-dusk-sun": "#C8BFE0",
    "light-dusk-sun-intensity": 0.7,
    "light-dusk-sun-x": -2,
    "light-dusk-sun-y": 5,
    "light-dusk-sun-z": 3,
    "light-dusk-ambient": "#D9D2E3",
    "light-dusk-ambient-intensity": 0.25,
    "light-feast-sky": "#FFF1D6",
    "light-feast-ground": "#D9A860",
    "light-feast-sky-intensity": 1.1,
    "light-feast-sun": "#FFD590",
    "light-feast-sun-intensity": 2,
    "light-feast-sun-x": 2,
    "light-feast-sun-y": 7,
    "light-feast-sun-z": 3,
    "light-feast-ambient": "#F1E7D6",
    "light-feast-ambient-intensity": 0.25,
    "crumb-highlight": "#F3DF95",
    pod: "#C9A15E",
    "pod-stem": "#5E7D45",
    "pod-leaf": "#8DB46A",
    "floor-base": "#D9CBB2",
    "scene-filter": "saturate(.82) brightness(1.05) sepia(.1)",
    "scene-wash": "linear-gradient(to bottom, rgb(246 240 228 / .05), rgb(246 240 228 / .2) 55%, rgb(246 240 228 / .42))",
    "portrait-cream": "#F3E6D6",
    "portrait-light": "#FBF0DC",
    "portrait-line-width": 2.1,
    "portrait-eye": "#2C2129",
    "portrait-eye-shade": "#5B4350",
    "portrait-cheek": "#F5A95D",
    "portrait-tone-0-base": "#CDB3A9",
    "portrait-tone-0-shadow": "#9A7A80",
    "portrait-tone-0-light": "#EBD9CF",
    "portrait-tone-0-soft": "#F3EAE4",
    "portrait-tone-1-base": "#B69993",
    "portrait-tone-1-shadow": "#86686E",
    "portrait-tone-1-light": "#DDC2B7",
    "portrait-tone-1-soft": "#EFE4DF",
    "portrait-tone-2-base": "#A3837F",
    "portrait-tone-2-shadow": "#74585F",
    "portrait-tone-2-light": "#CCAFA6",
    "portrait-tone-2-soft": "#E6D5CF",
    "floor-grain-opacity": 0.12,
    "element-fire-shadow": "#852318",
    "element-fire-base": "#EB521D",
    "element-fire-light": "#F5A95D",
    "element-fire-soft": "#FCE7DE",
    "element-earth-shadow": "#156152",
    "element-earth-base": "#289946",
    "element-earth-light": "#ACE676",
    "element-earth-soft": "#DEF5DA",
    "element-water-shadow": "#263580",
    "element-water-base": "#2564B8",
    "element-water-light": "#84D3F0",
    "element-water-soft": "#E1EDFC",
    "element-air-shadow": "#52366B",
    "element-air-base": "#B26ACC",
    "element-air-light": "#E9BBF0",
    "element-air-soft": "#F1E3FA",
    "floor-shade": "linear-gradient(to bottom, rgb(20 10 10 / .55) var(--scene-wall-height), rgb(20 10 10 / .12) calc(var(--scene-wall-height) + 16%), transparent 66%)",
    "scene-grain": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2 0 0 0 0 .15 0 0 0 0 .2 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
  };

  // packages/app/src/portraits/index.ts
  var NS = "http://www.w3.org/2000/svg", UNIT = 46, FOOT = 140, CENTER = 60, state = /* @__PURE__ */ new WeakMap;
  function createPortrait(document2, params, options) {
    let geometry = layout2(params), paints = palette(params);
    function element(tag, attrs = {}, parent) {
      let node = document2.createElementNS(NS, tag);
      for (let [key, value] of Object.entries(attrs))
        node.setAttribute(key, String(value));
      return parent?.append(node), node;
    }
    let svg = element("svg", { viewBox: "0 0 120 150", class: "portrait", focusable: "false", "data-size": options.size ?? "stage" });
    if (options.decorative)
      svg.setAttribute("aria-hidden", "true");
    else
      svg.setAttribute("role", "img"), element("title", {}, svg).textContent = options.name;
    if (options.size && options.size !== "stage")
      svg.setAttribute("width", String(options.size)), svg.setAttribute("height", String(options.size * 1.25));
    for (let key of ["earType", "bodyShape", "headShape", "markings", "tailType", "eyeStyle"])
      svg.dataset[key] = params[key];
    let style = svg.style;
    style.setProperty("--body", paints.body.css), style.setProperty("--accent", paints.accent.css), style.setProperty("--scale-x", String(1 + GROWTH.scaleGain * (options.fed ?? 0))), style.setProperty("--scale-y", String(1 + GROWTH.scaleGain * (options.fed ?? 0))), style.setProperty("--head-tilt", `${params.headTilt}deg`), style.setProperty("--cheeks", params.cheeks || (options.fed ?? 0) >= RIG.cheekThreshold ? "1" : "0"), style.setProperty("--lids", options.asleep ? "0.12" : "1"), svg.dataset.asleep = String(options.asleep ?? !1), style.setProperty("--ear-l", `${options.asleep ? -IDLE.asleep.earDroop : 0}deg`), style.setProperty("--ear-r", `${options.asleep ? -IDLE.asleep.earDroop : 0}deg`), element("ellipse", { cx: CENTER, cy: FOOT + 1, rx: geometry.bw * UNIT * 1.2, ry: 4, fill: tokens.burrow, opacity: 0.18, class: "portrait__shadow" }, svg);
    let figure = element("g", { class: "portrait__figure" }, svg), bodyY = FOOT - geometry.bodyC * UNIT, headY = FOOT - geometry.headC * UNIT, width = geometry.bw * UNIT, height = geometry.bh * UNIT, radius = geometry.hr * UNIT, rear = element("g", { fill: "var(--accent)" }, figure);
    if (params.tailType === "puff")
      element("circle", { cx: CENTER + width * 0.9, cy: bodyY + height * 0.45, r: radius * 0.48 }, rear);
    if (params.tailType === "stub")
      element("ellipse", { cx: CENTER + width, cy: bodyY + height * 0.55, rx: radius * 0.65, ry: radius * 0.26, transform: `rotate(-25 ${CENTER + width} ${bodyY + height * 0.55})` }, rear);
    if (params.tailType === "curl")
      element("path", { d: `M${CENTER + width * 0.7} ${bodyY + height * 0.6} q${radius * 1.5} ${radius * 0.3} ${radius} ${-radius * 0.5} q${-radius * 0.5} ${-radius * 0.5} ${-radius * 0.55} 0`, fill: "none", stroke: "var(--accent)", "stroke-width": radius * 0.35, "stroke-linecap": "round" }, rear);
    for (let side of [-1, 1])
      element("rect", { x: CENTER + side * width * 0.44 - 0.1 * UNIT, y: FOOT - geometry.leg * UNIT, width: 0.2 * UNIT, height: geometry.leg * UNIT, rx: 0.1 * UNIT, fill: "var(--body)" }, figure);
    let body = element("g", { transform: params.bodyShape === "bean" ? `translate(${CENTER} ${bodyY}) skewX(5) translate(${-CENTER} ${-bodyY})` : "", "data-part": "body" }, figure);
    if (element("ellipse", { cx: CENTER, cy: bodyY, rx: width, ry: height, fill: "var(--body)" }, body), params.belly > 0)
      element("ellipse", { cx: CENTER + width * 0.08, cy: bodyY + height * 0.3, rx: width * (1 + params.belly * 0.25), ry: height * 0.65, fill: "var(--body)" }, body);
    if (params.markings === "belly patch")
      element("ellipse", { cx: CENTER + width * 0.12, cy: bodyY + height * 0.22, rx: width * 0.57, ry: height * 0.62, fill: "var(--accent)" }, body);
    if (params.markings === "spots")
      for (let [x, y, r] of [[-0.5, 0.05, 0.18], [0.1, 0.42, 0.15], [0.42, -0.12, 0.2]])
        element("circle", { cx: CENTER + x * width, cy: bodyY + y * height, r: r * width, fill: "var(--accent)" }, body);
    if (params.armType !== "none")
      for (let side of [-1, 1])
        element("ellipse", { cx: CENTER + side * width * 0.95, cy: bodyY + height * 0.05, rx: radius * (params.armType === "paws" ? 0.33 : 0.22), ry: radius * 0.5, fill: "var(--accent)", transform: `rotate(${side * -15} ${CENTER + side * width * 0.95} ${bodyY})` }, figure);
    let headAnchor = element("g", { transform: `translate(${CENTER} ${headY})` }, figure), head = element("g", { class: "portrait__head" }, headAnchor), earLength = geometry.earLen * UNIT;
    if (params.earType !== "none")
      for (let side of [-1, 1]) {
        let anchor = element("g", { transform: `translate(${side * radius * 0.64} ${-radius * 0.65})` }, head), ear = element("g", { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}` }, anchor);
        ear.style.setProperty("--ear-base", `${side * (params.earSpread + (params.earType === "floppy" ? 70 : 0))}deg`), ear.style.setProperty("--ear-side", String(side));
        let earWidth = earLength * (params.earType === "long" ? 0.27 : 0.48), path = params.earType === "pointed" ? `M${-earWidth} 0 Q${-earWidth * 0.8} ${-earLength * 0.55} 0 ${-earLength} Q${earWidth * 0.8} ${-earLength * 0.55} ${earWidth} 0 Z` : params.earType === "tufts" ? `M${-earWidth} 0 L${-earWidth * 0.8} ${-earLength * 0.65} L${-earWidth * 0.15} ${-earLength * 0.5} L0 ${-earLength} L${earWidth * 0.35} ${-earLength * 0.55} L${earWidth} ${-earLength * 0.7} L${earWidth} 0 Z` : `M${-earWidth} 0 C${-earWidth * 1.4} ${-earLength * 0.7} ${-earWidth * 0.7} ${-earLength} 0 ${-earLength} C${earWidth * 0.9} ${-earLength} ${earWidth * 1.3} ${-earLength * 0.6} ${earWidth} 0 Z`;
        element("path", { d: path, fill: "var(--body)" }, ear), element("path", { d: path, fill: "var(--accent)", transform: "scale(.6 .72)" }, ear);
      }
    if (params.headShape === "squarish")
      element("rect", { x: -radius * 1.1, y: -radius * 0.92, width: radius * 2.2, height: radius * 1.84, rx: radius * 0.52, fill: "var(--body)" }, head);
    else
      element("ellipse", { cx: 0, cy: 0, rx: radius, ry: radius * (params.headShape === "egg" ? 1.15 : 1), fill: "var(--body)" }, head);
    let eyeRadius = params.eyeSize * radius, eyeY = (0.5 - params.eyeHeight) * radius * 2;
    for (let side of [-1, 1]) {
      let eye = element("g", { transform: `translate(${side * params.eyeSpacing * radius} ${eyeY})` }, head), awake = element("g", { class: "portrait__eye" }, eye);
      if (params.eyeStyle === "oval")
        awake.setAttribute("transform", "scale(.85 1.15)");
      element("circle", { r: eyeRadius, fill: tokens.surface }, awake);
      let pupil = element("g", { class: "portrait__pupil" }, awake);
      if (element("circle", { cx: eyeRadius * 0.15, r: params.pupilSize * eyeRadius, fill: tokens.burrow }, pupil), element("circle", { cx: eyeRadius * 0.3, cy: -eyeRadius * 0.25, r: eyeRadius * 0.15, fill: tokens.surface }, pupil), params.eyeStyle === "half-lid")
        element("path", { d: `M${-eyeRadius} 0 A${eyeRadius} ${eyeRadius} 0 0 1 ${eyeRadius} 0 Z`, fill: "var(--body)" }, awake);
      element("path", { d: `M${-eyeRadius} 0 Q0 ${eyeRadius * 0.65} ${eyeRadius} 0`, fill: "none", stroke: tokens.burrow, "stroke-width": 1.2, "stroke-linecap": "round", class: "portrait__sleep-eye" }, eye);
      let cheek = element("g", { transform: `translate(${side * radius * 0.63} ${radius * 0.28})` }, head);
      element("ellipse", { rx: radius * 0.21, ry: radius * 0.13, fill: "var(--accent)", class: "portrait__cheek" }, cheek);
    }
    if (params.snout === "button")
      element("ellipse", { cx: radius * 0.05, cy: radius * 0.23, rx: radius * 0.14, ry: radius * 0.1, fill: "var(--accent)" }, head);
    if (params.snout === "muzzle")
      element("ellipse", { cx: radius * 0.08, cy: radius * 0.28, rx: radius * 0.3, ry: radius * 0.19, fill: "var(--accent)" }, head);
    return element("path", { d: `M${-radius * 0.2} ${radius * 0.4} Q0 ${radius * 0.65} ${radius * 0.22} ${radius * 0.4}`, fill: "none", stroke: tokens.burrow, "stroke-width": 1.1, "stroke-linecap": "round", opacity: (options.fed ?? 0) >= RIG.mouthThreshold ? RIG.mouthOpacity : 0, class: "portrait__mouth" }, head), state.set(svg, { eyeRadius, headRadius: radius }), svg;
  }
  function rememberPortrait(svg, radii) {
    state.set(svg, radii);
  }

  // packages/app/src/portraits/metrics.ts
  var tails = { puff: [0.95, 0.46], stub: [1.02, 0.5], branch: [0.9, 1.51], tadpole: [0.9, 1.34], spark: [0.9, 1.27], emberwisp: [0.9, 1.07], cloudwisp: [0.9, 1.25], longwisp: [0.9, 1.95] }, crests = { sapling: 0.62, droplet: 0.72, reed: 0.85, ember: 0.78, seedpods: 0.45 };
  function portraitMetrics(params, fed = 0) {
    let g = layoutCritter2(params), R = g.hr * 54 * 1.22, W = g.bw * 54 * 1.04, H = g.bh * 54 * 0.9, Rt = R * 0.8, bodyY = 140 - H * 0.96 - 2, headY = bodyY - H * 0.8 - R * 0.45, earLength = g.earLen * 54 * 0.78, headTop = headY - R * (params.headShape === "egg" ? 1.12 : 1), angle = params.earSpread * Math.PI / 180, topY = Math.min(headTop - (params.version === "2" ? crests[params.crest] ?? (params.element === "air" ? 0.3 : 0) : 0) * R, headY - R * 0.62 - earLength * 0.95 * Math.max(0, Math.cos(angle)), headTop) - 2, [wReach, rReach] = tails[params.tailType] ?? [1, 0], rightX = 60 + wReach * W + rReach * Rt, grow = 1 + 0.2 * fed, fit = Math.min(1, 134 / ((140 - topY) * grow), 56 / ((rightX - 60) * grow)), halfW = Math.max(R, W * 0.86, R * 0.64 + earLength * 0.95 * Math.abs(Math.sin(angle))) + 2, scale = fit * grow, extent = { top: (140 - (140 - topY) * scale) / 150, left: (60 - halfW * scale) / 120, right: (60 + Math.max(halfW, rightX - 60 + 2) * scale) / 120, headY: (140 - (140 - headY) * scale) / 150, headRadius: R * scale / 120 };
    if (params.version === "1") {
      let hr = g.hr * 46, hy = 140 - g.headC * 46;
      extent.top = Math.max(0, (hy - hr - g.earLen * 46 * 0.65) / 150), extent.left = 0.13, extent.right = 0.9, extent.headY = hy / 150, extent.headRadius = hr / 120;
    }
    return { R, W, H, Rt, bodyY, headY, earLength, headTop, topY, rightX, fit, grow, halfW, scale, extent };
  }

  // packages/app/src/portraits/painter-v2.ts
  var inkedPortraitLook = { line: tokens.burrow, lineW: tokens["portrait-line-width"], shading: "paint", hatch: !0, grain: !0, cream: tokens["portrait-cream"], tones: [
    { base: tokens["portrait-tone-0-base"], shadow: tokens["portrait-tone-0-shadow"], light: tokens["portrait-tone-0-light"], soft: tokens["portrait-tone-0-soft"] },
    { base: tokens["portrait-tone-1-base"], shadow: tokens["portrait-tone-1-shadow"], light: tokens["portrait-tone-1-light"], soft: tokens["portrait-tone-1-soft"] },
    { base: tokens["portrait-tone-2-base"], shadow: tokens["portrait-tone-2-shadow"], light: tokens["portrait-tone-2-light"], soft: tokens["portrait-tone-2-soft"] }
  ] }, ELEMENT = {
    earth: { base: tokens["element-earth-base"], shadow: tokens["element-earth-shadow"], light: tokens["element-earth-light"], soft: tokens["element-earth-soft"] },
    water: { base: tokens["element-water-base"], shadow: tokens["element-water-shadow"], light: tokens["element-water-light"], soft: tokens["element-water-soft"] },
    fire: { base: tokens["element-fire-base"], shadow: tokens["element-fire-shadow"], light: tokens["element-fire-light"], soft: tokens["element-fire-soft"] },
    air: { base: tokens["element-air-base"], shadow: tokens["element-air-shadow"], light: tokens["element-air-light"], soft: tokens["element-air-soft"] }
  }, paintDefinitions = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="loose" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="loose2" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fur" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .14  0 0 0 0 .11  0 0 0 0 .15  0 0 0 .16 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="SourceGraphic" in2="gi" mode="multiply"/></filter>
    <filter id="poster" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1"/></feComponentTransfer></filter>
    <pattern id="strokes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><path d="M0 3.5 H4.6" stroke="${tokens.burrow}" stroke-width="1.7" stroke-linecap="round" opacity=".28"/></pattern>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0 L0 4" stroke="${tokens.burrow}" stroke-width="1.1" opacity=".5"/></pattern>
</defs></svg>`, serial = 0, FOOT2 = 140, CENTER2 = 60, BOX_H = 150;
  function mix(a, b, amount) {
    let rgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)), A = rgb(a), B = rgb(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * amount).toString(16).padStart(2, "0")).join("");
  }
  function paintV2(document2, params, state, look = inkedPortraitLook) {
    function s(tag, attrs = {}, parent) {
      let node = document2.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [key, value] of Object.entries(attrs))
        if (value !== null && value !== void 0)
          node.setAttribute(key, String(value));
      return parent?.append(node), node;
    }
    function paintedFill(defs, id, tone) {
      let grad = s("radialGradient", { id: `${id}-g${++serial}`, cx: 0.34, cy: 0.28, r: 0.95 }, defs);
      return s("stop", { offset: 0, "stop-color": tone.light }, grad), s("stop", { offset: 0.46, "stop-color": tone.base }, grad), s("stop", { offset: 1, "stop-color": tone.shadow }, grad), `url(#${grad.id})`;
    }
    function shaded(parent, defs, id, e, tone, st, strokeWidth, extra = {}) {
      let fill = st.shading === "paint" ? paintedFill(defs, id, tone) : tone.base;
      s("ellipse", { ...e, fill, ...extra }, parent);
      let clip = s("clipPath", { id: `${id}-c${++serial}` }, defs);
      s("ellipse", e, clip);
      let inner = s("g", { "clip-path": `url(#${clip.id})`, ...extra }, parent);
      if (st.shading === "flat")
        s("ellipse", { cx: e.cx + e.rx * 0.42, cy: e.cy + e.ry * 0.5, rx: e.rx * 1.05, ry: e.ry, fill: tone.shadow }, inner);
      else {
        let crescent = s("clipPath", { id: `${id}-k${++serial}` }, defs);
        s("ellipse", { cx: e.cx + e.rx * 0.5, cy: e.cy + e.ry * 0.58, rx: e.rx * 1.02, ry: e.ry * 0.98 }, crescent);
        let cel = s("g", { "clip-path": `url(#${crescent.id})` }, inner);
        s("rect", { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: tone.shadow, opacity: 0.5 }, cel), s("rect", { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: st.hatch ? "url(#hatch)" : "url(#strokes)" }, cel);
      }
      s("ellipse", { ...e, fill: "none", stroke: st.line, "stroke-width": strokeWidth * 0.55, opacity: 0.32, filter: "url(#loose2)", transform: `${extra.transform ?? ""} translate(1.2 .8)` }, parent), s("ellipse", { ...e, fill: "none", stroke: st.line, "stroke-width": strokeWidth, opacity: 0.9, filter: "url(#loose)", ...extra }, parent);
    }
    function paint(params, st, { size = 0, delighted = !1, fed = 0, asleep = !1 } = {}) {
      let el = ELEMENT[params.element], id = `pc${++serial}`, own = palette(params).body.css, base = st.element ? { base: el.light, shadow: el.base, light: el.soft, soft: el.soft } : st.tones[Math.floor(params.idlePhase * 3) % 3], PAGE = tokens.oat, LINE = st.line, PEACH = tokens["portrait-cheek"], EYE = tokens["portrait-eye"], lw = st.lineW, softened = mix(own, st.cream, 0.55), tone = st.element ? base : { base: mix(softened, base.base, 0.25), shadow: mix(mix(own, LINE, 0.3), base.shadow, 0.3), light: mix(softened, tokens["portrait-light"], 0.45), soft: base.soft }, svg = s("svg", { viewBox: `0 0 120 ${BOX_H}`, class: `critter${delighted ? " delighted" : ""}${asleep ? " asleep" : ""}`, "aria-hidden": "true" });
      if (size)
        svg.style.width = `${size}px`;
      svg.style.setProperty("--head-tilt", `${params.headTilt}deg`), svg.style.setProperty("--cheeks", delighted || params.cheeks ? "1" : "0"), svg.style.setProperty("--mouth", delighted ? "1" : "0"), svg.style.setProperty("--d", `${(params.idlePhase * 5).toFixed(2)}s`);
      let defs = s("defs", {}, svg), { R, W, H, Rt, bodyY, headY, earLength, fit, extent } = portraitMetrics(params, fed);
      for (let [key, value] of Object.entries(extent))
        svg.dataset[key === "headY" ? "hy" : key === "headRadius" ? "hr" : key] = value.toFixed(3);
      s("ellipse", { cx: CENTER2, cy: FOOT2 + 2, rx: W * 1.3 * fit, ry: 4.5, fill: LINE, opacity: 0.14 }, svg);
      let fitGroup = s("g", { transform: fit < 1 ? `translate(${CENTER2} ${FOOT2}) scale(${fit.toFixed(4)}) translate(${-CENTER2} ${-FOOT2})` : null }, svg), figure = s("g", { class: "portrait__figure" }, fitGroup), body = s("g", { transform: fed ? `translate(${CENTER2} ${FOOT2}) scale(${(1 + 0.2 * fed).toFixed(3)}) translate(${-CENTER2} ${-FOOT2})` : null }, figure), tx = CENTER2 + W * 0.9, ty = bodyY + H * 0.3;
      ({
        puff: () => shaded(body, defs, id, { cx: CENTER2 + W * 0.95, cy: bodyY + H * 0.45, rx: Rt * 0.46, ry: Rt * 0.42 }, tone, st, lw * 0.8),
        stub: () => shaded(body, defs, id, { cx: CENTER2 + W * 1.02, cy: bodyY + H * 0.5, rx: Rt * 0.5, ry: Rt * 0.26 }, tone, st, lw * 0.75),
        branch: () => {
          s("path", { d: `M${tx} ${ty} q${Rt * 0.9} ${-Rt * 0.2} ${Rt * 1.3} ${-Rt * 1.4}`, fill: "none", stroke: tone.shadow, "stroke-width": Rt * 0.14, "stroke-linecap": "round" }, body);
          for (let [dx, dy, sz, turn] of [[0.5, -0.3, 0.34, -35], [1, -0.8, 0.3, -60], [1.25, -1.35, 0.26, -80]])
            s("ellipse", { cx: tx + dx * Rt, cy: ty + dy * Rt, rx: sz * Rt, ry: sz * Rt * 0.55, transform: `rotate(${turn} ${tx + dx * Rt} ${ty + dy * Rt})`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, body);
        },
        tadpole: () => {
          s("path", { d: `M${tx - Rt * 0.2} ${ty - Rt * 0.15} q${Rt * 1.1} ${-Rt * 0.1} ${Rt * 1.5} ${-Rt * 0.9} q${-Rt * 0.2} ${Rt * 0.7} ${-Rt * 1.2} ${Rt * 1.15} z`, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.7, filter: "url(#loose)" }, body), s("circle", { cx: tx + Rt * 1.2, cy: ty - Rt * 0.85, r: Rt * 0.14, fill: el.light }, body);
        },
        spark: () => {
          for (let [dx, dy, sz] of [[0.45, -0.5, 0.2], [0.85, -1, 0.16], [1.15, -1.55, 0.12]])
            s("circle", { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: el.light, stroke: el.base, "stroke-width": 0.8 }, body);
        },
        emberwisp: () => {
          s("path", { d: `M${tx - Rt * 0.2} ${ty - Rt * 0.1} q${Rt * 0.9} ${-Rt * 0.4} ${Rt * 1.1} ${-Rt * 1.4} q${-Rt * 0.05} ${Rt * 0.8} ${-Rt * 0.8} ${Rt * 1.25} z`, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.7, filter: "url(#loose)" }, body), s("circle", { cx: tx + Rt * 0.9, cy: ty - Rt * 1.45, r: Rt * 0.17, fill: el.light, stroke: el.base, "stroke-width": 0.8 }, body);
        },
        cloudwisp: () => {
          for (let [dx, dy, sz] of [[0.4, 0, 0.4], [0.95, -0.28, 0.3]])
            s("circle", { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: tone.light, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, body);
        },
        longwisp: () => s("path", { d: `M${tx - Rt * 0.2} ${ty} q${Rt * 1.2} ${-Rt * 0.1} ${Rt * 1.7} ${-Rt * 0.8} q${Rt * 0.15} ${-Rt * 0.45} ${Rt * 0.45} ${-Rt * 0.8} q${-Rt * 0.6} ${Rt * 0.9} ${-Rt * 1.95} ${Rt * 1.75} z`, fill: tone.light, stroke: LINE, "stroke-width": lw * 0.65, filter: "url(#loose)" }, body)
      })[params.tailType]?.();
      let furGroup = s("g", { filter: st.grain ? "url(#fur)" : null }, body);
      shaded(furGroup, defs, id, { cx: CENTER2, cy: bodyY, rx: W, ry: H }, tone, st, lw);
      let belly = params.markings === "belly" ? mix(tone.soft, el.light, 0.45) : tone.soft;
      if (s("ellipse", { cx: CENTER2 + W * 0.05, cy: bodyY + H * 0.32, rx: W * 0.56, ry: H * 0.52, fill: belly, opacity: 0.9 }, body), ["moss", "dew", "sky"].includes(params.markings))
        for (let [x, y, r] of [[-0.52, -0.18, 0.17], [0.44, 0.06, 0.14], [-0.3, 0.5, 0.11]])
          s("ellipse", { cx: CENTER2 + x * W, cy: bodyY + y * H, rx: W * r, ry: H * r * 0.7, fill: el.light, opacity: 0.78 }, body);
      let glowAt = params.spot === "throat" ? [CENTER2, bodyY - H * 0.55] : params.spot === "brow" ? null : [CENTER2 + W * 0.05, bodyY + H * 0.05];
      if (glowAt) {
        let glow = s("radialGradient", { id: `${id}-w${++serial}` }, defs);
        s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.75 }, glow), s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow), s("circle", { cx: glowAt[0], cy: glowAt[1], r: W * 0.42, fill: `url(#${glow.id})` }, body);
      }
      for (let side of [-1, 1])
        shaded(body, defs, id, { cx: CENTER2 + side * W * 0.6, cy: bodyY + H * 0.1, rx: R * 0.24, ry: R * 0.32 }, tone, st, lw * 0.75, { transform: `rotate(${side * -22} ${CENTER2 + side * W * 0.6} ${bodyY + H * 0.1})` });
      for (let side of [-1, 1])
        s("ellipse", { cx: CENTER2 + side * W * 0.46, cy: FOOT2 - 3.5, rx: W * 0.36, ry: W * 0.21, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.8, filter: "url(#loose)" }, body), s("ellipse", { cx: CENTER2 + side * W * 0.46, cy: FOOT2 - 3, rx: W * 0.2, ry: W * 0.1, fill: mix(tone.base, tone.shadow, 0.35) }, body);
      let headAnchor = s("g", { transform: `translate(${CENTER2} ${headY})` }, body), head = s("g", { class: "portrait__head", transform: `rotate(${params.headTilt})` }, headAnchor);
      for (let side of [-1, 1]) {
        let earAnchor = s("g", { transform: `translate(${side * R * 0.64} ${-R * 0.62})` }, head), anchor = s("g", { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${side * params.earSpread}deg` }, earAnchor), w = earLength * 0.46, L = earLength * 0.95, d = {
          pointed: `M${-w} 0 Q${-w * 0.8} ${-L * 0.55} 0 ${-L} Q${w * 0.8} ${-L * 0.55} ${w} 0 Z`,
          tufts: `M${-w} 0 L${-w * 0.8} ${-L * 0.65} L${-w * 0.15} ${-L * 0.5} L0 ${-L} L${w * 0.35} ${-L * 0.55} L${w} ${-L * 0.7} L${w} 0 Z`,
          leaf: `M0 0 C${-w * 1.3} ${-L * 0.35} ${-w * 0.7} ${-L * 0.8} 0 ${-L} C${w * 0.7} ${-L * 0.8} ${w * 1.3} ${-L * 0.35} 0 0 Z`,
          fin: `M${-w * 0.9} 0 C${-w * 0.6} ${-L * 0.5} ${w * 0.1} ${-L * 0.9} ${w * 0.7} ${-L} C${w * 0.5} ${-L * 0.6} ${w * 0.8} ${-L * 0.25} ${w} 0 Z`,
          flame: [[-w * 0.55, 0.7], [0, 1], [w * 0.55, 0.75]].map(([dx, hh]) => `M${dx - w * 0.4} 0 C${dx - w * 0.45} ${-L * hh * 0.5} ${dx - w * 0.1} ${-L * hh * 0.7} ${dx} ${-L * hh} C${dx + w * 0.1} ${-L * hh * 0.7} ${dx + w * 0.45} ${-L * hh * 0.5} ${dx + w * 0.4} 0 Z`).join(" "),
          cloud: [[0, -L * 0.42, L * 0.42], [w * 0.55, -L * 0.78, L * 0.28]].map(([cx, cy, sz]) => `M${cx - sz} ${cy} a${sz} ${sz} 0 1 0 ${2 * sz} 0 a${sz} ${sz} 0 1 0 ${-2 * sz} 0`).join(" "),
          fern: `M${-w * 0.45} 0 C${-w * 0.7} ${-L * 0.45} ${-w * 0.35} ${-L * 0.85} ${w * 0.15} ${-L * 0.95} C${w * 0.75} ${-L * 1.02} ${w * 0.8} ${-L * 0.62} ${w * 0.3} ${-L * 0.62} C${w * 0.05} ${-L * 0.62} ${w * 0.05} ${-L * 0.78} ${w * 0.25} ${-L * 0.78} C${w * 0.1} ${-L * 0.55} ${w * 0.45} ${-L * 0.3} ${w * 0.45} 0 Z`
        }[params.earType] ?? `M${-w} 0 C${-w * 1.4} ${-L * 0.7} ${-w * 0.7} ${-L} 0 ${-L} C${w * 0.9} ${-L} ${w * 1.3} ${-L * 0.6} ${w} 0 Z`, mirror = side < 0 ? s("g", { transform: "scale(-1 1)" }, anchor) : anchor;
        s("path", { d, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.8, "stroke-linejoin": "round", filter: "url(#loose)" }, mirror), s("path", { d, fill: mix(el.soft, el.light, 0.35), opacity: 0.9, transform: "scale(.56 .68)" }, mirror);
      }
      shaded(head, defs, id, { cx: 0, cy: 0, rx: R, ry: R * (params.headShape === "egg" ? 1.12 : params.headShape === "squarish" ? 0.95 : 1) }, tone, st, lw);
      let top = -R * (params.headShape === "egg" ? 1.12 : 0.98);
      if ({
        sapling: () => {
          s("rect", { x: -R * 0.05, y: top - R * 0.5, width: R * 0.1, height: R * 0.58, rx: R * 0.05, fill: el.shadow }, head);
          for (let [cx, cy, turn] of [[-R * 0.24, top - R * 0.5, -28], [R * 0.24, top - R * 0.36, 24]])
            s("ellipse", { cx, cy, rx: R * 0.26, ry: R * 0.13, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.55, filter: "url(#loose)" }, head), s("ellipse", { cx: cx - R * 0.06, cy: cy - R * 0.04, rx: R * 0.12, ry: R * 0.05, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.light }, head);
        },
        droplet: () => {
          s("path", { d: `M0 ${top - R * 0.72} C${R * 0.27} ${top - R * 0.35} ${R * 0.24} ${top + R * 0.06} 0 ${top + R * 0.06} C${-R * 0.24} ${top + R * 0.06} ${-R * 0.27} ${top - R * 0.35} 0 ${top - R * 0.72} Z`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, head), s("circle", { cx: -R * 0.07, cy: top - R * 0.3, r: R * 0.07, fill: el.light }, head);
        },
        reed: () => {
          s("rect", { x: -R * 0.04, y: top - R * 0.8, width: R * 0.08, height: R * 0.85, rx: R * 0.04, fill: el.shadow }, head), s("ellipse", { cx: 0, cy: top - R * 0.78, rx: R * 0.1, ry: R * 0.2, fill: el.base, stroke: LINE, "stroke-width": lw * 0.5 }, head);
        },
        ember: () => {
          s("path", { d: `M${-R * 0.17} ${top + R * 0.05} C${-R * 0.22} ${top - R * 0.3} ${-R * 0.02} ${top - R * 0.45} ${R * 0.05} ${top - R * 0.78} C${R * 0.13} ${top - R * 0.4} ${R * 0.27} ${top - R * 0.25} ${R * 0.19} ${top + R * 0.05} Z`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, head), s("path", { d: `M${-R * 0.07} ${top + R * 0.02} C${-R * 0.09} ${top - R * 0.2} ${R * 0.02} ${top - R * 0.3} ${R * 0.04} ${top - R * 0.5} C${R * 0.07} ${top - R * 0.25} ${R * 0.12} ${top - R * 0.15} ${R * 0.09} ${top + R * 0.02} Z`, fill: el.light }, head);
        },
        seedpods: () => {
          for (let dx of [-0.3, 0, 0.3])
            s("circle", { cx: dx * R, cy: top - R * (dx === 0 ? 0.28 : 0.13), r: R * 0.16, fill: el.base, stroke: LINE, "stroke-width": lw * 0.5 }, head), s("circle", { cx: dx * R - R * 0.05, cy: top - R * (dx === 0 ? 0.33 : 0.18), r: R * 0.06, fill: el.light }, head);
        }
      }[params.crest]?.(), params.element === "air")
        for (let [dx, sz] of [[-0.12, 0.2], [0.14, 0.15]])
          s("circle", { cx: dx * R, cy: top - R * 0.08, r: sz * R, fill: el.light, stroke: LINE, "stroke-width": lw * 0.5, filter: "url(#loose)" }, head);
      if (params.markings !== "none")
        s("ellipse", { cx: R * 0.14, cy: -R * 0.6, rx: R * 0.17, ry: R * 0.11, transform: `rotate(-12 ${R * 0.14} ${-R * 0.6})`, fill: el.light, opacity: 0.8 }, head);
      if (params.spot === "brow") {
        let glow = s("radialGradient", { id: `${id}-b${++serial}` }, defs);
        s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.8 }, glow), s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow), s("circle", { cx: 0, cy: -R * 0.55, r: R * 0.4, fill: `url(#${glow.id})` }, head);
      }
      if (params.snout === "muzzle")
        s("ellipse", { cx: R * 0.04, cy: R * 0.42, rx: R * 0.22, ry: R * 0.14, fill: tone.soft, stroke: LINE, "stroke-width": lw * 0.45, filter: "url(#loose)" }, head);
      let eyeR = R * (0.24 + params.eyeSize * 0.8), spread = Math.min(1, Math.max(0, (params.eyeSpacing - 0.32) / 0.3)), ex = Math.max(eyeR + R * 0.1, R * (0.38 + 0.16 * spread)), ey = R * (-0.02 + (0.5 - params.eyeHeight) * 1.2);
      for (let side of [-1, 1]) {
        let eye = s("g", { transform: `translate(${side * ex} ${ey})` }, head);
        s("path", { d: `M${-eyeR * 0.78} ${eyeR * 0.05} Q0 ${eyeR * 0.62} ${eyeR * 0.78} ${eyeR * 0.05}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.85, "stroke-linecap": "round", class: "portrait__sleep-eye" }, eye);
        let open = s("g", { class: "portrait__eye" }, eye), clip = s("clipPath", { id: `${id}-e${++serial}` }, defs);
        s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06 }, clip), s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open), s("ellipse", { cx: eyeR * 0.05, cy: eyeR * 0.5, rx: eyeR * 0.72, ry: eyeR * 0.42, fill: tokens["portrait-eye-shade"], opacity: 0.55, "clip-path": `url(#${clip.id})` }, open), s("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.2, fill: PAGE }, open), s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: "none", stroke: LINE, "stroke-width": lw * 0.5 }, open);
      }
      for (let side of [-1, 1])
        s("ellipse", { cx: side * R * 0.74, cy: R * 0.52, rx: R * 0.14, ry: R * 0.08, fill: PEACH, class: "portrait__cheek", style: params.cheeks ? "opacity:.5" : "" }, head);
      if (params.snout === "button")
        s("ellipse", { cx: R * 0.02, cy: R * 0.32, rx: R * 0.09, ry: R * 0.06, fill: tone.shadow }, head);
      return s("path", { d: `M${-R * 0.1} ${R * 0.52} Q0 ${R * 0.58} ${R * 0.1} ${R * 0.52}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.6, "stroke-linecap": "round", class: "p-calm" }, head), s("path", { d: `M${-R * 0.13} ${R * 0.5} Q0 ${R * 0.68} ${R * 0.13} ${R * 0.5}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.65, "stroke-linecap": "round", class: "portrait__mouth" }, head), rememberPortrait(svg, { headRadius: R, eyeRadius: eyeR }), svg.dataset.asleep = String(asleep), svg.classList.add("portrait", "portrait-v2"), svg;
    }
    let svg = paint(params, look, { ...state, size: typeof state.size === "number" ? state.size : 0 }), source = new DOMParser().parseFromString(paintDefinitions, "image/svg+xml"), defs = document2.importNode(source.documentElement.querySelector("defs"), !0);
    svg.prepend(defs);
    for (let node of svg.querySelectorAll("[id]")) {
      let previous = node.id, next = `paint-${++serial}-${previous}`;
      node.id = next;
      for (let drawn of svg.querySelectorAll("*"))
        for (let attribute of Array.from(drawn.attributes))
          if (attribute.value.includes(`url(#${previous})`))
            drawn.setAttribute(attribute.name, attribute.value.replaceAll(`url(#${previous})`, `url(#${next})`));
    }
    if (svg.dataset.version = params.version, svg.dataset.size = String(state.size ?? "stage"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative)
      svg.setAttribute("aria-hidden", "true");
    else
      svg.removeAttribute("aria-hidden"), svg.setAttribute("role", "img"), s("title", {}, svg).textContent = state.name;
    return svg;
  }

  // packages/app/src/game/mound-size.ts
  function moundSize(n) {
    let rows = 0;
    while (rows * (rows + 1) / 2 < n)
      rows++;
    return { rows, width: Math.max(1, rows) * 5.2 + 8, height: Math.max(1, rows) * 3.4 + 9 };
  }

  // packages/app/src/game/layout.ts
  var HEADER_HEIGHT = 64, DOCK_HEIGHT = 130, FOLDED_DOCK_HEIGHT = 74, RESULTS_FLOOR = 196, DESKTOP_MIN_WIDTH = 900, sidePanelWidth = (width) => Math.min(480, Math.max(400, width * 0.25)), STATEMENT = { inset: 12, height: 378 }, overlapArea = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  function shortName(name, limit = 10) {
    return name.length > limit ? name.slice(0, limit - 1) + "…" : name;
  }
  var nameWidth = (name) => [...name].reduce((width, ch) => width + (/[MW@]/.test(ch) ? 11 : /[ilj1 .]/.test(ch) ? 4 : 8), 0);
  function tagStyle(focusOnDesktop, crowded) {
    if (focusOnDesktop)
      return { font: 16, height: 36, frame: 31, gap: 0, counted: !1 };
    return crowded ? { font: 12, height: 26, frame: 20, gap: 4, counted: !0 } : { font: 14, height: 30, frame: 24, gap: 6, counted: !0 };
  }
  function geometry(W, floor, n, desktop, grown) {
    let growth = grown ? 0.9 : 1;
    if (desktop) {
      let u = Math.min(W / 880, floor / 606), room = (n > 8 ? 0.78 : 1) * growth, back = CIRCLE_FEEL.desktop.back * u * room, beside = Math.cos(2 * Math.PI / n), frontY = floor * 0.95, backY = Math.max(floor * 0.22, back * 1.04 + 40), ry = Math.min((frontY - backY) / (1 + beside), floor * 0.4);
      return { u, cx: W / 2, cy: backY + ry, rx: W * (n > 8 ? 0.44 : 0.42), ry, back, front: CIRCLE_FEEL.desktop.front * u * room, focusY: floor - 14 * u, focusSize: CIRCLE_FEEL.desktop.focus * u * growth, ppu: 4.2 * u, maxHeap: 210 * u };
    }
    let crowd = (n > 8 ? 0.8 : n > 6 ? 0.94 : 1) * growth;
    return { u: 1, cx: W / 2, cy: floor * (n > 8 ? 0.475 : n > 6 ? 0.455 : 0.45), rx: W * 0.34, ry: floor * (n > 8 ? 0.32 : n > 6 ? 0.29 : 0.28), back: CIRCLE_FEEL.phone.back * crowd, front: CIRCLE_FEEL.phone.front * crowd, focusY: floor - 14, focusSize: CIRCLE_FEEL.phone.focus, ppu: 3.4, maxHeap: 150 };
  }
  function circleBackRow(viewport, count) {
    let desktop = viewport.width >= DESKTOP_MIN_WIDTH, W = viewport.width - (desktop ? sidePanelWidth(viewport.width) : 0), floor = viewport.height - HEADER_HEIGHT - DOCK_HEIGHT;
    return Math.min(...[!1, !0].map((grown) => {
      let geo = geometry(W, floor, count, desktop, grown);
      return geo.cy - geo.ry;
    }));
  }
  function surfaceHeight(surface, desktop, H) {
    if (surface.kind === "dock")
      return DOCK_HEIGHT;
    if (surface.kind === "results")
      return desktop ? FOLDED_DOCK_HEIGHT : Math.max(DOCK_HEIGHT, H - RESULTS_FLOOR);
    return desktop ? 0 : surface.height;
  }
  function layoutGame(input) {
    let desktop = input.viewport.width >= DESKTOP_MIN_WIDTH, W = input.viewport.width - (desktop ? sidePanelWidth(input.viewport.width) : 0), H = input.viewport.height - HEADER_HEIGHT, n = input.critters.length;
    if (!n || input.focus < 0 || input.focus >= n)
      throw RangeError("Invalid circle focus");
    let gathered = input.scene.huddle, dockH = surfaceHeight(input.surface, desktop, H), crowded = !desktop && n > 6, geo = geometry(W, gathered ? H - DOCK_HEIGHT : H - dockH, n, desktop, input.scene.grown), dock = { x: 0, y: H - dockH, width: W, height: dockH }, ring = input.surface.kind === "sheet", ringFloor = desktop ? H : H - dockH + 24, ringScale = desktop ? 1.5 * geo.u : 1, huddled = input.critters.map((critter, index) => ({ critter, index })).filter((entry) => !entry.critter.away), rankOf = new Map(huddled.map((entry, rank) => [entry.index, rank])), slots = input.critters.map((critter, index) => {
      let slot = (index - input.focus + n) % n, away = gathered && !!critter.away, { cx: x, focusY: y, focusSize: size } = geo, depth = 999, face = "front", ringSize = 0;
      if (gathered) {
        let m = huddled.length, rank = rankOf.get(index) ?? 0, front = m <= 5 ? m : Math.ceil(m / 2) + 1, back = m - front, crowd = m > 8 ? 0.88 : 1;
        size = (desktop ? CIRCLE_FEEL.huddle.desktop * geo.u : CIRCLE_FEEL.huddle.phone) * crowd;
        let step = size * 0.58, frontX = (j) => W / 2 + (j - (front - 1) / 2) * step;
        if (rank < front)
          x = frontX(rank), y = dock.y + size * 0.1, depth = 3200 + rank;
        else {
          let gap = Math.floor((front - 1 - back) / 2) + (rank - front);
          x = (frontX(gap) + frontX(gap + 1)) / 2, y = dock.y - size * 0.26, size *= 0.9, depth = 3100 + rank;
        }
        face = x < W / 2 ? "right" : "left";
      } else if (ring) {
        let angle = (90 - slot * 360 / n) * Math.PI / 180, sin = Math.sin(angle), cos = Math.cos(angle);
        ringSize = 66 + 32 * (sin + 1) / 2, x = W * (0.5 + 0.36 * cos), y = ringFloor * (0.67 + 0.19 * sin), size = ringSize * ringScale, depth = Math.max(1, Math.round(y)), face = cos > 0.2 ? "left" : cos < -0.2 ? "right" : "front";
      } else if (slot !== 0) {
        let angle = (90 - slot * 360 / n) * Math.PI / 180, sin = Math.sin(angle);
        x = geo.cx + geo.rx * Math.cos(angle), y = geo.cy + geo.ry * sin, size = geo.back + (geo.front - geo.back) * (sin + 1) / 2, depth = Math.max(1, Math.round(y));
      }
      let width = Math.round(size), height = Math.round(size * 1.25), ext = critter.extent, stage = { x: x - width / 2, y: y - height * 140 / 150, width, height }, figure = { x: stage.x + ext.left * width, y: stage.y + ext.top * height, width: (ext.right - ext.left) * width, height: y + 3 - (stage.y + ext.top * height) }, feastPile = ring && input.scene.grown, glyphs = feastPile ? Math.ceil(critter.count / 6) : PILE_RULE === "exact" ? critter.count : Math.ceil(critter.count / 4), pileSize = moundSize(glyphs), pileWidth = !critter.count ? 0 : feastPile ? pileSize.width * 1.9 * ringScale : pileSize.width * 1.1 / 100 * width, pileHeight = pileWidth * pileSize.height / pileSize.width, pile = feastPile ? { x: x + ringSize / 13 / 100 * W - pileWidth / 2, y: y + 0.01 * ringFloor - pileHeight, width: pileWidth, height: pileHeight, glyphs } : { x: stage.x + 0.54 * width, y: stage.y + 0.98 * height - pileHeight, width: pileWidth, height: pileHeight }, name = critter.own ? copy["scatter.own.short"] : critter.name, style = tagStyle(slot === 0 && desktop, crowded), text = (value) => input.measure?.(value, style.font, critter.own ? 700 : 800) ?? nameWidth(value) * style.font / 14, count = style.counted && !critter.own ? style.gap + text(String(critter.count)) : 0, fullWidth = Math.ceil(text(name) + style.frame + count) + 2, shortWidth = Math.ceil(text(shortName(name)) + style.frame + count) + 2, bubbleWidth = desktop ? 46 : 34, ownBubble = { x: stage.x + 0.62 * width, y: figure.y - bubbleWidth * 0.85 * 0.78, width: bubbleWidth, height: bubbleWidth * 0.85 };
      return {
        index,
        slot,
        away,
        stage,
        figure,
        pile,
        foot: { x, y },
        depth,
        face,
        fullWidth,
        shortWidth,
        name,
        ownBubble,
        tag: { x: x - fullWidth / 2, y: figure.y - 4 - style.height, width: fullWidth, height: style.height, hidden: !input.scene.tags || gathered || slot === 0 && !desktop, short: !1 }
      };
    }), focused = slots.find((it) => it.slot === 0), extent = input.critters[focused.index].extent, headR = extent.headRadius * focused.stage.width, headY = focused.stage.y + extent.headY * focused.stage.height, obstacles = slots.filter((it) => it.pile.width && it.slot !== 0).map((it) => it.pile), full = moundSize(PILE_RULE === "exact" ? input.issued : Math.ceil(input.issued / 4)), top = geo.cy - geo.ry + 12 * geo.u, bottom = desktop ? focused.figure.y - 4 - 28 - 12 : Math.min(focused.figure.y, headY - headR * 1.05 - 56) - 6, ppu = Math.min(geo.ppu, geo.maxHeap / full.width, Math.max(1, bottom - top) / full.height), heapWidth = full.width * ppu, heapHeight = full.height * ppu, span = Math.max(0, bottom - top - heapHeight), middle = top + span / 2, heap = { x: geo.cx - heapWidth / 2, y: middle, width: heapWidth, height: heapHeight }, showHeap = input.scene.heap !== "none" && !gathered;
    if (showHeap && ring) {
      if (!input.remaining) {
        let outline = moundSize(3);
        ppu = 60 * ringScale / outline.width, heapWidth = outline.width * ppu, heapHeight = outline.height * ppu;
      } else
        ppu = 1.9 * ringScale, heapWidth = full.width * ppu, heapHeight = full.height * ppu;
      Object.assign(heap, { x: W / 2 - heapWidth / 2, y: ringFloor * 0.55 - heapHeight, width: heapWidth, height: heapHeight });
    } else if (showHeap) {
      let around = slots.filter((it) => it.slot !== 0).flatMap((it) => [it.figure, { x: it.foot.x - it.shortWidth / 2, y: it.figure.y - 32, width: it.shortWidth, height: 28 }]), least = 1 / 0;
      for (let step = 0;step <= 10; step++) {
        let y = top + span * step / 10, box = { ...heap, y }, cost = around.reduce((sum, other) => sum + overlapArea(box, other), 0) + Math.abs(y - middle) * 0.5;
        if (cost < least)
          least = cost, heap.y = y;
      }
      if (!input.reading)
        obstacles.push(heap);
    }
    let bubble = { x: Math.min(focused.foot.x + Math.max(headR * 0.55, desktop ? focused.fullWidth / 2 + 6 : 0), W - 58), y: headY - headR * 1.05 - 40, width: 52, height: 44 }, bestBubble = [bubble, { ...bubble, x: Math.max(focused.foot.x - Math.max(headR * 0.55, desktop ? focused.fullWidth / 2 + 6 : 0) - 52, 6) }, { ...bubble, y: bubble.y - 16 }].map((box, index) => ({ box, cost: slots.reduce((sum, it) => sum + (it.slot === 0 ? 0 : overlapArea(box, it.figure)), 0) + index * 40 })).sort((a, b) => a.cost - b.cost)[0].box;
    if (input.scene.bubbles === "focus" && !input.reading)
      obstacles.push(bestBubble);
    let bubbles = input.scene.bubbles === "all" ? slots.filter((_, index) => !input.critters[index].own).map((it) => ({ index: it.index, rect: it.ownBubble })) : input.scene.bubbles === "focus" ? [{ index: focused.index, rect: bestBubble }] : [], statement = { x: STATEMENT.inset, y: STATEMENT.inset, width: W - STATEMENT.inset * 2, height: STATEMENT.height }, trailFrom = { x: focused.foot.x + headR * 0.8, y: headY - headR - 6 }, trailTo = { x: Math.min(focused.foot.x + headR + 36, W - 40), y: statement.y + statement.height + 6 }, trail = !desktop && input.reading ? [0.18, 0.5, 0.8].map((along, i) => {
      let size = [8, 11, 15][i];
      return { x: trailFrom.x + (trailTo.x - trailFrom.x) * along - size / 2, y: trailFrom.y + (trailTo.y - trailFrom.y) * along - size / 2, width: size, height: size };
    }) : [], visible = slots.filter((it) => !it.tag.hidden), tolerance = desktop ? input.viewport.width === 1280 ? 161 : 0 : n > 8 ? 123 : 0, choices = visible.map((it) => {
      let above = it.figure.y - 4 - it.tag.height, options = (it.shortWidth < it.fullWidth && !(it.slot === 0 && desktop) ? [it.fullWidth, it.shortWidth] : [it.fullWidth]).flatMap((width, shortIndex) => Array.from({ length: 65 }, (_, i) => {
        let box = { x: Math.min(Math.max(it.foot.x - width / 2, 6), W - 6 - width), y: Math.max(2, above - i * 4), width, height: it.tag.height }, hit = slots.reduce((maximum, other) => other === it ? maximum : Math.max(maximum, overlapArea(box, other.figure)), 0), blocked = showHeap && overlapArea(box, { x: heap.x - 2, y: heap.y - 2, width: heap.width + 4, height: heap.height + 4 }) > 0 || obstacles.some((other) => overlapArea(box, other) > 0) || box.y + box.height > dock.y;
        return { box, short: shortIndex > 0, cost: i + shortIndex * 20 + hit, valid: width <= W - 12 && !blocked && hit <= tolerance };
      })).filter((option) => option.valid).sort((a, b) => a.cost - b.cost);
      return { it, candidates: options };
    }).sort((a, b) => a.candidates.length - b.candidates.length), assigned = [], selected = /* @__PURE__ */ new Map, attempts = 0;
    function fit(index) {
      if (index === choices.length)
        return !0;
      if (++attempts > 12000)
        return !1;
      let { it, candidates: options } = choices[index];
      for (let candidate of options) {
        if (assigned.some((other) => overlapArea(candidate.box, other) > 0))
          continue;
        if (assigned.push(candidate.box), selected.set(it.index, candidate), fit(index + 1))
          return !0;
        assigned.pop(), selected.delete(it.index);
      }
      return !1;
    }
    let fitted = fit(0);
    for (let it of visible) {
      let choice = selected.get(it.index) ?? choices.find((entry) => entry.it === it)?.candidates[0];
      if (choice)
        it.tag = { ...choice.box, short: choice.short, hidden: !!input.reading && !desktop && overlapArea(choice.box, statement) > 0 };
      else if (!fitted)
        it.tag = { ...it.tag, y: Math.max(2, it.tag.y) };
    }
    return { desktop, crowded, scene: { x: 0, y: HEADER_HEIGHT, width: W, height: H }, dock, statement, heap: showHeap ? heap : null, bubble: bestBubble, bubbles, trail, slots, ppu, unit: geo.u };
  }

  // packages/app/src/game/plate.ts
  function plateLift(scene, plate, backRow) {
    let foot = backRow - 8;
    return Math.max(0, plate.wallFoot * scene.width / plate.aspect - foot, (plate.wallFoot * scene.height - foot) / (1 - plate.wallFoot));
  }

  // packages/app/src/game/styles.ts
  function faceCrop(size, headY) {
    let width = size * 1.9, height = width * 150 / 120;
    return { "--face-size": `${size}px`, "--face-width": `${width}px`, "--face-top": `${size / 2 - headY * height}px` };
  }

  // packages/app/src/dev/game-members.ts
  var game_members_default = [
    {
      name: "Moss",
      address: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
      weight: 24,
      received: 142,
      statement: `I planted six fruit trees and kept the shared garden watered through the dry weeks. The two apple trees by the gate are from the cuttings we took in March, and both carried fruit this year for the first time.

I also set up the watering rota after the July heat. Eleven people signed up, and the rota is pinned inside the shed door so anyone can see who has the evening slot. When the hose split in August I patched it twice and then bought a new one from the shared fund, with the receipt in the folder.

The compost bays were overflowing in spring, so I turned all three, built a fourth from pallets, and wrote a short note on what goes in which bay. Since then the kitchen scraps from the community lunch have gone into the garden instead of the bin.

Next year I would like to try a small nursery bed so we can grow our own cuttings instead of buying them, and to run two afternoons on pruning for anyone who wants to learn.`,
      own: !1
    },
    {
      name: "Fern",
      address: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
      weight: 20,
      received: 118,
      statement: "I repaired the library shelves and organised our book swap. Forty-one books went out and thirty came back, which I count as a win. The children’s shelf is now at a height children can reach.",
      own: !1
    },
    {
      name: "Juniper",
      address: "0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C",
      weight: 0,
      received: 74,
      statement: "I welcomed three new neighbours, walked them round the garden and the library, and shared our meeting notes every week so nobody had to ask what was decided.",
      own: !0
    },
    {
      name: "Clover",
      address: "0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718",
      weight: 14,
      received: 96,
      statement: "I checked in with neighbours each week and arranged two accessible lifts to the clinic.",
      own: !1
    },
    {
      name: "Acorn",
      address: "0xd41c057fd1c78805AAC12B0A94a405c0461A6FBb",
      weight: 0,
      received: 58,
      statement: "I gathered supplies and helped prepare the next planting day.",
      own: !1
    },
    {
      name: "Hazel Montgomery",
      address: "0xe1AB8145F7E55DC933D51a18c793F901A3A0b276",
      weight: 12,
      received: 88,
      statement: "I balanced the shared expenses and published clear receipts every month, with a summary anyone can read in two minutes.",
      own: !1
    },
    {
      name: "Pebble",
      address: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
      weight: 10,
      received: 81,
      statement: "I cooked lunch for the workshop and cleaned the community kitchen afterwards, including the oven nobody wanted to touch. We now have a rota for it, and the rota has held for six weeks.",
      own: !1
    },
    {
      name: "Willow",
      address: "0xE57bFE9F44b819898F47BF37E5AF72a0783e1141",
      weight: 8,
      received: 67,
      statement: "I hosted the repair afternoon and fixed four bicycles, one of them twice.",
      own: !1
    },
    {
      name: "Bramble",
      address: "0x000000000000000000000001daa66d2c7ddf743f",
      weight: 6,
      received: 50,
      statement: "I cleared the bramble from the back path and built two raised beds from the old fence boards.",
      own: !1
    },
    {
      name: "Sorrel",
      address: "0x00000000000000000000000d98c475f0f066a9ce",
      weight: 5,
      received: 46,
      statement: "I ran the seed swap at the spring fair and kept the sign-up sheet for next year.",
      own: !1
    }
  ];

  // docs/explorations/critter-directions/src/ink.ts
  var FOOT3 = 140, CENTER3 = 60;
  var BOX_H2 = 150, INK = "#2E2226", EYE = "#2C2129", EYE_SHADE = "#5B4350", PAGE = "#F6F0E4", CHEEK = "#F5A95D", CREAM = "#F3E6D6";
  var ELEMENT2 = {
    earth: { shadow: "#156152", base: "#289946", light: "#ACE676", soft: "#DEF5DA", glow: "#E9C46A" },
    water: { shadow: "#263580", base: "#2564B8", light: "#84D3F0", soft: "#E1EDFC", glow: "#9FE1DC" },
    fire: { shadow: "#852318", base: "#EB521D", light: "#F5A95D", soft: "#FCE7DE", glow: "#F28C38" },
    air: { shadow: "#52366B", base: "#B26ACC", light: "#E9BBF0", soft: "#F1E3FA", glow: "#BFE3F5" }
  }, serial2 = 0, uid = (prefix) => `${prefix}${(++serial2).toString(36)}`;
  function mix2(a, b, t) {
    let p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  function oklch(l, c, h) {
    let lin = (cc) => {
      let a = cc * Math.cos(h * Math.PI / 180), b = cc * Math.sin(h * Math.PI / 180), l_ = l + 0.3963377774 * a + 0.2158037573 * b, m_ = l - 0.1055613458 * a - 0.0638541728 * b, s_ = l - 0.0894841775 * a - 1.291485548 * b, L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
      return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
    }, lo = 0, hi = c, rgb = lin(c), ok = (v) => v.every((x) => x >= -0.000001 && x <= 1.000001);
    if (!ok(rgb)) {
      for (let i = 0;i < 22; i++) {
        let m = (lo + hi) / 2;
        if (ok(lin(m)))
          lo = m;
        else
          hi = m;
      }
      rgb = lin(lo);
    }
    return "#" + rgb.map((v) => Math.round(255 * Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** 0.4166666666666667 - 0.055))).toString(16).padStart(2, "0")).join("");
  }
  function toneOf(colour, coolShadow = "#3E4F63", warmLight = "#FBF0DC") {
    return { light: mix2(colour, warmLight, 0.42), base: colour, shadow: mix2(mix2(colour, coolShadow, 0.38), "#2E2226", 0.12) };
  }

  class Pen {
    doc;
    svg;
    lw;
    defs;
    finish = "ink";
    constructor(doc, svg, lw) {
      this.doc = doc;
      this.svg = svg;
      this.lw = lw;
      this.defs = this.el("defs", {}, svg);
    }
    el(tag, attrs = {}, parent) {
      let node = this.doc.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [k, v] of Object.entries(attrs))
        if (v !== null && v !== void 0)
          node.setAttribute(k, String(v));
      return parent?.append(node), node;
    }
    g(parent, attrs = {}) {
      return this.el("g", attrs, parent);
    }
    filters = /* @__PURE__ */ new Map;
    filter(kind) {
      let have = this.filters.get(kind);
      if (have)
        return `url(#${have})`;
      let id = uid(`f${kind}`), f = this.el("filter", { id, x: "-20%", y: "-20%", width: "140%", height: "140%" }, this.defs);
      if (kind === "loose" || kind === "loose2")
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: kind === "loose" ? 0.045 : 0.06, numOctaves: 2, seed: kind === "loose" ? 7 : 23, result: "n" }, f), this.el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: kind === "loose" ? 1.8 : 2.8, xChannelSelector: "R", yChannelSelector: "G" }, f);
      else if (kind === "soft")
        this.el("feGaussianBlur", { stdDeviation: 0.9 }, f);
      else if (kind === "wash")
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.09 0.35", numOctaves: 2, seed: 4, result: "n" }, f), this.el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 4, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, f), this.el("feGaussianBlur", { in: "d", stdDeviation: 0.8 }, f);
      else
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, seed: 3, result: "n" }, f), this.el("feColorMatrix", { in: "n", type: "matrix", values: "0 0 0 0 .16  0 0 0 0 .12  0 0 0 0 .15  0 0 0 .2 0", result: "g" }, f), this.el("feComposite", { in: "g", in2: "SourceGraphic", operator: "in", result: "gi" }, f), this.el("feBlend", { in: "SourceGraphic", in2: "gi", mode: "multiply" }, f);
      return this.filters.set(kind, id), `url(#${id})`;
    }
    clip(d) {
      let id = uid("c");
      return this.el("path", { d }, this.el("clipPath", { id }, this.defs)), `url(#${id})`;
    }
    radial(stops, cx = 0.34, cy = 0.28, r = 0.95) {
      let id = uid("r"), grad = this.el("radialGradient", { id, cx, cy, r }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    linear(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
      let id = uid("l"), grad = this.el("linearGradient", { id, x1, y1, x2, y2 }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    form(parent, d, tone, o = {}) {
      let w = (o.weight ?? 1) * this.lw, g = this.g(parent, o.attrs ?? {}), loose = this.filter("loose");
      if (!o.noLine)
        this.el("path", { d, fill: "#2E2226", stroke: "#2E2226", "stroke-width": w * 1.3, "stroke-linejoin": "round", transform: `translate(${(w * 0.34).toFixed(2)} ${(w * 0.44).toFixed(2)})`, filter: loose }, g);
      if (this.el("path", { d, fill: o.flat ? tone.base : this.radial([[0, tone.light], [0.55, tone.base], [1, tone.base]], 0.3, 0.24, 0.85) }, g), !o.flat) {
        let painted = this.finish === "painted", s = o.size ?? 20, [dx, dy] = o.shade ?? (painted ? [0.42, 0.52] : [0.52, 0.6]), inner = this.g(g, { "clip-path": this.clip(d) }), lens = this.g(inner, { "clip-path": this.clip(d), transform: `translate(${(s * dx).toFixed(2)} ${(s * dy).toFixed(2)})` });
        if (this.el("path", { d, fill: tone.shadow, opacity: o.shadowOpacity ?? (painted ? 0.38 : 0.5), filter: this.filter("soft"), transform: `translate(${(-s * dx * 0.08).toFixed(2)} ${(-s * dy * 0.08).toFixed(2)})` }, lens), o.hatch && !painted)
          this.el("path", { d, fill: `url(#${this.hatchId()})`, opacity: 0.55 }, lens);
        if (painted && s > 4)
          this.el("path", { d, fill: "none", stroke: mix2(tone.light, "#FFE7C2", 0.4), "stroke-width": Math.max(1.2, s * 0.11), opacity: 0.5, transform: `translate(${(-s * 0.05).toFixed(2)} ${(-s * 0.06).toFixed(2)})`, filter: this.filter("soft") }, inner);
        if (o.grain)
          this.el("path", { d, fill: tone.base, opacity: 0.5, filter: this.filter("grain"), style: "mix-blend-mode:multiply" }, inner);
      }
      if (!o.noLine)
        this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": w * 0.6, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0.9, filter: loose }, g), this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": w * 0.32, opacity: 0.26, transform: "translate(1.1 .7)", filter: this.filter("loose2") }, g);
      return g;
    }
    hatch;
    hatchId() {
      if (this.hatch)
        return this.hatch;
      let id = uid("h"), pat = this.el("pattern", { id, width: 3.6, height: 3.6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-38)" }, this.defs);
      return this.el("path", { d: "M0 0 L0 3.6", stroke: "#2E2226", "stroke-width": 0.8, opacity: 0.55 }, pat), this.hatch = id;
    }
    patch(parent, d, fill, opacity = 1, attrs = {}) {
      return this.el("path", { d, fill, opacity, ...attrs }, parent);
    }
    stroke(parent, d, width, attrs = {}) {
      return this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", filter: this.filter("loose"), ...attrs }, parent);
    }
    glow(parent, x, y, r, colour, strength = 0.75) {
      return this.el("circle", { cx: x, cy: y, r, fill: this.radial([[0, colour, strength], [1, colour, 0]], 0.5, 0.5, 0.5) }, parent);
    }
  }
  var ellipsePath = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`, f = (n) => +n.toFixed(2);
  function blob(points, tension = 1) {
    let n = points.length, p = (i) => points[(i + n) % n], d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
    for (let i = 0;i < n; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  }
  function curve(points, tension = 1) {
    let n = points.length, p = (i) => points[Math.max(0, Math.min(n - 1, i))], d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
    for (let i = 0;i < n - 1; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }
  function stream(seed) {
    let s = seed | 0;
    return () => {
      s = s + 1831565813 | 0;
      let v = Math.imul(s ^ s >>> 15, 1 | s);
      return v ^= v + Math.imul(v ^ v >>> 7, 61 | v), ((v ^ v >>> 14) >>> 0) / 4294967296;
    };
  }

  // docs/explorations/critter-directions/src/face.ts
  function drawFace(pen, head, o) {
    let { r } = o, lw = pen.lw, eyeR = r * o.eye, ex = r * o.spread, ey = r * o.eyeY, turn = (o.turn ?? 0) * r;
    for (let side of [-1, 1]) {
      let anchor = pen.g(head, { transform: `translate(${f(side * ex + turn)} ${f(ey)})` });
      pen.el("path", { d: `M${f(-eyeR * 0.8)} ${f(eyeR * 0.05)}Q0 ${f(eyeR * 0.66)} ${f(eyeR * 0.8)} ${f(eyeR * 0.05)}`, fill: "none", stroke: INK, "stroke-width": lw * 0.85, "stroke-linecap": "round", class: "portrait__sleep-eye" }, anchor);
      let open = pen.g(anchor, { class: "portrait__eye" }), clip = pen.clip(ellipsePath(0, 0, eyeR, eyeR * 1.06));
      if (pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open), pen.el("ellipse", { cx: eyeR * 0.06, cy: eyeR * 0.52, rx: eyeR * 0.74, ry: eyeR * 0.42, fill: EYE_SHADE, opacity: 0.55, "clip-path": clip }, open), pen.el("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.21, fill: PAGE }, open), o.delighted)
        pen.el("circle", { cx: eyeR * 0.3, cy: eyeR * 0.3, r: eyeR * 0.08, fill: PAGE, opacity: 0.85 }, open);
      pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: "none", stroke: INK, "stroke-width": lw * 0.5 }, open);
    }
    let mouthY = r * (o.kind === "bird" ? 0.5 : o.kind === "fish" ? 0.42 : 0.5);
    for (let side of [-1, 1])
      pen.el("ellipse", { cx: side * r * 0.72 + turn, cy: r * 0.5, rx: r * 0.15, ry: r * 0.085, fill: CHEEK, opacity: 0.55, class: "portrait__cheek" }, head);
    if (o.kind === "bird" && o.beakTone) {
      let b = o.beakTone, by = r * 0.3;
      pen.form(head, `M${f(-r * 0.15 + turn)} ${f(by)}Q${f(turn)} ${f(by - r * 0.12)} ${f(r * 0.15 + turn)} ${f(by)}Q${f(r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(turn)} ${f(by + r * 0.26)}Q${f(-r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(-r * 0.15 + turn)} ${f(by)}Z`, b, { weight: 0.55, size: r * 0.15 });
      return;
    }
    if (o.kind === "mammal" || o.kind === "lamb" || o.kind === "turtle") {
      let nose = o.noseTone ?? INK, ny = r * 0.3;
      pen.el("path", { d: `M${f(-r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny - r * 0.05)} ${f(r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny + r * 0.09)} ${f(-r * 0.08 + turn)} ${f(ny)}Z`, fill: nose, opacity: o.kind === "turtle" ? 0.55 : 0.85 }, head);
    }
    if (o.kind === "fish") {
      pen.el("ellipse", { cx: turn, cy: mouthY, rx: r * 0.08, ry: r * 0.06, fill: INK, opacity: 0.75, class: "p-calm" }, head), pen.el("path", { d: `M${f(-r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.2)} ${f(r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK, "stroke-width": lw * 0.45, class: "portrait__mouth", opacity: 0 }, head);
      return;
    }
    pen.el("path", { d: `M${f(-r * 0.11 + turn)} ${f(mouthY)}Q${f(turn)} ${f(mouthY + r * 0.07)} ${f(r * 0.11 + turn)} ${f(mouthY)}`, fill: "none", stroke: INK, "stroke-width": lw * 0.58, "stroke-linecap": "round", class: "p-calm" }, head), pen.el("path", { d: `M${f(-r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.24)} ${f(r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK, "stroke-width": lw * 0.5, "stroke-linejoin": "round", class: "portrait__mouth" }, head);
  }

  // docs/explorations/critter-directions/src/garden.ts
  var SPECIES = { earth: ["squirrel", "moth"], water: ["turtle", "koi"], fire: ["fox", "phoenix"], air: ["lemur", "lamb"] }, SPECIES_NAMES = { squirrel: "Acorn squirrel", moth: "Lichen moth", turtle: "Pond turtle", koi: "Koi kite", fox: "Ember fox", phoenix: "Phoenix chick", lemur: "Flying lemur", lamb: "Cloud lamb" }, FLIERS = /* @__PURE__ */ new Set(["moth", "koi", "phoenix", "lemur", "lamb"]), clamp01 = (x) => Math.min(0.999, Math.max(0, x));
  function uniforms(p) {
    return [
      (p.bodyHeight - 0.85) / 0.4,
      (p.bodyWidth - 0.75) / 0.4,
      p.belly / 0.3,
      (p.headSize - 0.5) / 0.22,
      (p.headTilt + 8) / 16,
      (p.earSize - 0.18) / 0.32,
      (p.earSpread - 35) / 40,
      (p.eyeSize - 0.1) / 0.1,
      (p.eyeSpacing - 0.32) / 0.3,
      (p.eyeHeight - 0.45) / 0.17,
      (p.pupilSize - 0.45) / 0.25,
      (p.legLength - 0.15) / 0.2,
      (p.chroma - 0.06) / 0.07,
      (p.lightness - 0.58) / 0.18,
      (p.accentShift - 15) / 30,
      p.idlePhase
    ].map(clamp01);
  }
  function gardenDraw(p, finish = "ink") {
    let u = uniforms(p), element = p.element, species = SPECIES[element][u[15] < 0.5 ? 0 : 1];
    return { element, species, u, seed: Math.floor(u[15] * 1e9) ^ Math.floor(u[1] * 1e6), finish, head: finish === "painted" ? 1.2 : 1 };
  }
  var lerp = (a, b, t) => a + (b - a) * t, pick = (list, x) => list[Math.min(list.length - 1, Math.floor(x * list.length))];
  function faceFrom(u, r) {
    return { r, eye: 0.29 + 0.07 * u[7], spread: 0.4 + 0.12 * u[8], eyeY: -0.04 + 0.12 * (0.5 - u[9]) };
  }
  var elTone = (e, k = 0) => {
    let E = ELEMENT2[e];
    return { light: mix2(E.light, CREAM, 0.25 + k), base: mix2(E.base, E.light, 0.25 + k), shadow: E.shadow };
  }, own = (l, c, h, soften = 0.28) => toneOf(mix2(oklch(l, c, h), CREAM, soften));
  function oakLeaf(pen, parent, x, y, size, angle, tone) {
    let s = size, half = s * 0.42, pts = [[0, 0], [half * 0.55, -s * 0.15], [half * 0.95, -s * 0.28], [half * 0.6, -s * 0.38], [half * 1, -s * 0.52], [half * 0.55, -s * 0.62], [half * 0.8, -s * 0.78], [0, -s], [-half * 0.8, -s * 0.78], [-half * 0.55, -s * 0.62], [-half * 1, -s * 0.52], [-half * 0.6, -s * 0.38], [-half * 0.95, -s * 0.28], [-half * 0.55, -s * 0.15]], g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)}) rotate(${f(angle)})` });
    return pen.form(g, blob(pts, 0.7), tone, { weight: 0.55, size: s * 0.5, shade: [0.4, 0.3] }), pen.stroke(g, `M0 ${f(-s * 0.05)}L0 ${f(-s * 0.85)}`, pen.lw * 0.35, { opacity: 0.6 }), g;
  }
  function acorn(pen, parent, x, y, s, glowCol) {
    let g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})` });
    pen.glow(g, 0, -s * 0.2, s * 1.4, glowCol, 0.45), pen.form(g, ellipsePath(0, s * 0.25, s * 0.55, s * 0.68), toneOf("#C8955A"), { weight: 0.5, size: s * 0.5 }), pen.form(g, `M${f(-s * 0.68)} ${f(-s * 0.05)}Q0 ${f(-s * 0.85)} ${f(s * 0.68)} ${f(-s * 0.05)}Q0 ${f(s * 0.2)} ${f(-s * 0.68)} ${f(-s * 0.05)}Z`, toneOf("#7A5233"), { weight: 0.5, size: s * 0.4, grain: !0 }), pen.stroke(g, `M0 ${f(-s * 0.45)}q${f(s * 0.1)} ${f(-s * 0.3)} ${f(s * 0.3)} ${f(-s * 0.35)}`, pen.lw * 0.4);
  }
  function flame(pen, parent, x, y, s, cls = "") {
    let g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})`, class: cls }), E = ELEMENT2.fire;
    pen.glow(g, 0, -s * 0.35, s * 1.25, E.glow, 0.5);
    let d = `M0 ${f(-s * 1.15)}C${f(s * 0.25)} ${f(-s * 0.75)} ${f(s * 0.62)} ${f(-s * 0.48)} ${f(s * 0.5)} ${f(-s * 0.05)}C${f(s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.5)} ${f(-s * 0.05)}C${f(-s * 0.58)} ${f(-s * 0.42)} ${f(-s * 0.12)} ${f(-s * 0.62)} 0 ${f(-s * 1.15)}Z`;
    return pen.form(g, d, { light: mix2(E.light, "#FFF3D6", 0.4), base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.6, shade: [0.35, 0.25] }), pen.patch(g, `M0 ${f(-s * 0.55)}C${f(s * 0.18)} ${f(-s * 0.32)} ${f(s * 0.25)} ${f(-s * 0.05)} 0 ${f(s * 0.12)}C${f(-s * 0.25)} ${f(-s * 0.05)} ${f(-s * 0.15)} ${f(-s * 0.32)} 0 ${f(-s * 0.55)}Z`, "#FFF0C9", 0.85), g;
  }
  function ear(pen, head, side, at, angle, d, tone, inner, size) {
    let anchor = pen.g(head, { transform: `translate(${f(at[0])} ${f(at[1])})` }), rot = pen.g(anchor, { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${f(side * angle)}deg` }), mirror = side < 0 ? pen.g(rot, { transform: "scale(-1 1)" }) : rot;
    if (pen.form(mirror, d, tone, { weight: 0.75, size, shade: [0.45, 0.3] }), inner)
      pen.patch(mirror, d, inner, 0.85, { transform: "translate(0 -1) scale(.55 .7)" });
    return rot;
  }
  var roundEar = (w, L) => `M${f(-w)} 0C${f(-w * 1.15)} ${f(-L * 0.62)} ${f(-w * 0.45)} ${f(-L * 1.02)} 0 ${f(-L)}C${f(w * 0.5)} ${f(-L * 1.02)} ${f(w * 1.15)} ${f(-L * 0.6)} ${f(w)} 0Z`, pointEar = (w, L) => `M${f(-w)} 0C${f(-w * 0.9)} ${f(-L * 0.45)} ${f(-w * 0.25)} ${f(-L * 0.9)} ${f(-w * 0.05)} ${f(-L)}Q0 ${f(-L * 1.04)} ${f(w * 0.08)} ${f(-L * 0.98)}C${f(w * 0.35)} ${f(-L * 0.85)} ${f(w * 0.95)} ${f(-L * 0.42)} ${f(w)} 0Z`;
  function wisp(pen, parent, x, y, s, tone) {
    let d = `M${f(x)} ${f(y)}c${f(s * 0.4)} ${f(-s * 0.55)} ${f(s * 1.2)} ${f(-s * 0.5)} ${f(s * 1.35)} ${f(-s * 0.05)}c${f(-s * 0.45)} ${f(-s * 0.15)} ${f(-s * 0.85)} ${f(s * 0.05)} ${f(-s * 1)} ${f(s * 0.32)}c${f(-s * 0.12)} ${f(s * 0.12)} ${f(-s * 0.3)} ${f(s * 0.02)} ${f(-s * 0.35)} ${f(-s * 0.27)}Z`;
    pen.form(parent, d, tone, { weight: 0.5, size: s * 0.6, flat: !0 });
  }
  function squirrel(d) {
    let u = d.u, W = 18 + 6 * u[1], H = 22 + 6 * u[0], bodyY = FOOT3 - 4 - H, R = (21 + 5 * u[3]) * d.head, headX = CENTER3 - 1, headY = bodyY - H * 0.72 - R * 0.55, earL = R * (0.55 + 0.35 * u[5]), spread = 16 + 14 * u[6], sapling = u[2] > 0.45, plume = 1 + 0.25 * u[12], tailTop = bodyY - H * 1.45 * plume - 8, top = Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tailTop - 6, sapling ? headY - R - R * 0.5 : 1 / 0), coat = pick([[0.64, 0.1, 48], [0.55, 0.09, 38], [0.72, 0.1, 78], [0.66, 0.035, 60]], u[14]), fur = own(coat[0] + 0.06 * (u[13] - 0.5), coat[1], coat[2]), belly = toneOf(mix2(CREAM, fur.base, 0.18)), autumn = u[12] > 0.55, leafA = autumn ? toneOf(mix2("#C7843A", CREAM, 0.15), "#5A3A2A") : elTone("earth"), leafB = autumn ? toneOf(mix2("#B5562E", CREAM, 0.18), "#4A2A2A") : toneOf(mix2(mix2(ELEMENT2.earth.base, "#C9A24A", 0.35), CREAM, 0.15), "#2E4A3A");
    return { geo: { top, left: CENTER3 - W - 12, right: CENTER3 + W + 34, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream(d.seed), tail = pen.g(g, { class: "cr-tail" }), spine = [[CENTER3 + W * 0.7, bodyY + H * 0.5], [CENTER3 + W + 14, bodyY + H * 0.1], [CENTER3 + W + 19, bodyY - H * 0.65 * plume], [CENTER3 + W + 12, tailTop + 6], [CENTER3 + W + 2, tailTop + 2]], along = (t) => {
        let i = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1))), k = t * (spine.length - 1) - i, a = spine[i], b = spine[i + 1];
        return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      }, brush = blob([[CENTER3 + W * 0.55, bodyY + H * 0.62], [CENTER3 + W + 17, bodyY + H * 0.25], [CENTER3 + W + 24, bodyY - H * 0.6 * plume], [CENTER3 + W + 16, tailTop + 9], [CENTER3 + W + 4, tailTop + 6], [CENTER3 + W + 8, bodyY - H * 0.55 * plume], [CENTER3 + W * 0.95, bodyY + H * 0.05]], 0.9);
      pen.form(tail, brush, fur, { size: 10, grain: !0, hatch: !0 });
      let count = 8 + Math.floor(u[13] * 3);
      for (let i = 0;i < count; i++) {
        let t = 0.08 + 0.92 * i / (count - 1), [x, y] = along(t), side = i % 2 ? 1 : -1, size = 11 + 6 * Math.sin(t * Math.PI) + 2 * rand();
        oakLeaf(pen, tail, x + side * (3 + 4 * Math.sin(t * Math.PI)), y + 2, size, side * (35 + 30 * rand()) + 15 - t * 30, i % 3 === 1 ? leafB : leafA);
      }
      acorn(pen, tail, CENTER3 + W + 19, bodyY - H * 0.45, 4.6, ELEMENT2.earth.glow), acorn(pen, tail, CENTER3 + W + 8, bodyY - H * 0.05, 4, ELEMENT2.earth.glow);
      let body = blob([[CENTER3, bodyY - H], [CENTER3 + W * 0.78, bodyY - H * 0.66], [CENTER3 + W * 0.98, bodyY + H * 0.05], [CENTER3 + W * 1.08, bodyY + H * 0.72], [CENTER3 + W * 0.6, bodyY + H * 1], [CENTER3 - W * 0.6, bodyY + H * 1], [CENTER3 - W * 1.08, bodyY + H * 0.72], [CENTER3 - W * 0.98, bodyY + H * 0.05], [CENTER3 - W * 0.78, bodyY - H * 0.66]]);
      if (pen.form(g, body, fur, { size: W, grain: !0, hatch: !0 }), pen.patch(g, ellipsePath(CENTER3 + 1, bodyY + H * 0.28, W * 0.6, H * 0.6), belly.base, 0.92), pen.glow(g, CENTER3, bodyY - H * 0.05, W * 0.55, ELEMENT2.earth.glow, 0.42), u[11] > 0.5)
        for (let k of [0, 1])
          pen.stroke(g, curve([[CENTER3 - W * 0.95, bodyY - H * (0.3 - k * 0.32)], [CENTER3 - W * 0.62, bodyY - H * (0.42 - k * 0.32)], [CENTER3 - W * 0.32, bodyY - H * (0.34 - k * 0.32)]]), pen.lw * 0.5, { opacity: 0.55 });
      else
        for (let [x, y, r] of [[-0.6, -0.3, 2.4], [-0.78, 0.18, 1.8], [0.62, -0.42, 2]])
          pen.patch(g, ellipsePath(CENTER3 + x * W, bodyY + y * H, r, r * 0.8), ELEMENT2.earth.light, 0.75);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER3 + side * W * 0.48, bodyY - H * 0.04, 5.2, 6.4), fur, { weight: 0.7, size: 5, attrs: { transform: `rotate(${side * -18} ${f(CENTER3 + side * W * 0.48)} ${f(bodyY)})` } });
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER3 + side * W * 0.52, FOOT3 - 3.2, 9.5, 4.8), toneOf(mix2(fur.base, "#6B5040", 0.25)), { weight: 0.8, size: 6 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1]) {
        let e = ear(pen, head, side, [side * R * 0.58, -R * 0.66], spread, roundEar(R * 0.33, earL), fur, mix2("#F2C6B4", fur.base, 0.2), R * 0.3);
        if (u[5] > 0.55)
          pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M0 ${f(-earL * 0.95)}q2 -4 0.5 -7m-0.5 7q-2 -3.5 -1 -6`, pen.lw * 0.6);
      }
      if (sapling) {
        let sg = pen.g(head);
        pen.stroke(sg, `M0 ${f(-R * 0.92)}q1 ${f(-R * 0.25)} -1 ${f(-R * 0.48)}`, pen.lw * 0.9, { stroke: ELEMENT2.earth.shadow }), oakLeaf(pen, sg, -1, -R * 1.3, 8, -40, elTone("earth")), oakLeaf(pen, sg, 0, -R * 1.25, 7, 35, leafB);
      }
      pen.form(head, ellipsePath(0, 0, R, R * 0.96), fur, { size: R, grain: !0, hatch: !0 }), pen.patch(head, ellipsePath(0, R * 0.36, R * 0.55, R * 0.4), belly.base, 0.9), drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: u[2] > 0.3 || s.delighted, delighted: s.delighted });
    } };
  }
  function moth(d) {
    let u = d.u, R = (23 + 5 * u[0]) * (0.5 + d.head / 2), hover = 17 + 6 * u[11], cy = FOOT3 - hover - R - 2, span = R + 20 + 8 * u[1], wingBase = pick(["#B9AE98", "#9C7E62", "#93A27C", "#B47A54", "#A79AB5"], (u[14] * 2.7 + u[10] * 1.9) % 1), furC = pick([[0.88, 0.03, 80], [0.8, 0.02, 250], [0.78, 0.05, 60]], u[13]), fur = own(furC[0], furC[1], furC[2], 0.12), wing = toneOf(mix2(wingBase, CREAM, 0.12), "#3A3F45"), lichen = mix2(ELEMENT2.earth.light, "#DCE0CB", 0.5), band = mix2(wingBase, INK, 0.28), eyespot = u[12] > 0.4;
    return { geo: { top: cy - R - 22, left: CENTER3 - span - 4, right: CENTER3 + span + 4, headX: CENTER3, headY: cy, headR: R, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), fold = s.asleep ? 0.62 : 1;
      for (let side of [-1, 1]) {
        let wingG = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${f(CENTER3)} ${f(cy)}) scale(${f(side * fold)} 1)` }), upper = blob([[R * 0.42, -R * 0.4], [R * 0.75, -R * 1.02], [span * 0.72, -R * 1.25], [span * 1.02, -R * 0.95], [span * 0.95, -R * 0.2], [span * 0.68, R * 0.05], [R * 0.55, R * 0.08]], 0.85), lower = blob([[R * 0.45, R * 0.02], [span * 0.6, R * 0.12], [span * 0.74, R * 0.55], [span * 0.52, R * 0.95], [span * 0.38, R * 0.78], [R * 0.55, R * 0.62]], 0.85);
        pen.form(wingG, lower, toneOf(mix2(wing.base, CREAM, 0.38)), { size: R * 0.5, weight: 0.8, grain: !0 }), pen.form(wingG, upper, wing, { size: R * 0.75, weight: 0.85, grain: !0 });
        let inside = pen.g(wingG, { "clip-path": pen.clip(upper) });
        pen.stroke(inside, curve([[span * 0.42, -R * 1.25], [span * 0.55, -R * 0.65], [span * 0.48, R * 0.1]]), 3.2, { stroke: band, opacity: 0.45, filter: null });
        for (let k = 0;k < 3; k++)
          pen.stroke(inside, curve([[R * 0.7 + k * 7, -R * 0.82 + k * 2], [R * 0.92 + k * 9, -R * 0.45], [R * 0.82 + k * 10, -R * 0.02]]), pen.lw * 0.35, { opacity: 0.4 });
        for (let k = 0;k < 7; k++) {
          let x = span * (0.5 + 0.45 * rand()), y = -R * (0.1 + 0.95 * rand()), r = 1.5 + 2.4 * rand();
          pen.patch(inside, ellipsePath(x, y, r, r * 0.85), lichen, 0.85);
        }
        if (eyespot) {
          let ex = span * 0.76, ey = -R * 0.62;
          pen.glow(wingG, ex, ey, 8, ELEMENT2.earth.glow, 0.6), pen.el("circle", { cx: ex, cy: ey, r: 4.6, fill: "#F4E4B4", stroke: INK, "stroke-width": pen.lw * 0.4 }, wingG), pen.el("circle", { cx: ex + 0.4, cy: ey + 0.3, r: 2.2, fill: mix2(ELEMENT2.earth.shadow, INK, 0.3) }, wingG);
        } else
          pen.patch(wingG, `M${f(span * 0.98)} ${f(-R * 0.9)}q${f(-span * 0.12)} ${f(R * 0.15)} ${f(-span * 0.08)} ${f(R * 0.5)}`, "none", 0.9, { stroke: "#F4E4B4", "stroke-width": 2.2, "stroke-linecap": "round" });
      }
      for (let side of [-1, 1]) {
        let x0 = CENTER3 + side * R * 0.32, y0 = cy - R * 0.86, x1 = x0 + side * 7, y1 = y0 - 14;
        pen.stroke(g, `M${f(x0)} ${f(y0)}Q${f(x0 + side * 1)} ${f(y0 - 9)} ${f(x1)} ${f(y1)}a3.6 3.6 0 1 ${side > 0 ? 1 : 0} ${f(side * 3)} ${f(4.2)}a1.9 1.9 0 1 ${side > 0 ? 1 : 0} ${f(-side * 2.6)} ${f(-0.6)}`, pen.lw * 0.95, { stroke: mix2(ELEMENT2.earth.shadow, INK, 0.35) });
        for (let k = 1;k <= 3; k++)
          pen.stroke(g, `M${f(x0 + side * k * 1.2)} ${f(y0 - k * 3.5)}l${f(side * 3.2)} ${f(-1.2)}`, pen.lw * 0.45, { stroke: ELEMENT2.earth.base, opacity: 0.85 });
      }
      let fuzz = blob(Array.from({ length: 22 }, (_, i) => {
        let a = i / 22 * Math.PI * 2, k = i % 2 ? 1 : 0.95;
        return [CENTER3 + Math.cos(a) * R * k, cy + Math.sin(a) * R * 1.02 * k];
      }), 1);
      pen.form(g, fuzz, fur, { size: R, grain: !0 }), pen.patch(g, ellipsePath(CENTER3, cy + R * 0.12, R * 0.78, R * 0.62), mix2(fur.light, "#FFFFFF", 0.3), 0.5);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER3 + side * 6, cy + R + 1.5, 2.6, 3.2), toneOf("#8A7462"), { weight: 0.5, size: 2 });
      let anchor = pen.g(g, { transform: `translate(${CENTER3} ${f(cy - R * 0.05)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace(pen, head, { ...faceFrom(u, R * 0.92), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: "#6B5040" });
    } };
  }
  function turtle(d) {
    let u = d.u, rx = 34 + 6 * u[1], ry = 21 + 4 * u[0], sx = CENTER3 + 7, sy = FOOT3 - 7 - ry * 0.8, R = (19 + 4 * u[3]) * d.head, headX = CENTER3 - 13, headY = FOOT3 - 24 - R * 0.55, skinC = pick([[0.64, 0.07, 178], [0.66, 0.07, 150], [0.6, 0.05, 232]], u[14]), skin = own(skinC[0] + 0.06 * (u[13] - 0.5), skinC[1], skinC[2], 0.2), stoneSet = pick([["#B9B2A3", "#A8B4B4", "#C4BBA9", "#9FAAAE"], ["#D3C1A0", "#C9B48E", "#DCCDB2", "#BFA987"], ["#A9B29A", "#9DAA8E", "#B8BEA6", "#8E9C84"]], u[12]), garden = u[2], reed = garden > 0.66, flower = garden < 0.33;
    return { geo: { top: Math.min(sy - ry - 4, headY - R - 3, reed ? sy - ry - 22 : 1 / 0), left: Math.min(headX - R - 3, sx - rx - 3), right: sx + rx + 6, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream(d.seed);
      pen.form(g, ellipsePath(sx + rx * 0.72, FOOT3 - 4, 8, 5.5), skin, { weight: 0.7, size: 6 });
      let dome = `M${f(sx - rx)} ${f(sy + ry * 0.55)}C${f(sx - rx)} ${f(sy - ry * 0.9)} ${f(sx - rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx)} ${f(sy - ry * 1.05)}C${f(sx + rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx + rx)} ${f(sy - ry * 0.9)} ${f(sx + rx)} ${f(sy + ry * 0.55)}C${f(sx + rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx)} ${f(sy + ry * 0.55)}Z`;
      pen.form(g, dome, toneOf(stoneSet[3], "#3E4F63"), { size: rx * 0.7, grain: !0 });
      let stones = pen.g(g, { "clip-path": pen.clip(dome) });
      [[-0.55, -0.35, 0.3, 0.42], [0, -0.62, 0.34, 0.36], [0.55, -0.35, 0.3, 0.42], [-0.78, 0.25, 0.26, 0.38], [-0.28, 0.12, 0.27, 0.4], [0.25, 0.12, 0.27, 0.4], [0.76, 0.25, 0.26, 0.38]].forEach(([cx, cyy, w, h], i) => {
        let x = sx + cx * rx, y = sy + cyy * ry, pts = Array.from({ length: 7 }, (_, k) => {
          let a = k / 7 * Math.PI * 2 + rand() * 0.3, kk = 0.86 + 0.18 * rand();
          return [x + Math.cos(a) * w * rx * kk, y + Math.sin(a) * h * ry * kk];
        });
        pen.form(stones, blob(pts, 0.9), toneOf(stoneSet[(i + Math.floor(u[13] * 4)) % stoneSet.length]), { size: w * rx, weight: 0.6, grain: !0 });
      }), pen.stroke(g, `M${f(sx - rx * 0.97)} ${f(sy + ry * 0.4)}C${f(sx - rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.97)} ${f(sy + ry * 0.4)}`, pen.lw * 0.6, { opacity: 0.6 });
      let pw = 12 + 3 * u[11], py = sy - ry * 0.84, pool = ellipsePath(sx - 1, py, pw, 4.2);
      pen.form(g, pool, { light: "#F2FAFD", base: mix2(ELEMENT2.water.light, "#FFFFFF", 0.2), shadow: ELEMENT2.water.base }, { weight: 0.55, size: 4, shade: [0.15, 0.5] }), pen.patch(g, `M${f(sx - pw * 0.6)} ${f(py - 1.2)}q${f(pw * 0.35)} -1.4 ${f(pw * 0.7)} -0.5`, "none", 1, { stroke: "#FFFFFF", "stroke-width": 1, "stroke-linecap": "round", opacity: 0.85 });
      let pad = `M${f(sx + 3)} ${f(py)}l4.6 -1.2a4.8 2 0 1 1 -1.4 -1.1Z`;
      if (pen.form(g, pad, elTone("earth", 0.05), { weight: 0.45, size: 2, flat: !0 }), flower)
        pen.form(g, ellipsePath(sx + 5, py - 1.6, 1.8, 1.4), toneOf("#F2B8C6"), { weight: 0.4, size: 1, flat: !0 });
      if (reed)
        pen.stroke(g, `M${f(sx + rx * 0.45)} ${f(sy - ry * 0.7)}q-1 -10 2 -19`, pen.lw * 0.8, { stroke: ELEMENT2.earth.shadow }), pen.form(g, ellipsePath(sx + rx * 0.45 + 2, sy - ry * 0.7 - 20, 1.6, 4.2), toneOf("#8A6A4A"), { weight: 0.45, size: 1.5 });
      for (let [x, y] of [[headX - 8, FOOT3 - 3.5], [headX + 17, FOOT3 - 3]])
        pen.form(g, ellipsePath(x, y, 7.5, 5), skin, { weight: 0.75, size: 6, grain: !0 });
      pen.form(g, blob([[headX - R * 0.4, headY + R * 0.5], [headX + R * 0.6, headY + R * 0.2], [sx - rx * 0.55, sy + ry * 0.1], [sx - rx * 0.5, sy + ry * 0.55], [headX + R * 0.2, headY + R * 1.05]]), skin, { size: R * 0.6 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (u[5] > 0.5)
        ear(pen, head, 1, [R * 0.05, -R * 0.84], 10, `M${f(-R * 0.18)} 0C${f(-R * 0.2)} ${f(-R * 0.28)} ${f(-R * 0.02)} ${f(-R * 0.44)} ${f(R * 0.2)} ${f(-R * 0.4)}C${f(R * 0.1)} ${f(-R * 0.24)} ${f(R * 0.22)} ${f(-R * 0.1)} ${f(R * 0.18)} 0Z`, { light: "#EAF6F8", base: mix2(ELEMENT2.water.light, skin.base, 0.4), shadow: skin.shadow }, null, R * 0.16);
      pen.form(head, ellipsePath(0, 0, R, R * 0.92), skin, { size: R, grain: !0 }), pen.glow(head, 0, R * 0.95, R * 0.55, ELEMENT2.water.glow, 0.55);
      for (let [x, y, r] of [[-0.55, -0.45, 0.12], [0.4, -0.6, 0.09], [0.7, -0.2, 0.1]])
        pen.patch(head, ellipsePath(x * R, y * R, r * R, r * R * 0.8), mix2(skin.light, ELEMENT2.water.light, 0.4), 0.75);
      drawFace(pen, head, { ...faceFrom(u, R), kind: "turtle", cheeks: u[2] > 0.25 || s.delighted, delighted: s.delighted }), pen.form(head, `M${f(R * 0.06)} ${f(R * 0.1)}c1.6 2 2.1 3.9 0 4.6c-2.1 -0.7 -1.6 -2.6 0 -4.6Z`, { light: "#FFFFFF", base: ELEMENT2.water.light, shadow: ELEMENT2.water.base }, { weight: 0.4, size: 1.5, flat: !0 });
    } };
  }
  function koi(d) {
    let u = d.u, hover = 22 + 6 * u[11], rx = (23 + 3 * u[1]) * (0.6 + 0.4 * d.head), ry = (20 + 3 * u[0]) * (0.6 + 0.4 * d.head), cx = CENTER3 - 6, cy = FOOT3 - hover - ry - 2, tail = 32 + 9 * u[5], back = pick([["#F2EFE8", "#5E86B8"], ["#8FC4C9", "#2F5E7E"], ["#9AA6C4", "#F4EEE4"], ["#E9DCC3", "#4C7FA6"]], u[13]), body = toneOf(mix2(back[0], CREAM, 0.1), "#4B6A86"), patchA = mix2(back[1], CREAM, 0.25), patchB = mix2(back[1], ELEMENT2.water.shadow, 0.3), pattern = Math.floor(u[12] * 3), finTone = { light: "#F4FBFE", base: mix2(ELEMENT2.water.light, "#FFFFFF", 0.4), shadow: ELEMENT2.water.light };
    return { geo: { top: cy - ry - 14 - tail * 0.45, left: cx - rx - 6, right: cx + rx + tail + 4, headX: cx - 2, headY: cy, headR: Math.max(rx, ry) * 0.88, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), tg = pen.g(g, { class: "cr-tail" }), bx = cx + rx * 0.85, by = cy + 1, fin = `M${f(bx)} ${f(by - 6)}C${f(bx + tail * 0.35)} ${f(by - 11)} ${f(bx + tail * 0.72)} ${f(by - tail * 0.7)} ${f(bx + tail)} ${f(by - tail * 0.6)}C${f(bx + tail * 0.84)} ${f(by - tail * 0.32)} ${f(bx + tail * 0.72)} ${f(by - 4)} ${f(bx + tail * 0.9)} ${f(by + tail * 0.2)}C${f(bx + tail * 1)} ${f(by + tail * 0.4)} ${f(bx + tail * 0.6)} ${f(by + tail * 0.46)} ${f(bx + tail * 0.42)} ${f(by + tail * 0.24)}C${f(bx + tail * 0.25)} ${f(by + 9)} ${f(bx + 4)} ${f(by + 7)} ${f(bx)} ${f(by + 6)}Z`;
      pen.form(tg, fin, finTone, { weight: 0.5, size: tail * 0.3, shade: [0.2, 0.35], attrs: { opacity: 0.9 } });
      for (let k = 0;k < 5; k++)
        pen.patch(tg, `M${f(bx + 2)} ${f(by)}Q${f(bx + tail * 0.5)} ${f(by - tail * (0.42 - k * 0.18))} ${f(bx + tail * 0.92)} ${f(by - tail * (0.58 - k * 0.24))}`, "none", 0.65, { stroke: k % 2 ? mix2(ELEMENT2.water.light, "#FFFFFF", 0.3) : "#FFFFFF", "stroke-width": 0.8, "stroke-linecap": "round" });
      for (let [x, y, r] of [[bx + tail * 1.1, by - tail * 0.2, 1.9], [bx + tail * 0.96, by + tail * 0.52, 1.5], [bx + tail * 0.4, by - tail * 0.85, 1.3]])
        pen.form(tg, `M${f(x)} ${f(y - r * 1.6)}C${f(x + r)} ${f(y - r * 0.4)} ${f(x + r)} ${f(y + r)} ${f(x)} ${f(y + r)}C${f(x - r)} ${f(y + r)} ${f(x - r)} ${f(y - r * 0.4)} ${f(x)} ${f(y - r * 1.6)}Z`, finTone, { weight: 0.35, size: 1, flat: !0 });
      pen.form(g, `M${f(cx - rx * 0.25)} ${f(cy - ry * 0.9)}C${f(cx + rx * 0.05)} ${f(cy - ry * 1.5)} ${f(cx + rx * 0.62)} ${f(cy - ry * 1.38)} ${f(cx + rx * 0.9)} ${f(cy - ry * 0.55)}Z`, finTone, { weight: 0.5, size: 6, attrs: { opacity: 0.92 } });
      let bodyD = blob([[cx - rx, cy + 1], [cx - rx * 0.74, cy - ry * 0.8], [cx, cy - ry], [cx + rx * 0.7, cy - ry * 0.68], [cx + rx * 1.02, cy - ry * 0.15], [cx + rx * 1.02, cy + ry * 0.2], [cx + rx * 0.65, cy + ry * 0.72], [cx, cy + ry * 0.98], [cx - rx * 0.76, cy + ry * 0.76]]);
      pen.form(g, bodyD, body, { size: rx, shadowOpacity: 0.36 });
      let inner = pen.g(g, { "clip-path": pen.clip(bodyD) });
      pen.patch(inner, ellipsePath(cx - 2, cy + ry * 0.62, rx * 0.8, ry * 0.42), "#FFFFFF", 0.55);
      for (let row = 0;row < 3; row++)
        for (let k = 0;k < 4 - row; k++) {
          let x = cx + rx * (-0.05 + 0.24 * k + 0.12 * row), y = cy - ry * (0.62 - row * 0.26);
          pen.el("path", { d: `M${f(x - 3)} ${f(y)}q3 3.4 6 0`, fill: "none", stroke: INK, "stroke-width": 0.6, opacity: 0.28 }, inner);
        }
      pen.glow(inner, cx + 2, cy + ry * 0.35, rx * 0.72, ELEMENT2.water.glow, 0.6);
      let spot = (x, y, r, c) => pen.patch(inner, blob(Array.from({ length: 7 }, (_, i) => {
        let a = i / 7 * Math.PI * 2;
        return [x + Math.cos(a) * r * (0.82 + 0.3 * rand()), y + Math.sin(a) * r * 0.78 * (0.82 + 0.3 * rand())];
      })), c, 0.82);
      if (pattern === 0)
        spot(cx + rx * 0.35, cy - ry * 0.55, rx * 0.42, patchA), spot(cx - rx * 0.45, cy - ry * 0.75, rx * 0.26, patchB);
      else if (pattern === 1)
        spot(cx - 1, cy - ry * 0.88, rx * 0.24, patchB);
      else
        for (let k = 0;k < 5; k++)
          spot(cx + rx * (-0.55 + 1.25 * rand()), cy - ry * (0.15 + 0.65 * rand()), rx * (0.1 + 0.08 * rand()), k % 2 ? patchA : patchB);
      for (let side of [-1, 1])
        pen.form(g, `M${f(cx + side * rx * 0.55)} ${f(cy + ry * 0.45)}c${f(side * 6)} ${f(2)} ${f(side * 12)} ${f(8)} ${f(side * 11)} ${f(14)}c${f(-side * 5)} ${f(-1)} ${f(-side * 10)} ${f(-5)} ${f(-side * 11)} ${f(-14)}Z`, finTone, { weight: 0.45, size: 4, attrs: { opacity: 0.9, class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}` } });
      let anchor = pen.g(g, { transform: `translate(${f(cx - 2)} ${f(cy - 1)})` }), head = pen.g(anchor, { class: "portrait__head" }), r = Math.max(rx, ry) * 0.88;
      for (let side of [-1, 1])
        pen.stroke(head, `M${f(side * r * 0.2)} ${f(r * 0.48)}q${f(side * 4)} ${f(3)} ${f(side * 3)} ${f(7)}q${f(-side * 1)} ${f(2)} ${f(side * 1.5)} ${f(3)}`, pen.lw * 0.5, { opacity: 0.7 });
      drawFace(pen, head, { ...faceFrom(u, r), kind: "fish", cheeks: !0, delighted: s.delighted });
    } };
  }
  function fox(d) {
    let u = d.u, bx = CENTER3 + 8, rx = 26 + 4 * u[1], ry = 15 + 3 * u[0], by = FOOT3 - 4 - ry, R = (21 + 4 * u[3]) * d.head, headX = CENTER3 - 8, headY = by - 9 - R * 0.45, earL = R * (0.72 + 0.3 * u[5]), spread = 14 + 10 * u[6], lanterns = 1 + Math.floor(u[12] * 3), coatC = pick([[0.66, 0.12, 46], [0.74, 0.12, 70], [0.72, 0.02, 60], [0.56, 0.12, 32]], u[14]), coat = own(coatC[0] + 0.05 * (u[13] - 0.5), coatC[1], coatC[2], 0.14), cream = toneOf("#F4E7D2"), socks = u[11] > 0.5, ash = toneOf(socks ? mix2(coat.shadow, "#4A3C3A", 0.55) : "#A9A39C", "#3E4F63"), tipX = bx + rx + 10, tipY = by - ry - 20;
    return { geo: { top: Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tipY - 30), left: headX - R - 6, right: tipX + 14, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let tail = pen.g(g, { class: "cr-tail" }), brush = blob([[bx + rx * 0.6, by + ry * 0.4], [bx + rx + 6, by + ry * 0.1], [tipX + 6, by - ry * 0.9], [tipX + 2, tipY], [tipX - 8, tipY + 3], [bx + rx * 0.62, by - ry * 0.55], [bx + rx * 0.35, by]], 0.9);
      pen.form(tail, brush, coat, { size: 12, grain: !0, hatch: !0 }), pen.patch(tail, blob([[tipX - 9, tipY + 4], [tipX + 2, tipY - 1], [tipX + 6, tipY + 7], [tipX - 3, tipY + 9]]), cream.base, 0.95);
      for (let i = 0;i < lanterns; i++)
        flame(pen, tail, tipX - 5 + (i - (lanterns - 1) / 2) * 9, tipY - 9 - i % 2 * 6, 6 + (i === 1 ? 1 : 0), `cr-lantern cr-lantern-${i}`);
      pen.form(g, blob([[bx - rx, by + ry * 0.3], [bx - rx * 0.6, by - ry * 0.95], [bx + rx * 0.3, by - ry], [bx + rx, by - ry * 0.1], [bx + rx * 0.85, by + ry * 0.85], [bx - rx * 0.4, by + ry * 0.95]]), coat, { size: rx * 0.7, grain: !0, hatch: !0 }), pen.form(g, ellipsePath(bx + rx * 0.62, FOOT3 - 3.4, 7, 4.2), ash, { weight: 0.7, size: 5 });
      for (let x of [headX - 7, headX + 9])
        pen.form(g, ellipsePath(x, FOOT3 - 3.2, 7, 4.4), ash, { weight: 0.75, size: 5 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1])
        ear(pen, head, side, [side * R * 0.55, -R * 0.62], spread, pointEar(R * 0.38, earL), coat, mix2("#F6E2CF", coat.base, 0.15), R * 0.3);
      let ruff = blob([[-R * 1.18, R * 0.25], [-R * 0.8, -R * 0.1], [0, R * 0.1], [R * 0.8, -R * 0.1], [R * 1.18, R * 0.25], [R * 0.75, R * 0.85], [0, R * 1], [-R * 0.75, R * 0.85]]);
      pen.form(head, ellipsePath(0, 0, R, R * 0.94), coat, { size: R, grain: !0, hatch: !0 }), pen.form(head, ruff, cream, { size: R * 0.7, weight: 0.7 });
      for (let [x, y, a] of [[-1.05, 0.35, -40], [-0.95, 0.55, -20], [1.05, 0.35, 40], [0.95, 0.6, 25]])
        pen.stroke(head, `M${f(x * R)} ${f(y * R)}l${f(Math.sin(a * Math.PI / 180) * 6)} ${f(-Math.cos(a * Math.PI / 180) * 6)}`, pen.lw * 0.45, { stroke: "#C9A24A" });
      pen.patch(head, `M0 ${f(-R * 0.72)}C${f(R * 0.12)} ${f(-R * 0.6)} ${f(R * 0.12)} ${f(-R * 0.45)} 0 ${f(-R * 0.36)}C${f(-R * 0.12)} ${f(-R * 0.45)} ${f(-R * 0.12)} ${f(-R * 0.6)} 0 ${f(-R * 0.72)}Z`, "#F7F0E6", 0.95), drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: !0, delighted: s.delighted });
    } };
  }
  function phoenix(d) {
    let u = d.u, hover = 14 + 6 * u[11], R = (24 + 4 * u[0]) * (0.5 + d.head / 2), cy = FOOT3 - hover - R - 5, crownKind = Math.floor(u[2] * 3), plumeC = pick([[0.64, 0.12, 50], [0.74, 0.12, 74], [0.68, 0.03, 62], [0.58, 0.12, 30]], u[14]), plume = own(plumeC[0] + 0.05 * (u[13] - 0.5), plumeC[1], plumeC[2], 0.12), belly = toneOf(mix2(ELEMENT2.fire.soft, CREAM, 0.3)), leafTones = [toneOf(mix2("#C7652F", CREAM, 0.12)), toneOf(mix2("#D9A04A", CREAM, 0.12)), toneOf(mix2("#B35A3A", CREAM, 0.16))], wingL = R * (1.05 + 0.25 * u[5]);
    return { geo: { top: Math.min(cy - R - 17, cy - wingL * 0.95), left: CENTER3 - R - wingL * 0.6, right: CENTER3 + R + 26, headX: CENTER3, headY: cy - R * 0.1, headR: R * 0.9, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" });
      for (let k = 0;k < 3; k++) {
        let x0 = CENTER3 + R * 0.55, y0 = cy + R * 0.55, x1 = x0 + 16 + k * 3, y1 = y0 + 6 + k * 6;
        pen.form(tail, `M${f(x0)} ${f(y0 - 2)}Q${f(x1 - 4)} ${f(y1 - 8)} ${f(x1)} ${f(y1)}Q${f(x1 - 9)} ${f(y1 - 2)} ${f(x0)} ${f(y0 + 2)}Z`, leafTones[k], { weight: 0.5, size: 4 }), pen.glow(tail, x1 + 1.5, y1 + 1, 5, ELEMENT2.fire.glow, 0.65), pen.el("circle", { cx: x1 + 1.5, cy: y1 + 1, r: 1.7, fill: ELEMENT2.fire.light, stroke: INK, "stroke-width": pen.lw * 0.3 }, tail);
      }
      for (let side of [-1, 1]) {
        let wg = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${f(CENTER3 + side * R * 0.7)} ${f(cy + R * 0.1)}) rotate(${side * (s.asleep ? 80 : 42)}) scale(${f(side * fold)} 1)` }), L = wingL, leaf = `M0 0C${f(L * 0.28)} ${f(-L * 0.4)} ${f(L * 0.62)} ${f(-L * 0.8)} ${f(L * 0.38)} ${f(-L * 1.05)}C${f(L * 0.3)} ${f(-L * 0.9)} ${f(L * 0.12)} ${f(-L * 0.95)} ${f(L * 0.02)} ${f(-L * 0.82)}C${f(-L * 0.12)} ${f(-L * 0.85)} ${f(-L * 0.35)} ${f(-L * 0.7)} ${f(-L * 0.25)} ${f(-L * 0.5)}C${f(-L * 0.42)} ${f(-L * 0.42)} ${f(-L * 0.4)} ${f(-L * 0.18)} ${f(-L * 0.18)} ${f(-L * 0.05)}Z`;
        pen.el("path", { d: leaf, fill: "none", stroke: ELEMENT2.fire.light, "stroke-width": 4.5, opacity: 0.6, filter: pen.filter("soft") }, wg), pen.form(wg, leaf, leafTones[(1 + (side > 0 ? 1 : 0) + Math.floor(u[13] * 2)) % 3], { size: L * 0.4, weight: 0.75, grain: !0 }), pen.stroke(wg, `M${f(L * 0.02)} ${f(-L * 0.05)}L${f(L * 0.22)} ${f(-L * 0.85)}`, pen.lw * 0.45, { opacity: 0.55 });
        for (let k = 0;k < 3; k++)
          pen.stroke(wg, `M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(L * 0.2)} ${f(-L * 0.08)}M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(-L * 0.18)} ${f(-L * 0.12)}`, pen.lw * 0.32, { opacity: 0.45 });
      }
      let bodyD = blob([[CENTER3, cy - R], [CENTER3 + R * 0.85, cy - R * 0.5], [CENTER3 + R * 1.02, cy + R * 0.25], [CENTER3 + R * 0.6, cy + R * 0.92], [CENTER3, cy + R * 1.02], [CENTER3 - R * 0.6, cy + R * 0.92], [CENTER3 - R * 1.02, cy + R * 0.25], [CENTER3 - R * 0.85, cy - R * 0.5]]);
      pen.form(g, bodyD, plume, { size: R, grain: !0, hatch: !0 });
      let skirt = pen.g(g, { "clip-path": pen.clip(bodyD) });
      for (let k = 0;k < 8; k++) {
        let a = Math.PI * (0.1 + 0.8 * k / 7), x = CENTER3 + Math.cos(a) * R * 0.95, y = cy + Math.sin(a) * R * 0.85;
        pen.form(skirt, ellipsePath(x, y, 8.5, 5.5), leafTones[(k + Math.floor(rand() * 3)) % 3], { weight: 0.45, size: 4, attrs: { transform: `rotate(${f(a * 180 / Math.PI - 90)} ${f(x)} ${f(y)})` } });
      }
      pen.patch(g, ellipsePath(CENTER3, cy + R * 0.32, R * 0.55, R * 0.5), belly.base, 0.92), pen.glow(g, CENTER3, cy + R * 0.25, R * 0.48, ELEMENT2.fire.glow, 0.5);
      for (let side of [-1, 1])
        pen.stroke(g, `M${f(CENTER3 + side * 6)} ${f(cy + R * 0.98)}l0 4.5m0 0l-2 2m2 -2l2 2`, pen.lw * 0.55, { stroke: "#7E7369" });
      let crown = pen.g(g);
      if (crownKind === 0)
        for (let dx of [-0.32, 0, 0.32]) {
          let x = CENTER3 + dx * R, y = cy - R * (dx === 0 ? 1.18 : 1.05);
          pen.stroke(crown, `M${f(CENTER3 + dx * R * 0.6)} ${f(cy - R * 0.88)}L${f(x)} ${f(y + 2)}`, pen.lw * 0.6, { stroke: "#6B4A35" }), pen.glow(crown, x, y, 5, ELEMENT2.fire.glow, 0.55), pen.form(crown, ellipsePath(x, y, 3.2, 4), toneOf("#8E5A3A"), { weight: 0.5, size: 2.5 }), pen.patch(crown, ellipsePath(x, y + 1.6, 1.6, 1), ELEMENT2.fire.light, 0.95);
        }
      else if (crownKind === 1)
        flame(pen, crown, CENTER3 + 1, cy - R * 0.9, 7);
      else
        for (let a of [-28, 0, 26])
          oakLeaf(pen, crown, CENTER3 + a * 0.12, cy - R * 0.9, 10, a, leafTones[a === 0 ? 0 : 1]);
      let anchor = pen.g(g, { transform: `translate(${CENTER3} ${f(cy - R * 0.1)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace(pen, head, { ...faceFrom(u, R * 0.9), kind: "bird", cheeks: !0, delighted: s.delighted, beakTone: toneOf("#E8A65A") });
    } };
  }
  function lemur(d) {
    let u = d.u, hover = 17 + 6 * u[11], by = FOOT3 - hover - 20, R = (20 + 4 * u[3]) * d.head, headY = by - 16 - R * 0.55, reach = 38 + 9 * u[1], fernEars = u[5] > 0.45, furC = pick([[0.78, 0.02, 290], [0.84, 0.03, 75], [0.7, 0.025, 250]], u[14]), fur = own(furC[0] + 0.05 * (u[13] - 0.5), furC[1], furC[2], 0.16), belly = toneOf(mix2(CREAM, "#FFFFFF", 0.3)), tint = pick([ELEMENT2.air.soft, "#EDF3F7", "#F5EFE3"], u[12]), membrane = { light: mix2(tint, "#FFFFFF", 0.5), base: mix2(tint, ELEMENT2.air.light, 0.18), shadow: mix2(ELEMENT2.air.light, "#8C92B0", 0.4) };
    return { geo: { top: headY - R - (fernEars ? R * 0.95 : R * 0.6), left: CENTER3 - reach - 5, right: CENTER3 + Math.max(reach, 44) + 6, headX: CENTER3, headY, headR: R, hover }, draw(pen, g, s) {
      let fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" }), pts = [[CENTER3 + 6, by + 14], [CENTER3 + 20, by + 22], [CENTER3 + 36, by + 16], [CENTER3 + 40, by + 2]];
      pen.stroke(tail, curve(pts), 7, { stroke: INK, filter: null }), pen.stroke(tail, curve(pts), 5.2, { stroke: fur.base, filter: null }), pen.stroke(tail, curve(pts), 5.2, { stroke: fur.shadow, filter: null, "stroke-dasharray": "3.4 4", "stroke-linecap": "butt" }), wisp(pen, tail, CENTER3 + 38, by + 1, 9, { light: "#FFFFFF", base: "#F7F4FA", shadow: membrane.shadow });
      for (let side of [-1, 1]) {
        let wg = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${CENTER3} ${f(by)}) scale(${f(side * fold)} 1)` }), wing = `M6 -16C${f(reach * 0.45)} -23 ${f(reach * 0.85)} -25 ${f(reach)} -19C${f(reach * 1.05)} -7 ${f(reach * 0.92)} 2 ${f(reach * 0.78)} 6C${f(reach * 0.62)} 12 ${f(reach * 0.4)} 10 ${f(reach * 0.28)} 17C${f(reach * 0.2)} 18 10 15 6 10Z`;
        pen.form(wg, wing, membrane, { size: 14, weight: 0.6, shade: [0.25, 0.45], shadowOpacity: 0.35, attrs: { opacity: 0.9 } });
        for (let k = 0;k < 4; k++)
          pen.stroke(wg, `M8 ${f(-8 + k * 3)}Q${f(reach * 0.45)} ${f(-14 + k * 6)} ${f(reach * (0.95 - k * 0.12))} ${f(-14 + k * 6.5)}`, pen.lw * 0.3, { opacity: 0.3 });
        for (let k = 0;k < 6; k++) {
          let t = k / 5, x = reach * (0.99 - t * 0.62), y = -17 + t * 31;
          pen.el("circle", { cx: f(x), cy: f(y), r: 1.35, fill: "#FFFFFF", stroke: INK, "stroke-width": 0.35, opacity: 0.9 }, wg);
        }
        pen.stroke(wg, `M8 -15Q${f(reach * 0.5)} -22 ${f(reach)} -19`, pen.lw * 0.9, { stroke: fur.shadow }), pen.form(wg, ellipsePath(reach, -19, 2.6, 2.2), fur, { weight: 0.45, size: 2 });
      }
      pen.form(g, ellipsePath(CENTER3, by, 15, 18), fur, { size: 15, grain: !0 }), pen.patch(g, ellipsePath(CENTER3, by + 3, 9, 12), belly.base, 0.9);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER3 + side * 7, by + 18, 3.6, 2.8), fur, { weight: 0.5, size: 2.5 });
      let anchor = pen.g(g, { transform: `translate(${CENTER3} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (fernEars)
        for (let side of [-1, 1]) {
          let shape = `M${f(-R * 0.22)} 0C${f(-R * 0.32)} ${f(-R * 0.45)} ${f(-R * 0.15)} ${f(-R * 0.85)} ${f(R * 0.12)} ${f(-R * 0.95)}C${f(R * 0.4)} ${f(-R * 1)} ${f(R * 0.42)} ${f(-R * 0.72)} ${f(R * 0.2)} ${f(-R * 0.7)}C${f(R * 0.08)} ${f(-R * 0.68)} ${f(R * 0.1)} ${f(-R * 0.8)} ${f(R * 0.18)} ${f(-R * 0.8)}C${f(R * 0.12)} ${f(-R * 0.6)} ${f(R * 0.28)} ${f(-R * 0.3)} ${f(R * 0.22)} 0Z`, e = ear(pen, head, side, [side * R * 0.62, -R * 0.6], 58, shape, toneOf(mix2(fur.base, ELEMENT2.earth.light, 0.35)), mix2(ELEMENT2.earth.soft, fur.base, 0.3), R * 0.25);
          for (let k = 1;k <= 3; k++)
            pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M${f(R * 0.02)} ${f(-R * k * 0.2)}l${f(R * 0.14)} ${f(-R * 0.05)}`, pen.lw * 0.4, { opacity: 0.55 });
        }
      else
        for (let side of [-1, 1])
          ear(pen, head, side, [side * R * 0.7, -R * 0.45], 48, roundEar(R * 0.42, R * 0.6), fur, mix2(ELEMENT2.air.light, fur.base, 0.3), R * 0.3);
      pen.form(head, ellipsePath(0, 0, R, R * 0.95), fur, { size: R, grain: !0 }), pen.patch(head, ellipsePath(0, R * 0.32, R * 0.62, R * 0.45), belly.base, 0.88);
      for (let side of [-1, 1])
        pen.glow(head, side * R * (0.4 + 0.12 * u[8]), R * (-0.04 + 0.12 * (0.5 - u[9])), R * 0.5, ELEMENT2.air.glow, 0.6);
      drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: u[2] > 0.4 || s.delighted, delighted: s.delighted, noseTone: "#7A6470" });
    } };
  }
  function lamb(d) {
    let u = d.u, hover = 14 + 6 * u[11], rx = 29 + 4 * u[1], ry = 19 + 3 * u[0], cy = FOOT3 - hover - ry - 4, R = (15 + 3 * u[3]) * d.head, woolC = pick(["#F6F2F7", "#F7EAEA", "#ECE6F4", "#E8EFF6"], u[14]), wool = { light: "#FFFFFF", base: mix2(woolC, ELEMENT2.air.soft, 0.2), shadow: mix2(ELEMENT2.air.light, "#9AA4C2", 0.45) }, face = toneOf(u[13] > 0.72 ? mix2("#8C7468", CREAM, 0.2) : mix2("#F3D9C6", CREAM, 0.35)), rand = stream(d.seed), puffs = [[0, 0, 1]], count = 7 + Math.floor(u[12] * 3);
    for (let k = 0;k < count; k++) {
      let a = Math.PI * (1.05 + 0.9 * k / (count - 1)) + (rand() - 0.5) * 0.25;
      puffs.push([Math.cos(a) * rx * 0.72, Math.sin(a) * ry * 0.7, 0.36 + 0.14 * rand()]);
    }
    puffs.push([-rx * 0.62, ry * 0.35, 0.36], [rx * 0.6, ry * 0.32, 0.38]);
    let reach = (a) => Math.max(...puffs.map(([px, py, k]) => {
      let pr = k === 1 ? 0 : k * rx, dx = Math.cos(a), dy = Math.sin(a);
      if (k === 1)
        return 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
      let b = px * dx + py * dy, c = px * px + py * py - pr * pr, disc = b * b - c;
      return disc < 0 ? 0 : b + Math.sqrt(disc);
    })), outline = Array.from({ length: 64 }, (_, i) => {
      let a = i / 64 * Math.PI * 2, r = reach(a);
      return [CENTER3 + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    return { geo: { top: Math.min(...outline.map((p) => p[1])) - 3, left: Math.min(...outline.map((p) => p[0])) - 3, right: Math.max(...outline.map((p) => p[0])) + 10, headX: CENTER3 - 2, headY: cy + 3, headR: R * 1.1, hover }, draw(pen, g, s) {
      for (let x of [-rx * 0.5, -rx * 0.18, rx * 0.18, rx * 0.5])
        pen.stroke(g, `M${f(CENTER3 + x)} ${f(cy + ry * 0.75)}l0 6`, 2.6, { stroke: mix2(wool.shadow, INK, 0.2) }), pen.form(g, ellipsePath(CENTER3 + x, cy + ry * 0.75 + 7, 2.6, 2.1), toneOf("#5E5260"), { weight: 0.4, size: 2 });
      let cloud = blob(outline, 1);
      pen.form(g, cloud, wool, { size: rx * 0.55, shade: [0.25, 0.5], shadowOpacity: 0.55 });
      let inner = pen.g(g, { "clip-path": pen.clip(cloud) });
      for (let [px, py, k] of puffs.slice(1, -2))
        pen.el("path", { d: `M${f(CENTER3 + px - k * rx * 0.7)} ${f(cy + py + k * rx * 0.4)}a${f(k * rx * 0.75)} ${f(k * rx * 0.75)} 0 0 1 ${f(k * rx * 1.3)} ${f(-k * rx * 0.2)}`, fill: "none", stroke: wool.shadow, "stroke-width": 0.9, opacity: 0.45 }, inner);
      for (let k = 0;k < 3; k++) {
        let x = CENTER3 + rx * (-0.6 + 1.2 * rand()), y = cy - ry * (0.2 + 0.4 * rand());
        pen.stroke(g, `M${f(x - 2)} ${f(y)}l4 0M${f(x)} ${f(y - 2)}l0 4M${f(x - 1.4)} ${f(y - 1.4)}l2.8 2.8`, 0.6, { opacity: 0.55, stroke: mix2(ELEMENT2.air.base, INK, 0.3) });
      }
      let tail = pen.g(g, { class: "cr-tail" });
      wisp(pen, tail, CENTER3 + rx * 0.98, cy - ry * 0.1, 8, wool), wisp(pen, tail, CENTER3 + rx * 0.9, cy + ry * 0.38, 6, wool);
      let anchor = pen.g(g, { transform: `translate(${f(CENTER3 - 2)} ${f(cy + 3)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1])
        ear(pen, head, side, [side * R * 0.82, -R * 0.42], 105, `M${f(-R * 0.22)} 0C${f(-R * 0.3)} ${f(-R * 0.4)} ${f(-R * 0.12)} ${f(-R * 0.75)} 0 ${f(-R * 0.78)}C${f(R * 0.14)} ${f(-R * 0.75)} ${f(R * 0.3)} ${f(-R * 0.4)} ${f(R * 0.22)} 0Z`, face, mix2(ELEMENT2.air.light, face.base, 0.4), R * 0.2);
      pen.form(head, ellipsePath(0, 0, R * 0.9, R * 1), face, { size: R * 0.9 }), pen.patch(head, blob([[-R * 0.75, -R * 0.55], [-R * 0.3, -R * 1.02], [R * 0.3, -R * 1.05], [R * 0.75, -R * 0.55], [R * 0.4, -R * 0.62], [0, -R * 0.5], [-R * 0.4, -R * 0.62]]), wool.base, 0.95), drawFace(pen, head, { ...faceFrom(u, R * 1.05), spread: 0.36 + 0.1 * u[8], kind: "lamb", cheeks: !0, delighted: s.delighted, noseTone: "#8A6D72" });
    } };
  }
  var BUILDERS = { squirrel, moth, turtle, koi, fox, phoenix, lemur, lamb };
  function gardenLayout(d, fed = 0) {
    let sp = BUILDERS[d.species](d), geo = sp.geo, grow = 1 + 0.2 * fed, fit = Math.min(1, (FOOT3 - 6) / ((FOOT3 - geo.top) * grow), 56 / ((CENTER3 - geo.left) * grow), 57 / ((geo.right - CENTER3) * grow)), scale = fit * grow, Y = (y) => (FOOT3 - (FOOT3 - y) * scale) / BOX_H2, X = (x) => (CENTER3 + (x - CENTER3) * scale) / 120;
    return { sp, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX) } };
  }
  function paintGarden(document2, p, state = {}) {
    let d = gardenDraw(p, state.finish), fed = state.fed ?? 0, { sp, fit, grow, extent } = gardenLayout(d, fed), svg = document2.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 120 ${BOX_H2}`), svg.setAttribute("class", `portrait portrait-v2 critter garden finish-${d.finish} species-${d.species} element-${d.element}${FLIERS.has(d.species) ? " flier" : ""}`), svg.dataset.direction = "garden", svg.dataset.species = d.species, svg.dataset.element = d.element, svg.dataset.asleep = String(!!state.asleep);
    for (let [k, v] of Object.entries(extent))
      svg.dataset[k === "headY" ? "hy" : k === "headRadius" ? "hr" : k] = v.toFixed(3);
    if (svg.style.setProperty("--d", `${(p.idlePhase * 5).toFixed(2)}s`), svg.style.setProperty("--cheeks", state.delighted ? "1" : "0"), svg.style.setProperty("--mouth", state.delighted ? "1" : "0"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative !== !1)
      svg.setAttribute("aria-hidden", "true");
    let painted = d.finish === "painted", pen = new Pen(document2, svg, (painted ? 1.8 : 2.1) / Math.max(0.75, fit));
    pen.finish = d.finish;
    let hover = sp.geo.hover * (state.asleep ? 0.35 : 1), shadowW = (sp.geo.right - sp.geo.left) * 0.3 * fit * (hover ? 0.75 : 1);
    if (painted)
      pen.el("ellipse", { cx: CENTER3, cy: FOOT3 + 1.5, rx: f(shadowW), ry: f(hover ? 3.4 : 4.6), fill: mix2(ELEMENT2[d.element].shadow, INK, 0.45), opacity: hover ? 0.2 : 0.24, filter: pen.filter("wash"), class: "portrait__shadow cr-shadow" }, svg);
    else
      pen.el("ellipse", { cx: CENTER3, cy: FOOT3 + 1.5, rx: f(shadowW), ry: f(hover ? 3.2 : 4.4), fill: INK, opacity: hover ? 0.1 : 0.16, class: "portrait__shadow cr-shadow" }, svg);
    let fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER3} ${FOOT3}) scale(${fit.toFixed(4)}) translate(${-CENTER3} ${-FOOT3})` : null }), hoverG = pen.g(fitG, { class: "cr-hover", transform: hover !== sp.geo.hover ? `translate(0 ${f(sp.geo.hover - hover)})` : null }), figure = pen.g(hoverG, { class: "portrait__figure" }), body = pen.g(figure, { transform: fed ? `translate(${CENTER3} ${FOOT3}) scale(${grow.toFixed(3)}) translate(${-CENTER3} ${-FOOT3})` : null });
    if (sp.draw(pen, body, { asleep: !!state.asleep, delighted: !!state.delighted, fed }), !state.decorative && state.name) {
      let title = document2.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = state.name, svg.prepend(title), svg.setAttribute("role", "img"), svg.removeAttribute("aria-hidden");
    }
    return svg;
  }

  // docs/explorations/critter-directions/src/companions.ts
  var PLAN_NAMES = { sitter: "Sitter", floater: "Floater", lounger: "Lounger" }, pick2 = (list, x) => list[Math.min(list.length - 1, Math.floor(x * list.length))];
  function companionDraw(p) {
    let u = uniforms(p), element = p.element, floatShare = { earth: 0.25, fire: 0.3, water: 0.55, air: 0.6 }[element], plan = u[15] < floatShare ? "floater" : u[15] < floatShare + (1 - floatShare) * 0.45 ? "lounger" : "sitter";
    return { element, plan, u, seed: Math.floor(u[15] * 1e9) ^ Math.floor(u[3] * 1e6) };
  }
  var COATS = {
    earth: [[0.9, 0.03, 90], [0.82, 0.05, 120], [0.86, 0.06, 95]],
    water: [[0.6, 0.08, 195], [0.68, 0.07, 185], [0.62, 0.06, 220]],
    fire: [[0.7, 0.12, 62], [0.64, 0.12, 45], [0.74, 0.1, 75]],
    air: [[0.94, 0.02, 85], [0.89, 0.035, 230], [0.9, 0.03, 300]]
  };
  function paint(pen, parent, d, tone, o = {}) {
    let g = pen.form(parent, d, tone, { size: o.size ?? 20, weight: o.weight ?? 0.8, shade: [0.42, 0.52], shadowOpacity: 0.36, grain: o.grain ?? !1, attrs: o.attrs ?? {} });
    if (o.rim !== !1) {
      let inner = pen.g(g, { "clip-path": pen.clip(d) }), s = o.size ?? 20;
      pen.el("path", { d, fill: "none", stroke: mix2(tone.light, "#FFE7C2", 0.4), "stroke-width": Math.max(1.4, s * 0.12), opacity: 0.55, transform: `translate(${f(-s * 0.05)} ${f(-s * 0.06)})`, filter: pen.filter("soft") }, inner);
    }
    return g;
  }
  function crumb(pen, parent, x, y, s) {
    let g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)}) scale(${f(s / 14)})`, class: "cr-crumb" });
    return pen.el("path", { d: "M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z", fill: "#CFA552", stroke: INK, "stroke-width": 1.4, "stroke-linejoin": "round", filter: pen.filter("loose") }, g), pen.el("ellipse", { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: "#F2DD8E", transform: "rotate(-25 -2 -2.5)" }, g), g;
  }
  function elementParts(d, coat) {
    let u = d.u, E = ELEMENT2[d.element], variant = u[5] < 0.5 ? 0 : 1, part = { light: mix2(E.light, CREAM, 0.35), base: mix2(E.base, E.light, 0.45), shadow: E.shadow }, soft = { light: "#FFFFFF", base: mix2(E.soft, "#FFFFFF", 0.2), shadow: mix2(E.light, E.base, 0.3) }, earPath = (R) => {
      let w = R * 0.42, L = R * (0.85 + 0.3 * u[6]);
      if (d.element === "earth")
        return variant ? `M0 0C${f(-w * 1.5)} ${f(-L * 0.3)} ${f(-w * 0.9)} ${f(-L * 0.85)} ${f(w * 0.2)} ${f(-L)}C${f(w * 0.9)} ${f(-L * 0.7)} ${f(w * 1.3)} ${f(-L * 0.3)} 0 0Z` : `M${f(-w * 0.7)} 0C${f(-w * 1.25)} ${f(-L * 0.45)} ${f(-w * 0.55)} ${f(-L * 0.95)} ${f(w * 0.05)} ${f(-L)}C${f(w * 0.75)} ${f(-L * 0.9)} ${f(w * 1.15)} ${f(-L * 0.45)} ${f(w * 0.7)} 0Z`;
      if (d.element === "water")
        return `M${f(-w * 0.85)} 0C${f(-w * 0.75)} ${f(-L * 0.55)} ${f(w * 0.1)} ${f(-L * 0.95)} ${f(w * 0.8)} ${f(-L)}C${f(w * 0.55)} ${f(-L * 0.62)} ${f(w * 0.95)} ${f(-L * 0.28)} ${f(w * 0.85)} 0Z`;
      if (d.element === "fire")
        return `M${f(-w * 0.8)} 0C${f(-w * 1)} ${f(-L * 0.5)} ${f(-w * 0.4)} ${f(-L * 0.8)} ${f(-w * 0.05)} ${f(-L * 0.92)}C${f(w * 0.3)} ${f(-L * 0.8)} ${f(w * 0.95)} ${f(-L * 0.5)} ${f(w * 0.8)} 0Z`;
      return "";
    };
    return {
      part,
      soft,
      ears(pen, head, R) {
        if (d.element === "air") {
          for (let side of [-1, 1]) {
            let at = pen.g(head, { transform: `translate(${f(side * R * 0.68)} ${f(-R * 0.62)})` }), rot = pen.g(at, { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${side * (variant ? 30 : 12)}deg` }), puffs = variant ? [[0, -R * 0.2, R * 0.28], [side * R * 0.12, -R * 0.48, R * 0.24], [-side * R * 0.1, -R * 0.42, R * 0.2]] : [[0, -R * 0.22, R * 0.26], [0, -R * 0.5, R * 0.2]];
            for (let [x, y, r] of puffs)
              paint(pen, rot, ellipsePath(x, y, r, r * 0.92), soft, { size: r, weight: 0.6 });
          }
          return;
        }
        for (let side of [-1, 1]) {
          let at = pen.g(head, { transform: `translate(${f(side * R * 0.6)} ${f(-R * 0.62)})` }), rot = pen.g(at, { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${f(side * (18 + 22 * u[6]))}deg` }), m = side < 0 ? pen.g(rot, { transform: "scale(-1 1)" }) : rot, dd = earPath(R);
          if (paint(pen, m, dd, d.element === "fire" ? coat : part, { size: R * 0.3, weight: 0.7 }), d.element === "earth")
            pen.stroke(m, `M0 ${f(-R * 0.08)}L${f(R * 0.08)} ${f(-R * 0.75)}`, pen.lw * 0.4, { opacity: 0.5, stroke: E.shadow });
          if (d.element === "water")
            for (let k = 0;k < 3; k++)
              pen.stroke(m, `M${f(-R * 0.15 + k * R * 0.14)} ${f(-R * 0.05)}Q${f(R * 0.05 + k * R * 0.12)} ${f(-R * 0.5)} ${f(R * 0.3)} ${f(-R * 0.85)}`, pen.lw * 0.3, { opacity: 0.35, stroke: E.shadow });
          if (d.element === "fire") {
            pen.patch(m, dd, mix2("#FBE3CC", coat.base, 0.2), 0.8, { transform: "translate(0 -1) scale(.55 .7)" });
            let fx = -R * 0.05, fy = -R * (0.85 + 0.3 * u[6]) * 0.92;
            pen.glow(m, fx, fy - R * 0.12, R * 0.28, E.glow, 0.6), pen.form(m, `M${f(fx)} ${f(fy - R * 0.42)}C${f(fx + R * 0.1)} ${f(fy - R * 0.22)} ${f(fx + R * 0.24)} ${f(fy - R * 0.12)} ${f(fx + R * 0.16)} ${f(fy + R * 0.04)}C${f(fx + R * 0.08)} ${f(fy + R * 0.12)} ${f(fx - R * 0.14)} ${f(fy + R * 0.1)} ${f(fx - R * 0.16)} ${f(fy)}C${f(fx - R * 0.2)} ${f(fy - R * 0.16)} ${f(fx - R * 0.05)} ${f(fy - R * 0.24)} ${f(fx)} ${f(fy - R * 0.42)}Z`, { light: "#FFF1CF", base: E.light, shadow: E.base }, { weight: 0.45, size: R * 0.15, shade: [0.3, 0.25] });
          }
        }
      },
      crest(pen, head, R) {
        if (u[2] < 0.35)
          return;
        let top = -R * 0.98, g = pen.g(head);
        if (d.element === "earth") {
          pen.stroke(g, `M0 ${f(top + 2)}q1 -5 -0.5 -9`, pen.lw * 0.9, { stroke: E.shadow });
          for (let side of [-1, 1])
            paint(pen, g, `M0 ${f(top - 7)}c${f(side * 4)} -6 ${f(side * 10)} -6 ${f(side * 11)} -3c${f(-side * 3)} 4 ${f(-side * 8)} 5 ${f(-side * 11)} 3Z`, part, { size: 4, weight: 0.55 });
        } else if (d.element === "water")
          paint(pen, g, `M0 ${f(top - 9)}C3 ${f(top - 4)} 3.4 ${f(top + 1)} 0 ${f(top + 1.5)}C-3.4 ${f(top + 1)} -3 ${f(top - 4)} 0 ${f(top - 9)}Z`, soft, { size: 3, weight: 0.55 });
        else if (d.element === "fire")
          pen.glow(g, 0, top - 3, 7, E.glow, 0.6), pen.form(g, `M0 ${f(top - 11)}C2.4 ${f(top - 6)} 4.4 ${f(top - 3)} 3.4 ${f(top + 1)}C2 ${f(top + 3)} -2 ${f(top + 3)} -3.4 ${f(top + 1)}C-4.2 ${f(top - 3)} -1.4 ${f(top - 6)} 0 ${f(top - 11)}Z`, { light: "#FFF1CF", base: E.light, shadow: E.base }, { weight: 0.55, size: 3 });
        else
          for (let [x, y, r] of [[0, top - 4, 4.4], [4, top - 1, 3.4], [-4, top - 1, 3]])
            paint(pen, g, ellipsePath(x, y, r, r * 0.9), soft, { size: r, weight: 0.5 });
      },
      tail(pen, body, x, y, s) {
        let g = pen.g(body, { class: "cr-tail", transform: `translate(${f(x)} ${f(y)})` });
        if (d.element === "earth")
          pen.stroke(g, `M0 0q${f(s * 0.5)} ${f(s * 0.1)} ${f(s * 0.7)} ${f(-s * 0.6)}`, pen.lw * 0.9, { stroke: E.shadow }), paint(pen, g, `M${f(s * 0.7)} ${f(-s * 0.6)}c${f(s * 0.1)} ${f(-s * 0.45)} ${f(s * 0.45)} ${f(-s * 0.6)} ${f(s * 0.75)} ${f(-s * 0.55)}c${f(-s * 0.05)} ${f(s * 0.35)} ${f(-s * 0.35)} ${f(s * 0.6)} ${f(-s * 0.75)} ${f(s * 0.55)}Z`, part, { size: s * 0.3, weight: 0.6 });
        else if (d.element === "water")
          paint(pen, g, `M0 -2C${f(s * 0.4)} ${f(-s * 0.1)} ${f(s * 0.8)} ${f(-s * 0.6)} ${f(s * 0.95)} ${f(-s * 0.55)}C${f(s * 0.85)} ${f(-s * 0.2)} ${f(s * 0.95)} ${f(s * 0.15)} ${f(s * 0.85)} ${f(s * 0.3)}C${f(s * 0.6)} ${f(s * 0.2)} ${f(s * 0.3)} ${f(s * 0.1)} 0 3Z`, soft, { size: s * 0.3, weight: 0.55 });
        else if (d.element === "fire")
          pen.stroke(g, `M0 0q${f(s * 0.55)} ${f(s * 0.15)} ${f(s * 0.6)} ${f(-s * 0.55)}`, 3.6, { stroke: INK, filter: null }), pen.stroke(g, `M0 0q${f(s * 0.55)} ${f(s * 0.15)} ${f(s * 0.6)} ${f(-s * 0.55)}`, 2.2, { stroke: coat.base, filter: null }), pen.glow(g, s * 0.62, -s * 0.72, s * 0.4, E.glow, 0.6), pen.form(g, `M${f(s * 0.6)} ${f(-s * 1.05)}c${f(s * 0.12)} ${f(s * 0.2)} ${f(s * 0.28)} ${f(s * 0.32)} ${f(s * 0.18)} ${f(s * 0.48)}c${f(-s * 0.1)} ${f(s * 0.1)} ${f(-s * 0.32)} ${f(s * 0.08)} ${f(-s * 0.36)} ${f(-s * 0.06)}c${f(-s * 0.04)} ${f(-s * 0.18)} ${f(s * 0.12)} ${f(-s * 0.26)} ${f(s * 0.18)} ${f(-s * 0.42)}Z`, { light: "#FFF1CF", base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.15 });
        else
          paint(pen, g, `M0 0c${f(s * 0.35)} ${f(-s * 0.45)} ${f(s * 1.05)} ${f(-s * 0.4)} ${f(s * 1.15)} ${f(-s * 0.05)}c${f(-s * 0.35)} ${f(-s * 0.1)} ${f(-s * 0.7)} ${f(s * 0.05)} ${f(-s * 0.85)} ${f(s * 0.28)}c${f(-s * 0.1)} ${f(s * 0.1)} ${f(-s * 0.26)} ${f(s * 0.02)} ${f(-s * 0.3)} ${f(-s * 0.23)}Z`, soft, { size: s * 0.35, weight: 0.5, rim: !1 });
      },
      marks(pen, parent, cx, cy, rx, ry) {
        let rand = stream(d.seed), spots = u[13] > 0.35, n = 3 + Math.floor(u[12] * 4), col = mix2(E.light, CREAM, d.element === "air" ? 0.1 : 0.3);
        if (spots)
          for (let k = 0;k < n; k++) {
            let a = Math.PI * (0.9 + 1.2 * rand()), r = 0.55 + 0.35 * rand(), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r * 0.9, sz = 1.6 + 2.2 * rand();
            pen.patch(parent, ellipsePath(x, y, sz, sz * 0.85), col, 0.85);
          }
        else
          for (let side of [-1, 1])
            pen.patch(parent, `M${f(cx + side * rx * 0.95)} ${f(cy - ry * 0.25)}q${f(-side * rx * 0.3)} ${f(ry * 0.08)} ${f(-side * rx * 0.36)} ${f(ry * 0.3)}`, "none", 0.8, { stroke: col, "stroke-width": 2.6, "stroke-linecap": "round" });
      }
    };
  }
  function coatOf(d) {
    let c = pick2(COATS[d.element], d.u[14]);
    return toneOf(mix2(oklch(c[0] + 0.04 * (d.u[13] - 0.5), c[1], c[2]), CREAM, 0.12), d.element === "water" ? "#2C4660" : "#4A4A62");
  }
  function bunOutline(headY, R, cy, W, H, taper = 0) {
    let waistY = headY + R * 0.78, waistW = Math.min(R, W) * 0.9;
    return blob([[CENTER3, headY - R], [CENTER3 + R * 0.72, headY - R * 0.72], [CENTER3 + R * 1, headY - R * 0.05], [CENTER3 + waistW, waistY], [CENTER3 + W * 1.05, cy + H * 0.25], [CENTER3 + W * (0.9 - taper * 0.5), cy + H * 0.78], [CENTER3 + W * 0.35 * (1 - taper), cy + H * (1 + taper * 0.15)], [CENTER3 - W * 0.35 * (1 - taper), cy + H * (1 + taper * 0.15)], [CENTER3 - W * (0.9 - taper * 0.5), cy + H * 0.78], [CENTER3 - W * 1.05, cy + H * 0.25], [CENTER3 - waistW, waistY], [CENTER3 - R * 1, headY - R * 0.05], [CENTER3 - R * 0.72, headY - R * 0.72]], 0.95);
  }
  function sitter(d) {
    let u = d.u, W = 25 + 6 * u[1], H = 22 + 5 * u[0], cy = FOOT3 - 5 - H, R = 25 + 4 * u[3], headY = cy - H * 0.35 - R * 0.62, coat = coatOf(d), parts = elementParts(d, coat);
    return { geo: { top: headY - R * 1.95, left: CENTER3 - W - 6, right: CENTER3 + W + 20, headX: CENTER3, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      parts.tail(pen, g, CENTER3 + W * 0.85, cy + H * 0.55, 20);
      let shape = bunOutline(headY, R, cy, W, H), back = pen.g(pen.g(g, { transform: `translate(${CENTER3} ${f(headY)})` }), { class: "portrait__head" });
      parts.ears(pen, back, R), paint(pen, g, shape, coat, { size: W * 1.1, grain: !0 });
      let inner = pen.g(g, { "clip-path": pen.clip(shape) });
      if (pen.patch(inner, ellipsePath(CENTER3, cy + H * 0.45, W * 0.62, H * 0.55), mix2(coat.light, "#FFF8EC", 0.5), 0.75, { filter: pen.filter("soft") }), parts.marks(pen, inner, CENTER3, headY + R * 0.2, R * 0.95, R * 0.9), pen.glow(g, CENTER3, cy + H * 0.25, W * 0.55, ELEMENT2[d.element].glow, s.fed || s.delighted ? 0.75 : 0.4), s.fed || s.delighted)
        crumb(pen, g, CENTER3, cy + H * 0.18, 13);
      for (let side of [-1, 1])
        paint(pen, g, ellipsePath(CENTER3 + side * (s.fed || s.delighted ? 6 : W * 0.5), cy + H * (s.fed || s.delighted ? 0.24 : 0.2), 5.6, 6.6), coat, { size: 5, weight: 0.65, attrs: { transform: `rotate(${side * -24} ${f(CENTER3 + side * W * 0.5)} ${f(cy + H * 0.2)})` } });
      for (let side of [-1, 1])
        paint(pen, g, ellipsePath(CENTER3 + side * W * 0.5, FOOT3 - 4, 9, 5.2), toneOf(mix2(coat.base, coat.shadow, 0.2)), { size: 6, weight: 0.7 });
      let headG = pen.g(pen.g(g, { transform: `translate(${CENTER3} ${f(headY)})` }), { class: "portrait__head" });
      parts.crest(pen, headG, R), drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7], spread: 0.42 + 0.12 * u[8], eyeY: -0.02 + 0.12 * (0.5 - u[9]), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: mix2(coat.shadow, INK, 0.4) });
    } };
  }
  function floater(d) {
    let u = d.u, hover = 22 + 7 * u[11], W = 22 + 5 * u[1], H = 20 + 4 * u[0], R = 25 + 4 * u[3], cy = FOOT3 - hover - H, headY = cy - H * 0.3 - R * 0.62, coat = coatOf(d), parts = elementParts(d, coat);
    return { geo: { top: headY - R * 1.95, left: CENTER3 - W - 6, right: CENTER3 + W + 24, headX: CENTER3, headY, headR: R, hover }, draw(pen, g, s) {
      parts.tail(pen, g, CENTER3 + 3, cy + H * 1.05, 22);
      let shape = bunOutline(headY, R, cy, W, H, 0.55), back = pen.g(pen.g(g, { transform: `translate(${CENTER3} ${f(headY)})` }), { class: "portrait__head" });
      parts.ears(pen, back, R), paint(pen, g, shape, coat, { size: W * 1.1, grain: !0 });
      let inner = pen.g(g, { "clip-path": pen.clip(shape) });
      if (pen.patch(inner, ellipsePath(CENTER3, cy + H * 0.45, W * 0.6, H * 0.55), mix2(coat.light, "#FFF8EC", 0.5), 0.7, { filter: pen.filter("soft") }), parts.marks(pen, inner, CENTER3, headY + R * 0.2, R * 0.95, R * 0.9), pen.glow(g, CENTER3, cy + H * 0.3, W * 0.55, ELEMENT2[d.element].glow, s.fed || s.delighted ? 0.75 : 0.4), s.fed || s.delighted)
        crumb(pen, g, CENTER3, cy + H * 0.22, 12);
      for (let side of [-1, 1])
        paint(pen, g, ellipsePath(CENTER3 + side * (s.fed || s.delighted ? 6 : W * 0.6), cy + H * 0.28, 5, 6), coat, { size: 5, weight: 0.6, attrs: { transform: `rotate(${side * -28} ${f(CENTER3 + side * W * 0.6)} ${f(cy + H * 0.28)})` } });
      let headG = pen.g(pen.g(g, { transform: `translate(${CENTER3} ${f(headY)})` }), { class: "portrait__head" });
      parts.crest(pen, headG, R), drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7], spread: 0.42 + 0.12 * u[8], eyeY: -0.02 + 0.12 * (0.5 - u[9]), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: mix2(coat.shadow, INK, 0.4) });
    } };
  }
  function lounger(d) {
    let u = d.u, rx = 27 + 4 * u[1], ry = 16 + 3 * u[0], bx = CENTER3 + 7, by = FOOT3 - 3 - ry, R = 24 + 4 * u[3], headX = CENTER3 - 7, headY = by - 9 - R * 0.6, coat = coatOf(d), parts = elementParts(d, coat);
    return { geo: { top: headY - R * 1.95, left: Math.min(headX - R - 6, bx - rx - 4), right: bx + rx + 16, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      parts.tail(pen, g, bx + rx * 0.85, by + 2, 20);
      let bodyD = blob([[bx - rx, by + ry * 0.35], [bx - rx * 0.55, by - ry * 0.95], [bx + rx * 0.35, by - ry], [bx + rx, by - ry * 0.05], [bx + rx * 0.82, by + ry * 0.9], [bx - rx * 0.4, by + ry * 0.98]], 0.95);
      paint(pen, g, bodyD, coat, { size: rx * 0.65, grain: !0 });
      let inner = pen.g(g, { "clip-path": pen.clip(bodyD) });
      parts.marks(pen, inner, bx + rx * 0.2, by - 2, rx * 0.8, ry * 1.2), pen.glow(g, headX + 4, by + 2, rx * 0.45, ELEMENT2[d.element].glow, s.fed || s.delighted ? 0.75 : 0.35), paint(pen, g, ellipsePath(bx + rx * 0.62, FOOT3 - 3.6, 8, 4.6), toneOf(mix2(coat.base, coat.shadow, 0.2)), { size: 5, weight: 0.65 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), headG = pen.g(anchor, { class: "portrait__head" });
      parts.ears(pen, headG, R), paint(pen, headG, ellipsePath(0, 0, R, R * 0.95), coat, { size: R, grain: !0 });
      let hin = pen.g(headG, { "clip-path": pen.clip(ellipsePath(0, 0, R, R * 0.95)) });
      if (parts.marks(pen, hin, 0, R * 0.2, R * 0.95, R * 0.9), pen.patch(hin, ellipsePath(0, R * 0.55, R * 0.6, R * 0.32), mix2(coat.light, "#FFF8EC", 0.5), 0.6, { filter: pen.filter("soft") }), parts.crest(pen, headG, R), drawFace(pen, headG, { r: R, eye: 0.3 + 0.07 * u[7], spread: 0.42 + 0.12 * u[8], eyeY: -0.02 + 0.12 * (0.5 - u[9]), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: mix2(coat.shadow, INK, 0.4) }), s.fed || s.delighted)
        crumb(pen, g, headX + 1, FOOT3 - 9, 12);
      for (let x of [headX - 9, headX + 10])
        paint(pen, g, ellipsePath(x, FOOT3 - 3.6, 7.5, 4.6), toneOf(mix2(coat.base, coat.shadow, 0.15)), { size: 5, weight: 0.7 });
    } };
  }
  var PLANS = { sitter, floater, lounger };
  function companionLayout(d, fed = 0) {
    let pl = PLANS[d.plan](d), geo = pl.geo, grow = 1 + 0.2 * fed, fit = Math.min(1, (FOOT3 - 6) / ((FOOT3 - geo.top) * grow), 56 / ((CENTER3 - geo.left) * grow), 57 / ((geo.right - CENTER3) * grow)), scale = fit * grow, Y = (y) => (FOOT3 - (FOOT3 - y) * scale) / BOX_H2, X = (x) => (CENTER3 + (x - CENTER3) * scale) / 120;
    return { pl, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX) } };
  }
  function paintCompanion(document2, p, state = {}) {
    let d = companionDraw(p), fed = state.fed ?? 0, { pl, fit, grow, extent } = companionLayout(d, fed), svg = document2.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 120 ${BOX_H2}`), svg.setAttribute("class", `portrait portrait-v2 critter companion plan-${d.plan} element-${d.element}${d.plan === "floater" ? " flier" : ""}`), svg.dataset.direction = "companions", svg.dataset.plan = d.plan, svg.dataset.element = d.element, svg.dataset.asleep = String(!!state.asleep);
    for (let [k, v] of Object.entries(extent))
      svg.dataset[k === "headY" ? "hy" : k === "headRadius" ? "hr" : k] = v.toFixed(3);
    if (svg.style.setProperty("--d", `${(p.idlePhase * 5).toFixed(2)}s`), svg.style.setProperty("--cheeks", "1"), svg.style.setProperty("--mouth", state.delighted ? "1" : "0"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative !== !1)
      svg.setAttribute("aria-hidden", "true");
    let pen = new Pen(document2, svg, 1.75 / Math.max(0.75, fit)), hover = pl.geo.hover * (state.asleep ? 0.35 : 1), E = ELEMENT2[d.element], w = (pl.geo.right - pl.geo.left) * 0.32 * fit * (hover ? 0.8 : 1);
    pen.el("ellipse", { cx: CENTER3, cy: FOOT3 + 1.5, rx: f(w), ry: f(hover ? 3.4 : 4.6), fill: mix2(E.shadow, INK, 0.45), opacity: hover ? 0.2 : 0.24, filter: pen.filter("wash"), class: "portrait__shadow cr-shadow" }, svg);
    let fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER3} ${FOOT3}) scale(${fit.toFixed(4)}) translate(${-CENTER3} ${-FOOT3})` : null }), hoverG = pen.g(fitG, { class: "cr-hover", transform: hover !== pl.geo.hover ? `translate(0 ${f(pl.geo.hover - hover)})` : null }), figure = pen.g(hoverG, { class: "portrait__figure" }), body = pen.g(figure, { transform: fed ? `translate(${CENTER3} ${FOOT3}) scale(${grow.toFixed(3)}) translate(${-CENTER3} ${-FOOT3})` : null });
    if (pl.draw(pen, body, { asleep: !!state.asleep, delighted: !!state.delighted, fed }), !state.decorative && state.name) {
      let title = document2.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = state.name, svg.prepend(title), svg.setAttribute("role", "img"), svg.removeAttribute("aria-hidden");
    }
    return svg;
  }

  // docs/explorations/critter-directions/src/page.ts
  var cast = game_members_default.map((m) => ({ name: m.name, address: m.address, variant: 0, p2: generate2(m.address, 0) })), ownIndex = game_members_default.findIndex((m) => m.own), v1Paint = (m, s = {}) => createPortrait(document, generate(m.address, m.variant), { name: m.name, decorative: !0, size: "stage", asleep: !!s.asleep, fed: s.fed ?? (s.delighted ? 0.6 : 0) }), DIRECTIONS = [
    { id: "v1", name: "Production today", note: "Version 1, as every production build draws it", paint: v1Paint, extent: (m, fed = 0) => portraitMetrics({ ...generate(m.address, m.variant), version: "1" }, fed).extent, kind: (m) => {
      let p = generate(m.address, m.variant);
      return `${p.bodyShape} · ${p.earType} ears`;
    } },
    { id: "v2", name: "Faithful version 2", note: "The October draw, as development builds draw it", paint: (m, s = {}) => {
      let svg = paintV2(document, m.p2, { name: m.name, decorative: !0, size: "stage", asleep: !!s.asleep, fed: s.fed ?? 0 });
      return svg.style.setProperty("--mouth", s.delighted ? "1" : "0"), svg.style.setProperty("--cheeks", s.delighted || m.p2.cheeks ? "1" : "0"), svg;
    }, extent: (m, fed = 0) => portraitMetrics(m.p2, fed).extent, kind: (m) => `${m.p2.element} · ${m.p2.earType} · ${m.p2.crest}` },
    { id: "garden", name: "Garden spirits", note: "Eight species, two to an element, half of them in the air", paint: (m, s = {}) => paintGarden(document, m.p2, s), extent: (m, fed = 0) => gardenLayout(gardenDraw(m.p2), fed).extent, kind: (m) => `${m.p2.element} · ${SPECIES_NAMES[gardenDraw(m.p2).species]}` },
    { id: "recommended", name: "Recommended: garden spirits, painted finish", note: "The eight species, with the companions' larger heads, softer shading and washed shadow", paint: (m, s = {}) => paintGarden(document, m.p2, { ...s, finish: "painted" }), extent: (m, fed = 0) => gardenLayout(gardenDraw(m.p2, "painted"), fed).extent, kind: (m) => `${m.p2.element} · ${SPECIES_NAMES[gardenDraw(m.p2).species]}` },
    { id: "companions", name: "Painted companions", note: "Three authored bodies, close to the element paintings", paint: (m, s = {}) => paintCompanion(document, m.p2, s), extent: (m, fed = 0) => companionLayout(companionDraw(m.p2), fed).extent, kind: (m) => `${m.p2.element} · ${PLAN_NAMES[companionDraw(m.p2).plan]}` }
  ], params = new URLSearchParams(location.search), only = params.get("only"), still = params.has("still");
  if (still)
    document.documentElement.dataset.still = "true";
  document.getElementById("still")?.setAttribute("aria-pressed", String(still));
  if (params.has("true"))
    document.documentElement.dataset.true = "";
  var h = (tag, attrs = {}, ...children) => {
    let el = document.createElement(tag);
    for (let [k, v] of Object.entries(attrs))
      el.setAttribute(k, v);
    return el.append(...children.filter(Boolean)), el;
  }, main = document.getElementById("main"), section = (id, title, lede) => {
    let s = h("section", { id, "aria-labelledby": `h-${id}` }, h("h2", { id: `h-${id}` }, title), h("p", { class: "lede" }, lede));
    if (!only || only === id)
      main.append(s);
    return s;
  }, shortName2 = (n) => n.length > 12 ? n.slice(0, 11) + "…" : n;
  {
    let s = section("faces", "Faces at list sizes", "Every fixture critter at 40 px and 64 px wide (members, rows, the read pass) and cropped to a 44 px face (the profile button), as the app crops it. Same addresses, variant 0, in every row.");
    for (let d of DIRECTIONS) {
      let block = h("div", { class: "block" }, h("h3", {}, d.name, h("span", {}, d.note)));
      for (let size of [40, 64]) {
        let row = h("div", { class: "strip", "data-label": `${size} px` });
        for (let m of cast) {
          let svg = d.paint(m);
          svg.setAttribute("width", String(size)), svg.setAttribute("height", String(size * 1.25)), row.append(h("figure", { class: "mini" }, svg, h("figcaption", {}, shortName2(m.name))));
        }
        block.append(row);
      }
      let row = h("div", { class: "strip", "data-label": "44 px face" });
      for (let m of cast) {
        let e = d.extent(m), face = h("span", { class: "face" }), svg = d.paint(m), style = faceCrop(44, e.headY);
        for (let [k, v] of Object.entries(style))
          face.style.setProperty(k, v);
        let hx = e.headX;
        if (hx !== void 0)
          face.style.setProperty("--face-dx", `${-(hx - 0.5) * 44 * 1.9}px`);
        face.append(svg), row.append(h("figure", { class: "mini" }, face));
      }
      if (block.append(row), d.id === "recommended") {
        let crops = h("div", { class: "strip", "data-label": "40 px rows, face crop (proposed)" });
        for (let m of cast) {
          let e = d.extent(m), face = h("span", { class: "face" }), style = faceCrop(40, e.headY);
          for (let [k, v] of Object.entries(style))
            face.style.setProperty(k, v);
          let hx = e.headX;
          if (hx !== void 0)
            face.style.setProperty("--face-dx", `${-(hx - 0.5) * 40 * 1.9}px`);
          face.append(d.paint(m)), crops.append(h("figure", { class: "mini" }, face, h("figcaption", {}, shortName2(m.name))));
        }
        block.append(crops);
      }
      s.append(block);
    }
  }
  {
    let s = section("sizes", "Whole bodies at scene sizes", "The sizes the scattering circle uses: 66 px (phone back row), 100 px (phone front row), 140 px (phone, the critter in focus), 172 px and 248 px (desktop front row and focus at 1440 × 900). The line is where the feet stand.");
    for (let d of DIRECTIONS) {
      let block = h("div", { class: "block" }, h("h3", {}, d.name, h("span", {}, d.note)));
      for (let [size, count] of [[66, 10], [100, 10], [140, 6], [172, 5], [248, 4]]) {
        let row = h("div", { class: "strip floor", "data-label": `${size} px` });
        for (let m of cast.slice(0, count)) {
          let svg = d.paint(m);
          svg.style.width = `${size}px`, row.append(h("figure", { class: "body" }, svg));
        }
        block.append(row);
      }
      s.append(block);
    }
  }
  {
    let s = section("silhouettes", "Silhouettes", "The same ten at 100 px, filled solid. Two critters that share a silhouette can only be told apart by colour, which fails for colour-blind members and in the dusk light.");
    for (let d of DIRECTIONS) {
      let row = h("div", { class: "strip floor sil", "data-label": d.name });
      for (let m of cast) {
        let svg = d.paint(m);
        svg.style.width = "100px", row.append(h("figure", { class: "body" }, svg));
      }
      s.append(row);
    }
  }
  function mound(n) {
    let s = (tag, attrs, parent) => {
      let el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [k, v] of Object.entries(attrs))
        el.setAttribute(k, String(v));
      return parent?.append(el), el;
    }, k = 0;
    while (k * (k + 1) / 2 < n)
      k++;
    let w = k * 5.2 + 8, hh = k * 3.4 + 9, svg = s("svg", { viewBox: `${-w / 2} ${-hh + 4.5} ${w} ${hh}`, preserveAspectRatio: "xMidYMax meet", "aria-hidden": "true" });
    s("ellipse", { cx: 0, cy: 2, rx: w / 2 - 1.5, ry: 2.4, fill: "#2E2226", opacity: 0.16 }, svg);
    let placed = 0;
    for (let row = 0;row < k && placed < n; row++) {
      let count = Math.min(k - row, n - placed);
      for (let i = 0;i < count; i++, placed++) {
        let g = s("g", { transform: `translate(${(i - (count - 1) / 2) * 5.2 + (placed * 13 % 5 - 2) * 0.3} ${-row * 3.4 - 1}) rotate(${placed * 37 % 70 - 35}) scale(.4)` }, svg);
        s("path", { d: "M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z", fill: "#CFA552", stroke: "#2E2226", "stroke-width": 1.3, "stroke-linejoin": "round" }, g), s("ellipse", { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: "#F2DD8E" }, g);
      }
    }
    return svg;
  }
  function scene(d, f) {
    let viewport = { width: f.width, height: f.height }, members = cast.slice(0, f.count), gathered = f.kind === "results", fed = (i) => gathered ? [0.85, 0.7, 0.45, 0.6, 0.3, 0.5, 0.4, 0.35, 0.2, 0.25][i] : 0, critters = members.map((m, i) => ({ name: m.name, own: i === ownIndex, count: gathered ? 0 : [24, 20, 0, 14, 0, 12, 10, 8, 6, 5][i], extent: d.extent(m, fed(i)) })), layout = layoutGame({ viewport, critters, focus: 0, issued: 100, remaining: 12, surface: gathered ? { kind: "results" } : { kind: "dock" }, scene: gathered ? { grown: !0, bubbles: "none", tags: !1, heap: "none", huddle: !0 } : { grown: !1, bubbles: "focus", tags: !0, heap: "remaining", huddle: !1 } }), W = layout.scene.width, H = layout.scene.height, desktop = f.device === "desktop", frame = h("div", { class: `frame ${f.device} ${f.kind}`, style: `width:${f.width}px;height:${f.height}px` }), plate = { aspect: desktop ? 1.5 : 0.5, wallFoot: desktop ? 0.215 : 0.16 }, lift = plateLift({ width: W, height: H }, plate, circleBackRow(viewport, f.count)), stage = h("div", { class: "stage-area", style: `top:${HEADER_HEIGHT}px;width:${W}px;height:${H}px` }, h("div", { class: "plate", style: `top:${-lift}px;background-image:url(../../../packages/app/public/scenes/window-plate-${f.device}.webp)` }), h("div", { class: "wash" }));
    if (frame.append(h("header", { class: "fake-header" }, h("b", {}, "Rehearsal burrow"), h("span", {}, "Our shared work")), stage), layout.slots.map((sl, i) => ({ sl, i })).sort((a, b) => a.sl.depth - b.sl.depth).forEach(({ sl, i }, k) => {
      if (sl.away)
        return;
      let m = members[i], svg = d.paint(m, { asleep: i === ownIndex && !gathered, delighted: gathered, fed: fed(i) }), spot = h("div", { class: `spot${gathered ? " play" : ""}`, style: `left:${sl.stage.x}px;top:${sl.stage.y}px;width:${sl.stage.width}px;height:${sl.stage.height}px;--k:${k};z-index:${10 + k}` });
      if (sl.face === "left")
        svg.style.transform = "scaleX(-1)";
      if (spot.append(svg), stage.append(spot), !sl.tag.hidden)
        stage.append(h("span", { class: "tag", style: `left:${sl.tag.x}px;top:${sl.tag.y}px;width:${sl.tag.width}px;height:${sl.tag.height}px` }, i === ownIndex ? "You" : sl.tag.short ? shortName2(m.name) : m.name, i === ownIndex ? null : h("i", {}, String(critters[i].count))));
    }), layout.heap && !gathered)
      stage.append(h("span", { class: "heap", style: `left:${layout.heap.x}px;top:${layout.heap.y}px;width:${layout.heap.width}px;height:${layout.heap.height}px` }, mound(12)));
    let dock = layout.dock;
    if (stage.append(h("div", { class: `dock ${gathered ? "results-card" : ""}`, style: `left:${dock.x}px;top:${dock.y}px;width:${dock.width}px;height:${dock.height}px` }, gathered ? h("b", {}, "Results") : h("b", {}, members[0].name))), desktop)
      frame.append(h("aside", { class: "side-panel", style: `top:${HEADER_HEIGHT}px;left:${W}px;width:${f.width - W}px;height:${H}px` }, h("b", {}, gathered ? "Results" : members[0].name)));
    return frame;
  }
  {
    let s = section("groups", "Groups in the real layouts", "Eight critters on a 390 × 844 phone and ten on a 1440 × 900 desktop, placed by the app's own layout function (game/layout.ts) on the Window plate, raised as the app raises it. Then the results huddle on the card's edge, where the critters play. Your critter (Juniper) sleeps while scattering."), frames = [{ device: "phone", width: 390, height: 844, count: 8, kind: "scatter" }, { device: "desktop", width: 1440, height: 900, count: 10, kind: "scatter" }, { device: "phone", width: 390, height: 844, count: 8, kind: "results" }, { device: "desktop", width: 1440, height: 900, count: 10, kind: "results" }];
    for (let f of frames) {
      let row = h("div", { class: `frames ${f.device}`, "data-label": `${f.device} · ${f.count} · ${f.kind}` });
      for (let d of DIRECTIONS)
        row.append(h("figure", { class: "framed", "data-direction": d.id, "data-frame": `${f.device}-${f.kind}` }, scene(d, f), h("figcaption", {}, d.name)));
      s.append(row);
    }
  }
  {
    let s = section("states", "Awake, asleep, a crumb arriving, delighted", "Three critters each: breathing and blinking; asleep (eyes shut, slower breath, a flier settles lower); a crumb hopping in, met with the Game Design bump (1.08 / 0.92 squash, settled by 260 ms); delighted at the results. Turn on Still to stop the motion; reduced motion stops it too."), pickIdx = [0, 1, 4];
    for (let d of DIRECTIONS) {
      let row = h("div", { class: "strip floor states", "data-label": d.name });
      for (let i of pickIdx) {
        let m = cast[i];
        for (let [label, st, cls] of [["awake", {}, "idle"], ["asleep", { asleep: !0 }, "sleep"], ["a crumb", {}, "receive"], ["delighted", { delighted: !0, fed: 0.6 }, "idle happy"]]) {
          let svg = d.paint(m, st);
          svg.style.width = "120px";
          let fig = h("figure", { class: `body state ${cls}`, style: `--k:${i}` }, svg, h("figcaption", {}, `${shortName2(m.name)} · ${label}`));
          if (cls === "receive")
            fig.append(h("span", { class: "hop", "aria-hidden": "true" }));
          if (cls === "sleep")
            fig.append(h("span", { class: "zz", "aria-hidden": "true" }, "z"));
          row.append(fig);
        }
      }
      s.append(row);
    }
  }
  {
    let s = section("data", "Exactly what was drawn", "Version 1 and version 2 are the frozen generators (seed text address:variant:version, cyrb53 into mulberry32). The two explorations take their numbers from the version 2 draw of the same address and variant and keep its element, so a row is the same critter four ways. A shipped direction would get its own draw order and version (see the README)."), table = h("table", {}, h("thead", {}, h("tr", {}, ...["Critter", "Address", "Variant", "Seed text (v1 · v2)", "Version 1", "Version 2", "Garden spirits", "Painted companions"].map((t) => h("th", { scope: "col" }, t))))), body = h("tbody");
    for (let m of cast) {
      let g = gardenDraw(m.p2), c = companionDraw(m.p2), lower = m.address.toLowerCase();
      body.append(h("tr", {}, h("th", { scope: "row" }, m.name), h("td", { class: "mono" }, m.address), h("td", {}, String(m.variant)), h("td", { class: "mono" }, `${lower}:0:1 · ${lower}:0:2`), h("td", {}, DIRECTIONS[0].kind(m)), h("td", {}, DIRECTIONS[1].kind(m)), h("td", {}, `${SPECIES_NAMES[g.species]} (${g.element})`), h("td", {}, `${PLAN_NAMES[c.plan]} (${c.element})`)));
    }
    table.append(body), s.append(table);
  }
  document.getElementById("still")?.addEventListener("click", (event) => {
    let root = document.documentElement, on = root.dataset.still !== "true";
    root.dataset.still = String(on), event.currentTarget.setAttribute("aria-pressed", String(on));
  });
})();
