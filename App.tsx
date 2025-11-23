import React, { useState, useEffect } from 'react';
import StarField from './components/StarField';
import GalaxyGraph from './components/GalaxyGraph';
import ArtifactPanel from './components/ArtifactPanel';
import KanbanBoard from './components/KanbanBoard';
import ProjectSystem from './components/ProjectSystem';
import { generateProductBacklog } from './services/geminiService';
import { ArtifactData, GenerationStatus, KanbanStatus, Project } from './types';

// Pre-canned innovative suggestions
const SUGGESTIONS = [
  "A decentralized marketplace for carbon credits on Mars",
  "AI-powered supply chain optimization for asteroid mining",
  "Social network for inter-planetary travelers with time-dilation chat",
  "Smart contract legal system for autonomous drone delivery fleets"
];

function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // App Logic State
  const [status, setStatus] = useState<GenerationStatus>('IDLE');
  const [ideaInput, setIdeaInput] = useState('');
  
  // Project Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactData | null>(null);
  const [viewMode, setViewMode] = useState<'GALAXY' | 'KANBAN'>('GALAXY');
  
  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load History
    const savedHistory = localStorage.getItem('orbit_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load Projects
    const savedProjects = localStorage.getItem('orbit_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    
    // Theme Init
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
    else document.documentElement.classList.add('dark'); // Default
  }, []);

  useEffect(() => {
     if (isDarkMode) document.documentElement.classList.add('dark');
     else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const saveProjects = (newProjects: Project[]) => {
      setProjects(newProjects);
      localStorage.setItem('orbit_projects', JSON.stringify(newProjects));
  }

  const addToHistory = (prompt: string) => {
    const newHistory = [prompt, ...history.filter(h => h !== prompt)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('orbit_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async (prompt?: string) => {
    const textToUse = prompt || ideaInput;
    if (!textToUse.trim()) return;
    
    setIdeaInput(textToUse);
    addToHistory(textToUse);
    setShowHistory(false);
    
    setStatus('THINKING');
    
    try {
      const result = await generateProductBacklog(textToUse);
      
      // Create new Project
      const newProject: Project = {
          id: Math.random().toString(36).substr(2, 9),
          name: textToUse.substring(0, 30) + (textToUse.length > 30 ? '...' : ''),
          created: Date.now(),
          data: result,
          planetColor: ['#7000FF', '#00F0FF', '#FF00C7', '#FFD700', '#FF4500'][Math.floor(Math.random() * 5)]
      };
      
      saveProjects([...projects, newProject]);
      setActiveProject(newProject);
      setIsCreating(false);
      setStatus('COMPLETE');
      setIdeaInput('');
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  };

  const handleUpdateArtifact = (updated: ArtifactData) => {
    if (!activeProject) return;

    const updateTree = (node: ArtifactData): ArtifactData => {
      if (node.id === updated.id) return updated;
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => updateTree(child))
        };
      }
      return node;
    };

    const newData = updateTree(activeProject.data);
    const updatedProject = { ...activeProject, data: newData };
    
    setActiveProject(updatedProject);
    saveProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedArtifact(updated); 
  };

  const handleKanbanStatusUpdate = (id: string, newStatus: KanbanStatus) => {
     if(!activeProject) return;
     
     const updateStatusInTree = (node: ArtifactData): ArtifactData => {
        if (node.id === id) {
            return { ...node, status: newStatus };
        }
        if (node.children) {
            return {
                ...node,
                children: node.children.map(child => updateStatusInTree(child))
            };
        }
        return node;
     };

     const newData = updateStatusInTree(activeProject.data);
     const updatedProject = { ...activeProject, data: newData };
     setActiveProject(updatedProject);
     saveProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500 bg-lab-50 dark:bg-space-900">
      {/* Background Layer */}
      <StarField isDarkMode={isDarkMode} />

      {/* Header / Logo */}
      <header className="absolute top-0 left-0 p-6 z-20 flex items-center justify-between w-full pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setIsCreating(false); }}>
            <div className="w-10 h-10 bg-white dark:bg-white rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 8L3 16L9 22H16L21 15L19 6L12 2Z" stroke="#0B0D17" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2" fill="#0B0D17"/>
                <circle cx="15" cy="14" r="1.5" fill="#0B0D17"/>
            </svg>
            </div>
            <div>
            <h1 className="text-xl font-bold tracking-widest font-mono text-gray-900 dark:text-white">ORBIT</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Product Architect</p>
            </div>
        </div>

        <div className="pointer-events-auto flex gap-4">
             {/* View Toggle */}
            {activeProject && (
                <div className="bg-white/50 dark:bg-space-800/80 backdrop-blur rounded-full p-1 border border-gray-200 dark:border-white/10 flex gap-1">
                    <button 
                        onClick={() => setViewMode('GALAXY')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'GALAXY' ? 'bg-accent-purple text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        UNIVERSE
                    </button>
                    <button 
                        onClick={() => setViewMode('KANBAN')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'KANBAN' ? 'bg-accent-cyan text-space-900 shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        BOARD
                    </button>
                </div>
            )}
            
            {/* Theme Toggle */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-space-800/80 backdrop-blur border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-space-700 transition-colors"
            >
                {isDarkMode ? '☀' : '☾'}
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col">
        
        {/* Creating / Generating State */}
        {isCreating || status === 'THINKING' ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto px-6 text-center relative">
            <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight animate-in slide-in-from-bottom-4 fade-in duration-700">
              Turn your <span className="text-accent-cyan font-bold">Concept</span> into a 
              <br/>
              <span className="text-accent-purple font-bold">Universe</span> of Details.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Enter a product idea. Orbit uses AI to instantly generate SAFe artifacts mapped in a solar system visualization.
            </p>
            
            <div className="w-full relative group z-30">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-space-800 ring-1 ring-gray-200 dark:ring-white/10 rounded-lg p-1 flex items-center shadow-xl">
                <input
                  type="text"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="E.g. A mobile app for dog walkers with real-time GPS tracking..."
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-4 outline-none font-mono"
                  disabled={status === 'THINKING'}
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={status === 'THINKING' || !ideaInput.trim()}
                  className="bg-gray-900 dark:bg-white text-white dark:text-space-900 px-6 py-2 rounded font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === 'THINKING' ? 'IGNITING...' : 'LAUNCH'}
                </button>
              </div>

              {/* Suggestions / History Dropdown */}
              {showHistory && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-space-800/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="p-2">
                          <div className="text-[10px] text-gray-500 uppercase font-bold px-3 py-1">Recent Missions</div>
                          {history.length === 0 && <div className="text-sm text-gray-400 px-3 py-2 italic">No previous missions.</div>}
                          {history.map((h, i) => (
                              <div key={i} onClick={() => handleGenerate(h)} className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {h}
                              </div>
                          ))}
                      </div>
                      <div className="border-t border-gray-200 dark:border-white/10 p-2 bg-gray-50 dark:bg-black/20">
                           <div className="text-[10px] text-accent-cyan uppercase font-bold px-3 py-1">Try Something New</div>
                           {SUGGESTIONS.map((s, i) => (
                               <div key={i} onClick={() => handleGenerate(s)} className="cursor-pointer px-3 py-2 hover:bg-accent-cyan/10 rounded text-sm text-gray-900 dark:text-white truncate flex items-center gap-2">
                                   <span className="text-accent-cyan">★</span> {s}
                               </div>
                           ))}
                      </div>
                      <div className="p-2 text-center border-t border-gray-200 dark:border-white/10">
                          <button onClick={() => setShowHistory(false)} className="text-xs text-gray-500 hover:text-black dark:hover:text-white">Close</button>
                      </div>
                  </div>
              )}
            </div>
            
            {status === 'ERROR' && (
               <p className="text-red-500 mt-4 text-sm font-mono bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded border border-red-500/50">Mission Failed: Unable to generate artifacts. Please try again.</p>
            )}
            
            <button onClick={() => setIsCreating(false)} className="mt-8 text-sm text-gray-500 hover:underline">Cancel</button>
          </div>
        ) : (
          // View Mode (System or Project)
          <div className="w-full h-full relative animate-in fade-in duration-700 flex flex-col">
             {!activeProject ? (
                 <ProjectSystem 
                    projects={projects} 
                    onSelectProject={setActiveProject} 
                    onCreateNew={() => setIsCreating(true)} 
                 />
             ) : (
                 <div className="flex-1 relative overflow-hidden">
                    {viewMode === 'GALAXY' ? (
                        <GalaxyGraph 
                            data={activeProject.data} 
                            onNodeSelect={setSelectedArtifact} 
                            isDarkMode={isDarkMode}
                        />
                    ) : (
                        <KanbanBoard 
                            data={activeProject.data} 
                            onUpdateStatus={handleKanbanStatusUpdate} 
                            onSelect={setSelectedArtifact} 
                            isDarkMode={isDarkMode}
                        />
                    )}
                    
                    {/* Back Button */}
                    <div className="absolute top-24 left-6 z-10">
                         <button 
                            onClick={() => setActiveProject(null)}
                            className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-accent-cyan flex items-center gap-2"
                         >
                            ← SYSTEM VIEW
                         </button>
                    </div>
                 </div>
             )}
          </div>
        )}
      </main>

      {/* Right Panel - Always available for editing */}
      <ArtifactPanel 
        artifact={selectedArtifact} 
        onClose={() => setSelectedArtifact(null)} 
        onUpdate={handleUpdateArtifact}
      />
      
      {/* Click outside to close history */}
      {showHistory && (
          <div className="fixed inset-0 z-0" onClick={() => setShowHistory(false)}></div>
      )}
    </div>
  );
}

export default App;