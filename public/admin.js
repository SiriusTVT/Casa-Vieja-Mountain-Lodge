const authCard = document.getElementById('auth-card');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authDescription = document.getElementById('auth-description');
const authSubmit = document.getElementById('auth-submit');
const toggleSetup = document.getElementById('toggle-setup');
const authStatus = document.getElementById('auth-status');
const dashboard = document.getElementById('dashboard');
const quotesElement = document.getElementById('quotes');
const dashboardMeta = document.getElementById('dashboard-meta');
let setupMode = false;

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ocurrió un error.');
  return data;
}

function setSetupMode(enabled) {
  setupMode = enabled;
  authTitle.textContent = enabled ? 'Crear administrador' : 'Iniciar sesión';
  authDescription.textContent = enabled ? 'Este registro solo está disponible si aún no existe un administrador.' : 'Administra las solicitudes de cotización del lodge.';
  authSubmit.textContent = enabled ? 'Crear administrador' : 'Iniciar sesión';
  toggleSetup.hidden = !enabled;
  document.getElementById('password').setAttribute('autocomplete', enabled ? 'new-password' : 'current-password');
}

function renderQuotes(quotes) {
  dashboardMeta.textContent = `${quotes.length} cotización${quotes.length === 1 ? '' : 'es'} registrada${quotes.length === 1 ? '' : 's'}.`;
  quotesElement.replaceChildren();
  if (!quotes.length) { quotesElement.innerHTML = '<p>Aún no hay cotizaciones.</p>'; return; }
  quotes.forEach((quote) => {
    const article = document.createElement('article');
    article.className = 'quote';
    const terminalState = quote.estado === 'confirmado' || quote.estado === 'cancelado';
    const actions = terminalState ? '' : `<button type="button" class="payment-link-button" data-quote-id="${quote.id}">Generar link de pago</button><button type="button" class="quote-confirm" data-quote-id="${quote.id}">Confirmar pago</button><button type="button" class="quote-cancel" data-quote-id="${quote.id}">Cancelar</button>`;
    article.innerHTML = `<h2></h2><p><strong>Experiencia:</strong> ${quote.experienciaNombre || quote.experiencia}</p><p><strong>Fechas:</strong> ${quote.llegada} a ${quote.salida || 'No aplica'}</p><p><strong>Huéspedes:</strong> ${quote.huespedes}</p><p><strong>Cotización:</strong> ${quote.cotizacion}</p><p><strong>Contacto:</strong> ${quote.email} · ${quote.telefono}</p><p>${quote.comentarios || ''}</p><small>Estado: ${quote.estado} · Pago: ${quote.payment?.status || 'sin link'} · ${new Date(quote.createdAt).toLocaleString('es-CO')}</small><div class="payment-actions">${actions}<button type="button" class="quote-delete" data-quote-id="${quote.id}">Eliminar</button><span class="payment-link-result" role="status"></span></div>`;
    article.querySelector('h2').textContent = quote.nombre;
    quotesElement.append(article);
  });
  quotesElement.querySelectorAll('.payment-link-button').forEach((button) => button.addEventListener('click', async () => {
    const result = button.parentElement.querySelector('.payment-link-result');
    const data = await request('/api/admin/cotizaciones');
    authCard.hidden = true;
    dashboard.hidden = false;
    renderQuotes(data.quotes);
    dashboard.querySelector('.eyebrow').textContent = `Sesión: ${username}`;
    button.disabled = true; button.textContent = 'Generando...';
    try { const data = await request(`/api/admin/cotizaciones/${button.dataset.quoteId}/payment-link`, { method: 'POST' }); await navigator.clipboard.writeText(data.link); result.textContent = 'Link copiado'; result.title = data.link; button.textContent = 'Generar nuevo link'; }
    catch (error) { result.textContent = error.message; button.textContent = 'Reintentar'; button.disabled = false; }
  }));
  quotesElement.querySelectorAll('.quote-confirm, .quote-cancel, .quote-delete').forEach((button) => button.addEventListener('click', async () => {
    const action = button.classList.contains('quote-delete') ? 'delete' : button.classList.contains('quote-confirm') ? 'confirmar' : 'cancelar';
    if (!window.confirm(action === 'delete' ? '¿Eliminar definitivamente esta cotización?' : `¿${action === 'confirmar' ? 'Confirmar el pago' : 'Cancelar la cotización'}?`)) return;
    const endpoint = action === 'delete' ? `/api/admin/cotizaciones/${button.dataset.quoteId}` : `/api/admin/cotizaciones/${button.dataset.quoteId}/${action}`;
    button.disabled = true;
    try { await request(endpoint, { method: action === 'delete' ? 'DELETE' : 'POST' }); const refreshed = await request('/api/admin/cotizaciones'); renderQuotes(refreshed.quotes); } catch (error) { window.alert(error.message); button.disabled = false; }
  }));
}

async function loadDashboard(username) {
  const data = await request('/api/admin/cotizaciones');
document.getElementById('refresh-quotes').addEventListener('click', async () => {
  const button = document.getElementById('refresh-quotes');
  button.disabled = true;
  try { const data = await request('/api/admin/cotizaciones'); renderQuotes(data.quotes); } finally { button.disabled = false; }
});
  authCard.hidden = true;
  dashboard.hidden = false;
  renderQuotes(data.quotes);
  dashboard.querySelector('.eyebrow').textContent = `Sesión: ${username}`;
}

async function initialize() {
  try {
    const status = await request('/api/admin/status');
    if (status.setupRequired) { setSetupMode(true); toggleSetup.hidden = true; }
    else setSetupMode(false);
    const current = await request('/api/admin/me');
    if (current.ok) await loadDashboard(current.username);
  } catch (error) { if (!error.message.includes('Sesión')) authStatus.textContent = error.message; }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authStatus.textContent = '';
  const data = Object.fromEntries(new FormData(authForm));
  try {
    const result = await request(setupMode ? '/api/admin/register' : '/api/admin/login', { method: 'POST', body: JSON.stringify(data) });
    if (setupMode) { setSetupMode(false); authStatus.textContent = 'Administrador creado. Inicia sesión.'; authForm.reset(); return; }
    await loadDashboard(result.username);
  } catch (error) { authStatus.textContent = error.message; }
});

toggleSetup.addEventListener('click', () => setSetupMode(true));
document.getElementById('logout').addEventListener('click', async () => { await request('/api/admin/logout', { method: 'POST' }); window.location.reload(); });
initialize();
