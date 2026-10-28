/**
 * Editor Visual del Sitio Web (CMS) - Casa Vieja Mountain Lodge
 * Sistema completo de gestión de contenidos, estilos visuales,
 * administración de secciones, tablas, medios y versiones.
 */

(function () {
  let cmsState = null;
  let historyStack = [];
  let historyIndex = -1;
  let isDirty = false;
  let selectedSectionId = null;
  let activeTab = 'content';
  let previewMode = 'edit'; // 'edit' | 'preview'
  let activeDevice = 'desktop';
  let mediaLibraryCache = null;
  let mediaCallback = null;
  let updatePreviewTimer = null;

  // Helpers
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function uid(prefix = 'sec') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  async function apiRequest(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ocurrió un error en el servidor.');
    return data;
  }

  // History Management (Deshacer / Rehacer)
  function pushHistory(state, label = 'Modificación') {
    if (historyIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push({
      label,
      state: clone(state)
    });
    if (historyStack.length > 50) historyStack.shift();
    historyIndex = historyStack.length - 1;
    setDirty(true);
    updateHistoryButtons();
    schedulePreviewUpdate();
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      cmsState = clone(historyStack[historyIndex].state);
      updateHistoryButtons();
      renderSectionsTree();
      renderInspector();
      updatePreviewNow();
      showToast(`Deshecho: ${historyStack[historyIndex + 1].label}`);
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      cmsState = clone(historyStack[historyIndex].state);
      updateHistoryButtons();
      renderSectionsTree();
      renderInspector();
      updatePreviewNow();
      showToast(`Rehecho: ${historyStack[historyIndex].label}`);
    }
  }

  function updateHistoryButtons() {
    const undoBtn = document.getElementById('cms-undo-btn');
    const redoBtn = document.getElementById('cms-redo-btn');
    const countEl = document.getElementById('cms-history-indicator');
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= historyStack.length - 1;
    if (countEl) countEl.textContent = `${historyIndex + 1}/${historyStack.length}`;
  }

  function setDirty(dirty) {
    isDirty = dirty;
    const badge = document.getElementById('cms-status-badge');
    if (badge) {
      if (dirty) {
        badge.className = 'cms-badge is-dirty';
        badge.textContent = '● Cambios sin guardar';
      } else {
        badge.className = 'cms-badge is-saved';
        badge.textContent = 'Borrador guardado';
      }
    }
  }

  function showToast(msg, isError = false) {
    let toast = document.getElementById('cms-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cms-toast';
      toast.className = 'cms-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? '#7D041D' : '#1e3a2b';
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  // Live Preview Handling
  function schedulePreviewUpdate() {
    clearTimeout(updatePreviewTimer);
    updatePreviewTimer = setTimeout(() => updatePreviewNow(), 280);
  }

  async function updatePreviewNow() {
    const iframe = document.getElementById('cms-preview-iframe');
    const loader = document.getElementById('cms-preview-loading');
    if (!iframe || !cmsState) return;

    // Solo mostrar el loader de pantalla completa si es la primera carga inicial del iframe
    const isInitialLoad = !iframe.srcdoc;
    if (isInitialLoad && loader) loader.hidden = false;

    try {
      const res = await fetch('/api/admin/cms/preview-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: cmsState })
      });
      if (!res.ok) throw new Error('Error al renderizar vista previa.');
      const html = await res.text();

      // Al asignar srcdoc, el navegador refresca el contenido
      iframe.srcdoc = html;

      // Ocultar inmediatamente el cartel invasivo una vez procesado
      if (loader) loader.hidden = true;

      iframe.onload = () => {
        if (loader) loader.hidden = true;
        // Notificar al iframe sobre el modo activo y sección seleccionada
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'cms:set_mode', mode: previewMode }, '*');
          if (selectedSectionId) {
            iframe.contentWindow.postMessage({ type: 'cms:select_section', sectionId: selectedSectionId }, '*');
          }
        }
      };
    } catch (e) {
      if (loader) loader.hidden = true;
      console.error('Error preview update:', e.message);
    }
  }

  // Initialization
  async function initCmsEditor() {
    const container = document.getElementById('cms-panel');
    if (!container) return;

    // Expand admin shell for CMS workspace
    const shell = document.querySelector('.admin-shell');
    if (shell) shell.classList.add('cms-mode-active');

    try {
      showToast('Cargando contenido del sitio web...');
      const data = await apiRequest('/api/admin/cms/content');
      cmsState = data.draft;
      historyStack = [{ label: 'Estado inicial', state: clone(cmsState) }];
      historyIndex = 0;
      setDirty(false);
      updateHistoryButtons();

      if (!selectedSectionId && cmsState.sections?.length) {
        selectedSectionId = cmsState.sections[0].id;
      }

      renderSectionsTree();
      renderInspector();
      updatePreviewNow();
      setupEventListeners();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  // Section List Rendering
  function renderSectionsTree() {
    const tree = document.getElementById('cms-sections-tree');
    const countEl = document.getElementById('cms-sections-count');
    if (!tree || !cmsState) return;

    const sections = cmsState.sections || [];
    if (countEl) countEl.textContent = `${sections.length} secciones`;
    tree.replaceChildren();

    sections.forEach((sec, index) => {
      const item = document.createElement('div');
      item.className = `cms-tree-item ${sec.id === selectedSectionId ? 'is-selected' : ''} ${!sec.visible ? 'is-hidden-sec' : ''}`;
      item.dataset.sectionId = sec.id;

      const typeLabels = {
        hero: 'Portada',
        split: 'Texto + Imagen',
        cards: 'Tarjetas',
        timeline: 'Línea de tiempo',
        feature: 'Destacado',
        catalog_preview: 'Catálogo',
        gallery: 'Galería',
        testimonials: 'Reseñas',
        mountain_showcase: 'Montaña/Video',
        rates: 'Tarifas',
        banner_cta: 'Banner CTA',
        contact: 'Contacto',
        table: 'Tabla',
        rich_text: 'Texto Libre'
      };

      item.innerHTML = `
        <div class="cms-tree-drag" title="Arrastrar o mover">☰</div>
        <div class="cms-tree-info">
          <span class="cms-tree-name">${sec.name || sec.id}</span>
          <span class="cms-tree-type">${typeLabels[sec.type] || sec.type}</span>
        </div>
        <div class="cms-tree-actions">
          <button type="button" class="cms-tree-btn move-up" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="cms-tree-btn move-down" title="Mover abajo" ${index === sections.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="cms-tree-btn toggle-vis" title="${sec.visible ? 'Ocultar sección' : 'Mostrar sección'}">${sec.visible ? '👁' : '🚫'}</button>
          <button type="button" class="cms-tree-btn duplicate" title="Duplicar sección">⧉</button>
          <button type="button" class="cms-tree-btn delete" title="Eliminar sección">✕</button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.cms-tree-actions') || e.target.closest('.cms-tree-drag')) return;
        selectSection(sec.id);
      });

      item.querySelector('.move-up').addEventListener('click', () => moveSection(index, -1));
      item.querySelector('.move-down').addEventListener('click', () => moveSection(index, 1));
      item.querySelector('.toggle-vis').addEventListener('click', () => toggleSectionVisibility(sec.id));
      item.querySelector('.duplicate').addEventListener('click', () => duplicateSection(sec.id));
      item.querySelector('.delete').addEventListener('click', () => deleteSection(sec.id));

      tree.appendChild(item);
    });
  }

  function selectSection(sectionId) {
    selectedSectionId = sectionId;
    renderSectionsTree();
    renderInspector();
    const iframe = document.getElementById('cms-preview-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'cms:select_section', sectionId }, '*');
    }
  }

  function moveSection(index, delta) {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= cmsState.sections.length) return;
    const item = cmsState.sections.splice(index, 1)[0];
    cmsState.sections.splice(newIndex, 0, item);
    pushHistory(cmsState, `Mover sección ${item.name || item.id}`);
    renderSectionsTree();
  }

  function toggleSectionVisibility(sectionId) {
    const sec = cmsState.sections.find(s => s.id === sectionId);
    if (!sec) return;
    sec.visible = !sec.visible;
    pushHistory(cmsState, `${sec.visible ? 'Mostrar' : 'Ocultar'} sección ${sec.name}`);
    renderSectionsTree();
    renderInspector();
  }

  function duplicateSection(sectionId) {
    const index = cmsState.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    const original = cmsState.sections[index];
    const copy = clone(original);
    copy.id = uid(original.type);
    copy.name = `${original.name} (Copia)`;
    cmsState.sections.splice(index + 1, 0, copy);
    selectedSectionId = copy.id;
    pushHistory(cmsState, `Duplicar sección ${original.name}`);
    renderSectionsTree();
    renderInspector();
    showToast(`Sección duplicada: ${copy.name}`);
  }

  function deleteSection(sectionId) {
    const sec = cmsState.sections.find(s => s.id === sectionId);
    if (!sec) return;
    if (!window.confirm(`¿Estás seguro de eliminar la sección "${sec.name}"?\n(Puedes recuperarla usando el botón Deshacer).`)) return;
    cmsState.sections = cmsState.sections.filter(s => s.id !== sectionId);
    if (selectedSectionId === sectionId) {
      selectedSectionId = cmsState.sections[0]?.id || null;
    }
    pushHistory(cmsState, `Eliminar sección ${sec.name}`);
    renderSectionsTree();
    renderInspector();
    showToast(`Sección eliminada: ${sec.name}`);
  }

  // Inspector Panel Rendering
  function renderInspector() {
    const headerTitle = document.getElementById('cms-inspector-title');
    const headerType = document.getElementById('cms-inspector-type');
    const headerId = document.getElementById('cms-inspector-id');
    const body = document.getElementById('cms-inspector-body');
    if (!body || !cmsState) return;

    const sec = cmsState.sections.find(s => s.id === selectedSectionId);
    if (!sec) {
      if (headerTitle) headerTitle.textContent = 'Ninguna sección seleccionada';
      if (headerType) headerType.textContent = 'Inspector';
      if (headerId) headerId.textContent = '';
      body.innerHTML = '<div class="cms-empty-inspector">Selecciona una sección en la columna izquierda o haz clic sobre ella en la vista previa.</div>';
      return;
    }

    if (headerTitle) headerTitle.textContent = sec.name || sec.id;
    if (headerType) headerType.textContent = `Sección (${sec.type})`;
    if (headerId) headerId.textContent = `#${sec.id}`;

    // Subtab active classes
    document.querySelectorAll('.cms-itab').forEach(b => b.classList.toggle('is-active', b.dataset.itab === activeTab));

    body.replaceChildren();

    if (activeTab === 'content') {
      body.appendChild(buildContentTab(sec));
    } else if (activeTab === 'styles') {
      body.appendChild(buildStylesTab(sec));
    } else if (activeTab === 'css') {
      body.appendChild(buildCssTab(sec));
    }
  }

  // Build Inspector Tabs
  function buildContentTab(sec) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-inspector-form';

    // General Section Info
    wrap.appendChild(createInputField('Nombre interno de sección', sec.name, (val) => {
      sec.name = val;
      renderSectionsTree();
      pushHistory(cmsState, 'Renombrar sección');
    }));

    const c = sec.content || (sec.content = {});

    // Common Text Fields
    if ('eyebrow' in c || ['hero', 'split', 'cards', 'timeline', 'feature', 'gallery', 'rates', 'banner_cta', 'contact', 'table', 'rich_text'].includes(sec.type)) {
      wrap.appendChild(createInputField('Eyebrow / Antetítulo', c.eyebrow || '', (v) => { c.eyebrow = v; pushHistory(cmsState, 'Editar antetítulo'); }));
    }

    if (sec.type === 'hero') {
      wrap.appendChild(createInputField('Título (Cursiva)', c.titleEm || '', (v) => { c.titleEm = v; pushHistory(cmsState, 'Editar título'); }));
      wrap.appendChild(createInputField('Subtítulo Portada', c.titleSpan || '', (v) => { c.titleSpan = v; pushHistory(cmsState, 'Editar subtítulo'); }));
      wrap.appendChild(createTextareaField('Bajada / Lead', c.lead || '', (v) => { c.lead = v; pushHistory(cmsState, 'Editar bajada'); }));
      wrap.appendChild(createImagePickerField('Imagen de fondo hero', c.bgImage || '', (url) => { c.bgImage = url; pushHistory(cmsState, 'Cambiar fondo hero'); }));
    } else if (['split', 'cards', 'timeline', 'feature', 'catalog_preview', 'gallery', 'rates', 'banner_cta', 'contact', 'table', 'rich_text'].includes(sec.type)) {
      wrap.appendChild(createInputField('Título principal', c.title || '', (v) => { c.title = v; pushHistory(cmsState, 'Editar título'); }));
    }

    if ('largeCopy' in c) {
      wrap.appendChild(createInputField('Texto destacado / Subtítulo', c.largeCopy || '', (v) => { c.largeCopy = v; pushHistory(cmsState, 'Editar texto destacado'); }));
    }
    if ('lead' in c && sec.type !== 'hero') {
      wrap.appendChild(createTextareaField('Párrafo introductorio', c.lead || '', (v) => { c.lead = v; pushHistory(cmsState, 'Editar párrafo intro'); }));
    }
    if ('body' in c) {
      wrap.appendChild(createTextareaField('Cuerpo de texto', c.body || '', (v) => { c.body = v; pushHistory(cmsState, 'Editar texto'); }));
    }
    if ('description' in c) {
      wrap.appendChild(createTextareaField('Descripción', c.description || '', (v) => { c.description = v; pushHistory(cmsState, 'Editar descripción'); }));
    }

    // Single Image Fields
    if ('image' in c) {
      wrap.appendChild(createImagePickerField('Imagen', c.image || '', (url) => { c.image = url; pushHistory(cmsState, 'Cambiar imagen'); }));
      wrap.appendChild(createInputField('Texto alternativo (Alt)', c.imageAlt || '', (v) => { c.imageAlt = v; pushHistory(cmsState, 'Editar alt'); }));
      if ('caption' in c) {
        wrap.appendChild(createInputField('Pie de foto / Caption', c.caption || '', (v) => { c.caption = v; pushHistory(cmsState, 'Editar caption'); }));
      }
    }

    // Stats
    if ('statNumber' in c) {
      const row = document.createElement('div');
      row.className = 'cms-form-row-2';
      row.appendChild(createInputField('Cifra / Estadística', c.statNumber || '', (v) => { c.statNumber = v; pushHistory(cmsState, 'Editar cifra'); }));
      row.appendChild(createInputField('Etiqueta cifra', c.statLabel || '', (v) => { c.statLabel = v; pushHistory(cmsState, 'Editar etiqueta cifra'); }));
      wrap.appendChild(row);
    }

    // Button / Link
    if ('buttonText' in c) {
      const row = document.createElement('div');
      row.className = 'cms-form-row-2';
      row.appendChild(createInputField('Texto del botón', c.buttonText || '', (v) => { c.buttonText = v; pushHistory(cmsState, 'Editar botón'); }));
      row.appendChild(createInputField('Enlace del botón (URL/#id)', c.buttonUrl || '', (v) => { c.buttonUrl = v; pushHistory(cmsState, 'Editar enlace botón'); }));
      wrap.appendChild(row);
    }

    // Testimonial Specific
    if (sec.type === 'testimonials') {
      wrap.appendChild(createTextareaField('Cita destacada', c.quoteText || '', (v) => { c.quoteText = v; pushHistory(cmsState, 'Editar cita'); }));
      wrap.appendChild(createInputField('Autor de la cita', c.quoteAuthor || '', (v) => { c.quoteAuthor = v; pushHistory(cmsState, 'Editar autor'); }));
      wrap.appendChild(createInputField('Texto llamada a reseña', c.ctaPrompt || '', (v) => { c.ctaPrompt = v; pushHistory(cmsState, 'Editar llamado reseña'); }));
      wrap.appendChild(createInputField('Texto botón reseña', c.ctaButtonText || '', (v) => { c.ctaButtonText = v; pushHistory(cmsState, 'Editar botón reseña'); }));
      wrap.appendChild(createInputField('Enlace botón reseña', c.ctaButtonUrl || '', (v) => { c.ctaButtonUrl = v; pushHistory(cmsState, 'Editar enlace reseña'); }));
    }

    // Mountain Showcase Specific
    if (sec.type === 'mountain_showcase') {
      wrap.appendChild(createImagePickerField('Imagen Principal', c.leadImage || '', (url) => { c.leadImage = url; pushHistory(cmsState, 'Editar imagen principal montaña'); }));
      wrap.appendChild(createImagePickerField('Imagen Secundaria 1', c.subImg1 || '', (url) => { c.subImg1 = url; pushHistory(cmsState, 'Editar imagen secundaria 1'); }));
      wrap.appendChild(createInputField('Pie Imagen Secundaria 1', c.subImg1Caption || '', (v) => { c.subImg1Caption = v; pushHistory(cmsState, 'Editar pie foto 1'); }));
      wrap.appendChild(createInputField('Ruta de Video (MP4)', c.subVideo || '', (v) => { c.subVideo = v; pushHistory(cmsState, 'Editar video'); }));
      wrap.appendChild(createImagePickerField('Poster de Video', c.subVideoPoster || '', (url) => { c.subVideoPoster = url; pushHistory(cmsState, 'Editar poster video'); }));
      wrap.appendChild(createInputField('Pie de Video', c.subVideoCaption || '', (v) => { c.subVideoCaption = v; pushHistory(cmsState, 'Editar pie video'); }));
    }

    // Table Editor (Requirement 4)
    if (sec.type === 'table') {
      wrap.appendChild(buildTableEditor(sec));
    }

    // Cards Editor
    if (sec.type === 'cards') {
      wrap.appendChild(buildCardsEditor(sec));
    }

    // Gallery Items Editor
    if (sec.type === 'gallery') {
      wrap.appendChild(buildGalleryEditor(sec));
    }

    // Timeline Steps Editor
    if (sec.type === 'timeline') {
      wrap.appendChild(buildTimelineEditor(sec));
    }

    // Rates Editor
    if (sec.type === 'rates') {
      wrap.appendChild(buildRatesEditor(sec));
      wrap.appendChild(createTextareaField('Letra pequeña / Condiciones', c.finePrint || '', (v) => { c.finePrint = v; pushHistory(cmsState, 'Editar letra pequeña'); }));
    }

    // Rich Text Editor
    if (sec.type === 'rich_text') {
      wrap.appendChild(createTextareaField('Contenido HTML / Texto enriquecido', c.contentHtml || c.body || '', (v) => { c.contentHtml = v; pushHistory(cmsState, 'Editar contenido libre'); }, 8));
    }

    return wrap;
  }

  // TABLE COMPONENT BUILDER (Requirement 4: Inserción y edición de tablas)
  function buildTableEditor(sec) {
    const c = sec.content;
    if (!c.headers) c.headers = ['Columna 1', 'Columna 2', 'Columna 3'];
    if (!c.rows) c.rows = [['Dato 1', 'Dato 2', 'Dato 3']];

    const block = document.createElement('div');
    block.className = 'cms-block-editor';
    block.innerHTML = `
      <div class="cms-block-header">
        <h4>Editor de Tabla</h4>
        <div class="cms-block-tools">
          <button type="button" class="cms-secondary-sm-btn" id="add-table-col">+ Columna</button>
          <button type="button" class="cms-secondary-sm-btn" id="add-table-row">+ Fila</button>
        </div>
      </div>
      <div class="cms-table-options">
        <label><input type="checkbox" id="table-opt-striped" ${c.striped !== false ? 'checked' : ''}> Filas alternadas (Zebra)</label>
        <label><input type="checkbox" id="table-opt-bordered" ${c.bordered !== false ? 'checked' : ''}> Bordes visibles</label>
        <label>Modo móvil:
          <select id="table-opt-responsive">
            <option value="scroll" ${c.responsiveMode === 'scroll' ? 'selected' : ''}>Desplazamiento horizontal (Scroll)</option>
            <option value="stacked" ${c.responsiveMode === 'stacked' ? 'selected' : ''}>Tarjetas apiladas (Stacked)</option>
          </select>
        </label>
      </div>
      <div class="cms-table-edit-container">
        <table class="cms-editable-grid">
          <thead>
            <tr id="table-headers-row"></tr>
          </thead>
          <tbody id="table-rows-body"></tbody>
        </table>
      </div>
    `;

    // Render Table Headers
    const renderHeaders = () => {
      const hRow = block.querySelector('#table-headers-row');
      hRow.replaceChildren();
      c.headers.forEach((h, colIdx) => {
        const th = document.createElement('th');
        th.innerHTML = `
          <div class="cms-grid-cell-hdr">
            <input type="text" value="${h}" placeholder="Título col...">
            ${c.headers.length > 1 ? `<button type="button" class="del-col-btn" title="Eliminar columna">×</button>` : ''}
          </div>
        `;
        const inp = th.querySelector('input');
        inp.addEventListener('input', (e) => {
          c.headers[colIdx] = e.target.value;
          schedulePreviewUpdate();
        });
        inp.addEventListener('change', () => pushHistory(cmsState, 'Editar encabezado tabla'));

        const delBtn = th.querySelector('.del-col-btn');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            c.headers.splice(colIdx, 1);
            c.rows.forEach(r => r.splice(colIdx, 1));
            pushHistory(cmsState, 'Eliminar columna tabla');
            renderHeaders();
            renderRows();
          });
        }
        hRow.appendChild(th);
      });
      const thAction = document.createElement('th');
      thAction.style.width = '40px';
      hRow.appendChild(thAction);
    };

    // Render Table Rows
    const renderRows = () => {
      const tbody = block.querySelector('#table-rows-body');
      tbody.replaceChildren();
      c.rows.forEach((row, rowIdx) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIdx) => {
          const td = document.createElement('td');
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.value = cell;
          inp.addEventListener('input', (e) => {
            c.rows[rowIdx][colIdx] = e.target.value;
            schedulePreviewUpdate();
          });
          inp.addEventListener('change', () => pushHistory(cmsState, 'Editar celda tabla'));
          td.appendChild(inp);
          tr.appendChild(td);
        });

        // Delete Row Action
        const tdAction = document.createElement('td');
        if (c.rows.length > 1) {
          const delRowBtn = document.createElement('button');
          delRowBtn.type = 'button';
          delRowBtn.className = 'del-row-btn';
          delRowBtn.textContent = '×';
          delRowBtn.title = 'Eliminar fila';
          delRowBtn.addEventListener('click', () => {
            c.rows.splice(rowIdx, 1);
            pushHistory(cmsState, 'Eliminar fila tabla');
            renderRows();
          });
          tdAction.appendChild(delRowBtn);
        }
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
      });
    };

    renderHeaders();
    renderRows();

    // Add Column Button
    block.querySelector('#add-table-col').addEventListener('click', () => {
      const colNum = c.headers.length + 1;
      c.headers.push(`Columna ${colNum}`);
      c.rows.forEach(r => r.push(`Dato ${colNum}`));
      pushHistory(cmsState, 'Agregar columna a tabla');
      renderHeaders();
      renderRows();
    });

    // Add Row Button
    block.querySelector('#add-table-row').addEventListener('click', () => {
      const newRow = c.headers.map((_, i) => `Nuevo dato ${i + 1}`);
      c.rows.push(newRow);
      pushHistory(cmsState, 'Agregar fila a tabla');
      renderRows();
    });

    // Options Listeners
    block.querySelector('#table-opt-striped').addEventListener('change', (e) => {
      c.striped = e.target.checked;
      pushHistory(cmsState, 'Cambiar estilo filas tabla');
    });
    block.querySelector('#table-opt-bordered').addEventListener('change', (e) => {
      c.bordered = e.target.checked;
      pushHistory(cmsState, 'Cambiar bordes tabla');
    });
    block.querySelector('#table-opt-responsive').addEventListener('change', (e) => {
      c.responsiveMode = e.target.value;
      pushHistory(cmsState, 'Cambiar modo móvil tabla');
    });

    return block;
  }

  // Cards List Editor
  function buildCardsEditor(sec) {
    const c = sec.content;
    if (!c.cards) c.cards = [];
    const block = document.createElement('div');
    block.className = 'cms-block-editor';
    block.innerHTML = `
      <div class="cms-block-header">
        <h4>Tarjetas / Items (${c.cards.length})</h4>
        <button type="button" class="cms-secondary-sm-btn" id="add-card-btn">+ Agregar Tarjeta</button>
      </div>
      <div class="cms-items-list" id="cards-list"></div>
    `;

    const renderCards = () => {
      const list = block.querySelector('#cards-list');
      list.replaceChildren();
      c.cards.forEach((card, idx) => {
        const item = document.createElement('div');
        item.className = 'cms-item-card';
        item.innerHTML = `
          <div class="cms-item-card-header">
            <strong>Tarjeta #${idx + 1}: ${card.title || 'Sin título'}</strong>
            <button type="button" class="cms-item-del-btn" title="Eliminar tarjeta">✕</button>
          </div>
          <div class="cms-item-card-fields"></div>
        `;
        const fields = item.querySelector('.cms-item-card-fields');
        fields.appendChild(createInputField('Número/Índice', card.number || `0${idx + 1}`, (v) => { card.number = v; pushHistory(cmsState, 'Editar número tarjeta'); }));
        fields.appendChild(createInputField('Título', card.title || '', (v) => { card.title = v; pushHistory(cmsState, 'Editar título tarjeta'); }));
        fields.appendChild(createTextareaField('Descripción', card.description || '', (v) => { card.description = v; pushHistory(cmsState, 'Editar descripción tarjeta'); }));
        fields.appendChild(createImagePickerField('Imagen', card.image || '', (url) => { card.image = url; pushHistory(cmsState, 'Cambiar imagen tarjeta'); }));
        fields.appendChild(createInputField('Enlace (URL/#id)', card.linkUrl || '', (v) => { card.linkUrl = v; pushHistory(cmsState, 'Editar enlace tarjeta'); }));

        item.querySelector('.cms-item-del-btn').addEventListener('click', () => {
          c.cards.splice(idx, 1);
          pushHistory(cmsState, 'Eliminar tarjeta');
          renderCards();
        });
        list.appendChild(item);
      });
    };

    block.querySelector('#add-card-btn').addEventListener('click', () => {
      c.cards.push({
        number: `0${c.cards.length + 1}`,
        title: 'Nueva Experiencia',
        description: 'Describe este elemento o servicio disponible para los visitantes.',
        image: 'Casa-Lodge-Img/imagen_01.jpg',
        linkUrl: '#contacto'
      });
      pushHistory(cmsState, 'Agregar nueva tarjeta');
      renderCards();
    });

    renderCards();
    return block;
  }

  // Gallery Editor
  function buildGalleryEditor(sec) {
    const c = sec.content;
    if (!c.items) c.items = [];
    const block = document.createElement('div');
    block.className = 'cms-block-editor';
    block.innerHTML = `
      <div class="cms-block-header">
        <h4>Fotografías en Galería (${c.items.length})</h4>
        <button type="button" class="cms-secondary-sm-btn" id="add-gallery-item-btn">+ Agregar Foto</button>
      </div>
      <div class="cms-items-list" id="gallery-list"></div>
    `;

    const renderGallery = () => {
      const list = block.querySelector('#gallery-list');
      list.replaceChildren();
      c.items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'cms-item-card';
        card.innerHTML = `
          <div class="cms-item-card-header">
            <strong>Foto #${idx + 1}: ${item.caption || item.image}</strong>
            <button type="button" class="cms-item-del-btn" title="Eliminar foto">✕</button>
          </div>
          <div class="cms-item-card-fields"></div>
        `;
        const fields = card.querySelector('.cms-item-card-fields');
        fields.appendChild(createImagePickerField('Imagen', item.image || '', (url) => { item.image = url; pushHistory(cmsState, 'Cambiar foto galería'); }));
        fields.appendChild(createInputField('Pie de foto / Caption', item.caption || '', (v) => { item.caption = v; pushHistory(cmsState, 'Editar caption galería'); }));
        fields.appendChild(createInputField('Texto alternativo (Alt)', item.alt || '', (v) => { item.alt = v; pushHistory(cmsState, 'Editar alt galería'); }));

        // Grid span layout
        const spanLabel = document.createElement('label');
        spanLabel.className = 'cms-form-label';
        spanLabel.innerHTML = `<span>Tamaño en cuadrícula</span>
          <select class="cms-form-select">
            <option value="gallery-small" ${item.span === 'gallery-small' ? 'selected' : ''}>Pequeño (1x1)</option>
            <option value="gallery-large" ${item.span === 'gallery-large' ? 'selected' : ''}>Grande (2x2)</option>
            <option value="gallery-tall" ${item.span === 'gallery-tall' ? 'selected' : ''}>Alto / Vertical (1x3)</option>
            <option value="gallery-wide" ${item.span === 'gallery-wide' ? 'selected' : ''}>Ancho / Panorámico (2x1)</option>
            <option value="gallery-wide gallery-wide-last" ${item.span?.includes('gallery-wide-last') ? 'selected' : ''}>Panorámico Final</option>
          </select>`;
        spanLabel.querySelector('select').addEventListener('change', (e) => {
          item.span = e.target.value;
          pushHistory(cmsState, 'Cambiar tamaño foto');
        });
        fields.appendChild(spanLabel);

        card.querySelector('.cms-item-del-btn').addEventListener('click', () => {
          c.items.splice(idx, 1);
          pushHistory(cmsState, 'Eliminar foto de galería');
          renderGallery();
        });
        list.appendChild(card);
      });
    };

    block.querySelector('#add-gallery-item-btn').addEventListener('click', () => {
      c.items.push({
        image: 'Casa-Lodge-Img/imagen_11.jpg',
        caption: 'Nueva imagen',
        alt: 'Fotografía en Casa Vieja',
        span: 'gallery-small'
      });
      pushHistory(cmsState, 'Agregar foto a galería');
      renderGallery();
    });

    renderGallery();
    return block;
  }

  // Timeline Editor
  function buildTimelineEditor(sec) {
    const c = sec.content;
    if (!c.steps) c.steps = [];
    const block = document.createElement('div');
    block.className = 'cms-block-editor';
    block.innerHTML = `
      <div class="cms-block-header">
        <h4>Pasos de la Línea de Tiempo (${c.steps.length})</h4>
        <button type="button" class="cms-secondary-sm-btn" id="add-step-btn">+ Agregar Paso</button>
      </div>
      <div class="cms-items-list" id="steps-list"></div>
    `;

    const renderSteps = () => {
      const list = block.querySelector('#steps-list');
      list.replaceChildren();
      c.steps.forEach((step, idx) => {
        const card = document.createElement('div');
        card.className = 'cms-item-card';
        card.innerHTML = `
          <div class="cms-item-card-header">
            <strong>Paso ${step.number || idx + 1}: ${step.title}</strong>
            <button type="button" class="cms-item-del-btn" title="Eliminar paso">✕</button>
          </div>
          <div class="cms-item-card-fields"></div>
        `;
        const fields = card.querySelector('.cms-item-card-fields');
        fields.appendChild(createInputField('Número / Momento', step.number || `0${idx + 1}`, (v) => { step.number = v; pushHistory(cmsState, 'Editar número paso'); }));
        fields.appendChild(createInputField('Título', step.title || '', (v) => { step.title = v; pushHistory(cmsState, 'Editar título paso'); }));
        fields.appendChild(createTextareaField('Descripción', step.description || '', (v) => { step.description = v; pushHistory(cmsState, 'Editar descripción paso'); }));

        card.querySelector('.cms-item-del-btn').addEventListener('click', () => {
          c.steps.splice(idx, 1);
          pushHistory(cmsState, 'Eliminar paso');
          renderSteps();
        });
        list.appendChild(card);
      });
    };

    block.querySelector('#add-step-btn').addEventListener('click', () => {
      c.steps.push({
        number: `0${c.steps.length + 1}`,
        title: 'Nuevo momento',
        description: 'Describe lo que ocurre en este horario o etapa.'
      });
      pushHistory(cmsState, 'Agregar paso a línea de tiempo');
      renderSteps();
    });

    renderSteps();
    return block;
  }

  // Rates Editor
  function buildRatesEditor(sec) {
    const c = sec.content;
    if (!c.rates) c.rates = [];
    const block = document.createElement('div');
    block.className = 'cms-block-editor';
    block.innerHTML = `
      <div class="cms-block-header">
        <h4>Tarjetas de Precios (${c.rates.length})</h4>
        <button type="button" class="cms-secondary-sm-btn" id="add-rate-btn">+ Agregar Tarifa</button>
      </div>
      <div class="cms-items-list" id="rates-list"></div>
    `;

    const renderRates = () => {
      const list = block.querySelector('#rates-list');
      list.replaceChildren();
      c.rates.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'cms-item-card';
        card.innerHTML = `
          <div class="cms-item-card-header">
            <strong>Tarifa: ${r.value}</strong>
            <button type="button" class="cms-item-del-btn" title="Eliminar tarifa">✕</button>
          </div>
          <div class="cms-item-card-fields"></div>
        `;
        const fields = card.querySelector('.cms-item-card-fields');
        fields.appendChild(createInputField('Precio / Valor', r.value || '', (v) => { r.value = v; pushHistory(cmsState, 'Editar valor tarifa'); }));
        fields.appendChild(createInputField('Etiqueta / Concepto', r.label || '', (v) => { r.label = v; pushHistory(cmsState, 'Editar etiqueta tarifa'); }));

        card.querySelector('.cms-item-del-btn').addEventListener('click', () => {
          c.rates.splice(idx, 1);
          pushHistory(cmsState, 'Eliminar tarifa');
          renderRates();
        });
        list.appendChild(card);
      });
    };

    block.querySelector('#add-rate-btn').addEventListener('click', () => {
      c.rates.push({ value: '$100.000', label: 'Nuevo servicio · persona' });
      pushHistory(cmsState, 'Agregar tarifa');
      renderRates();
    });

    renderRates();
    return block;
  }

  // Build Styles Tab (Requirement 2)
  function buildStylesTab(sec) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-inspector-form';
    const s = sec.styles || (sec.styles = {});

    // Colors
    const colorsHeader = document.createElement('h4');
    colorsHeader.className = 'cms-form-section-title';
    colorsHeader.textContent = 'Colores de la Sección';
    wrap.appendChild(colorsHeader);

    wrap.appendChild(createColorPickerField('Color de Fondo', s.backgroundColor || '', (c) => {
      s.backgroundColor = c;
      pushHistory(cmsState, 'Cambiar color de fondo');
    }));

    wrap.appendChild(createColorPickerField('Color de Texto', s.textColor || '', (c) => {
      s.textColor = c;
      pushHistory(cmsState, 'Cambiar color de texto');
    }));

    // Spacing
    const spaceHeader = document.createElement('h4');
    spaceHeader.className = 'cms-form-section-title';
    spaceHeader.textContent = 'Espaciado (Padding)';
    wrap.appendChild(spaceHeader);

    const padRow = document.createElement('div');
    padRow.className = 'cms-form-row-2';
    padRow.appendChild(createInputField('Espacio Superior', s.paddingTop || '', (v) => { s.paddingTop = v; pushHistory(cmsState, 'Editar padding superior'); }, 'ej. 80px'));
    padRow.appendChild(createInputField('Espacio Inferior', s.paddingBottom || '', (v) => { s.paddingBottom = v; pushHistory(cmsState, 'Editar padding inferior'); }, 'ej. 80px'));
    wrap.appendChild(padRow);

    // Layout toggles
    if (sec.type === 'split') {
      const layoutHeader = document.createElement('h4');
      layoutHeader.className = 'cms-form-section-title';
      layoutHeader.textContent = 'Distribución Visual';
      wrap.appendChild(layoutHeader);

      const revLabel = document.createElement('label');
      revLabel.className = 'cms-checkbox-label';
      revLabel.innerHTML = `<input type="checkbox" ${sec.content.reverse ? 'checked' : ''}> Invertir orden (Imagen a la izquierda, texto a la derecha)`;
      revLabel.querySelector('input').addEventListener('change', (e) => {
        sec.content.reverse = e.target.checked;
        pushHistory(cmsState, 'Invertir orden de columnas');
      });
      wrap.appendChild(revLabel);

      const darkLabel = document.createElement('label');
      darkLabel.className = 'cms-checkbox-label';
      darkLabel.innerHTML = `<input type="checkbox" ${sec.content.darkBand ? 'checked' : ''}> Aplicar estilo banda oscura (Dark Band)`;
      darkLabel.querySelector('input').addEventListener('change', (e) => {
        sec.content.darkBand = e.target.checked;
        pushHistory(cmsState, 'Cambiar banda oscura');
      });
      wrap.appendChild(darkLabel);
    }

    return wrap;
  }

  // Build Scoped CSS Tab
  function buildCssTab(sec) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-inspector-form';
    const s = sec.styles || (sec.styles = {});

    const desc = document.createElement('p');
    desc.className = 'cms-field-hint';
    desc.textContent = `Escribe reglas CSS personalizadas. Se aplicarán de forma aislada a #${sec.id} para no afectar al resto del sitio.`;
    wrap.appendChild(desc);

    const ta = document.createElement('textarea');
    ta.className = 'cms-code-editor';
    ta.rows = 14;
    ta.placeholder = `/* Ejemplo de CSS para #${sec.id} */\n#${sec.id} h2 {\n  letter-spacing: 0.1em;\n}\n#${sec.id} .button {\n  border-radius: 20px;\n}`;
    ta.value = s.customCss || '';
    ta.addEventListener('input', (e) => {
      s.customCss = e.target.value;
      schedulePreviewUpdate();
    });
    ta.addEventListener('change', () => pushHistory(cmsState, `CSS para ${sec.name}`));
    wrap.appendChild(ta);

    const btnRow = document.createElement('div');
    btnRow.style.marginTop = '10px';
    const valBtn = document.createElement('button');
    valBtn.type = 'button';
    valBtn.className = 'cms-secondary-sm-btn';
    valBtn.textContent = 'Validar sintaxis CSS';
    valBtn.addEventListener('click', () => {
      const res = validateCssString(ta.value);
      if (res.ok) showToast('✓ Sintaxis CSS correcta');
      else showToast(res.error, true);
    });
    btnRow.appendChild(valBtn);
    wrap.appendChild(btnRow);

    return wrap;
  }

  function validateCssString(css) {
    if (!css) return { ok: true };
    let depth = 0;
    for (const ch of css) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth < 0) return { ok: false, error: 'Llave de cierre "}" inesperada en el CSS.' };
    }
    if (depth !== 0) return { ok: false, error: 'Hay llaves "{" sin cerrar en el CSS.' };
    if (/<script|expression\(|javascript:/i.test(css)) {
      return { ok: false, error: 'El CSS contiene expresiones no permitidas.' };
    }
    return { ok: true };
  }

  // Field Generator Helpers
  function createInputField(label, value, onChange, placeholder = '') {
    const wrap = document.createElement('label');
    wrap.className = 'cms-form-label';
    wrap.innerHTML = `<span>${label}</span><input type="text" class="cms-form-input" value="${escapeHtml(value)}" placeholder="${placeholder}">`;
    const inp = wrap.querySelector('input');
    inp.addEventListener('input', (e) => {
      onChange(e.target.value);
      schedulePreviewUpdate();
    });
    return wrap;
  }

  function createTextareaField(label, value, onChange, rows = 3) {
    const wrap = document.createElement('label');
    wrap.className = 'cms-form-label';
    wrap.innerHTML = `<span>${label}</span><textarea class="cms-form-textarea" rows="${rows}">${escapeHtml(value)}</textarea>`;
    const ta = wrap.querySelector('textarea');
    ta.addEventListener('input', (e) => {
      onChange(e.target.value);
      schedulePreviewUpdate();
    });
    return wrap;
  }

  function createColorPickerField(label, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-form-label';
    wrap.innerHTML = `
      <span>${label}</span>
      <div class="cms-color-picker-row">
        <input type="color" class="cms-color-box" value="${value && value.startsWith('#') && value.length === 7 ? value : '#ffffff'}">
        <input type="text" class="cms-form-input cms-color-text" value="${escapeHtml(value)}" placeholder="ej. #86041D o rgba(...)">
        ${value ? `<button type="button" class="cms-clear-btn" title="Limpiar color">×</button>` : ''}
      </div>
    `;
    const box = wrap.querySelector('.cms-color-box');
    const txt = wrap.querySelector('.cms-color-text');
    const clr = wrap.querySelector('.cms-clear-btn');

    box.addEventListener('input', (e) => {
      txt.value = e.target.value;
      onChange(e.target.value);
    });
    txt.addEventListener('input', (e) => {
      onChange(e.target.value);
      if (e.target.value.startsWith('#') && e.target.value.length === 7) box.value = e.target.value;
    });
    if (clr) {
      clr.addEventListener('click', () => {
        txt.value = '';
        onChange('');
      });
    }
    return wrap;
  }

  function createImagePickerField(label, currentUrl, onSelect) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-form-label';
    wrap.innerHTML = `
      <span>${label}</span>
      <div class="cms-image-picker-row">
        <div class="cms-image-preview-thumb">
          ${currentUrl ? `<img src="${currentUrl}" alt="Vista previa">` : `<span class="cms-no-thumb">Sin foto</span>`}
        </div>
        <div class="cms-image-picker-controls">
          <input type="text" class="cms-form-input cms-image-url-input" value="${escapeHtml(currentUrl)}" placeholder="Ruta o URL de imagen">
          <div class="cms-image-btn-group">
            <button type="button" class="cms-secondary-sm-btn open-media-lib">📂 Galería de medios</button>
            ${currentUrl ? `<button type="button" class="cms-secondary-sm-btn clear-img">Quitar</button>` : ''}
          </div>
        </div>
      </div>
    `;

    const inp = wrap.querySelector('.cms-image-url-input');
    const thumb = wrap.querySelector('.cms-image-preview-thumb');
    inp.addEventListener('input', (e) => {
      onSelect(e.target.value);
      thumb.innerHTML = e.target.value ? `<img src="${e.target.value}">` : `<span class="cms-no-thumb">Sin foto</span>`;
    });

    wrap.querySelector('.open-media-lib').addEventListener('click', () => {
      openMediaLibrary((url) => {
        inp.value = url;
        thumb.innerHTML = `<img src="${url}">`;
        onSelect(url);
      });
    });

    const clearBtn = wrap.querySelector('.clear-img');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inp.value = '';
        thumb.innerHTML = `<span class="cms-no-thumb">Sin foto</span>`;
        onSelect('');
      });
    }

    return wrap;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
  }

  // Media Library Modal (Requirement 8)
  async function openMediaLibrary(callback) {
    mediaCallback = callback;
    const modal = document.getElementById('cms-modal-media');
    if (!modal) return;
    modal.hidden = false;

    if (!mediaLibraryCache) {
      try {
        const data = await apiRequest('/api/admin/cms/media');
        mediaLibraryCache = data.media || [];
      } catch (err) {
        showToast('Error cargando medios: ' + err.message, true);
        mediaLibraryCache = [];
      }
    }
    renderMediaGrid(mediaLibraryCache);
  }

  function renderMediaGrid(items) {
    const grid = document.getElementById('cms-media-grid');
    if (!grid) return;
    grid.replaceChildren();

    if (!items.length) {
      grid.innerHTML = '<p class="cms-empty-media">No hay imágenes disponibles.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'cms-media-card';
      card.innerHTML = `
        <div class="cms-media-card-img">
          ${item.type === 'video' ? `<video src="${item.url}" muted></video>` : `<img src="${item.url}" alt="${item.name}" loading="lazy">`}
        </div>
        <span class="cms-media-card-name" title="${item.name}">${item.name}</span>
      `;
      card.addEventListener('click', () => {
        if (mediaCallback) mediaCallback(item.url);
        closeModal('cms-modal-media');
      });
      grid.appendChild(card);
    });
  }

  // Add Section Modal (Requirement 3)
  function openAddSectionModal() {
    const modal = document.getElementById('cms-modal-add-section');
    if (modal) modal.hidden = false;
  }

  function handleCreateSection(type) {
    const templates = {
      split: {
        name: 'Texto con Imagen',
        type: 'split',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Nueva Sección',
          eyebrowDark: true,
          title: 'Título de la experiencia o servicio',
          largeCopy: 'Subtítulo destacado para la sección',
          body: 'Escribe aquí la descripción detallada del lugar, actividad o beneficio que ofrece Casa Vieja Mountain Lodge.',
          buttonText: 'Conocer más',
          buttonUrl: '#contacto',
          image: 'Casa-Lodge-Img/imagen_11.jpg',
          imageAlt: 'Experiencia en la naturaleza',
          caption: 'Momento en Casa Vieja',
          reverse: false,
          darkBand: false
        }
      },
      table: {
        name: 'Tabla de Información / Tarifas',
        type: 'table',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Información Detallada',
          eyebrowDark: true,
          title: 'Tarifas y Horarios',
          description: 'Consulta los servicios disponibles y sus condiciones.',
          headers: ['Servicio', 'Incluye', 'Horario', 'Tarifa'],
          rows: [
            ['Pasadía Común', 'Acceso a senderos, río y chorrera', '9:00 AM - 5:00 PM', '$35.000 / persona'],
            ['Alojamiento Casona', 'Habitación térmica con baño amplio', 'Check-in 1:00 PM', 'Desde $130.000 / noche'],
            ['Fotografía de Aves', 'Guía por el Parque de las Aves', '6:00 AM - 10:00 AM', '$35.000 / persona']
          ],
          striped: true,
          bordered: true,
          responsiveMode: 'scroll'
        }
      },
      cards: {
        name: 'Cuadrícula de Tarjetas',
        type: 'cards',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Nuestras Actividades',
          eyebrowDark: false,
          title: 'Momentos inolvidables en la montaña',
          darkBand: false,
          cards: [
            { number: '01', title: 'Avistamiento de aves', description: 'Más de 141 especies registradas en el piedemonte.', image: 'Casa-Lodge-Img/imagen_22.jpg', linkUrl: '#contacto' },
            { number: '02', title: 'Baño de bosque', description: 'Senderos nativos junto al riachuelo Vilela.', image: 'Casa-Lodge-Img/imagen_13.jpg', linkUrl: '#contacto' },
            { number: '03', title: 'Descanso histórico', description: 'Habitaciones en casona de 1890 restaurada.', image: 'Casa-Lodge-Img/imagen_05.jpg', linkUrl: '#contacto' }
          ]
        }
      },
      gallery: {
        name: 'Galería de Fotos',
        type: 'gallery',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Galería Visual',
          eyebrowDark: true,
          title: 'La belleza en cada rincón',
          items: [
            { image: 'Casa-Lodge-Img/imagen_24.jpg', caption: 'Vista aérea', span: 'gallery-large' },
            { image: 'Casa-Lodge-Img/imagen_32.jpg', caption: 'Corredores', span: 'gallery-tall' },
            { image: 'Casa-Lodge-Img/rio_vilela_cristalino.jpg', caption: 'Río Vilela', span: 'gallery-tall' },
            { image: 'Casa-Lodge-Img/sendero_escalones.jpg', caption: 'Sendero nativo', span: 'gallery-large' }
          ]
        }
      },
      banner_cta: {
        name: 'Banner de Llamado a la Acción',
        type: 'banner_cta',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Reserva tu espacio',
          title: 'Vive una desconexión real en la montaña',
          buttonText: 'Contactar por WhatsApp',
          buttonUrl: 'https://wa.me/573104190444'
        }
      },
      rich_text: {
        name: 'Bloque de Texto Enriquecido',
        type: 'rich_text',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Comunicado',
          eyebrowDark: true,
          title: 'Información Importante para Visitantes',
          contentHtml: '<p>Te recomendamos traer calzado cómodo para caminar en senderos, abrigo ligero para las noches frescas y cámara para registrar las aves que nos visitan.</p><h3>Recomendaciones</h3><ul><li>Respetar la fauna y flora del bosque nativo.</li><li>No arrojar basuras en el río ni en los caminos.</li><li>Disfrutar del silencio y la calma de la naturaleza.</li></ul>',
          buttonText: 'Conocer más detalles',
          buttonUrl: '#contacto'
        }
      },
      timeline: {
        name: 'Línea de Tiempo',
        type: 'timeline',
        visible: true,
        styles: { backgroundColor: '', textColor: '', customCss: '' },
        content: {
          eyebrow: 'Tu Itinerario',
          eyebrowDark: true,
          title: 'Cómo disfrutar tu día',
          image: 'Casa-Lodge-Img/imagen_31.jpg',
          steps: [
            { number: '01', title: 'Llegada y bienvenida', description: 'Recepción en la casona con café de la finca.' },
            { number: '02', title: 'Caminata y río', description: 'Paseo por el sendero nativo hasta el río Vilela.' },
            { number: '03', title: 'Almuerzo tradicional', description: 'Gastronomía local al aire libre.' }
          ]
        }
      }
    };

    const template = templates[type] || templates.split;
    const newSec = clone(template);
    newSec.id = uid(type);
    cmsState.sections.push(newSec);
    selectedSectionId = newSec.id;
    pushHistory(cmsState, `Crear sección ${newSec.name}`);
    closeModal('cms-modal-add-section');
    renderSectionsTree();
    renderInspector();
    showToast(`Sección creada: ${newSec.name}`);
  }

  // Global Styles & CSS Modal
  function openGlobalStylesModal() {
    const modal = document.getElementById('cms-modal-global');
    if (!modal || !cmsState) return;
    const g = cmsState.globalStyles || {};

    document.getElementById('glob-heading-color').value = g.headingColor || '#4A0A17';
    document.getElementById('glob-body-color').value = g.bodyColor || '#3A2E2B';
    document.getElementById('glob-accent-dark').value = g.accentDark || '#86041D';
    document.getElementById('glob-accent-light').value = g.accentLight || '#F4E6C3';
    document.getElementById('glob-bg-light').value = g.bgLight || '#f6f1e8';
    document.getElementById('glob-bg-dark').value = g.bgDark || '#7D041D';
    document.getElementById('glob-font-family').value = g.fontFamily || "Georgia, 'Times New Roman', serif";
    document.getElementById('glob-custom-css').value = g.customCss || '';

    modal.hidden = false;
  }

  function saveGlobalStyles() {
    if (!cmsState) return;
    const g = cmsState.globalStyles || (cmsState.globalStyles = {});
    g.headingColor = document.getElementById('glob-heading-color').value;
    g.bodyColor = document.getElementById('glob-body-color').value;
    g.accentDark = document.getElementById('glob-accent-dark').value;
    g.accentLight = document.getElementById('glob-accent-light').value;
    g.bgLight = document.getElementById('glob-bg-light').value;
    g.bgDark = document.getElementById('glob-bg-dark').value;
    g.fontFamily = document.getElementById('glob-font-family').value;
    g.customCss = document.getElementById('glob-custom-css').value;

    pushHistory(cmsState, 'Modificar estilos globales');
    closeModal('cms-modal-global');
    showToast('Estilos globales aplicados.');
  }

  // Versions History Modal (Requirement 6)
  async function openVersionsModal() {
    const modal = document.getElementById('cms-modal-versions');
    const list = document.getElementById('cms-versions-list');
    if (!modal || !list) return;
    modal.hidden = false;
    list.innerHTML = '<p class="cms-loading-p">Cargando versiones anteriores...</p>';

    try {
      const data = await apiRequest('/api/admin/cms/versions');
      list.replaceChildren();
      if (!data.versions?.length) {
        list.innerHTML = '<p class="cms-empty-versions">Aún no hay versiones publicadas archivadas.</p>';
        return;
      }

      data.versions.forEach(v => {
        const item = document.createElement('div');
        item.className = 'cms-version-item';
        const d = new Date(v.publishedAt);
        item.innerHTML = `
          <div class="cms-version-info">
            <strong>Versión ${v.version || ''} (${v.sectionsCount || 0} secciones)</strong>
            <span>Publicado: ${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO')} por ${v.publishedBy || 'admin'}</span>
            <small>${v.note || 'Sin nota'}</small>
          </div>
          <button type="button" class="cms-secondary-sm-btn restore-v-btn">Restaurar versión</button>
        `;
        item.querySelector('.restore-v-btn').addEventListener('click', async () => {
          if (!window.confirm(`¿Restaurar la Versión ${v.version} publicada el ${d.toLocaleDateString('es-CO')}?\nEsto actualizará el sitio actual.`)) return;
          try {
            showToast('Restaurando versión...');
            const res = await apiRequest(`/api/admin/cms/versions/${v.versionId}/restore`, { method: 'POST' });
            cmsState = res.data;
            historyStack = [{ label: `Restaurada v${v.version}`, state: clone(cmsState) }];
            historyIndex = 0;
            setDirty(false);
            updateHistoryButtons();
            renderSectionsTree();
            renderInspector();
            updatePreviewNow();
            closeModal('cms-modal-versions');
            showToast(`Versión restaurada y publicada con éxito.`);
          } catch (e) {
            showToast(e.message, true);
          }
        });
        list.appendChild(item);
      });
    } catch (err) {
      list.innerHTML = `<p class="cms-error-p">${err.message}</p>`;
    }
  }

  // Save Draft, Publish, Discard
  async function saveDraft() {
    if (!cmsState) return;
    const btn = document.getElementById('cms-save-draft-btn');
    if (btn) btn.disabled = true;
    try {
      showToast('Guardando borrador...');
      await apiRequest('/api/admin/cms/draft', {
        method: 'POST',
        body: JSON.stringify({ draft: cmsState })
      });
      setDirty(false);
      showToast('✓ Borrador guardado exitosamente.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function publishChanges() {
    if (!cmsState) return;
    const note = window.prompt('Escribe una breve descripción para esta publicación (opcional):', 'Actualización de contenidos');
    if (note === null) return;

    const btn = document.getElementById('cms-publish-btn');
    if (btn) btn.disabled = true;
    try {
      showToast('Publicando cambios en la página principal...');
      const res = await apiRequest('/api/admin/cms/publish', {
        method: 'POST',
        body: JSON.stringify({ data: cmsState, note })
      });
      setDirty(false);
      showToast(`✓ ¡Sitio web publicado con éxito! (Versión ${res.version})`);
      updatePreviewNow();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function discardChanges() {
    if (!window.confirm('¿Descartar todos los cambios sin guardar y volver a la versión publicada actualmente?')) return;
    try {
      showToast('Descartando cambios...');
      const res = await apiRequest('/api/admin/cms/discard', { method: 'POST' });
      cmsState = res.draft;
      historyStack = [{ label: 'Versión descartada / restaurada', state: clone(cmsState) }];
      historyIndex = 0;
      setDirty(false);
      updateHistoryButtons();
      renderSectionsTree();
      renderInspector();
      updatePreviewNow();
      showToast('Cambios descartados.');
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.hidden = true;
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // History
    document.getElementById('cms-undo-btn')?.addEventListener('click', undo);
    document.getElementById('cms-redo-btn')?.addEventListener('click', redo);

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    });

    // Device Switcher
    document.querySelectorAll('.cms-device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cms-device-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeDevice = btn.dataset.device;
        const wrap = document.getElementById('cms-viewport-wrap');
        const resText = document.getElementById('cms-viewport-res');
        if (wrap) wrap.dataset.viewport = activeDevice;
        if (resText) {
          const map = { desktop: '100% · Escritorio', tablet: '768px · Tableta', mobile: '375px · Móvil' };
          resText.textContent = map[activeDevice] || activeDevice;
        }
      });
    });

    // Mode Switcher (Edit vs Preview)
    document.getElementById('cms-mode-edit')?.addEventListener('click', () => {
      previewMode = 'edit';
      document.getElementById('cms-mode-edit').classList.add('is-active');
      document.getElementById('cms-mode-preview').classList.remove('is-active');
      const iframe = document.getElementById('cms-preview-iframe');
      if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'cms:set_mode', mode: 'edit' }, '*');
    });

    document.getElementById('cms-mode-preview')?.addEventListener('click', () => {
      previewMode = 'preview';
      document.getElementById('cms-mode-preview').classList.add('is-active');
      document.getElementById('cms-mode-edit').classList.remove('is-active');
      const iframe = document.getElementById('cms-preview-iframe');
      if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'cms:set_mode', mode: 'preview' }, '*');
    });

    // Inspector Subtabs
    document.querySelectorAll('.cms-itab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.itab;
        renderInspector();
      });
    });

    // Topbar Actions
    document.getElementById('cms-add-section-btn')?.addEventListener('click', openAddSectionModal);
    document.getElementById('cms-save-draft-btn')?.addEventListener('click', saveDraft);
    document.getElementById('cms-publish-btn')?.addEventListener('click', publishChanges);
    document.getElementById('cms-discard-btn')?.addEventListener('click', discardChanges);
    document.getElementById('cms-open-global-styles')?.addEventListener('click', openGlobalStylesModal);
    document.getElementById('cms-open-versions')?.addEventListener('click', openVersionsModal);

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    // Modal Add Section Template Cards
    document.querySelectorAll('.cms-template-card').forEach(card => {
      card.addEventListener('click', () => handleCreateSection(card.dataset.templateType));
    });

    // Global Styles Save
    document.getElementById('cms-save-global-btn')?.addEventListener('click', saveGlobalStyles);

    // Media Upload
    const fileInp = document.getElementById('cms-media-file-input');
    if (fileInp) {
      fileInp.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast('Subiendo archivo multimedia...');
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result;
            const res = await apiRequest('/api/admin/images', {
              method: 'POST',
              body: JSON.stringify({ filename: file.name, mimeType: file.type, data: dataUrl })
            });
            showToast('Imagen subida con éxito.');
            mediaLibraryCache = null; // Invalidate cache
            if (mediaCallback) mediaCallback(res.url);
            closeModal('cms-modal-media');
          };
          reader.readAsDataURL(file);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    // Media URL Submit
    document.getElementById('cms-media-url-submit')?.addEventListener('click', () => {
      const url = document.getElementById('cms-media-url-input').value.trim();
      if (!url) return;
      if (mediaCallback) mediaCallback(url);
      closeModal('cms-modal-media');
    });

    // Warning before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar en el editor web.';
      }
    });

    // Listen for postMessage from the live preview iframe
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;
      if (msg.type === 'cms:section_selected' && msg.sectionId) {
        selectSection(msg.sectionId);
      }
    });
  }

  // Expose to window for admin tab controller
  window.initCmsEditor = initCmsEditor;
})();

