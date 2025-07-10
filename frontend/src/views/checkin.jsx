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
  ArrowLeft,
  Search,
  Activity,
  LogOut,
  Users
} from 'lucide-react';

const GoatCheckinCheckout = () => {
  const [scannedId, setScannedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Confirmation dialog for individual goat checkout
  const showConfirmationDialog = async (goatId) => {
    try {
      const result = await Swal.fire({
        title: '🐐 Confirm Check-out',
        html: `
          <div class="text-center">
            <p class="text-sm mb-1">Goat ID: <strong>${goatId}</strong></p>
            <p class="text-sm">Are you sure you want to check-out this goat?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✅ Yes, Check Out',
        cancelButtonText: '❌ Cancel',
        customClass: {
          popup: 'rounded-xl text-sm',
          confirmButton: 'rounded-lg px-4 py-1 text-sm',
          cancelButton: 'rounded-lg px-4 py-1 text-sm'
        }
      });

      if (result.isConfirmed) {
        console.log('User confirmed check-out, proceeding');
        await handleCheckOut(goatId);
      } else {
        console.log('User cancelled check-out');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error in showConfirmationDialog:', error);

      await Swal.fire({
        title: '❌ Error',
        html: `
          <div class="text-center">
            <div class="text-2xl mb-2">⚠️</div>
            <p class="text-sm font-medium">Failed to proceed with check-out</p>
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

  // Confirmation dialog for scanning all goats out
  const showScanAllConfirmationDialog = async () => {
    try {
      const result = await Swal.fire({
        title: '🐐 Scan All Goats Out',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-sm mb-2">Are you sure you want to scan <strong>ALL</strong> goats out?</p>
            <p class="text-xs text-gray-500">This action will check-out all goats at once</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✅ Yes, Scan All Out',
        cancelButtonText: '❌ Cancel',
        customClass: {
          popup: 'rounded-xl text-sm',
          confirmButton: 'rounded-lg px-4 py-1 text-sm',
          cancelButton: 'rounded-lg px-4 py-1 text-sm'
        }
      });

      if (result.isConfirmed) {
        console.log('User confirmed scan all out, proceeding');
        await handleScanAllOut();
      } else {
        console.log('User cancelled scan all out');
      }
    } catch (error) {
      setIsScanningAll(false);
      console.error('Error in showScanAllConfirmationDialog:', error);

      await Swal.fire({
        title: '❌ Error',
        html: `
          <div class="text-center">
            <div class="text-2xl mb-2">⚠️</div>
            <p class="text-sm font-medium">Failed to proceed with scan all out</p>
            <p class="text-xs mt-2 text-gray-500">Check console for detailed logs</p>
          </div>
        `,
        icon: 'error',
        customClass: {
          popup: 'rounded-xl'
        }
      });
    }
  };

  const handleCheckOut = async (goatId) => {
    setIsLoading(true);
    try {
      console.log('=== STARTING CHECK-OUT ===');
      console.log(`Checking out goat ID: ${goatId}`);

      const result = await GoatRegistrationService.scanGoatOut(goatId);

      console.log('=== CHECK-OUT SUCCESS ===');
      console.log('Result:', result);

      let message = 'Check-out successful';

      if (result && result.message) {
        message = result.message;
      }

      await Swal.fire({
        title: '🎉 Success!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">✅</div>
            <p class="text-sm">${message}</p>
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
      console.error('=== ERROR DURING CHECK-OUT ===');
      console.error('Error:', error);

      Swal.fire({
        title: '❌ Error!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-sm">${error.response?.data?.message || 'Failed to check-out goat'}</p>
            <p class="text-xs mt-1 text-gray-500">GoatID: ${goatId}</p>
          </div>
        `,
        icon: 'error',
        timer: 2000,
        customClass: {
          popup: 'rounded-xl'
        }
      });

    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAllOut = async () => {
    setIsScanningAll(true);
    try {
      console.log('=== STARTING SCAN ALL OUT ===');

      const result = await GoatRegistrationService.scanAllGoatsOut();

      console.log('=== SCAN ALL OUT SUCCESS ===');
      console.log('Result:', result);

      let message = 'All goats scanned out successfully';

      if (result && result.message) {
        message = result.message;
      }

      await Swal.fire({
        title: '🎉 All Goats Scanned Out!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">✅</div>
            <p class="text-sm">${message}</p>
          </div>
        `,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });

      setTimeout(() => {
        navigate('/dashboard/manage-goat');
      }, 2000);

    } catch (error) {
      console.error('=== ERROR DURING SCAN ALL OUT ===');
      console.error('Error:', error);

      Swal.fire({
        title: '❌ Error!',
        html: `
          <div class="text-center">
            <div class="text-3xl mb-2">⚠️</div>
            <p class="text-sm">${error.response?.data?.message || 'Failed to scan all goats out'}</p>
          </div>
        `,
        icon: 'error',
        timer: 2000,
        customClass: {
          popup: 'rounded-xl'
        }
      });

    } finally {
      setIsScanningAll(false);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-3">
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
              <Activity className="text-red-600" size={16} />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              🐐 Goat Check-Out Scanner
            </h1>
            <p className="text-sm text-gray-600">
              Scan out individual goats or all at once
            </p>
          </div>
        </div>

        {/* Scan All Out Button */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <button
            onClick={showScanAllConfirmationDialog}
            disabled={isScanningAll || isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white font-medium py-3 px-4 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {isScanningAll ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Scanning All Out...
              </>
            ) : (
              <>
                <Users size={18} />
                <LogOut size={18} />
                Scan All Goats Out
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 px-3 text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-green-600 text-white shadow-lg'
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
              <Search size={16} />
              Manually
            </button>
          </div>

          <div className="p-4">
            {/* Live Scanner Tab */}
            {activeTab === 'scanner' && (
              <div className="text-center">
                <div className="mb-3">
                  <Scan className="mx-auto text-red-500 mb-1" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Live Scanner</h3>
                  <p className="text-xs text-gray-600 mb-3">Position barcode in camera view</p>
                </div>
                
                <div className="relative inline-block rounded-xl overflow-hidden shadow-md border-2 border-red-200">
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
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
                  <Upload className="mx-auto text-orange-500 mb-1" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Image</h3>
                  <p className="text-xs text-gray-600 mb-3">Select barcode image file</p>
                </div>
                
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-4 hover:border-orange-500 transition-colors">
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
                    className="w-full flex flex-col items-center gap-2 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50"
                  >
                    <Upload size={24} className="text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        {isLoading ? 'Processing...' : 'Select Image'}
                      </p>
                      <p className="text-xs text-orange-600">PNG, JPG, GIF</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <div className="text-center">
                <div className="mb-4">
                  <Search className="mx-auto text-yellow-500 mb-1" size={24} />
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
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !manualId.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        Check Out
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoatCheckinCheckout;