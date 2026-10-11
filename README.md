# Growth and Innovation Hub — Website

**Where Organizations Grow, Leaders Develop, and Communities Thrive.**
A collaborative initiative of Dr. Monique Haynes and D'Andrea Bolden.

A static website built with plain HTML5, CSS3 and vanilla JavaScript. No framework, no build step: upload the files to any static host and it works.

---

## Project structure

```
index.html                         Home
about.html                         About the Hub
ai-education.html                  Focus area: AI Education & Integration
organizational-preparedness.html   Focus area: Organizational Preparedness
leadership-development.html        Focus area: Leadership Development
community-impact.html              Focus area: Community Impact
entrepreneurship-development.html  Focus area: Entrepreneurship Development
organizational-services.html       Organizational Training & Services (+ training inquiry form)
training-events.html               Training & Events (built from js/events-data.js)
contact.html                       Contact & Engage (+ general inquiry form)
privacy.html, terms.html           DRAFT legal pages (not indexed by search engines)
404.html                           "Page not found" page
robots.txt, sitemap.xml            Search-engine files (contain a placeholder domain)
netlify.toml                       Netlify publish settings and security headers

css/styles.css        Brand tokens (colors, fonts, spacing) and all components
css/responsive.css    Phone and tablet refinements
js/main.js            Mobile menu, Focus Areas dropdown, header, scroll reveal
js/forms.js           Form validation and submission
js/form-config.js     ← form submission settings (edit this to connect forms)
js/events.js          Renders events on the Training & Events page
js/events-data.js     ← list of events (edit this to add events)
assets/logos/         Logo files (SVG, text outlined)
assets/icons/         Favicons
assets/images/        Founder photos, social-sharing image
```

## Open the site locally

Double-click `index.html` to open it in a browser. Everything works this way.

For a more realistic preview (recommended before deploying), run a tiny local server from this folder and visit http://localhost:8000:

```bash
python3 -m http.server 8000
```

## Update content

Each page is a normal HTML file. Open it in any text editor, change the words between the tags, save, and refresh the browser.

- The **header and footer** are repeated at the top and bottom of every page. If you change a menu item or footer link, change it on every page (search and replace across files works well).
- **Content placeholders** appear on the site in dashed gold boxes labelled *Content pending* (founder biographies, mission story, contact details). Search the files for `class="pending"` to find them all, and replace each one with approved text.
- Focus-area pages list **potential offerings** that are proposed, not confirmed. Edit the lists as programs are confirmed, and remove the "proposed possibilities" note once they are.

## Replace the logo

The logo files live in `assets/logos/`. To swap in new artwork, save the new files **with the same file names** and every page will use them automatically:

| File | Used in |
| --- | --- |
| `gih-primary-horizontal-no-tagline.svg` | Header (on light background) |
| `gih-primary-horizontal-reversed-no-tagline.svg` | Footer (on navy) |
| `gih-icon-mark.svg` / `gih-icon-mark-reversed.svg` | Decorative mark on About, Events, 404 / page banners |
| `assets/icons/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Browser tab and phone home-screen icons |

Header logo height is set in `css/styles.css` under `.brand img`. The full logo package (all versions, PNG exports) and the brand guide were delivered separately.

## Update the brand colors

All colors are defined once, at the top of `css/styles.css`:

```css
:root {
  --color-navy: #0D2B45;
  --color-teal: #0F7A7A;
  --color-gold: #D4A049;
  --color-ivory: #F7F4ED;
  --color-sage: #8AA89A;
  --color-charcoal: #4A4A4A;
  --color-white: #FFFFFF;
  ...
}
```

Change a value there and it updates everywhere. The accessible variants below them (`--color-teal-light`, `--color-gold-deep`, etc.) exist because gold and sage are too light to use as small text on white/ivory. Re-check contrast (aim for 4.5:1) if you change them.

## Add events

Open `js/events-data.js`. It contains a commented template; copy it into the `window.GIH_EVENTS = [ ... ]` list, one block per event:

```js
window.GIH_EVENTS = [
  {
    title: "Practical AI for Nonprofit Teams",
    description: "A hands-on introduction to using AI tools responsibly.",
    focusArea: "ai-education",
    start: "2027-02-12T10:00",
    end: "2027-02-12T12:00",
    timeZone: "America/New_York",
    format: "Virtual",
    location: "Zoom (link sent after registration)",
    registrationDeadline: "2027-02-10",
    fee: "Free",
    registrationUrl: "https://your-registration-page.example",
    status: "open"            // open | closed | full
  },
];
```

- While the list is empty, the page shows the "Upcoming Training Opportunities" message with a Contact Us button.
- Past events disappear automatically. A focus-area filter appears once events exist.
- No registration link yet? Leave `registrationUrl: ""` and the event shows an "Express interest" button that goes to the contact form.

## Configure the forms (Netlify Forms)

There are two forms: the **training inquiry** (`organizational-services.html`, Netlify form name `organizational-training`) and the **general inquiry** (`contact.html`, form name `contact`, with types: general, organizational training, entrepreneurship training, community partnership, speaking/workshop). Both validate required fields, show accessible error messages, and include a hidden spam trap.

The forms are set up for **Netlify Forms** (`provider: "netlify"` in `js/form-config.js`). They only work once the site is deployed on Netlify. Opened locally or on another host, a submission shows *"Your inquiry could not be sent"*; the forms never claim success unless Netlify confirms it received the inquiry.

**One-time setup in Netlify** (after the first deploy):

1. In your site's dashboard, go to **Forms** and click **Enable form detection**.
2. **Redeploy** the site (Deploys → Trigger deploy → Deploy site) so Netlify finds both forms. They then appear under Forms as `organizational-training` and `contact`.
3. Go to **Site configuration → Forms → Form notifications → Add notification → Email notification**, enter the address that should receive inquiries, and choose *Any form*. Add a second notification if both founders should receive them.
4. Send a test inquiry from each form on the live site and confirm the email arrives. Check the **Spam submissions** list in Netlify if one doesn't appear.

Submissions are also kept in the Netlify dashboard (Forms), where you can read and export them. Check Netlify's current plan limits on monthly form submissions as inquiry volume grows.

### Other options if the site ever leaves Netlify

Edit **`js/form-config.js`** (one file controls both forms):

**Option A — a form service** (Formspree, Basin, Getform, a Netlify/Vercel function, your own server):
```js
provider: "endpoint",
endpoint: "https://formspree.io/f/your-id"
```
The site sends JSON: `{ form, submittedAt, page, fields: { ... } }` and treats any 2xx response as delivered. Configure the service to email the founders.

**Option B — Supabase:**
```js
provider: "supabase",
supabaseUrl: "https://YOUR-PROJECT.supabase.co",
supabaseAnonKey: "your-public-anon-key",
supabaseTable: "inquiries"
```
Create the table and lock it down so the public can only **insert**:
```sql
create table public.inquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  form_name text not null,
  page text,
  fields jsonb not null
);
alter table public.inquiries enable row level security;
create policy "public can submit inquiries" on public.inquiries
  for insert to anon with check (true);
-- No select/update/delete policies for anon: submissions are not publicly readable.
```
Read submissions in the Supabase dashboard (or build an authenticated admin page later). Optionally add a Supabase Edge Function / database webhook to email new inquiries.

**Security rules:** only ever put a *public* key in `form-config.js` (it's visible to everyone). Never put a service-role key, password or private API key in any file in this repository.

## Deploy

The site is ready for any static host. Pick one:

- **GitHub Pages:** repository → Settings → Pages → Source: *Deploy from a branch* → `main` / root. The site appears at `https://<user>.github.io/growthandinnovationhub/`. Relative links mean it works in a subfolder.
- **Netlify (chosen host — forms depend on it):** "Add new site" → "Import an existing project" → GitHub → `growthandinnovationhub`. `netlify.toml` already sets the publish folder and security headers, so leave the build command empty. Then do the form setup above. Every push to `main` redeploys automatically.
- **Vercel:** "Add New Project" → import repo → Framework preset *Other*, no build command, output directory `/`.

`404.html` is picked up automatically by GitHub Pages and Netlify.

### Before launch checklist

1. **Domain:** every page, `sitemap.xml` and `robots.txt` use the placeholder `https://YOUR-DOMAIN.example`. Once the domain is confirmed, find-and-replace it across all files.
2. **Forms:** enable form detection and email notifications in Netlify (above) and send a test inquiry from each form.
3. **Placeholders:** replace every *Content pending* box (founder bios, mission story, email, social links). Search for `class="pending"` and `pending-inline`.
4. **Legal pages:** `privacy.html` and `terms.html` are drafts. Have them reviewed, fill in the bracketed items, set the "Last updated" date, then remove `<meta name="robots" content="noindex">` from both.
5. **Social image:** `assets/images/og-image.jpg` is a logo card; replace it with a custom image if you like.

## What's complete and what isn't

| Area | Status |
| --- | --- |
| All 10 requested pages + privacy, terms, 404 | ✅ Built, responsive, tested in Chromium at 320–1440px |
| Navigation, Focus Areas dropdown, mobile menu (keyboard + screen reader) | ✅ |
| Form interface, validation, honest status messages | ✅ |
| Form delivery | ✅ Built for Netlify Forms; ⚠️ needs form detection + email notification turned on in Netlify |
| Events system | ✅ Ready; no events listed yet (none have been announced) |
| Founder biographies, mission story | ⚠️ Placeholders, awaiting approved text |
| Contact email, phone, social links | ⚠️ Placeholders, not invented |
| Pricing | Intentionally not shown; discussed after inquiry |
| Domain, canonical URLs, sitemap | ⚠️ Placeholder domain |
| Privacy Policy / Terms of Use | ⚠️ Drafts for professional review |
| Analytics | Not added (update the Privacy Policy if you add it) |

## Third-party services

- **Netlify** hosts the site and processes form submissions (Netlify Forms). Named in the Privacy Policy.
- **Google Fonts** (Playfair Display, Montserrat, Lato) loaded from fonts.googleapis.com. If unavailable, the site falls back to Georgia/Arial.
- No analytics, trackers or cookies are included.
