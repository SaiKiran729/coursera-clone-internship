# Coursera Clone — Internship Project

## Project Overview

This repository represents the final submission for the Coursera Clone Internship Project. The project builds directly upon a foundational training application, actively extending its functionality with six specific internship features designed to enhance user engagement, offline accessibility, and personalized learning. 

## Original Training Project

Before the internship tasks were implemented, the following comprehensive training curriculum was completed to build the foundational Coursera Clone application:

- **HTML Basics** - 7:55 min
- **CSS Foundations + Modern Layouts Part 1** - 10:45 min
- **CSS Grid + Animation Part 2** - 11:13 min
- **JavaScript** - 16:43 min
- **React JS - Basics** - 26 min
- **Learn Next.js With TypeScript** - 7:48 min
- **Creation of Coursera Website - Next.js** (11/11 completed - 100%)

The training project modules included:
- Setting up Navbar
- Navbar and Footer
- Creating Home Page
- Profile Page - Part 1
- Profile Page - Part 2
- Certificate Page
- Course Page - Part 1
- Course Page - Part 2
- Module Page - Part 1
- Module Page - Part 2
- Deployment

The internship explicitly requires that the assigned tasks be integrated deeply into this completed training project, rather than being built as a separate or unrelated application.

---

## Internship Task Documentation

Detailed technical documentation for all six internship tasks, implementation changes, testing procedures, architecture changes, and known limitations is available in `INTERNSHIP_TASKS.md`.

[View Internship Task Documentation](./INTERNSHIP_TASKS.md)

## Internship Objective & Features

The internship objective was to implement six distinct features into the training project without breaking existing architecture or modifying the mock data structure.

- **Task 1 — Search and Filter Courses with Tags:** Real-time discovery using title, description, and tag filtering natively.
- **Task 2 — Animated Course Completion Confetti:** Celebratory integration utilizing `react-confetti` upon satisfying absolute module requirements.
- **Task 3 — Offline Mode for Course Content:** Offline persistence leveraging `idb-keyval` (IndexedDB) alongside a custom Network-First Service Worker that explicitly precaches structural Next.js offline fallbacks and targeted course HTML pages.
- **Task 4 — Streak Tracking for Daily Learning:** Deep engagement tracking featuring localized calendar parsing and earned user badges.
- **Task 5 — Course Reminder Notification System:** Frontend-native Browser Notifications securely scheduling future learning intervals, with controls deeply integrated into the sticky course module header for maximum visibility.
- **Task 6 — Auto-Resume Video Playback:** Robust YouTube IFrame API wrapping (`react-youtube`) maintaining persistent timestamps per module natively, leveraging tight component keys and memoized hooks to strictly prevent timeline cross-contamination.

---

## Technology Stack

The project operates cleanly on the following technologies (Verified via `package.json`):

- **Framework:** Next.js `15.1.7` (Pages Router)
- **Library:** React `^19.0.0`
- **Language:** TypeScript `^5.x`
- **Styling:** TailwindCSS `^3.4.1`
- **Icons:** lucide-react `^0.475.0`
- **Video Player:** react-youtube `^10.1.0` (YouTube IFrame API)
- **Animations:** react-confetti `^6.4.0`
- **Storage:** idb-keyval `^6.3.0` (IndexedDB Wrapper), LocalStorage
- **Service Worker:** Custom Minimal Architecture (`sw.js`)
- **APIs:** Native Browser Notification API

---

## Project Structure

```
src/
  Components/
    data/
      constant.ts            // Mock course data architecture
    Navbar.tsx               // Top navigation (Search / Streak metrics)
    Videolayer.tsx           // Advanced React-YouTube Wrapper
  hooks/
    useCourseProgress.ts     // Course completion & module arrays
    useVideoProgress.ts      // Video auto-resume architecture
  pages/
    course/[id]/index.tsx    // Primary Course Dashboard / Hub
    profile/index.tsx        // User Profile & Badges UI
    search/index.tsx         // Search grid & tag filtering logic
    _app.tsx                 // Service Worker init / Notification loop
  utils/
    date.ts                  // Timezone-safe local calendar strings
    learningActivity.ts      // Streak calculation formulas
    notifications.ts         // Notification API handlers
    offlineStorage.ts        // IndexedDB serialization/deserialization
```

---

## Local Storage / Data Storage

The application leverages client-side storage heavily to persist the user's journey. No remote database is utilized.

### LocalStorage Keys:
- `course_progress_<courseId>`: JSON object tracking `{ completedModules: number[], isCompleted: boolean }`.
- `video_progress_<courseId>_<moduleIndex>`: JSON object storing exact timestamp integers for auto-resume functionality.
- `learning_streak`: JSON object tracking current/longest streak arrays and earned badges.
- `course_reminders`: JSON object containing future UNIX timestamps utilized by the background `_app.tsx` polling loop.

### IndexedDB Storage:
- Used exclusively for Task 3 (Offline Mode). Keyed as `offline_course_<courseId>`. 
- **Stored:** Title, layout data, embedded mock descriptions, text structures, and a dynamically converted Base64 snapshot of the primary course hero image.
- **Not Stored:** Videos are inherently blocked from serialization.

---

## Installation & Running Locally

1. **Clone repository:**
   ```bash
   git clone https://github.com/BitHeadmr/coursera-clone.git
   ```
2. **Enter directory and checkout branch:**
   ```bash
   cd coursera-clone
   git checkout internship-tasks
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start development server:**
   ```bash
   npm run dev
   ```
5. **Open:** `http://localhost:3000`

### Production Build Testing
To test the Service Worker and Production functionality natively:
```bash
npm run build
npm start
```

---

## Responsive Design

The application inherits the original training project's responsive Tailwind layout, and all six new internship task overlays/modals have been rigorously tested to scale elegantly across:
- Desktop environments
- Tablet displays
- Mobile form factors

---

## Known Limitations

1. **Browser Notification Limitations:** Task 5 utilizes standard frontend native Browser Notifications. Since there is no Push Service or Background Sync API server in the stack, notifications are generally not guaranteed to pop natively if the browser is entirely killed. Our architecture circumvents this gracefully by evaluating "overdue" alerts immediately upon reopening the tab.
2. **External Image CORS:** Task 3's Offline Mode attempts to cache Unsplash/external images by converting them to blobs natively. Depending on precise external server CORS headers, some images may refuse to encode locally; the fallback handles this by skipping the image and caching the critical text data successfully.
3. **Mock Authentication:** The Profile data is largely static/mocked. It is not tied to a production identity layer.
4. **Client-Side Storage:** Using `localStorage` means progress resets upon clearing browsing data.

---

## Internship Requirements & Submission Guidelines

All procedures followed strictly adhere to the official internship instructions:
1. All six assigned tasks have been completed and integrated seamlessly into the existing training project.
2. The final submission is being delivered exactly as a single repository, not as a disjointed/new side project.
3. The live project will remain publicly accessible until the evaluation finishes, containing no authorization barriers.
4. Plagiarism is strictly prohibited. The architecture for IndexedDB, Service Workers, and time manipulation has been manually authored.
5. All deliverables (Code, Live URL, and Internship Report) will be bundled together natively.
6. The required daily reports (`forms.gle/oi3UhE4RcZEKSu1r5`) have been continuously submitted.
7. Understands that the maximum stated stipend (up to ₹3000) is contingent strictly on code quality and evaluator discretion, distributed ~15-21 days post-review, with no guarantee of compensation.

---

## Internship Report Requirements

Alongside this codebase, an independent Internship Report is provided, strictly containing:
1. Introduction & Background
2. Learning Objectives
3. Activities and Tasks
4. Skills and Competencies
5. Feedback and Evidence
6. Challenges and Solutions
7. Outcomes and Impact
8. Conclusion

---
