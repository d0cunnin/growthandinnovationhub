/* ==========================================================================
   FORM SUBMISSION SETTINGS
   --------------------------------------------------------------------------
   The inquiry forms do NOT send anything until one of the options below is
   configured. Until then, visitors see an honest message that online
   submission is not yet available, and nothing is stored or sent.

   Option A — a form-processing service (Formspree, Basin, Netlify Forms
   function, your own server endpoint, etc.):
       provider: "endpoint",
       endpoint: "https://your-form-service.example/f/abc123"
     The page POSTs JSON: { form, submittedAt, page, fields: {...} }.
     The service must return a 2xx status on success.

   Option B — Supabase (insert-only table protected by Row Level Security):
       provider: "supabase",
       supabaseUrl: "https://YOUR-PROJECT.supabase.co",
       supabaseAnonKey: "PUBLIC-ANON-KEY",
       supabaseTable: "inquiries"
     Use ONLY the public "anon" key here. NEVER put a service-role key,
     password, or private API key in this file — it is public.
     See README "Configure the forms" for the table and RLS policy.
   ========================================================================== */
window.GIH_FORM_CONFIG = {
  provider: "none",          // "none" | "endpoint" | "supabase"
  endpoint: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "inquiries"
};
