import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface ProjectDetails {
  layoutType?: string;
  carpetArea?: number;
  numberOfRooms?: string;
  officeType?: string;
  numberOfFloors?: string;
  specialRequirements?: string;
  hotelType?: string;
  amenities?: string[];
  factoryType?: string;
  area?: number;
  machinery?: string;
  location?: string;
  storage?: string;
  clientName?: string;
  projectName?: string;
}

const ProjectDetails: React.FC = () => {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState<string>('');
  const [details, setDetails] = useState<ProjectDetails>({});

  useEffect(() => {
    const storedType = localStorage.getItem('projectType');
    if (!storedType) {
      navigate('/project-type');
      return;
    }
    setProjectType(storedType);
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('projectDetails', JSON.stringify(details));
    navigate('/category-selection');
  };

  const renderResidentialFields = () => (
    <>
      <div className="mb-4">
        <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</label>
        <input
          type="text"
          name="clientName"
          value={details.clientName || ''}
          onChange={handleInputChange}
          className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
          placeholder="Enter client name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Project Name (Optional)</label>
        <input
          type="text"
          name="projectName"
          value={details.projectName || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter project name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Layout Type</label>
        <select
          name="layoutType"
          value={details.layoutType || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Layout Type</option>
          <option value="1BHK">1 BHK</option>
          <option value="2BHK">2 BHK</option>
          <option value="3BHK">3 BHK</option>
          <option value="4BHK">4 BHK</option>
          <option value="5BHK">5 BHK</option>
          <option value="Villa">Villa</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Carpet Area (sq ft)</label>
        <input
          type="number"
          name="carpetArea"
          value={details.carpetArea || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      {(details.layoutType === 'Villa' || details.layoutType === 'Custom') && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Number of Bedrooms</label>
            <input
              type="number"
              name="numberOfRooms"
              value={details.numberOfRooms || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter number of bedrooms"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Special Requirements</label>
            <textarea
              name="specialRequirements"
              value={details.specialRequirements || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter any special requirements"
              rows={3}
            />
          </div>
        </>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={details.location || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter project location"
          required
        />
      </div>
    </>
  );

  const renderCommercialFields = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={details.clientName || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter client name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Office Type</label>
        <select
          name="officeType"
          value={details.officeType || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Office Type</option>
          <option value="Corporate">Corporate Office</option>
          <option value="Retail">Retail Space</option>
          <option value="Mixed">Mixed Use</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Number of Floors</label>
        <input
          type="number"
          name="numberOfFloors"
          value={details.numberOfFloors || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Carpet Area (sq ft)</label>
        <input
          type="number"
          name="carpetArea"
          value={details.carpetArea || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={details.location || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter project location"
          required
        />
      </div>
    </>
  );

  const renderIndustrialFields = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={details.clientName || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter client name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Factory Type</label>
        <select
          name="factoryType"
          value={details.factoryType || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Factory Type</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Processing">Processing</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Total Area (sq ft)</label>
        <input
          type="number"
          name="area"
          value={details.area || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Machinery Requirements</label>
        <textarea
          name="machinery"
          value={details.machinery || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter machinery requirements"
          rows={3}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Storage Requirements</label>
        <textarea
          name="storage"
          value={details.storage || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter storage requirements"
          rows={3}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={details.location || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter project location"
          required
        />
      </div>
    </>
  );

  const renderHospitalityFields = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={details.clientName || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter client name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Hotel Type</label>
        <select
          name="hotelType"
          value={details.hotelType || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Hotel Type</option>
          <option value="Luxury">Luxury Hotel</option>
          <option value="Business">Business Hotel</option>
          <option value="Resort">Resort</option>
          <option value="Boutique">Boutique Hotel</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Number of Rooms</label>
        <input
          type="number"
          name="numberOfRooms"
          value={details.numberOfRooms || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Total Area (sq ft)</label>
        <input
          type="number"
          name="area"
          value={details.area || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={details.location || ''}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter project location"
          required
        />
      </div>
    </>
  );

  const { theme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-[#f1d49b]' : 'text-gray-800'}`}>Project Details</h1>
        <p className={`text-center mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fill in the details for your {projectType} project</p>
        
        <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-white'}`}>
          {projectType === 'residential' && renderResidentialFields()}
          {projectType === 'commercial' && renderCommercialFields()}
          {projectType === 'industrial' && renderIndustrialFields()}
          {projectType === 'hospitality' && renderHospitalityFields()}
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate('/project-type')}
              className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
            >
              Back
            </button>
            <button
              type="submit"
              className={`font-bold py-2 px-4 rounded hover:bg-[#e6d33c] transition-colors ${theme === 'dark' ? 'bg-[#f1d49b] text-black' : 'bg-[#fae650] text-gray-800'}`}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProjectDetails;