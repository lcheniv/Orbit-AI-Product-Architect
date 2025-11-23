import React from 'react';
import { Project } from '../types';
import { PlanetIcon } from './Icons';

interface ProjectSystemProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
}

const ProjectSystem: React.FC<ProjectSystemProps> = ({ projects, onSelectProject, onCreateNew }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden animate-in fade-in duration-1000">
      {/* Central Star - Create New */}
      <div 
        onClick={onCreateNew}
        className="relative z-10 w-32 h-32 rounded-full cursor-pointer group flex items-center justify-center transform hover:scale-110 transition-transform duration-500"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 animate-pulse-slow blur-lg opacity-50 group-hover:opacity-80"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_50px_rgba(255,165,0,0.4)]"></div>
        <div className="relative text-space-900 font-bold text-center z-20">
            <div className="text-3xl mb-1">+</div>
            <div className="text-[10px] uppercase font-mono tracking-widest">Create</div>
        </div>
      </div>

      {/* Orbiting Planets (Projects) */}
      <div className="absolute inset-0 pointer-events-none">
        {projects.map((project, idx) => {
            // Calculate position on a circle
            const angle = (idx / projects.length) * 2 * Math.PI;
            const radius = 250 + (idx % 2) * 50; // Stagger orbits
            const x = 50 + 25 * Math.cos(angle); // % based
            const y = 50 + 25 * Math.sin(angle); // % based
            
            return (
                <div 
                    key={project.id}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                    style={{ 
                        left: `calc(50% + ${Math.cos(angle) * radius}px)`, 
                        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                        animation: `float ${4 + idx}s ease-in-out infinite`
                    }}
                    onClick={() => onSelectProject(project)}
                >
                   <div className="w-20 h-20 transform group-hover:scale-125 transition-transform duration-300 relative">
                        <PlanetIcon className="w-full h-full drop-shadow-lg" fill={project.planetColor} />
                        <div className="absolute -inset-4 border border-dashed border-white/20 rounded-full animate-spin-slow" style={{ animationDuration: `${10 + idx * 2}s` }}></div>
                   </div>
                   <div className="mt-4 bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-center opacity-70 group-hover:opacity-100 transition-opacity">
                       <div className="text-sm font-bold text-white dark:text-white truncate max-w-[150px]">{project.name}</div>
                       <div className="text-[10px] text-gray-400 font-mono">{new Date(project.created).toLocaleDateString()}</div>
                   </div>
                </div>
            );
        })}
      </div>

      {projects.length === 0 && (
          <div className="absolute bottom-20 text-center text-gray-400 font-mono text-sm animate-pulse">
              System Empty. Initialize Core Concept.
          </div>
      )}
    </div>
  );
};

export default ProjectSystem;