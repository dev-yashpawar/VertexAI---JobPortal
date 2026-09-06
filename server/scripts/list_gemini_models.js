import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: The SDK might not have a direct listModels, we might need to use the REST API via fetch or check the latest SDK docs.
    // In @google/generative-ai, listing models is typically done via the client.
    console.log("FETCHING_MODELS_FROM_API...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("AVAILABLE_MODELS:", JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("FAILED_TO_LIST_MODELS:", error.message);
    process.exit(1);
  }
}

listModels();
