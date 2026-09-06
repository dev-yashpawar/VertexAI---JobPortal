import dotenv from 'dotenv';
dotenv.config();

async function findLatestModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.models) {
      console.error("NO_MODELS_FOUND:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const generationModels = data.models
      .filter(m => m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    console.log("BEST_GENERATION_MODELS:", JSON.stringify(generationModels, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("FETCH_ERROR:", error.message);
    process.exit(1);
  }
}

findLatestModels();
