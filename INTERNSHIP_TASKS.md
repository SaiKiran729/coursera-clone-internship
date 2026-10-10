# Internship Tasks — Implementation Documentation

This document describes the six internship tasks implemented as additional features within the existing Coursera Clone training project.

The internship tasks were fully integrated into the original training project rather than developed as a separate or new project, strictly adhering to the internship instructions.

## Project Information

- **Project Name:** Coursera Clone
- **Internship Project:** ElevanceSkills Internship
- **Branch:** `internship-tasks`
- **Original Project Repository:** https://github.com/BitHeadmr/coursera-clone

The original application is an online learning platform that supports course browsing, details inspection, modular lessons, video learning, and simulated profile/certificate pages.

---

## Table of Contents

1. Task 1 — Search and Filter Courses with Tags
2. Task 2 — Animated Course Completion Confetti
3. Task 3 — Offline Mode for Course Content
4. Task 4 — Streak Tracking for Daily Learning
5. Task 5 — Course Reminder Notification System
6. Task 6 — Auto-Resume Video Playback
7. Shared Architecture Changes
8. Dependencies Added
9. Storage and Data Management
10. Responsive Design
11. Testing and Verification
12. Known Limitations
13. Internship Submission Requirements
14. Final Submission Checklist
15. Conclusion

---

## Task 1 — Search and Filter Courses with Tags

### Original Requirement
Users should be able to search courses by title and description and filter courses using topic/tag categories without requiring a page reload.

### Implementation
- **Real-time search:** Fully implemented via the top navigation bar.
- **Title and Description search:** The query intelligently scans both the course `title` and `description` string natively, ignoring case sensitivity.
- **Skill/tag filtering:** The pre-existing `skills` array defined inside `constant.ts` is leveraged to produce clickable tag filters.
- **Combined search + tag filtering:** Users can filter by both a typed query and selected tags simultaneously.
- **Empty / No-results handling:** Renders a clean "No courses found" state if no matches occur.
- **Responsive UI:** Filter bars and course grids adapt elegantly to mobile constraints.

### Files Changed
| File | Changes |
|------|---------|
| `src/pages/search/index.tsx` | Search and tag filtering interface |
| `src/Components/Navbar.tsx` | Search input field and navigation logic |

### How It Works
Navbar/search input → encodes query in URL (`/search?q=...`) → `search` route reads query param → reads mock `courses` data → applies active tag filters + string matching → renders filtered course results dynamically.

### User Experience
Users type in the navbar, hit Enter, and land on a dedicated search page where they can refine results instantly using skill chips.

### Testing
- ✅ Search by title
- ✅ Search by description
- ✅ Filter by tag
- ✅ Search + tag combination
- ✅ Clear search handling
- ✅ No results gracefully handled

---

## Task 2 — Animated Course Completion Confetti

### Original Requirement
Make course completion celebratory using confetti and motivational messages when a learner finishes a course.

### Implementation
- **Module Completion Tracking:** `useCourseProgress` manages an array of completed module indices.
- **Validation:** A course transitions to `isCompleted: true` ONLY when the length of `completedModules` perfectly matches the total required modules length for that specific course.
- **Confetti Animation:** We implemented `react-confetti` to trigger a 3-5 second celebration (gravity: 0.15).
- **Motivational Message:** A bouncy modal ("Great Job! You've completed this course!") overlays during the confetti burst.
- **Persistence & Duplicate Prevention:** The `isCompleted` state is natively handled and tracked by `useCourseProgress`. The celebration logic was refactored strictly inside the `handleMarkComplete` click/completion boundary, verifying `isNewlyCompleted && !isCompleted`. This flawlessly ensures that refreshing the page never accidentally replays the confetti animation.

### Files Changed
| File | Changes |
|------|---------|
| `src/hooks/useCourseProgress.ts` | Tracks module completion & calculates overall progress |
| `src/pages/course/[id]/index.tsx` | Mounts the Confetti component and completion buttons |

### User Flow
Open course → watch module → click "Mark as Complete" → continue learning → complete final required module → transition to `isCompleted = true` detected → confetti and motivational message appears → completion state natively persists.

### Testing
- ✅ Complete individual module
- ✅ Complete all required modules
- ✅ Course completion natively detected
- ✅ Confetti drops properly
- ✅ Refresh does NOT replay celebration

---

## Task 3 — Offline Mode for Course Content

### Original Requirement
Allow learners to access downloaded course content without an internet connection. Videos should not be downloaded.

### Implementation
- **Offline Download & IndexedDB:** Integrated `idb-keyval` to dump course metadata, layout structure, text content, and skills into IndexedDB when a user explicitly requests to "Download for Offline".
- **Available Offline Indicator:** Button morphs seamlessly into a green "Available Offline" UI state, offering a "Remove" toggle on click.
- **Service Worker (`public/sw.js`):** A custom Network-First service worker aggressively caches the Next.js static asset shell (JS bundles, CSS, routing structure) as the user browses. Furthermore, it explicitly precaches the root HTML `/` on install. If offline client-side data fetching fails and Next.js forces a hard navigate reload, the Service Worker intelligently serves the matched course HTML or falls back to the precached root page, guaranteeing the application structure loads offline.
- **Explicit HTML Caching:** The "Download for Offline" button also explicitly triggers `cache.add('/course/' + courseId)` to firmly lock the specific SSR HTML page in the Service Worker Cache. If this fails, the UI download throws a proper error instead of pretending to succeed.
- **Video Exclusion:** Videos are strictly excluded from offline packaging logic. The Service Worker inherently bypasses `youtube.com` domains, failing gracefully with the browser's default "Offline" iframe placeholder without crashing the host app.

### IndexedDB
Stores a serialized JSON replica of the Course object (`offline_course_<courseId>`).

### Service Worker
- **Why it was added:** Next.js requires cached JavaScript bundles to render dynamic client-side routes (like `/course/[id]`) offline.
- **What it caches:** CSS, JS chunks, API fetches (`NetworkFirst` strategy).
- **What it does NOT cache:** Videos and cross-origin heavy media.

### External Images
If CORS prevents `fetch(course.image).blob()` from securely transforming the remote image into Base64 for IndexedDB storage, the utility fails silently, preserving the critical text/module metadata instead of crashing the download process.

### Files Changed
| File | Changes |
|------|---------|
| `src/utils/offlineStorage.ts` | IndexedDB logic wrapping `idb-keyval` |
| `public/sw.js` | Custom Service Worker script |
| `src/pages/_app.tsx` | Registers Service Worker silently |
| `src/pages/course/[id]/index.tsx` | "Download for Offline" UI & IndexedDB mounting fallback |

### Testing
- ✅ Download course via UI
- ✅ Text available entirely offline
- ✅ Videos gracefully NOT downloaded
- ✅ Remove offline content
- ✅ Tested directly with Chrome DevTools Network throttled to Offline

---

## Task 4 — Streak Tracking for Daily Learning

### Original Requirement
Boost learner engagement through daily learning streaks.

### Implementation
- **Activity Tracking:** Tying module completions (`markModuleComplete`) to a global streak evaluator function.
- **Consecutive Day Calculation:** Compares current local midnight to the last recorded local midnight.
- **Duplicate Prevention:** If a module is completed twice on the same local date, the streak is safely ignored.
- **Missed-Day Reset:** If the delta is > 1 day, the current streak naturally resets to 1.
- **Badges:** Awards permanent badges internally (e.g., "7-Day Streak") stored in an array.
- **UI:** A reactive `🔥 [X] Day Streak` badge injects into the global Navbar, alongside a dedicated "Achievements" section inside the Profile page.

### Date Handling
Uses a robust `YYYY-MM-DD` parser mapped to `new Date(y, m - 1, d)` ensuring local midnight calculations completely strip out `toLocaleDateString` or UTC-shift anomalies.

### Storage
Stores inside `learning_streak`:
```json
{
  "currentStreak": 3,
  "longestStreak": 7,
  "lastActivityDate": "2026-10-07",
  "badges": ["3-Day"]
}
```

### Files Changed
| File | Changes |
|------|---------|
| `src/utils/date.ts` | Reliable local date formatting |
| `src/utils/learningActivity.ts` | Core logic for streak metrics and differences |
| `src/Components/Navbar.tsx` | Dynamic UI display using DOM events |
| `src/pages/profile/index.tsx` | Badges and metrics display |
| `src/hooks/useCourseProgress.ts` | Triggers activity logger |

### Testing
- ✅ First activity initializes streak
- ✅ Same-day duplicate correctly prevented
- ✅ Consecutive-day increments properly
- ✅ Missed-day successfully resets to 1
- ✅ 7-Day badge organically triggers

---

## Task 5 — Course Reminder Notification System

### Original Requirement
Allow learners to set reminders for unfinished courses.

### Implementation
- **Options:** Dropdown overlay offering "Remind me in 1 hour", "Remind me tomorrow", or "Cancel Reminder". To ensure it is highly visible, the reminder button is placed persistently in the sticky top header while viewing modules.
- **Permission:** Leverages the native Browser Notification API seamlessly.
- **Duplicate Prevention:** Identifies targets uniquely by `courseId`.
- **Completed Course Handling:** If a course completes, the system proactively purges any pending reminders dynamically.

### Browser Limitations
**IMPORTANT:** A normal frontend-only web application *cannot guarantee* browser notifications firing after the browser or specific tab is completely closed, since no Service Worker Push or background OS-level architecture is implemented. 
To circumvent this honestly: Our `_app.tsx` polling architecture natively evaluates overdue alerts the moment the application is re-opened, guaranteeing the reminder executes natively if it was missed in the background.

### Files Changed
| File | Changes |
|------|---------|
| `src/utils/notifications.ts` | Native permissions and `course_reminders` storage logic |
| `src/pages/_app.tsx` | Background check loop mechanism |
| `src/pages/course/[id]/index.tsx` | Bell UI dropdown interface |
| `src/hooks/useCourseProgress.ts` | Auto-cancels reminders on completion |

### Testing
- ✅ Native permission prompts requested dynamically
- ✅ 1-hour / Tomorrow offsets calculated correctly
- ✅ Overdue reminder handling executes natively upon mount

---

## Task 6 — Auto-Resume Video Playback

### Original Requirement
Allow learners to continue watching videos from their previous position.

### Implementation
- **Player Swap:** The original `<iframe>` was upgraded natively to `react-youtube` (leveraging the official YouTube IFrame API). Raw iframes physically cannot communicate timestamps securely due to cross-origin blocks.
- **YouTube Parser:** Built a Regex parser to dynamically extract 11-character IDs securely across `youtu.be`, `watch?v=`, and query strings found inside the original `constant.ts`.
- **Timestamp Tracking:** Saving the progress implicitly every 5 seconds natively during playback, and forcing a save upon unmount or pausing.
- **Resume UI:** If significant progress exists, mounting immediately prompts a localized "Resume Watching (02:05)" or "Start from Beginning" overlay natively over the player layout.
- **Video Completion:** Hitting the end of the video duration successfully wires into `onComplete`, passing control back to the `markModuleComplete` architecture.
- **Robust Player Swapping:** The component is tightly managed by React `key={Module.videoId}` and `useCallback` implementations, ensuring that swapping between video modules gracefully resets the player boundaries and doesn't accidentally save timestamps to the wrong internal video state.

### Storage
Stores inside `video_progress_<courseId>_<moduleIndex>`:
```json
{
  "timestamp": 125.5,
  "updatedAt": "2026-10-07T..."
}
```

### Files Changed
| File | Changes |
|------|---------|
| `src/hooks/useVideoProgress.ts` | Hook controlling exact timestamp logic |
| `src/Components/Videolayer.tsx` | Upgraded player, parser, and overlay logic |
| `src/pages/course/[id]/index.tsx` | Parent controller propagating course coordinates |

### Testing
- ✅ Timestamps successfully saved periodically and on pause
- ✅ Leaving and returning prompts the overlay
- ✅ Start from Beginning cleanly seeks to 0
- ✅ Video completion flawlessly ties into `markModuleComplete`

---

## Shared Architecture Changes

- `src/hooks/useCourseProgress.ts` → Manages course/module completion state.
- `src/hooks/useVideoProgress.ts` → Manages per-video playback position safely.
- `src/utils/date.ts` → Provides stable, timezone-safe local date string keys.
- `src/utils/learningActivity.ts` → Handles daily learning activity delta logic and streak arrays.
- `src/utils/offlineStorage.ts` → Handles IndexedDB storage abstractions natively.
- `src/utils/notifications.ts` → Handles browser reminder storage and permission wrappers.

---

## Dependencies Added

| Dependency | Purpose |
|------------|---------|
| `react-confetti` | Course completion celebration (Task 2) |
| `idb-keyval` | Promise-based IndexedDB storage wrappers (Task 3) |
| `react-youtube` | Official YouTube IFrame API abstraction (Task 6) |

---

## Storage and Data Management

### localStorage
- `course_progress_<courseId>`: JSON object tracking completed module indices.
- `video_progress_<courseId>_<moduleIndex>`: JSON object storing integer timestamps.
- `learning_streak`: JSON tracking current/longest arrays and badges.
- `course_reminders`: JSON mapping active courses to future UNIX timestamps.

### IndexedDB
- Leveraged exclusively for Task 3 to store `offline_course_<courseId>` (a full structured mock layout and image blobs) securely, providing substantially higher quota limits than localStorage.

---

## Responsive Design

The internship features seamlessly inherit the original TailwindCSS foundations and have been fully designed and strictly tested to accommodate Desktop, Tablet, and Mobile parameters natively.

---

## Testing and Verification

### TypeScript
`npx tsc --noEmit`
- **Result:** Successfully compiled with 0 errors.

### Production Build
`npm run build`
- **Result:** Passed cleanly. Next.js statically generated all dynamic routes seamlessly (`/`, `/search`, `/course/[id]`, `/profile`).

### Feature Testing

| Task | Test | Result |
|------|------|--------|
| Task 1 | Search title + description + tags | PASS |
| Task 2 | Modules → completion → confetti | PASS |
| Task 3 | Text/images available offline | PASS |
| Task 4 | Daily activity + 7-day badge + reset | PASS |
| Task 5 | 1 hour / tomorrow / none | PASS |
| Task 6 | Save timestamp + resume/start over | PASS |

---

## Known Limitations

- **Browser notification limitations:** Frontend-only browser notifications cannot be explicitly guaranteed if the browser tab/application is completely killed natively.
- **External image CORS restrictions:** Unsplash images loaded cross-origin dynamically may refuse to encode locally, bypassing image caching.
- **Client-side storage:** `localStorage` is volatile and resets automatically if browsing data is cleared.
- **Mock authentication:** No explicit production identity layer exists.
- **Offline video:** Videos are intentionally ignored by the Service Worker per explicit requirements.

---

## Internship Submission Requirements

1. **Integrated Implementation:** All six tasks firmly integrated into the existing training project repository. No isolated projects authored.
2. **One-Time Submission:** No changes, replacements, or resubmissions are possible after the final review action.
3. **Stipend Contingency:** Stipend (up to ₹3000) is contingent squarely upon code evaluation matrices, disbursed 15-21 days post-review, with no guarantee of compensation.
4. **Plagiarism Prohibited:** All original code and structural architectural decisions independently authored.
5. **Report Requirements:** Submissions mandate delivering the accompanying Internship Report (covering Introduction, Learning Objectives, Activities, Solutions, etc.).
6. **Required Access:** Deployed application must remain absolutely public (no auth blockages) natively through Netlify/Vercel until evaluation completion.
7. **Daily Form:** Must fulfill the Daily Report tracker natively (`forms.gle/oi3UhE4RcZEKSu1r5`).

---

## Final Submission Checklist

- ✅ Task 1 complete
- ✅ Task 2 complete
- ✅ Task 3 complete
- ✅ Task 4 complete
- ✅ Task 5 complete
- ✅ Task 6 complete
- ✅ README updated
- ✅ INTERNSHIP_TASKS.md completed
- [ ] Internship report completed
- [ ] Daily reports completed
- ✅ Production build successful
- ✅ Responsive testing completed
- ✅ Live deployment completed
- [ ] Public URL verified *(Pending platform integration)*
- ✅ Source code reviewed
- ✅ No secrets/API keys committed
- ✅ No unnecessary files committed
- ✅ Final Git status reviewed

---

## Conclusion

The six assigned internship objectives have been seamlessly injected directly into the Coursera Clone platform structure natively, empowering a deeply resilient, offline-ready, engaging, and natively responsive frontend user experience exactly matching required technical bounds.
