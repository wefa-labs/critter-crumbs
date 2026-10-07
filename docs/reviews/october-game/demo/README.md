# October game rehearsal

Run `mise exec node@22.22.1 -- bun run dev:local`, then `mise exec node@22.22.1 -- bun run demo:record`. The recorder rejects any environment that is not the development mock. Its separate Playwright configuration keeps recording outside `bun run e2e`.

The videos show Juniper signing in to the seeded Rehearsal burrow and “Our shared work” with eight members. They use the real game, signing, encryption, API, receipt verification and local tally. Seven background browser sessions publish their encrypted scatters.

1. Statements open; Juniper begins reading.
2. The thought bubble opens the focused statement; the next arrow opens a second.
3. Three taps give crumbs, a hold pours, and minus returns one crumb.
4. The circle turns and Juniper pours the remaining crumbs.
5. Scatter These opens confirmation; the scatter saves.
6. The other members finish; server time advances and the feast is laid out.
7. The key request resumes and the critters wake and grow in fixed target order.
8. Results grow from the phone dock; the huddle plays and the ranked list scrolls. Desktop uses the side panel.
9. Replay Feast runs the sequence again.

Mock keys normally become available at closing time. The recorder holds the foreground browser’s real key request for the waiting beat, calls `/api/dev/release-key`, then continues that same request. It supplies no synthetic result or key response.

Outputs: `phone.mp4` at 390×844 and `desktop.mp4` at 1440×900. FFmpeg exports H.264, yuv420p, 30 fps with fast-start metadata. Playwright does not capture audio; these videos are silent even though the app keeps its sound cues.

Verified final exports:

| Video | Duration | Frame size | Encoding |
|---|---|---|---|
| phone | 84.83 seconds | 390×844 | H.264 / yuv420p / 30 fps |
| desktop | 84.20 seconds | 1440×900 | H.264 / yuv420p / 30 fps |
