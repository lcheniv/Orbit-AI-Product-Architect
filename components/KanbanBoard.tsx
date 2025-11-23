import React, { useState, useEffect } from 'react';
import { ArtifactData, ArtifactType, KanbanStatus } from '../types';
import { StoryIcon } from './Icons';

interface KanbanBoardProps {
  data: ArtifactData | null;
  onUpdateStatus: (id: string, newStatus: KanbanStatus) => void;
  onSelect: (item: ArtifactData) => void;
  isDarkMode: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, onUpdateStatus, onSelect, isDarkMode }) => {
  const [items, setItems] = useState<ArtifactData[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    const extracted: ArtifactData[] = [];
    const traverse = (node: ArtifactData) => {
      if (node.type === ArtifactType.STORY) {
        extracted.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(data);
    setItems(extracted);
  }, [data]);

  const columns: { id: KanbanStatus; title: string; color: string }[] = [
    { id: 'TODO', title: 'To Do', color: 'border-gray-300 dark:border-white/20' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-accent-cyan' },
    { id: 'DONE', title: 'Done', color: 'border-accent-purple' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    onUpdateStatus(id, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const simulateExport = (platform: string) => {
    setExporting(platform);
    setTimeout(() => {
      setExporting(null);
      alert(`Successfully exported ${items.length} items to ${platform}!`);
    }, 1500);
  };

  return (
    <div className="w-full h-full px-6 pb-6 pt-36 flex flex-col overflow-hidden animate-in fade-in duration-500">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-mono text-gray-900 dark:text-white tracking-widest">MISSION CONTROL // BOARD</h2>
        <div className="flex gap-2">
            <span className="text-xs text-gray-500 uppercase self-center mr-2">Export to:</span>
            <button onClick={() => simulateExport('Jira')} className="bg-[#0052CC] hover:bg-[#0047B3] text-white px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm">Jira</button>
            <button onClick={() => simulateExport('Trello')} className="bg-[#0079BF] hover:bg-[#026AA7] text-white px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm">Trello</button>
            <button onClick={() => simulateExport('Notion')} className="bg-white border border-gray-200 hover:bg-gray-100 text-black px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm">Notion</button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {columns.map(col => (
          <div 
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className={`flex flex-col h-full bg-white/50 dark:bg-space-800/50 rounded-xl border ${col.color} backdrop-blur-sm transition-colors`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <h3 className="font-mono font-bold text-sm tracking-wider text-gray-700 dark:text-white">{col.title}</h3>
                <span className="text-xs bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                    {items.filter(i => (i.status || 'TODO') === col.id).length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {items.filter(i => (i.status || 'TODO') === col.id).map(item => (
                 <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => onSelect(item)}
                    className="bg-white dark:bg-space-700 p-3 rounded shadow-sm border border-gray-100 dark:border-white/5 cursor-move hover:border-accent-cyan/50 dark:hover:border-accent-cyan/50 transition-all group"
                 >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1">
                            <StoryIcon className="w-3 h-3 text-accent-cyan" />
                            <span className="text-[10px] text-accent-cyan font-bold">STORY</span>
                        </div>
                        {item.storyPoints && (
                             <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/10 px-1.5 rounded text-gray-600 dark:text-gray-300">{item.storyPoints} pts</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{item.title}</p>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {exporting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-space-800 border border-accent-cyan p-8 rounded-xl flex flex-col items-center shadow-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan mb-4"></div>
                  <p className="text-accent-cyan font-mono animate-pulse">TRANSMITTING DATA...</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default KanbanBoard;