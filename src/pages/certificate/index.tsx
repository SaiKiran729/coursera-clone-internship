import {
  Award,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Star,
} from "lucide-react";
import React from "react";

const index = () => {
  const certificates = [
    {
      id: 1,
      name: "Google Data Analytics Professional Certificate",
      provider: "Google",
      issueDate: "March 2024",
      expirationDate: "No Expiration",
      credentialID: "GDAPC-123456",
      skills: [
        "Data Analysis",
        "SQL",
        "R Programming",
        "Tableau",
        "Data Visualization",
      ],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      status: "completed",
      grade: 98,
      hours: 180,
    },
    {
      id: 2,
      name: "Meta Front-End Developer Professional Certificate",
      provider: "Meta",
      issueDate: "February 2024",
      expirationDate: "No Expiration",
      credentialID: "MFEPC-789012",
      skills: ["React", "JavaScript", "HTML", "CSS", "Web Development"],
      image:
        "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80",
      status: "completed",
      grade: 95,
      hours: 160,
    },
    {
      id: 3,
      name: "IBM Data Science Professional Certificate",
      provider: "IBM",
      issueDate: "In Progress",
      expirationDate: "-",
      credentialID: "-",
      skills: [
        "Python",
        "Machine Learning",
        "Data Science",
        "Statistical Analysis",
      ],
      image:
        "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80",
      status: "in-progress",
      progress: 75,
      hours: 120,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Track your learning achievements and verified credentials
              </p>
            </div>
            <a
              href="/search"
              className="px-5 py-2.5 bg-[#0056D2] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center shadow-xs self-start sm:self-auto min-h-[44px] flex items-center justify-center"
            >
              Browse More Courses
            </a>
          </div>
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <Award className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Total Certificates</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Learning Hours</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">460</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <Star className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Average Grade</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">96.5%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">2/3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Cards */}
        <div className="grid grid-cols-1 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 sm:h-56 md:h-auto flex-shrink-0 bg-gray-100">
                  <img
                    src={cert.image}
                    alt={cert.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{cert.name}</h2>
                        <p className="text-gray-600 text-sm font-medium mt-0.5">{cert.provider}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                        {cert.status === "completed" ? (
                          <>
                            <button className="flex items-center space-x-1.5 px-3.5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 min-h-[40px]">
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                            <button className="flex items-center space-x-1.5 px-3.5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 min-h-[40px]">
                              <ExternalLink className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </>
                        ) : (
                          <a href="/search" className="px-4 py-2 bg-[#0056D2] text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium min-h-[40px] flex items-center">
                            Continue Learning
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3.5 bg-gray-50 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Issue Date</p>
                        <p className="font-semibold text-sm text-gray-800 mt-0.5">{cert.issueDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Credential ID</p>
                        <p className="font-semibold text-sm text-gray-800 mt-0.5">{cert.credentialID}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Learning Hours</p>
                        <p className="font-semibold text-sm text-gray-800 mt-0.5">{cert.hours} hours</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {cert.status === "in-progress" ? (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
                          <span>Progress</span>
                          <span>{cert.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-[#0056D2] h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${cert.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
                          <span>Final Grade</span>
                          <span className="text-green-600 font-bold">{cert.grade}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${cert.grade}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {cert.skills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default index;
