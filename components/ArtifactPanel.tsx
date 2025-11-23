import React, { useState, useEffect } from 'react';
import { ArtifactData, ArtifactType } from '../types';
import { estimatePoints } from '../services/geminiService';
import { CoreIcon, EpicIcon, FeatureIcon, StoryIcon } from './Icons';

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
  onUpdate: (updatedArtifact: ArtifactData) => void;
}

const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ artifact, onClose, onUpdate }) => {
  const [reEstimating, setReEstimating] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (artifact) {
      setEditedTitle(artifact.title);
      setEditedDesc(artifact.description);
      setNotes(artifact.notes || '');
    }
  }, [artifact]);

  if (!artifact) return null;

  const handleSave = () => {
    onUpdate({
      ...artifact,
      title: editedTitle,
      description: editedDesc,
      notes: notes
    });
  };

  const handleReEstimate = async () => {
    if (artifact.type !== ArtifactType.STORY) return;
    setReEstimating(true);
    const points = await estimatePoints(editedDesc, artifact.acceptanceCriteria || []);
    onUpdate({
      ...artifact,
      storyPoints: points
    });
    setReEstimating(false);
  };

  const getIcon = (type: ArtifactType) => {
      switch(type) {
          case ArtifactType.CORE: return <CoreIcon className="w-4 h-4" />;
          case ArtifactType.EPIC: return <EpicIcon className="w-4 h-4" />;
          case ArtifactType.FEATURE: return <FeatureIcon className="w-4 h-4" />;
          case ArtifactType.STORY: return <StoryIcon className="w-4 h-4" />;
          default: return null;
      }
  }

  const getTypeColor = (type: ArtifactType) => {
    switch (type) {
      case ArtifactType.CORE: return 'text-yellow-600 dark:text-yellow-400 border-yellow-400';
      case ArtifactType.EPIC: return 'text-accent-purple border-accent-purple';
      case ArtifactType.FEATURE: return 'text-accent-cyan border-accent-cyan';
      default: return 'text-gray-600 dark:text-white border-gray-400 dark:border-white';
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white/90 dark:bg-space-800/90 backdrop-blur-xl border-l border-gray-200 dark:border-white/10 p-6 shadow-2xl overflow-y-auto transform transition-transform duration-300 z-30">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className={`inline-flex items-center gap-2 px-2 py-1 border rounded text-xs font-mono mb-4 ${getTypeColor(artifact.type)}`}>
        {getIcon(artifact.type)}
        {artifact.type}
      </div>

      <div className="space-y-4 mb-6">
        <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Title</label>
            <input 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSave}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/20 focus:border-accent-cyan text-gray-900 dark:text-white font-bold text-xl py-1 outline-none transition-colors"
            />
        </div>
        <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Description</label>
            <textarea 
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                onBlur={handleSave}
                rows={4}
                className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded p-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-accent-cyan transition-colors"
            />
        </div>
      </div>

      {/* Epic Specifics */}
      {artifact.type === ArtifactType.EPIC && artifact.benefitHypothesis && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
          <h3 className="text-accent-purple text-xs font-bold uppercase tracking-wider mb-2">Benefit Hypothesis</h3>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">"{artifact.benefitHypothesis}"</p>
        </div>
      )}

      {/* Story Specifics */}
      {artifact.type === ArtifactType.STORY && (
        <>
          <div className="mb-6">
            <h3 className="text-accent-cyan text-xs font-bold uppercase tracking-wider mb-3">Acceptance Criteria</h3>
            <ul className="space-y-2">
              {artifact.acceptanceCriteria?.map((ac, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-accent-cyan mt-1">•</span>
                  <span>{ac}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-space-700 dark:to-space-900 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Scrum Estimation</h3>
              <button 
                onClick={handleReEstimate}
                disabled={reEstimating}
                className="text-xs text-accent-cyan hover:underline disabled:opacity-50"
              >
                {reEstimating ? 'Consulting AI...' : 'Re-calculate'}
              </button>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="w-16 h-20 bg-white text-gray-900 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] font-mono border border-gray-200 dark:border-none">
                {artifact.storyPoints ?? '?'}
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Fibonacci Scale</p>
          </div>
        </>
      )}

      {/* Feature Specifics - Show Stats */}
      {artifact.type === ArtifactType.FEATURE && (
        <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-4">
           <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Breakdown</h3>
           <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 dark:bg-white/5 p-3 rounded text-center">
                 <div className="text-xl font-mono text-gray-900 dark:text-white">{artifact.children?.length || 0}</div>
                 <div className="text-[10px] text-gray-500 uppercase">Stories</div>
              </div>
              <div className="bg-gray-100 dark:bg-white/5 p-3 rounded text-center">
                 <div className="text-xl font-mono text-gray-900 dark:text-white">
                    {artifact.children?.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0) || 0}
                 </div>
                 <div className="text-[10px] text-gray-500 uppercase">Total Points</div>
              </div>
           </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-4">
        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-2 block">My Notes</label>
        <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add implementation notes, team assignments, or rough thoughts..."
            rows={4}
            className="w-full bg-gray-50 dark:bg-space-900/50 border border-gray-200 dark:border-white/10 rounded p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 outline-none focus:border-accent-purple transition-colors font-mono"
        />
      </div>

    </div>
  );
};

export default ArtifactPanel;