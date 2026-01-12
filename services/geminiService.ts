
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReminderMessage = async (clientName: string, service: string, time: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a sophisticated and friendly WhatsApp reminder for a client named ${clientName} who has a ${service} appointment today at ${time} at 'MrSanntana Barber Shop'. Use a premium, masculine, and welcoming tone.`,
  });
  return response.text;
};

export const getBusinessInsights = async (appointments: any[]) => {
  const dataSummary = JSON.stringify(appointments);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these barber shop appointments and provide 3 brief strategic suggestions to increase revenue or customer loyalty: ${dataSummary}. Format as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '[]');
};
