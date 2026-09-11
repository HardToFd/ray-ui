# Component verification

## Scope

Leaderboard, DownloadButton and BreathingIndicator, including their catalog entries and demos.

## Visual and interaction checks

- Leaderboard: four coordinated row colors, relative score bars, score updates, sorting, empty state and avatar fallback. Overview preview grows with its content, avoiding caption overlap. Checked desktop and 320/390px layouts and dark theme.
- DownloadButton: standalone UI component and documentation. Verified browser request callback, disabled state, temporary URL cleanup and click cancellation. Native file saving was not confirmed by browser automation; the UI only reports that a download was requested.
- BreathingIndicator: glow, orbit and wave render independently. Verified palette and tempo controls, pause/resume, narrow layouts, overview style switching and dark theme. Visible dropdowns use Radix Select; mouse and keyboard selection verified.
- Final glow uses a soft moving cloud. Orbit has a stronger ring and traveling highlight for small-size visibility. Wave stays vertically centered with increased contrast.
- Normal state animates smoothly. Degraded state uses amber color and variable speed. Failed state is static red with a flattened cloud, broken ring or compressed wave. Thundercloud experiments were reverted.
- Failure and recovery, pause phase continuity, reduced motion, offscreen scheduling and teardown are covered by lifecycle tests. Canvas redraw is limited to 30 fps and stops while hidden or inactive.

## Limitations

Procedural Canvas effects interpret the selected design concepts rather than reproducing generated images pixel for pixel. Demo portrait PNGs retain their original resolution and total approximately 8 MB; they are excluded from the library package. The new indicator artwork occupies more space than the original dot.

final result: passed
