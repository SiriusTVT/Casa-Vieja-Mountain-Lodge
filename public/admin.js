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
const productsElement = document.getElementById('admin-products');
const productsStatus = document.getElementById('products-status');
const productForm = document.getElementById('product-form');
const productFields = {
  id: document.getElementById('product-id'),
  name: document.getElementById('product-name'),
  description: document.getElementById('product-description'),
  image: document.getElementById('product-image'),
  imageFile: document.getElementById('product-image-file'),
  stock: document.getElementById('product-stock'),
  available: document.getElementById('product-available'),
  hasVariants: document.getElementById('product-has-variants')
};
let setupMode = false;

function createVariantRow(variant = {}) {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = '<input class="variant-name" placeholder="Nombre de la variedad" required><input class="variant-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"><input class="variant-image-url" placeholder="Ruta existente opcional"><button type="button" class="danger-button remove-variant" aria-label="Eliminar variedad">×</button>';
  row.querySelector('.variant-name').value = variant.name || '';
  row.querySelector('.variant-image-url').value = variant.image || '';
  row.querySelector('.remove-variant').addEventListener('click', () => row.remove());
  document.getElementById('variant-rows').append(row);
}

function getVariantRows() {
  return [...document.querySelectorAll('.variant-row')];
}

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

function getPaymentLink(token) {
  return `${window.location.origin}/pago.html?token=${encodeURIComponent(token)}`;
}

function resetProductForm() {
  productForm.reset();
  productFields.id.value = '';
  productFields.available.checked = true;
  productFields.hasVariants.checked = false;
  document.getElementById('variant-rows').replaceChildren();
  document.getElementById('variants-editor').hidden = true;
  productForm.hidden = true;
}

function fillProductForm(product) {
  productFields.id.value = product.id;
  productFields.name.value = product.name;
  productFields.description.value = product.description;
  productFields.image.value = product.image;
  productFields.stock.value = product.stock;
  productFields.available.checked = product.available;
  productFields.hasVariants.checked = Boolean(product.variants?.length);
  document.getElementById('variant-rows').replaceChildren();
  product.variants?.forEach((variant) => createVariantRow(variant));
  document.getElementById('variants-editor').hidden = !productFields.hasVariants.checked;
  productForm.hidden = false;
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderProducts(products) {
  productsElement.replaceChildren();
  if (!products.length) { productsElement.innerHTML = '<p>Aún no hay productos.</p>'; return; }
  products.forEach((product) => {
    const article = document.createElement('article');
    article.className = 'admin-product';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    const content = document.createElement('div');
    content.className = 'admin-product-content';
    const title = document.createElement('h3');
    title.textContent = product.name;
    const details = document.createElement('p');
    details.textContent = `Stock: ${product.stock} · ${product.available ? 'Disponible' : 'Oculto'} · ${product.variants?.length || 0} variedades`;
    const actions = document.createElement('div');
    actions.className = 'product-admin-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => fillProductForm(product));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'danger-button';
    remove.textContent = 'Eliminar';
    remove.addEventListener('click', async () => {
      if (!window.confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;
      try {
        await request(`/api/admin/products/${product.id}`, { method: 'DELETE' });
        await loadProducts();
      } catch (error) { productsStatus.textContent = error.message; }
    });
    actions.append(edit, remove);
    content.append(title, details, actions);
    article.append(image, content);
    productsElement.append(article);
  });
}

async function loadProducts() {
  const data = await request('/api/admin/products');
  renderProducts(data.products);
  productsStatus.textContent = `${data.products.length} producto${data.products.length === 1 ? '' : 's'} en el catálogo.`;
}

document.querySelectorAll('[data-admin-tab]').forEach((tab) => tab.addEventListener('click', async () => {
  const currentTab = tab.dataset.adminTab;
  document.querySelectorAll('[data-admin-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
  document.getElementById('quotes-panel').hidden = currentTab !== 'quotes';
  document.getElementById('products-panel').hidden = currentTab !== 'products';
  const cmsPanel = document.getElementById('cms-panel');
  if (cmsPanel) cmsPanel.hidden = currentTab !== 'cms';
  const shell = document.querySelector('.admin-shell');
  if (shell) shell.classList.toggle('cms-mode-active', currentTab === 'cms');

  if (currentTab === 'products') {
    try { await loadProducts(); } catch (error) { productsStatus.textContent = error.message; }
  } else if (currentTab === 'cms') {
    if (window.initCmsEditor) window.initCmsEditor();
  }
}));

document.getElementById('new-product').addEventListener('click', () => {
  resetProductForm();
  productForm.hidden = false;
  productFields.name.focus();
});
document.getElementById('cancel-product').addEventListener('click', resetProductForm);
productFields.hasVariants.addEventListener('change', () => {
  document.getElementById('variants-editor').hidden = !productFields.hasVariants.checked;
  if (productFields.hasVariants.checked && !getVariantRows().length) createVariantRow();
  if (!productFields.hasVariants.checked) document.getElementById('variant-rows').replaceChildren();
});
document.getElementById('add-variant').addEventListener('click', () => createVariantRow());
productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  productsStatus.textContent = '';
  const id = productFields.id.value;
  const button = productForm.querySelector('button[type="submit"]');
  button.disabled = true;
  let image = productFields.image.value.trim();
  try {
    const file = productFields.imageFile.files[0];
    if (file) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
        reader.readAsDataURL(file);
      });
      const uploaded = await request('/api/admin/images', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, data: dataUrl })
      });
      image = uploaded.url;
    }
  } catch (error) {
    productsStatus.textContent = error.message;
    return;
  }
  const variants = [];
  if (productFields.hasVariants.checked) {
    for (const row of getVariantRows()) {
      const name = row.querySelector('.variant-name').value.trim();
      let variantImage = row.querySelector('.variant-image-url').value.trim();
      const file = row.querySelector('.variant-image-file').files[0];
      if (!name) { productsStatus.textContent = 'Cada variedad debe tener un nombre.'; button.disabled = false; return; }
      if (file) {
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer la imagen de una variedad.'));
            reader.readAsDataURL(file);
          });
          const uploaded = await request('/api/admin/images', {
            method: 'POST',
            body: JSON.stringify({ filename: file.name, mimeType: file.type, data: dataUrl })
          });
          variantImage = uploaded.url;
        } catch (error) {
          productsStatus.textContent = error.message;
          button.disabled = false;
          return;
        }
      }
      if (!variantImage) { productsStatus.textContent = `Agrega una imagen para "${name}".`; button.disabled = false; return; }
      variants.push({ name, image: variantImage });
    }
    if (!variants.length) { productsStatus.textContent = 'Agrega al menos una variedad.'; button.disabled = false; return; }
  }
  const payload = {
    name: productFields.name.value,
    description: productFields.description.value,
    image,
    stock: Number(productFields.stock.value),
    available: productFields.available.checked,
    variants
  };
  try {
    await request(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    resetProductForm();
    await loadProducts();
  } catch (error) { productsStatus.textContent = error.message; }
  finally { button.disabled = false; }
});

function renderQuotes(quotes) {
  dashboardMeta.textContent = `${quotes.length} cotización${quotes.length === 1 ? '' : 'es'} registrada${quotes.length === 1 ? '' : 's'}.`;
  quotesElement.replaceChildren();
  if (!quotes.length) { quotesElement.innerHTML = '<p>Aún no hay cotizaciones.</p>'; return; }
  quotes.forEach((quote) => {
    const article = document.createElement('article');
    article.className = 'quote';
    const terminalState = quote.estado === 'confirmado' || quote.estado === 'cancelado';
    const paymentActions = quote.payment?.token ? `<a class="payment-link" href="${getPaymentLink(quote.payment.token)}" target="_blank" rel="noopener">Abrir link</a><button type="button" class="payment-copy-button" data-payment-token="${quote.payment.token}">Copiar link</button>` : '<button type="button" class="payment-link-button" data-quote-id="' + quote.id + '">Generar link de pago</button>';
    const actions = terminalState ? '' : `${paymentActions}<button type="button" class="quote-confirm" data-quote-id="${quote.id}">Confirmar pago</button><button type="button" class="quote-cancel" data-quote-id="${quote.id}">Cancelar</button>`;
    article.innerHTML = `<h2></h2><p><strong>Experiencia:</strong> ${quote.experienciaNombre || quote.experiencia}</p><p><strong>Fechas:</strong> ${quote.llegada} a ${quote.salida || 'No aplica'}</p><p><strong>Huéspedes:</strong> ${quote.huespedes}</p><p><strong>Cotización:</strong> ${quote.cotizacion}</p><p><strong>Contacto:</strong> ${quote.email} · ${quote.telefono}</p><p>${quote.comentarios || ''}</p><small>Estado: ${quote.estado} · Pago: ${quote.payment?.status || 'sin link'} · ${new Date(quote.createdAt).toLocaleString('es-CO')}</small><div class="payment-actions">${actions}<button type="button" class="quote-delete" data-quote-id="${quote.id}">Eliminar</button><span class="payment-link-result" role="status"></span></div>`;
    article.querySelector('h2').textContent = quote.nombre;
    quotesElement.append(article);
  });
  quotesElement.querySelectorAll('.payment-link-button').forEach((button) => button.addEventListener('click', async () => {
    const result = button.parentElement.querySelector('.payment-link-result');
    button.disabled = true; button.textContent = 'Generando...';
    try {
      const data = await request(`/api/admin/cotizaciones/${button.dataset.quoteId}/payment-link`, { method: 'POST' });
      result.replaceChildren();
      const link = document.createElement('a');
      link.href = data.link;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Abrir link de pago';
      result.append(link);
      try { await navigator.clipboard.writeText(data.link); result.title = 'Link copiado al portapapeles'; }
      catch { result.title = data.link; }
      const refreshed = await request('/api/admin/cotizaciones');
      renderQuotes(refreshed.quotes);
    }
    catch (error) { result.textContent = error.message; button.textContent = 'Reintentar'; button.disabled = false; }
  }));
  quotesElement.querySelectorAll('.payment-copy-button').forEach((button) => button.addEventListener('click', async () => {
    const result = button.parentElement.querySelector('.payment-link-result');
    const link = getPaymentLink(button.dataset.paymentToken);
    try { await navigator.clipboard.writeText(link); result.textContent = 'Link copiado'; }
    catch { result.textContent = 'No se pudo copiar automáticamente. Abre el link y cópialo desde el navegador.'; }
  }));
  quotesElement.querySelectorAll('.quote-confirm, .quote-cancel, .quote-delete').forEach((button) => button.addEventListener('click', async () => {
    const action = button.classList.contains('quote-delete') ? 'delete' : button.classList.contains('quote-confirm') ? 'confirmar' : 'cancelar';
    if (!window.confirm(action === 'delete' ? '¿Eliminar definitivamente esta cotización?' : `¿${action === 'confirmar' ? 'Confirmar el pago' : 'Cancelar la cotización'}?`)) return;
    const endpoint = action === 'delete' ? `/api/admin/cotizaciones/${button.dataset.quoteId}` : `/api/admin/cotizaciones/${button.dataset.quoteId}/${action}`;
    button.disabled = true;
    try { await request(endpoint, { method: action === 'delete' ? 'DELETE' : 'POST' }); const refreshed = await request('/api/admin/cotizaciones'); renderQuotes(refreshed.quotes); } catch (error) { window.alert(error.message); button.disabled = false; }
  }));
}

function initReportForm() {
  const yearSelect = document.getElementById('report-year');
  const monthSelect = document.getElementById('report-month');
  const form = document.getElementById('quotes-report-form');
  const statusMsg = document.getElementById('report-status-msg');
  if (!yearSelect || !form) return;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  yearSelect.replaceChildren();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = String(y);
    yearSelect.append(opt);
  }
  monthSelect.value = String(currentMonth);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMsg.textContent = 'Generando resumen...';
    const month = monthSelect.value;
    const year = yearSelect.value;
    const status = document.getElementById('report-status').value;
    const downloadBtn = document.getElementById('download-report-btn');
    downloadBtn.disabled = true;

    try {
      const query = new URLSearchParams({ year, month, status, format: 'csv' });
      const res = await fetch(`/api/admin/cotizaciones/resumen?${query.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo descargar el resumen.');
      }
      const blob = await res.blob();
      const filename = `resumen-cotizaciones-${year}-${String(month).padStart(2, '0')}.csv`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      statusMsg.textContent = `Resumen descargado exitosamente: ${filename}`;
    } catch (err) {
      statusMsg.textContent = err.message;
    } finally {
      downloadBtn.disabled = false;
    }
  });
}

async function loadDashboard(username) {
  initReportForm();
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
