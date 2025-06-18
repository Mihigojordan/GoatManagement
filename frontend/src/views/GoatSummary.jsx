import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        const response = await fetch('http://localhost:3000/goats/counts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch goat statistics');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching goat stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Optional: Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐐</span>
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Goat Management Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time statistics</p>
          </div>
          <div className="p-3 bg-teal-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Goats */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <span className="text-2xl">🐐</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.totalGoats}</p>
              <p className="text-sm font-medium text-gray-600">Total Goats</p>
              <p className="text-xs text-gray-500">Registered in system</p>
            </div>
          </div>

          {/* Checked In */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.checkedInGoats}</p>
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-xs text-gray-500">Currently present</p>
            </div>
          </div>

          {/* Checked Out */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 group-hover:bg-orange-200 transition-colors duration-200">
              <span className="text-2xl">🔴</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.checkedOutGoats}</p>
              <p className="text-sm font-medium text-gray-600">Checked Out</p>
              <p className="text-xs text-gray-500">Currently away</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
            <span className="text-sm font-bold text-teal-600">{checkedInPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-teal-500 to-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${checkedInPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.checkedInGoats} out of {stats.totalGoats} goats are currently checked in
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition-colors duration-200">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Live Updates
            </button>
            <Link to='/dashboard/manage-goat' className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoatStatsCard;