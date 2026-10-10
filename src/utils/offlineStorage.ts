import { get, set, del } from 'idb-keyval';
import { Course } from '@/Components/data/constant';

export interface OfflineCourse extends Course {
  offlineImage?: string;
  downloadedAt: string;
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
  let imageBlobBase64 = undefined;
  let imageCached = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(course.image, { signal: controller.signal });
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
    console.warn("Could not cache image for offline due to CORS or network issues", e);
  }

  // Explicitly cache the HTML page for this course so it's available for offline navigation
  try {
    if ('caches' in window) {
      const cache = await caches.open('coursera-clone-cache-v2');
      await cache.add(`/course/${course.id}`);
    }
  } catch (e) {
    console.error("Could not explicitly cache course HTML", e);
    throw new Error("Failed to cache course HTML for offline viewing");
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
