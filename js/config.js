/* ============================================
   SACC Doodles - Configuration

   SETUP: Copy values from your .env file here
   This file is in .gitignore - don't commit real credentials
   ============================================ */

const CONFIG = {
    // Supabase Database
    // Get from: Supabase Dashboard > Project Settings > API
    SUPABASE_URL: 'https://kmqlmjkixqpgrbqvpqgp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcWxtamtpeHFwZ3JicXZwcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTc5NzUsImV4cCI6MjA4NTgzMzk3NX0.VsQYdhXIQ4yxib2ee1fHTS2b4nD3X33fO9a5QCFdgaI',

    // Bunny.net CDN (public URLs only - API key is stored securely in Supabase Edge Function)
    BUNNY_CDN_URL: 'https://saccdoodles.b-cdn.net',

    // OpenAI API Key - REMOVED (now stored securely in Supabase Edge Function)
    // AI description generation is handled by: /functions/v1/generate-description

    // App info
    APP_NAME: 'SACC Doodles',
    VERSION: '1.0.0'
};

Object.freeze(CONFIG);
