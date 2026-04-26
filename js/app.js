// Portfolio — vanilla JS renderer
// Fetches data/portfolio.json, renders all sections, wires up interactivity.

const data = await fetch('./data/portfolio.json').then(r => r.json());

// ---------- helpers ----------
const esc = (s) => {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};
const fmtYear = (s) => (s ? s.slice(0, 4) : 'present');

// ---------- Theme ----------
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved && saved !== 'system') {
    document.documentElement.setAttribute('data-theme', saved);
  }
  return saved || 'system';
}
let currentTheme = initTheme();

function cycleTheme() {
  const order = ['system', 'light', 'dark'];
  currentTheme = order[(order.indexOf(currentTheme) + 1) % order.length];
  if (currentTheme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
  localStorage.setItem('theme', currentTheme);
  document.querySelector('.theme-toggle .theme-label').textContent = currentTheme;
}

// ---------- Render: Nav ----------
function renderNav() {
  return `
    <nav class="topnav">
      <div class="brand">
        manuel<span class="at">.brandstetter</span>
      </div>
      <div class="anchors">
        <a href="#work">work</a>
        <a href="#projects">projects</a>
        <a href="#contact">contact</a>
      </div>
      <div class="right">
        <button class="theme-toggle" title="Theme">
          <span class="dot"></span> <span class="theme-label">${currentTheme}</span>
        </button>
      </div>
    </nav>`;
}

// ---------- Render: Hero ----------
function renderHero() {
  const d = data.person;

  return `
    <section class="hero" id="top">
      <div class="hero-grid">
        <div class="hero-left">
          <div class="meta-label">
            <span class="num">01</span>
            <span>intro</span>
            <span class="dim">— ${esc(d.location)} · ${esc(d.tz)}</span>
          </div>
          <h1 class="hero-name">
            Manuel<span class="slash"> / </span>Brandstetter<span class="cursor"></span>
          </h1>
          <p class="hero-tagline">
            <b>Software Engineer</b> at inovex, in Munich.
          </p>
        </div>
      </div>
    </section>`;
}

// ---------- Render: Experience row ----------
function renderExperienceRow(row, idx) {
  const present = !row.end;
  const yearEnd = present
    ? '<span class="present">present</span>'
    : esc(fmtYear(row.end));

  const bullets = row.bullets.map(b => `<li>${esc(b)}</li>`).join('');

  return `
    <article class="experience-row" data-open="${idx === 0}" data-idx="${idx}"
             role="button" tabindex="0">
      <div class="year">
        ${esc(fmtYear(row.start))} — ${yearEnd}
      </div>
      <div class="org-col">
        <p class="org">${esc(row.org)}</p>
        <div class="loc">${esc(row.location)}</div>
      </div>
      <div class="role-col">
        <p class="role">${esc(row.role)}</p>
        <p class="summary">${esc(row.summary)}</p>
      </div>
      <div class="expand-col">
        <span class="expand-chip">${idx === 0 ? '– collapse' : '+ expand'}</span>
      </div>
      <div class="detail">
        <div class="detail-inner">
          <div class="detail-body">
            <ul>${bullets}</ul>
          </div>
        </div>
      </div>
    </article>`;
}

// ---------- Render: Experience ----------
function renderExperience() {
  const rows = data.experience.map((row, i) => renderExperienceRow(row, i)).join('');

  return `
    <section class="section" id="work">
      <header class="section-head">
        <div class="num-col"><span class="n">02</span> · work experience</div>
        <h2>Day job — inovex, Munich, since 2018.</h2>
        <div class="aside">click a row to expand ↓</div>
      </header>
      <div class="experience-list">
        ${rows}
      </div>
    </section>`;
}

// ---------- Render: Projects ----------
function renderProjectCards(projects) {
  return projects.map(p => {
    const hasDetail = !!(p.stackGroups);
    const hasLink = !!(p.link);

    const expandChip = hasDetail
      ? `<span class="expand-chip">+ expand</span>`
      : '';
    const visitLink = hasLink
      ? `<a class="project-visit-link" href="${esc(p.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Visit ↗</a>`
      : '';
    const footerHtml = (hasDetail || hasLink)
      ? `<div class="project-footer">${expandChip}${visitLink}</div>`
      : '';

    const detailHtml = hasDetail ? `
      <div class="project-detail">
        <div class="project-detail-inner">
          <div class="project-detail-body">
            ${p.stackGroups.map(g => `
              <div class="stack-group">
                <div class="stack-group-label">${esc(g.label)}</div>
                <div class="stack-list">
                  ${g.items.map(s => `<span class="stack-chip">${esc(s)}</span>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>` : '';

    return `
      <article class="project-card${p.featured ? ' featured' : ''}"
               ${hasDetail ? 'data-expandable="true"' : ''}
               data-open="false">
        <div class="project-thumb">
          <span class="project-thumb-caption">${esc(p.caption)}</span>
        </div>
        <div class="project-meta">
          <div class="top">
            <h3>${esc(p.name)}</h3>
            <span class="year">${esc(p.year)}</span>
          </div>
          <div class="client">↳ ${esc(p.client)} · ${esc(p.role)}</div>
          <p class="summary">${esc(p.summary)}</p>
          <div class="tags">
            ${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>
          ${footerHtml}
        </div>
        ${detailHtml}
      </article>`;
  }).join('');
}

function getTagCounts() {
  const t = new Map();
  data.projects.forEach(p => p.tags.forEach(x => t.set(x, (t.get(x) || 0) + 1)));
  return Array.from(t.entries()).sort((a, b) => b[1] - a[1]);
}

function renderProjects() {
  const allTags = getTagCounts();
  const chips = [
    `<button class="filter-chip" data-filter="all" data-active="true">all <span class="count">${data.projects.length}</span></button>`,
    ...allTags.map(([t, n]) =>
      `<button class="filter-chip" data-filter="${esc(t)}" data-active="false">${esc(t)} <span class="count">${n}</span></button>`
    )
  ].join('');

  return `
    <section class="section" id="projects">
      <header class="section-head">
        <div class="num-col"><span class="n">03</span> · projects</div>
        <h2>Selected work — 2020 onward.</h2>
        <div class="aside projects-count">${data.projects.length} of ${data.projects.length}</div>
      </header>
      <div class="projects-filter">
        ${chips}
      </div>
      <div class="projects-grid">
        ${renderProjectCards(data.projects)}
      </div>
    </section>`;
}

// ---------- Render: Education ----------
function renderEducation() {
  const rows = data.education.map(e => `
    <div class="education-row">
      <div class="years">${esc(e.start)} — ${esc(e.end)}</div>
      <div>
        <p class="degree">${esc(e.degree)}</p>
        <div class="school">${esc(e.school)}</div>
      </div>
    </div>`
  ).join('');

  return `
    <section class="section" id="education">
      <header class="section-head">
        <div class="num-col"><span class="n">04</span> · education</div>
        <h2>Two degrees in informatics — Munich and Landshut.</h2>
        <div class="aside">Munich · Landshut</div>
      </header>
      <div class="education-list">
        ${rows}
      </div>
    </section>`;
}

// ---------- Render: Footer ----------
function renderFooter() {
  const d = data.person;
  return `
    <footer class="footer" id="contact">
      <div class="footer-grid">
        <h2>
          Nice work<br>needs <span class="blink">collaborators</span>.
        </h2>
        <div class="footer-links">
          <a class="footer-link" href="${esc(d.links.linkedin)}" target="_blank" rel="noopener">
            LinkedIn <span class="arrow">→</span>
          </a>
          <a class="footer-link" href="${esc(d.links.github)}" target="_blank" rel="noopener">
            GitHub <span class="arrow">→</span>
          </a>
        </div>
        <div class="footer-meta">
          <span>© ${new Date().getFullYear()} Manuel Brandstetter · Built with HTML, CSS, and subgrid.</span>
          <span>v2.0 — redesigned April 2026</span>
        </div>
      </div>
    </footer>`;
}

// ---------- Mount ----------
const root = document.getElementById('root');
root.innerHTML =
  renderNav() +
  '<main>' +
    renderHero() +
    renderExperience() +
    renderProjects() +
    renderEducation() +
  '</main>' +
  renderFooter();

// ---------- Interactivity ----------

// Theme toggle
document.querySelector('.theme-toggle').addEventListener('click', cycleTheme);

// Experience accordion
let openExp = 0;
function setOpenExperience(idx) {
  const rows = document.querySelectorAll('.experience-row');
  rows.forEach((row, i) => {
    const isOpen = i === idx;
    row.setAttribute('data-open', isOpen);
    row.querySelector('.expand-chip').textContent = isOpen ? '– collapse' : '+ expand';
  });
  openExp = idx;
}

document.querySelector('.experience-list').addEventListener('click', (e) => {
  const row = e.target.closest('.experience-row');
  if (!row) return;
  const idx = parseInt(row.dataset.idx);
  setOpenExperience(openExp === idx ? -1 : idx);
});
document.querySelector('.experience-list').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('.experience-row');
  if (!row) return;
  e.preventDefault();
  const idx = parseInt(row.dataset.idx);
  setOpenExperience(openExp === idx ? -1 : idx);
});

// Project card expand
document.querySelector('.projects-grid').addEventListener('click', (e) => {
  if (e.target.closest('.project-visit-link')) return;
  const card = e.target.closest('.project-card[data-expandable]');
  if (!card) return;
  const isOpen = card.getAttribute('data-open') === 'true';
  card.setAttribute('data-open', !isOpen);
  card.querySelector('.expand-chip').textContent = isOpen ? '+ expand' : '– collapse';
});

// Project filter
let currentFilter = 'all';
document.querySelector('.projects-filter').addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  const filter = chip.dataset.filter;
  if (filter === currentFilter) return;

  currentFilter = filter;
  // Update active states on chips
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.setAttribute('data-active', c.dataset.filter === filter);
  });

  // Filter and re-render cards
  const filtered = filter === 'all'
    ? data.projects
    : data.projects.filter(p => p.tags.includes(filter));

  document.querySelector('.projects-grid').innerHTML = renderProjectCards(filtered);
  document.querySelector('.projects-count').textContent = `${filtered.length} of ${data.projects.length}`;
});
