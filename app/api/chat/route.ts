import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, getConversationHistory } from '@/lib/db';
import { streamChatResponse, generateChatResponse, detectProfileQuery, generatePersonalityProfile } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Save user message
    await saveMessage({
      session_id: sessionId,
      role: 'user',
      content: message,
      user_id: userId,
    });

    // Check if this is a profile query
    if (detectProfileQuery(message)) {
      // Get conversation history
      const history = await getConversationHistory(sessionId);
      
      let responseText: string;
      let usageData: any = null;
      
      if (history.length < 5) {
        responseText = "I'd love to tell you about yourself, but we've only just started chatting! Have a few more conversations with me, and I'll be able to give you a better personality profile.";
      } else {
        // Format conversation history
        const conversationText = history
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n');

        // Generate personality profile
        const profileResult = await generatePersonalityProfile(conversationText);
        responseText = profileResult.text;
        usageData = profileResult.usage;
      }
      
      // Save profile response
      await saveMessage({
        session_id: sessionId,
        role: 'assistant',
        content: responseText,
        user_id: userId,
      });

      // Return as a streaming response for consistency
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send the complete response as a single chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: responseText })}\n\n`));
          
          // Send usage data if available
          if (usageData) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage: usageData })}\n\n`));
          }
          
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Regular chat flow with streaming
    const history = await getConversationHistory(sessionId, 20);
    const contextMessages = history
      .slice(-20) // Last 20 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

    // Stream AI response
    const stream = await streamChatResponse(contextMessages);
    
    if (!stream) {
      throw new Error('Failed to get stream from OpenRouter');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let usageData: any = null;

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream complete. Full response length:', fullResponse.length);
              
              // Save the complete response to database
              await saveMessage({
                session_id: sessionId,
                role: 'assistant',
                content: fullResponse,
                user_id: userId,
              });
              
              // Send usage data at the end (or estimate if not provided)
              if (!usageData) {
                // Estimate tokens if not provided by stream
                const estimatedTokens = Math.ceil(fullResponse.length / 4);
                usageData = {
                  promptTokens: 0,
                  completionTokens: estimatedTokens,
                  totalTokens: estimatedTokens,
                };
              }
              
              console.log('Sending usage data:', usageData);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage: usageData })}\n\n`));
              
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                  
                  // Capture usage data if present
                  if (parsed.usage) {
                    usageData = {
                      promptTokens: parsed.usage.prompt_tokens || 0,
                      completionTokens: parsed.usage.completion_tokens || 0,
                      totalTokens: parsed.usage.total_tokens || 0,
                    };
                  }
                } catch (e) {
                  console.error('Failed to parse SSE data:', data, e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          
          // Send error message to client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    const errorMessage = error?.message || 'Failed to process chat message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
