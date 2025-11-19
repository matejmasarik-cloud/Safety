import { GoogleGenAI } from "@google/genai";

export const enhanceDescription = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return text;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Vylepši nasledujúci krátky popis zlyhania z inšpekcie 5S/BOZP do profesionálneho a technicky presného slovenského jazyka. 
      Buď stručný, ale výstižný. Oprav gramatiku.
      
      Pôvodný text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error enhancing text with Gemini:", error);
    return text; // Fail gracefully returning original text
  }
};