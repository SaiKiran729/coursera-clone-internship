import React, { useEffect, useState } from "react";
import {
  Star,
  Clock,
  Award,
  Users,
  CheckCircle2,
  PlayCircle,
  Download,
  Share2,
  BookmarkPlus,
  Globe,
  MessageCircle,
  ThumbsUp,
  AlignCenterVertical as Certificate,
  Calendar,
  Target,
  ChevronDown,
  Briefcase,
  Building2,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  FileText,
  CloudOff,
  DownloadCloud,
  Loader2,
  Trash2,
  Bell,
  BellRing,
  TrendingUp,
  X
} from "lucide-react";
import { useRouter } from "next/router";
import { Course, courses } from "@/Components/data/constant";
import Videolayer from "@/Components/Videolayer";
import Confetti from "react-confetti";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useRef } from "react";
import { downloadCourseForOffline, checkIsOffline, removeOfflineCourse, getOfflineCourse } from '@/utils/offlineStorage';
import { getReminders, setReminder, cancelReminder as cancelNotification, requestNotificationPermission } from '@/utils/notifications';

function CourseDetails() {
  const [selectedModule, setSelectedModule] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedmoduleindex, setselectedmoduleindex] = useState(0);
  const [showmodulepage, setshowmodulepage] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reminderAt, setReminderAt] = useState<number | null>(null);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resumableModule, setResumableModule] = useState<{ index: number; timestamp: number } | null>(null);

  const router = useRouter();
  const queryId = router.query.id as string | undefined;

  const {
    progress,
    markModuleComplete,
    isCompleted,
    completedModules
  } = useCourseProgress(course?.id || "", course?.modules?.length || 0);

  // 1. Immediately resolve course from in-memory constant, then verify offline data
  useEffect(() => {
    const getActiveId = () => {
      if (typeof router.query.id === 'string' && router.query.id) return router.query.id;
      if (typeof window !== 'undefined') {
        const parts = window.location.pathname.split('/course/');
        if (parts[1]) return parts[1].split('?')[0].split('/')[0];
      }
      return '';
    };

    const activeId = getActiveId();
    if (!activeId) return;

    const foundCourse = courses.find((c) => c.id === activeId);
    if (foundCourse) {
      setCourse(foundCourse);
    }

    checkIsOffline(activeId).then(setIsOffline).catch(() => {});
    getOfflineCourse(activeId).then((offlineData) => {
      if (offlineData) {
        setCourse({
          ...offlineData,
          image: offlineData.offlineImage || offlineData.image,
          careerOutcomes: offlineData.careerOutcomes?.map((outcome, idx) => ({
            ...outcome,
            icon: foundCourse?.careerOutcomes?.[idx]?.icon || TrendingUp
          })) || []
        });
        setIsOffline(true);
      }
    }).catch(() => {});
  }, [router.isReady, router.query.id]);

  // 2. Synchronize reminders
  useEffect(() => {
    if (course?.id) {
      const updateReminder = () => {
        const reminders = getReminders();
        setReminderAt(reminders[course.id]?.reminderAt || null);
      };
      updateReminder();
      window.addEventListener('remindersUpdated', updateReminder);
      return () => window.removeEventListener('remindersUpdated', updateReminder);
    }
  }, [course?.id]);

  // 3. Module URL query synchronization
  useEffect(() => {
    if (router.isReady && router.query.module !== undefined) {
      const modIdx = parseInt(router.query.module as string, 10);
      if (!isNaN(modIdx) && modIdx >= 0) {
        setselectedmoduleindex(modIdx);
        setshowmodulepage(true);
      }
    }
  }, [router.isReady, router.query.module]);

  // 4. Resumable module detection across all modules
  useEffect(() => {
    if (typeof window === 'undefined' || !course?.id || !course.modules) return;
    const findResumable = () => {
      for (let i = 0; i < course.modules.length; i++) {
        try {
          const item = localStorage.getItem(`video_progress_${course.id}_${i}`);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed && parsed.timestamp >= 2) {
              setResumableModule({ index: i, timestamp: parsed.timestamp });
              return;
            }
          }
        } catch (e) {}
      }
      setResumableModule(null);
    };
    findResumable();
  }, [course?.id, showmodulepage]);

  const handleOfflineToggle = async () => {
    if (!course) return;
    if (isOffline) {
      try {
        await removeOfflineCourse(course.id);
        setIsOffline(false);
      } catch (e) {
        console.error("Error removing offline course", e);
      }
    } else {
      setIsDownloading(true);
      try {
        const result = await downloadCourseForOffline(course);
        setIsOffline(true);
        if (!result.imageCached) {
          alert("Course content saved for offline access! Note: Cover image could not be cached due to external network restrictions, but all text, syllabus, and modules are available offline.");
        }
      } catch (e) {
        console.error("Error saving course for offline", e);
        alert("Could not complete offline download. Please check your connection and try again.");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleSetReminder = async (hours: number) => {
    if (!course) return;

    const permission = await requestNotificationPermission();
    if (permission === 'unsupported') {
      alert("Notifications are not supported in this browser. Please use Chrome, Edge, or Firefox.");
      setShowReminderMenu(false);
      return;
    }
    if (permission === 'denied') {
      alert("Browser notifications are blocked. Please allow notifications in site settings to use reminders.");
      setShowReminderMenu(false);
      return;
    }
    if (permission !== 'granted') {
      alert("Notification permission was not granted. Please allow notifications to receive reminders.");
      setShowReminderMenu(false);
      return;
    }

    const timestamp = Date.now() + Math.round(hours * 60 * 60 * 1000);
    setReminder(course.id, timestamp, course.title);
    setShowReminderMenu(false);
  };

  const handleCancelReminder = () => {
    if (!course) return;
    cancelNotification(course.id);
    setShowReminderMenu(false);
  };

  const handleMarkComplete = (index: number) => {
    if (!course) return;
    markModuleComplete(index);

    // Check if this action makes the course complete
    const isNewlyCompleted = !completedModules.includes(index) &&
                             completedModules.length + 1 >= course.modules.length;

    if (isNewlyCompleted && !isCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handlebackclick = () => {
    setshowmodulepage(false);
    if (course?.id) {
      router.replace(`/course/${course.id}`, undefined, { shallow: true });
    }
  };

  const handlemoduleclick = (targetIndex?: number) => {
    const idx = typeof targetIndex === 'number' ? targetIndex : (resumableModule?.index ?? selectedmoduleindex);
    setselectedmoduleindex(idx);
    setshowmodulepage(true);
    if (course?.id) {
      router.replace({ pathname: `/course/${course.id}`, query: { module: idx } }, undefined, { shallow: true });
    }
  };

  const changeModule = (index: number) => {
    setselectedmoduleindex(index);
    if (course?.id) {
      router.replace({ pathname: `/course/${course.id}`, query: { module: index } }, undefined, { shallow: true });
    }
  };

  if (!course) {
    if (!router.isReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading course content...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't locate this course.</p>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Back to Courses
        </button>
      </div>
    );
  }

  const Module = course.modules[selectedmoduleindex] || course.modules[0];

  if (showmodulepage) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white border-b border-gray-200 py-3 sm:py-4 px-3 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            <button
              onClick={handlebackclick}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors mr-2 sm:mr-4 flex-shrink-0 min-h-[44px]"
            >
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base hidden sm:inline">Back to Courses</span>
              <span className="font-medium text-sm sm:hidden">Back</span>
            </button>
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {course.title}
            </h1>
          </div>

          {!isCompleted && (
            <div className="relative z-50 flex-shrink-0">
              <button
                onClick={() => setShowReminderMenu(!showReminderMenu)}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-full border transition-colors min-h-[40px] ${
                  reminderAt
                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {reminderAt ? (
                  <BellRing className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2 text-blue-600" />
                ) : (
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                )}
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {reminderAt ? "Reminder Set" : "Set Reminder"}
                </span>
              </button>

              {showReminderMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  {reminderAt && (
                    <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                      Currently set for:<br/>
                      <span className="font-semibold text-gray-700">
                        {new Date(reminderAt).toLocaleString(undefined, {
                          weekday: 'short',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleSetReminder(1)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Remind me in 1 hour
                  </button>
                  <button
                    onClick={() => handleSetReminder(24)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Remind me tomorrow
                  </button>
                  <button
                    onClick={() => handleSetReminder(5 / 3600)}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100"
                  >
                    ⚡ Test Reminder (in 5 sec)
                  </button>
                  {reminderAt && (
                    <button
                      onClick={handleCancelReminder}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      Cancel Reminder
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          <div className="hidden md:block w-72 lg:w-80 border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Course Modules
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Module {selectedmoduleindex + 1} of {course.modules.length}
              </p>
            </div>
            <nav className="py-2">
              {course.modules.map((module, index) => (
                <button
                  key={index}
                  onClick={() => changeModule(index)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedmoduleindex === index ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        completedModules.includes(index)
                          ? "bg-green-500 text-white"
                          : selectedmoduleindex === index
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {completedModules.includes(index) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${
                          selectedmoduleindex === index
                            ? "text-blue-600"
                            : "text-gray-800"
                        }`}
                      >
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {module.duration}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 h-full overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* Mobile Module Selector */}
              <div className="md:hidden mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Select Module ({selectedmoduleindex + 1}/{course.modules.length})
                </label>
                <select
                  value={selectedmoduleindex}
                  onChange={(e) => changeModule(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white"
                >
                  {course.modules.map((mod, idx) => (
                    <option key={idx} value={idx}>
                      Module {idx + 1}: {mod.title} {completedModules.includes(idx) ? '✓ (Completed)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {Module.title}
                </h2>
                <div className="flex gap-4 mb-6">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {Module.duration}
                  </span>
                  <span className="text-sm text-gray-600 flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {Module.hours} hours
                  </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 sm:gap-3 mb-6">
                  <button
                    onClick={() =>
                      changeModule(
                        Math.max(0, selectedmoduleindex - 1)
                      )
                    }
                    disabled={selectedmoduleindex === 0}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center transition-all ${
                      selectedmoduleindex === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Previous Module
                  </button>

                  {!completedModules.includes(selectedmoduleindex) ? (
                    <button
                      onClick={() => handleMarkComplete(selectedmoduleindex)}
                      className="px-4 sm:px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 text-xs sm:text-sm font-semibold flex items-center transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Mark as Complete
                    </button>
                  ) : (
                    <div className="px-4 sm:px-5 py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm font-semibold flex items-center border border-green-200">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                      Completed
                    </div>
                  )}

                  <button
                    onClick={() =>
                      changeModule(
                        Math.min(
                          course.modules.length - 1,
                          selectedmoduleindex + 1
                        )
                      )
                    }
                    disabled={selectedmoduleindex === course.modules.length - 1}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center transition-all ${
                      selectedmoduleindex === course.modules.length - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#0056D2] text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm"
                    }`}
                  >
                    Next Module
                    <ArrowLeft className="h-4 w-4 ml-1.5 transform rotate-180" />
                  </button>
                </div>
                {Module.videoId && (
                  <div className="mb-8">
                    <Videolayer
                      key={`${course.id}-${selectedmoduleindex}`}
                      videoId={Module.videoId}
                      title={Module.title}
                      courseId={course.id}
                      moduleIndex={selectedmoduleindex}
                      onComplete={() => handleMarkComplete(selectedmoduleindex)}
                    />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">
                  About this module
                </h3>
                <p className="text-gray-700 mb-8">{Module.description}</p>

                <h4 className="font-medium text-gray-800 mb-4">
                  Module Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Duration</h4>
                    </div>
                    <p className="text-gray-600">{Module.weeks} weeks</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Study Hours</h4>
                    </div>
                    <p className="text-gray-600">{Module.hours} hours</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Projects</h4>
                    </div>
                    <p className="text-gray-600">{Module.projects} projects</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Quizzes</h4>
                    </div>
                    <p className="text-gray-600">{Module.quizzes} quizzes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti Celebration Modal */}
        {showConfetti && (
          <div
            id="celebration-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 cursor-pointer"
            onClick={() => setShowConfetti(false)}
          >
            <Confetti recycle={false} numberOfPieces={600} gravity={0.15} />
            <div
              className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full relative transform transition-all animate-bounce border-2 border-yellow-300 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="btn-close-celebration"
                onClick={() => setShowConfetti(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-300">
                <Award className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Great Job! 🎉</h2>
              <p className="text-gray-600 text-lg mb-6">
                You've completed all modules for <span className="font-semibold text-gray-900">{course.title}</span>!
              </p>
              <button
                onClick={() => setShowConfetti(false)}
                className="w-full py-3 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  const fullDescription = `
    Prepare for a career in the high-growth field of data analytics, no experience or degree required.
    Get professional training designed by Google and have the opportunity to connect with top employers.

    Data analytics is the collection, transformation, and organization of data in order to draw conclusions,
    make predictions, and drive informed decision making. Over 8 courses, gain in-demand skills that prepare
    you for an entry-level job. You'll learn from Google employees whose foundations in data analytics
    served as launchpads for their own careers.

    This program includes over 180 hours of instruction and hundreds of practice-based assessments, which
    will help you simulate real-world data analytics scenarios that are critical for success in the workplace.
    The content is highly interactive and exclusively developed by Google employees with decades of
    experience in data analytics. Through a mix of videos, assessments, and hands-on labs, you'll get
    introduced to analysis tools and platforms and key analytical skills required for an entry-level job.
  `;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8 overflow-x-auto whitespace-nowrap flex-1 pr-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <style dangerouslySetInnerHTML={{__html: `
                .overflow-x-auto::-webkit-scrollbar { display: none; }
              `}} />
              <a
                href="#overview"
                className="text-gray-700 hover:text-[#0056D2]"
              >
                Overview
              </a>
              <a href="#skills" className="text-gray-700 hover:text-[#0056D2]">
                Skills
              </a>
              <a href="#content" className="text-gray-700 hover:text-[#0056D2]">
                Content
              </a>
              <a
                href="#instructors"
                className="text-gray-700 hover:text-[#0056D2]"
              >
                Instructors
              </a>
              <a href="#reviews" className="text-gray-700 hover:text-[#0056D2]">
                Reviews
              </a>
              <a href="#careers" className="text-gray-700 hover:text-[#0056D2]">
                Career Outcomes
              </a>
            </div>
            <button
              className="px-4 md:px-6 py-2 bg-[#0056D2] text-white font-semibold rounded-sm flex-shrink-0"
              onClick={() => handlemoduleclick()}
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
            <div className="w-full lg:max-w-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Certificate className="h-5 w-5 text-[#0056D2]" />
                  <span className="ml-1 text-gray-600">{course.type}</span>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900">
                    {course.rating}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              <p className="text-base md:text-lg text-gray-600 mb-6">
                {showFullDescription
                  ? fullDescription
                  : fullDescription.slice(0, 200) + "..."}
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-[#0056D2] ml-2 hover:underline inline-block mt-1"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="ml-2">{course.students}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="ml-2">{course.level}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="ml-2">{course.timeline}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="ml-2 text-sm md:text-base">Updated {course.lastUpdated}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  className="px-8 py-3 bg-[#0056D2] text-white font-semibold rounded-sm hover:bg-blue-700 transition-colors"
                  onClick={() => handlemoduleclick()}
                >
                  {isCompleted ? "Review Completed Course" : "Start Free Trial"}
                </button>
                {resumableModule && !isCompleted && (
                  <button
                    id="btn-resume-course-banner"
                    onClick={() => handlemoduleclick(resumableModule.index)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-sm transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Resume Module {resumableModule.index + 1} ({Math.floor(resumableModule.timestamp / 60)}:{(resumableModule.timestamp % 60).toString().padStart(2, '0')})</span>
                  </button>
                )}
                {isCompleted && (
                  <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                    Course Completed
                  </div>
                )}
                <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <BookmarkPlus className="h-6 w-6 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 className="h-6 w-6 text-gray-600" />
                  </button>
                  <button
                    onClick={handleOfflineToggle}
                    disabled={isDownloading}
                    className={`flex items-center px-4 py-2 rounded-full border transition-colors ${
                      isOffline
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    title={isOffline ? "Remove Offline Content" : "Download for Offline"}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-600" />
                    ) : isOffline ? (
                      <CloudOff className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <DownloadCloud className="h-5 w-5 mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {isDownloading ? "Downloading..." : isOffline ? "Available Offline" : "Download for Offline"}
                    </span>
                  </button>

                  {!isCompleted && (
                    <div className="relative">
                      <button
                        onClick={() => setShowReminderMenu(!showReminderMenu)}
                        className={`flex items-center px-4 py-2 rounded-full border transition-colors ${
                          reminderAt
                            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {reminderAt ? (
                          <BellRing className="h-5 w-5 mr-2 text-blue-600" />
                        ) : (
                          <Bell className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-sm font-medium">
                          {reminderAt ? "Reminder Set" : "Set Reminder"}
                        </span>
                      </button>

                      {showReminderMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                          {reminderAt && (
                            <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                              Currently set for:<br/>
                              <span className="font-semibold text-gray-700">
                                {new Date(reminderAt).toLocaleString(undefined, {
                                  weekday: 'short',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => handleSetReminder(1)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Remind me in 1 hour
                          </button>
                          <button
                            onClick={() => handleSetReminder(24)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Remind me tomorrow
                          </button>
                          <button
                            onClick={() => handleSetReminder(5 / 3600)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100"
                          >
                            ⚡ Test Reminder (in 5 sec)
                          </button>
                          {reminderAt && (
                            <button
                              onClick={handleCancelReminder}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                            >
                              Cancel Reminder
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-gray-500" />
                <div className="flex items-center space-x-2">
                  {course.languages.map((lang, index) => (
                    <span key={index} className="text-sm text-gray-600">
                      {lang}
                      {index < course.languages.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[400px]">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden sticky top-24">
                <div className="relative">
                  <img
                    src={course.image}
                    alt="Course Preview"
                    className="w-full h-[225px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white cursor-pointer hover:scale-110 transition-transform" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold">
                        {course.price.monthly}
                      </span>
                      <span className="text-gray-500 line-through">
                        {course.price.fullCourse}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      7-day free trial • Cancel anytime
                    </p>
                  </div>

                  <button
                    className="w-full px-4 py-3 bg-[#0056D2] text-white font-semibold rounded-sm hover:bg-blue-700 transition-colors mb-4"
                    onClick={() => handlemoduleclick()}
                  >
                    Start Free Trial
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      Shareable Certificate upon completion
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Globe className="h-5 w-5 text-green-500 mr-2" />
                      100% online and flexible schedule
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Target className="h-5 w-5 text-green-500 mr-2" />
                      Beginner-friendly, no prerequisites
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Briefcase className="h-5 w-5 text-green-500 mr-2" />
                      Real-world projects included
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Outcomes */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Career Outcomes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {course.careerOutcomes.map((outcome, index) => {
              const IconComponent = outcome.icon; // Now it's already a React component

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {IconComponent && (
                    <IconComponent className="h-8 w-8 text-[#0056D2] mb-4" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    {outcome.title}
                  </h3>
                  <p className="text-2xl font-bold text-[#0056D2]">
                    {outcome.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills You'll Gain */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Skills you'll gain</h2>
          <div className="flex flex-wrap gap-3">
            {course.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm hover:border-[#0056D2] hover:text-[#0056D2] transition-colors cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Course Content</h2>
            <div className="text-gray-600">
              <span className="font-semibold">8</span> modules •
              <span className="font-semibold"> 180+</span> hours •
              <span className="font-semibold"> 25</span> hands-on projects
            </div>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, index) => (
              <div
                key={index}
                className={`bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md
                  ${
                    selectedModule === index
                      ? "border-[#0056D2]"
                      : "border-gray-200"
                  }`}
              >
                <button
                  className="w-full p-6 text-left"
                  onClick={() =>
                    setSelectedModule(selectedModule === index ? -1 : index)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          completedModules.includes(index)
                            ? "bg-green-500 text-white"
                            : "bg-blue-50 text-[#0056D2]"
                        }`}>
                          {completedModules.includes(index) ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-lg mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {module.duration}
                        </p>
                        <p className="text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-6 w-6 text-gray-400 transform transition-transform
                        ${selectedModule === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {selectedModule === index && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                        <p className="font-semibold text-sm sm:text-base">{module.weeks} weeks</p>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Learning Hours</p>
                        <p className="font-semibold text-sm sm:text-base">{module.hours} hours</p>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Projects</p>
                        <p className="font-semibold text-sm sm:text-base">
                          {module.projects} hands-on
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">Assessments</p>
                        <p className="font-semibold text-sm sm:text-base">
                          {module.quizzes} quizzes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Learner Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {course.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                      {testimonial.author}
                    </h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-xs sm:text-sm text-[#0056D2] font-medium mt-0.5">
                      {testimonial.impact}
                    </p>
                  </div>
                </div>
                <blockquote className="text-gray-600 italic text-sm sm:text-base leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">
                  Do I need prior experience?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  No prior experience is required. This program is designed for
                  beginners and will teach you everything from the ground up.
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">
                  How long does it take to complete?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  The program typically takes 6 months to complete with 10
                  hours/week of study. You can learn at your own pace and adjust
                  the schedule to your needs.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">
                  What kind of support is available?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  You'll have access to a global learner community, course
                  mentors, and technical support throughout your learning
                  journey.
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">
                  Is the certificate recognized?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Yes, upon completion you'll receive an industry-recognized
                  certificate that you can share with prospective employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Learning CTA */}
      <div className="bg-[#0056D2] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join millions of learners worldwide and launch your high-growth career today
          </p>
          <button
            onClick={() => handlemoduleclick()}
            className="px-8 py-3.5 bg-white text-[#0056D2] font-bold rounded-md hover:bg-gray-100 transition-colors shadow-md min-h-[44px]"
          >
            Enroll Now
          </button>
        </div>
      </div>

      {/* Confetti Celebration Modal */}
      {showConfetti && (
        <div
          id="celebration-modal-overview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 cursor-pointer"
          onClick={() => setShowConfetti(false)}
        >
          <Confetti recycle={false} numberOfPieces={600} gravity={0.15} />
          <div
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-md w-full relative transform transition-all animate-bounce border-2 border-yellow-300 cursor-default max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfetti(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-300">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Great Job! 🎉</h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6">
              You've completed all modules for <span className="font-semibold text-gray-900">{course.title}</span>!
            </p>
            <button
              onClick={() => setShowConfetti(false)}
              className="w-full py-3 bg-[#0056D2] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors min-h-[44px]"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
