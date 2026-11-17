# Blog content rules

These rules come out of the November 2026 content audit. `tests/content.test.mjs` enforces the mechanical ones.

## Facts and evidence
- Every price range comes from `content/data/rate-card.json`, quoted exactly, with its `asOf` month. Local currency (SAR, AED, QAR) uses the fixed pegs in that file.
- Do not claim first-hand project experience the portfolio cannot show. The only shipped software case study is Tafawwoq (`/portfolio/tafawwoq-educational-app`). No invented clients, case studies or "from our projects" figures.
- Regulatory statements link to the regulator's own text or page for that rule, not to a homepage. If a claim cannot be sourced, remove it.
- Statistics carry a named, linked source and a year. No "industry reports show".
- Each article lists its primary sources in the `sources` frontmatter field (`{ "title", "url" }`, https only), and has a `summary` field: three or four self-contained sentences answering the article's main question. Answer engines quote these.
- State the number or name the title promises. "It depends" is a follow-up, not the answer.

## Structure
- Open with the answer in the first two or three sentences.
- Not every article ends with "Conclusion". A cost article leads with its table; a comparison leads with a verdict; a how-to with steps.
- At least one contextual link to the matching `/services/<slug>` page in the first half, and a contact link near the end.
- FAQ questions are specific to the article; do not reuse another article's question wording.

## Arabic glossary
Write Arabic for Gulf business readers, not a translation of the English. Use:

| Use | Not |
|---|---|
| الجوال | الموبايل |
| مطور مستقل | فريلانسر |
| الخادم / الواجهة الخلفية | الباك إند، الخادم الخلفي |
| التعهيد الخارجي (the term the keyword map targets) | الإسناد الخارجي, except where a regulator's own text uses it |
| فارق التوقيت | نطاق زمني قريب |
| تقدير أولي مجاني | تقييم نطاق مجاني |
| البيانات الحيوية | البيانات البيومترية |
| الأرقام العربية المشرقية (٠١٢٣) | الأرقام الهندية |
| الإضرار بالسمعة | الضرر السمعي |
| الرموز (tokens) at first mention, then الرموز | توكن |

- Western digits (0–9) throughout, including in numbered headings.
- Arabic quotation marks «» around Arabic text.
- Attach a prefix to a Latin word with tatweel: بـRTL، الـAPI، وGoogle.
- Diacritics only where a word is otherwise ambiguous.
- Image alt text in the article's own language.
