import React from 'react';
import { ArtifactType } from '../types';

export const CoreIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const EpicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8" />
    <path d="M3.6 15h16.8" />
    <path d="M11.5 3a17 17 0 0 0 0 18" />
    <path d="M12.5 3a17 17 0 0 1 0 18" />
  </svg>
);

export const FeatureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2l8 4.5v9L12 22 4 15.5v-9L12 2z" />
  </svg>
);

export const StoryIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const PlanetIcon = ({ className, fill }: { className?: string, fill?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <defs>
            <radialGradient id={`planetGrad-${fill}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor={fill || '#7000FF'} stopOpacity="1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#planetGrad-${fill})`} />
        <path d="M10,50 Q50,90 90,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    </svg>
);

export const getIconComponent = (type: ArtifactType) => {
    switch (type) {
        case ArtifactType.CORE: return CoreIcon;
        case ArtifactType.EPIC: return EpicIcon;
        case ArtifactType.FEATURE: return FeatureIcon;
        case ArtifactType.STORY: return StoryIcon;
        default: return CoreIcon;
    }
};

// Returns SVG path string for D3
export const getIconPath = (type: ArtifactType) => {
    switch(type) {
        case ArtifactType.CORE: 
            return "M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"; // Sunish
        case ArtifactType.EPIC:
            return "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"; // Shield
        case ArtifactType.FEATURE:
            return "M12 2l8 4.5v9L12 22 4 15.5v-9L12 2z"; // Hexagon
        case ArtifactType.STORY:
            return "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"; // Layers/Stack
        default:
            return "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z";
    }
}