import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GoatRegistrationService from "../Services/GoatManagement";


function GoatDetail() {
  const { id } = useParams();
  const [goat, setGoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoatDetails = async () => {
      try {
    const goatData = await GoatRegistrationService.getGoatById(id);
        setGoat(goatData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGoatDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  if (!goat) return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p>No goat found with this ID</p>
    </div>
  );

  // Construct the full image URL
const imagePath = goat.image ? goat.image.replace('uploads\\goats\\', '') : '';
const fullImageUrl = goat.image 
  ? `http://localhost/GoatManagement/Backend/uploads/goats/${imagePath}`
  : <>
  no image found               
  </>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Goat Details</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={fullImageUrl} 
              alt={goat.goatName}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/300?text=No+Image+Available';
                e.target.className = "w-full h-64 object-contain bg-gray-100 p-4";
              }}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">{goat.goatName}</h2>
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  goat.status === 'checkedin' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {goat.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Information Section */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Breed</p>
                  <p className="text-gray-800">{goat.breed}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">{new Date(goat.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-gray-800">{goat.Gender}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Color</p>
                  <p className="text-gray-800">{goat.color}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-gray-800">{goat.weight} kg</p>
                </div>
              </div>
            </div>
            
            {/* Parent Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Sire (Father)</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-800">{goat.sireName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-gray-800">{goat.sireRegistrationNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Dam (Mother)</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-800">{goat.damName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-gray-800">{goat.damRegistrationNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Goat ID</p>
                <p className="text-gray-800">{goat.id}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-gray-800">{new Date(goat.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-800">{new Date(goat.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoatDetail;