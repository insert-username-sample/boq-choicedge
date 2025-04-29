import React from 'react';
import { useNavigate } from 'react-router-dom';
import choicedgeLogo from '../assets/CompleteCHOICEDGELogo.png';
import { FileText, Camera } from 'lucide-react';
import GlowingButton from '../components/GlowingButton';

export function Home() {
  const navigate = useNavigate();

  const handleCreateBOQ = () => {
    navigate('/project-type');
  };

  const handleImageUpload = () => {
    navigate('/image-upload');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-4 py-8 bg-black flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <img src={choicedgeLogo} alt="CHOICEDGE Logo" className="w-[300px] h-auto mx-auto mb-4" />
          <h1 className="text-4xl font-light text-[#fae650] font-acherus-feral tracking-wider">Create a BOQ</h1>
        </div>

        <div className="flex flex-row gap-6 w-full max-w-4xl px-4 justify-center">
          <GlowingButton
            text="Create BOQ from Scratch"
            onClick={handleCreateBOQ}
            className="w-full h-[200px] flex flex-col items-center justify-center gap-4"
            icon={<FileText className="w-8 h-8 text-white group-hover:text-black transition-colors duration-300" />}
          >
            <p className="text-black mt-2 text-sm">Start fresh and create a detailed BOQ step by step</p>
          </GlowingButton>

          <GlowingButton
            text="Upload Handwritten BOQ"
            onClick={handleImageUpload}
            className="w-full h-[200px] flex flex-col items-center justify-center gap-4"
            icon={<Camera className="w-8 h-8 text-white group-hover:text-black transition-colors duration-300" />}
          >
            <p className="text-black mt-2 text-sm">Convert your handwritten BOQ by uploading images</p>
          </GlowingButton>
        </div>
      </div>
    </div>
  );
}
