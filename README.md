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
- Light / dark theme toggle with saved user preference
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
| Icons | Ionicons |
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
    │   └── script.js       # Navigation, filtering, theme toggle, form logic
    └── images/             # Avatar, icons, project covers, and blog covers
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
