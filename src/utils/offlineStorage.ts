import { get, set, del } from 'idb-keyval';
import { Course } from '@/Components/data/constant';

export interface OfflineCourse extends Course {
  offlineImage?: string;
  downloadedAt: string;
}

export function generateOfflineCourseSvg(title: string, provider: string): string {
  const safeTitle = (title || 'Course Content').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeProvider = (provider || 'Coursera Partner').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0056D2;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0a2540;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bgGrad)" />
    <circle cx="400" cy="160" r="60" fill="rgba(255,255,255,0.12)" />
    <path d="M370 160 L400 130 L430 160 L415 160 L415 190 L385 190 L385 160 Z" fill="#FFFFFF" />
    <text x="400" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeTitle}</text>
    <text x="400" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#93C5FD" text-anchor="middle">${safeProvider}</text>
    <rect x="320" y="350" width="160" height="36" rx="18" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
    <text x="400" y="373" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">✓ AVAILABLE OFFLINE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function downloadCourseForOffline(course: Course): Promise<{ success: boolean; imageCached: boolean }> {
  // Strip non-serializable properties (e.g. React Lucide icon components in careerOutcomes)
  const serializableCourse: Course = JSON.parse(JSON.stringify(course, (key, value) => {
    if (typeof value === 'function') {
      return undefined;
    }
    return value;
  }));

  // Attempt to fetch and cache the main image as a base64 string with a 4s timeout
  let imageBlobBase64: string | undefined = undefined;
  let imageCached = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(course.image, { signal: controller.signal, mode: 'cors' });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.blob();
      imageBlobBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      imageCached = true;
    }
  } catch (e) {
    console.warn("Could not cache remote image via CORS, generating local offline SVG fallback", e);
  }

  // If remote fetch failed, guarantee a high-quality local offline vector banner
  if (!imageBlobBase64) {
    imageBlobBase64 = generateOfflineCourseSvg(course.title, course.provider);
    imageCached = true;
  }

  // Explicitly cache HTML, scripts, stylesheets, and Next.js versioned assets for this course
  try {
    if ('caches' in window) {
      const cache = await caches.open('coursera-clone-cache-v4');
      // Cache course URL
      await cache.add(`/course/${course.id}`);
      
      // Cache all current scripts and stylesheets on the document
      const assetUrls = Array.from(document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('link[rel="stylesheet"], script[src]'))
        .map(el => ('src' in el ? (el as HTMLScriptElement).src : (el as HTMLLinkElement).href))
        .filter(url => Boolean(url && (url.startsWith(window.location.origin) || url.startsWith('/'))));
      
      for (const assetUrl of assetUrls) {
        try {
          await cache.add(assetUrl);
        } catch (err) {}
      }

      // Also try to cache the course image directly in CacheStorage
      if (course.image) {
        try {
          await cache.add(course.image);
        } catch (err) {}
      }
    }
  } catch (e) {
    console.warn("Could not cache course HTML into CacheStorage", e);
  }

  const offlineData: OfflineCourse = {
    ...serializableCourse,
    offlineImage: imageBlobBase64,
    downloadedAt: new Date().toISOString()
  };

  try {
    await set(`offline_course_${course.id}`, offlineData);
    return { success: true, imageCached };
  } catch (e) {
    console.error("Failed to write offline course to IndexedDB", e);
    throw e;
  }
}

export async function checkIsOffline(courseId: string): Promise<boolean> {
  try {
    const data = await get(`offline_course_${courseId}`);
    return !!data;
  } catch (e) {
    console.error("Error reading from IndexedDB", e);
    return false;
  }
}

export async function removeOfflineCourse(courseId: string): Promise<void> {
  try {
    await del(`offline_course_${courseId}`);
  } catch (e) {
    console.error("Error removing offline course from IndexedDB", e);
  }
}

export async function getOfflineCourse(courseId: string): Promise<OfflineCourse | undefined> {
  try {
    return await get(`offline_course_${courseId}`);
  } catch (e) {
    console.error("Error fetching offline course from IndexedDB", e);
    return undefined;
  }
}
