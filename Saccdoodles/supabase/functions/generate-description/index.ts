// Supabase Edge Function - Generate Dog Description with OpenAI
// This keeps your API key secure on the server side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured in Supabase secrets')
    }

    // Parse request body
    const { prompt, dogData } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Build full prompt with dog context
    const dogContext = dogData
      ? `Dog Name: ${dogData.name || 'this dog'}, Breed: ${dogData.breed || 'breed not specified'}, Gender: ${dogData.gender || 'not specified'}, Color: ${dogData.color || 'color not specified'}, Weight: ${dogData.weight || 'weight not specified'} lbs`
      : ''

    const fullPrompt = dogContext
      ? `${dogContext}\n\nCustom Instructions: ${prompt}\n\nPlease generate a compelling, warm description for this dog's profile page.`
      : prompt

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional dog breeder copywriter. Generate warm, engaging, and accurate descriptions for breeding dogs that highlight their personality, temperament, and qualities.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(error.error?.message || 'OpenAI API request failed')
    }

    const data = await openaiResponse.json()
    const description = data.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
