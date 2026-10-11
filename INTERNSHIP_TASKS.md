# Internship Tasks — Implementation Documentation

> **Live Public URL:** [https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/)  
> **GitHub Repository:** [https://github.com/SaiKiran729/coursera-clone-internship](https://github.com/SaiKiran729/coursera-clone-internship) (Branch: `internship-tasks`)  
> **Original Project Base:** [https://github.com/BitHeadmr/coursera-clone](https://github.com/BitHeadmr/coursera-clone)  
> **Organization:** ElevanceSkills Web Development Internship  
> **Support Email:** `training@elevanceskills.com`

---

## 1. Project Overview & Training Foundation

This document describes the technical architecture and implementation details for the **six internship tasks** integrated into the **Coursera Clone** application.

### Built on the Training Project
In strict compliance with the internship guidelines, all tasks were implemented as additional features **directly upon the existing project developed during the training curriculum**. No new or isolated project was created.

The original training curriculum covered:
- HTML Basics & Modern Layouts
- CSS Foundations, Grid & Micro-animations
- JavaScript, React.js fundamentals, and Next.js with TypeScript
- Full Coursera Clone web application structure (Navbar, Footer, Home, Course Details, Module Pages, Certificate, and Profile).

---

## 2. Final Submission Rules & Compliance

This submission strictly satisfies all guidelines provided for final evaluation:

1. **One-Time Submission:**
   - The internship submission is a **ONE-TIME** submission. All code, links, documentation, and assets have been verified prior to submission.
2. **Public Links:**
   - The live deployment at **[https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/)** is publicly accessible without login, credentials, or permission gates.
   - The site will remain live throughout the entire evaluation period.
3. **Internship Completion:**
   - Upon submitting this work, the internship is considered completed and ended.
   - All 6 tasks are fully implemented pin-to-pin.
4. **End Date is Actual Submission Date:**
   - The official internship end date is the actual submission date. The allotted duration was the completion window, not the automatic end date.
5. **Mentor Support & Communication:**
   - Mentor guidance was followed during implementation.
   - Any questions regarding this submission can be directed to `training@elevanceskills.com`.

---

## 3. Detailed Task Implementation (Tasks 1 to 6)

---

### Task 1 — Real-Time Course Search and Filtering

#### Objective
Search courses by title or description and filter them by category without reloading the page.

#### Requirements Checklist
- [x] Open the Search page.
- [x] Enter a course title in the search box.
- [x] Verify that matching courses appear immediately.
- [x] Search for a word found in a course description.
- [x] Select a category or skill tag and verify the results.
- [x] Apply a search term and category filter together.
- [x] Enter a search term that matches no courses and check the empty state.
- [x] Click “Clear all filters” and verify that the courses return.
- [x] Check that searching and filtering do not cause a full-page reload.

#### Implementation Details
- **Location:** `src/pages/search/index.tsx` and `src/Components/Navbar.tsx`
- **Real-Time Client Matching:** Searches course `title`, `description`, `modules.description`, and `skills` strings in real time.
- **Combined Category & Skill Filtering:**
  - **Categories:** Extracted uniquely from `course.type` (e.g., *"Professional Certificate"*, *"Specialization"*, *"Course"*).
  - **Skill Tags:** Extracted from `course.skills` (e.g., *"React"*, *"JavaScript"*, *"Python"*).
  - Filter logic requires both the category and selected skill tags to match simultaneously.
- **URL Synchronization Without Full-Page Reload:** Uses `window.history.replaceState` to reflect search parameters in the browser URL bar without triggering a Next.js server reload or hydration cycle.
- **Empty State & Reset:** If no courses match, a user-friendly empty state is displayed with a `"Clear all filters"` button (`id="clear-all-filters-btn"`), which resets the search input, categories, and skill tags in one click.

---

### Task 2 — Course Completion Celebration

#### Objective
Display confetti and a motivational message when a course is completed.

#### Requirements Checklist
- [x] Open an incomplete course.
- [x] Complete the required modules until the final module.
- [x] Mark the final module as completed.
- [x] Verify that confetti and a motivational message appear.
- [x] Verify that the celebration disappears after approximately 3–5 seconds.
- [x] Refresh the completed course page.
- [x] Verify that the completion status remains saved.
- [x] Verify that confetti does not appear again just because you refreshed.

#### Implementation Details
- **Location:** `src/pages/course/[id]/index.tsx` and `src/hooks/useCourseProgress.ts`
- **Completion Detection:** `useCourseProgress` tracks completed module indices in `localStorage`. The course is considered newly completed when `!completedModules.includes(index) && completedModules.length + 1 >= course.modules.length`.
- **Celebration Component:** Leverages `react-confetti` rendering 600 pieces with gravity 0.15, accompanied by a centered modal dialog featuring an award icon and the motivational text: *"Great Job! You've completed this course!"*.
- **Auto-Dismiss Timer:** Automatically dismisses after exactly 4 seconds (`setTimeout(() => setShowConfetti(false), 4000)`), fitting the 3–5 second requirement.
- **Refresh Protection:** Confetti state defaults to `false` on initial mount. On page refresh, `isCompleted` is read from `localStorage`, displaying the "Completed" badges and checkmarks without replaying the celebration.

---

### Task 3 — Offline Course Access

#### Objective
Save course content and access it without an internet connection. (Videos do not need to play offline).

#### Requirements Checklist
- [x] Open a course while connected to the internet.
- [x] Click “Download for Offline.”
- [x] Wait for the download confirmation or “Available Offline” indicator.
- [x] Turn on Airplane mode or disconnect from the internet.
- [x] Open the exact same course URL in a new browser tab.
- [x] Verify that the course title and syllabus appear.
- [x] Verify that the saved course text and images are available.
- [x] Refresh the page while still offline.
- [x] Verify again that the saved course content loads correctly.

#### Implementation Details
- **Location:** `public/sw.js`, `src/utils/offlineStorage.ts`, and `src/pages/course/[id]/index.tsx`
- **IndexedDB Storage:** When the user clicks *"Download for Offline"*, `downloadCourseForOffline` serializes the course object, modules, syllabus descriptions, and converts the primary cover image into a Base64 data URL stored in IndexedDB (`keyval-store`).
- **Service Worker Caching Shell:** The Service Worker (`public/sw.js`) caches the course route `/course/[id]` along with all document scripts and stylesheets.
- **Offline Fallback Matching:** When offline, the Service Worker intercepts navigation requests and matches against the cached page using `{ ignoreSearch: true }` and pathname fallbacks.
- **Zero Hydration Errors:** `src/pages/course/[id]/index.tsx` synchronously resolves the course from cached constants and IndexedDB, preventing `"Course not found"` flashes or `ERR_INTERNET_DISCONNECTED` errors.
- **Video Exclusion:** Video streaming endpoints (`youtube.com`, `youtu.be`) are intentionally bypassed by the Service Worker per explicit requirements.

---

### Task 4 — Daily Learning Streak and Badges

#### Objective
Track daily learning activity, consecutive days, and achievements.

#### Requirements Checklist
- [x] Open the Profile page.
- [x] Verify that the current learning streak is displayed.
- [x] Complete a lesson or learning activity today.
- [x] Refresh the page and verify that today's activity remains recorded.
- [x] Complete another lesson today and check that the streak does not increase twice on the same day.
- [x] Check the achievements section for the 7-Day badge if your streak has reached seven consecutive days.
- [x] If possible, verify missed-day reset behavior using suitable test data rather than waiting a day just for testing.

#### Implementation Details
- **Location:** `src/utils/learningActivity.ts`, `src/utils/date.ts`, `src/pages/profile/index.tsx`, and `src/Components/Navbar.tsx`
- **Timezone-Safe Date Tracking:** `getLocalDateKey()` generates calendar keys in `YYYY-MM-DD` format according to the user's local timezone.
- **Streak Calculation Logic:**
  - If `lastActivityDate === today`: activity is already recorded; **streak does not increase twice**.
  - If `diffDays === 1`: consecutive day; streak increments by 1.
  - If `diffDays > 1`: a day was missed; active streak resets to 0 (and resets to 1 upon new activity).
- **Achievements & Badges Grid:** The Profile page highlights earned badges in gold and shows locked milestones:
  - `3-Day Streak`
  - `7-Day Streak` *(Specifically highlighted for Task 4 evaluation)*
  - `14-Day Streak`
  - `30-Day Streak`
- **Interactive Streak Testing & Simulation Tools:** Evaluators can verify behavior immediately on the Profile page without waiting real calendar days:
  - **Simulate 7-Day Streak:** Immediately sets streak to 7 and unlocks the 7-Day badge.
  - **Simulate Missed Day:** Sets last activity to 2 days ago, resetting streak to 0.
  - **Simulate Active Yesterday:** Sets streak to 6 from yesterday, allowing the next activity today to trigger the 7-day milestone.
  - **Record Today's Activity:** Tests that today's activity logs without double-incrementing.
  - **Reset Streak:** Clears streak back to 0.
- **Global Navbar Integration:** A live clickable flame badge (`🔥 [X] Day Streak`) in the Navbar reflects real-time streak changes via the custom `streakUpdated` event and links directly to `/profile`.

---

### Task 5 — Course Reminders

#### Objective
Schedule and cancel reminders for unfinished courses.

#### Requirements Checklist
- [x] Open a course that is not completed.
- [x] Find the reminder option on the course overview page.
- [x] Open a video or module and check whether the reminder option is available there too.
- [x] Select “Remind me in 1 hour.”
- [x] Verify that the reminder is scheduled or that its status is displayed.
- [x] Cancel the reminder and verify that it is cancelled.
- [x] Select “Remind me tomorrow.”
- [x] Allow browser notifications if prompted.
- [x] Check notification delivery after the scheduled time.

#### Implementation Details
- **Location:** `src/pages/course/[id]/index.tsx`, `src/utils/notifications.ts`, and `src/pages/_app.tsx`
- **Dual Location Placement:** The reminder bell option is available on **both the Course Overview hero and the Sticky Module Page header**.
- **Available Intervals:**
  - *"Remind me in 1 hour"* (adds 1 hour)
  - *"Remind me tomorrow"* (adds 24 hours)
  - *"⚡ Test Reminder (in 5 sec)"* (specifically added for instant evaluation verification)
  - *"Cancel Reminder"* (clears the scheduled alert)
- **Notification Evaluation:** `src/pages/_app.tsx` evaluates pending reminders every 5 seconds and on the `remindersUpdated` event. If a reminder's time has passed, a native desktop browser notification triggers: *"Coursera Clone Reminder: It's time to continue your learning journey!"*.
- **Auto-Cancellation:** Completing a course automatically purges pending reminders for that course.

---

### Task 6 — Video Progress and Resume

#### Objective
Save the last watched position and allow users to resume or restart videos.

#### Requirements Checklist
- [x] Open a course video and start playing.
- [x] Play for 20-30 seconds, then navigate away or pause.
- [x] Reopen the same video.
- [x] Verify that a "Resume Watching" option appears with the saved timestamp (e.g., "Resume from 0:25") and a "Start from Beginning" option.
- [x] Click "Resume Watching" and verify that playback resumes from the saved position.
- [x] Reopen the video again and click "Start from Beginning."
- [x] Verify that playback restarts from 0:00 and the saved position resets.
- [x] Switch between multiple module videos and verify that progress is tracked independently.

#### Implementation Details
- **Location:** `src/Components/Videolayer.tsx` and `src/hooks/useVideoProgress.ts`
- **Auto-Pause on Navigation (Zero Background Audio):**
  - Listens to Next.js route transitions (`router.events.on('routeChangeStart')`). When leaving the page, the player **pauses immediately and flushes the exact timestamp to `localStorage`**.
  - Listens to `document.visibilitychange`: switching browser tabs or minimizing automatically pauses the video.
  - Component unmount triggers `pauseVideo()`, `stopVideo()`, and flushes progress.
- **Guaranteed Resume Overlay:**
  - When returning to a video with saved progress (>0s), a high-contrast frosted modal overlays the player:
    - **Resume from MM:SS** (with Play icon) — seeks to timestamp and plays.
    - **Start from Beginning** (with RotateCcw icon) — seeks to 0:00, resets saved progress, and plays.
  - Player stays paused until the user makes their choice.
- **Independent Module Progress:** Storage keys are partitioned by `video_progress_${courseId}_${moduleIndex}`, ensuring modules never overwrite each other.
- **Real-Time Progress Bar:** Below the player, a live status bar displays the current position (`MM:SS / MM:SS`) and a quick *"Restart (0:00)"* button.

---

## 4. Full Responsiveness Verification

The application layout has been rigorously verified on:
- **Mobile Devices (360px – 480px):** Tested on iPhone SE, iPhone 14/15, Samsung Galaxy. Search filters, video aspect ratio, module lists, and reminder dropdowns render without horizontal overflow.
- **Tablets (768px – 1024px):** Tested on iPad and Android tablets in portrait and landscape modes. Sidebars, grids, and navigation adjust smoothly.
- **Desktops & Laptops (1280px+):** Full widescreen experience with sidebar module navigation and high-definition video playback.

---

## 5. Verification & Test Matrix

| Task | Test Case | Target Result | Actual Result | Status |
|---|---|---|---|---|
| **Task 1** | Search course by title | Courses filter immediately | Matching course displays in real time | ✅ PASS |
| **Task 1** | Search course by description | Courses filter immediately | Description matches display accurately | ✅ PASS |
| **Task 1** | Apply Category + Skill filters | Combines category and skill filters | Filtered accurately without page reload | ✅ PASS |
| **Task 1** | No match search query | Empty state displayed | Shows friendly empty state | ✅ PASS |
| **Task 1** | Click "Clear all filters" | Restores all courses | Resets all filters; courses restore | ✅ PASS |
| **Task 2** | Complete final module | Confetti & celebration message | Confetti drops with motivational modal | ✅ PASS |
| **Task 2** | Celebration duration | Disappears in 3–5 seconds | Auto-dismisses at 4.0 seconds | ✅ PASS |
| **Task 2** | Page refresh | Status persists; no confetti replay | Course stays Completed; confetti does not replay | ✅ PASS |
| **Task 3** | Download for offline | Available Offline indicator | Button changes to green "Available Offline" | ✅ PASS |
| **Task 3** | Open course offline | Title, syllabus, text, images load | Loaded from SW cache & IndexedDB | ✅ PASS |
| **Task 3** | Refresh page offline | Page reloads without error | No ERR_INTERNET_DISCONNECTED; renders clean | ✅ PASS |
| **Task 4** | View Profile streak | Current streak displayed | Streak counter and flame display correctly | ✅ PASS |
| **Task 4** | Lesson completed today | Today's activity recorded | Last active date updates; flame reflects | ✅ PASS |
| **Task 4** | Second lesson today | No duplicate streak increase | Streak count unchanged; prevents duplicate | ✅ PASS |
| **Task 4** | 7-Day Streak Badge | Badge displays in Achievements | Unlocked 7-Day badge displayed in gold | ✅ PASS |
| **Task 4** | Missed-day reset test | Simulation tool resets streak | Current streak resets to 0 as expected | ✅ PASS |
| **Task 5** | Reminders on overview & module | Bell menu accessible on both pages | Dropdown renders cleanly on both pages | ✅ PASS |
| **Task 5** | Schedule reminder | Status changes to "Reminder Set" | Scheduled time displayed accurately | ✅ PASS |
| **Task 5** | Cancel reminder | Reminder is cancelled | Cleared from localStorage and status reset | ✅ PASS |
| **Task 5** | Notification delivery | Browser notification triggers | Notification pops up on time (tested at 5s) | ✅ PASS |
| **Task 6** | Play video 20-30s and leave | Video pauses; timestamp saved | Audio stops immediately; timestamp saved | ✅ PASS |
| **Task 6** | Reopen video | Resume Watching overlay appears | Shows "Resume from MM:SS" & "Start from Beginning" | ✅ PASS |
| **Task 6** | Click Resume Watching | Resumes from exact timestamp | Seeks to saved second and plays | ✅ PASS |
| **Task 6** | Click Start from Beginning | Restarts at 0:00; progress resets | Seeks to 0:00 and saved timestamp resets | ✅ PASS |
| **Task 6** | Switch between modules | Independent progress per module | Timestamps track separately per module | ✅ PASS |

---

## 6. Pre-Submission Final Verification

- [x] Built directly on the training project codebase.
- [x] All 6 internship tasks implemented pin-to-pin.
- [x] Zero compilation or TypeScript errors (`npx tsc --noEmit` clean).
- [x] Production build generated cleanly (`npm run build` static generation complete).
- [x] Public live deployment active: **[https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/)**.
- [x] Live deployment tested in incognito mode (zero authentication barriers).
- [x] Responsive layout verified across mobile, tablet, and desktop viewports.
- [x] README.md and INTERNSHIP_TASKS.md fully updated with all rules and documentation.
- [x] Final Git commit created and pushed to the remote repository.

---

*This document serves as the official technical implementation report for the ElevanceSkills Web Development Internship submission.*
