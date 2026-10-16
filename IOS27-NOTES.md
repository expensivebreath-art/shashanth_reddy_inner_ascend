# Ascend — iOS 27 / Safari 27 layer (iPhone 17 sizing)

New files: ascend-ios27.css, ascend-ios27.js, icon-180/192/512.png
Edited:    index.html (viewport-fit=cover, SVG tab icons, link/script tags, PNG touch icon),
           manifest.webmanifest (PNG icons), sw.js (cache v2 + deletes old cache)
Untouched: app.js, styles.css, Supabase files. Desktop layout is unchanged (all phone rules are <=760px).

After deploying, fully close and reopen the Home Screen app twice so the new service worker takes over.

## Insights update (3 new features)
New file: ascend-insights.js  ·  app.js has 3 one-line hooks (showView, focusCompleteAlert, init)  ·  index.html loads the script before app.js

1. Concept of the day (Learn tab): 24 cybersecurity-foundation concepts (Linux, networking, web). Read, answer a 1-question check,
   then tap Got it / Still shaky. Shaky items return tomorrow; solid ones return after 3, 7, 14, 30 days. Streak + due count shown.
2. Session proof cards (Practice tab): when a Deep Work timer completes, a bottom sheet asks "What did you actually do?".
   One line + a type tag. Saved on the session (deepSessions[].proof). Older sessions get an "Add proof" button.
3. Honest weekly summary (Review tab): plain sentences from your own data: focus minutes vs last week, best day and time of day,
   tasks finished, habit consistency, concept checks, and a "What I'd drop" prompt for habits untouched all week.

Data is stored in data.insights and deepSessions[].proof, so it saves, syncs to Supabase and exports with your normal backup.
To add or edit concepts, change the CONCEPTS list at the top of ascend-insights.js.

## PC / laptop / iPad layout (>= 761px)
Same design language as the phone, adapted to wide screens (phone rules are untouched).
- Glass sidebar with line icons and a gold pill that glides between items; hover reveals shortcut badges.
- Keyboard shortcuts: press 1-6 to jump between Home, Learn, Practice, Mind, Review, Settings (ignored while typing or when a sheet is open).
- Sticky blurred top bar, roomier side padding, content width capped at 1360px (1480px on very wide screens).
- Hover lift on cards (mouse only), visible keyboard focus ring, spring-animated buttons.
- Priority form re-laid out; weekly summary becomes two columns (chart left, sentences right); concept and proof cards capped for readable line length.
- 761-1024px (iPad portrait, small laptops): narrower sidebar, single-column insight cards.
Tested at 1440x900, 1024x768 and 820x1180: no horizontal overflow, no script errors.


## iOS 27 specifics (researched, Oct 2026)
- **Liquid Glass + the new transparency slider.** iOS 27 keeps Liquid Glass and lets users slide between clear and tinted. Web pages cannot read that
  setting, so the tab bar, header and settings rows use a higher-opacity glass that stays readable at any level, plus a solid fallback for
  "Increase Contrast" and "Reduce Transparency".
- **Customizable <select> (Safari 27).** Dropdowns in Settings and the priority form open as an app-styled glass sheet with a gold checkmark.
  Browsers without support (older iOS, Firefox) keep the native menu automatically.
- **Scroll anchoring** is on by default in Safari 27, which stops content jumping when cards update above where you are reading. Nothing to do.
- **Entrance animation** now animates only opacity and transform (no blur filter) so it stays on the GPU.
- **Home Screen icon.** iOS 26+ accepts SVG icons for Home Screen web apps. PNG icons are still included so older iOS versions work too.
- **Not changed on purpose:** toggles remain the custom ones. A native <input type="checkbox" switch> is possible, but I couldn't verify its look on a
  real iPhone. Note: the hidden-switch haptic trick stopped working in iOS 26.5, so don't rely on web haptics.
