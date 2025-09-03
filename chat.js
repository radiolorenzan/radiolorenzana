/* Radio Lorenzana - Chat moderno con tiempo relativo + PWA hook */
const messagesEl = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");

/** Convierte fecha a 'hace X ...' en español */
function timeAgo(ts) {
  const now = new Date();
  const d = (now - ts) / 1000; // segundos
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const divs = [
    ['year', 60*60*24*365],
    ['month', 60*60*24*30],
    ['day', 60*60*24],
    ['hour', 60*60],
    ['minute', 60],
    ['second', 1]
  ];
  for (const [unit, secs] of divs) {
    const value = Math.floor(d / secs);
    if (Math.abs(value) >= 1) return rtf.format(-value, unit);
  }
  return rtf.format(0, 'second');
}

/** Renderiza un mensaje */
function renderMessage({ id, text, sender = 'me', timestamp }) {
  const ts = new Date(timestamp);
  const wrapper = document.createElement('div');
  wrapper.className = `msg ${sender}`;
  wrapper.dataset.id = id;

  wrapper.innerHTML = `
    <div class="text">${text}</div>
    <div class="meta">
      <span class="ago" data-ts="${ts.toISOString()}">${timeAgo(ts)}</span>
    </div>
  `;
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/** Actualiza todos los 'hace X' cada 30s */
setInterval(() => {
  document.querySelectorAll('.ago').forEach(el => {
    const ts = new Date(el.dataset.ts);
    el.textContent = timeAgo(ts);
  });
}, 30000);

/** Persistencia simple en localStorage */
const STORE_KEY = 'rl_chat_messages_v1';
function loadMessages() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveMessages(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

let messages = loadMessages();

/** Mensajes demo al cargar por primera vez */
if (messages.length === 0) {
  messages = [
    { id: crypto.randomUUID(), text: "¡Bienvenido al chat de Radio Lorenzana!", sender: "other", timestamp: new Date(Date.now() - 1000*60*3).toISOString() },
    { id: crypto.randomUUID(), text: "Escribe tu mensaje y presiona Enviar.", sender: "other", timestamp: new Date(Date.now() - 1000*60*2).toISOString() },
  ];
  saveMessages(messages);
}

messages.forEach(renderMessage);

/** Envío de mensajes */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const msg = {
    id: crypto.randomUUID(),
    text,
    sender: 'me',
    timestamp: new Date().toISOString()
  };
  messages.push(msg);
  saveMessages(messages);
  renderMessage(msg);
  input.value = '';
});

/** PWA: botón de instalación */
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // Opcional: analytics
  deferredPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  // Opcional: mostrar toast
  installBtn.hidden = true;
});