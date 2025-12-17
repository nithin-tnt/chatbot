import { NextRequest, NextResponse } from 'next/server';
import { clearConversation } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId is required' },
        { status: 400 }
      );
    }

    await clearConversation(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to clear conversation' },
      { status: 500 }
    );
  }
}
