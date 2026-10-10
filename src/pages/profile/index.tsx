import {
  Building2,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Award,
  Flame,
} from "lucide-react";
import React, { useState } from "react";

const index = () => {
  const [badges, setBadges] = React.useState<string[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [longestStreak, setLongestStreak] = React.useState(0);

  React.useEffect(() => {
    import('@/utils/learningActivity').then(({ getStreakData }) => {
      const data = getStreakData();
      setBadges(data.badges);
      setStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
    });
  }, []);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between mb-6">
            <div className="flex space-x-4">
              <img src={user.image} alt="" className="e-24 h-24 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-600">{user.title}</p>
                <div className="flex items-center space-x-2 mt-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                <Pencil className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600">{user.bio}</p>
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <span>{user.company}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <span>{user.education}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex flex-col items-center justify-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2 fill-current" />
              <span className="text-2xl font-bold text-gray-900">{streak}</span>
              <span className="text-sm text-gray-600">Current Streak</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col items-center justify-center">
              <Flame className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-2xl font-bold text-gray-900">{longestStreak}</span>
              <span className="text-sm text-gray-600">Longest Streak</span>
            </div>
          </div>

          {badges.length > 0 ? (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Earned Badges</h3>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Keep learning to earn badges!</p>
          )}
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

export default index;
