import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';

// Setup Gemini client lazily
let _genAI;
const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.error('FATAL: GEMINI_API_KEY is not set in environment variables.');
      throw new Error('GEMINI_API_KEY is missing from environment variables');
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI.getGenerativeModel({ model: modelName });
};

const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];
const SKILL_LIBRARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Next.js', 'Vue', 'Angular', 'Redux', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Firebase',
  'REST API', 'GraphQL', 'Microservices',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub',
  'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Power BI', 'Tableau', 'Data Analysis', 'Data Visualization',
  'Android', 'iOS', 'React Native', 'Flutter',
  'Linux', 'Agile', 'Scrum', 'Problem Solving', 'Communication'
];
const SKILL_ALIASES = {
  'Node': 'Node.js',
  'Express': 'Express.js',
  'React.js': 'React',
  'JS': 'JavaScript',
  'TS': 'TypeScript',
  'ML': 'Machine Learning',
  'AI': 'Artificial Intelligence',
  'AI/ML': 'Machine Learning',
  'MERN': 'MERN Stack',
  'MERN Stack': 'MERN Stack',
  'NLP': 'NLP',
  'PowerBI': 'Power BI',
  'Github': 'GitHub',
};
const CHAT_CACHE_TTL_MS = 5 * 60 * 1000;
const CHAT_CACHE_MAX_SIZE = 500;
const chatResponseCache = new Map();

// Helper to check and reset credits daily
const resetCreditsIfNecessary = (user) => {
  const now = new Date();
  const lastReset = new Date(user.lastCreditReset || 0);
  const diffHours = (now - lastReset) / (1000 * 60 * 60);

  if (diffHours >= 24) {
    user.aiCredits = 10;
    user.lastCreditReset = now;
    return true;
  }
  return false;
};

const extractJsonFromText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Gemini response is empty or invalid');
  }

  const cleaned = rawText.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try parsing fenced JSON blocks.
    const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      return JSON.parse(fencedMatch[1].trim());
    }

    // Try parsing first JSON object segment.
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
  }

  throw new Error('Failed to parse JSON from Gemini response');
};

const normalizeAssistantReply = (text) => {
  if (!text || typeof text !== 'string') return '';

  const normalized = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const cleaned = line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^\*\s+/, '• ')
        .replace(/^-+\s+/, '• ')
        .replace(/^\d+\.\s+/, (m) => m.replace('.', ')'));
      return cleaned;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized;
};

const countApproxWords = (input) => {
  const text = String(input || '')
    .replace(/^\s*(quick answer|next step)\s*:\s*/gim, ' ')
    .replace(/^\s*\d+\)\s*/gim, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return 0;
  const words = text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g);
  return words ? words.length : 0;
};

const buildExpandPrompt = ({ roleSystemPrompt, draft, minWords, maxWords }) => {
  const draftWordCount = countApproxWords(draft);
  return `${roleSystemPrompt}

Your previous draft is too short (${draftWordCount} words).
Rewrite it to be ${minWords}-${maxWords} words total (excluding the headings).
Keep the exact structure and formatting rules.
Use 4 points (1-4), each one sentence with at least 12 words.
The "Next step" must be exactly 1 sentence.

Draft:
${draft}`;
};

const normalizeCacheMessage = (message) =>
  String(message || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getCacheKey = ({ userId, role, message }) => {
  const normalizedMessage = normalizeCacheMessage(message);
  const messageHash = crypto.createHash('sha256').update(normalizedMessage).digest('hex');
  return `${String(userId)}::${String(role)}::${messageHash}`;
};

const pruneChatCache = () => {
  const now = Date.now();
  for (const [key, value] of chatResponseCache.entries()) {
    if (!value || value.expiresAt <= now) {
      chatResponseCache.delete(key);
    }
  }
  if (chatResponseCache.size > CHAT_CACHE_MAX_SIZE) {
    chatResponseCache.clear();
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeDetectedSkill = (skill) => SKILL_ALIASES[skill] || skill;

const extractSkillsFromText = (resumeText) => {
  const normalizedText = String(resumeText || '').replace(/\s+/g, ' ').trim();
  const foundSkills = new Set();

  for (const skill of SKILL_LIBRARY) {
    const flexibleSkill = escapeRegex(skill)
      .replace(/\\ /g, '\\s+')
      .replace(/\\\./g, '[.]?');
    const pattern = new RegExp(`(^|[^A-Za-z0-9+#])${flexibleSkill}([^A-Za-z0-9+#]|$)`, 'i');
    if (pattern.test(normalizedText)) {
      foundSkills.add(normalizeDetectedSkill(skill));
    }
  }

  const colonSectionMatches = normalizedText.matchAll(/(?:Programming|Technical Skills|AI\/ML|Web Development|Tools|Databases?)\s*:\s*([^•\n]+)/gi);
  for (const match of colonSectionMatches) {
    const parts = String(match[1] || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    for (const part of parts) {
      const cleaned = part.replace(/\bbasics?\b/gi, '').trim();
      if (!cleaned) continue;

      if (/^mern(\s+stack)?$/i.test(cleaned)) {
        ['MongoDB', 'Express.js', 'React', 'Node.js', 'MERN Stack'].forEach((skill) => foundSkills.add(skill));
        continue;
      }

      const alias = normalizeDetectedSkill(cleaned);
      if (SKILL_LIBRARY.includes(alias) || Object.values(SKILL_ALIASES).includes(alias)) {
        foundSkills.add(alias);
      }
    }
  }

  if (/machine learning/i.test(normalizedText)) foundSkills.add('Machine Learning');
  if (/data analysis/i.test(normalizedText)) foundSkills.add('Data Analysis');
  if (/data preprocessing/i.test(normalizedText)) foundSkills.add('Data Preprocessing');
  if (/model evaluation/i.test(normalizedText)) foundSkills.add('Model Evaluation');
  if (/streamlit/i.test(normalizedText)) foundSkills.add('Streamlit');
  if (/computer vision/i.test(normalizedText)) foundSkills.add('Computer Vision');
  if (/linear regression/i.test(normalizedText)) foundSkills.add('Linear Regression');
  if (/classification/i.test(normalizedText)) foundSkills.add('Classification');
  if (/artificial intelligence/i.test(normalizedText)) foundSkills.add('Artificial Intelligence');

  return Array.from(foundSkills);
};

const buildHeuristicResumeAnalysis = (resumeText, resumeHash) => {
  const normalizedText = resumeText.replace(/\s+/g, ' ').trim();
  const normalizedLower = normalizedText.toLowerCase();
  const skills = extractSkillsFromText(normalizedText);
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalizedText);
  const hasPhone = /(\+?\d[\d\s()-]{7,}\d)/.test(normalizedText);
  const hasLinkedIn = /linkedin\.com/i.test(normalizedLower);
  const hasGithub = /github\.com/i.test(normalizedLower);
  const hasProjects = /\bprojects?\b/i.test(normalizedText);
  const hasExperience = /\bexperience\b/i.test(normalizedText);
  const hasEducation = /\beducation\b/i.test(normalizedText);
  const hasMetrics = /\b\d+%|\b\d+\+|\b\d+\s*(users|clients|projects|years|months|apps|features)\b/i.test(normalizedText);

  let score = 25;
  if (hasEmail) score += 8;
  if (hasPhone) score += 8;
  if (hasLinkedIn) score += 5;
  if (hasGithub) score += 5;
  if (hasProjects) score += 10;
  if (hasExperience) score += 12;
  if (hasEducation) score += 8;
  if (hasMetrics) score += 10;
  score += Math.min(skills.length * 3, 24);
  score = Math.max(35, Math.min(92, score));

  const missingSkills = [
    'Git',
    'REST API',
    'Docker',
    'AWS',
    'Testing',
    'CI/CD'
  ].filter((skill) => !skills.some((foundSkill) => foundSkill.toLowerCase() === skill.toLowerCase())).slice(0, 4);

  const suggestions = [];
  if (!hasProjects) suggestions.push('Add a dedicated Projects section with 2-3 strong builds and the stack used in each one.');
  if (!hasMetrics) suggestions.push('Quantify impact with numbers like performance gains, users served, or tasks automated.');
  if (!hasLinkedIn || !hasGithub) suggestions.push('Include updated LinkedIn and GitHub links so recruiters can validate your profile quickly.');
  if (skills.length < 6) suggestions.push('Add a clearer technical skills section with the tools, frameworks, and databases you actually used.');
  if (!hasExperience && !/\bintern(ship)?\b/i.test(normalizedText)) suggestions.push('Highlight internships, freelance work, or practical experience to improve ATS relevance.');

  return {
    skills,
    missingSkills,
    score,
    suggestions: suggestions.slice(0, 3),
    resumeHash,
    analyzedAt: new Date(),
    fallback: true,
    fallbackReason: 'heuristic-analysis'
  };
};

const mergeWithHeuristicAnalysis = (aiData, resumeText, resumeHash) => {
  const heuristic = buildHeuristicResumeAnalysis(resumeText, resumeHash);
  const aiSkills = Array.isArray(aiData?.skills) ? aiData.skills.filter(Boolean) : [];
  const mergedSkills = Array.from(new Set([...aiSkills, ...heuristic.skills]));
  const mergedSuggestions = Array.isArray(aiData?.suggestions) && aiData.suggestions.length
    ? aiData.suggestions
    : heuristic.suggestions;
  const mergedMissingSkills = Array.isArray(aiData?.missingSkills) && aiData.missingSkills.length
    ? aiData.missingSkills
    : heuristic.missingSkills;

  const rawScore = typeof aiData?.score === 'number' ? aiData.score : heuristic.score;
  const mergedScore = mergedSkills.length > 0
    ? Math.max(rawScore, heuristic.score)
    : heuristic.score;

  return {
    skills: mergedSkills,
    missingSkills: mergedMissingSkills,
    score: Math.max(35, Math.min(100, mergedScore)),
    suggestions: mergedSuggestions,
    resumeHash,
    analyzedAt: new Date(),
    fallback: false
  };
};

// @desc    Analyze Real Resume using Gemini AI
// @route   POST /api/ai/analyze-resume
export const analyzeResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    console.log(`[AI] Analyzing resume from URL: ${resumeUrl}`);
    
    if (!resumeUrl && !req.file) {
      return res.status(400).json({ message: 'No resume provided for analysis' });
    }

    const filePath = req.file ? req.file.path : path.resolve(process.cwd(), resumeUrl);
    console.log(`[AI] Resolved filePath: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
       console.error(`[AI] File not found at: ${filePath}`);
       return res.status(404).json({ message: 'Resume file not found on server' });
    }

    // 1. Generate MD5 Hash to verify content change
    const dataBuffer = fs.readFileSync(filePath);
    const resumeHash = crypto.createHash('md5').update(dataBuffer).digest('hex');

    // 2. Check Cache & Credits
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    resetCreditsIfNecessary(user);

    if (user.aiCredits < 2) {
      return res.status(402).json({ 
        message: 'Insufficient AI Credits. 2 credits required for Resume Analysis.',
        credits: user.aiCredits 
      });
    }

    // 3. Parse PDF to Text
    let resumeText = '';
    try {
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      resumeText = pdfData.text;
      await parser.destroy();
    } catch (err) {
      console.error('PDF Parse Error:', err);
      return res.status(400).json({ message: `Failed to parse PDF content: ${err.message}` });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      console.error('[AI] Empty text extracted from PDF');
      return res.status(400).json({ message: 'Could not extract text from the provided PDF.' });
    }

    // 4. Call Gemini AI API
    let aiResult;
    try {
      const prompt = `
        You are an expert ATS (Applicant Tracking System) recruiter AI.
        Analyze the following resume text and extract the candidate's core technical and professional skills.
        Output ONLY a valid JSON object strictly in the following format (no markdown code blocks, no extra text):
        {
          "skills": ["List of identified skills"],
          "missingSkills": ["List of common skills in this field they seem to lack"],
          "score": <number between 0 and 100 representing overall ATS readiness>,
          "suggestions": ["2-3 specific actionable sentences to improve the resume format or keyword relevance"]
        }

        Resume Text:
        ${resumeText.substring(0, 8000)}
      `;

      let data;
      let modelUsed = '';
      let lastModelError;

      for (const modelName of GEMINI_MODEL_CANDIDATES) {
        try {
          console.log(`[AI] Attempting resume analysis with model: ${modelName}`);
          const model = getGeminiModel(modelName);
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          });
          const aiResponse = result.response?.text?.() || '';
          data = extractJsonFromText(aiResponse);
          modelUsed = modelName;
          console.log(`[AI] Resume analysis success with model: ${modelName}`);
          break;
        } catch (error) {
          console.error(`[AI] Resume model ${modelName} failed: ${error.message}`);
          lastModelError = error;
        }
      }

      if (!data) {
        throw lastModelError || new Error('All Gemini resume analysis models failed');
      }

      // 5. Structure Validation
      if (!Array.isArray(data.skills) || typeof data.score !== 'number') {
        throw new Error('Invalid Gemini response format');
      }

      aiResult = mergeWithHeuristicAnalysis(data, resumeText, resumeHash);
      aiResult.model = modelUsed;

      if (!aiResult.skills.length || aiResult.score <= 10) {
        console.warn('[AI] Gemini returned weak resume analysis; using heuristic fallback instead.');
        aiResult = buildHeuristicResumeAnalysis(resumeText, resumeHash);
      }

    } catch (err) {
      console.error('Gemini Processing Error, using heuristic fallback:', err.message);
      aiResult = buildHeuristicResumeAnalysis(resumeText, resumeHash);
    }

    // 6. Update User Cache & Credits
    user.aiCredits = Math.max(0, user.aiCredits - 2);
    user.aiAnalysis = aiResult;
    // Add unique extracted skills to the main profile skills array
    if (aiResult.skills.length > 0) {
      user.skills = Array.from(new Set([...user.skills, ...aiResult.skills]));
    }
    await user.save();

    res.json({ ...aiResult, credits: user.aiCredits });
  } catch (error) {
    next(error);
  }
};

// @desc    Deterministic & Explainable AI Job Recommendations
// @route   POST /api/ai/recommend-jobs
export const recommendJobs = async (req, res, next) => {
  try {
    const { userSkills } = req.body;
    
    if (!userSkills || !Array.isArray(userSkills)) {
      return res.status(400).json({ message: 'User skills array required' });
    }

    const jobs = await Job.find({ status: 'approved' }).populate('postedBy', 'companyName');

    // Deterministic cosine-similarity style Match Score Logic
    const recommended = jobs.map((job) => {
      let matchedSkills = [];
      let missingSkills = [];

      job.requiredSkills.forEach((skill) => {
        if (userSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });
      
      const matchScore = (matchedSkills.length / job.requiredSkills.length) * 100 || 0;
      
      return {
        ...job._doc,
        matchScore: Math.round(matchScore),
        matchedSkills,
        missingSkills
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    res.json(recommended);
  } catch (error) {
    next(error);
  }
};

// @desc    Role-aware dashboard chatbot assistant
// @route   POST /api/ai/chat-assistant
export const chatAssistant = async (req, res, next) => {
  try {
    console.log(`[AI] ${req.method} ${req.originalUrl} | user:${req.user?._id || req.user?.id || 'unknown'}`);
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ message: 'A valid message is required' });
    }

    const role = req.user?.role || 'student';
    const userName = req.user?.name || 'User';
    const normalizedMessage = message.trim();
    pruneChatCache();
    const cacheKey = getCacheKey({
      userId: req.user?._id,
      role,
      message: normalizedMessage,
    });
    const now = Date.now();
    const cached = chatResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return res.json({
        reply: cached.reply,
        role,
        model: cached.model,
        cached: true,
      });
    }
    const userDoc = await User.findById(req.user._id).select(
      'name role companyName skills resumeUrl aiAnalysis assistantChat aiCredits lastCreditReset'
    );
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    resetCreditsIfNecessary(userDoc);

    if (userDoc.aiCredits < 0.2) {
      return res.status(402).json({ 
        message: 'Insufficient AI Credits. 0.2 credits required for Chat.', 
        credits: userDoc.aiCredits 
      });
    }

    const roleSystemPrompt =
      role === 'recruiter'
        ? `You are Recruiter Copilot for the VertexJob dashboard.
Help recruiters with hiring strategy, writing job descriptions, screening tips, interview planning, ATS usage, and communication templates.
Be practical and specific. Avoid legal claims. If information is missing, ask one short follow-up question.
Output rules:
- Plain text only (no markdown, no *, no #, no code blocks).
- Do not start with greetings like "Great question".
- Target length: 50-100 words total.
- Use 3-5 points under "Quick answer" (prefer 4).
- Each point should be a complete sentence (no one-word points).
- Use this structure exactly:
  Quick answer:
  1) ...
  2) ...
  3) ...
  Next step:
  ...`
        : `You are Student Career Copilot for the VertexJob dashboard.
Help students with resume improvement, job applications, interview preparation, skill-gap planning, and profile optimization.
Be encouraging, concrete, and specific. If information is missing, ask one short follow-up question.
Output rules:
- Plain text only (no markdown, no *, no #, no code blocks).
- Do not start with greetings like "Great question".
- Target length: 50-100 words total.
- Use 3-5 points under "Quick answer" (prefer 4).
- Each point should be a complete sentence (no one-word points).
- Use this structure exactly:
  Quick answer:
  1) ...
  2) ...
  3) ...
  Next step:
  ...`;

    const persistedHistory = Array.isArray(userDoc.assistantChat)
      ? userDoc.assistantChat.slice(-8).map((item) => ({
          role: item?.role === 'assistant' ? 'assistant' : 'user',
          message: String(item?.message || '').slice(0, 1000),
        }))
      : [];

    const incomingHistory = Array.isArray(history)
      ? history.slice(-5).map((item) => ({
          role: item?.role === 'assistant' ? 'assistant' : 'user',
          message: String(item?.message || '').slice(0, 1000),
        }))
      : [];

    const compactHistory = incomingHistory; // Focus strictly on last 5 as per limit

    let contextBlock = '';
    if (role === 'student') {
      const apps = await Application.find({ userId: req.user._id }).select('status');
      const summary = apps.reduce(
        (acc, app) => {
          acc.total += 1;
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        },
        { total: 0, applied: 0, shortlisted: 0, rejected: 0 }
      );

      contextBlock = `Student context:
- Skills: ${(userDoc.skills || []).slice(0, 20).join(', ') || 'None added'}
- Resume uploaded: ${userDoc.resumeUrl ? 'Yes' : 'No'}
- Last ATS score: ${typeof userDoc.aiAnalysis?.score === 'number' ? userDoc.aiAnalysis.score : 'N/A'}
- Applications: total=${summary.total}, shortlisted=${summary.shortlisted}, in_review=${summary.applied}, rejected=${summary.rejected}`;
    } else if (role === 'recruiter') {
      const recruiterJobs = await Job.find({ postedBy: req.user._id }).select('_id status requiredSkills');
      const jobIds = recruiterJobs.map((j) => j._id);
      const appSummary = jobIds.length
        ? await Application.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ])
        : [];

      const appCounts = appSummary.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
      }, {});

      const activeJobs = recruiterJobs.filter((j) => j.status === 'approved').length;
      const pendingJobs = recruiterJobs.filter((j) => j.status === 'pending').length;

      contextBlock = `Recruiter context:
- Company: ${userDoc.companyName || 'N/A'}
- Jobs posted: ${recruiterJobs.length}
- Active jobs: ${activeJobs}
- Pending approval jobs: ${pendingJobs}
- Applicants: total=${Object.values(appCounts).reduce((a, b) => a + b, 0)}, shortlisted=${appCounts.shortlisted || 0}, applied=${appCounts.applied || 0}, rejected=${appCounts.rejected || 0}`;
    }

    const conversationText = compactHistory
      .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.message}`)
      .join('\n');

    const prompt = `${roleSystemPrompt}

User context:
- Name: ${userName}
- Role: ${role}
${contextBlock ? `\n${contextBlock}\n` : ''}

Recent conversation:
${conversationText || 'No prior messages.'}

Current user message:
${normalizedMessage}

Now provide the best helpful response.`;

    let reply = '';
    let modelUsed = '';
    let lastModelError;
    let fallback = false;
    const minWords = 50;
    const maxWords = 100;

    for (const modelName of GEMINI_MODEL_CANDIDATES) {
      try {
        console.log(`[AI] Attempting chat generation with model: ${modelName}`);
        const model = getGeminiModel(modelName);
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 450 }
        });
        reply = result.response?.text?.()?.trim() || '';
        if (reply) {
          if (countApproxWords(reply) < minWords) {
            try {
              const expandPrompt = buildExpandPrompt({
                roleSystemPrompt,
                draft: reply,
                minWords,
                maxWords,
              });
              const expanded = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: expandPrompt }] }],
                generationConfig: { maxOutputTokens: 500 },
              });
              const expandedText = expanded.response?.text?.()?.trim() || '';
              if (expandedText && countApproxWords(expandedText) >= minWords) {
                reply = expandedText;
              }
            } catch (expandError) {
              console.error(`[AI] Expansion attempt failed (${modelName}): ${expandError.message}`);
            }
          }
          modelUsed = modelName;
          console.log(`[AI] Success with model: ${modelName}`);
          break;
        }
      } catch (error) {
        console.error(`[AI] Model ${modelName} failed: ${error.message}`);
        lastModelError = error;
      }
    }

    if (!reply) {
      fallback = true;
      modelUsed = 'fallback';
      reply =
        'Quick answer:\n1) The AI assistant is temporarily unavailable.\n2) Your message was saved in chat history.\n3) Please try again in a few minutes.\nNext step:\nRetry after a short wait.';
      console.error('AI assistant fallback used:', lastModelError?.message || 'Unknown Gemini failure');
    }

    reply = normalizeAssistantReply(reply);
    chatResponseCache.set(cacheKey, {
      reply,
      model: modelUsed,
      expiresAt: now + CHAT_CACHE_TTL_MS,
    });

    userDoc.aiCredits = Math.max(0, userDoc.aiCredits - 0.2);
    userDoc.assistantChat = [
      ...(userDoc.assistantChat || []).slice(-29),
      { role: 'user', message: normalizedMessage },
      { role: 'assistant', message: reply },
    ];
    await userDoc.save();

    return res.json({ reply, role, model: modelUsed, fallback, credits: userDoc.aiCredits });
  } catch (error) {
    next(error);
  }
};

// @desc    Get persisted assistant chat history
// @route   GET /api/ai/chat-assistant/history
export const getChatAssistantHistory = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user._id).select('assistantChat');
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ history: userDoc.assistantChat || [] });
  } catch (error) {
    next(error);
  }
};
