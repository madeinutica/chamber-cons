import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log('Chat API received message:', message);

    // Return a static, hardcoded response to prevent API-related crashes
    const staticResponse = `This is a mock response to your question: "${message}". The live AI chat is temporarily disabled for debugging.`;

    return NextResponse.json({ response: staticResponse, showOnMap: null });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message.' },
      { status: 500 }
    );
  }
}
