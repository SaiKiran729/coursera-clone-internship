# Coursera Clone — Internship Project

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://coursera-internship.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Live Public URL:** [https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/)  
> **Repository:** [https://github.com/SaiKiran729/coursera-clone-internship](https://github.com/SaiKiran729/coursera-clone-internship) (Branch: `internship-tasks`)  
> **Original Training Project Repository:** [https://github.com/BitHeadmr/coursera-clone](https://github.com/BitHeadmr/coursera-clone)

---

## 📌 Project Overview

This repository represents the final, comprehensive submission for the **Coursera Clone Web Development Internship** at **ElevanceSkills**. 

All six assigned internship tasks have been developed and integrated **directly into the foundational training project** completed during the training phase. The project extends the original Coursera Clone with high-performance real-time search, interactive animations, offline content caching, daily streak tracking with milestone badges, scheduled browser reminders, and intelligent video resume capability.

---

## ⚠️ Important — Final Submission Rules & Compliance

This project strictly adheres to all official ElevanceSkills internship submission guidelines:

1. **Build on Your Training Project:**
   - The internship tasks are implemented as extra features **directly on the same project completed during training**.
   - No separate, isolated, or new codebase was created.
2. **Host and Share Your Live URL:**
   - The application is deployed live on Vercel: **[https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/)**.
   - The link is **100% public** and requires no login, authentication, or access approval.
   - It will remain active and hosted continuously throughout the entire evaluation period.
3. **Make It Fully Responsive:**
   - The entire website works smoothly across **all mobile devices, tablets, laptops, and desktop screens**.
4. **One-Time Submission:**
   - This submission is final. All tasks, files, links, and documents have been thoroughly tested and verified.
5. **Internship Completion & End Date:**
   - Upon submission, the internship is considered completed.
   - The actual internship **end date** is recorded as the submission date.
6. **Mentor Support & Queries:**
   - Mentor guidance was leveraged throughout development.
   - Queries contact: `training@elevanceskills.com` (with Name, Domain, and Project Link).

---

## 📋 Comprehensive Internship Tasks (Pin-to-Pin)

| Task | Title | Core Objective | Key Implementation Highlights |
|---|---|---|---|
| **Task 1** | **Real-Time Course Search & Filtering** | Search courses by title/description and filter by category/skills without page reload. | Real-time text search across title, description, and module details. Category filters (Course Type) + Skill tag filters. Smooth URL synchronization (`replaceState`), instant empty state, and one-click "Clear all filters" button without full-page reload. |
| **Task 2** | **Course Completion Celebration** | Trigger confetti and motivational message upon course completion. | `react-confetti` celebration triggers automatically when the final module is completed. Displays animated modal *"Great Job! You've completed this course!"*. Celebration auto-dismisses after 4 seconds (within 3–5s range). Completion persists in `localStorage`; confetti does **not** re-trigger on page refresh. |
| **Task 3** | **Offline Course Access** | Save course content for offline access without internet. | Service Worker (`public/sw.js`) Network-First cache for page HTML, CSS, and JS chunks with offline fallback. IndexedDB (`idb-keyval`) stores course metadata, modules, and cover image. Offline indicator toggles seamlessly. Course title, syllabus, text, and cached cover images remain fully accessible on offline page reloads. Videos are excluded. |
| **Task 4** | **Daily Learning Streak & Badges** | Track daily activity, consecutive days, and milestones. | Timezone-safe local calendar tracking. Same-day duplicate learning activities do not double-increment the streak. Consecutive days increment streak; missed days (>1 day) reset active streak to 0. Displays **Current Streak**, **Longest Streak**, and **Last Active Date**. Achievements section displays **3-Day**, **7-Day Streak** (specifically required), **14-Day**, and **30-Day** badges with locked/unlocked states. Includes in-app **Streak Testing & Verification Tools** on the Profile page to test 7-day badge unlock and missed-day reset behavior immediately. |
| **Task 5** | **Course Reminders** | Schedule and cancel reminders for unfinished courses. | Bell reminder option is prominently integrated on **both the Course Overview page and the Module page**. Options include *"Remind me in 1 hour"*, *"Remind me tomorrow"*, and *"⚡ Test Reminder (in 5 sec)"* for instant evaluator testing. Browser Notification API requests permission and displays notifications. Reminders can be cancelled at any time; status shows exact scheduled time. Auto-clears when the course is completed. |
| **Task 6** | **Video Progress & Auto-Resume** | Save last watched video position, auto-pause on exit, and allow resume/restart. | YouTube IFrame API (`react-youtube`) tracks playback time in real-time. **Auto-pauses video immediately when user navigates to another page** (`routeChangeStart`), switches browser tabs (`visibilitychange`), or unmounts. When returning to the video, an elegant overlay displays: **"Resume from MM:SS"** (seeks to timestamp and plays) and **"Start from Beginning"** (seeks to 0:00, resets saved progress, and plays). Progress is tracked independently per module. |

---

## 📱 Full Responsiveness & Device Support

The entire application has been built and tested for responsive parity across:
- **Mobile Phones (320px – 640px):** Single-column layouts, mobile menu drawer, stacked action buttons, responsive video aspect ratio (`16:9`), touch-friendly targets (min 44px).
- **Tablets (768px – 1024px):** Two-column grids, responsive sidebar collapses, adaptable course headers.
- **Laptops & Desktops (1024px+):** Full multi-column dashboard, split module sidebar with video player, responsive navigation.

---

## 🛠️ Technology Stack

- **Framework:** Next.js `15.1.7` (Pages Router)
- **Library:** React `19.0.0`
- **Language:** TypeScript `5.x`
- **Styling:** Tailwind CSS `3.4.1`
- **Icons:** `lucide-react`
- **Video Player:** `react-youtube` (Official YouTube IFrame API)
- **Celebration Animation:** `react-confetti`
- **Offline Storage:** `idb-keyval` (IndexedDB Wrapper) + LocalStorage
- **Service Worker:** Custom Progressive Web App Cache Shell (`sw.js`)
- **Notifications:** Native Browser Notification API
- **Deployment Platform:** Vercel

---

## 📂 Project Architecture

```
coursera-clone/
├── public/
│   ├── sw.js                      # Custom Service Worker (Network-First + offline navigation fallback)
│   └── favicon.ico
├── src/
│   ├── Components/
│   │   ├── data/
│   │   │   └── constant.ts        # Course dataset, module syllabus, skills, and metadata
│   │   ├── Fotter.tsx             # Responsive global footer
│   │   ├── Navbar.tsx             # Header with search query dispatch & live clickable streak badge
│   │   └── Videolayer.tsx         # YouTube player with auto-pause on leave & guaranteed resume overlay
│   ├── hooks/
│   │   ├── useCourseProgress.ts   # Module completion state & streak recording hook
│   │   └── useVideoProgress.ts    # Module-specific video playback timestamp persistence
│   ├── pages/
│   │   ├── _app.tsx               # Service Worker registration & background reminder evaluation loop
│   │   ├── _document.tsx
│   │   ├── index.tsx              # Home landing page with course catalog
│   │   ├── certificate.tsx        # Course certificate viewer
│   │   ├── course/
│   │   │   └── [id]/
│   │   │       └── index.tsx      # Course overview & module player with reminder, offline & confetti logic
│   │   ├── profile/
│   │   │   └── index.tsx          # Profile dashboard, achievements/badges & interactive streak test tools
│   │   └── search/
│   │       └── index.tsx          # Real-time search by title/desc with category & skill tag filters
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       ├── date.ts                # Timezone-safe local calendar date key generator (`YYYY-MM-DD`)
│       ├── learningActivity.ts    # Daily streak calculator, milestone awards & simulation test helpers
│       ├── notifications.ts       # Browser Notification API permissions & reminder map persistence
│       └── offlineStorage.ts      # IndexedDB and Service Worker caching orchestrator
├── INTERNSHIP_TASKS.md            # Detailed technical specification of all 6 internship tasks
├── README.md                      # Primary project documentation & submission guide
└── package.json
```

---

## 💾 Client-Side Storage Architecture

The application is completely self-contained and operates without requiring an external database:

### 1. `localStorage`
- `course_progress_<courseId>`: Stores `{ completedModules: number[], isCompleted: boolean, completedAt?: string }`.
- `video_progress_<courseId>_<moduleIndex>`: Stores `{ timestamp: number, duration: number, updatedAt: string }`.
- `learning_streak`: Stores `{ currentStreak: number, longestStreak: number, lastActivityDate: string, badges: string[] }`.
- `course_reminders`: Stores `{ [courseId]: { reminderAt: number } }`.

### 2. `IndexedDB` (Database: `keyval-store`)
- Key: `offline_course_<courseId>`
- Value: Full serialized course object including title, provider, modules, syllabus text, and base64 cover image string.

### 3. `CacheStorage` (Cache: `coursera-clone-cache-v2`)
- Pre-caches root HTML `/`.
- Caches SSR page HTML `/course/<id>` and all static Next.js JavaScript chunks and stylesheets upon downloading a course for offline use.

---

## 🧪 Quick Evaluation Guide for Reviewers

### Task 1: Search & Filter
1. Navigate to `/search` or use the Navbar search box.
2. Type any course title (e.g., *"Microsoft"*) or description keyword (e.g., *"machine learning"*). Courses filter immediately without reload.
3. Check a Category (e.g., *"Professional Certificate"*) or Skill tag (e.g., *"React"*).
4. Type a search term that matches nothing (e.g., *"zzzzzzz"*). View the empty state and click **"Clear all filters"** to restore all courses.

### Task 2: Completion Celebration
1. Open any incomplete course (e.g., `/course/microsoft-front-end`).
2. Click **"Start Free Trial"** or **"Enroll Now"** to view module lessons.
3. Click **"Mark as Complete"** across modules until the final module.
4. When the final module is marked complete, confetti drops and the *"Great Job! You've completed this course!"* message appears.
5. Notice the celebration auto-dismisses after 4 seconds.
6. Refresh the page: the course remains marked **Completed**, and confetti does **not** re-appear.

### Task 3: Offline Mode
1. Open any course while online.
2. Click **"Download for Offline"**. The button changes to a green **"Available Offline"** indicator.
3. In Chrome DevTools, go to **Network → Offline** (or turn on Airplane mode).
4. Reopen the exact course URL in a new tab or refresh the page offline.
5. Course title, syllabus, description, and images load correctly without `ERR_INTERNET_DISCONNECTED` or hydration errors.

### Task 4: Daily Learning Streak & Badges
1. Open `/profile`. Observe the **Current Streak** and **Achievements** section.
2. Complete any lesson or module: today's activity is recorded, and the navbar flame badge updates.
3. Completing another lesson on the same day does not increment the streak twice.
4. To verify the **7-Day Badge** and **missed-day reset behavior** without waiting real days, use the **Streak Testing Tools** card on the Profile page:
   - Click **"Simulate 7-Day Streak"**: Instantly awards the **7-Day Streak** badge with a gold unlocked highlight!
   - Click **"Simulate Missed Day"**: Sets the last activity to 2 days ago; current streak resets to 0.
   - Click **"Simulate Active Yesterday"**: Sets streak to 6 from yesterday; completing a lesson today unlocks the 7-Day badge.

### Task 5: Course Reminders
1. Open an unfinished course overview or module page.
2. Click **"Set Reminder"** in the header.
3. Select **"⚡ Test Reminder (in 5 sec)"** (or 1 hour / tomorrow) and allow browser notifications if prompted.
4. Status changes to **"Reminder Set"** with the exact time.
5. In 5 seconds, receive the native desktop notification.
6. Click **"Cancel Reminder"** anytime to clear scheduled alerts.

### Task 6: Video Progress & Resume
1. Open any course module containing a video.
2. Play the video for 15–30 seconds.
3. Navigate away to another page (e.g. click *"Back to Courses"* or navigate to `/profile`). **Notice the video pauses automatically with zero background audio leaks.**
4. Return to the same video module.
5. The **"Resume Watching?"** overlay appears over the player showing the exact timestamp (e.g. *"Resume from 0:24"*).
6. Click **"Resume from MM:SS"**: Playback resumes from that exact point.
7. Click **"Start from Beginning"**: Playback restarts from 0:00 and saved timestamp resets.
8. Switch between different modules to verify progress is tracked independently per module.

---

## 🚀 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/SaiKiran729/coursera-clone-internship.git

# 2. Navigate to project directory
cd coursera-clone-internship

# 3. Checkout internship branch
git checkout internship-tasks

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Validating Production Build
```bash
npm run build
npm start
```

---

## ✅ Final Pre-Submission Verification Checklist

- [x] All 6 internship tasks implemented pin-to-pin without missing items.
- [x] Built directly on the training project foundation.
- [x] Fully responsive across Mobile, Tablet, and Desktop screens.
- [x] Production build passes cleanly with zero errors (`npm run build`).
- [x] Hosted live on Vercel: [https://coursera-internship.vercel.app/](https://coursera-internship.vercel.app/).
- [x] Live URL is 100% public, tested, and accessible without login/authentication.
- [x] Detailed task technical documentation updated in `INTERNSHIP_TASKS.md`.
- [x] Comprehensive project documentation updated in `README.md`.
- [x] No secrets, sensitive tokens, or unnecessary files committed.

---

## 📬 Contact & Support

For queries or evaluation reviews:
- **Internship Organization:** ElevanceSkills
- **Support Email:** `training@elevanceskills.com`
- **Domain:** Web Development Internship
