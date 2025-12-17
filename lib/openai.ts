const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('OPENROUTER_API_KEY is not set in environment variables');
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-3.5-turbo'; // Reliable and very cheap (~$0.0005/1K tokens)

export const CHAT_SYSTEM_PROMPT = `You are a helpful, friendly AI assistant. You engage in natural conversations with users and remember context from your discussions. Be conversational, empathetic, and helpful.`;

export const PROFILE_SYSTEM_PROMPT = `You are an expert at analyzing conversation patterns to create personality profiles. Based on the conversation history provided, generate a comprehensive but sensitive personality profile of the user.

Format your response EXACTLY as follows:

👤 Your Profile (based on our conversations)

• Communication Style: [Describe how they communicate]
• Technical Inclination: [Their technical comfort level and interests]
• Decision-Making Pattern: [How they approach decisions]
• Interests Detected: [Topics they're curious about]
• Personality Traits: [Key characteristics observed]
• Confidence Level: [Low/Medium/High - based on available data]

Note: This profile is inferred only from our chats so far.

Important: Avoid mentioning religion, health conditions, politics, or other sensitive attributes. Keep the tone positive and constructive.`;

export async function generateChatResponse(messages: { role: string; content: string }[]) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.');
  }

  const formattedMessages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  ];
  
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Assistant Chatbot',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter error response:', JSON.stringify(error, null, 2));
      throw new Error(error.error?.message || error.message || 'OpenRouter API request failed');
    }

    const data = await response.json();
    const usage = data.usage;
    
    return {
      text: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      }
    };
  } catch (error: any) {
    console.error('OpenRouter API Error:', error);
    throw new Error(`Failed to generate response: ${error.message || 'Unknown error'}`);
  }
}

export async function streamChatResponse(messages: { role: string; content: string }[]) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.');
  }

  const formattedMessages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  ];
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'AI Assistant Chatbot',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: formattedMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenRouter error response:', JSON.stringify(error, null, 2));
    throw new Error(error.error?.message || error.message || 'OpenRouter API request failed');
  }

  return response.body;
}

export async function generatePersonalityProfile(conversationHistory: string) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables.');
  }

  const messages = [
    { role: 'system', content: PROFILE_SYSTEM_PROMPT },
    { role: 'user', content: `Here is the conversation history:\n\n${conversationHistory}\n\nPlease generate a personality profile.` }
  ];
  
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Assistant Chatbot',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter error response:', JSON.stringify(error, null, 2));
      throw new Error(error.error?.message || error.message || 'OpenRouter API request failed');
    }

    const data = await response.json();
    const usage = data.usage;
    
    return {
      text: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      }
    };
  } catch (error: any) {
    console.error('OpenRouter API Error:', error);
    throw new Error(`Failed to generate profile: ${error.message || 'Unknown error'}`);
  }
}

export function detectProfileQuery(message: string): boolean {
  const profileKeywords = [
    'who am i',
    'tell me about myself',
    'what kind of person am i',
    'what do you know about me',
    'my personality',
    'describe me',
    'what am i like',
  ];

  const lowerMessage = message.toLowerCase();
  return profileKeywords.some(keyword => lowerMessage.includes(keyword));
}
