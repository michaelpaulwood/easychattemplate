import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface APIError extends Error {
  response?: {
    status: number;
  };
}

export async function POST(request: Request) {
  try {
    const { message, apiKey, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    // Map model IDs to actual OpenAI model names
    const modelMap = {
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4o': 'gpt-4'  // Map gpt-4o to actual gpt-4
    };

    try {
      const response = await openai.chat.completions.create({
        model: modelMap[model as keyof typeof modelMap] || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return NextResponse.json({
        reply: response.choices[0].message.content
      });
    } catch (error: unknown) {
      console.error('OpenAI API Error:', error);
      
      const apiError = error as APIError;
      if (apiError.response?.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: apiError.message || 'Error communicating with OpenAI API' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 