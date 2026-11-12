# ETHOS landing page

Landing page for **ETHOS**, a digital marketing agency with a "Growth Partner" model for small businesses (MIPYMES) in the Bucaramanga metropolitan area, Colombia. It is a university project (Universidad de Investigación y Desarrollo, October 2026) by Jose Gabriel Medina Pedraza, Karen Daniela Duran Pabon, Jesus David Barcenas Vargas and Yerman Deyron Restrepo Rugeles.

**The page has one goal:** get a business owner to book a **free digital diagnosis** (20 min, virtual, no commitment), where ETHOS then sells its monthly plans. Every section should push toward the "Agendar una consulta gratis" button. All site copy is in **Spanish (Colombia)**, in a close, plain, professional tone.

## Source material (project root)

- `Plan_Negocio_ETHOS.pdf`: business plan (problem, services, mission, team, brand, demand survey results).
- `ETHOS_Estrategia_Comercial.pdf`: commercial strategy (target customer, value proposition, plans and prices, funnel, KPIs, full demand survey).
- `Neon ETHOS Digital Marketing Badge.png`: circular logo.
- `Post 1 – Gancho.png`, `Post 2 – Método.png`, `Post 3 – Diagnóstico gratis.png`, `ETHOS_ Estrategia digital para crecer.png`: Instagram pieces. These are the visual reference for the site.

To read the PDFs, run `pdftotext -layout file.pdf out.txt` (Poppler is installed). The output is Windows-1252, not UTF-8.

## Site (`site/`)

Static HTML, CSS and vanilla JS, with no framework and no build step. Any static host works (Netlify, Vercel, GitHub Pages).

| File | Purpose |
|---|---|
| `index.html` | All sections: hero, survey figures, diagnosis, method, services, plans, why ETHOS, team, FAQ, final call to action, footer, survey `<dialog>` |
| `css/styles.css` | All styles. Brand tokens are in `:root` |
| `js/config.js` | **Editable settings:** WhatsApp number and greeting line |
| `js/survey.js` | Survey questions, step logic, validation, WhatsApp message builder, sticky mobile button |
| `politica-de-datos.html` | Data-policy page (currently a placeholder draft) |
| `assets/` | Favicon, apple-touch icon, 512px badge (used as the social-sharing image) |

**Run locally:** start the `ethos-site` entry in `.claude/launch.json`, which serves `site/` at http://localhost:5173 with Python's `http.server`.

## Booking flow (agreed with the user)

1. The visitor clicks any `[data-open-survey]` button. This opens the survey dialog.
2. They answer **7 tap-to-answer questions**, adapted from the ETHOS demand survey: sector, location, channels used, who runs marketing, whether they measure results, top 2 difficulties, monthly budget. Then a **contact step**: name, role, business, optional Instagram or web, and the **required Ley 1581 data consent**.
3. On submit, `wa.me/<number>?text=...` opens with every answer already written into the message, plus any `utm_source` / `utm_medium` / `utm_campaign` values from the page URL. The appointment itself is then scheduled in the **WhatsApp Business** chat, not on the site.

How the survey behaves:
- Single-choice questions move to the next question automatically.
- In the channels question, "Ninguno" can't be combined with other options.
- The difficulties question allows at most 2 picks.
- Progress is saved in `sessionStorage`.
- Analytics events are pushed to `window.dataLayer`: `ethos_survey_open`, `ethos_survey_step`, `ethos_survey_complete`.
- To change a question, edit the `QUESTIONS` array in `js/survey.js`. Each question's `label` is the field name used in the WhatsApp message.

## Brand

- **Colors:** black background `#070b09`, neon green `#73FA4A` for accents, titles and buttons, white for text, muted text `#b9c2bc`.
- **Font:** Poppins (Google Fonts), bold or extra-bold for headings, which matches the posts. The business plan says the logo is "Montserrat-like".
- **Logo mark:** three slanted stripes (white, green, green), drawn as an inline SVG `<symbol id="ethos-mark">` in `index.html`.
- **Approved slogans:** "Crecemos contigo", "Tu negocio merece crecer", "No publiques por publicar", "Crecer no es suerte. Es estrategia.", "¿Publicas y no sabes si te vende?", "Publicar sin medir es adivinar".
- Instagram: `@ethos.growth.partner`.

## Content decisions (made by Claude; confirm with the user before changing)

- **No prices on the page.** Plans (Arranque, Impulso, Crecimiento, Growth Partner) list only what's included, so prices are discussed in the consultation. Reference prices are in section 3.2 of the strategy PDF and are still "to be validated".
- Impulso is marked "El más elegido" (46 % of survey respondents chose it).
- There are no customer success stories yet (no pilot clients), so figures from ETHOS's own survey (n = 39, October 2026) are used as proof, with the source cited on the page.
- The budget question includes a "Prefiero conversarlo en la reunión" option.

## Pending before launch

- [ ] Real WhatsApp Business number in `site/js/config.js` (currently the placeholder `570000000000`).
- [ ] Replace `politica-de-datos.html` with ETHOS's official data policy (Ley 1581 de 2012); it has a contact email placeholder.
- [ ] Choose hosting and a domain; set the absolute `og:image` URL once the domain is known.
- [ ] Optional: analytics or Meta Pixel (the `dataLayer` events are ready), real team photos, success stories after the pilot clients.

## Environment (Windows 10)

- Installed: Python 3.12 (`%LOCALAPPDATA%\Programs\Python\Python312`) with pypdf, pdfplumber, pymupdf, python-docx, openpyxl, python-pptx, pandas, markitdown and Pillow; Poppler 25.07; Pandoc 3.13; Node.js 26.13 (`C:\Program Files\nodejs`).
- Shells opened before an install may not see the new tools until they are restarted. Use full paths or refresh PATH.
- The LibreOffice install was interrupted and may be incomplete. Tesseract OCR is not installed.
- `.superpowers/` holds throwaway brainstorming mockups and is not part of the site.
