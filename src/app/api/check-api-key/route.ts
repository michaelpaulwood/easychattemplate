import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    const keyToCheck = apiKey || process.env.OPENAI_API_KEY;

    if (!keyToCheck) {
      return NextResponse.json({ isValid: false, message: 'No API key provided' });
    }

    const openai = new OpenAI({
      apiKey: keyToCheck,
    });

    try {
      // Make a minimal API call to verify the key
      await openai.models.list();
      return NextResponse.json({ isValid: true });
    } catch (error: unknown) {
      // Clean error handling without exposing sensitive data
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          return NextResponse.json({ 
            isValid: false, 
            message: 'Invalid API key'
          });
        } else if (error.message.includes('429')) {
          return NextResponse.json({ 
            isValid: false, 
            message: 'Rate limit exceeded'
          });
        }
      }
      
      return NextResponse.json({ 
        isValid: false, 
        message: 'Failed to verify API key'
      });
    }
  } catch {
    console.error('Server Error');
    return NextResponse.json({ 
      isValid: false, 
      message: 'Failed to verify API key'
    });
  }
}

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({ hasApiKey });
} 