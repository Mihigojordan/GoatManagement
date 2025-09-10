import { useState, useEffect } from 'react';
import { TrendingUp, Users, LogIn, LogOut, Tag, AlertTriangle, Baby, User, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoatRegistrationService from "../Services/GoatManagement";

// Goat-themed icons to replace human icons
const GoatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M18 6h-6a6 6 0 0 0-6 6v6a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6v-6a6 6 0 0 0-6-6z" />
    <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M20 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M4 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

const AdultGoatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 3a9 9 0 0 0-9 9v9h18v-9a9 9 0 0 0-9-9z" />
    <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
    <path d="M17 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M7 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

const BabyGoatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2a7 7 0 0 0-7 7v12h14V9a7 7 0 0 0-7-7z" />
    <path d="M10 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
    <path d="M16 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

const GoatStatsCard = () => {
  const [stats, setStats] = useState({
    totalGoats: 0,
    checkedInGoats: 0,
    checkedOutGoats: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await GoatRegistrationService.getGoatCounts();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error fetching goat statistics');
        console.error('Error fetching goat stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-300 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
            <GoatIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Statistics</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const checkedInPercentage = stats.totalGoats > 0 
    ? Math.round((stats.checkedInGoats / stats.totalGoats) * 100) 
    : 0;

  // 🔹 Tags section (static numbers)
  const tagStats = [
    { label: "Total Goats", value: 206, icon: Tag, color: "blue" },
    { label: "Missing Tags", value: 5, icon: AlertTriangle, color: "red" }
  ];

  // 🔹 Goat categories section (static numbers)
  const categoryStats = [
    { label: "Male Kids", value: 33, icon: BabyGoatIcon, color: "yellow" },
    { label: "Female Kids", value: 34, icon: BabyGoatIcon, color: "pink" },
    { label: "Female Adults", value: 137, icon: AdultGoatIcon, color: "purple" },
    { label: "Male Adults", value: 2, icon: AdultGoatIcon, color: "green" },
    { label: "Deceased", value: 11, icon: Skull, color: "gray" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-teal-200 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-teal-100 bg-gradient-to-r from-teal-50 to-green-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Goat Management Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time statistics + categories</p>
          </div>
          <div className="p-3 bg-teal-100 rounded-full border border-teal-200">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Stats Sections */}
      <div className="p-6 space-y-8">
        {/* 1️⃣ Dynamic Section (from DB) */}
        <div className="p-4 border-2 border-blue-100 rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Live Tags Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center group p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors border border-blue-200">
                <GoatIcon className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGoats}</p>
              <p className="text-sm font-medium text-gray-600">Total Tags</p>
            </div>

            <div className="text-center group p-4 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors border border-green-200">
                <LogIn className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.checkedInGoats}</p>
              <p className="text-sm font-medium text-gray-600">Checked In</p>
            </div>

            <div className="text-center group p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 group-hover:bg-orange-200 transition-colors border border-orange-200">
                <LogOut className="w-7 h-7 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.checkedOutGoats}</p>
              <p className="text-sm font-medium text-gray-600">Checked Out</p>
            </div>
          </div>
        </div>

        {/* 2️⃣ Tags Section */}
        <div className="p-4 border-2 border-indigo-100 rounded-lg bg-indigo-50">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
            Tag Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tagStats.map((item, idx) => (
              <div key={idx} className={`text-center group p-4 bg-white rounded-lg border border-${item.color}-100 hover:border-${item.color}-300 transition-colors`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${item.color}-100 rounded-full mb-4 group-hover:bg-${item.color}-200 transition-colors border border-${item.color}-200`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3️⃣ Goat Categories Section */}
        <div className="p-4 border-2 border-purple-100 rounded-lg bg-purple-50">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Goat Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {categoryStats.map((item, idx) => (
              <div key={idx} className={`text-center group p-3 bg-white rounded-lg border border-${item.color}-100 hover:border-${item.color}-300 transition-colors`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-${item.color}-100 rounded-full mb-3 group-hover:bg-${item.color}-200 transition-colors border border-${item.color}-200`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs font-medium text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-2 border-teal-100 rounded-lg bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
            Attendance Rate
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Goats Checked In</span>
            <span className="text-sm font-bold text-teal-600">{checkedInPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 border border-gray-300">
            <div 
              className="bg-gradient-to-r from-teal-500 to-green-500 h-2.5 rounded-full transition-all border border-teal-200"
              style={{ width: `${checkedInPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.checkedInGoats} out of {stats.totalGoats} goats are currently checked in
          </p>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-2 border-gray-100 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 border border-teal-200">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Live Updates
            </button>
            <Link to='/dashboard/manage-goat' className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 border border-gray-200">
              View Details
            </Link>
            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 border border-blue-200">
              Add New Goat
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 border border-purple-200">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoatStatsCard;