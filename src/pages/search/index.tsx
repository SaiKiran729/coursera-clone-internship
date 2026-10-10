import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { courses } from '@/Components/data/constant';
import { Search, Laptop, FilterX, X } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Initialize query from URL on load
  useEffect(() => {
    if (router.isReady && router.query.q) {
      setQuery(router.query.q as string);
    }
  }, [router.isReady, router.query.q]);

  // Update URL silently without reload
  useEffect(() => {
    if (router.isReady) {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [query, router.isReady]);

  // Extract all unique skills to use as tags
  const allTags = useMemo(() => {
    const skills = new Set<string>();
    courses.forEach(course => {
      course.skills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearSearch = () => setQuery("");
  const clearFilters = () => setSelectedTags([]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const searchLower = query.toLowerCase().trim();
      
      const searchMatch = !searchLower || 
        (course.title && course.title.toLowerCase().includes(searchLower)) || 
        (course.description && course.description.toLowerCase().includes(searchLower)) ||
        (course.modules && course.modules.some(m => m.description && m.description.toLowerCase().includes(searchLower)));
        
      const tagMatch = selectedTags.length === 0 || 
        selectedTags.every(tag => course.skills && course.skills.includes(tag));
        
      return searchMatch && tagMatch;
    });
  }, [query, selectedTags]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>Search Courses - Coursera Clone</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Explore Courses</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                {selectedTags.length > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Results */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center border border-gray-200">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search by course title or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
              {query && (
                <button onClick={clearSearch} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> results
              </p>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}`}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col h-full group"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center mb-3">
                        <Laptop className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="text-sm text-gray-600 font-medium">
                          {course.provider}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {course.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {skill}
                            </span>
                          ))}
                          {course.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{course.skills.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{course.type}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any courses matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={() => {
                    clearSearch();
                    clearFilters();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
