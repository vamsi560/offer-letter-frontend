import React, { useState } from 'react';
import OfferLetterPreview from '../components/OfferLetterPreview';

const OfferLetterPreviewPage = () => {
  const [previewData, setPreviewData] = useState({
    dateOfOfferGeneration: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    candidateFullName: 'John Doe',
    designation: 'Senior Software Engineer',
    grade: 'Grade A',
    location: 'Bangalore',
    technologyCenter: 'Platform, App & Infra Technology',
    dateOfJoining: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    monthlyBasic: '₹ 75,000',
    annualBasic: '₹ 9,00,000',
    monthlyHRA: '₹ 30,000',
    annualHRA: '₹ 3,60,000',
    monthlyConveyance: '₹ 2,000',
    annualConveyance: '₹ 24,000',
    monthlyPF: '₹ 9,000',
    annualPF: '₹ 1,08,000',
    monthlyGratuity: '₹ 6,250',
    annualGratuity: '₹ 75,000',
    monthlySodexo: '₹ 1,000',
    annualSodexo: '₹ 12,000',
    monthlyLTC: '₹ 2,500',
    annualLTC: '₹ 30,000',
    monthlyNPS: '₹ 5,000',
    monthlyGross: '₹ 1,30,750',
    annualGross: '₹ 15,69,000',
    totalAnnualGross: '₹ 15,69,000',
    totalInWords: 'Fifteen Lakh Sixty-Nine Thousand Only',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/offer-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offer_letter_${previewData.candidateFullName.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading offer letter:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Offer Letter Preview</h1>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Download DOCX
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <OfferLetterPreview data={previewData} />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .max-w-6xl {
            max-width: 100%;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default OfferLetterPreviewPage;
