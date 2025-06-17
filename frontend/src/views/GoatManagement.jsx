import React, { useState, useEffect } from "react";
import { Trash2, X, View, Edit, ToggleLeft } from "lucide-react";
import GoatRegistrationService from "../Services/GoatManagement";

const GoatRegistrationManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Identification Details
    goatName: "",
    identificationNumber: "",
    breed: "",
    breedRegistrationNumber: "",
    dateOfBirth: "",
    sex: "",
    color: "",
    markings: "",
    weight: "",
    
    // Parentage Information
    sireName: "",
    sireRegistrationNumber: "",
    damName: "",
    damRegistrationNumber: "",
    breederName: "",
    breederContact: "",
  });

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

  const handleShowModal = (registration = null) => {
    setCurrentRegistration(registration);
    setFormData(
      registration
        ? {
            goatName: registration.goatName,
            identificationNumber: registration.identificationNumber,
            breed: registration.breed,
            breedRegistrationNumber: registration.breedRegistrationNumber || "",
            dateOfBirth: registration.dateOfBirth,
            sex: registration.sex,
            color: registration.color,
            markings: registration.markings || "",
            weight: registration.weight || "",
            sireName: registration.sireName || "",
            sireRegistrationNumber: registration.sireRegistrationNumber || "",
            damName: registration.damName || "",
            damRegistrationNumber: registration.damRegistrationNumber || "",
            breederName: registration.breederName || "",
            breederContact: registration.breederContact || "",
          }
        : {
            goatName: "",
            identificationNumber: "",
            breed: "",
            breedRegistrationNumber: "",
            dateOfBirth: "",
            sex: "",
            color: "",
            markings: "",
            weight: "",
            sireName: "",
            sireRegistrationNumber: "",
            damName: "",
            damRegistrationNumber: "",
            breederName: "",
            breederContact: "",
          }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentRegistration(null);
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRegistration) {
        await GoatRegistrationService.update(currentRegistration.id, formData);
      } else {
        await GoatRegistrationService.create(formData);
      }
      await loadRegistrations();
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this registration?")) return;
    try {
      await GoatRegistrationService.delete(id);
      await loadRegistrations();
    } catch (err) {
      setError(err.message || "Failed to delete registration");
    }
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Goat Registration Management</h3>
        <button
          onClick={() => handleShowModal()}
          className="px-4 py-2 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600"
        >
          Register New Goat
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[600px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Goat Name</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">ID Number</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Breed</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Sex</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Date of Birth</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Breeder</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{registration.goatName}</td>
                <td className="px-4 py-2 text-center">{registration.identificationNumber}</td>
                <td className="px-4 py-2 text-center">{registration.breed}</td>
                <td className="px-4 py-2 text-center">{registration.sex}</td>
                <td className="px-4 py-2 text-center">{registration.dateOfBirth}</td>
                <td className="px-4 py-2 text-center">{registration.breederName}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    registration.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    registration.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {registration.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex space-x-2 justify-center">
                  <button
                    onClick={() => handleShowModal(registration)}
                    className="text-blue-500 hover:text-blue-700"
                    title="View"
                  >
                    <View className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShowModal(registration)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(registration.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {currentRegistration ? "Edit Goat Registration" : "Register New Goat"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Identification Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Basic Identification Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goat Name</label>
                    <input
                      type="text"
                      name="goatName"
                      value={formData.goatName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Identification Number</label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed Registration Number</label>
                    <input
                      type="text"
                      name="breedRegistrationNumber"
                      value={formData.breedRegistrationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Additional Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Markings</label>
                    <input
                      type="text"
                      name="markings"
                      value={formData.markings}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Parentage Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Parentage Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sire Name</label>
                    <input
                      type="text"
                      name="sireName"
                      value={formData.sireName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sire Registration Number</label>
                    <input
                      type="text"
                      name="sireRegistrationNumber"
                      value={formData.sireRegistrationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dam Name</label>
                    <input
                      type="text"
                      name="damName"
                      value={formData.damName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dam Registration Number</label>
                    <input
                      type="text"
                      name="damRegistrationNumber"
                      value={formData.damRegistrationNumber}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Breeder Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Breeder Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breeder Name</label>
                    <input
                      type="text"
                      name="breederName"
                      value={formData.breederName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breeder Contact</label>
                    <input
                      type="text"
                      name="breederContact"
                      value={formData.breederContact}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
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