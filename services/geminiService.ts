import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DisasterType, Incident, SeverityLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIncidentReport = async (
  description: string, 
  imageBase64?: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      You are a disaster management AI assistant. Analyze the following incident report.
      Determine the severity level (Low, Medium, High, Critical), the category of disaster, 
      provide a short professional summary (max 20 words), and give 1 sentence of immediate safety advice.
      
      Report Description: "${description}"
    `;

    const parts: any[] = [{ text: prompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: [SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.CRITICAL] },
            category: { type: Type.STRING, enum: [DisasterType.FLOOD, DisasterType.FIRE, DisasterType.ACCIDENT, DisasterType.EARTHQUAKE, DisasterType.OTHER] },
            summary: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          required: ["severity", "category", "summary", "advice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback
    return {
      severity: SeverityLevel.MEDIUM,
      category: DisasterType.OTHER,
      summary: "Analysis failed. Manual review required.",
      advice: "Stay safe and wait for responders."
    };
  }
};

export const findNearbyResources = async (latitude: number, longitude: number, queryType: string) => {
  try {
    const prompt = `Find ${queryType} near latitude ${latitude}, longitude ${longitude}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            retrievalConfig: {
                latLng: { latitude, longitude }
            }
        }
      }
    });

    // Extract grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return {
      text: response.text,
      chunks: chunks || []
    };

  } catch (error) {
    console.error("Resource lookup failed:", error);
    return { text: "Could not fetch nearby resources at this time.", chunks: [] };
  }
};

export const getDashboardInsight = async (incidents: Incident[]): Promise<string> => {
  try {
    if (incidents.length === 0) return "No active incidents. Systems operational and monitoring.";

    const incidentSummaries = incidents
        .slice(0, 5)
        .map(i => `${i.type} (${i.severity}): ${i.title}`)
        .join('; ');

    const prompt = `
      You are a tactical operations commander AI.
      Based on these current active incidents: "${incidentSummaries}".
      Provide a 1-sentence strategic situation report (SitRep) for the dashboard. 
      Focus on resource allocation or general public safety advice.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Monitor active incidents and ensure resources are available.";
  } catch (error) {
    return "Unable to generate situation report.";
  }
};