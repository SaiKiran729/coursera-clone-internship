import { get, set, del } from 'idb-keyval';
import { Course } from '@/Components/data/constant';

export interface OfflineCourse extends Course {
  offlineImage?: string;
  downloadedAt: string;
}

export async function downloadCourseForOffline(course: Course): Promise<{ success: boolean; imageCached: boolean }> {
  const courseData = { ...course };

  // Attempt to fetch and cache the main image as a base64 string
  let imageBlobBase64 = undefined;
  let imageCached = false;
  try {
    const res = await fetch(course.image);
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

  const offlineData: OfflineCourse = {
    ...courseData,
    offlineImage: imageBlobBase64,
    downloadedAt: new Date().toISOString()
  };

  await set(`offline_course_${course.id}`, offlineData);
  return { success: true, imageCached };
}

export async function checkIsOffline(courseId: string): Promise<boolean> {
  const data = await get(`offline_course_${courseId}`);
  return !!data;
}

export async function removeOfflineCourse(courseId: string): Promise<void> {
  await del(`offline_course_${courseId}`);
}

export async function getOfflineCourse(courseId: string): Promise<OfflineCourse | undefined> {
  return await get(`offline_course_${courseId}`);
}
