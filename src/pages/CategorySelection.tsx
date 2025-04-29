import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface CategoryData {
  type: string;
  customRate?: number;
}

function CategorySelection() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryData>({ type: 'standard' });
  const [customRate, setCustomRate] = useState<string>('');
  const { theme } = useTheme();

  const handleCategoryChange = (type: string) => {
    setCategory({ type });
  };

  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = e.target.value;
    setCustomRate(rate);
    setCategory({
      type: 'custom',
      customRate: parseFloat(rate) || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('selectedCategory', JSON.stringify(category));
    navigate('/boq-generation');
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-bg text-dark-text' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-[#f1d49b]' : 'text-gray-800'}`}>Select Category & Costing</h1>
        <p className={`text-center mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Choose the category and costing for your project</p>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div onClick={() => handleCategoryChange('standard')} className={`flex flex-col items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border cursor-pointer ${category.type === 'standard' ? 'border-[#fae650] shadow-xl' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Standard</h3>
              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Basic finishes and materials</p>
            </div>

            <div onClick={() => handleCategoryChange('premium')} className={`flex flex-col items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border cursor-pointer ${category.type === 'premium' ? 'border-[#fae650] shadow-xl' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Premium</h3>
              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>High-quality finishes and materials</p>
            </div>

            <div onClick={() => handleCategoryChange('luxury')} className={`flex flex-col items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border cursor-pointer ${category.type === 'luxury' ? 'border-[#fae650] shadow-xl' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Luxury</h3>
              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Premium finishes and exclusive materials</p>
            </div>

            <div onClick={() => handleCategoryChange('custom')} className={`flex flex-col items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border cursor-pointer ${category.type === 'custom' ? 'border-[#fae650] shadow-xl' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Custom Costing</h3>
              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Define your own rate per square foot</p>
              {category.type === 'custom' && (
                <div className="mt-4 w-full max-w-xs">
                  <input
                    type="number"
                    value={customRate}
                    onChange={handleCustomRateChange}
                    className={`w-full py-2 px-3 border rounded focus:outline-none focus:border-[#fae650] ${theme === 'dark' ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Rate per Sq.ft (INR)"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#fae650] text-gray-800 font-bold py-2 px-8 rounded hover:bg-[#e6d33c] transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { CategorySelection };