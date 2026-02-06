/* ============================================
   SACC Doodles - Supabase Configuration
   Credentials are loaded from config.js
   ============================================ */

// Use a different name to avoid conflict with window.supabase (the library)
let supabaseClient = null;

function initSupabase() {
    // Check if CONFIG exists (loaded from config.js)
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG not found. Make sure config.js is loaded before this file.');
        return null;
    }

    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded. Include the CDN script first.');
        return null;
    }

    // Check for placeholder values
    if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL' || CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.error('Supabase credentials not configured. Update js/config.js with your credentials.');
        return null;
    }

    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    return supabaseClient;
}

// Auth helper functions
const Auth = {
    // Sign up new user
    async signUp(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // Sign in existing user
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    async getUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getSession();
        return session !== null;
    },

    // Listen for auth state changes
    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// Export for use in other files
window.initSupabase = initSupabase;
window.Auth = Auth;
window.supabaseClient = null; // Will be set after init
