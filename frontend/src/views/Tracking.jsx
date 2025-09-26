/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { LayoutGrid, Table, Calendar, TrendingUp, CheckCircle, LogOut } from 'lucide-react';
import adminServiceInstance from '../Services/Auth';
import goatManagementService from '../Services/GoatManagement';

const Tracking = () => {
  const [trackingData, setTrackingData] = useState({ checkIns: [], checkOuts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const user = await adminServiceInstance.getProfile();
        if (user?.role !== 'Admin') {
          setError('Access denied: Only admins can view tracking.');
          setLoading(false);
          return;
        }

        const response = await goatManagementService.api.get('/goats/tracking');
        setTrackingData(response.data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, []);

  const totalGoats = trackingData.checkIns.length + trackingData.checkOuts.length;
  const todayCheckIns = trackingData.checkIns.filter(item => 
    new Date(item.date).toDateString() === new Date().toDateString()
  ).length;
  const todayCheckOuts = trackingData.checkOuts.filter(item => 
    new Date(item.date).toDateString() === new Date().toDateString()
  ).length;

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const GoatCard = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {item.goat.image ? (
              <img
                src={`http://localhost:4000/${item.goat.image}`}
                alt={item.goat.goatName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-xs text-center">No Image</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{item.goat.goatName}</h3>
            <p className="text-sm text-gray-600">{item.goat.breed}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          type === 'checkIn' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {type === 'checkIn' ? 'Check-In' : 'Check-Out'}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Admin:</span>
          <span className="font-medium">{item.admin.names}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">{new Date(item.date).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );

  const TableView = ({ data, type, title }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          {type === 'checkIn' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <LogOut className="w-5 h-5 text-red-600 mr-2" />
          )}
          {title}
        </h2>
      </div>
      
      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {type === 'checkIn' ? (
              <CheckCircle className="w-8 h-8 text-gray-400" />
            ) : (
              <LogOut className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <p>No {title.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goat Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.goat.goatName}
                      </div>
                      <div className="text-sm text-gray-500">{item.goat.breed}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.admin.names}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.goat.image ? (
                      <img
                        src={`http://localhost:4000/${item.goat.image}`}
                        alt={item.goat.goatName}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // eslint-disable-next-line react/prop-types
  const GridView = ({ data, type, title }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          {type === 'checkIn' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <LogOut className="w-5 h-5 text-red-600 mr-2" />
          )}
          {title}
        </h2>
      </div>
      
      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {type === 'checkIn' ? (
              <CheckCircle className="w-8 h-8 text-gray-400" />
            ) : (
              <LogOut className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <p>No {title.toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <GoatCard key={item.id} item={item} type={type} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Goat Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor and track goat check-ins and check-outs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Activities"
            value={totalGoats}
            icon={TrendingUp}
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Check-Ins Today"
            value={todayCheckIns}
            icon={CheckCircle}
            color="bg-green-500"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Check-Outs Today"
            value={todayCheckOuts}
            icon={LogOut}
            color="bg-red-500"
            bgColor="bg-red-50"
          />
          <StatCard
            title="Total Check-Ins"
            value={trackingData.checkIns.length}
            icon={Calendar}
            color="bg-purple-500"
            bgColor="bg-purple-50"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* Check-Ins Section */}
        <div className="mb-8">
          {viewMode === 'table' ? (
            <TableView
              data={trackingData.checkIns}
              type="checkIn"
              title="Check-Ins"
            />
          ) : (
            <GridView
              data={trackingData.checkIns}
              type="checkIn"
              title="Check-Ins"
            />
          )}
        </div>

        {/* Check-Outs Section */}
        <div>
          {viewMode === 'table' ? (
            <TableView
              data={trackingData.checkOuts}
              type="checkOut"
              title="Check-Outs"
            />
          ) : (
            <GridView
              data={trackingData.checkOuts}
              type="checkOut"
              title="Check-Outs"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;