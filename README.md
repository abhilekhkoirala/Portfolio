# Abhilekh Koirala — Portfolio

A responsive, static portfolio with selected projects, experience, education, skills, and contact details. Built with HTML, CSS, and a small amount of JavaScript. No dependencies, build step, API keys, or external font requests are required.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Check JavaScript syntax with `node --check script.js`. The page, stylesheet, script, and résumé PDF should all return HTTP 200. Check the mobile navigation and résumé download after edits.

## Updating content

- Edit `index.html` for project descriptions, experience, education, skills, and contact links.
- Edit `style.css` for colors, typography, illustrations, and responsive layouts.
- Edit `script.js` for mobile navigation, active navigation links, and copying the email address.
- Replace `assets/Resume_AK.pdf` to update the résumé. The download links use the filename `Abhilekh_Koirala_Resume.pdf`.
- If the email changes, update both `index.html` and the clipboard handler in `script.js`.

Project and experience descriptions are based on the supplied résumé. The market chart is illustrative; the NEPSEQuant statistics describe a historical backtest, not live trading results. Project details are stored in the page so they remain available when GitHub is unreachable. The GitHub profile link provides access to public repositories.

## GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main`, and select the repository root (`/`). Publish the static files directly; no build command is needed.

## Files

- `index.html` — content and semantic page structure
- `style.css` — responsive design and CSS illustrations
- `script.js` — progressive enhancements; core content and downloads work without JavaScript
- `assets/Resume_AK.pdf` — downloadable résumé
- Other assets remain available from the previous design.
