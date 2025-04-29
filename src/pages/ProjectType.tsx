import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Factory, Hotel } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ProjectType() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { theme } = useTheme();

  const projectTypes = [
    {
      icon: <Home className="w-12 h-12 text-gray-800" />,
      title: 'Residential',
      description: 'Single-family homes, apartments, and residential complexes'
    },
    {
      icon: <Building2 className="w-12 h-12 text-gray-800" />,
      title: 'Commercial',
      description: 'Office buildings, retail spaces, and commercial developments'
    },
    {
      icon: <Factory className="w-12 h-12 text-gray-800" />,
      title: 'Industrial',
      description: 'Manufacturing facilities, warehouses, and industrial spaces'
    },
    {
      icon: <Hotel className="w-12 h-12 text-gray-800" />,
      title: 'Hospitality',
      description: 'Hotels, resorts, and hospitality establishments'
    }
  ];

  const handleTypeSelect = (title: string) => {
    setSelectedType(title);
    localStorage.setItem('projectType', title.toLowerCase());
    navigate('/project-details', { state: { projectType: title.toLowerCase() } });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-bg text-dark-text' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-[#f1d49b]' : 'text-gray-800'}`}>Select Project Type</h1>
        <p className={`text-center mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Choose the type of your construction project</p>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projectTypes.map((type) => (
            <div
              key={type.title}
              onClick={() => handleTypeSelect(type.title)}
              className={`flex flex-col items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border cursor-pointer ${selectedType === type.title ? 'border-[#fae650] shadow-xl' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white'}`}
            >
              <div className="mb-4">{React.cloneElement(type.icon, { className: 'w-12 h-12 text-[#fae650]' })}</div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{type.title}</h3>
              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}