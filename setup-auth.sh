#!/bin/bash

# Authentication Setup Script
# This script helps you set up authentication for your chatbot

echo "🚀 Setting up Authentication for AI Chatbot"
echo "==========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    echo ""
    echo "Example:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "GEMINI_API_KEY=your_gemini_api_key"
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Instructions for database setup
echo "📋 Database Setup Required:"
echo ""
echo "Please follow these steps in your Supabase Dashboard:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project"
echo "3. Navigate to: SQL Editor"
echo "4. Create a new query"
echo "5. Copy the entire content from: supabase/schema.sql"
echo "6. Paste it into the SQL Editor"
echo "7. Click 'Run' or press Cmd/Ctrl + Enter"
echo ""
echo "This will create:"
echo "  • chat_sessions table"
echo "  • user_profiles table"
echo "  • Update conversations table"
echo "  • Row Level Security policies"
echo "  • Auto-profile creation trigger"
echo ""

read -p "Have you completed the database setup? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Great! Starting development server..."
    echo ""
    npm run dev
else
    echo ""
    echo "⚠️  Please complete the database setup first"
    echo "   Then run: npm run dev"
    echo ""
    echo "📖 See AUTHENTICATION.md for detailed instructions"
fi
