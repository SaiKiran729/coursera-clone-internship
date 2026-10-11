import React from "react";
import {
  Code,
  Database,
  BrainCircuit,
  School,
  Trophy,
  Target,
  Server,
  Laptop,
} from "lucide-react";
import Link from "next/link";
const index = () => {
  const certificates = [
    {
      title: "IBM Back-End Development",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM Full Stack Software Developer",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM Developer",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM DevOps and Software Engineering",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const newCourses = [
    {
      id: "microsoft-front-end",
      title: "Microsoft Front-End Developer",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "microsoft-backend",
      title: "Microsoft Back-End Developer",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "microsoft-fullstack",
      title: "Microsoft Full-Stack Developer",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "microsoft-project-management",
      title: "Microsoft Project Management",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const genAICourses = [
    {
      title: "IBM Generative AI Engineering",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Agents: AI and AI Agents for Leaders",
      provider: "DeepLearning.AI",
      type: "Specialization",
      image:
        "https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Microsoft AI & ML Engineering",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=800&q=80",
    },
  ];
  const categories = [
    { icon: Code, name: "Computer Science", count: "425+ Courses" },
    { icon: Database, name: "Data Science", count: "320+ Courses" },
    { icon: BrainCircuit, name: "AI & ML", count: "280+ Courses" },
    { icon: School, name: "Business", count: "890+ Courses" },
    { icon: Trophy, name: "Personal Development", count: "215+ Courses" },
    { icon: Target, name: "Marketing", count: "190+ Courses" },
  ];

  const stats = [
    { number: "92M+", label: "Learners" },
    { number: "3,800+", label: "Courses" },
    { number: "275+", label: "Partners" },
    { number: "175+", label: "Countries" },
  ];
  return (
    <div className="overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-[#F3F4F5] py-2.5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs sm:text-sm text-center leading-relaxed">
            Learn from Adobe experts, gain graphic design skills, and build a
            portfolio that gets you noticed.
            <Link href="/search" className="text-[#0056D2] ml-1.5 font-medium hover:underline">
              Learn today!
            </Link>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center gap-8 lg:gap-12">
            <div className="w-full lg:max-w-xl text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                Learn without limits
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Start, switch, or advance your career with more than 10,000
                courses, Professional Certificates, and degrees from world-class
                universities and companies.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 justify-center lg:justify-start">
                <Link
                  href="/search"
                  className="px-6 py-3.5 bg-[#0056D2] text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-center shadow-xs min-h-[44px] flex items-center justify-center"
                >
                  Join for Free
                </Link>
                <Link
                  href="/search"
                  className="px-6 py-3.5 border border-[#0056D2] text-[#0056D2] font-semibold rounded-md hover:bg-blue-50 transition-colors text-center min-h-[44px] flex items-center justify-center"
                >
                  Try Coursera for Business
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-auto flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Student"
                className="w-full max-w-sm sm:max-w-md lg:max-w-[500px] h-auto rounded-xl shadow-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Certificates */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Most Popular Certificates</h2>
            <div className="flex space-x-3">
              <Link href="/search" className="px-4 py-2 border border-gray-300 text-[#0056D2] font-semibold rounded-md hover:bg-blue-50 text-sm transition-colors">
                Show more
              </Link>
              <Link href="/search" className="px-4 py-2 text-[#0056D2] font-semibold text-sm hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificates.map((cert, index) => (
              <Link
                key={index}
                href="/search"
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col bg-white group"
              >
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center mb-2">
                    <Server className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {cert.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-auto">{cert.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Get started with GenAI */}
      <div className="bg-[#F3F4F5] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
                Get started with GenAI
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Identify, develop, and execute impactful GenAI business
                strategies.
              </p>
            </div>
            <Link href="/search?q=AI" className="px-4 py-2 text-[#0056D2] font-semibold text-sm hover:underline self-start sm:self-auto">
              View all GenAI
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {genAICourses.map((course, index) => (
              <Link
                key={index}
                href="/search?q=AI"
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col group"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center mb-2">
                    <BrainCircuit className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {course.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-auto">{course.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* New on Coursera */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">New on Coursera</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Explore our newest programs, focused on delivering in-demand
                skills.
              </p>
            </div>
            <Link href="/search" className="px-4 py-2 text-[#0056D2] font-semibold text-sm hover:underline self-start sm:self-auto">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newCourses.map((course, index) => (
              <Link
                key={index}
                href={`/course/${course.id}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col bg-white group"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center mb-2">
                    <Laptop className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {course.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-auto">{course.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Top Categories */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
            Explore Top Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/search?q=${encodeURIComponent(category.name)}`}
                className="flex items-center p-4 sm:p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-blue-50 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
                  <category.icon className="h-6 w-6 sm:h-7 sm:w-7 text-[#0056D2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-[#0056D2] transition-colors">{category.name}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-[#0056D2] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Join the World's Largest Learning Platform
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Transform your life through education
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-2">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-blue-100 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
