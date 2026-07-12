/* ============================================================
   AK.01 — site config
   Fill these in, then push to GitHub. See README.md.
   ============================================================ */
const CONFIG = {
  GITHUB_USERNAME: "abhilekhkoirala",     // e.g. "abhilekh-koirala" — leave "" to show placeholders instead
  GITHUB_REPO_COUNT: 6,    // how many repos to show
  LINKEDIN_URL: "https://www.linkedin.com/in/abhilekh-koirala-863028280/",        // e.g. "https://linkedin.com/in/your-handle"
  GITHUB_PROFILE_URL: "",  // optional override; defaults to github.com/<username>
};

// Manual fallback projects — edit freely, used when GITHUB_USERNAME is empty
// or the GitHub API request fails (e.g. rate limit).
const MANUAL_PROJECTS = [
  {
    name: "your-project-name",
    description: "Add a short description of the project here.",
    lang: "Python",
    url: "https://github.com/your-username/your-project-name",
  },
  {
    name: "add-more-in-script.js",
    description: "Duplicate this object in MANUAL_PROJECTS, or set GITHUB_USERNAME above to pull repos automatically.",
    lang: "—",
    url: "#",
  },
];

document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initGlyphStrip();
  initTheme();
  initNav();
  initScrollspy();
  initReveal();
  initTicker();
  initMeters();
  initContact();
  initProjects();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------- boot overlay ---------------- */
function initBoot(){
  const grid = document.getElementById('bootGrid');
  const boot = document.getElementById('boot');
  const total = 27;
  for(let i=0;i<total;i++){
    const d = document.createElement('span');
    grid.appendChild(d);
  }
  const dots = [...grid.children];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reduced){
    boot.classList.add('hidden');
    return;
  }

  dots.forEach((d, i) => {
    setTimeout(() => {
      d.classList.add('lit');
      if(Math.random() < 0.18) d.classList.add('accent');
    }, i * 28);
  });

  setTimeout(() => boot.classList.add('hidden'), total * 28 + 500);
}

/* ---------------- hero glyph strip ---------------- */
function initGlyphStrip(){
  const strip = document.getElementById('glyphStrip');
  const total = 48;
  for(let i=0;i<total;i++){
    const s = document.createElement('span');
    strip.appendChild(s);
  }
  const dots = [...strip.children];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playSequence(){
    dots.forEach(d => d.classList.remove('lit','accent'));
    dots.forEach((d, i) => {
      setTimeout(() => {
        d.classList.add('lit');
        if(Math.random() < 0.15) d.classList.add('accent');
      }, reduced ? 0 : i * 18);
    });
  }

  playSequence();
  strip.addEventListener('click', playSequence);
  strip.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); playSequence(); }
  });
}

/* ---------------- theme toggle ---------------- */
function initTheme(){
  const root = document.documentElement;
  const btn = document.getElementById('themeSwitch');
  const label = btn.querySelector('.switch-label');
  const saved = localStorage.getItem('ak-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('ak-theme', next);
  });

  function applyTheme(t){
    root.setAttribute('data-theme', t);
    btn.setAttribute('aria-pressed', String(t === 'dark'));
    label.textContent = t.toUpperCase();
  }
}

/* ---------------- nav (mobile burger) ---------------- */
function initNav(){
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------- scrollspy ---------------- */
function initScrollspy(){
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ---------------- reveal on scroll ---------------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(i => observer.observe(i));
}

/* ---------------- ticker (seamless loop) ---------------- */
function initTicker(){
  const track = document.getElementById('tickerTrack');
  track.innerHTML += track.innerHTML; // duplicate content for seamless marquee
}

/* ---------------- language meters ---------------- */
function initMeters(){
  const meters = document.querySelectorAll('.meter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const meter = entry.target;
        const level = parseInt(meter.dataset.level, 10);
        const segs = [...meter.querySelectorAll('.seg')];
        segs.forEach((seg, i) => {
          seg.style.setProperty('--i', i);
          if(i < level){
            seg.classList.add('on');
            if(i === level - 1) seg.classList.add('accent');
          }
        });
        meter.classList.add('filled');
        observer.unobserve(meter);
      }
    });
  }, { threshold: 0.4 });
  meters.forEach(m => observer.observe(m));
}

/* ---------------- contact (copy email + dynamic links) ---------------- */
function initContact(){
  const emailBtn = document.getElementById('emailBtn');
  const toast = document.getElementById('toast');

  emailBtn.addEventListener('click', async () => {
    const email = emailBtn.dataset.email;
    try{
      await navigator.clipboard.writeText(email);
      showToast('COPIED_EMAIL_TO_CLIPBOARD');
    }catch{
      window.location.href = `mailto:${email}`;
    }
  });

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  const ghLink = document.getElementById('githubLink');
  const liLink = document.getElementById('linkedinLink');

  if(CONFIG.GITHUB_USERNAME){
    const url = CONFIG.GITHUB_PROFILE_URL || `https://github.com/${CONFIG.GITHUB_USERNAME}`;
    ghLink.href = url;
    ghLink.querySelector('.contact-value').textContent = `/${CONFIG.GITHUB_USERNAME}`;
    ghLink.querySelector('.contact-hint').textContent = 'VIEW PROFILE';
  }
  if(CONFIG.LINKEDIN_URL){
    liLink.href = CONFIG.LINKEDIN_URL;
    liLink.querySelector('.contact-value').textContent = CONFIG.LINKEDIN_URL.replace(/^https?:\/\/(www\.)?/, '');
    liLink.querySelector('.contact-hint').textContent = 'VIEW PROFILE';
  }
}

/* ---------------- projects: live GitHub repos or manual fallback ---------------- */
async function initProjects(){
  const grid = document.getElementById('repoGrid');
  const status = document.getElementById('repoStatus');

  if(!CONFIG.GITHUB_USERNAME){
    status.textContent = 'GITHUB_USERNAME not set in script.js — showing placeholder projects below.';
    renderProjects(grid, MANUAL_PROJECTS);
    return;
  }

  status.textContent = `Fetching public repositories for ${CONFIG.GITHUB_USERNAME}…`;

  try{
    const res = await fetch(`https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if(!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && !r.private)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, CONFIG.GITHUB_REPO_COUNT);

    if(filtered.length === 0){
      status.textContent = `No public repositories found for ${CONFIG.GITHUB_USERNAME} yet — showing placeholders.`;
      renderProjects(grid, MANUAL_PROJECTS);
      return;
    }

    status.textContent = `Live from github.com/${CONFIG.GITHUB_USERNAME} — updates automatically.`;
    renderProjects(grid, filtered.map(r => ({
      name: r.name,
      description: r.description || 'No description provided.',
      lang: r.language || '—',
      stars: r.stargazers_count,
      url: r.html_url,
    })));
  }catch(err){
    status.textContent = `Couldn't load live repos (rate limit or network). Showing placeholders — view github.com/${CONFIG.GITHUB_USERNAME} directly.`;
    renderProjects(grid, MANUAL_PROJECTS);
  }
}

function renderProjects(grid, items){
  grid.innerHTML = '';
  items.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'repo-card reveal';
    card.innerHTML = `
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div class="repo-meta">
        <span><span class="repo-lang-dot"></span>${escapeHtml(p.lang)}</span>
        ${typeof p.stars === 'number' ? `<span>★ ${p.stars}</span>` : ''}
      </div>
      <a class="repo-link" href="${p.url}" target="_blank" rel="noopener">VIEW_REPO →</a>
    `;
    grid.appendChild(card);
  });
  // re-run reveal observer on newly injected cards
  initReveal();
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
