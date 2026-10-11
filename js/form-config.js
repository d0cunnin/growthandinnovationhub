/* ==========================================================================
   FORM SUBMISSION SETTINGS
   --------------------------------------------------------------------------
   provider: "netlify"   (current) Netlify Forms. Works once the site is
                         deployed on Netlify with form detection turned on.
                         Submissions appear in the Netlify dashboard under
                         Forms, and Netlify emails them to the address set in
                         Forms > Form notifications. Nothing else to configure
                         in this file. See README "Configure the forms".

   Other options, if the site ever moves off Netlify:

   provider: "endpoint"  A form service (Formspree, Basin, your own server):
                         set endpoint: "https://..." — the page POSTs JSON
                         { form, submittedAt, page, fields } and treats a 2xx
                         response as delivered.

   provider: "supabase"  Insert-only Supabase table with Row Level Security;
                         set supabaseUrl and the PUBLIC anon key.
                         NEVER put a service-role key, password or private
                         API key in this file — it is public.

   provider: "none"      Forms validate but tell visitors that online
                         submission is not available yet. Nothing is sent.

   The forms never report success unless the service confirms receipt.
   ========================================================================== */
window.GIH_FORM_CONFIG = {
  provider: "netlify",       // "netlify" | "endpoint" | "supabase" | "none"
  endpoint: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "inquiries"
};
