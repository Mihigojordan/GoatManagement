import React, { useState, useEffect } from 'react';
import { Edit, Trash2, User, FileText, Shield, ChevronLeft, ChevronRight, X, Plus, Check,Save,Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import adminServiceInstance from '../../../Services/Dispatch/DriverManagement';

import {
  fetchDriversUtil,
  filterDriversUtil,
  initFormDataUtil,
  notifySuccess,
  notifyError,
} from '../../../Utils/DriverManagementUtils';

const steps = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic personal details' },
  { id: 2, title: 'Professional', icon: FileText, description: 'License & experience' },
  { id: 3, title: 'Documents', icon: Shield, description: 'Required documents' }
];

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);



  const [filters, setFilters] = useState({ name: '', dob: '', createdDate: '' });
  const [formData, setFormData] = useState(initFormDataUtil());


  useEffect(() => {
    loadDrivers();
  }, []);


  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDriversUtil(adminServiceInstance);
      setDrivers(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to fetch drivers');
      notifyError('Failed to fetch drivers');
    }
  };

  const filteredDrivers = filterDriversUtil(drivers, filters);

  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleShowModal = (driver = null) => {
    setEditDriver(driver);
    setCurrentStep(1);
    setFormData(driver ? initFormDataUtil(driver) : initFormDataUtil());
  setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditDriver(null);
    setShowModal(false);
    setCurrentStep(1);
    setFormData(initFormDataUtil());

  };

const handleFormChange = (e) => {
  const { name, files, value, type } = e.target;

  if (type === 'file') {
    console.log('File input changed:', name, files[0]); // Add this
    setFormData((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const changeStep = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((step) => {
        const nextStep = direction === 'next' ? step + 1 : step - 1;
        if (nextStep < 1) return 1;
        if (nextStep > 3) return 3;
        return nextStep;
      });
      setIsAnimating(false);
    }, 200);
  };


   const handleNextStep = () => {
    if (currentStep < 3 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formDataToSend = new FormData();

    // Append all fields (both text and files)
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

 
    // Verify the FormData contents
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    if (editDriver) {
      await adminServiceInstance.updateDriver(editDriver.id, formDataToSend);
      notifySuccess('Driver updated successfully');
    } else {
      await adminServiceInstance.createDriver(formDataToSend);
      notifySuccess('Driver added successfully');
    }

    loadDrivers();
    handleCloseModal();
  } catch (err) {
    notifyError(err.message || 'Operation failed');
  }
};

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await adminServiceInstance.deleteDriver(id);
        notifySuccess('Driver deleted successfully');
        loadDrivers();
      } catch (err) {
        notifyError(err.message || 'Failed to delete driver');
      }
    }
  };




  const renderStepContent = () => {
    const baseInputClass = "w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400";
    const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

    switch (currentStep) {
      case 1:
        return (
          <div className={`space-y-4 transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required
                  className={baseInputClass}
                  placeholder="Enter first name"
                />
              </div>
              <div className="group">
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required
                  className={baseInputClass}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            
    </div>
        );
        

      case 2:
        return (
          <div className={`space-y-4 transition-all mt-10 duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            <div className="grid grid-cols-2 gap-4">
      
              <div className="group">
                <label className={labelClass}>License ID *</label>
                <input
                  type="text"
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleFormChange}
                  required
                  className={baseInputClass}
                  placeholder="Enter license ID"
                />
              </div>

            </div>
            <div className="group">

</div>


          </div>
        );

      case 3:
      return (
  <div className={`space-y-4 transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
    <div className="grid grid-cols-2 gap-4">
        <div className="group">
      <label className={labelClass}>Bank Statement </label>
      <input
      
        type="file"
        name="bankStatementFile"
        onChange={handleFormChange}
        className={baseInputClass}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  </div>
  </div>
);

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Loading drivers...</span>
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
        <h3 className="text-xl font-bold text-gray-800">Driver Management</h3>
        <button
          onClick={() => handleShowModal()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Driver
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4  p-2 mb-3 -mt-2 bg-gray-50 rounded-lg">
        <div>
          <input
            type="text"
            placeholder="Search by name..."
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="date"
            name="dob"
            value={filters.dob}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="date"
            name="createdDate"
            value={filters.createdDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-xs text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver, idx) => {
                const fullName = `${driver.firstName} ${driver.lastName}`;
                return (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-2 py-2 text-xs text-center text-gray-900">{idx + 1}</td>
                 
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowModal(driver)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-150"
                          title="Edit driver"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id, fullName)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-150"
                          title="Delete driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-xs text-gray-600">Showing 1 to {filteredDrivers.length} of {filteredDrivers.length} entries</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            Previous
          </button>
          <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">1</button>
          <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            Next
          </button>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
               {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editDriver ? 'Edit Driver' : 'Add New Driver'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Stepper */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          currentStep >= step.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative mt-2">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                  <div
                    className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                    )}
                  </div>
                  <div>
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-150"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {editDriver ? 'Update Driver' : 'Save Driver'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;