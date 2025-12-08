/**
 * Environment Variables Diagnostic
 * This file helps debug environment variable loading issues
 */

console.log('=== Environment Variables Diagnostic ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');

if (process.env.SUPABASE_URL) {
    console.log('  → URL value:', process.env.SUPABASE_URL.substring(0, 30) + '...');
}

if (process.env.SUPABASE_ANON_KEY) {
    console.log('  → Key value:', process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...');
}

console.log('=====================================');
