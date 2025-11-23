import * as d3 from 'd3';

export enum ArtifactType {
  CORE = 'CORE',
  EPIC = 'EPIC',
  FEATURE = 'FEATURE',
  STORY = 'STORY'
}

export type KanbanStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ArtifactData {
  id: string;
  type: ArtifactType;
  title: string;
  description: string;
  // Specific fields based on SAFe
  benefitHypothesis?: string; // For Epics
  acceptanceCriteria?: string[]; // For Stories/Features
  storyPoints?: number; // For Stories
  children?: ArtifactData[];
  
  // New fields for Management
  status?: KanbanStatus;
  notes?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

export interface Project {
  id: string;
  name: string;
  created: number;
  data: ArtifactData;
  planetColor: string; // Hex color
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: ArtifactType;
  data: ArtifactData;
  r?: number; // radius
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export type GenerationStatus = 'IDLE' | 'THINKING' | 'GENERATING' | 'COMPLETE' | 'ERROR';