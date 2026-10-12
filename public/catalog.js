async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('No se pudo cargar la lista de productos');
    return await res.json();
  } catch (err) { console.error(err); return []; }
}

function getProductImage(product, variantIndex = 0) {
  return product.variants?.[variantIndex]?.image || product.image || '/Casa-Lodge-Img/imagen_24.jpg';
}

function openProductDetail(product) {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  const image = modal.querySelector('.product-detail-image');
  const title = modal.querySelector('.product-detail-title');
  const description = modal.querySelector('.product-detail-description');
  const stock = modal.querySelector('.product-detail-stock');
  const variants = modal.querySelector('.product-detail-variants');
  const productVariants = Array.isArray(product.variants) ? product.variants : [];
  let selectedIndex = 0;

  title.textContent = product.name;
  description.textContent = product.description;
  stock.textContent = `Stock disponible: ${product.stock}`;
  image.src = getProductImage(product);
  image.alt = product.name;
  variants.replaceChildren();
  if (productVariants.length > 1) {
    const heading = document.createElement('p');
    heading.className = 'product-detail-variants-heading';
    heading.textContent = 'Elige una variedad';
    variants.appendChild(heading);
    productVariants.forEach((variant, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `variant-button${index === 0 ? ' is-selected' : ''}`;
      button.setAttribute('aria-label', variant.name);
      const thumbnail = document.createElement('img');
      thumbnail.src = variant.image;
      thumbnail.alt = '';
      const name = document.createElement('span');
      name.textContent = variant.name;
      button.append(thumbnail, name);
      button.addEventListener('click', () => {
        selectedIndex = index;
        image.src = variant.image;
        image.alt = `${product.name}: ${variant.name}`;
        variants.querySelectorAll('.variant-button').forEach((item, itemIndex) => {
          item.classList.toggle('is-selected', itemIndex === selectedIndex);
        });
      });
      variants.appendChild(button);
    });
  }
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.product-modal-close').focus();
}

function createProductModal() {
  if (document.getElementById('product-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.className = 'product-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'product-detail-title');
  modal.innerHTML = `
    <div class="product-modal-backdrop" data-close-product-modal></div>
    <div class="product-modal-content">
      <button class="product-modal-close" type="button" aria-label="Cerrar detalle del producto">×</button>
      <div class="product-detail">
        <div class="product-detail-media"><img class="product-detail-image" src="" alt=""></div>
        <div class="product-detail-copy">
          <p class="eyebrow eyebrow-dark">Producto artesanal</p>
          <h2 class="product-detail-title" id="product-detail-title"></h2>
          <p class="product-detail-description"></p>
          <p class="product-detail-stock"></p>
          <div class="product-detail-variants"></div>
          <a class="button button-dark" href="/#contacto">Consultar disponibilidad</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  };
  modal.querySelector('.product-modal-close').addEventListener('click', close);
  modal.querySelector('[data-close-product-modal]').addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) close();
  });
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  const initialImage = getProductImage(product);
  const img = document.createElement('img'); img.src = initialImage; img.alt = product.name;
  const h3 = document.createElement('h3'); h3.textContent = product.name;
  const p = document.createElement('p'); p.textContent = product.description;
  const meta = document.createElement('div'); meta.className = 'product-meta';
  const stock = document.createElement('div'); stock.className = 'product-stock';
  stock.textContent = Number.isFinite(product.stock) ? `Stock: ${product.stock}` : (product.available ? 'Disponible' : 'No disponible');
  meta.appendChild(stock);
  card.append(img, h3, p, meta);
  card.setAttribute('role', 'button');
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Ver detalles de ${product.name}`);
  card.addEventListener('click', () => openProductDetail(product));
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openProductDetail(product);
  });
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
  createProductModal();
  renderCatalogPreview('catalog-preview', 4);
  renderFullCatalog('catalog-products'); // harmless if element missing
});
