// Supabase Edge Function: bunny-upload
// Securely proxies file uploads to Bunny CDN
// Deploy with: supabase functions deploy bunny-upload

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-file-name, x-folder',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get secrets from environment
    const BUNNY_API_KEY = Deno.env.get('BUNNY_API_KEY')
    const BUNNY_STORAGE_HOST = Deno.env.get('BUNNY_STORAGE_HOST') || 'https://la.storage.bunnycdn.com'
    const BUNNY_STORAGE_ZONE = Deno.env.get('BUNNY_STORAGE_ZONE') || 'saccdoodles'
    const BUNNY_CDN_URL = Deno.env.get('BUNNY_CDN_URL') || 'https://saccdoodles.b-cdn.net'

    if (!BUNNY_API_KEY) {
      throw new Error('BUNNY_API_KEY not configured in secrets')
    }

    // Get file info from headers
    const filename = req.headers.get('x-file-name') || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const folder = req.headers.get('x-folder') || ''
    const contentType = req.headers.get('content-type') || 'application/octet-stream'

    // Build path
    const path = folder ? `${folder}/${filename}` : filename

    if (req.method === 'POST') {
      // Upload file to Bunny
      const fileData = await req.arrayBuffer()

      const uploadUrl = `${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${path}`

      const bunnyResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': contentType,
        },
        body: fileData,
      })

      if (!bunnyResponse.ok) {
        const errorText = await bunnyResponse.text()
        console.error('Bunny upload failed:', bunnyResponse.status, errorText)
        throw new Error(`Bunny upload failed: ${bunnyResponse.status}`)
      }

      // Return success with CDN URL
      const cdnUrl = `${BUNNY_CDN_URL}/${path}`

      return new Response(
        JSON.stringify({
          success: true,
          url: cdnUrl,
          path: path,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (req.method === 'DELETE') {
      // Delete file from Bunny
      const { path: deletePath } = await req.json()

      if (!deletePath) {
        throw new Error('Path is required for deletion')
      }

      const deleteUrl = `${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${deletePath}`

      const bunnyResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'AccessKey': BUNNY_API_KEY,
        },
      })

      // 404 is ok (file already deleted)
      if (!bunnyResponse.ok && bunnyResponse.status !== 404) {
        throw new Error(`Delete failed: ${bunnyResponse.status}`)
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
