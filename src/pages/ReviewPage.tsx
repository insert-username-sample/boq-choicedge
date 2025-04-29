import React from 'react';
import { useLocation } from 'react-router-dom';
import headerImage from '../assets/CHOICEDGE BOQ PDF Header.png';
import footerImage from '../assets/CHOICEDGE BOQ PDF Footer.png';
import watermarkImage from '../assets/CHOICEDGE BOQ PDF watermark logo.png';
import { FiDownload, FiPrinter } from 'react-icons/fi';

interface BOQItem {
  id: number;
  description: string;
  specifications: string;
  materials: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Function to format numbers in Indian number system (e.g., 10,00,00,000)
const formatIndianNumber = (num: number): string => {
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  let formattedInteger = '';
  
  // Format the integer part with commas for Indian number system
  const length = integerPart.length;
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      formattedInteger = integerPart[length - 1 - i];
    } else if (i === 1 || i === 3 || i === 5 || i === 7 || i === 9) {
      formattedInteger = integerPart[length - 1 - i] + ',' + formattedInteger;
    } else {
      formattedInteger = integerPart[length - 1 - i] + formattedInteger;
    }
  }
  
  return `${formattedInteger}.${decimalPart}`;
};

interface ReviewPageProps {}

export function ReviewPage() {
  const location = useLocation();
  const { boqData } = location.state || {};

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation using the provided images
  };

  const calculateGST = (amount: number) => {
    return amount * 0.18;
  };

  const calculateProfessionalServices = (amount: number) => {
    const designVisualization = amount * 0.06;
    const projectManagement = amount * 0.04;
    return { designVisualization, projectManagement };
  };

  const subtotal = boqData?.items?.reduce((acc: number, item: BOQItem) => acc + item.amount, 0) || 0;
  const { designVisualization, projectManagement } = calculateProfessionalServices(subtotal);
  const gst = calculateGST(subtotal + designVisualization + projectManagement);
  const grandTotal = subtotal + designVisualization + projectManagement + gst;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <img src={headerImage} alt="CHOICEDGE Header" className="w-full" />
        </div>

        {/* Watermark */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <img src={watermarkImage} alt="CHOICEDGE Watermark" className="w-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Bill of Quantities</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <FiDownload />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FiPrinter />
                <span>Print BOQ</span>
              </button>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Client Name:</span> {boqData?.projectDetails?.clientName}</p>
                <p><span className="font-medium">Project Name:</span> {boqData?.projectDetails?.projectName}</p>
                <p><span className="font-medium">Location:</span> {boqData?.projectDetails?.location}</p>
                <p><span className="font-medium">Date:</span> {boqData?.generatedDate}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Project Type:</span> {boqData?.projectDetails?.projectType}</p>
                <p><span className="font-medium">Category:</span> {boqData?.selectedCategory?.type}</p>
                <p><span className="font-medium">Total Carpet Area:</span> {boqData?.projectDetails?.carpetArea} sq.ft</p>
              </div>
            </div>
          </div>

          {/* BOQ Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left border-b border-gray-200">S.No</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Description</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Specifications</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Materials</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Unit</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Quantity</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Rate</th>
                  <th className="py-3 px-4 text-left border-b border-gray-200">Amount</th>
                </tr>
              </thead>
              <tbody>
                {boqData?.items?.map((item: BOQItem) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4">{item.specifications}</td>
                    <td className="py-3 px-4">{item.materials}</td>
                    <td className="py-3 px-4">{item.unit}</td>
                    <td className="py-3 px-4">{formatIndianNumber(item.quantity)}</td>
                    <td className="py-3 px-4">{formatIndianNumber(item.rate)}</td>
                    <td className="py-3 px-4">{formatIndianNumber(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Cost Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatIndianNumber(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Design & Visualization (6%):</span>
                <span>{formatIndianNumber(designVisualization)}</span>
              </div>
              <div className="flex justify-between">
                <span>Project Management (4%):</span>
                <span>{formatIndianNumber(projectManagement)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>{formatIndianNumber(gst)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                <span>Grand Total:</span>
                <span>{formatIndianNumber(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>This BOQ is an estimate based on the provided information.</li>
              <li>Actual costs may vary based on site conditions and material availability.</li>
              <li>Taxes and permits are included in the final cost.</li>
              <li>The rates are based on current market prices and may be subject to change.</li>
              <li>Detailed specifications and materials are subject to client approval.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <img src={footerImage} alt="CHOICEDGE Footer" className="w-full" />
        </div>
      </div>
    </div>
  );
}