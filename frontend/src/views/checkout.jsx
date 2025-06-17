import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';

const BarcodeCheckout = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleScan = async (err, scannedData) => {
    if (err) {
      console.error('Scan error:', err);
      return;
    }

    if (scannedData && scannedData.text && !result) {
      setResult(scannedData.text); // Save scanned barcode number
      setScanning(false); // Stop scanning
      setMessage('Processing checkout...');

      try {
        // 📤 POST to your backend to save in checkout DB
        const res = await axios.post('http://localhost:3000/checkout', {
          barcodeNumber: scannedData.text,
        });

        setMessage('✅ Checkout saved successfully!');
      } catch (error) {
        console.error(error);
        setMessage('❌ Failed to save checkout.');
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Goat Checkout</h2>

      {!scanning && (
        <button
          onClick={() => {
            setResult(null);
            setScanning(true);
            setMessage('');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Scanning
        </button>
      )}

      {scanning && (
        <div className="my-4">
          <BarcodeScannerComponent
            width={500}
            height={300}
            onUpdate={handleScan}
          />
        </div>
      )}

      {result && (
        <div className="mt-4">
          <p><strong>Scanned:</strong> {result}</p>
        </div>
      )}

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default BarcodeCheckout;
