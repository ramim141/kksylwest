"use client"

import { useState, useEffect } from "react"
import {
  HiAcademicCap,
  HiTrophy,
  HiCheckBadge,
  HiSparkles,
  HiChevronDown,
  HiChevronUp,
  HiBuildingOffice2,
} from "react-icons/hi2"

const ResultList = () => {
  const [groupedData, setGroupedData] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchRoll, setSearchRoll] = useState("")
  const [selectedClass, setSelectedClass] = useState('all')
  const [expandedClasses, setExpandedClasses] = useState(new Set())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [bestStudents, setBestStudents] = useState([])

  // Convert English numbers to Bengali
  const toBengaliNumber = (num) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return num.toString().split('').map(digit => bengaliDigits[digit] || digit).join('')
  }

  useEffect(() => {
    fetch("/results.json")
      .then((res) => res.json())
      .then((data) => {
        const groups = {}
        const bestList = []

        data.forEach((student) => {
          const className = `শ্রেণি ${student.class}`

          if (!groups[className]) {
            groups[className] = { count: 0, categories: {} }
          }

          let categoryName = student.category
          if (categoryName.toLowerCase().includes("talent")) categoryName = "ট্যালেন্টপুল"
          else if (categoryName.toLowerCase().includes("genral") || categoryName.toLowerCase().includes("general"))
            categoryName = "সাধারণ"
          else if (categoryName.toLowerCase().includes("normal")) categoryName = "সাধারণ"
          else if (categoryName.toLowerCase().includes("special")) categoryName = "বিশেষ"
          else if (categoryName.includes("শ্রেণিভিত্তিক সেরা")) {
            categoryName = "শ্রেণিভিত্তিক সেরা"
            // Add to best students list
            bestList.push(student)
          }

          if (!groups[className].categories[categoryName]) {
            groups[className].categories[categoryName] = []
          }

          groups[className].categories[categoryName].push(student.roll)
          groups[className].count += 1
        })

        setGroupedData(groups)
        setBestStudents(bestList)
        // Expand all classes by default
        setExpandedClasses(new Set(Object.keys(groups)))
        setLoading(false)
      })
      .catch((err) => console.error("Failed to load list", err))
  }, [])

  const filterRolls = (rolls) => {
    if (!searchRoll) return rolls
    return rolls.filter((roll) => roll.toString().includes(searchRoll))
  }

  const toggleClass = (className) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(className)) {
        newSet.delete(className)
      } else {
        newSet.add(className)
      }
      return newSet
    })
  }

  const totalStudents = Object.values(groupedData).reduce((sum, cls) => sum + cls.count, 0)
  const totalExaminees = 7350
  
  // Calculate category-wise totals
  const talentCount = Object.values(groupedData).reduce((sum, cls) => {
    return sum + (cls.categories['ট্যালেন্টপুল']?.length || 0)
  }, 0)
  
  const generalCount = Object.values(groupedData).reduce((sum, cls) => {
    return sum + (cls.categories['সাধারণ']?.length || 0)
  }, 0)
  
  const specialCount = Object.values(groupedData).reduce((sum, cls) => {
    return sum + (cls.categories['বিশেষ']?.length || 0)
  }, 0)
  
  const bestCount = bestStudents.length

  // ---------- SORTING LOGIC START ----------
  const bengaliToEnglish = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return str.split('').map(char => {
      const index = bengaliDigits.indexOf(char)
      return index !== -1 ? index.toString() : char
    }).join('')
  }
  

  const classData = Object.keys(groupedData).sort((a, b) => {
    const numA = parseInt(bengaliToEnglish(a).match(/\d+/)?.[0] || '0')
    const numB = parseInt(bengaliToEnglish(b).match(/\d+/)?.[0] || '0')
    return numA - numB 
  })
  // ---------- SORTING LOGIC END ----------

  // Filter classes based on selection - if 'best' is selected, filter to show only classes with 'শ্রেণিভিত্তিক সেরা' category
  const filteredClasses = selectedClass === 'all' 
    ? classData 
    : selectedClass === 'best'
    ? classData.filter(className => groupedData[className].categories['শ্রেণিভিত্তিক সেরা'])
    : classData.filter(c => c === selectedClass)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 rounded-full border-emerald-500/20" />
            <div className="absolute inset-0 border-2 border-transparent rounded-full border-t-emerald-500 animate-spin" />
            <HiTrophy className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-emerald-500 top-1/2 left-1/2" />
          </div>
          <p className="text-xl font-medium text-gray-900">ফলাফল লোড হচ্ছে...</p>
          <p className="mt-2 text-sm text-gray-500">অনুগ্রহ করে অপেক্ষা করুন</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-gray-900 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 border-emerald-500">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute rounded-full -top-40 -left-40 w-96 h-96 bg-emerald-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-6xl px-4 py-16 mx-auto md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-semibold tracking-wider text-white uppercase border rounded-full shadow-lg bg-white/20 backdrop-blur-sm border-white/30">
              <HiSparkles className="w-4 h-4" />
              <span>২০২৫ সালের ফলাফল</span>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">কিশোরকণ্ঠ মেধাবৃত্তি</h1>
            <p className="max-w-xl mx-auto text-lg text-white/90 drop-shadow-md">শ্রেণি ভিত্তিক উত্তীর্ণ শিক্ষার্থীদের সম্পূর্ণ তালিকা</p>

            <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mt-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl">
                  <HiAcademicCap className="text-white w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(totalExaminees)}</p>
                <p className="text-sm text-white/80">মোট পরীক্ষার্থী</p>
              </div>
              
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl">
                  <HiTrophy className="text-white w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(totalStudents)}</p>
                <p className="text-sm text-white/80">মেধাবৃত্তি প্রাপ্ত</p>
              </div>
              
              {/* Talent pool scholarship total student number */}
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl">
                  <HiSparkles className="text-white w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(talentCount)}</p>
                <p className="text-sm text-white/80">ট্যালেন্টপুল</p>
              </div>
              
              {/* General scholarship total student number */}
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl">
                  <HiCheckBadge className="text-white w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(generalCount)}</p>
                <p className="text-sm text-white/80">সাধারণ</p>
              </div>

              {/* Special scholarship total student number */}
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-400/30 rounded-xl">
                  <HiSparkles className="text-purple-200 w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(specialCount)}</p>
                <p className="text-sm text-white/80">বিশেষ</p>
              </div>

              {/* Best per class scholarship total student number */}
              <div className="p-6 transition-all duration-300 border shadow-xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:bg-white/20 hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-400/30 rounded-xl">
                  <HiTrophy className="text-yellow-200 w-7 h-7" />
                </div>
                <p className="mb-1 text-3xl font-bold text-white md:text-4xl">{toBengaliNumber(bestCount)}</p>
                <p className="text-sm text-white/80">শ্রেণিভিত্তিক সেরা</p>
              </div>
              
              
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl px-4 py-12 mx-auto">
        
        {/* Class Filter Tabs - Desktop: Tabs, Mobile: Dropdown */}
        
        {/* Mobile Dropdown */}
        <div className="mb-10 md:hidden">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full px-6 py-4 transition-all duration-300 bg-white border-2 border-gray-200 shadow-lg rounded-xl hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <HiAcademicCap className="w-6 h-6 text-emerald-600" />
                <span className="text-base font-bold text-gray-900">
                  {selectedClass === 'all' ? 'সকল শ্রেণি' : selectedClass === 'best' ? 'শ্রেনিভিত্তিক সেরা' : selectedClass}
                </span>
              </div>
              {isDropdownOpen ? (
                <HiChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <HiChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl top-full rounded-xl max-h-80">
                <button
                  onClick={() => {
                    setSelectedClass('all')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
                    selectedClass === 'all'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 text-gray-700'
                  }`}
                >
                  <HiCheckBadge className={`w-5 h-5 ${selectedClass === 'all' ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="font-bold">সকল শ্রেণি</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedClass('best')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 border-t border-gray-100 ${
                    selectedClass === 'best'
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                      : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-gray-700'
                  }`}
                >
                  <HiTrophy className={`w-5 h-5 ${selectedClass === 'best' ? 'text-white' : 'text-yellow-600'}`} />
                  <span className="font-bold">শ্রেনিভিত্তিক সেরা</span>
                </button>
                
                {classData.map((className, index) => {
                  const colors = [
                    { from: 'from-blue-600', to: 'to-cyan-600', light: 'from-blue-50 to-cyan-50', icon: 'text-blue-600' },
                    { from: 'from-purple-600', to: 'to-pink-600', light: 'from-purple-50 to-pink-50', icon: 'text-purple-600' },
                    { from: 'from-emerald-600', to: 'to-teal-600', light: 'from-emerald-50 to-teal-50', icon: 'text-emerald-600' },
                    { from: 'from-orange-600', to: 'to-red-600', light: 'from-orange-50 to-red-50', icon: 'text-orange-600' },
                    { from: 'from-indigo-600', to: 'to-purple-600', light: 'from-indigo-50 to-purple-50', icon: 'text-indigo-600' },
                  ][index % 5];

                  return (
                    <button
                      key={className}
                      onClick={() => {
                        setSelectedClass(className)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 border-t border-gray-100 ${
                        selectedClass === className
                          ? `bg-gradient-to-r ${colors.from} ${colors.to} text-white`
                          : `hover:bg-gradient-to-r hover:${colors.light} text-gray-700`
                      }`}
                    >
                      <HiAcademicCap className={`w-5 h-5 ${selectedClass === className ? 'text-white' : colors.icon}`} />
                      <span className="font-bold">{className}</span>
                      {selectedClass === className && (
                        <HiCheckBadge className="w-5 h-5 ml-auto text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="items-center justify-center hidden gap-3 mb-10 md:flex md:flex-wrap">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-6 py-3 font-bold text-base rounded-xl transition-all duration-300 shadow-md ${
              selectedClass === 'all'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105 shadow-emerald-500/30'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'
            }`}
          >
            সকল শ্রেণি
          </button>
          
          <button
            onClick={() => setSelectedClass('best')}
            className={`px-6 py-3 font-bold text-base rounded-xl transition-all duration-300 shadow-md ${
              selectedClass === 'best'
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg scale-105 shadow-yellow-500/30'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-500 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50'
            }`}
          >
            শ্রেনিভিত্তিক সেরা
          </button>
          
          {classData.map((className, index) => {
            const colors = [
              'from-blue-600 to-cyan-600',
              'from-purple-600 to-pink-600',
              'from-emerald-600 to-teal-600',
              'from-orange-600 to-red-600',
              'from-indigo-600 to-purple-600',
            ][index % 5];

            return (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-6 py-3 font-bold text-base rounded-xl transition-all duration-300 shadow-md ${
                  selectedClass === className
                    ? `bg-gradient-to-r ${colors} text-white shadow-lg scale-105 shadow-${colors.split('-')[1]}-500/30`
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'
                }`}
              >
                {className}
              </button>
            );
          })}
        </div>

        {/* Class Accordion Cards */}
        {selectedClass === 'best' ? (
          /* Best Students Table */
          <div className="overflow-hidden bg-white border-2 border-gray-200 shadow-2xl rounded-2xl">
            {/* Table Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-yellow-500 to-orange-600">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center justify-center shadow-2xl w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl">
                  <HiTrophy className="w-8 h-8 text-white md:w-10 md:h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white md:text-3xl drop-shadow-lg">শ্রেণিভিত্তিক সেরা শিক্ষার্থী</h2>
                  <p className="mt-1 text-sm font-medium md:text-base text-white/90">প্রতি শ্রেণির সর্বোচ্চ নম্বর প্রাপ্ত</p>
                </div>
              </div>
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-sm font-black tracking-wider text-left text-gray-700 uppercase">রোল নং</th>
                    <th className="px-6 py-5 text-sm font-black tracking-wider text-left text-gray-700 uppercase">নাম</th>
                    <th className="px-6 py-5 text-sm font-black tracking-wider text-left text-gray-700 uppercase">শিক্ষা প্রতিষ্ঠান</th>
                    <th className="px-6 py-5 text-sm font-black tracking-wider text-left text-gray-700 uppercase">শ্রেণি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bestStudents
                    .sort((a, b) => {
                      const classA = parseInt(bengaliToEnglish(a.class).match(/\d+/)?.[0] || '0')
                      const classB = parseInt(bengaliToEnglish(b.class).match(/\d+/)?.[0] || '0')
                      return classA - classB
                    })
                    .map((student, index) => (
                      <tr key={student.roll} className="transition-all duration-300 group hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                              <span className="text-sm font-bold text-white">{toBengaliNumber(index + 1)}</span>
                            </div>
                            <span className="text-base font-bold text-gray-900">{toBengaliNumber(student.roll)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-base font-bold text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-base font-semibold text-gray-700">{student.school}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-yellow-700 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full shadow-sm border border-yellow-200">
                            <HiAcademicCap className="w-4 h-4" />
                            {student.class}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Complete Info */}
            <div className="block p-4 space-y-4 bg-gray-50 md:hidden">
              {bestStudents
                .sort((a, b) => {
                  const classA = parseInt(bengaliToEnglish(a.class).match(/\d+/)?.[0] || '0')
                  const classB = parseInt(bengaliToEnglish(b.class).match(/\d+/)?.[0] || '0')
                  return classA - classB
                })
                .map((student, index) => (
                  <div key={`mobile-${student.roll}`} className="overflow-hidden transition-all duration-300 bg-white border-2 border-gray-200 shadow-lg rounded-2xl hover:shadow-xl">
                    {/* Card Header with Trophy */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500 to-orange-600">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 shadow-lg bg-white/20 backdrop-blur-sm rounded-xl">
                        <span className="text-lg font-black text-white">{toBengaliNumber(index + 1)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-yellow-700 bg-white rounded-full shadow-md">
                          <HiAcademicCap className="w-3.5 h-3.5" />
                          {student.class}
                        </span>
                      </div>
                      <HiTrophy className="w-8 h-8 text-white/90" />
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Roll Number */}
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                        <span className="text-xs font-semibold text-gray-500">রোল নং:</span>
                        <span className="text-lg font-black text-gray-900">{toBengaliNumber(student.roll)}</span>
                      </div>
                      
                      {/* Name */}
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-500">শিক্ষার্থীর নাম</p>
                        <p className="text-base font-bold text-gray-900">{student.name}</p>
                      </div>
                      
                      {/* School */}
                      <div className="pt-2">
                        <p className="mb-1 text-xs font-semibold text-gray-500">শিক্ষা প্রতিষ্ঠান</p>
                        <div className="flex items-start gap-2">
                          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
                            <HiBuildingOffice2 className="w-4 h-4 text-white" />
                          </div>
                          <p className="flex-1 text-base font-bold leading-snug text-gray-900">{student.school}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-center gap-2">
                <HiCheckBadge className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-bold text-gray-700">মোট {toBengaliNumber(bestStudents.length)} জন সেরা শিক্ষার্থী</span>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Class Accordion */
          <div className="space-y-6">
            {filteredClasses.map((className) => {
            const isExpanded = expandedClasses.has(className)

            return (
              <div key={className} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                {/* Class Header - Clickable */}
                <button
                  onClick={() => toggleClass(className)}
                  className="flex items-center justify-between w-full p-6 transition-all duration-300 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 hover:from-emerald-100/70 hover:to-teal-100/70"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center shadow-lg w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                      <HiAcademicCap className="text-white w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{className}</h2>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <HiCheckBadge className="w-4 h-4 text-emerald-600" />
                        {toBengaliNumber(groupedData[className].count)} জন উত্তীর্ণ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full shadow-sm">
                      <HiSparkles className="w-3.5 h-3.5" />
                      {toBengaliNumber(Object.keys(groupedData[className].categories).length)} ক্যাটেগরি
                    </span>
                    {isExpanded ? (
                      <HiChevronUp className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <HiChevronDown className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50/50 to-white">
                    {Object.keys(groupedData[className].categories)
                      .filter(cat => selectedClass === 'best' ? cat === 'শ্রেণিভিত্তিক সেরা' : true)
                      .map((cat) => {
                      const allRolls = groupedData[className].categories[cat]
                      const filteredRolls = filterRolls(allRolls)

                      return (
                        <div key={cat} className="p-6 border-b border-gray-200 md:p-8 last:border-b-0">
                          {/* Category Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600" />
                              <h3 className="text-lg font-bold text-gray-900 md:text-xl">{cat}</h3>
                              <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-sm text-emerald-700 bg-gradient-to-r from-emerald-100 to-teal-100">
                                {toBengaliNumber(filteredRolls.length)} জন
                              </span>
                            </div>
                            {searchRoll && filteredRolls.length === 0 && (
                              <span className="text-sm font-semibold text-red-500">ফলাফল নেই</span>
                            )}
                          </div>

                          {/* Roll Numbers Grid */}
                          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                            {filteredRolls
                              .sort((a, b) => a - b)
                              .map((roll) => {
                                const isHighlighted = searchRoll && roll.toString().includes(searchRoll)

                                return (
                                  <div
                                    key={roll}
                                    className={`relative px-3 py-3 text-center rounded-xl text-sm font-semibold transition-all duration-300 ${
                                      isHighlighted
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40 scale-110 animate-pulse"
                                        : "bg-white text-gray-900 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg hover:scale-105"
                                    }`}
                                  >
                                    {toBengaliNumber(roll)}
                                    {isHighlighted && (
                                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-ping" />
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold border-2 rounded-full shadow-lg text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <HiCheckBadge className="w-5 h-5 text-emerald-600" />
            <span>সকল তথ্য সঠিক এবং যাচাইকৃত</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default ResultList