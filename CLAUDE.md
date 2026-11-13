# ETHOS landing page

Landing page for **ETHOS**, a digital marketing agency with a "Growth Partner" model for small businesses (MIPYMES) in the Bucaramanga metropolitan area, Colombia. It is a university project (Universidad de Investigación y Desarrollo, October 2026). Since November 2026 the team has three members: Jose Gabriel Medina Pedraza (data analyst and web), Jesus David Barcenas Vargas (general manager and sales) and Yerman Deyron Restrepo Rugeles (digital strategy, design and content). Karen Daniela Duran Pabon (community manager) co-authored the first two cuts and then left the project; her role moved to Yerman's area.

**The page has one goal:** get a business owner to book a **free digital diagnosis** (20 min, virtual, no commitment), where ETHOS then sells its monthly plans. Every section should push toward the "Agendar una consulta gratis" button. All site copy is in **Spanish (Colombia)**, in a close, plain, professional tone.

## Source material (project root)

- `Plan_Negocio_ETHOS.pdf`: business plan (problem, services, mission, team, brand, demand survey results).
- `ETHOS_Estrategia_Comercial.pdf`: commercial strategy (target customer, value proposition, plans and prices, funnel, KPIs, full demand survey).
- `Plan_Negocio_ETHOS_Final.docx` (and `.pdf`): final business plan for the third cut, in APA 7 format, for the three-member team. It carries over sections 1–9 and adds 10 administrative (org chart, talent management), 11 technical (production process), 12 financial (simulator results), 13.1 risks, 13.2 social contribution and 14 conclusions. The course name and instructor on the cover are yellow placeholders that the user fills in.
- `Simulador_Financiero_ETHOS.xlsx`: the professor's class simulator (`Modelo_financiero_clase.xlsx`) filled with ETHOS data. **User rule: keep the template's original format.** Do not add sheets or tables (no tax or scenario sheets), never modify the red formula cells, and enter data only in the yellow input cells (plus concept names in empty label rows). The only formula changes, approved by the user in November 2026, are on FLUJO DE CAJA: the "Saldo de caja" rows (45–46) now run through month 12 without double counting; the TIR/VAN flow uses the partners' contributions as year 0 and recovers the working capital in year 3; and the VAN no longer discounts year 0. Edit the file's XML directly so styles, the UDI logo and other formulas stay byte-identical; openpyxl re-saving is avoided. The template models one product, so ETHOS enters the "cliente-mes" (an active client in any plan): 1 to 12 clients per month and an average price of $1.676.923. **Operation is remote**: each partner works from home, so there is no office rent, office utilities or transport. Partners contribute their own computers, and Yerman contributes his camera, phone and recording gear, so Infraestructura has no equipment and the investment is only start-up costs. Each partner is paid a fixed fee of one SMMLV ($1.750.905 in 2026) as a contractor; the fee covers production hours, so production labour (20.41 h per client-month) is entered at $0. The unit cost of $110.870 is the researched cost of production tools (Canva, CapCut, ChatGPT, Envato, Metricool, ManyChat, Ubersuggest, Hostinger) at the 4 Nov 2026 rates (US$ $3.236, € $3.652) plus 19 % IVA, spread over 78 client-months; sources are cited in section 12.4 of the plan. The social program costs $200.000 a month. Years 2 and 3 use the template's CREC ANUAL 10 % (sales) and CREC INFLACIÓN 6 % (costs). Base case: investment $6,35M, contributions $27M ($9M per partner), break-even 5.37 clients (month 6), lowest cash balance $2,1M (month 5), payback of the contributions about 14.5 months, TIR 90.1 %, VAN $57,2M. Remaining template quirk, left as is: the "Valor de inversión" row carries the previous month's result, so "Total ingresos" and "Superávit / déficit" are cumulative. The plan's section 12 reproduces the simulator's tables and computes the sensitivity analysis on copies of the template.
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
