import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArtifactData, ArtifactType } from "../types";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const artifactSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    epics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          benefitHypothesis: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                stories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      acceptanceCriteria: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      storyPoints: { type: Type.INTEGER }
                    },
                    required: ["title", "description", "acceptanceCriteria", "storyPoints"]
                  }
                }
              },
              required: ["title", "description", "stories"]
            }
          }
        },
        required: ["title", "description", "benefitHypothesis", "features"]
      }
    }
  }
};

export const generateProductBacklog = async (idea: string): Promise<ArtifactData> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert SAFe 6.0 (Scaled Agile Framework) Product Coach and Architect.
    Your goal is to take a raw product idea and break it down into a structured hierarchy:
    1. Epics (High-level initiatives)
    2. Features (Specific functionality delivering value)
    3. User Stories (Small, testable requirements)
    
    For each Story, estimate Fibonacci story points (1, 2, 3, 5, 8, 13) based on complexity.
    Ensure the output is JSON.
  `;

  const prompt = `Break down this product idea into a SAFe backlog: "${idea}". Create 1-2 Epics, each with 2-3 Features, and 2-3 Stories per Feature.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: artifactSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(text);

    // Transform API response into our internal Graph structure
    const rootArtifact: ArtifactData = {
      id: "root",
      type: ArtifactType.CORE,
      title: "Core Concept",
      description: idea,
      children: []
    };

    if (json.epics) {
      rootArtifact.children = json.epics.map((epic: any) => ({
        id: generateId(),
        type: ArtifactType.EPIC,
        title: epic.title,
        description: epic.description,
        benefitHypothesis: epic.benefitHypothesis,
        children: epic.features?.map((feature: any) => ({
          id: generateId(),
          type: ArtifactType.FEATURE,
          title: feature.title,
          description: feature.description,
          children: feature.stories?.map((story: any) => ({
            id: generateId(),
            type: ArtifactType.STORY,
            title: story.title,
            description: story.description,
            acceptanceCriteria: story.acceptanceCriteria,
            storyPoints: story.storyPoints
          }))
        }))
      }));
    }

    return rootArtifact;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const estimatePoints = async (storyDescription: string, acceptanceCriteria: string[]): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Estimate the Story Points (Fibonacci: 1, 2, 3, 5, 8, 13) for this user story. 
      Description: ${storyDescription}
      Acceptance Criteria: ${acceptanceCriteria.join(', ')}
      Return ONLY the number.`,
    });
    
    const text = response.text?.trim();
    const points = parseInt(text || "0", 10);
    return isNaN(points) ? 0 : points;
  } catch (e) {
    return 0;
  }
}