import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize the client
// We create a new instance per call or keep a singleton. 
// Since we don't have complex state, a singleton or ad-hoc creation is fine.
// Using a simple function to get the client ensures we always pick up the environment variable.
const getClient = () => new GoogleGenAI({ apiKey: apiKey });

export const generateResumeSummary = async (
  jobTitle: string, 
  skills: string[], 
  experienceYears: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const ai = getClient();
  const prompt = `
    You are an expert career coach and professional resume writer.
    Write a compelling, professional resume summary (max 3-4 sentences) for a "${jobTitle}".
    Key skills: ${skills.join(', ')}.
    Experience level: ${experienceYears}.
    Focus on achievements, versatility, and professional value. Do not use "I" or "Me" overly much, keep it punchy.
    Return ONLY the summary text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const enhanceExperienceDescription = async (
  role: string,
  rawText: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = getClient();
  const prompt = `
    You are an expert resume writer.
    Rewrite the following job description bullet point(s) for the role of "${role}" to be more professional, action-oriented, and impactful.
    Use strong action verbs.
    
    Original text:
    "${rawText}"
    
    Return ONLY the improved text. If there are multiple points, separate them by newlines. Do not add markdown formatting like **bold**.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};