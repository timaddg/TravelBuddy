import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from 'child_process';
import path from 'path';

// Optimized prompt generation using Python backend
async function getOptimizedPrompt(complexText: string, promptType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), '..', '..', '..', '..', 'prompts.py'),
      '--get-prompt',
      '--type', promptType,
      '--text', complexText
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Python process failed: ${error}`));
      }
    });
  });
}

// Fallback optimized prompts (much shorter and more efficient)
const OPTIMIZED_PROMPTS = {
  public_transport: (text: string) => `You are TravelBuddy. Make transport info SHORT and CLEAR.

Text: ${text}

Format as:
🚇 [Destination]

• COST: [Amount]
• TIME: [Duration]
• Steps: [Simple 1-2 step direction]
• Quick Tip: [Crucial, immediate advice]
• If Lost: [Simple instruction]

Keep under 60 words.`,

  museum_exhibit: (text: string) => `You are TravelBuddy. Make museum info SHORT and EXCITING.

Text: ${text}

Format as:
🏛️ [Exhibit Name]

• [What it is - 1 sentence]
• [Why special - 1 sentence]
• [Fun fact - 1 sentence]

Keep under 50 words.`,

  restaurant_menu: (text: string) => `You are TravelBuddy. Make food info SHORT and APPETIZING.

Text: ${text}

Format as:
🍽️ [Restaurant Name]

• [What you get - 1 sentence]
• [Price] • [Special feature]
• [One tip]

Keep under 50 words.`,

  cultural_customs: (text: string) => `You are TravelBuddy. Make cultural info SHORT and RESPECTFUL.

Text: ${text}

Format as:
🌍 [Country] Customs

• [Money - 1 sentence]
• [Dress - 1 sentence]
• [Behavior - 1 sentence]
• [Warning - if serious]

Keep under 60 words.`,

  emergency_safety: (text: string) => `You are TravelBuddy. Make safety info SHORT and CLEAR.

Text: ${text}

Format as:
🚨 Emergency Info

• [Emergency number]
• [What to do - 1 sentence]
• [Safety tip - 1 sentence]

Keep under 50 words.`,

  currency_exchange: (text: string) => `You are TravelBuddy. Make money info SHORT and PRACTICAL.

Text: ${text}

Format as:
💰 [Country] Money

• [Currency - 1 sentence]
• [Payment - 1 sentence]
• [Safety tip - 1 sentence]

Keep under 50 words.`,

  general: (text: string) => `You are TravelBuddy. Make this SHORT and CLEAR.

Text: ${text}

Format as:
📋 [Main Point]

• [Key info 1]
• [Key info 2]
• [Key info 3]

Keep under 60 words.`
};

export async function POST(request: NextRequest) {
  try {
    const { userInput, promptType } = await request.json();

    if (!userInput || !promptType) {
      return NextResponse.json(
        { error: "Missing required fields: userInput and promptType" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Get optimized prompt
    let prompt: string;
    try {
      // Try to use Python backend first
      prompt = await getOptimizedPrompt(userInput, promptType);
    } catch (error) {
      // Fallback to TypeScript prompts
      const promptGenerator = OPTIMIZED_PROMPTS[promptType as keyof typeof OPTIMIZED_PROMPTS] || OPTIMIZED_PROMPTS.general;
      prompt = promptGenerator(userInput);
    }

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const simplifiedText = response.text();

    // Calculate stats
    const originalLength = userInput.length;
    const simplifiedLength = simplifiedText.length;
    const reduction = originalLength > 0 
      ? Math.round(((originalLength - simplifiedLength) / originalLength) * 100)
      : 0;

    return NextResponse.json({
      result: simplifiedText,
      originalLength,
      simplifiedLength,
      reduction: `${reduction}%`
    });

  } catch (error) {
    console.error('Error in simplify API:', error);
    return NextResponse.json(
      { error: "Failed to simplify text. Please try again." },
      { status: 500 }
    );
  }
} 