# Checks for real phones and people

Collected by the [October QA pass](README.md). Each is something automation could not settle: a browser under automation starts sound with no gesture, cannot be heard, and is not a wallet app, a screen reader or a mid-range phone. Use it beside the feel checklist in [the rehearsal run sheet](../../build/rehearsal.md).

## Lifecycle

- [ ] iPhone Safari and a wallet app's browser, a burrow of six to ten on the scatter screen: is every name tag above its own critter, and can every name and number be read? (lifecycle-03)
- [ ] The floor on the scatter screen in Safari: does it recede like a floor, with no flat stripes, no missing corner and no flicker when the circle turns?
- [ ] Hold a finger on + for a second and a half, then on a critter: does it pour smoothly (about 26 crumbs each time) with no text selection, magnifier or menu?
- [ ] If the version 2 critters ship: how smooth are the scatter screen and the feast on the oldest iPhone, and does emptying 100 crumbs by holding take about 3.4 s? (lifecycle-15)
- [ ] When a game screen appears on a phone and in desktop Safari: does it jump from the wrong size for a moment? (lifecycle-12)
- [ ] Drag down on the scatter screen with crumbs placed but not saved: does the browser reload the page and lose them?
- [ ] Download CSV inside each wallet app's browser on iOS and Android: does a file arrive? Then open it in the council's spreadsheet with an accented name in the burrow.
- [ ] Copy burrow link and Copy prompt in Safari and in a wallet app's browser: does the clipboard hold the text?
- [ ] After reloading the scatter screen with a real wallet: count the confirmations and signatures needed to save one scatter (connect again, then sign).
- [ ] Ears: returning to a finished feast replays the feast and its music every time (lifecycle-13); is that wanted?

## Rules and access control

- [ ] Open both CSV files in the spreadsheet the council will really use (Excel, Numbers, Sheets): names with accents or non-Latin letters (the file has no byte-order mark) and a name starting with = or +.
- [ ] In a real wallet, read the sign-in prompt: it names no site. Decide whether that is acceptable (rules-11).
- [ ] Lose the connection as you press Scatter These, wait six minutes, then retry: confirm what rules-04 describes and that changing a crumb gets you out.
- [ ] Change the phone's clock by hand while on the scatter screen: the false 'Scattering has closed' line and its dusk sting (needs ears; nothing here made a sound).
- [ ] A long ENS or display name on the burrow page of a real phone, and an Arabic or Hebrew name beside the numbers.
- [ ] With two real people who share a first name, check that the council can tell their critters apart while scattering (rules-06).

## Production build

- [ ] Tap a feast link in iMessage, WhatsApp, Signal and Telegram on an iPhone and an Android phone: what the preview shows (production-build-10), and where the link opens. In the phone's own browser, press Connect and read "No connection is available in this browser yet." as a council member would (production-build-07).
- [ ] Open the same link inside the browser of MetaMask, Coinbase Wallet, Rainbow and Rabby on a phone: is the wallet listed by its name or as "This browser", does the sign-in prompt appear and read sensibly, and does "Copy burrow link" work there.
- [ ] Once the real path exists, with each member's real wallet: Scatter These asks to switch to Base Sepolia (and to add it the first time), then for the signature; decline each once and read what the screen says (production-build-04).
- [ ] Let MetaMask lock itself while the scatter screen is open (or switch account and back), unlock it, then press Scatter These (production-build-04).
- [ ] With the app open on a phone, deploy a new build, then tap into a feast or press Start reading without reloading (production-build-06).
- [ ] Ask each member which account they will use. A smart-contract account (a Safe, Coinbase Smart Wallet) cannot sign in: the server verifies the sign-in by signature recovery only.
- [ ] If any member's phone is on iOS 15 or 16.0 to 16.1: the look without color-mix, and, once the real path exists, whether encrypting works at all under the policy's 'wasm-unsafe-eval'.
- [ ] Frames a second and a held pour with 8 to 10 critters in 3D on the slowest real iPhone and Android phone, on the production build (version 1 critters with meshes): my headless WebKit held 60, which is not a phone (production-build-13). Also the floor's perspective in Safari, which WebKit screenshots flatten.
- [ ] On a phone browser under about 800 px tall (an iPhone SE, or any phone with the wallet app's bars showing), the name tags on the production scatter screen: lifecycle-03 shows on what production draws too.

## Edge and error states

- [ ] Production build on an iPhone: open a scatter screen, leave Safari or the wallet browser in the background for several minutes, come back. If the 3D view has stopped, is the game pushed off the right edge with + and › out of reach? (edge-states-01)
- [ ] An iPhone in Lockdown Mode, or any browser with WebGL off, on the production build: are the critters flat with no notice and no "Try 3D again"? (edge-states-05)
- [ ] In aeroplane mode, write a statement and press Save statement with the keyboard up: is any message visible without scrolling? Then add a wrong address on the burrow page. (edge-states-02)
- [ ] With a real wallet: write a statement one day, come back another and scatter. Count the prompts, and read the line above "Choose how to connect". (edge-states-10)
- [ ] Decline the signature in a real wallet, and decline the switch to Base Sepolia: does the screen keep the crumbs and say "Not confirmed"? (E2 was a stand-in)
- [ ] Be on the scatter screen at the real close on Chiado: how long does "The feast is being laid out" last, and does "Can't fetch the key right now" appear while the key is merely not out yet? (edge-states-06)
- [ ] Be typing a statement in the last minute of gathering on a phone: is the deadline visible while the keyboard is up, and what happens to the text? (edge-states-03)
- [ ] Aeroplane mode on the scatter screen: the stacked banner and toast over the top name tags. (edge-states-12)
- [ ] With VoiceOver or TalkBack and the phone's clock three hours wrong: is "Your device clock is off by about 180 minutes" spoken before the connect dialog replaces it? (edge-states-08)
- [ ] Ears: the error cue with each failed save and refused signature, and the dusk sting when scattering closes under an open confirmation.

## Sound

- [ ] Hold + for five seconds on the slowest phone the council will use, on the deployed build: an even pour, or loud clusters of bells several times a second (sound-02)? Try it again while the feast link is still loading something.
- [ ] With music playing, switch to another app and back, several times; and once in the middle of the feast: is there a click at the instant of return before the music fades up (sound-01)?
- [ ] Does the first tap start sound in iPhone Safari, Android Chrome and each wallet app's browser, and is the connect chime heard after Connect? (Automation cannot test the gesture rule.)
- [ ] After coming back to the tab, is the sound of the first tap late? In automation WebKit resumed its audio about a second after the tab was shown.
- [ ] Open the feast from a link in a chat on a phone: it plays in silence until something is tapped (sound-12). Decide by watching it whether that is acceptable for the one big moment.
- [ ] Listen to The burrow for three minutes and Everyone is full for two: does the 8 dB fall at each join sound like the tune breathing or like it starting again (sound-09)?
- [ ] Give the last crumb with a tap: the boing and the ta-da sound together (sound-10). Right or wrong by ear?
- [ ] With Sounds and Music both off, play a podcast in another app and tap in Critter Crumbs: does the podcast pause or duck (the app still starts an AudioContext, sound-07)? And with the iPhone's silent switch on, is the whole app mute, and does the council know?
- [ ] Move quickly home, burrow, feast and back a dozen times on a mid-range phone, then check the tab was not reloaded and an unsaved scatter survived (sound-06). Safari Web Inspector or Chrome remote tools will show the memory.
- [ ] On a poor mobile connection: how long until the first music after the first tap, do the stings and the feast cue arrive in time, and does Connect feel slower while the sound downloads?
- [ ] A phone call, an alarm or Siri in the middle of the feast: does sound come back on the next tap?
- [ ] With VoiceOver and TalkBack on the scatter screen as the deadline passes: what is spoken (sound-03)?
- [ ] Bluetooth headphones: are the crumb bips late against the count?
- [ ] The balance by ear of effects, stings, the feast and the music, and of the damped effects under Still critters (already planned as F3 and F10).

## Accessibility

- [ ] SCREEN-READER SCRIPT for the scatter pass. Use VoiceOver on an iPhone and TalkBack on an Android phone, in the browser members will really use (a wallet's browser), on a scattering feast of about eight critters. Swipe right is next item, double-tap is press. What each step should say comes from the accessibility tree the app exposes (.scratch/qa/accessibility/captures/live-reveal, live-read, live-scatter, live-all-given, live-confirm and live-saved .375x812.json, field `aria`). Write down every place where what you hear differs.
- [ ] Step 1. Before anything else, notice whether music starts on your first double-tap and whether you can still follow the speech over it. To stop it on a game screen: find “Your critter and settings, button” (fourth item from the top), double-tap, swipe right once to “Music, Tunes in the background., checkbox, checked”, double-tap. It should fade within a second and stay off after a reload.
- [ ] Step 2. Open the feast link once statements are open. About a second in, focus should jump to “Start reading, button”, and one sentence should be spoken: “Statements are open. 8 statements to read.” Note which of the two you hear and in what order (the sentence is sent a moment before focus moves and may be lost).
- [ ] Step 3. From the top, swipe right through the reveal. Expect, in this order: “Skip to content, link”; the burrow's name, link; the feast's title, heading level 1; “Your critter and settings, button”; one button per critter by name (“Clover, button” … and “You, button” for your own); “Read Clover’s statement, button” for every critter but yours; “Statements are open, heading level 2”; “Read them first, then scatter your 100 crumbs.”; “Start reading, button”. Nothing should be read out of the painting.
- [ ] Step 4. Double-tap Start reading. Focus should be on the open statement, “Clover, article”. Swiping on: the critter's element as a bare word (“Water”); “Close, button”; the statement's paragraphs, any link as a link. Then the landmark “Your crumbs”: “Take a crumb back from Clover, dimmed, button”; “Clover”; “Crumbs for Clover, text field, 0”; “0”; “Give a crumb to Clover, button”; “Previous, button”; “100 to go”, “Scattering closes in …”; “Next, button”.
- [ ] Step 5. With the statement open, double-tap Next. Expect silence: the statement changes to the next critter, nothing is said and focus stays on Next. Note how you find out whose statement is now open. Double-tap Close: focus should land on “Read …’s statement, button”.
- [ ] Step 6. Double-tap “Give a crumb to Clover” once. About half a second later expect “1 for Clover. 99 to go.” It must be exactly one crumb. If you hear “2 for Clover” or nothing at all, write down the phone, the browser and the screen reader (accessibility-11).
- [ ] Step 7. Double-tap and hold on “Give a crumb to Clover” for two seconds, then lift. Expect nothing while you hold, then one sentence, “N for Clover. M to go.”, with N near 40 (far fewer on an iPhone if the critters are drawn slowly, lifecycle-15).
- [ ] Step 8. Double-tap “Crumbs for Clover, text field”. Expect a number pad and the current number read as the value. Type 25 and leave the field (Done, or double-tap another control): expect “25 for Clover. 75 to go.” Then try 999: it should become everything you have left.
- [ ] Step 9. Swipe to the name tags (after the critter buttons). Expect “Fern, button”, “Pebble, button” … with no number, though each tag shows one (“Fern 20”), and one tag spoken as your own name that shows “You”. This is accessibility-03: can you tell where your crumbs are without turning to each critter?
- [ ] Step 10. Double-tap Next. Expect silence; swipe left to hear the new name and “Crumbs for Fern, text field”. Double-tap “You, button” (your own critter): expect silence.
- [ ] Step 11. Give everything. At zero expect “All scattered. Scatter these when you’re ready.” (it may be cut short by “100 for Clover. 0 to go.”). + is now “dimmed”; double-tap it anyway and expect “No crumbs left. Take some back to move them.”
- [ ] Step 12. Find “Scatter These, button” between Previous and Next and double-tap. Expect a dialog with focus on “Cancel, button”; swiping gives “Confirm your scatter, heading level 2”, “You’ll be asked to sign. It costs nothing and nothing goes on-chain.”, “Cancel”, “Scatter These”. Nothing behind the dialog should be reachable. It will not say what you are scattering.
- [ ] Step 13. Double-tap Scatter These and sign in the wallet. Expect focus on “Scattered. You can change this until Wed 14 Oct, 18:00 (PDT).” and the same sentence announced (you may hear it twice). If the phone asks you to connect again first, expect “Choose how to connect”, then the alert “Connected. Try that again now — nothing you entered was lost.” with focus left at the top of the page.
- [ ] Step 14. Stay on the screen as scattering closes. Expect a sound and no words; − and + become dimmed; two or three seconds later “The feast is being laid out”; when the feast has played, “Results are ready. … received the most crumbs.” and focus on “Results, heading level 2”. While the feast plays, “Skip to results, button” is the last item, after every critter.
- [ ] Step 15. In the results swipe through the rows. Expect “Moss 129 18.4%” with no words for the two numbers; say whether VoiceOver calls it a list. Open Who gave what if it is there and say whether the table reads with its row and column names.
- [ ] Zoom on a real phone: in iOS Safari set the page zoom (the Aa menu) to 150%, 175% and 200% on the scatter screen, the confirmation and the results; in Chrome on Android set Accessibility, Text scaling to 150% and 200%. Compare with .scratch/qa/accessibility/sheets/rf-steps-zoom.png, rf-zoom200-1.png and rf-text200-1.png. Can you read the name and the count in the dock, press Scatter These, read the whole confirmation?
- [ ] Short phones: on the smallest phone in the council, inside the wallet's browser, open a long statement and scroll to its end. Is the last line above the dock? Then the results: how many rows show before scrolling? Then turn the phone on its side and look at both again (accessibility-08).
- [ ] Reduce Motion (iOS) or Remove animations (Android): the critters should stand still, a crumb should not hop, the feast should go straight to the results.
- [ ] A keyboard on a tablet or in Safari on a Mac (Option+Tab, or Safari's setting to tab to every item): can you see where focus is on each critter, by day and at dusk (accessibility-01)? Can you scroll a long statement and the who-gave-what table (accessibility-06)?
- [ ] Voice Control (iOS) or Voice Access (Android): say “tap Give a crumb to Fern”, then “tap Fern” and “tap You”, and note which control answers. Two controls share each critter's name, and the tag that shows “You” is named by your own name.
- [ ] Windows contrast themes in Edge, a dark one included: forced colours were only checked in Chromium's emulation with light system colours.
- [ ] Ears: is the music low enough under VoiceOver's and TalkBack's speech to follow what is said? Every level here was measured, none heard.

## Copy, privacy sweep and documents

- [ ] On a phone whose language is not English, inside the wallet app's browser: read the deadline lines on a feast page and on the scatter screen (copy-06).
- [ ] On a 360 px wide Android phone and on a 375 px iPhone (SE, mini): open the scatter screen of a feast whose first critter or option has a 16-character name and read the name in the dock (copy-05).
- [ ] With Music off and Sounds on, sit through one feast: is what is heard "little crumb noises"? (copy-15, needs ears.)
- [ ] After "You'll be asked to sign. It costs nothing and nothing goes on-chain.", watch what the wallet asks first on a phone that has never seen Base Sepolia, and whether anyone hesitates (copy-15).
- [ ] On the deployed site, as the burrow's creator: press Remove from burrow on a critter added by mistake (copy-02).
- [ ] On the deployed site, after one forced failure (for instance Open the feast twice inside a minute): open Vercel's function logs and see what, if anything, is there (copy-13).
- [ ] Inside each wallet app's browser: watch the network once (a proxy, or the app's own inspector) on a feast page. The app's own requests should go to www.crittercrumbs.app only; anything else is the wallet app's.
- [ ] Copy burrow link and Copy prompt inside a wallet app's browser: does the clipboard take them, and if not is "Copying is unavailable. Select the prompt and copy it yourself." what is shown?
- [ ] On a shared or borrowed computer after Disconnect: decide whether a stored receipt (feast, address, scatter id) matters to the council (copy-14).

## Performance

- [ ] F11: 30 frames a second or better with a pour running on the slowest phone in the burrow. Here: 42 to 45 under 4x CPU slowdown on a desktop GPU, which says nothing about a phone's GPU.
- [ ] F2, stopping a pour within two crumbs of where you meant: a finger's judgement. Here the app added nothing after release in any run.
- [ ] F12: watch the moment 3D replaces the portraits for a freeze, on the scatter screen and, above all, a few seconds into the feast when a finished feast is opened from a link (performance-07).
- [ ] A feast of ten on a phone: one critter stays flat next to nine in 3D (performance-03).
- [ ] Time to 3D on the members' real mobile data against the 3 s budget: 1.4 to 2.0 s on emulated Fast 4G, 8.6 to 8.9 s on emulated Slow 4G.
- [ ] Connect on weak mobile data: the wait from pressing Connect to the wallet list while the sound downloads (performance-02).
- [ ] Still critters on for a whole feast: does the phone run warm or lose charge as fast as with motion (performance-04).
- [ ] An iPhone 11 after 20 minutes with Music on: about 38 MB of decoded sound is held on every screen (8.7 MB with Music off); watch for the tab reloading itself.
- [ ] A second visit on the real deployment: in the phone's network panel or the Vercel log, sounds and scenes should come back 304, not 200.
- [ ] The ladder on a really slow phone: does it reach Simple view, and is the notice shown and spoken once.
- [ ] If version 2 is ever switched on: its frame rate on an iPhone and a mid-range Android before anything else (performance-09).
- [ ] Every duration and frame rate in this report.
