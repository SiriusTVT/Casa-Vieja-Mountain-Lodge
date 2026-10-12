async function fetchProducts() {
  try {
    const res = await fetch('/products.json');
    if (!res.ok) throw new Error('No se pudo cargar la lista de productos');
    return await res.json();
  } catch (err) { console.error(err); return []; }
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const initialImage = variants[0]?.image || product.image || '/Casa-Lodge-Img/imagen_24.jpg';
  const img = document.createElement('img'); img.src = initialImage; img.alt = product.name;
  const h3 = document.createElement('h3'); h3.textContent = product.name;
  const p = document.createElement('p'); p.textContent = product.description;
  const meta = document.createElement('div'); meta.className = 'product-meta';
  const stock = document.createElement('div'); stock.className = 'product-stock';
  stock.textContent = Number.isFinite(product.stock) ? `Stock: ${product.stock}` : (product.available ? 'Disponible' : 'No disponible');
  meta.appendChild(stock);
  if (variants.length > 1) {
    const label = document.createElement('label');
    label.className = 'product-variants-label';
    label.textContent = 'Variedad';
    const select = document.createElement('select');
    select.className = 'product-variants';
    select.setAttribute('aria-label', `Seleccionar variedad de ${product.name}`);
    variants.forEach((variant, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = variant.name;
      select.appendChild(option);
    });
    select.addEventListener('change', () => {
      const selected = variants[Number(select.value)];
      if (!selected) return;
      img.src = selected.image;
      img.alt = `${product.name}: ${selected.name}`;
    });
    label.appendChild(select);
    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta); card.appendChild(label);
  } else {
    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta);
  }
  const actions = document.createElement('div'); actions.className = 'product-actions';
  const btn = document.createElement('a'); btn.className = 'button button-line'; btn.href = product.available ? `#contacto` : '#'; btn.textContent = product.available ? 'Reservar / Consultar' : 'No disponible';
  if (product.available) btn.setAttribute('aria-label', `Reservar ${product.name}`);
  actions.appendChild(btn);
  card.appendChild(actions);
  return card;
}

async function renderCatalogPreview(containerId = 'catalog-preview', limit = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const products = await fetchProducts();
  const available = products.filter(p => p.available);
  const list = (available.length ? available : products).slice(0, limit);
  container.replaceChildren();
  if (!list.length) { container.innerHTML = '<p>No hay productos disponibles por ahora.</p>'; return; }
  const grid = document.createElement('div'); grid.className = 'product-grid';
  list.forEach(p => grid.appendChild(createProductCard(p)));
  container.appendChild(grid);
}

async function renderFullCatalog(containerId = 'catalog-products') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const products = await fetchProducts();
  container.replaceChildren();
  if (!products.length) { container.innerHTML = '<p>No hay productos en el catálogo.</p>'; return; }
  const grid = document.createElement('div'); grid.className = 'product-grid';
  products.forEach(p => grid.appendChild(createProductCard(p)));
  container.appendChild(grid);
}

// Auto-render preview when included in index.html
document.addEventListener('DOMContentLoaded', () => {
  renderCatalogPreview('catalog-preview', 4);
  renderFullCatalog('catalog-products'); // harmless if element missing
});
