# AK.01 — Portfolio Site

A static, pixel/dot-matrix portfolio site (Nothing-tech-inspired) built from Abhilekh Koirala's résumé. Pure HTML/CSS/JS — no build step, so it deploys straight to GitHub Pages.

## Deploy to GitHub Pages (2 minutes)

1. Create a new GitHub repository (e.g. `portfolio` or `your-username.github.io`).
2. Upload these files to the repo root: `index.html`, `style.css`, `script.js`, `assets/Resume_AK.pdf`.
   - Easiest way: on the repo page, click **Add file → Upload files**, drag in everything, commit.
   - Or via git:
     ```bash
     git init
     git add .
     git commit -m "Initial site"
     git branch -M main
     git remote add origin https://github.com/your-username/your-repo.git
     git push -u origin main
     ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Save.
6. Wait ~1 minute, then your site is live at:
   - `https://your-username.github.io/your-repo/` (normal repo), or
   - `https://your-username.github.io/` (if the repo is named exactly `your-username.github.io`)

## Connect your GitHub projects (the part you'll update later)

Open `script.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  GITHUB_USERNAME: "your-username",   // your public repos will auto-populate the Projects section
  GITHUB_REPO_COUNT: 6,
  LINKEDIN_URL: "https://linkedin.com/in/your-handle",
  GITHUB_PROFILE_URL: "",             // optional, only if you want a custom profile link
};
```

- Once `GITHUB_USERNAME` is set, the **Projects → Code** section fetches your public, non-fork repositories live from the GitHub API (sorted by stars, then recency) — no rebuild needed, it just works on page load.
- If you'd rather curate the list by hand (or the API rate-limits), edit the `MANUAL_PROJECTS` array right below `CONFIG` — it's used automatically as a fallback.

## Customizing content

- **Résumé sections** (About, Education, Experience, Skills, Leadership): edit directly in `index.html` — it's plain, readable markup with clear section comments.
- **Contact card**: email/phone are in the `#contact` section of `index.html`.
- **Résumé PDF download button**: points to `assets/Resume_AK.pdf` — swap the file (same name) to update it.
- **Colors / fonts**: all design tokens are CSS custom properties at the top of `style.css` (`:root` and `[data-theme="dark"]`). Change `--red` for a different accent, or the two Google Fonts links in `index.html`'s `<head>` for different typefaces.

## A privacy note

Your phone number is currently shown in the Contact section, taken from your résumé. That's fine for a résumé you hand out, but this site will be public on the open web once deployed. Consider removing the phone card (or replacing it with just email + GitHub/LinkedIn) before you push it live — the phone `<a class="contact-item">` block is easy to delete from `index.html`.

## Structure

```
.
├── index.html      # all content/sections
├── style.css       # design tokens + layout (dot-matrix / glyph theme)
├── script.js       # boot animation, theme toggle, scrollspy, GitHub fetch
└── assets/
    └── Resume_AK.pdf
```

No dependencies, no npm, no build tools — just static files.
