import { BookOpen } from 'lucide-react'
import React from 'react'

const Fotter = () => {
  return (
    <footer className="text-black py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center text-gray-600 mb-4 sm:mb-6">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="ml-2 font-bold text-xl">Coursera</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Learn without limits and access world-class education.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Coursera</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    What We Offer
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Leadership
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Catalog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Community</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Learners
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Partners
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Developers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Beta Testers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Translators
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">More</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Investors
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2024 Coursera Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-[#0056D2] transition-colors">
                Do Not Sell My Personal Information
              </a>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Fotter