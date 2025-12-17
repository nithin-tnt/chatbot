# AI Chatbot - Personality-Aware Conversations with Authentication

A production-quality AI chatbot application built with Next.js, Ant Design X, and Google Gemini. The chatbot features user authentication, multi-session chat history, profile management, and can generate personality profiles based on interaction history.

## ✨ Features

### Authentication & User Management
- **User Sign Up/Sign In** - Secure authentication with Supabase Auth
- **Profile Settings** - Manage your profile and preferences

### Chat Experience
- **Natural Conversations** - Chat freely with an AI assistant powered by Google Gemini
- **Persistent Memory** - All conversations stored securely in PostgreSQL
- **Personality Profiling** - Ask "Who am I?" to get an AI-generated personality analysis
- **Multi-Session Support** - Create, save, and switch between multiple chat sessions

### Modern UI
- **Ultramodern Dark Theme** - Glassmorphism effects with purple gradient accents
- **Responsive Design** - Sidebar navigation with chat history
- **Real-time Updates** - Typing indicators and smooth animations
- **Welcome Screen** - Guided onboarding for new users

### Security
- **Row Level Security (RLS)** - Your data is isolated and secure
- **Session Management** - Secure JWT-based authentication
- **Data Privacy** - Only you can access your conversations

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Ant Design X
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **AI**: Google Gemini Pro
- **State Management**: React Hooks
- **Styling**: Tailwind CSS + Ant Design Dark Theme

## Getting Started

### Prerequisites

- Node.js 20+ (v22.14.0 recommended)
- npm or yarn
- OpenRouter API Key ([Get API Key](https://openrouter.ai))
- Supabase account ([Sign up free](https://supabase.com))

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Set up Supabase database**
   
   Go to your Supabase Dashboard → SQL Editor and run the complete schema from `supabase/schema.sql`.
   
   This creates:
   - `conversations` table with user_id support
   - `chat_sessions` table for organizing chats
   - `user_profiles` table for user data
   - Row Level Security (RLS) policies
   - Auto-profile creation trigger

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Or use the setup script:
   ```bash
   ./setup-auth.sh
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Authentication

**Create an Account:**
1. Click "Sign In" in the sidebar
2. Switch to "Sign Up" mode
3. Enter your full name, email, and password
4. Click "Sign Up"

**Sign In:**
1. Click "Sign In" in the sidebar
2. Enter your credentials
3. Access your saved chats and profile

### Chat Sessions

**Create New Chat:**
- Click "New Chat" button to start a fresh conversation
- Your previous chats are saved in the sidebar

**Switch Between Chats:**
- Click any chat in the sidebar to load it
- All your messages are preserved

**Delete Chat:**
- Hover over a chat and click the trash icon

### Personality Profile
Ask questions like:
- "Who am I?"
- "Tell me about myself"
- "What kind of person am I?"
- "What's my personality profile?"

The AI analyzes your conversation history and provides insights including:
- Communication Style
- Technical Inclination  
- Decision-Making Pattern
- Interests Detected
- Personality Traits
- Confidence Level

### Profile Settings
1. Click your avatar in the sidebar
2. Select "Profile Settings"
3. Update your information
4. Save changes

### Anonymous Mode
- Use without signing in for quick testing
- Limited to single session (localStorage)
- Create an account to save your data
Click the "Clear Chat" button to start a new session and clear your conversation history.

## Project Structure

```
chatbot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Main chat endpoint
│   │   └── clear/route.ts     # Clear conversation endpoint
│   ├── layout.tsx             # Root layout with Ant Design provider
│   └── page.tsx               # Main chat UI
├── lib/
│   ├── db.ts                  # Supabase database utilities
│   └── openai.ts              # OpenAI integration & prompts
├── supabase/
│   └── schema.sql             # Database schema
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## API Routes

### POST /api/chat
Send a chat message and receive an AI response.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "uuid-session-id"
}
```

**Response:**
```json
{
  "response": "I'm doing great! How can I help you today?",
  "isProfile": false
}
```

### POST /api/clear
Clear conversation history for a session.

**Request:**
```json
{
  "sessionId": "uuid-session-id"
}
```

**Response:**
```json
{
  "success": true
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add these in your hosting platform:
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing

Run tests (when implemented):
```bash
npm test
```

## Configuration

### Customize AI Behavior

Edit the system prompts in `lib/openai.ts`:
- `CHAT_SYSTEM_PROMPT` - Controls general chatbot behavior
- `PROFILE_SYSTEM_PROMPT` - Controls personality profile generation

### Adjust Context Window

Modify the number of messages sent to the LLM in `app/api/chat/route.ts`:
```typescript
const contextMessages = history.slice(-20); // Last 20 messages
```

### Change LLM Model

Update the model in `lib/openai.ts`:
```typescript
model: 'gemini-1.5-flash', // or 'gemini-1.5-pro', 'gemini-pro', etc.
```

## Security Notes

- Never commit `.env.local` to version control
- API keys are only used server-side
- Supabase Row Level Security is enabled
- Rate limiting recommended for production

## Performance Optimization

- Message history is limited to prevent excessive token usage
- Conversations are indexed for fast retrieval
- Client-side session management reduces DB queries
- Ant Design X components are optimized for performance

## Troubleshooting

### "Failed to process chat message"
- Check your Gemini API key is valid
- Ensure Supabase credentials are correct
- Verify the database table exists

### Messages not persisting
- Check Supabase connection
- Verify RLS policies allow operations
- Check browser console for errors

### Slow responses
- Check your OpenRouter API quota/limits
- Consider using better models for faster responses
- Reduce context window size

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Next.js and Ant Design X**
