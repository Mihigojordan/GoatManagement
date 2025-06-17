import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import driverManagementService from '../../../Services/Dispatch/DriverManagement';
import { User, FileText, Shield, Eye, Download, X, CheckCircle, Clock, Phone, Mail, MapPin, Calendar, Award, Globe, Users, Briefcase } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic personal details' },
  { id: 2, title: 'Professional', icon: Briefcase, description: 'License & experience' },
  { id: 3, title: 'Documents', icon: Shield, description: 'Required documents' },
];

const backendImageURL = import.meta.env.VITE_BACKEND_IMAGE_LINK;

// Enhanced file preview component
// eslint-disable-next-line react/prop-types
const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [previewContent, setPreviewContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file && isOpen) {
      setLoading(true);
      setError(null);
      
      // Get file extension from the URL
      // eslint-disable-next-line react/prop-types
      const fileExtension = file.split('.').pop().toLowerCase().split('?')[0];
      
      if (['pdf'].includes(fileExtension)) {
        setPreviewContent({ type: 'pdf', url: file });
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension)) {
        setPreviewContent({ type: 'image', url: file });
      } else if (['doc', 'docx'].includes(fileExtension)) {
        setPreviewContent({ type: 'document', url: file });
      } else if (['txt'].includes(fileExtension)) {
        setPreviewContent({ type: 'text', url: file });
      } else {
        setPreviewContent({ type: 'unsupported', url: file });
      }
      setLoading(false);
    }
  }, [file, isOpen]);

    const handlePdfError = () => {
    setError('PDF preview not available. Click download to view the file.');
  };

  const handleImageError = () => {
    setError('Image preview not available. Click download to view the file.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] relative z-10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Document Preview</h3>
                <p className="text-sm text-gray-600">
                {previewContent?.type === 'pdf' ? 'PDF Document' : 
                 previewContent?.type === 'image' ? 'Image File' :
                 previewContent?.type === 'document' ? 'Document File' :
                 previewContent?.type === 'text' ? 'Text File' : 'File'}
              </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="h-full p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : previewContent?.type === 'pdf' ? (
            <iframe
            src={`${previewContent.url}#toolbar=1&navpanes=1&scrollbar=1`}

              className="w-full h-full rounded-lg border border-gray-200"
              title="Document Preview"
            />
          ) : previewContent?.type === 'image' ? (
            <img
              src={previewContent.url}
              alt="Document Preview"
              className="max-w-full max-h-full object-contain mx-auto rounded-lg shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg mb-2">Preview not available</p>
              <p className="text-sm">This file type is not supported for preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function DriverManagementDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const data = await driverManagementService.getDriverById(id);
        setDriver(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  const handleFilePreview = (filePath) => {
    const backendImageURL = import.meta.env.VITE_BACKEND_IMAGE_LINK || 'http://localhost/abyride_dispatch_systemes/Backend/uploads/';
    // Remove leading slash from filePath if it exists
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    // Ensure backendImageURL ends with a slash
    const baseURL = backendImageURL.endsWith('/') ? backendImageURL : `${backendImageURL}/`;
    const fullFilePath = `${baseURL}${cleanPath}`;
    setPreviewFile(fullFilePath);
  };


  const closeModal = () => setPreviewFile(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Driver</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Driver Not Found</h3>
            <p className="text-gray-600">The requested driver could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderInfoCard = (title, icon, fields, bgGradient = "from-blue-50 to-indigo-50") => (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}>
      <div className="p-3">
        <div className="flex items-center space-x-3 mb-2">
          {React.createElement(icon, { className: "w-7 h-4 text-blue-600" })}
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4">
          {fields.map(({ label, value, icon: fieldIcon }) => (
            <div key={label} className="flex items-start space-x-3 p-2 bg-white bg-opacity-60 rounded-xl hover:bg-opacity-80 transition-colors">
              {fieldIcon && React.createElement(fieldIcon, { className: "w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" })}
              <div className="flex-1 min-w-0">
                <dt className="text-[12px] font-medium text-gray-600">{label}</dt>
                <dd className="text-[13px] text-gray-900 font-semibold break-words">{value || 'N/A'}</dd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const documents = [
    { label: 'National ID / Passport', file: driver.nationalIdOrPassport, icon: Shield },
    { label: 'Police Clearance Certificate', file: driver.policeClearanceCertificate, icon: Shield },
    { label: 'Proof of Address', file: driver.proofOfAddress, icon: MapPin },
    { label: 'Driving Certificate', file: driver.drivingCertificate, icon: Award },
    { label: 'Work Permit / Visa', file: driver.workPermitOrVisa, icon: FileText },
    { label: 'Drug Test Report', file: driver.drugTestReport, icon: FileText },
    { label: 'Employment Reference Letter', file: driver.employmentReferenceLetter, icon: Briefcase },
    { label: 'Bank Statement', file: driver.bankStatementFile, icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Profile</h1>
              <p className="text-blue-100">Complete driver information and documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 ${
                driver.Status === 'Active' 
                  ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-400' 
                  : 'bg-yellow-500 bg-opacity-20 text-yellow-100 border border-yellow-400'
              }`}>
                {driver.Status === 'Active' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>{driver.Status}</span>
              </div>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30">
                {driver.Status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 z-10">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-blue-300 mt-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Personal Information */}
          {renderInfoCard('Personal Information', User, [
            { label: 'Full Name', value: `${driver.firstName} ${driver.lastName}`, icon: User },
            { label: 'Email Address', value: driver.email, icon: Mail },
            { label: 'Phone Number', value: driver.phoneNumber, icon: Phone },
            { label: 'Gender', value: driver.gender, icon: User },
            { label: 'Nationality', value: driver.nationality, icon: Globe },
            { label: 'Date of Birth', value: new Date(driver.dateOfBirth).toLocaleDateString(), icon: Calendar },
            { label: 'Address', value: driver.address, icon: MapPin },
            { label: 'Emergency Contact', value: `${driver.emergencyContactName} (${driver.emergencyContactNumber})`, icon: Users },
          ], "from-blue-50 to-cyan-50")}

          {/* Professional Information */}
          {renderInfoCard('Professional Information', Briefcase, [
            { label: 'License ID', value: driver.licenseId, icon: Award },
            { label: 'License Expiry', value: new Date(driver.licenseExpiryDate).toLocaleDateString(), icon: Calendar },
            { label: 'Years of Experience', value: `${driver.yearsOfExperience} years`, icon: Award },
            { label: 'Languages', value: driver.languages, icon: Globe },
            { label: 'Previous Employment', value: driver.previousEmployment, icon: Briefcase },
            { label: 'Available From', value: new Date(driver.availabilityToStart).toLocaleDateString(), icon: Calendar },
            { label: 'License Issued In', value: driver.licenseIssuedIn, icon: MapPin },
            { label: 'Availability', value: driver.Availability, icon: Clock },
          ], "from-green-50 to-emerald-50")}
        </div>

        {/* Documents Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-7 h-7 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Required Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map(({ label, file, icon }) => (
                <div key={label} className="bg-white bg-opacity-60 rounded-xl p-3 hover:bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {React.createElement(icon, { className: "w-5 h-5 text-purple-600 flex-shrink-0" })}
                      <span className="font-medium text-gray-800 text-sm">{label}</span>
                    </div>
                    <button
                      onClick={() => handleFilePreview(file)}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors group"
                    >
                      <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal 
          file={previewFile} 
          isOpen={!!previewFile} 
          onClose={closeModal} 
        />
      </div>
    </div>
  );
}

export default DriverManagementDetail;