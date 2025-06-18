import React, { useState, useEffect } from "react";
import { X, Heart, Eye, Calendar, Camera, User, Edit, Trash2,UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import GoatRegistrationService from "../Services/GoatManagement";

const GoatRegistrationManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [ageInMonths, setAgeInMonths] = useState(null);


  const [formData, setFormData] = useState({
    // Basic Identification Details matching your model
    goatName: "",
    breed: "",
    dateOfBirth: "",
    Gender: "",
    color: "",
    weight: "",
    note: "",

    sireRegistrationNumber: "",

    damRegistrationNumber: "",

    // Image will be sent as file, not in formData
  });

  // Status options based on your model
  const statusOptions = [
    { value: "checkedin", label: "Checked In", color: "bg-green-100 text-green-800" },
    { value: "checkedout", label: "Checked Out", color: "bg-yellow-100 text-yellow-800" },
    { value: "sold", label: "Sold", color: "bg-blue-100 text-blue-800" },
    { value: "sick", label: "Sick", color: "bg-red-100 text-red-800" }
  ];







  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await GoatRegistrationService.getGoats();
      setRegistrations(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to fetch goat registrations");
    }
  };

 const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store actual file for backend
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShowModal = (registration = null) => {
    setCurrentRegistration(registration);
    setImagePreview(registration?.image || null);
    setImageFile(null);
    setFormData(
      registration
        ? {
            goatName: registration.goatName || "",
            breed: registration.breed || "",
            dateOfBirth: registration.dateOfBirth ? registration.dateOfBirth.split('T')[0] : "",
            Gender: registration.Gender || "",
            color: registration.color || "",
            weight: registration.weight || "",
            sireRegistrationNumber: registration.sireRegistrationNumber || "",
            damRegistrationNumber: registration.damRegistrationNumber || "",
            note:registration.note || "",

      }
        : {
            goatName: "",
            breed: "",
            dateOfBirth: "",
            Gender: "",
            color: "",
            weight: "",
            note: "",
            sireRegistrationNumber: "",
            damRegistrationNumber: "",
          }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentRegistration(null);
    setShowModal(false);
    setImagePreview(null);
    setImageFile(null);
  };

const handleFormChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === 'dateOfBirth') {
    const birthDate = new Date(value);
    const now = new Date();
    const months =
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    setAgeInMonths(months >= 0 ? months : 0); // Prevent negative values
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If there's an image file, use FormData for multipart upload
      if (imageFile) {
        const submitFormData = new FormData();
        
        // Append all form fields to FormData
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== "") {
            if (key === 'weight') {
              submitFormData.append(key, parseFloat(formData[key]).toString());
            } else if (key === 'dateOfBirth') {
              submitFormData.append(key, new Date(formData[key]).toISOString());
            } else {
              submitFormData.append(key, formData[key].toString());
            }
          }
        });

        // Append image file
        submitFormData.append('image', imageFile, imageFile.name);

        if (currentRegistration) {
          await GoatRegistrationService.updateGoat(currentRegistration.id, submitFormData);
        } else {
          await GoatRegistrationService.registerGoat(submitFormData);
        }
      } else {
        // No image file, send as regular JSON
        const submitData = {
          ...formData,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
        };

        if (currentRegistration) {
          await GoatRegistrationService.updateGoat(currentRegistration.id, submitData);
        } else {
          await GoatRegistrationService.registerGoat(submitData);
        }
      }
      
      await loadRegistrations();
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };


  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : "bg-red-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-sm text-gray-600">Loading goat registrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Goat Registration Management</h3>
        <button
          onClick={() => handleShowModal()}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 flex items-center gap-2"
        >
          
          Register New Goat
        </button>
      </div>

      {/* Desktop Table View - Reduced padding */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 max-h-[600px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Image</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Farm Name</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Breed</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Gender</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">DOB</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Weight</th>

      <th className="px-2 py-2 text-center font-semibold text-gray-700">Color</th>
              
    

              <th className="px-2 py-2 text-center font-semibold text-gray-700">Status</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 text-center">
                  {registration.image ? (
                 // eslint-disable-next-line react/no-unknown-property
                 <img src={`http://localhost/GoatManagement/Backend/${registration.image}`} alt="{registration.goatName}" className="w-10 h-10 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <span className="text-2xl sm:text-2xl mr-8 p-1 ml-8">🐐</span>
                     </div>
                  )}
                </td>
                <td className="px-2 py-2 text-center font-medium text-xs">{registration.goatName}</td>
                <td className="px-2 py-2 text-center text-xs">{registration.breed}</td>
                <td className="px-2 py-2 text-center text-xs">{registration.Gender || "N/A"}</td>
                <td className="px-2 py-2 text-center text-xs">{formatDate(registration.dateOfBirth)}</td>
                <td className="px-2 py-2 text-center text-xs">{registration.weight ? `${registration.weight}kg` : "N/A"}</td>
                         <td className="px-2 py-2 text-center text-xs">{registration.color}</td>
                <td className="px-2 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(registration.status)}`}>
                    {statusOptions.find(s => s.value === registration.status)?.label || registration.status}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <div className="flex space-x-1 justify-center">
                    <Link
                      to={`${registration.id}`}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {registrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No goat registrations found. Register your first goat to get started.
          </div>
        )}
      </div>

      {/* Mobile/Tablet Card View - Enhanced */}
      <div className="lg:hidden grid gap-4">
        {registrations.map((registration) => (
          <div key={registration.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                
                  {registration.image ? (
                 // eslint-disable-next-line react/no-unknown-property
                 <img src={`http://localhost/GoatManagement/Backend/${registration.image}`} alt="{registration.goatName}" className="w-10 h-10 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                     <span className="text-2xl sm:text-2xl mr-8 p-1 ml-8">🐐</span>
                    </div>
                  )}
          
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{registration.goatName}</h4>
                    <p className="text-sm text-gray-600">{registration.breed}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                  {statusOptions.find(s => s.value === registration.status)?.label || registration.status}
                </span>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{registration.Gender || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">DOB:</span>
                  <span className="font-medium">{formatDate(registration.dateOfBirth)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{registration.weight ? `${registration.weight} kg` : "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{registration.color || "N/A"}</span>
                </div>
              </div>
              
              {/* Parentage Info */}
              {(registration.sireName || registration.damName) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Parentage</h5>
                  <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                    {registration.sireName && (
                      <div>
                        <span className="font-medium">Sire:</span> {registration.sireName}
                        {registration.sireRegistrationNumber && ` (${registration.sireRegistrationNumber})`}
                      </div>
                    )}
                    {registration.damName && (
                      <div>
                        <span className="font-medium">Dam:</span> {registration.damName}
                        {registration.damRegistrationNumber && ` (${registration.damRegistrationNumber})`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Card Footer */}
            <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center">
                <Link
                  to={`${registration.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View More
                </Link>
   
              </div>
            </div>
          </div>
        ))}
        
        {registrations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No goats registered yet</h3>
            <p className="text-sm">Get started by registering your first goat.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {currentRegistration ? "Edit Goat Registration" : "Register New Goat"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Upload Section */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-700 border-b pb-2 mb-4">Goat Image</h4>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                           <div className="flex-shrink-0 relative">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Two buttons below image: Upload | Take Photo */}
        <div className="mt-2 flex gap-3 justify-center">
          {/* Upload from gallery */}
          <label className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <UploadCloud className="w-4 h-4" />
            Upload
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* Open device camera */}
          <label className="cursor-pointer flex items-center gap-1 text-sm text-green-600 hover:underline">
            <Camera className="w-4 h-4" />
            Camera
            <input 
              type="file"
              accept="image/*"
              capture="environment"   // ← opens device camera
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
  </div>
  </div>
  </div>


                {/* Basic Identification Details */}
                <div className="space-y-4 mt-1">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Basic Identification Details</h4>
               <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Select Farm *
  </label>
  <select
    name="goatName"
    value={formData.goatName}
    onChange={handleFormChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">-- Select Farm --</option>
    <option value="Ishimwe Farm UG">Ishimwe Farm UG</option>
    <option value="Ishimwe Farm Rwanda">Ishimwe Farm RW</option>
  </select>
</div>

                 <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
  <select
    name="breed"
    value={formData.breed}
    onChange={handleFormChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Breed</option>
    <option value="Boer">Boer</option>
    <option value="Kalahari Red">Kalahari Red</option>
    <option value="Saanen">Saanen</option>
    <option value="Toggenburg">Toggenburg</option>
    <option value="Alpine">Alpine</option>
    <option value="Anglo-Nubian">Anglo-Nubian</option>
    <option value="Jamnapari">Jamnapari</option>
    <option value="Savanna">Savanna</option>
    <option value="Black Bengal">Black Bengal</option>
    <option value="Other">Other</option>
  </select>
</div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                      {ageInMonths !== null && (
    <p className="text-sm text-gray-600 mt-1">{ageInMonths} month(s)</p>
  )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>


               
                </div>

                {/* Parentage Information */}
                <div className="space-y-4 mt-5">
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother Registration Number</label>
                    <input
                      type="text"
                      name="sireRegistrationNumber"
                      value={formData.sireRegistrationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father Registration Number</label>
                    <input
                      type="text"
                      name="damRegistrationNumber"
                      value={formData.damRegistrationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                     <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
              </div>
                     <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      type="text"
                      name="note"
                      value={formData.note}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-tear-700"
                >
                  {currentRegistration ? "Update Registration" : "Register Goat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoatRegistrationManagement;