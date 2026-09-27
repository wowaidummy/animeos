const desktop = document.getElementById('desktop');
const welcomeScreen = document.getElementById('welcome-screen');
const enterDesktop = document.getElementById('enter-desktop');
const clock = document.getElementById('taskbar-clock');
const missionMessage = document.getElementById('watch-message');
const missionCount = document.getElementById('watch-count');
const chakraCore = document.getElementById('charge-chakra');
const chakraLevel = document.getElementById('chakra-level');
const chakraFill = document.getElementById('chakra-fill');
const jutsuStatus = document.getElementById('jutsu-status');

let activeZIndex = 20;
let dragState = null;
let selectedJutsu = 'Wind Release';

function updateClock() {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function raiseWindow(windowElement) {
  activeZIndex += 1;
  windowElement.style.zIndex = activeZIndex;
}

function openWindow(windowId) {
  const windowElement = document.getElementById(windowId);
  if (!windowElement) return;

  windowElement.classList.add('is-open');
  windowElement.setAttribute('aria-hidden', 'false');
  raiseWindow(windowElement);
  (windowId === 'jutsu-window' ? chakraCore : windowElement.querySelector('.window-close')).focus();
  renderTaskbar();
}

function closeWindow(windowId) {
  const windowElement = document.getElementById(windowId);
  if (!windowElement) return;

  windowElement.classList.remove('is-open');
  windowElement.setAttribute('aria-hidden', 'true');
  document.querySelector(`[data-open-window="${windowId}"]`)?.focus();
  renderTaskbar();
}

function startDragging(event) {
  if (event.button !== 0 || event.target.closest('button')) return;

  const windowElement = event.currentTarget.closest('[data-window]');
  const desktopRect = desktop.getBoundingClientRect();
  const windowRect = windowElement.getBoundingClientRect();

  raiseWindow(windowElement);
  dragState = {
    windowElement,
    offsetX: event.clientX - windowRect.left,
    offsetY: event.clientY - windowRect.top,
    desktopRect,
  };

  event.currentTarget.setPointerCapture(event.pointerId);
}

function dragWindow(event) {
  if (!dragState) return;

  const { windowElement, offsetX, offsetY, desktopRect } = dragState;
  const topbarHeight = document.querySelector('.topbar').offsetHeight + 8;
  const maxLeft = Math.max(12, desktop.clientWidth - windowElement.offsetWidth - 12);
  const maxTop = Math.max(topbarHeight, desktop.clientHeight - windowElement.offsetHeight - 12);
  const nextLeft = event.clientX - desktopRect.left - offsetX;
  const nextTop = event.clientY - desktopRect.top - offsetY;

  windowElement.style.left = `${Math.min(Math.max(12, nextLeft), maxLeft)}px`;
  windowElement.style.top = `${Math.min(Math.max(topbarHeight, nextTop), maxTop)}px`;
}

function stopDragging() {
  dragState = null;
}

function selectAboutTab(tab) {
  document.querySelectorAll('[data-about-tab]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.aboutTab === tab);
  });

  document.querySelectorAll('[data-about-panel]').forEach((panel) => {
    panel.classList.toggle('is-visible', panel.dataset.aboutPanel === tab);
  });
}

function updateMissionCount(filter) {
  const visibleCards = [...document.querySelectorAll('.series-card:not(.is-filtered-out)')];
  const label = filter === 'all' ? 'stories in the archive' : `${filter} stories`;
  missionCount.textContent = `${visibleCards.length} ${label}`;
}

function filterMissions(filter) {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });

  document.querySelectorAll('.series-card').forEach((card) => {
    const isVisible = filter === 'all' || card.dataset.status === filter;
    card.classList.toggle('is-filtered-out', !isVisible);
  });

  updateMissionCount(filter);
}

function updateMissionProgress(event, change) {
  const card = event.currentTarget.closest('.series-card');
  const current = card.querySelector('.episode-value');
  const maximum = Number(card.querySelector('small').textContent.replace('/', ''));
  const next = Math.min(Math.max(0, Number(current.textContent) + change), maximum);
  const missionName = card.querySelector('h3').textContent;

  current.textContent = next;
  missionMessage.textContent = next === maximum
    ? `${missionName} is complete. Report back to the Hokage.`
    : `Checkpoint ${next} of ${maximum}: ${missionName}. Stay sharp.`;
}

function assignMission() {
  const choices = [...document.querySelectorAll('.series-card')];
  if (!choices.length) return;

  const choice = choices[Math.floor(Math.random() * choices.length)];
  filterMissions('all');
  choice.animate(
    [
      { transform: 'translateX(0)', boxShadow: '0 0 0 rgba(242, 102, 39, 0)' },
      { transform: 'translateX(5px)', boxShadow: '0 0 0 3px rgba(242, 102, 39, 0.28)' },
      { transform: 'translateX(0)', boxShadow: '0 0 0 rgba(242, 102, 39, 0)' },
    ],
    { duration: 700, easing: 'ease-out' },
  );
  missionMessage.textContent = `New assignment: ${choice.querySelector('h3').textContent}.`;
}

function selectJutsu(button) {
  selectedJutsu = button.dataset.jutsu;
  document.querySelectorAll('.jutsu-choice').forEach((choice) => {
    choice.classList.toggle('is-selected', choice === button);
  });
  jutsuStatus.textContent = `${selectedJutsu} selected. Focus your breathing.`;
}

function releaseChakra() {
  const level = Math.floor(Math.random() * 26) + 74;
  chakraCore.classList.remove('is-charging');
  void chakraCore.offsetWidth;
  chakraCore.classList.add('is-charging');
  chakraFill.style.width = `${level}%`;
  chakraLevel.textContent = `${level}%`;
  jutsuStatus.textContent = `${selectedJutsu} released at ${level}% chakra reserve.`;

  document.querySelector('.chakra-burst')?.remove();
  const bounds = chakraCore.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'chakra-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.setProperty('--origin-x', `${bounds.left + bounds.width / 2}px`);
  burst.style.setProperty('--origin-y', `${bounds.top + bounds.height / 2}px`);

  const waveCount = 3;
  for (let index = 0; index < waveCount; index += 1) {
    const wave = document.createElement('span');
    wave.className = `chakra-burst-wave wave-${index + 1}`;
    burst.append(wave);
  }

  const sparkCount = 36;
  for (let index = 0; index < sparkCount; index += 1) {
    const spark = document.createElement('i');
    spark.className = 'chakra-spark';
    spark.style.setProperty('--angle', `${index * 360 / sparkCount}deg`);
    spark.style.setProperty('--distance', `${Math.hypot(innerWidth, innerHeight) * (0.62 + (index % 4) * 0.1)}px`);
    spark.style.setProperty('--spark-length', `${18 + (index % 4) * 10}px`);
    spark.style.setProperty('--spark-delay', `${index % 6 * 18}ms`);
    burst.append(spark);
  }

  document.body.append(burst);
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 1750;
  window.setTimeout(() => burst.remove(), duration);
}

function saveNinjaLog() {
  const note = document.getElementById('scene-note');
  const savedNote = document.getElementById('saved-note');
  const value = note.value.trim();

  if (!value) {
    savedNote.textContent = 'Write a lesson first, then seal it into your scroll.';
    return;
  }

  const scrolls = readStoredValue('animeos.memory-scrolls', []);
  scrolls.unshift({ text: value, date: new Date().toLocaleDateString() });
  saveStoredValue('animeos.memory-scrolls', scrolls.slice(0, 20));
  note.value = '';
  document.getElementById('note-count').textContent = '0 / 600';
  savedNote.textContent = 'Entry sealed safely in your personal scroll.';
  renderScrolls();
}

function enterOS() {
  welcomeScreen.classList.add('is-hidden');
  document.getElementById('about-window').querySelector('.window-close').focus();
}

updateClock();
window.setInterval(updateClock, 1000);

enterDesktop.addEventListener('click', enterOS);
document.getElementById('home-button').addEventListener('click', () => {
  welcomeScreen.classList.remove('is-hidden');
  enterDesktop.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !welcomeScreen.classList.contains('is-hidden')) {
    enterOS();
  }
});

document.querySelectorAll('[data-open-window]').forEach((button) => {
  button.addEventListener('click', () => {
    const windowElement = document.getElementById(button.dataset.openWindow);
    if (windowElement.classList.contains('is-open')) {
      closeWindow(button.dataset.openWindow);
    } else {
      openWindow(button.dataset.openWindow);
    }
  });
});

document.querySelectorAll('[data-close-window]').forEach((button) => {
  button.addEventListener('click', () => closeWindow(button.dataset.closeWindow));
});

document.querySelectorAll('[data-window]').forEach((windowElement) => {
  windowElement.addEventListener('pointerdown', () => raiseWindow(windowElement));
  const dragHandle = windowElement.querySelector('[data-drag-handle]');
  dragHandle.addEventListener('pointerdown', startDragging);
  dragHandle.addEventListener('pointermove', dragWindow);
  dragHandle.addEventListener('pointerup', stopDragging);
  dragHandle.addEventListener('pointercancel', stopDragging);
});

document.querySelectorAll('[data-about-tab]').forEach((button) => {
  button.addEventListener('click', () => selectAboutTab(button.dataset.aboutTab));
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => filterMissions(button.dataset.filter));
});

document.querySelectorAll('.episode-minus').forEach((button) => {
  button.addEventListener('click', (event) => updateMissionProgress(event, -1));
});

document.querySelectorAll('.episode-plus').forEach((button) => {
  button.addEventListener('click', (event) => updateMissionProgress(event, 1));
});

document.getElementById('surprise-button').addEventListener('click', assignMission);
document.getElementById('scene-note').addEventListener('input', (event) => {
  document.getElementById('note-count').textContent = `${event.target.value.length} / 600`;
});

document.getElementById('save-note').addEventListener('click', saveNinjaLog);

const appDetails = {
  'about-window': { name: 'Shinobi Profile', mark: '忍' },
  'watch-window': { name: 'Mission Watch', mark: '巻' },
  'jutsu-window': { name: 'Chakra Lab', mark: '気' },
  'notes-window': { name: 'Memory Scrolls', mark: '文' },
  'notepad-window': { name: 'Field Scroll', mark: '帖' },
  'paint-window': { name: 'Ink Studio', mark: '筆' },
};
const defaultPins = ['about-window', 'watch-window', 'notepad-window'];
const pinnedWindows = new Set(readStoredValue('animeos.pinned-apps', defaultPins));
const startMenu = document.getElementById('start-menu');
const taskbarApps = document.getElementById('taskbar-apps');

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function renderTaskbar() {
  document.querySelectorAll('[data-pin-window]').forEach((button) => {
    const isPinned = pinnedWindows.has(button.dataset.pinWindow);
    button.setAttribute('aria-pressed', String(isPinned));
    button.classList.toggle('is-pinned', isPinned);
  });

  const openWindows = [...document.querySelectorAll('[data-window].is-open')].map((windowElement) => windowElement.id);
  const visibleApps = [...new Set([...pinnedWindows, ...openWindows])].filter((windowId) => appDetails[windowId]);
  taskbarApps.replaceChildren();

  visibleApps.forEach((windowId) => {
    const details = appDetails[windowId];
    const button = document.createElement('button');
    button.className = 'taskbar-app';
    button.type = 'button';
    button.title = details.name;
    button.setAttribute('aria-label', `${details.name}${openWindows.includes(windowId) ? ', open' : ''}`);
    button.setAttribute('aria-pressed', String(openWindows.includes(windowId)));
    button.classList.toggle('is-open', openWindows.includes(windowId));
    button.dataset.taskbarWindow = windowId;

    const mark = document.createElement('span');
    mark.className = 'taskbar-app-mark';
    mark.textContent = details.mark;
    button.append(mark);
    taskbarApps.append(button);
  });
}

function toggleStartMenu(forceOpen) {
  const shouldOpen = forceOpen ?? startMenu.getAttribute('aria-hidden') === 'true';
  startMenu.setAttribute('aria-hidden', String(!shouldOpen));
  startMenu.classList.toggle('is-open', shouldOpen);
  document.getElementById('start-button').setAttribute('aria-expanded', String(shouldOpen));
}

function renderScrolls() {
  const list = document.getElementById('scroll-entries');
  list.replaceChildren();

  readStoredValue('animeos.memory-scrolls', []).forEach((entry) => {
    const item = document.createElement('li');
    const date = document.createElement('span');
    const text = document.createElement('p');
    date.textContent = entry.date;
    text.textContent = entry.text;
    item.append(date, text);
    list.append(item);
  });
}

document.querySelectorAll('[data-pin-window]').forEach((button) => {
  button.addEventListener('click', () => {
    const windowId = button.dataset.pinWindow;
    if (pinnedWindows.has(windowId)) {
      pinnedWindows.delete(windowId);
    } else {
      pinnedWindows.add(windowId);
    }
    saveStoredValue('animeos.pinned-apps', [...pinnedWindows]);
    renderTaskbar();
  });
});

document.getElementById('start-button').addEventListener('click', () => toggleStartMenu());
document.getElementById('start-dismiss').addEventListener('click', () => toggleStartMenu(false));
document.querySelectorAll('.start-tile').forEach((button) => {
  button.addEventListener('click', () => toggleStartMenu(false));
});

taskbarApps.addEventListener('click', (event) => {
  const button = event.target.closest('[data-taskbar-window]');
  if (!button) return;

  const windowId = button.dataset.taskbarWindow;
  const windowElement = document.getElementById(windowId);
  if (windowElement.classList.contains('is-open')) {
    closeWindow(windowId);
  } else {
    openWindow(windowId);
  }
});

document.addEventListener('click', (event) => {
  if (startMenu.classList.contains('is-open') && !event.target.closest('#start-menu, #start-button')) {
    toggleStartMenu(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (startMenu.classList.contains('is-open')) {
    toggleStartMenu(false);
    return;
  }
  const activeWindow = [...document.querySelectorAll('[data-window].is-open')].at(-1);
  if (activeWindow) closeWindow(activeWindow.id);
});

const savedFieldNotes = readStoredValue('animeos.field-scroll', '');
const notepad = document.getElementById('notepad-text');
notepad.value = savedFieldNotes;
notepad.addEventListener('input', () => {
  saveStoredValue('animeos.field-scroll', notepad.value);
  document.getElementById('notepad-status').textContent = 'Saved locally';
});

document.querySelectorAll('[data-jutsu]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedJutsu = button.dataset.jutsu;
    document.querySelectorAll('[data-jutsu]').forEach((choice) => choice.classList.toggle('is-selected', choice === button));
    jutsuStatus.textContent = `${selectedJutsu} selected. Focus your breathing.`;
  });
});

document.getElementById('charge-chakra').addEventListener('click', releaseChakra);
renderScrolls();
renderTaskbar();

document.getElementById('jutsu-window').addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.repeat || event.target === chakraCore) return;
  if (event.target.closest('button, input, textarea, select, [contenteditable="true"]')) return;
  event.preventDefault();
  releaseChakra();
});

const canvas = document.getElementById('paint-canvas');
const paintContext = canvas.getContext('2d');
let isPainting = false;
canvas.width = 1200;
canvas.height = 675;
paintContext.fillStyle = '#fffdf7';
paintContext.fillRect(0, 0, canvas.width, canvas.height);
paintContext.lineCap = 'round';
paintContext.lineJoin = 'round';

function paintPoint(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * canvas.height / bounds.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  isPainting = true;
  canvas.setPointerCapture(event.pointerId);
  const point = paintPoint(event);
  paintContext.beginPath();
  paintContext.moveTo(point.x, point.y);
});

canvas.addEventListener('pointermove', (event) => {
  if (!isPainting) return;
  const point = paintPoint(event);
  const bounds = canvas.getBoundingClientRect();
  paintContext.strokeStyle = document.getElementById('paint-color').value;
  paintContext.lineWidth = Number(document.getElementById('paint-size').value) * canvas.width / bounds.width;
  paintContext.lineTo(point.x, point.y);
  paintContext.stroke();
});

canvas.addEventListener('pointerup', () => { isPainting = false; });
canvas.addEventListener('pointercancel', () => { isPainting = false; });
document.getElementById('paint-size').addEventListener('input', (event) => {
  document.getElementById('paint-size-label').textContent = `${event.target.value} px`;
});
document.getElementById('paint-clear').addEventListener('click', () => {
  paintContext.fillStyle = '#fffdf7';
  paintContext.fillRect(0, 0, canvas.width, canvas.height);
});
document.getElementById('paint-save').addEventListener('click', () => {
  const download = document.createElement('a');
  download.download = 'animeos-ink.png';
  download.href = canvas.toDataURL('image/png');
  download.click();
});
