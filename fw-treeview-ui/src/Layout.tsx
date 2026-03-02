import React, { ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
}
    
export default function Layout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProgress(0);
      // Auto-process the file with progress simulation
      console.log('Processing tree for:', file.name);
      
      // Simulate progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 300);
      // Add tree generation logic here
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white px-8 py-4 shadow-lg">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white text-3xl hover:bg-white/20 w-10 h-10 rounded flex items-center justify-center transition-colors"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold tracking-wide">FW Treeview</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-gradient-to-b from-gray-100 to-blue-50 border-r border-gray-300 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0`}>
          <div className="p-6 space-y-6">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2 hover:bg-gray-100 transition-colors"
                accept=".json,.xml,.csv,.txt"
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Processing: {selectedFile.name}
                </p>
              )}
              {selectedFile && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{Math.round(progress)}%</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
