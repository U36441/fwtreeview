import React, { useState, type ReactNode } from 'react';
import { useTheme, themes } from './ThemeContext';
import TreeView from './TreeView';

interface Props {
  children: ReactNode;
}
    
export default function Layout({ children }: Props) {
  const { themeClass, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProgress(0);
      // read and parse json
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const obj = JSON.parse(text);
          setJsonData(obj);
        } catch (err) {
          console.error('file parse error', err);
          setJsonData(null);
        }
      };
      reader.readAsText(file);
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className={`flex items-center justify-between bg-gradient-to-r ${themeClass} text-white px-8 py-4 shadow-lg`}>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white text-3xl hover:bg-white/20 w-10 h-10 rounded flex items-center justify-center transition-colors"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold tracking-wide">FW Treeview</h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedFile && (
            <div className="flex items-center gap-2 bg-white/20 border border-white/40 rounded-lg p-2">
              <div className="w-32 bg-white/20 rounded-full h-1">
                <div
                  className="bg-white h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/80 whitespace-nowrap">{Math.round(progress)}%</p>
            </div>
          )}
          <div className="bg-white/20 border border-white/40 rounded-lg p-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="text-xs text-white cursor-pointer px-2 py-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white/30 file:text-white hover:bg-white/10 transition-colors"
              accept=".json,.xml,.csv,.txt"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-base transition-colors"
              title="Change Theme"
            >
              ⋯
            </button>
            {showThemePicker && (
              <div className="absolute -left-20 top-10 bg-white rounded-lg shadow-xl p-3 z-50 grid grid-cols-1 gap-2 w-32">
                {Object.keys(themes).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemePicker(false);
                    }}
                    className="px-4 py-2 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 capitalize text-left"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-gradient-to-b from-gray-100 to-blue-50 border-r border-gray-300 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0`}>
          <div className="p-6 space-y-6">
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-7xl mx-auto h-full">
            {jsonData ? <TreeView data={jsonData} /> : children}
          </div>
        </main>
      </div>
    </div>
  );
}
