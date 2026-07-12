/* ============================================================
   AK.01 — site config
   Fill these in, then push to GitHub. See README.md.
   ============================================================ */
const CONFIG = {
  GITHUB_USERNAME: "abhilekhkoirala",     // e.g. "abhilekh-koirala" — leave "" to show placeholders instead
  GITHUB_REPO_COUNT: 6,    // how many repos to show
  LINKEDIN_URL: "https://www.linkedin.com/in/abhilekh-koirala-863028280/",        // full URL it links to, e.g. "https://www.linkedin.com/in/your-actual-slug-863028280/"
  LINKEDIN_LABEL: "linkedin.com/abhilekhkoirala",      // what's displayed on the card, e.g. "linkedin.com/in/yourname" — leave "" to just show the URL above
  GITHUB_PROFILE_URL: "",  // optional override; defaults to github.com/<username>
  CHESS_PIECE_PATH: "assets/chess/",  // folder holding piece images, named e.g. white_pawn.png, black_knight.png
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
  initCube();
  initMiniChess();
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
// Tiny 3-row-tall pixel font — just enough letters to spell "WELCOME".
// Each letter is 3 rows × 3 cols, 'X' = lit. At only 3 rows tall these are
// necessarily abstracted (a real legible font needs ~5 rows), so treat
// them as a stylized dot-matrix impression of the word rather than a
// crisp typeface — add more letters here the same way if you want other
// words later.
const GLYPH_FONT_3ROW = {
  W: ['X.X', 'X.X', '.X.'],
  E: ['XXX', 'XX.', 'XXX'],
  L: ['X..', 'X..', 'XXX'],
  C: ['.XX', 'X..', '.XX'],
  O: ['XXX', 'X.X', 'XXX'],
  M: ['X.X', 'XXX', 'X.X'],
};
const GLYPH_LETTER_GAP = 1; // blank columns between letters so strokes don't bleed together

// Builds a 3-row boolean grid for a word from GLYPH_FONT_3ROW, with
// GLYPH_LETTER_GAP blank columns between letters. Letters missing from the
// font (or spaces) just render as a blank cell.
function buildWordPattern(word){
  const rows = [[], [], []];
  const letters = [...word.toUpperCase()];
  letters.forEach((ch, i) => {
    const glyph = GLYPH_FONT_3ROW[ch];
    if(glyph){
      glyph.forEach((rowStr, r) => rows[r].push(...[...rowStr].map(c => c === 'X')));
    } else {
      for(let r = 0; r < 3; r++) rows[r].push(false, false, false);
    }
    if(i < letters.length - 1){
      for(let r = 0; r < 3; r++) rows[r].push(...Array(GLYPH_LETTER_GAP).fill(false));
    }
  });
  return rows; // rows[r][c] — boolean per row/column
}

function initGlyphStrip(){
  const strip = document.getElementById('glyphStrip');
  const COLS = 27; // "WELCOME": 7 letters × 3 cols + 6 gaps × 1 col = 27
  const ROWS = 3;
  const total = COLS * ROWS;
  for(let i=0;i<total;i++){
    const s = document.createElement('span');
    strip.appendChild(s);
  }
  const dots = [...strip.children];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearDots(){
    dots.forEach(d => d.classList.remove('lit','accent'));
  }

  // Random reveal — used on click / keyboard activation, same as before.
  function playRandom(){
    clearDots();
    dots.forEach((d, i) => {
      setTimeout(() => {
        d.classList.add('lit');
        if(Math.random() < 0.15) d.classList.add('accent');
      }, reduced ? 0 : i * 18);
    });
  }

  // Types WELCOME out column by column, terminal-boot style. Only used
  // once, at load — every click/keypress after that goes back to playRandom.
  function playWelcome(){
    clearDots();
    const pattern = buildWordPattern('WELCOME');
    const cols = pattern[0].length; // 27, matching COLS — see buildWordPattern
    for(let c = 0; c < cols; c++){
      setTimeout(() => {
        for(let r = 0; r < ROWS; r++){
          if(pattern[r][c]) dots[r * COLS + c].classList.add('lit');
        }
      }, reduced ? 0 : c * 55);
    }
  }

  // Play the boot text, timed to start right as the boot overlay finishes
  // clearing (see initBoot's total*28+500 ≈ 1256ms, and initCube's matching
  // AUTO_SHUFFLE_DELAY) — otherwise it'd finish typing out behind the
  // still-visible overlay and never actually be seen happening.
  const INITIAL_PLAY_DELAY = 1300;
  setTimeout(playWelcome, reduced ? 0 : INITIAL_PLAY_DELAY);

  strip.addEventListener('click', playRandom);
  strip.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); playRandom(); }
  });
}

/* ---------------- rubik's cube (real 3x3x3 piece simulation) ----------------
   Instead of recoloring flat stickers, this builds 26 individual "cubie"
   pieces positioned in 3D. Shuffling picks a real layer (a 3x3 slab of 9
   pieces), rotates that whole slab 90/180/270deg around its axis with a
   visible animated turn, then "bakes" the result and moves on to the next
   move — the same way a physical cube (or a WCA scramble) actually works.
   Colors are attached to pieces, not grid positions, so they travel with
   the piece through every turn. ---------------------------------------- */
function initCube(){
  const scene = document.getElementById('cubeScene');
  const mount = document.getElementById('rubiksCube');
  if(!scene || !mount) return;

  const CUBIE = 48;      // px, size of one small piece
  const GAP = 4;         // px, gap between pieces
  const STEP = CUBIE + GAP;
  const TURN_MS = 340;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Opposite faces share a color, like a real cube's fixed color pairs —
  // gives a clean "solved" look to start, which then visibly mixes as it scrambles.
  const FACE_COLOR = { front: 'r', back: 'r', left: 'k', right: 'k', top: 'w', bottom: 'w' };

  mount.innerHTML = '';
  mount.style.position = 'relative';

  // NOTE: y follows plain CSS convention (+y = down on screen), so a piece's
  // "top" sticker is rendered when its y slot is -1, "bottom" when +1.
  const cubies = [];
  for(let x = -1; x <= 1; x++){
    for(let y = -1; y <= 1; y++){
      for(let z = -1; z <= 1; z++){
        if(x === 0 && y === 0 && z === 0) continue; // hidden core, never visible
        cubies.push(buildCubie(x, y, z));
      }
    }
  }

  function buildCubie(x, y, z){
    const el = document.createElement('div');
    el.className = 'cubie';
    const transformStr = `translate3d(${x*STEP}px, ${y*STEP}px, ${z*STEP}px)`;
    el.style.transform = transformStr;

    const faceDirs = [];
    if(z === 1) faceDirs.push('front');
    if(z === -1) faceDirs.push('back');
    if(x === 1) faceDirs.push('right');
    if(x === -1) faceDirs.push('left');
    if(y === -1) faceDirs.push('top');
    if(y === 1) faceDirs.push('bottom');

    faceDirs.forEach(dir => {
      const f = document.createElement('div');
      f.className = `cubie-face ${dir} ${FACE_COLOR[dir]}`;
      el.appendChild(f);
    });

    mount.appendChild(el);
    return { el, pos: { x, y, z }, transformStr };
  }

  // Rotate an integer grid position by a multiple of 90deg around an axis —
  // uses the exact same matrices CSS rotateX/Y/Z use, so logical position
  // tracking always matches what's actually on screen.
  function rotatePos(p, axis, angle){
    const rad = angle * Math.PI / 180;
    const cos = Math.round(Math.cos(rad));
    const sin = Math.round(Math.sin(rad));
    const { x, y, z } = p;
    if(axis === 'x') return { x, y: y*cos - z*sin, z: y*sin + z*cos };
    if(axis === 'y') return { x: x*cos + z*sin, y, z: -x*sin + z*cos };
    return { x: x*cos - y*sin, y: x*sin + y*cos, z };
  }

  function applyMove({ axis, slot, angle }){
    return new Promise(resolve => {
      const affected = cubies.filter(c => c.pos[axis] === slot);
      if(affected.length === 0){ resolve(); return; }

      const axisFn = axis === 'x' ? 'rotateX' : axis === 'y' ? 'rotateY' : 'rotateZ';

      const group = document.createElement('div');
      group.className = 'layer-group';
      mount.appendChild(group);
      affected.forEach(c => group.appendChild(c.el));

      const bake = () => {
        affected.forEach(c => {
          c.transformStr = `${axisFn}(${angle}deg) ${c.transformStr}`;
          c.el.style.transform = c.transformStr;
          c.pos = rotatePos(c.pos, axis, angle);
          mount.appendChild(c.el);
        });
        group.remove();
        resolve();
      };

      if(reduced){
        group.style.transform = `${axisFn}(${angle}deg)`;
        bake();
        return;
      }

      void group.offsetWidth; // force reflow before transition
      group.style.transition = `transform ${TURN_MS}ms cubic-bezier(.4,0,.2,1)`;
      requestAnimationFrame(() => { group.style.transform = `${axisFn}(${angle}deg)`; });

      let done = false;
      const finish = () => { if(done) return; done = true; bake(); };
      group.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, TURN_MS + 80); // fallback in case transitionend doesn't fire
    });
  }

  function randomMove(excludeAxis){
    const axes = ['x', 'y', 'z'].filter(a => a !== excludeAxis);
    const axis = axes[Math.floor(Math.random() * axes.length)];
    const slot = Math.random() < 0.5 ? 1 : -1;
    const angles = [90, -90, 180];
    const angle = angles[Math.floor(Math.random() * angles.length)];
    return { axis, slot, angle };
  }

  let shuffling = false;
  async function shuffle(){
    if(shuffling) return;
    shuffling = true;
    scene.classList.add('shuffling');

    const moveCount = 10 + Math.floor(Math.random() * 5); // 10-14 moves, like a real scramble
    let lastAxis = null;
    for(let i = 0; i < moveCount; i++){
      const move = randomMove(lastAxis);
      lastAxis = move.axis;
      await applyMove(move);
    }

    shuffling = false;
    scene.classList.remove('shuffling');
  }

  scene.addEventListener('click', shuffle);
  scene.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); shuffle(); }
  });

  // Auto-shuffle once on page load, timed to start right as the boot
  // overlay finishes clearing (see initBoot's total*28+500 timing).
  const AUTO_SHUFFLE_DELAY = 1300;
  if(!reduced){
    setTimeout(shuffle, AUTO_SHUFFLE_DELAY);
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
    const label = CONFIG.LINKEDIN_LABEL || CONFIG.LINKEDIN_URL.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    liLink.querySelector('.contact-value').textContent = label;
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


/* ============================================================
   CHESS — featured game viewer
   Board renders from CHESS_START + CHESS_GAME (a full move-by-move
   replay). Piece images are expected at:
     CONFIG.CHESS_PIECE_PATH + "<color>_<piece>.png"
   e.g. assets/chess/white_pawn.png, assets/chess/black_knight.png
   (pawn / knight / bishop / rook / queen / king × white / black)
   ============================================================ */
const CHESS_START = {
  a1:['white','rook'],   b1:['white','knight'], c1:['white','bishop'], d1:['white','queen'],
  e1:['white','king'],   f1:['white','bishop'], g1:['white','knight'], h1:['white','rook'],
  a2:['white','pawn'],   b2:['white','pawn'],   c2:['white','pawn'],   d2:['white','pawn'],
  e2:['white','pawn'],   f2:['white','pawn'],   g2:['white','pawn'],   h2:['white','pawn'],
  a7:['black','pawn'],   b7:['black','pawn'],   c7:['black','pawn'],   d7:['black','pawn'],
  e7:['black','pawn'],   f7:['black','pawn'],   g7:['black','pawn'],   h7:['black','pawn'],
  a8:['black','rook'],   b8:['black','knight'], c8:['black','bishop'], d8:['black','queen'],
  e8:['black','king'],   f8:['black','bishop'], g8:['black','knight'], h8:['black','rook'],
};

// Full move list, pre-resolved (from/to squares, captures, castling, checks).
// Game: 1.d4 Nf6 2.Nf3 g6 3.Bf4 Bg7 4.e3 O-O 5.c4 d6 6.Nc3 Nbd7 7.Bd3 c5 8.d5 Ng4
// 9.O-O a6 10.e4 Rb8 11.a4 Re8 12.h3 Nge5 13.Nxe5 Nxe5 14.Bg3 Nxd3 15.Qxd3 f5
// 16.exf5 Bxf5 17.Qe3 e5 18.dxe6 Rxe6 19.Qd2 Qd7 20.Rac1 Rbe8 21.Nd5 Re2 22.Qf4
// Be5 23.Qxe5 dxe5 24.Nf6+ 1-0
const CHESS_GAME = [
  {
    "san": "d4",
    "color": "white",
    "piece": "pawn",
    "from": "d2",
    "to": "d4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nf6",
    "color": "black",
    "piece": "knight",
    "from": "g8",
    "to": "f6",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nf3",
    "color": "white",
    "piece": "knight",
    "from": "g1",
    "to": "f3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "g6",
    "color": "black",
    "piece": "pawn",
    "from": "g7",
    "to": "g6",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Bf4",
    "color": "white",
    "piece": "bishop",
    "from": "c1",
    "to": "f4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Bg7",
    "color": "black",
    "piece": "bishop",
    "from": "f8",
    "to": "g7",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "e3",
    "color": "white",
    "piece": "pawn",
    "from": "e2",
    "to": "e3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "O-O",
    "color": "black",
    "piece": "king",
    "from": "e8",
    "to": "g8",
    "capturedSquare": null,
    "castle": "king",
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "c4",
    "color": "white",
    "piece": "pawn",
    "from": "c2",
    "to": "c4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "d6",
    "color": "black",
    "piece": "pawn",
    "from": "d7",
    "to": "d6",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nc3",
    "color": "white",
    "piece": "knight",
    "from": "b1",
    "to": "c3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nbd7",
    "color": "black",
    "piece": "knight",
    "from": "b8",
    "to": "d7",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Bd3",
    "color": "white",
    "piece": "bishop",
    "from": "f1",
    "to": "d3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "c5",
    "color": "black",
    "piece": "pawn",
    "from": "c7",
    "to": "c5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "d5",
    "color": "white",
    "piece": "pawn",
    "from": "d4",
    "to": "d5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Ng4",
    "color": "black",
    "piece": "knight",
    "from": "f6",
    "to": "g4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "O-O",
    "color": "white",
    "piece": "king",
    "from": "e1",
    "to": "g1",
    "capturedSquare": null,
    "castle": "king",
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "a6",
    "color": "black",
    "piece": "pawn",
    "from": "a7",
    "to": "a6",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "e4",
    "color": "white",
    "piece": "pawn",
    "from": "e3",
    "to": "e4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Rb8",
    "color": "black",
    "piece": "rook",
    "from": "a8",
    "to": "b8",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "a4",
    "color": "white",
    "piece": "pawn",
    "from": "a2",
    "to": "a4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Re8",
    "color": "black",
    "piece": "rook",
    "from": "f8",
    "to": "e8",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "h3",
    "color": "white",
    "piece": "pawn",
    "from": "h2",
    "to": "h3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nge5",
    "color": "black",
    "piece": "knight",
    "from": "g4",
    "to": "e5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nxe5",
    "color": "white",
    "piece": "knight",
    "from": "f3",
    "to": "e5",
    "capturedSquare": "e5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nxe5",
    "color": "black",
    "piece": "knight",
    "from": "d7",
    "to": "e5",
    "capturedSquare": "e5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Bg3",
    "color": "white",
    "piece": "bishop",
    "from": "f4",
    "to": "g3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nxd3",
    "color": "black",
    "piece": "knight",
    "from": "e5",
    "to": "d3",
    "capturedSquare": "d3",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qxd3",
    "color": "white",
    "piece": "queen",
    "from": "d1",
    "to": "d3",
    "capturedSquare": "d3",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "f5",
    "color": "black",
    "piece": "pawn",
    "from": "f7",
    "to": "f5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "exf5",
    "color": "white",
    "piece": "pawn",
    "from": "e4",
    "to": "f5",
    "capturedSquare": "f5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Bxf5",
    "color": "black",
    "piece": "bishop",
    "from": "c8",
    "to": "f5",
    "capturedSquare": "f5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qe3",
    "color": "white",
    "piece": "queen",
    "from": "d3",
    "to": "e3",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "e5",
    "color": "black",
    "piece": "pawn",
    "from": "e7",
    "to": "e5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "dxe6",
    "color": "white",
    "piece": "pawn",
    "from": "d5",
    "to": "e6",
    "capturedSquare": "e5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Rxe6",
    "color": "black",
    "piece": "rook",
    "from": "e8",
    "to": "e6",
    "capturedSquare": "e6",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qd2",
    "color": "white",
    "piece": "queen",
    "from": "e3",
    "to": "d2",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qd7",
    "color": "black",
    "piece": "queen",
    "from": "d8",
    "to": "d7",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Rac1",
    "color": "white",
    "piece": "rook",
    "from": "a1",
    "to": "c1",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Rbe8",
    "color": "black",
    "piece": "rook",
    "from": "b8",
    "to": "e8",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nd5",
    "color": "white",
    "piece": "knight",
    "from": "c3",
    "to": "d5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Re2",
    "color": "black",
    "piece": "rook",
    "from": "e6",
    "to": "e2",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qf4",
    "color": "white",
    "piece": "queen",
    "from": "d2",
    "to": "f4",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Be5",
    "color": "black",
    "piece": "bishop",
    "from": "g7",
    "to": "e5",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Qxe5",
    "color": "white",
    "piece": "queen",
    "from": "f4",
    "to": "e5",
    "capturedSquare": "e5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "dxe5",
    "color": "black",
    "piece": "pawn",
    "from": "d6",
    "to": "e5",
    "capturedSquare": "e5",
    "castle": null,
    "promotion": null,
    "check": false,
    "checkmate": false
  },
  {
    "san": "Nf6+",
    "color": "white",
    "piece": "knight",
    "from": "d5",
    "to": "f6",
    "capturedSquare": null,
    "castle": null,
    "promotion": null,
    "check": true,
    "checkmate": false
  }
];

function squareToRowCol(sq){
  const file = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1], 10);
  return { row: 8 - rank, col: file };
}


/* ============================================================
   MINI CHESS — decorative auto-playing replay (education section)
   Same CHESS_START / CHESS_GAME data as the featured CHESS section.
   It plays itself once and shows captured pieces piling up beside
   the board instead of vanishing. When the game ends it stops and
   holds the final position, revealing a REPLAY button over the
   board; clicking it flies every piece back to its start square and
   plays the game again.

   Unlike the featured viewer (which wipes and rebuilds every piece
   div on every ply — fine for click-to-jump, but no animation), this
   widget keeps one persistent DOM element per piece for its whole
   life. Moving a piece — or flying it out to a capture stack, or
   flying everything back to start on replay — is just updating that
   same element's left/top, so the CSS transition on .mini-chess-piece
   actually gets to animate it.
   ============================================================ */
function initMiniChess(){
  const sceneEl = document.getElementById('miniChessScene');
  const boardEl = document.getElementById('miniChessBoard');
  const layerEl = document.getElementById('miniChessLayer');
  const replayEl = document.getElementById('miniChessReplay');
  if(!boardEl || !layerEl) return;

  // Layout constants — must match the sizing in style.css
  // (.mini-chess-board-wrap / .mini-chess-piece).
  //
  // .mini-chess-board-wrap is 136×136 *border-box* (global box-sizing:
  // border-box) with a 4px border, and .mini-chess-board (the actual
  // checkerboard) is an absolutely-positioned child with inset:0 — which
  // sizes to the wrap's PADDING box, i.e. inside the border. So the
  // checkerboard only ever renders in a 136 - 2*4 = 128px square, not the
  // full 136. SQUARE has to come from that real interior, and every board
  // coordinate needs a +BORDER offset, or pieces drift further from their
  // square the further they are from the top-left corner.
  const BORDER = 4;                      // must match .mini-chess-board-wrap's border-width
  const INTERIOR = 128;                  // wrap's actual rendered checkerboard size (136 - 2*4)
  const SQUARE = INTERIOR / 8;           // 16 — a whole pixel
  const WRAP_SIZE = INTERIOR + BORDER * 2; // 136 — must match .mini-chess-board-wrap's width/height
  const BOARD_X = 40;          // left stack (34px) + gap (6px)

  const MOVE_INTERVAL = 1100;  // ms between plies while playing
  const END_PAUSE = 1800;      // ms to hold the final position before showing the replay button
  const RESET_HOLD = 1400;     // ms to let the "fly back to start" settle before replaying

  // build the 64 background squares once (purely visual)
  const files = ['a','b','c','d','e','f','g','h'];
  for(let row = 0; row < 8; row++){
    for(let col = 0; col < 8; col++){
      const rank = 8 - row;
      const div = document.createElement('div');
      div.className = 'mini-chess-sq ' + (((col + rank) % 2 === 0) ? 'light' : 'dark');
      boardEl.appendChild(div);
    }
  }

  function pieceImgSrc(color, piece){
    return `${CONFIG.CHESS_PIECE_PATH}${color}_${piece}.png`;
  }

  // The flexbox + object-fit:contain centering in CSS centers the <img>'s
  // BOX inside its square — but if the source PNG has uneven transparent
  // padding around the actual glyph (common across icon sets, where a
  // knight's canvas isn't padded the same as a pawn's), the box can be
  // centered while the drawn piece still looks off. This finds the real
  // bounding box of opaque pixels per image and crops tight to it, once,
  // so the image's own center *is* the glyph's center from then on.
  const spriteCropCache = new Map(); // raw src -> Promise<cropped data URL>
  function getCroppedSpriteSrc(src){
    if(spriteCropCache.has(src)) return spriteCropCache.get(src);
    const promise = new Promise(resolve => {
      const probe = new Image();
      probe.onload = () => {
        try{
          const w = probe.naturalWidth, h = probe.naturalHeight;
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(probe, 0, 0);
          const { data } = ctx.getImageData(0, 0, w, h);
          const ALPHA_THRESHOLD = 10;
          let minX = w, minY = h, maxX = -1, maxY = -1;
          for(let y = 0; y < h; y++){
            for(let x = 0; x < w; x++){
              if(data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD){
                if(x < minX) minX = x;
                if(x > maxX) maxX = x;
                if(y < minY) minY = y;
                if(y > maxY) maxY = y;
              }
            }
          }
          if(maxX < minX || maxY < minY){ resolve(src); return; } // fully transparent — bail out

          // Crop to a square centered on the glyph's own bounding box (not
          // the image's), padded to the larger dimension so nothing is
          // stretched — object-fit:contain then centers this new square
          // exactly on the visible artwork.
          const bw = maxX - minX + 1, bh = maxY - minY + 1;
          const side = Math.max(bw, bh);
          const cx = minX + bw / 2, cy = minY + bh / 2;
          const out = document.createElement('canvas');
          out.width = side; out.height = side;
          out.getContext('2d').drawImage(canvas, cx - side / 2, cy - side / 2, side, side, 0, 0, side, side);
          resolve(out.toDataURL());
        } catch(err){
          resolve(src); // e.g. canvas tainted — fall back to the original image
        }
      };
      probe.onerror = () => resolve(src);
      probe.src = src;
    });
    spriteCropCache.set(src, promise);
    return promise;
  }

  // Shows the raw sprite immediately (no blank flash while cropping runs),
  // then swaps in the recentered version as soon as it's ready.
  function setPieceImage(imgEl, color, piece){
    const src = pieceImgSrc(color, piece);
    imgEl.src = src;
    getCroppedSpriteSrc(src).then(cropped => { imgEl.src = cropped; });
  }

  // Every piece box is exactly one SQUARE, positioned at the cell's
  // top-left corner — no manual half-offset math. Centering the piece
  // artwork inside that box is CSS's job (see .mini-chess-piece
  // display:flex + its img rule), so it's automatically correct
  // regardless of piece color or image proportions.
  function squareCoord(sq){
    const { row, col } = squareToRowCol(sq);
    return { left: BOARD_X + BORDER + col * SQUARE, top: BORDER + row * SQUARE };
  }

  // side: 'left' for captured white pieces, 'right' for captured black pieces
  function stackCoord(side, index){
    const col = Math.floor(index / 8);
    const row = index % 8;
    const left = side === 'left'
      ? (34 - SQUARE * (col + 1))
      : (BOARD_X + WRAP_SIZE + 6) + col * SQUARE;
    const top = row * SQUARE;
    return { left, top };
  }

  let trackers = [];
  let bySquare = {};
  let currentPly = 0;
  let capturedLeft = 0;
  let capturedRight = 0;
  let timer = null;

  function placeOnBoard(t){
    const { left, top } = squareCoord(t.square);
    t.el.classList.remove('captured');
    t.el.style.left = left + 'px';
    t.el.style.top = top + 'px';
  }

  function placeInStack(t){
    const { left, top } = stackCoord(t.capturedSide, t.capturedIndex);
    t.el.classList.add('captured');
    t.el.style.left = left + 'px';
    t.el.style.top = top + 'px';
  }

  function setupGame(){
    layerEl.innerHTML = '';
    trackers = Object.keys(CHESS_START).map(sq => {
      const [color, piece] = CHESS_START[sq];
      const el = document.createElement('div');
      el.className = `mini-chess-piece ${color}`;
      const img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      img.loading = 'lazy';
      setPieceImage(img, color, piece);
      el.appendChild(img);
      layerEl.appendChild(el);
      return { startSquare: sq, square: sq, color, piece, origPiece: piece, capturedSide: null, capturedIndex: -1, el, img };
    });
    bySquare = {};
    trackers.forEach(t => { placeOnBoard(t); bySquare[t.square] = t; });
    capturedLeft = 0;
    capturedRight = 0;
    currentPly = 0;
  }

  function applyPly(){
    const m = CHESS_GAME[currentPly];
    currentPly++;

    if(m.capturedSquare && bySquare[m.capturedSquare]){
      const cap = bySquare[m.capturedSquare];
      delete bySquare[m.capturedSquare];
      cap.square = null;
      if(cap.color === 'white'){ cap.capturedSide = 'left'; cap.capturedIndex = capturedLeft++; }
      else { cap.capturedSide = 'right'; cap.capturedIndex = capturedRight++; }
      placeInStack(cap);
    }

    const mover = bySquare[m.from];
    if(mover){
      delete bySquare[m.from];
      mover.square = m.to;
      if(m.promotion && m.promotion !== mover.piece){
        mover.piece = m.promotion;
        setPieceImage(mover.img, mover.color, mover.piece);
      }
      bySquare[m.to] = mover;
      placeOnBoard(mover);
    }

    if(m.castle){
      const rank = m.color === 'white' ? 1 : 8;
      const rookFrom = m.castle === 'king' ? `h${rank}` : `a${rank}`;
      const rookTo   = m.castle === 'king' ? `f${rank}` : `d${rank}`;
      const rook = bySquare[rookFrom];
      if(rook){
        delete bySquare[rookFrom];
        rook.square = rookTo;
        bySquare[rookTo] = rook;
        placeOnBoard(rook);
      }
    }
  }

  function resetToStart(){
    trackers.forEach(t => {
      t.square = t.startSquare;
      t.capturedSide = null;
      t.capturedIndex = -1;
      if(t.piece !== t.origPiece){
        t.piece = t.origPiece;
        setPieceImage(t.img, t.color, t.piece);
      }
      placeOnBoard(t); // same elements, new left/top → the browser animates the flight home
    });
    bySquare = {};
    trackers.forEach(t => { bySquare[t.square] = t; });
    capturedLeft = 0;
    capturedRight = 0;
    currentPly = 0;
  }

  function showReplayButton(){
    if(replayEl) replayEl.classList.add('show');
  }

  function hideReplayButton(){
    if(replayEl) replayEl.classList.remove('show');
  }

  function tick(){
    if(currentPly < CHESS_GAME.length){
      applyPly();
      if(currentPly >= CHESS_GAME.length){
        // Hold on the final position, then stop for good — no more
        // auto-reset loop — and let the person choose to replay.
        timer = setTimeout(showReplayButton, END_PAUSE);
        return;
      }
    }
    timer = setTimeout(tick, MOVE_INTERVAL);
  }

  function playFromStart(){
    hideReplayButton();
    clearTimeout(timer);
    resetToStart(); // same elements, new left/top → pieces animate flying back home
    timer = setTimeout(tick, RESET_HOLD);
  }

  if(replayEl){
    replayEl.addEventListener('click', (e) => {
      e.stopPropagation();
      playFromStart();
    });
  }

  setupGame(); // render the starting position immediately; playback waits for scroll

  let started = false;
  function startPlaying(){
    if(started) return;
    started = true;
    timer = setTimeout(tick, MOVE_INTERVAL);
  }

  // Fires once the widget crosses the vertical middle of the viewport —
  // rootMargin shrinks the observed viewport to a single line at 50%,
  // so "isIntersecting" only flips true right as the element reaches it.
  // If the page loads already scrolled past that point, this fires immediately.
  if(sceneEl && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          startPlaying();
          io.disconnect();
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    io.observe(sceneEl);
  } else {
    startPlaying(); // no IntersectionObserver support — fall back to immediate start
  }
}
