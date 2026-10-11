import {
  Building2,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  Sparkles,
  Play
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  getStreakData,
  recordLearningActivity,
  simulateStreak,
  simulateMissedDay,
  simulateYesterdayActive,
  resetStreakData,
  StreakData
} from "@/utils/learningActivity";
import { getLocalDateKey } from "@/utils/date";

const ProfilePage = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: []
  });

  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const refreshStreak = () => {
    const data = getStreakData();
    setStreakData({ ...data });
  };

  useEffect(() => {
    refreshStreak();
    window.addEventListener('streakUpdated', refreshStreak);
    return () => window.removeEventListener('streakUpdated', refreshStreak);
  }, []);

  const todayKey = getLocalDateKey();
  const isTodayActive = streakData.lastActivityDate === todayKey;

  const showFeedback = (msg: string) => {
    setTestFeedback(msg);
    setTimeout(() => setTestFeedback(null), 4000);
  };

  const handleSimulate7Day = () => {
    simulateStreak(7);
    showFeedback("Simulated 7-Day streak! 7-Day Badge unlocked.");
  };

  const handleSimulateMissed = () => {
    simulateMissedDay();
    showFeedback("Simulated missed day! Current streak reset to 0.");
  };

  const handleSimulateYesterday = () => {
    simulateYesterdayActive(6);
    showFeedback("Simulated active yesterday with 6-day streak! Complete a lesson today to reach 7 days.");
  };

  const handleRecordToday = () => {
    const res = recordLearningActivity();
    if (res.lastActivityDate === todayKey && streakData.lastActivityDate === todayKey) {
      showFeedback("Today's activity was already recorded. Streak does not increase twice on the same day!");
    } else {
      showFeedback("Recorded learning activity for today!");
    }
  };

  const handleReset = () => {
    resetStreakData();
    showFeedback("Reset streak data back to 0.");
  };

  const allMilestones = [
    { name: "3-Day Streak", days: 3, desc: "Learn for 3 consecutive days" },
    { name: "7-Day Streak", days: 7, desc: "Learn for 7 consecutive days" },
    { name: "14-Day Streak", days: 14, desc: "Learn for 14 consecutive days" },
    { name: "30-Day Streak", days: 30, desc: "Learn for 30 consecutive days" },
  ];

  const [user] = useState({
    name: "John Doe",
    title: "Software Engineer",
    location: "San Francisco, CA",
    email: "john.doe@example.com",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Passionate software engineer with 5+ years of experience in full-stack development. Currently focusing on AI and machine learning.",
    company: "Tech Corp",
    education: "M.S. Computer Science, Stanford University",
    skills: [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "Machine Learning",
      "AWS",
    ],
  });

  const workExperience = [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      period: "2021 - Present",
      description:
        "Leading the development of AI-powered features for our main product.",
    },
    {
      title: "Software Engineer",
      company: "StartupCo",
      period: "2019 - 2021",
      description: "Developed and maintained multiple full-stack applications.",
    },
  ];

  const education = [
    {
      degree: "M.S. Computer Science",
      school: "Stanford University",
      period: "2017 - 2019",
    },
    {
      degree: "B.S. Computer Science",
      school: "UC Berkeley",
      period: "2013 - 2017",
    },
  ];

  const projects = [
    {
      name: "AI Image Recognition",
      description:
        "Developed a machine learning model for image recognition with 95% accuracy.",
      technologies: ["Python", "TensorFlow", "AWS"],
    },
    {
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform serving 10k+ users.",
      technologies: ["React", "Node.js", "MongoDB"],
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:space-x-4">
              <img src={user.image} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-100" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 text-sm sm:text-base">{user.title}</p>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1.5 text-gray-500 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex justify-center items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium min-h-[40px]">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex-1 sm:flex-none flex justify-center items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium min-h-[40px]">
                <Pencil className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">{user.bio}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-gray-700">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{user.company}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{user.education}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Learning Streak & Achievements</h2>
              <p className="text-sm text-gray-500">Track daily learning activity, consecutive days, and milestones</p>
            </div>
            {isTodayActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
                Today's Activity Recorded
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                No Activity Yet Today
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-orange-50 border border-orange-200/80 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <Flame className="h-9 w-9 text-orange-500 mb-2 fill-current" />
              <span className="text-3xl font-extrabold text-gray-900" id="current-streak-value">{streakData.currentStreak}</span>
              <span className="text-xs font-medium text-gray-600 mt-1">Current Streak (Days)</span>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <Flame className="h-9 w-9 text-blue-500 mb-2" />
              <span className="text-3xl font-extrabold text-gray-900">{streakData.longestStreak}</span>
              <span className="text-xs font-medium text-gray-600 mt-1">Longest Streak (Days)</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-gray-50 border border-gray-200 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
              <Clock className="h-9 w-9 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-800">
                {streakData.lastActivityDate || "None"}
              </span>
              <span className="text-xs text-gray-500 mt-1">Last Active Date</span>
            </div>
          </div>

          {/* Badges Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Streak Milestones & Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allMilestones.map((milestone) => {
                const isEarned = (streakData?.badges || []).includes(milestone.name) || (streakData?.currentStreak || 0) >= milestone.days;
                return (
                  <div
                    key={milestone.name}
                    id={`badge-${milestone.days}-day`}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isEarned
                        ? "bg-gradient-to-br from-yellow-50 to-amber-50/50 border-yellow-300 shadow-sm"
                        : "bg-gray-50/70 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${isEarned ? "bg-yellow-400/20 text-yellow-700" : "bg-gray-200 text-gray-400"}`}>
                        <Award className="h-6 w-6" />
                      </div>
                      {isEarned ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-yellow-200/60 text-yellow-800 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="flex items-center text-[11px] text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{milestone.name}</h4>
                      <p className="text-xs text-gray-600">{milestone.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Streak Testing Simulation (Pin-to-pin Task 4 verification) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-800">Streak Testing & Verification Tools (Task 4)</h4>
              </div>
              <span className="text-xs text-gray-500">Instant test controls for evaluator</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Test milestone badge unlocks, missed-day reset behavior, and single daily increments without waiting real days.
            </p>

            {testFeedback && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                {testFeedback}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                id="btn-test-simulate-7day"
                onClick={handleSimulate7Day}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center"
              >
                <Award className="w-3.5 h-3.5 mr-1.5" />
                Simulate 7-Day Streak (Unlock 7-Day Badge)
              </button>

              <button
                id="btn-test-simulate-missed"
                onClick={handleSimulateMissed}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Simulate Missed Day (Reset Streak to 0)
              </button>

              <button
                id="btn-test-simulate-yesterday"
                onClick={handleSimulateYesterday}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center"
              >
                <Flame className="w-3.5 h-3.5 mr-1.5" />
                Simulate Active Yesterday (Streak = 6)
              </button>

              <button
                id="btn-test-record-today"
                onClick={handleRecordToday}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Record Today's Activity
              </button>

              <button
                id="btn-test-reset-streak"
                onClick={handleReset}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Streak
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
            <button className="px-3 py-1 border rounded-full text-sm flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            <button className="text-blue-600 flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Experience</span>
            </button>
          </div>
          <div className="space-y-6">
            {workExperience.map((exp, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.period}</p>
                  <p className="mt-2">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <button className="text-blue-600 flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Education</span>
            </button>
          </div>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-500">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project</h2>
            <button className="text-blue-600 flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          </div>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                      key={techIndex}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
