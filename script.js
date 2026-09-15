const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bootScreen = document.querySelector('#boot-screen');
const bootText = document.querySelector('#boot-text');
const bootSkip = document.querySelector('#boot-skip');

function finishBoot() {
  if (!bootScreen || bootScreen.classList.contains('is-finished')) return;
  bootScreen.classList.add('is-finished');
}

if (!reduceMotion && bootScreen) {
  window.setTimeout(() => { if (bootText) bootText.textContent = 'Capabilities online. Welcome.'; }, 800);
  window.setTimeout(finishBoot, 1450);
  bootSkip?.addEventListener('click', finishBoot);
} else {
  finishBoot();
}

const roleWord = document.querySelector('#role-word');
const roles = ['agentic systems', 'RAG pipelines', 'reliable APIs'];
let roleIndex = 0;
if (!reduceMotion && roleWord) {
  window.setInterval(() => {
    roleWord.style.opacity = '0';
    roleWord.style.transform = 'translateY(-5px)';
    window.setTimeout(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleWord.textContent = roles[roleIndex];
      roleWord.style.opacity = '1';
      roleWord.style.transform = 'translateY(0)';
    }, 180);
  }, 2800);
  roleWord.style.transition = 'opacity .18s ease, transform .18s ease';
}

const menuButton = document.querySelector('#menu-button');
const siteNav = document.querySelector('#site-nav');
menuButton?.addEventListener('click', () => {
  const isOpen = siteNav?.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
});
siteNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  siteNav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const revealItems = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(item => item.classList.add('in-view'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
}

const counters = document.querySelectorAll('.proof-number');
let countersStarted = false;
function runCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach(counter => {
    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || '';
    if (reduceMotion) { counter.textContent = `${target}${suffix}`; return; }
    const startTime = performance.now();
    const duration = 950;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const proofBar = document.querySelector('.proof-bar');
if (proofBar && 'IntersectionObserver' in window && !reduceMotion) {
  const proofObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { runCounters(); proofObserver.disconnect(); }
  }, { threshold: .5 });
  proofObserver.observe(proofBar);
} else { runCounters(); }

const projectData = {
  retail: {
    title: 'RetailAgent / selected',
    detail: '12 LangGraph agents track 500+ SKUs across 10+ sites, using Playwright extraction, model routing, retries, and structured monitoring.',
    skills: ['agents', 'llms'],
    link: 'https://github.com/selva54321-bit/retail-agent',
    linkText: 'View RetailAgent repository ↗'
  },
  neuranotes: {
    title: 'NeuraNotes / selected',
    detail: 'GPT-4o and Gemini power transcription, summaries, and contextual Q&A, with FAISS retrieval below 500ms across multi-turn sessions.',
    skills: ['llms', 'rag', 'fastapi', 'vector'],
    link: '#network',
    linkText: 'See connected capabilities ↓'
  },
  variance: {
    title: 'VariancePay AI / selected',
    detail: 'A 3+ language voice banking workflow with ReAct-style agent flows, SQL execution, adaptive RAG, fraud detection, and production safeguards.',
    skills: ['agents', 'llms', 'rag', 'fastapi'],
    link: '#network',
    linkText: 'See connected capabilities ↓'
  }
};

const skillData = {
  agents: { title: 'Agent orchestration / selected', detail: 'LangChain and LangGraph coordinate tool use, structured workflows, retries, and observable multi-step decisions.', projects: ['retail', 'variance'] },
  llms: { title: 'LLM APIs / selected', detail: 'Production work includes OpenAI GPT-4o, Anthropic Claude, Google Gemini, and local Ollama models.', projects: ['retail', 'neuranotes', 'variance'] },
  rag: { title: 'RAG pipelines / selected', detail: 'Retrieval augments answers with the right meeting or banking context rather than relying on a model’s memory alone.', projects: ['neuranotes', 'variance'] },
  fastapi: { title: 'FastAPI / selected', detail: 'FastAPI delivers the application layer for meeting and multilingual voice workflows, including monitoring and fallback handling.', projects: ['neuranotes', 'variance'] },
  vector: { title: 'Vector search / selected', detail: 'FAISS and vector embeddings provide sub-second contextual retrieval for multi-turn meeting sessions.', projects: ['neuranotes'] }
};

const graphSelection = document.querySelector('#graph-selection');
const inspectorLabel = document.querySelector('#inspector-label');
const inspectorDetail = document.querySelector('#inspector-detail');
const inspectorLink = document.querySelector('#inspector-link');
const projectCards = document.querySelectorAll('[data-project]');
const graphNodes = document.querySelectorAll('.graph-node');
const edges = document.querySelectorAll('[data-edge]');

function setInspector(title, detail, link, linkText) {
  if (inspectorLabel) inspectorLabel.textContent = title;
  if (inspectorDetail) inspectorDetail.textContent = detail;
  if (inspectorLink) {
    inspectorLink.href = link;
    inspectorLink.textContent = linkText;
  }
}

function setGraphSelection(key, type = 'project') {
  const matching = type === 'project' ? projectData[key]?.skills || [] : skillData[key]?.projects || [];
  graphNodes.forEach(node => {
    const isProject = node.dataset.projectNode;
    const nodeKey = isProject || node.dataset.skill;
    const active = type === 'project'
      ? nodeKey === key || (!isProject && matching.includes(nodeKey))
      : nodeKey === key || (isProject && matching.includes(nodeKey));
    node.classList.toggle('active', active);
    node.classList.toggle('muted', !active);
  });
  edges.forEach(edge => {
    const values = edge.dataset.edge?.split(' ') || [];
    const active = type === 'project'
      ? values.includes(key) && matching.some(skill => values.includes(skill))
      : values.includes(key) && matching.some(project => values.includes(project));
    edge.classList.toggle('active', active);
    edge.classList.toggle('muted', !active);
  });
  if (graphSelection) graphSelection.textContent = type === 'project' ? `${projectData[key]?.title || key}` : `${skillData[key]?.title || key}`;
}

function selectProject(key, shouldScroll = false) {
  const data = projectData[key];
  if (!data) return;
  projectCards.forEach(card => {
    const active = card.dataset.project === key;
    card.classList.toggle('active', active);
    card.setAttribute('aria-pressed', String(active));
  });
  setInspector(data.title, data.detail, data.link, data.linkText);
  setGraphSelection(key, 'project');
  if (shouldScroll) document.querySelector('#network')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
}

projectCards.forEach(card => {
  card.addEventListener('click', () => selectProject(card.dataset.project));
  card.addEventListener('mouseenter', () => setGraphSelection(card.dataset.project, 'project'));
  card.addEventListener('mouseleave', () => {
    if (!document.querySelector('.project-card.active')) resetGraph();
  });
  card.addEventListener('focus', () => setGraphSelection(card.dataset.project, 'project'));
});

document.querySelectorAll('[data-skill]').forEach(node => node.addEventListener('click', () => {
  const key = node.dataset.skill;
  const data = skillData[key];
  if (!data) return;
  projectCards.forEach(card => {
    const active = data.projects.includes(card.dataset.project);
    card.classList.toggle('active', active);
    card.setAttribute('aria-pressed', String(active));
  });
  setInspector(data.title, data.detail, '#work', 'See related systems ↑');
  setGraphSelection(key, 'skill');
}));

document.querySelectorAll('[data-project-node]').forEach(node => node.addEventListener('click', () => {
  selectProject(node.dataset.projectNode, true);
}));

function resetGraph() {
  graphNodes.forEach(node => node.classList.remove('active', 'muted'));
  edges.forEach(edge => edge.classList.remove('active', 'muted'));
  projectCards.forEach(card => { card.classList.remove('active'); card.setAttribute('aria-pressed', 'false'); });
  if (graphSelection) graphSelection.textContent = 'all systems';
  setInspector('Select a system above', 'Each card maps to its real components in the capability network below.', '#network', 'Open capability map ↓');
}
document.querySelector('#reset-graph')?.addEventListener('click', resetGraph);

const mobileCopy = document.querySelector('#mobile-filter-copy');
const mobileCapabilities = {
  all: 'Agent orchestration · LLM APIs · RAG pipelines · FastAPI · Vector search',
  retail: 'Agent orchestration · LLM APIs · Playwright · model routing · structured monitoring',
  neuranotes: 'LLM APIs · RAG pipelines · FastAPI · FAISS vector search · LlamaIndex',
  variance: 'Agent orchestration · LLM APIs · RAG pipelines · FastAPI · SQL · STT/TTS'
};
document.querySelectorAll('[data-mobile-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-mobile-filter]').forEach(item => item.classList.toggle('active', item === button));
  if (mobileCopy) mobileCopy.textContent = mobileCapabilities[button.dataset.mobileFilter] || mobileCapabilities.all;
}));

document.querySelector('#year').textContent = new Date().getFullYear();
