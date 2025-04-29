import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, Loader2, X } from 'lucide-react';
import { processImagesWithGemini, parseGeminiResponse } from '../services/geminiService';
import { BOQData } from '../types/boqTypes';

export function ImageUpload() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Check if the browser supports the camera API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser');
      }

      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If permission granted, trigger the camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      setProcessingStatus(error.message || 'Failed to access camera');
      setTimeout(() => setProcessingStatus(''), 3000);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (selectedFiles.length === 0) return;
    
    setShowConfirm(true);
    setIsProcessing(true);
    setProcessingStatus('Uploading images...');
    
    try {
      // Process images with Gemini API
      setProcessingStatus('Analyzing handwritten content...');
      const geminiResponse = await processImagesWithGemini(selectedFiles);
      
      setProcessingStatus('Extracting BOQ data...');
      const parsedData = parseGeminiResponse(geminiResponse);
      
      // Create BOQ data structure
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const boqData: BOQData = {
        projectDetails: parsedData.projectDetails,
        selectedCategory: { id: '1', type: parsedData.projectDetails.projectType || 'standard', description: '' },
        items: parsedData.items,
        generatedDate: today
      };
      
      // Store the extracted data in localStorage
      localStorage.setItem('projectDetails', JSON.stringify(parsedData.projectDetails));
      localStorage.setItem('selectedCategory', JSON.stringify({ id: '1', type: parsedData.projectDetails.projectType || 'standard', description: '' }));
      localStorage.setItem('extractedBOQItems', JSON.stringify(parsedData.items));
      
      // Navigate to BOQ generation page
      navigate('/boq-generation', { state: { fromImageUpload: true } });
    } catch (error: any) {
      console.error('Error processing BOQ images:', error);
      
      // Display a more specific error message based on the error type
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('API key error')) {
        setProcessingStatus('Authentication error. Please contact support.');
      } else if (errorMessage.includes('API quota exceeded')) {
        setProcessingStatus('Service temporarily unavailable. Please try again later.');
      } else if (errorMessage.includes('Network error')) {
        setProcessingStatus('Network error. Please check your internet connection.');
      } else if (errorMessage.includes('unsupported format')) {
        setProcessingStatus('Unsupported image format. Please use JPEG or PNG files.');
      } else if (errorMessage.includes('exceeds size limit')) {
        setProcessingStatus('Image too large. Please use images under 20MB.');
      } else {
        setProcessingStatus(`Error: ${errorMessage}`);
      }
      
      setTimeout(() => {
        setShowConfirm(false);
        setIsProcessing(false);
      }, 5000); // Increased timeout to give users more time to read the error
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-8 bg-black flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-light text-[#fae650] font-acherus-feral tracking-wider mb-8">Upload BOQ Images</h1>
        
        <div className="w-full max-w-md space-y-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-[#fae650] rounded-lg hover:bg-[#fae650] hover:text-black transition-all duration-300 text-white"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span>Upload Files</span>
            </button>
            
            <button
              onClick={handleCameraCapture}
              className="flex flex-col items-center justify-center p-6 border-2 border-[#fae650] rounded-lg hover:bg-[#fae650] hover:text-black transition-all duration-300 text-white"
            >
              <Camera className="w-8 h-8 mb-2" />
              <span>Use Camera</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
            capture="environment"
          />

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white mb-2">Selected Files ({selectedFiles.length}):</h3>
                <ul className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-gray-300 flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-[#fae650]" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-[#fae650] transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-[#fae650] text-black font-semibold rounded-lg hover:bg-[#fae650]/80 transition-colors duration-300"
                disabled={showConfirm}
              >
                {showConfirm ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{processingStatus || 'Processing...'}</span>
                  </div>
                ) : 'Confirm Selection'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}