import dotenv from 'dotenv';
dotenv.config();

async function diagnostic() {
  const versions = ['v1', 'v1beta'];
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
  
  console.log("DIAGNOSING_GEMINI_API_VERSION_AND_MODELS...");
  
  for (const v of versions) {
    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hi" }] }]
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          console.log(`SUCCESS: Version ${v} with model ${m} is working.`);
          process.exit(0);
        } else {
          console.log(`FAILED: Version ${v} with model ${m} returned ${response.status}: ${data.error?.message}`);
        }
      } catch (err) {
        console.log(`CRASH: Version ${v} with model ${m} error: ${err.message}`);
      }
    }
  }
}

diagnostic();
