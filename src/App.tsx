import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ProjectType } from './pages/ProjectType';
import ProjectDetails from './pages/ProjectDetails';
import { CategorySelection } from './pages/CategorySelection';
import { BOQGeneration } from './pages/BOQGeneration';
import { ImageUpload } from './pages/ImageUpload';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen dark:bg-dark-bg dark:text-dark-text light:bg-light-bg light:text-light-text flex flex-col overflow-hidden relative">
          <div className="fixed top-4 right-4 z-50">
            {/* Only show theme toggle on pages other than Home */}
            {window.location.pathname !== '/' && <ThemeToggle />}
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project-type" element={<ProjectType />} />
            <Route path="/project-details" element={<ProjectDetails />} />
            <Route path="/category-selection" element={<CategorySelection />} />
            <Route path="/boq-generation" element={<BOQGeneration />} />
            <Route path="/image-upload" element={<ImageUpload />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
