import React, { useState, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ADD THIS IMPORT - This was missing!
import GoatRegistrationService from "../Services/GoatManagement";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Search,
  Type,
  Activity
} from 'lucide-react';

const GoatCheckinCheckout = () => {
  const [scannedId, setScannedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

const showConfirmationDialog = async (goatId) => {
  try {
    setIsLoading(true);
    console.log('=== STARTING GOAT STATUS CHECK ===');
    console.log(`Fetching goat status for ID: ${goatId}`);
    console.log(`Request timestamp: ${new Date().toISOString()}`);

    // ✅ Use the service method instead of hardcoded axios.get
    const goatInfo = await GoatRegistrationService.getGoatById(goatId);

    console.log('=== RESPONSE RECEIVED FROM SERVICE ===');
    console.log('Goat info:', goatInfo);

    setIsLoading(false);

    if (!goatInfo) {
      console.error('=== VALIDATION FAILED: goatInfo is null/undefined ===');
      throw new Error('No goat information received from server');
    }

    // Check for different possible status field names
    let currentStatus = null;
    if (goatInfo.status) {
      currentStatus = goatInfo.status;
    } else if (goatInfo.Status) {
      currentStatus = goatInfo.Status;
    } else if (goatInfo.currentStatus) {
      currentStatus = goatInfo.currentStatus;
    } else if (goatInfo.state) {
      currentStatus = goatInfo.state;
    } else if (goatInfo.data?.status) {
      currentStatus = goatInfo.data.status;
    }

if (!currentStatus) {
  throw new Error(`Goat status field not found. Available fields: ${Object.keys(goatInfo).join(', ')}`);
}

const status = currentStatus.toLowerCase();
let action = null;

if (status === 'checkedin') {
  action = 'out';
} else if (status === 'checkedout') {
  action = 'in';
} else {
  throw new Error(`Unrecognized status: ${currentStatus}`);
}


const result = await Swal.fire({
      title: '🐐 Confirm Action',
      html: `
        <div class="text-center">
          <div class="text-2xl mb-2">🎯</div>
          <p class="text-sm mb-1">Goat ID: <strong>${goatId}</strong></p>
          <p class="text-sm">Current Status: <strong>${currentStatus.toUpperCase()}</strong></p>
          <p class="text-sm">Check this goat ${action}?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: '✅ Yes',
      cancelButtonText: '❌ No',
      customClass: {
        popup: 'rounded-xl text-sm',
        confirmButton: 'rounded-lg px-4 py-1 text-sm',
        cancelButton: 'rounded-lg px-4 py-1 text-sm'
      }
    });

    if (result.isConfirmed) {
      console.log('User confirmed action, proceeding with status update');
      await handleUpdateStatus(goatId);
    } else {
      console.log('User cancelled action');
    }

  } catch (error) {
    setIsLoading(false);
    console.error('=== ERROR IN showConfirmationDialog ===', error);

    let errorMessage = 'Failed to get goat information';
    let errorDetails = '';

    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Cannot reach server';
      errorDetails = 'Check your internet connection';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
      errorDetails = 'Server took too long to respond';
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 404) {
        errorMessage = `Goat ID ${goatId} not found`;
        errorDetails = 'Please check the goat ID and try again';
      } else if (status === 500) {
        errorMessage = 'Server error';
        errorDetails = data?.message || 'Internal server error occurred';
      } else if (status >= 400 && status < 500) {
        errorMessage = 'Client error';
        errorDetails = data?.message || `HTTP ${status} error`;
      } else {
        errorMessage = 'Server error';
        errorDetails = data?.message || `HTTP ${status} error`;
      }
    } else if (error.message.includes('status field')) {
      errorMessage = 'Invalid server response';
      errorDetails = error.message;
    }

    await Swal.fire({
      title: '❌ Error',
      html: `
        <div class="text-center">
          <div class="text-2xl mb-2">⚠️</div>
          <p class="text-sm font-medium">${errorMessage}</p>
          ${errorDetails ? `<p class="text-xs mt-1 text-gray-600">${errorDetails}</p>` : ''}
          <p class="text-xs mt-2 text-gray-500">GoatID: ${goatId} | Check console for detailed logs</p>
        </div>
      `,
      icon: 'error',
      customClass: {
        popup: 'rounded-xl'
      }
    });
  }
};

  const handleUpdateStatus = async (goatId) => {
    setIsLoading(true);
    try {
      console.log('=== STARTING STATUS UPDATE ===');
      console.log(`Updating status for goat ID: ${goatId}`);
      
      const result = await GoatRegistrationService.scanGoat(goatId);
      
      console.log('=== STATUS UPDATE SUCCESS ===');
      console.log('Update result:', result);
      
      await Swal.fire({
        title: '🎉 Success!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">✅</div>
            <p class="text-sm">${result.message}</p>
            <p class="text-xs mt-1">New Status: ${result.data.status.toUpperCase()}</p>
          </div>
        `,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });

      setScannedId('');
      setManualId('');

      setTimeout(() => {
        navigate('/dashboard/manage-goat');
      }, 1500);

    } catch (error) {
      console.error('=== ERROR UPDATING GOAT STATUS ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      Swal.fire({
        title: '❌ Error!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-sm">${error.response?.data?.message || 'Failed to update status'}</p>
            <p class="text-xs mt-1 text-gray-500">GoatID: ${goatId}</p>
          </div>
        `,
        icon: 'error',
        timer: 2000,
        customClass: {
          popup: 'rounded-xl'
        }
      });

      setStatusMessage('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const imageUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      const codeReader = new BrowserMultiFormatReader();

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_8,
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_128,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
      ]);

      try {
        const result = await codeReader.decodeFromImageElement(img, hints);
        const scanned = result.getText();
        console.log('Barcode scanned successfully:', scanned);
        setScannedId(scanned);
        await showConfirmationDialog(scanned);
      } catch (err) {
        console.error('Error decoding barcode image:', err);
        Swal.fire({
          title: '❌ Error',
          text: 'Could not decode barcode. Please try a clearer or different barcode image.',
          icon: 'error',
          customClass: {
            popup: 'rounded-xl'
          }
        });
        setStatusMessage('Could not decode barcode.');
      } finally {
        setIsLoading(false);
        URL.revokeObjectURL(imageUrl);
      }
    };

    img.onerror = () => {
      setIsLoading(false);
      Swal.fire({
        title: '❌ Error',
        text: 'Failed to load image',
        icon: 'error'
      });
    };
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      Swal.fire({
        title: '⚠️ Missing ID',
        text: 'Please enter a goat ID',
        icon: 'warning',
        customClass: {
          popup: 'rounded-xl'
        }
      });
      return;
    }

    console.log('Manual ID submitted:', manualId.trim());
    setScannedId(manualId.trim());
    await showConfirmationDialog(manualId.trim());
  };

  const handleGoBack = () => {
    navigate('/dashboard/manage-goat');
  };

  // Debug function you can call manually in console: window.debugGoatApi('your-goat-id')
  window.debugGoatApi = async (goatId) => {
    console.log('=== MANUAL DEBUG API CALL ===');
    try {
      const response = await fetch(`https://rent.abyride.com/goats/${goatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);
      console.log('Fetch response headers:', [...response.headers.entries()]);
      
      const text = await response.text();
      console.log('Raw response text:', text);
      
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
        return json;
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response was not valid JSON:', text);
        return null;
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return null;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-3">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1">
              <Activity className="text-green-600" size={16} />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              🐐 Goat Scanner
            </h1>
            <p className="text-sm text-gray-600">
              Scan, upload, or enter goat ID
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 px-3 text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Camera size={16} />
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 px-3 text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload size={16} />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 px-3 text-sm font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Type size={16} />
              Manually
            </button>
          </div>

          <div className="p-4">
            {/* Live Scanner Tab */}
            {activeTab === 'scanner' && (
              <div className="text-center">
                <div className="mb-3">
                  <Scan className="mx-auto text-green-500 mb-1" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Live Scanner</h3>
                  <p className="text-xs text-gray-600 mb-3">Position barcode in camera view</p>
                </div>
                
                <div className="relative inline-block rounded-xl overflow-hidden shadow-md border-2 border-green-200">
                  <BarcodeScannerComponent
                    width={320}
                    height={240}
                    onUpdate={(err, result) => {
                      if (result) {
                        const scanned = result.text;
                        if (scanned !== scannedId) {
                          setScannedId(scanned);
                          showConfirmationDialog(scanned);
                        }
                      }
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-1 text-xs">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="text-center">
                <div className="mb-4">
                  <Upload className="mx-auto text-blue-500 mb-1" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Image</h3>
                  <p className="text-xs text-gray-600 mb-3">Select barcode image file</p>
                </div>
                
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 hover:border-blue-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <Upload size={24} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        {isLoading ? 'Processing...' : 'Select Image'}
                      </p>
                      <p className="text-xs text-blue-600">PNG, JPG, GIF</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <div className="text-center">
                <div className="mb-4">
                  <Type className="mx-auto text-purple-500 mb-1" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Manual Entry</h3>
                  <p className="text-xs text-gray-600 mb-3">Type goat ID manually</p>
                </div>

                <form onSubmit={handleManualSubmit} className="max-w-xs mx-auto">
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      placeholder="Enter ID (e.g., G001)"
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !manualId.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Check Status
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Status Display */}
        {(scannedId || statusMessage) && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1">
              <Activity size={16} className="text-green-500" />
              Status
            </h3>
            
            <div className="space-y-2">
              {scannedId && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-gray-600">Goat ID:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{scannedId}</span>
                </div>
              )}
              
              {statusMessage && (
                <div className={`flex items-center gap-1 p-2 rounded-lg text-xs ${
                  statusMessage.includes('Failed') || statusMessage.includes('Error')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {statusMessage.includes('Failed') || statusMessage.includes('Error') ? (
                    <AlertCircle size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span className="font-medium">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoatCheckinCheckout;
