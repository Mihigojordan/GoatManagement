import React, { useState, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
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

  // Function to get goat status before showing confirmation
  const getGoatStatus = async (goatId) => {
    try {
      // Assuming your service has a method to get goat details
      const goatDetails = await GoatRegistrationService.getGoatById(goatId);
      return goatDetails.status; // Assuming status is 'checked_in' or 'checked_out'
    } catch (error) {
      console.error('Error fetching goat status:', error);
      return null;
    }
  };

  const showConfirmationDialog = async (goatId) => {
    setIsLoading(true);
    
    try {
      const currentStatus = await getGoatStatus(goatId);
      
      if (!currentStatus) {
        Swal.fire({
          title: '❌ Error!',
          html: `
            <div class="text-center">
              <div class="text-3xl mb-2">⚠️</div>
              <p class="text-sm">Could not find goat with ID: <strong>${goatId}</strong></p>
              <p class="text-xs text-gray-500 mt-1">Please verify the ID and try again</p>
            </div>
          `,
          icon: 'error',
          customClass: {
            popup: 'rounded-xl'
          }
        });
        return;
      }

      const isCheckedIn = currentStatus === 'checked_in';
      const actionText = isCheckedIn ? 'Check Out' : 'Check In';
      const statusEmoji = isCheckedIn ? '🏠' : '🚪';
      const actionEmoji = isCheckedIn ? '🚪' : '🏠';
      const statusText = isCheckedIn ? 'checked in' : 'checked out';
      const actionColor = isCheckedIn ? '#ef4444' : '#10b981';

      const result = await Swal.fire({
        title: '🐐 Goat Status',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-3">${statusEmoji}</div>
            <p class="text-sm mb-2">Goat ID: <strong>${goatId}</strong></p>
            <div class="bg-gray-100 rounded-lg p-3 mb-3">
              <p class="text-sm font-medium">Current Status: <span class="text-blue-600">${statusText}</span></p>
            </div>
            <p class="text-sm mb-2">
              ${actionEmoji} Do you want to <strong>${actionText.toLowerCase()}</strong> this goat?
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: actionColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: `✅ ${actionText}`,
        cancelButtonText: '❌ Cancel',
        customClass: {
          popup: 'rounded-xl text-sm',
          confirmButton: 'rounded-lg px-4 py-2 text-sm font-medium',
          cancelButton: 'rounded-lg px-4 py-2 text-sm font-medium'
        }
      });

      if (result.isConfirmed) {
        await handleUpdateStatus(goatId, isCheckedIn ? 'check_out' : 'check_in');
      }
    } catch (error) {
      console.error('Error in confirmation dialog:', error);
      Swal.fire({
        title: '❌ Error!',
        text: 'Failed to fetch goat status. Please try again.',
        icon: 'error',
        customClass: {
          popup: 'rounded-xl'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (goatId, action) => {
    setIsLoading(true);
    try {
      const result = await GoatRegistrationService.scanGoat(goatId, action);
      
      const isCheckOut = action === 'check_out';
      const successEmoji = isCheckOut ? '🚪' : '🏠';
      const actionText = isCheckOut ? 'checked out' : 'checked in';
      
      await Swal.fire({
        title: '🎉 Success!',
        html: `
          <div class="text-center">
            <div class="text-4xl mb-3">${successEmoji}</div>
            <p class="text-sm mb-1">Goat <strong>${goatId}</strong></p>
            <p class="text-sm font-medium text-green-600">Successfully ${actionText}!</p>
            <p class="text-xs text-gray-500 mt-2">${result.message || `Goat has been ${actionText}`}</p>
          </div>
        `,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });

      setScannedId('');
      setManualId('');

      setTimeout(() => {
        navigate('/dashboard/manage-goat');
      }, 2000);

    } catch (error) {
      console.error('Error updating goat status:', error);

      Swal.fire({
        title: '❌ Error!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-sm">${error.response?.data?.message || 'Failed to update status'}</p>
            <p class="text-xs text-gray-500 mt-1">Please try again or contact support</p>
          </div>
        `,
        icon: 'error',
        timer: 3000,
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

      // Expand hints to multiple barcode formats to improve decoding success
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

    setScannedId(manualId.trim());
    await showConfirmationDialog(manualId.trim());
  };

  const handleGoBack = () => {
    navigate('/dashboard/manage-goat');
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
              Manual
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
