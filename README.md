# Shashanth Reddy — Personal Tracker

A responsive, dark, interstellar-inspired personal tracker. The visual system uses restrained navy, soft blue and warm gold, with reduced-motion support and no heavy animated 3D scene.

## Sections
- **Home:** time-aware greeting and motivational line, up to three priorities, task list, self-care habits, and quick access to focus and Mental Space.
- **Learn:** cybersecurity foundations, skill summaries, and the existing roadmap and skill register.
- **Practice:** focus timer, task execution shortcuts, and recent session evidence.
- **Mental Space:** intentionally empty. No visualizations, body scans, meditation links, breathing exercises, or guided activities are included.
- **Review:** existing progress analytics and trends.
- **Settings:** notification permission/test, data export, and storage information.

Personal tracker lists start empty; the built-in cybersecurity roadmap and seven-day learning plan remain available. Sign in with the same account on every browser to sync tracker data through Supabase. This update starts with a clean tracker state and resets older cloud data when an account first opens this version. Preferences and browser notification permissions remain browser-specific.

## Run locally
Open `index.html` for a basic preview. For PWA/service-worker features, serve this folder over HTTPS or localhost, for example with a static hosting provider. Service workers do not work from `file://`.

## iPhone Safari / iOS web app
1. Deploy the folder to HTTPS hosting.
2. In Safari, open the site and choose **Share → Add to Home Screen**.
3. Launch it from the Home Screen, then use Settings → Enable to request notification permission where supported.
4. Use **Test notification** to check the current browser's permission.

## Notification limitations — important
- The current implementation can trigger scheduled reminders while the app page is running and the browser is active. Browser scheduling is not a reliable alarm when the page is suspended or closed.
- `sw.js` supports receiving Web Push messages, but this ZIP does **not** include a push server, VAPID keys, or a database-backed scheduler. Reliable background push on iPhone requires HTTPS, Home Screen installation, notification permission, push subscription management, and a backend/service that sends Web Push at the scheduled time. Do not treat this static-only build as guaranteed background reminders.
- Reminders use the device's local time. Notification support and permission behavior can vary by browser and iOS version.

## Data and privacy
Tracker data is stored in one shared Supabase record and synchronizes across browsers that open this site. No login is shown or required. Run `supabase-setup.sql` in the Supabase SQL Editor to create the shared table, public access policies, and realtime publication membership. The app uses the project publishable key; never place a service-role key in browser code. Export backups for important records. The app starts with empty personal tracker lists; the built-in cybersecurity roadmap and learning plan remain available.


## Ascend / The Inner OS update
- App identity updated to Ascend — The Inner OS with a minimal spiral/ascending mark.
- Home section label changed from Self-care to Evolve.
- On each page load, a modal lists overdue tasks and tasks due within the next 20 minutes (tasks with dates/times).
- Deep Work has optional end notification and a generated tone. Browser notifications require permission; the page must remain active for the timer and tone. Background iPhone push still requires a configured push service.
- Apple Reminders import is not yet live in this package: the `apple_reminders` table alone is insufficient. A secure Supabase Edge Function and Shortcuts automation must be deployed/configured before syncing.


## App usage patterns and journal

- The **App patterns** section lets you manually log minutes for YouTube, Chrome, Brave, Google Search, Phone/Calls, Instagram, WhatsApp, Telegram, Reddit, and other apps. It summarizes logged time and self-reported triggers/effects over the last seven days.
- The **Journal** section stores dated entries with mood and optional tags. Both feature datasets are part of the shared tracker JSON and therefore use the same configured Supabase shared-state sync.
- Browser websites cannot automatically read phone-wide app usage or call logs. Usage totals are based on entries the user records, not background device monitoring.
