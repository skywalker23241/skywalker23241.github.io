# Abo Le — Personal Developer Homepage

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-222?logo=github)](https://resume.abohack.com/)
[![Static Site](https://img.shields.io/badge/Static%20Site-HTML%20%2B%20CSS%20%2B%20JS-orange)](#tech-stack)
[![Responsive](https://img.shields.io/badge/Responsive-mobile%20friendly-blue)](#features)

This repository powers my personal GitHub Pages homepage. It is built as a lightweight portfolio site for introducing who I am, what I do, the projects I am building, and selected posts from my blog.

**Live site:** [resume.abohack.com](https://resume.abohack.com/)  
**GitHub Pages fallback:** [skywalker23241.github.io](https://skywalker23241.github.io/)

---

## Overview

The site works as a compact personal homepage and project showcase for **Abo Le**. It combines a resume-style profile, portfolio cards, blog links, and a contact form in one responsive static page.

It is designed to be:

- **Simple** — no backend or build step required
- **Fast** — static HTML, CSS, and JavaScript only
- **Portfolio-focused** — highlights projects, blog posts, skills, and contact information
- **Easy to maintain** — content can be updated directly from the repository files

---

## Features

- Personal sidebar with avatar, contact links, and social links
- About section for background, skills, and current focus
- Resume timeline for education and experience
- Portfolio section with category filtering
- Blog section linking to selected external blog posts
- Contact section with embedded map and Formspree-powered message form
- Automatic light / dark theme following the system preference
- Responsive layout for desktop and mobile screens

---

## Featured Projects

| Project | Type | Link |
|---|---|---|
| **RestCal 休历** | Application | [Open project](https://skywalker23241.github.io/restcal/) |
| **Abo Blog** | Web development | [Open blog](https://jackcooper.qzz.io/) |
| **RadiantShelf** | Application | [Open project](https://playvalorant.qzz.io/) |

---

## Tech Stack

| Area | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 |
| Interaction | Vanilla JavaScript |
| Icons | Phosphor Icons 2.1.1 (inline SVG, MIT) |
| Fonts | Google Fonts / Poppins |
| Contact Form | Formspree |
| Hosting | GitHub Pages |
| Custom Domain | `resume.abohack.com` |

---

## Project Structure

```text
.
├── index.html              # Main page content and structure
├── README.md               # Project documentation
└── assets/
    ├── css/
    │   └── style.css       # Main responsive styling
    ├── js/
    │   └── script.js       # Navigation, filtering, form logic
    └── images/             # Avatar, application icons, and blog covers
```

---

## Local Preview

Because this is a static site, it can be previewed directly in a browser.

For a better local development experience, run a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Deployment

This site is deployed with **GitHub Pages** from the repository's static files.

Production domain:

```text
resume.abohack.com
```

If GitHub Pages is set to deploy from a branch, use:

```text
Branch: main
Folder: / root
```

After changes are pushed to the main branch, GitHub Pages will publish the latest version automatically.

---

## Maintenance Notes

Blog uses lightweight text cards with inline Phosphor icons, category, title,
and date. The scheduled sync only fetches the RSS feed; it does not request
article pages or OG images. No image dependencies or third-party Python packages
are required. If RSS is unavailable, the existing cards remain unchanged.

To refresh blog posts locally:

```bash
python scripts/fetch_blog.py
```

Common updates can be made in these files:

| Task | File |
|---|---|
| Update page content | `index.html` |
| Update styles or layout | `assets/css/style.css` |
| Update page interactions | `assets/js/script.js` |
| Update custom domain | GitHub Pages settings or root `CNAME` file |
| Update project documentation | `README.md` |

---

## Roadmap

- Add more project case studies with screenshots and short descriptions
- Improve blog card automation so the latest posts can be synced more easily
- Add more structured SEO metadata for portfolio projects
- Add a dedicated projects page or detail pages for larger apps
- Refine copywriting for a more professional developer portfolio tone

---

## Contact

- Email: [lejunbo66@gmail.com](mailto:lejunbo66@gmail.com)
- X / Twitter: [@Leonozzzzz](https://x.com/Leonozzzzz)
- GitHub: [@skywalker23241](https://github.com/skywalker23241)

---

## License

This repository is currently maintained as a personal homepage project. If you want to reuse the layout or content, please keep attribution where appropriate.

### Icon assets

Interface icons are a local subset of [Phosphor Icons](https://github.com/phosphor-icons/core) 2.1.1. Their SVG paths are embedded directly in `index.html` so icons also render when opening the page through `file://`. The source sprite and MIT license are kept in `assets/icons/`. Copy the corresponding symbol paths into `<svg class="ph-icon" viewBox="0 0 256 256" aria-hidden="true">...</svg>` when adding an icon.

Portfolio icons in `assets/images/apps/` are copied from the corresponding project repositories: RestCal (`public/assets/icons/icon-192.png`), personal-budget-app (`public/logo.svg`), RadiantShelf (`static/apple-touch-icon.png`), scfi-web-status-theme (`public/favicon.ico`), and abo-astro-blog-theme (`public/apple-touch-icon.png`).

### Animated avatar

The avatar plays a brief nod and blink after the page loads. Click the avatar for the full pre-rendered 3D greeting, including looking around and waving the left hand. Playback pre-caches the aligned frames and uses a continuous timeline with additive transitions to avoid pauses and opacity flicker. `assets/js/avatar.js` draws the local 4×4 WebP sprite sheet and normalizes head positions. The original portrait remains available when JavaScript, canvas, or the optional animation asset is unavailable. Reduced-motion preferences skip the animation download. The imagegen prompt and original sprite sheet are saved in `assets/images/avatar-3d/`; only `greeting.webp` is requested by the page.
