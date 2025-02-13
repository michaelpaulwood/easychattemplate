import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { message, apiKey, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    try {
      const response = await openai.chat.completions.create({
        model: model || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
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
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      if (error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Error communicating with OpenAI API' },
        { status: error.response?.status || 500 }
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