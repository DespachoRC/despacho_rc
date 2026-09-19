import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJh...'; // Actually wait, there is no ANON_KEY in .env

// Wait, I only have PUBLISHABLE_KEY. Supabase usually calls it NEXT_PUBLIC_SUPABASE_ANON_KEY.
// The .env has NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY which seems truncated or weird: "sb_publishable_CYpausK0fTwlAdlT6pH4SQ_iwbXK\nrD0"
