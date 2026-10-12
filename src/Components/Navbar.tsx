import { BookOpen, ChevronDown, Globe, Search, Flame, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { getStreakData } from "@/utils/learningActivity";

const Navbar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [streak, setStreak] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const updateStreak = () => {
      try {
        setStreak(getStreakData().currentStreak);
      } catch (e) {
        console.warn("Could not read streak data in Navbar", e);
      }
    };
    updateStreak();
    window.addEventListener('streakUpdated', updateStreak);
    return () => window.removeEventListener('streakUpdated', updateStreak);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const executeSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const [user, setuser] = useState<{
    name: string;
    email: string;
    image: string;
  } | null>(null);
  const [isloggedin, setisloggedin] = useState(false);
  const [issearchfocused, setissearchfocused] = useState(false);
  const [isexploremenuopen, setisexploremenuopen] = useState(false);
  const [isdegreemenuopen, setisdegreemenuopen] = useState(false);
  const [isusermenuopen, setisusermenuopen] = useState(false);
  const topNav = [
    "For Individuals",
    "For Businesses",
    "For Universities",
    "For Governments",
  ];

  const exploreMenuItems = [
    {
      category: "Goals",
      items: [
        {
          title: "Take a Free Course",
          description: "Learn from top universities for free",
        },
        {
          title: "Earn a Degree",
          description: "Get a degree from a top university",
        },
        {
          title: "Earn a Certificate",
          description: "Professional certificates from companies",
        },
        {
          title: "Advance Your Career",
          description: "Learn skills to boost your career",
        },
      ],
    },
    {
      category: "Subjects",
      items: [
        {
          title: "Data Science",
          description: "Learn data analysis and visualization",
        },
        {
          title: "Business",
          description: "Develop business management skills",
        },
        {
          title: "Computer Science",
          description: "Learn programming and software development",
        },
        {
          title: "Information Technology",
          description: "Master IT and cloud computing",
        },
      ],
    },
  ];

  const degreesMenuItems = [
    { title: "Bachelor's Degrees", count: "15+ Degrees" },
    { title: "Master's Degrees", count: "25+ Degrees" },
    { title: "Graduate Certificates", count: "10+ Certificates" },
    { title: "Professional Degrees", count: "5+ Degrees" },
  ];

  const handlegooglesignin = () => {
    setisloggedin(true);
    setuser({
      name: "John Doe",
      email: "Johnn.doe@example.com",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=48&h=48&q=80",
    });
  };
  const handlelogout = () => {
    setisloggedin(false);
    setuser(null);
  };
  return (
    <>
      {/* Top Banner (English & Quick Links) */}
      <div className="bg-[#1F2937] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-4">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-300">English</span>
            </div>
            <div className="hidden lg:flex space-x-6">
              {topNav.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-xs sm:text-sm hover:text-gray-300 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b sticky top-0 bg-white z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">
            {/* Left: Mobile Menu Toggle + Logo + Desktop Explore */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                type="button"
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <Link href="/" className="flex items-center text-[#0056D2] hover:opacity-90 transition-opacity flex-shrink-0">
                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8" />
                <span className="ml-1.5 sm:ml-2 font-bold text-lg sm:text-xl tracking-tight">
                  Course
                </span>
              </Link>

              {/* Desktop Explore Menu */}
              <div className="relative hidden md:block">
                <button
                  className="text-[#0056D2] font-semibold flex items-center hover:opacity-80 transition-opacity px-2 py-1.5"
                  onClick={() => {
                    setisexploremenuopen(!isexploremenuopen);
                    setisdegreemenuopen(false);
                  }}
                >
                  Explore
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                      isexploremenuopen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isexploremenuopen && (
                  <div className="absolute top-full left-0 w-[550px] lg:w-[600px] bg-white shadow-xl rounded-lg mt-2 p-6 grid grid-cols-2 gap-8 border border-gray-100 z-50">
                    {exploreMenuItems.map((section, index) => (
                      <div key={index}>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                          {section.category}
                        </h3>
                        <div className="space-y-3">
                          {section.items.map((item, itemIndex) => (
                            <Link key={itemIndex} href={`/search?q=${encodeURIComponent(item.title)}`} className="block group">
                              <div className="text-gray-900 font-medium text-sm group-hover:text-[#0056D2]">
                                {item.title}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {item.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className={`w-full pl-10 pr-4 py-2 border rounded-full text-sm transition-all duration-200 ${
                    issearchfocused
                      ? "border-[#0056D2] ring-2 ring-blue-100 shadow-xs"
                      : "border-gray-300"
                  }`}
                  onFocus={() => setissearchfocused(true)}
                  onBlur={() => setissearchfocused(false)}
                />
                <Search
                  className={`absolute left-3.5 top-2.5 h-4 w-4 transition-colors duration-200 cursor-pointer ${
                    issearchfocused ? "text-[#0056D2]" : "text-gray-400"
                  }`}
                  onClick={executeSearch}
                />
              </div>
            </div>

            {/* Right: Streak Badge + Desktop Degree Menu + Auth Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Responsive Streak Badge */}
              <Link
                href="/profile"
                id="navbar-streak-badge"
                className={`flex items-center space-x-1 sm:space-x-1.5 font-bold px-2.5 sm:px-3 py-1.5 rounded-full border transition-all text-xs sm:text-sm min-h-[36px] ${
                  streak > 0
                    ? "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-xs"
                    : "text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200"
                }`}
                title={streak > 0 ? `Current Streak: ${streak} Days` : "Start your daily learning streak!"}
              >
                <Flame className={`w-4 h-4 flex-shrink-0 ${streak > 0 ? "fill-current text-orange-500" : "text-gray-400"}`} />
                <span className="hidden sm:inline">{streak > 0 ? `${streak} Day Streak` : '0 Day Streak'}</span>
                <span className="sm:hidden font-extrabold">{streak}d</span>
              </Link>

              {/* Desktop Degree Menu */}
              <div className="relative hidden lg:block">
                <button
                  className="text-[#0056D2] font-semibold hover:opacity-80 transition-opacity flex items-center px-2 py-1.5"
                  onClick={() => {
                    setisdegreemenuopen(!isdegreemenuopen);
                    setisexploremenuopen(false);
                  }}
                >
                  Online Degree
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                      isdegreemenuopen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isdegreemenuopen && (
                  <div className="absolute top-full right-0 w-[280px] bg-white shadow-xl rounded-lg mt-2 p-3 border border-gray-100 z-50">
                    {degreesMenuItems.map((item, index) => (
                      <Link
                        key={index}
                        href="/search"
                        className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-md group text-sm"
                      >
                        <span className="text-gray-900 group-hover:text-[#0056D2]">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu / Auth Controls */}
              {isloggedin ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] justify-center"
                    onClick={() => setisusermenuopen(!isusermenuopen)}
                    aria-label="User Account Menu"
                  >
                    <img
                      src={user?.image}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-600 transition-transform duration-200 ${
                        isusermenuopen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {isusermenuopen && (
                    <div className="absolute top-full right-0 w-[240px] bg-white shadow-xl rounded-lg mt-2 py-2 border border-gray-100 z-50">
                      <Link href="/profile" className="block" onClick={() => setisusermenuopen(false)}>
                        <div className="px-4 py-3 border-b hover:bg-gray-50 transition">
                          <div className="font-semibold text-gray-900 text-sm">
                            {user?.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setisusermenuopen(false)}
                      >
                        My Profile & Badges
                      </Link>
                      <Link
                        href="/certificate"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setisusermenuopen(false)}
                      >
                        My Certificates
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                        onClick={() => {
                          handlelogout();
                          setisusermenuopen(false);
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={handlegooglesignin}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-1.5 min-h-[40px]"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="google"
                      className="w-3.5 h-3.5"
                    />
                    <span className="hidden md:inline">Sign in with Google</span>
                    <span className="md:hidden">Sign in</span>
                  </button>
                  <button
                    onClick={handlegooglesignin}
                    className="px-3.5 py-2 bg-[#0056D2] text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors min-h-[40px]"
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Input (Visible on mobile/small screens) */}
          <div className="md:hidden pb-3 pt-1">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search courses, skills, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#0056D2] focus:outline-none transition-colors"
              />
              <Search
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={executeSearch}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white max-h-[calc(100vh-8rem)] overflow-y-auto px-4 py-4 space-y-5 shadow-lg animate-in fade-in duration-200">
            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Explore & Learn</h3>
              <div className="space-y-1">
                <Link
                  href="/search"
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Courses & Certifications
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Learning Streak & Badges</span>
                  <span className="text-orange-500 font-bold text-xs bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {streak} Days
                  </span>
                </Link>
                <Link
                  href="/certificate"
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Certificates
                </Link>
              </div>
            </div>

            {/* Popular Topics */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Computer Science", "Data Science", "AI & ML", "Business"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/search?q=${encodeURIComponent(cat)}`}
                    className="px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-xs font-medium text-gray-700 hover:text-blue-600 text-center transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-2 border-t border-gray-100">
              {isloggedin ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <img src={user?.image} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handlelogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      handlegooglesignin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 flex items-center justify-center space-x-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                  <button
                    onClick={() => {
                      handlegooglesignin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#0056D2] hover:bg-blue-700 rounded-lg"
                  >
                    Join for Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
