// src/services/aiService.ts
import axios from "axios";

interface AIResponse {
  diagnosis: string;
  confidence: number;
  recommendations: string;
}

export const analyzeSkin = async (imageUrl: string): Promise<AIResponse> => {
  const aiApiUrl = "https://flask-ai-api-production.up.railway.app/analyze"; // Replace if deployed

  const response = await axios.post<AIResponse>("http://localhost:5001/analyze", {
    imageUrl,
  });
  
  return response.data;
};
