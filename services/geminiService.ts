
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfileData = async (email: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a realistic Instagram profile based on the email "${email}". 
      I need a creative username, a full name, and an engaging short bio. 
      The username should be unique and avoid excessive numbers.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING },
            fullName: { type: Type.STRING },
            bio: { type: Type.STRING }
          },
          required: ["username", "fullName", "bio"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback data
    return {
      username: `user_${Math.random().toString(36).substring(7)}`,
      fullName: "Insta User",
      bio: "Living life to the fullest! 📸✨"
    };
  }
};

export const generateAutomationLog = async (step: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a single, professional automation status message for an Instagram account creation tool at the step: "${step}". Make it sound like a high-tech server process.`,
    });
    return response.text.trim();
  } catch {
    return `Process step ${step} initiated...`;
  }
};
