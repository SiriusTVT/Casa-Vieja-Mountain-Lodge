const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, 'data');
const DRAFT_FILE = path.join(DATA_DIR, 'cms_draft.json');
const PUBLISHED_FILE = path.join(DATA_DIR, 'cms_published.json');
const VERSIONS_FILE = path.join(DATA_DIR, 'cms_versions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
}

function getDefaultCmsData() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'sistema',
    globalStyles: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      headingColor: "#4A0A17",
      bodyColor: "#3A2E2B",
      accentDark: "#86041D",
      accentLight: "#F4E6C3",
      bgLight: "#f6f1e8",
      bgDark: "#7D041D",
      customCss: ""
    },
    header: {
      brandName: "Casa Vieja",
      brandSub: "Mountain Lodge",
      brandLogo: "Casa-Lodge-Img/imagen_30.jpg",
      menuLinks: [
        { label: "Experiencia", url: "#experiencia" },
        { label: "Habitaciones", url: "#habitaciones" },
        { label: "Naturaleza", url: "#naturaleza" },
        { label: "Bienestar", url: "#bienestar" },
        { label: "Galería", url: "#galeria" },
        { label: "Contacto", url: "#contacto" }
      ],
      catalogBtn: { label: "Catálogo", url: "/catalogo" },
      ctaBtn: { label: "Cotizar", url: "#contacto" }
    },
    sections: [
      {
        id: "inicio",
        name: "Encabezado y Portada",
        type: "hero",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "La Buitrera · Palmira · Valle del Cauca",
          titleEm: "Casa Vieja",
          titleSpan: "Mountain Lodge",
          lead: "Un refugio entre la montaña, la historia y la naturaleza.",
          bgImage: "Casa-Lodge-Img/fondo-principal.jpg",
          buttons: [
            { text: "Ver catálogo", url: "/catalogo", style: "button-light" },
            { text: "Descubrir Casa Vieja", url: "#experiencia", style: "button-line" },
            { text: "Cotizar", url: "#contacto", style: "button-line" },
            { text: "Reseñas", url: "#testimonios", style: "button-line" }
          ]
        }
      },
      {
        id: "experiencia",
        name: "Introducción a la Experiencia",
        type: "split",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Una casa para vivir despacio",
          eyebrowDark: true,
          title: "No vienes solamente a dormir.",
          lead: "Vienes a despertar con canto de aves, caminar entre bosque nativo, escuchar el agua y recuperar el tiempo.",
          body: "Casa Vieja es una casa antigua de madera, construida en 1890, en el piedemonte de la Cordillera Central colombiana. Un lugar donde la historia familiar, la naturaleza viva y el bienestar se encuentran sin prisa.",
          buttonText: "Conocer nuestra historia",
          buttonUrl: "#historia",
          buttonStyle: "text-link",
          image: "Casa-Lodge-Img/imagen_06.jpg",
          imageAlt: "Fachada de Casa Vieja Mountain Lodge entre jardines",
          caption: "Una casa histórica rodeada de naturaleza.",
          reverse: false,
          darkBand: false
        }
      },
      {
        id: "vive",
        name: "Vive Casa Vieja (Tarjetas)",
        type: "cards",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Vive Casa Vieja",
          eyebrowDark: false,
          title: "Tres formas de volver a ti.",
          darkBand: true,
          cards: [
            {
              number: "01",
              title: "Descansar",
              description: "Habitaciones amplias, frescas y térmicas dentro de una casa con más de un siglo de historia.",
              image: "Casa-Lodge-Img/imagen_05.jpg",
              imageAlt: "Habitación con cama de hierro y mobiliario tradicional",
              linkUrl: "#habitaciones",
              linkAria: "Ver habitaciones"
            },
            {
              number: "02",
              title: "Explorar",
              description: "Senderos, río Vilela, chorrera al aire libre y un Parque de las Aves con 141 especies clasificadas.",
              image: "Casa-Lodge-Img/imagen_22.jpg",
              imageAlt: "Fotografía de aves en el Parque de las Aves",
              linkUrl: "#naturaleza",
              linkAria: "Explorar la naturaleza"
            },
            {
              number: "03",
              title: "Conectar",
              description: "Terapias de bienestar y biodescodificación para desconectarte del ruido y volver a escuchar.",
              image: "Casa-Lodge-Img/imagen_13.jpg",
              imageAlt: "Terapia de bosque en un sendero",
              linkUrl: "#bienestar",
              linkAria: "Ver bienestar"
            }
          ]
        }
      },
      {
        id: "dia",
        name: "Un día en Casa Vieja",
        type: "timeline",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Un día en Casa Vieja",
          eyebrowDark: true,
          title: "El tiempo cambia de ritmo.",
          image: "Casa-Lodge-Img/imagen_31.jpg",
          imageAlt: "Desayuno al aire libre en el Parque de las Aves",
          steps: [
            { number: "01", title: "Mañana", description: "Despertar con el canto de las aves y compartir un desayuno al aire libre." },
            { number: "02", title: "Mediodía", description: "Recorrer el sendero, observar el bosque y acercarse al riachuelo Vilela." },
            { number: "03", title: "Tarde", description: "Regresar a la casa, disfrutar sus corredores y dejar que el agua acompañe la pausa." },
            { number: "04", title: "Noche", description: "Desconectar del ruido, del celular y del afán." }
          ]
        }
      },
      {
        id: "historia",
        name: "Historia desde 1890",
        type: "split",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Desde 1890",
          eyebrowDark: true,
          title: "Una historia que sigue viva.",
          largeCopy: "El carácter de otra época se encuentra con las comodidades de hoy.",
          body: "La madera, los corredores, los jardines y la araucaria cuentan una historia familiar que continúa en cada visita. Aquí la arquitectura no es decoración: es parte de la experiencia.",
          statNumber: "1890",
          statLabel: "Casa histórica",
          image: "Casa-Lodge-Img/imagen_17.jpg",
          imageAlt: "Casa Vieja Mountain Lodge al atardecer",
          reverse: true,
          darkBand: false
        }
      },
      {
        id: "habitaciones",
        name: "Habitaciones y Refugio",
        type: "feature",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Tu refugio en la montaña",
          eyebrowDark: true,
          title: "Descanso amplio, fresco y con historia.",
          description: "Las cuatro habitaciones conservan el carácter de la casa de madera. Son amplias, cómodas y térmicas; no requieren aire acondicionado.",
          kicker: "Habitaciones · Casa Vieja",
          featureTitle: "Una pausa hecha de madera y silencio.",
          featureText: "Los baños se encuentran fuera de las habitaciones, son amplios y cuentan con ducha y agua caliente. La casa también tiene una cocina amplia y bien dotada para compartir.",
          image: "Casa-Lodge-Img/imagen_38.jpg",
          imageAlt: "Habitación con detalles de la casa histórica",
          buttonText: "Consultar disponibilidad",
          buttonUrl: "#contacto"
        }
      },
      {
        id: "catalogo",
        name: "Catálogo de Experiencias",
        type: "catalog_preview",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Descubre",
          eyebrowDark: true,
          title: "Catálogo de servicios y experiencias",
          lead: "Explora los productos y servicios disponibles: alojamiento, pasadías, terapias y servicios adicionales. Abre el catálogo completo para ver toda la oferta y detalles.",
          buttonText: "Ver catálogo completo",
          buttonUrl: "/catalogo"
        }
      },
      {
        id: "chorrera",
        name: "La Chorrera al aire libre",
        type: "split",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Agua viva y descanso",
          eyebrowDark: false,
          title: "La Chorrera al aire libre.",
          largeCopy: "Un rincón de frescura natural para renovar el cuerpo y la mente.",
          body: "Disfruta de nuestra chorrera de piedra con agua pura de montaña, su alberca natural y las asoleadoras rodeadas de jardines. El lugar ideal para refrescarse bajo el sol, descansar en calma y contemplar la tranquilidad de Casa Vieja.",
          buttonText: "Disfrutar la experiencia",
          buttonUrl: "#contacto",
          buttonStyle: "button-light",
          image: "Casa-Lodge-Img/Chorrera_al_aire_libre.jpg",
          imageAlt: "Chorrera al aire libre con piscina de piedra y asoleadoras",
          reverse: false,
          darkBand: true
        }
      },
      {
        id: "bienestar",
        name: "Bienestar y Biodescodificación",
        type: "split",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Bienestar",
          eyebrowDark: true,
          title: "Detenerse también es viajar.",
          largeCopy: "Terapias para volver a escuchar.",
          body: "Vive terapias de bienestar y biodescodificación en contacto con la naturaleza. Pregunta por la terapia del Perdón y consulta las opciones disponibles.",
          buttonText: "Cotizar bienestar",
          buttonUrl: "#contacto",
          buttonStyle: "button-dark",
          buttonDataRate: "6",
          image: "Casa-Lodge-Img/imagen_28.jpg",
          imageAlt: "Grupo realizando terapia de bienestar en el jardín",
          reverse: true,
          darkBand: false
        }
      },
      {
        id: "galeria",
        name: "Revista de viajes (Galería)",
        type: "gallery",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "La casa, el agua, el bosque",
          eyebrowDark: true,
          title: "Una revista de viajes hecha lugar.",
          items: [
            { image: "Casa-Lodge-Img/imagen_24.jpg", alt: "Vista aérea de Casa Vieja Mountain Lodge y el Bosque del Tachuelo", caption: "La casa y el Bosque del Tachuelo", span: "gallery-large" },
            { image: "Casa-Lodge-Img/imagen_32.jpg", alt: "Corredor con paisaje montañoso", caption: "Corredores para mirar lejos", span: "gallery-tall" },
            { image: "Casa-Lodge-Img/imagen_11.jpg", alt: "Visitante disfrutando del baño en el riachuelo Vilela", caption: "El río Vilela", span: "gallery-wide" },
            { image: "Casa-Lodge-Img/imagen_34.jpg", alt: "Tangara real fotografiada en Casa Vieja Mountain Lodge", caption: "Colores del Parque de las Aves", span: "gallery-small" },
            { image: "Casa-Lodge-Img/imagen_16.jpg", alt: "Sala con salida al jardín", caption: "Memoria familiar", span: "gallery-small" },
            { image: "Casa-Lodge-Img/rio_vilela_cristalino.jpg", alt: "Aguas cristalinas y piedras en el río Vilela", caption: "Aguas cristalinas del Vilela", span: "gallery-tall" },
            { image: "Casa-Lodge-Img/sendero_escalones.jpg", alt: "Caminante bajando por el sendero escalonado hacia la naturaleza", caption: "Sendero hacia Rio Vilela", span: "gallery-large" },
            { image: "Casa-Lodge-Img/imagen_09.jpg", alt: "Fachada, jardín y canal de agua", caption: "Arquitectura que respira", span: "gallery-wide gallery-wide-last" }
          ]
        }
      },
      {
        id: "testimonios",
        name: "Opiniones y Emociones",
        type: "testimonials",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Opiniones reales",
          title: "Emociones que despierta Casa Vieja Mountain Lodge",
          subtitle: "Calificación de 4,9 sobre 5 en Google Maps, con 57 reseñas.",
          quoteText: "“Casa Vieja es toda una experiencia por su hermosa casa antigua y su comodidad. El canto del agua que rueda por sus acequias hace de la noche un lugar como muy pocos.”",
          quoteAuthor: "Daniel Carvajal · Google Maps",
          ctaPrompt: "Cuéntanos lo que sentiste, viviste y te llevas de la montaña",
          ctaButtonText: "Escribir reseña en Google Maps ↗",
          ctaButtonUrl: "https://maps.app.goo.gl/bDiwkEhY4tszvpRS9?g_st=im"
        }
      },
      {
        id: "naturaleza",
        name: "Bosque nativo del Tachuelo",
        type: "split",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Bosque nativo",
          eyebrowDark: true,
          title: "El bosque como escenario.",
          largeCopy: "Bosque del Tachuelo",
          body: "Un sendero entre bosque nativo tropical lleva al río Vilela, un riachuelo de aguas transparentes donde puedes bañarte y reconectar con la calma profunda de la naturaleza.",
          buttonText: "Conocer el sendero",
          buttonUrl: "#contacto",
          buttonStyle: "button-dark",
          image: "Casa-Lodge-Img/Bosque_del_Tachuelo.jpg",
          imageAlt: "Bosque del Tachuelo",
          caption: "Bosque del Tachuelo",
          reverse: false,
          darkBand: false
        }
      },
      {
        id: "montana",
        name: "La montaña y Parque de las Aves",
        type: "mountain_showcase",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Parque de las Aves · Fotografía",
          eyebrowDark: true,
          title: "La montaña también se cuenta en imágenes.",
          largeCopy: "141 especies clasificadas para mirar hacia arriba.",
          body: "Explora el Parque de las Aves y sus registros reales de biodiversidad en el piedemonte de la Cordillera Central colombiana. Un refugio vivo para contemplar, fotografiar y aprender sin afán.",
          statNumber: "141",
          statLabel: "Especies de aves",
          instagramUrl: "https://www.instagram.com/p/DdJzsotTAsb/",
          ebirdUrl: "https://ebird.org/hotspot/L26128114",
          leadImage: "Casa-Lodge-Img/Montana_principal.jpg",
          leadImageAlt: "Vista panorámica desde la montaña hacia el valle",
          subImg1: "Casa-Lodge-Img/Sendero_avistamiento.jpg",
          subImg1Alt: "Caminata y avistamiento de aves en el sendero del bosque nativo",
          subImg1Caption: "Sendero y avistamiento",
          subVideo: "Casa-Lodge-Img/Especie.mp4",
          subVideoPoster: "Casa-Lodge-Img/Flora_montana_niebla.jpg",
          subVideoCaption: "Especie en libertad"
        }
      },
      {
        id: "tarifas",
        name: "Tarifas de Referencia",
        type: "rates",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Tarifas reales",
          eyebrowDark: true,
          title: "Elige cómo vivir la experiencia.",
          subtitle: "Precios de referencia para hospedaje, pasadía, fotografía, bienestar y alimentación.",
          rates: [
            { value: "$130.000", label: "Habitación sencilla · noche" },
            { value: "$200.000", label: "Dos huéspedes · noche" },
            { value: "$35.000", label: "Pasadía común (visita) · persona" }
          ],
          buttonText: "Ver opciones y cotizar",
          buttonUrl: "#contacto",
          finePrint: "Pasadía común: $35.000 por persona solo visita a la finca (acceso a río Vilela, chorrera y senderos). Adicionales de alimentación disponibles para cualquier servicio: Desayuno $18.000 · Almuerzo $38.000 · Refrigerio $10.000 por persona. Todas las tarifas incluyen parqueadero e internet de alta velocidad Starlink gratis. Check-in: 1:00 p. m. · Check-out: 11:00 a. m."
        }
      },
      {
        id: "cotiza",
        name: "Llamado a la acción final",
        type: "banner_cta",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Tu próxima pausa",
          title: "Tu próxima historia comienza en la montaña.",
          buttonText: "Cotizar estadía",
          buttonUrl: "#contacto"
        }
      },
      {
        id: "contacto",
        name: "Contacto y Planificación",
        type: "contact",
        visible: true,
        styles: { backgroundColor: "", textColor: "", customCss: "" },
        content: {
          eyebrow: "Planifica tu visita",
          eyebrowDark: true,
          title: "Hablemos de tu próxima pausa.",
          description: "Déjanos tu nombre y contacto y te enviaremos una propuesta hecha a tu medida.",
          address: "Km 1 Vía La Ruiza, Buitrera Palmira, Valle del Cauca",
          mapsEmbedUrl: "https://www.google.com/maps?q=Casa+Vieja+Mountain+Lodge,+La+Buitrera,+Palmira,+Valle+del+Cauca&output=embed",
          mapsUrl: "https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=Casa+Vieja+Mountain+Lodge%2C+La+Buitrera%2C+Palmira%2C+Valle+del+Cauca",
          wazeUrl: "https://waze.com/ul/hd29g9zzgz"
        }
      }
    ],
    footer: {
      brand: "Casa Vieja Mountain Lodge",
      sub: "Historia · Aves · Bienestar · RNT 169434",
      socialLinks: [
        { label: "Instagram", url: "https://www.instagram.com/casaviejamountainlodge/" },
        { label: "Facebook", url: "https://www.facebook.com/share/1FsY9ZUbM3/?mibextid=wwXIfr" },
        { label: "TikTok", url: "https://www.tiktok.com/@casa.vieja.mounta/video/7622376167043091732" }
      ]
    }
  };
}

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  // Strip potentially malicious scripts / inline handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '#');
}

function validateCss(css) {
  if (typeof css !== 'string') return '';
  // Check for balanced braces
  let depth = 0;
  for (const ch of css) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) return { ok: false, error: 'Llave de cierre "}" inesperada en el CSS.' };
  }
  if (depth !== 0) return { ok: false, error: 'Hay llaves "{" sin cerrar en el CSS.' };
  // Block script or expression injection
  if (/<script|expression\(|javascript:/i.test(css)) {
    return { ok: false, error: 'El CSS contiene expresiones no permitidas.' };
  }
  return { ok: true };
}

function renderSectionHtml(section, isPreview = false) {
  if (!section.visible && !isPreview) return '';
  const hiddenAttr = (!section.visible && isPreview) ? ' style="opacity:0.4; filter:grayscale(0.8);"' : '';
  const previewAttrs = isPreview ? ` data-cms-section-id="${sanitizeText(section.id)}" data-cms-section-type="${sanitizeText(section.type)}"${hiddenAttr}` : '';
  const c = section.content || {};

  switch (section.type) {
    case 'hero':
      return `
        <div class="hero-media" aria-hidden="true" style="${c.bgImage ? `background-image:url('${sanitizeText(c.bgImage)}');` : ''}"></div>
        <div class="hero-content"${previewAttrs}>
          <p class="eyebrow" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
          <h1><em data-cms-bind="titleEm">${sanitizeText(c.titleEm || '')}</em><span data-cms-bind="titleSpan">${sanitizeText(c.titleSpan || '')}</span></h1>
          <p class="hero-lead" data-cms-bind="lead">${sanitizeText(c.lead || '')}</p>
          <div class="hero-actions">
            ${(c.buttons || []).map(b => `<a class="button ${sanitizeText(b.style || 'button-line')}" href="${sanitizeText(b.url || '#')}">${sanitizeText(b.text || '')}</a>`).join('')}
          </div>
        </div>
      `;

    case 'split': {
      const isDark = Boolean(c.darkBand);
      const isReverse = Boolean(c.reverse);
      const sectionClass = `${isDark ? 'nature-section dark-band' : 'history-section'} split-section`;
      const copyClass = `split-copy reveal ${c.eyebrowDark ? 'eyebrow-dark-wrap' : ''}`;
      const eyebrowClass = `eyebrow ${c.eyebrowDark ? 'eyebrow-dark' : ''}`;
      const imgClass = `split-image reveal reveal-delay`;

      const copyHtml = `
        <div class="${copyClass}">
          ${c.eyebrow ? `<p class="${eyebrowClass}" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow)}</p>` : ''}
          <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
          ${c.largeCopy ? `<p class="large-copy" data-cms-bind="largeCopy">${sanitizeText(c.largeCopy)}</p>` : ''}
          ${c.lead ? `<p class="intro-lead" data-cms-bind="lead">${sanitizeText(c.lead)}</p>` : ''}
          ${c.body ? `<p data-cms-bind="body">${sanitizeText(c.body)}</p>` : ''}
          ${c.statNumber ? `<div class="stat-line"><strong>${sanitizeText(c.statNumber)}</strong><span>${sanitizeText(c.statLabel || '')}</span></div>` : ''}
          ${c.buttonText ? `<a class="${c.buttonStyle === 'button-light' ? 'button button-light' : c.buttonStyle === 'text-link' ? 'text-link' : 'button button-dark'}" href="${sanitizeText(c.buttonUrl || '#')}" ${c.buttonDataRate ? `data-rate="${sanitizeText(c.buttonDataRate)}"` : ''}>${sanitizeText(c.buttonText)} ${c.buttonStyle === 'text-link' ? '<span>↗</span>' : ''}</a>` : ''}
        </div>
      `;

      const imgHtml = `
        <div class="${imgClass}">
          ${c.image ? `<img src="${sanitizeText(c.image)}" alt="${sanitizeText(c.imageAlt || '')}" loading="lazy">` : ''}
          ${c.caption ? `<figcaption>${sanitizeText(c.caption)}</figcaption>` : ''}
        </div>
      `;

      return `
        <section class="${sectionClass} section" id="${sanitizeText(section.id)}"${previewAttrs}>
          ${isReverse ? imgHtml + copyHtml : copyHtml + imgHtml}
        </section>
      `;
    }

    case 'cards':
      return `
        <section class="living section ${c.darkBand ? 'dark-band' : ''}" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow ${c.eyebrowDark ? 'eyebrow-dark' : ''}" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
          </div>
          <div class="experience-list">
            ${(c.cards || []).map((card, idx) => `
              <article class="experience-item ${idx === 1 ? 'experience-item-offset' : ''} reveal">
                <div class="experience-number">${sanitizeText(card.number || `0${idx + 1}`)}</div>
                <div class="experience-image"><img src="${sanitizeText(card.image || '')}" alt="${sanitizeText(card.imageAlt || '')}" loading="lazy"></div>
                <div class="experience-copy">
                  <h3>${sanitizeText(card.title || '')}</h3>
                  <p>${sanitizeText(card.description || '')}</p>
                  <a href="${sanitizeText(card.linkUrl || '#')}" class="arrow-link" aria-label="${sanitizeText(card.linkAria || 'Ver más')}">↗</a>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      `;

    case 'timeline':
      return `
        <section class="day-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
          </div>
          <div class="day-story">
            <div class="day-image reveal"><img src="${sanitizeText(c.image || '')}" alt="${sanitizeText(c.imageAlt || '')}" loading="lazy"></div>
            <ol class="day-timeline reveal reveal-delay">
              ${(c.steps || []).map((step, idx) => `
                <li>
                  <span>${sanitizeText(step.number || `0${idx + 1}`)}</span>
                  <div>
                    <strong>${sanitizeText(step.title || '')}</strong>
                    <p>${sanitizeText(step.description || '')}</p>
                  </div>
                </li>
              `).join('')}
            </ol>
          </div>
        </section>
      `;

    case 'feature':
      return `
        <section class="rooms-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            ${c.description ? `<p data-cms-bind="description">${sanitizeText(c.description)}</p>` : ''}
          </div>
          <div class="room-feature reveal">
            <div class="room-image"><img src="${sanitizeText(c.image || '')}" alt="${sanitizeText(c.imageAlt || '')}" loading="lazy"></div>
            <div class="room-copy">
              <p class="room-kicker">${sanitizeText(c.kicker || '')}</p>
              <h3>${sanitizeText(c.featureTitle || '')}</h3>
              <p>${sanitizeText(c.featureText || '')}</p>
              ${c.buttonText ? `<a class="button button-dark" href="${sanitizeText(c.buttonUrl || '#')}">${sanitizeText(c.buttonText)}</a>` : ''}
            </div>
          </div>
        </section>
      `;

    case 'catalog_preview':
      return `
        <section class="catalog-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            <p class="intro-lead" data-cms-bind="lead">${sanitizeText(c.lead || '')}</p>
          </div>
          <div class="product-grid reveal" id="catalog-preview"></div>
          <div style="max-width:1220px;margin:24px auto;text-align:center;">
            <a class="button button-dark" href="${sanitizeText(c.buttonUrl || '/catalogo')}">${sanitizeText(c.buttonText || 'Ver catálogo completo')}</a>
          </div>
        </section>
      `;

    case 'gallery':
      return `
        <section class="gallery-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
          </div>
          <div class="editorial-gallery">
            ${(c.items || []).map((item, i) => `
              <figure class="${sanitizeText(item.span || 'gallery-small')} reveal ${i % 2 === 1 ? 'reveal-delay' : ''}">
                <img src="${sanitizeText(item.image || '')}" alt="${sanitizeText(item.alt || '')}" loading="lazy">
                ${item.caption ? `<figcaption>${sanitizeText(item.caption)}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        </section>
      `;

    case 'testimonials':
      return `
        <section class="testimonials section dark-band" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 class="testimonials-title" data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            ${c.subtitle ? `<p data-cms-bind="subtitle">${sanitizeText(c.subtitle)}</p>` : ''}
          </div>
          <div class="quote-feature reveal">
            <p data-cms-bind="quoteText">${sanitizeText(c.quoteText || '')}</p>
            <span data-cms-bind="quoteAuthor">${sanitizeText(c.quoteAuthor || '')}</span>
          </div>
          <div class="reviews-cta-block reveal">
            <p class="reviews-cta-prompt" data-cms-bind="ctaPrompt">${sanitizeText(c.ctaPrompt || '')}</p>
            <a class="button button-light reviews-cta-btn" href="${sanitizeText(c.ctaButtonUrl || '#')}" target="_blank" rel="noopener">${sanitizeText(c.ctaButtonText || 'Escribir reseña')}</a>
          </div>
        </section>
      `;

    case 'mountain_showcase':
      return `
        <section class="mountain-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="mountain-copy reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            <p class="large-copy" data-cms-bind="largeCopy">${sanitizeText(c.largeCopy || '')}</p>
            <p data-cms-bind="body">${sanitizeText(c.body || '')}</p>
            <div class="nature-stat"><strong>${sanitizeText(c.statNumber || '')}</strong><span>${sanitizeText(c.statLabel || '')}</span></div>
            <div style="margin-top:25px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
              ${c.instagramUrl ? `<a class="button button-dark" href="${sanitizeText(c.instagramUrl)}" target="_blank" rel="noopener">Ver en Instagram</a>` : ''}
              ${c.ebirdUrl ? `<a class="text-link" href="${sanitizeText(c.ebirdUrl)}" target="_blank" rel="noopener">Ver registros en eBird <span>↗</span></a>` : ''}
            </div>
          </div>
          <div class="mountain-gallery reveal reveal-delay" id="galeria-montana">
            <figure class="mountain-lead-img">
              <img src="${sanitizeText(c.leadImage || '')}" alt="${sanitizeText(c.leadImageAlt || '')}" loading="lazy">
            </figure>
            <div class="mountain-sub-imgs">
              <figure>
                <img src="${sanitizeText(c.subImg1 || '')}" alt="${sanitizeText(c.subImg1Alt || '')}" loading="lazy">
                <figcaption>${sanitizeText(c.subImg1Caption || '')}</figcaption>
              </figure>
              <figure class="mountain-video-figure">
                ${c.subVideo ? `
                  <video class="mountain-video" autoplay loop muted playsinline poster="${sanitizeText(c.subVideoPoster || '')}">
                    <source src="${sanitizeText(c.subVideo)}" type="video/mp4">
                  </video>
                ` : ''}
                <figcaption>${sanitizeText(c.subVideoCaption || '')}</figcaption>
              </figure>
            </div>
          </div>
        </section>
      `;

    case 'rates':
      return `
        <section class="rates-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            <p data-cms-bind="subtitle">${sanitizeText(c.subtitle || '')}</p>
          </div>
          <div class="rate-strip reveal">
            ${(c.rates || []).map(r => `<div><strong>${sanitizeText(r.value || '')}</strong><span>${sanitizeText(r.label || '')}</span></div>`).join('')}
            ${c.buttonText ? `<a class="button button-dark" href="${sanitizeText(c.buttonUrl || '#')}">${sanitizeText(c.buttonText)}</a>` : ''}
          </div>
          ${c.finePrint ? `<p class="fine-print" data-cms-bind="finePrint">${sanitizeText(c.finePrint)}</p>` : ''}
        </section>
      `;

    case 'banner_cta':
      return `
        <section class="final-cta" id="${sanitizeText(section.id)}"${previewAttrs} style="${c.bgImage ? `background-image:url('${sanitizeText(c.bgImage)}');background-size:cover;background-position:center;` : ''}">
          <div class="final-cta-bg" aria-hidden="true"></div>
          <div class="final-cta-content reveal">
            <p class="eyebrow" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            ${c.buttonText ? `<a class="button button-light" href="${sanitizeText(c.buttonUrl || '#')}">${sanitizeText(c.buttonText)}</a>` : ''}
          </div>
        </section>
      `;

    case 'contact':
      return `
        <section class="contact-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="contact-intro reveal">
            <p class="eyebrow eyebrow-dark" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow || '')}</p>
            <h2 data-cms-bind="title">${sanitizeText(c.title || '')}</h2>
            <p data-cms-bind="description">${sanitizeText(c.description || '')}</p>
          </div>
          <form class="cotiza-form reveal reveal-delay" id="cotiza-form">
            <label for="nombre">Nombre completo</label><input type="text" id="nombre" name="nombre" required placeholder="Ej. Juan Pérez">
            <label for="email">Correo electrónico</label><input type="email" id="email" name="email" required placeholder="ejemplo@correo.com">
            <label for="telefono">Teléfono / WhatsApp</label><input type="tel" id="telefono" name="telefono" required placeholder="+57 300 000 0000">
            <div class="date-group">
              <div><label for="llegada">Fecha de llegada</label><input type="date" id="llegada" name="llegada" required></div>
              <div><label for="salida">Fecha de salida</label><input type="date" id="salida" name="salida" readonly required></div>
            </div>
            <p class="form-note">La salida se calcula automáticamente para el día siguiente.</p>
            <label for="huespedes">Número de huéspedes / visitantes</label><input type="number" id="huespedes" name="huespedes" min="1" value="1" required placeholder="Ej. 2">
            <label for="tarifa">Experiencia que quieres cotizar</label>
            <select id="tarifa" name="tarifa">
              <option value="pasadia">Pasadía común (solo visita) — $35.000 por persona</option>
              <option value="alojamiento">Alojamiento en casa histórica — Desde $130.000 por noche</option>
              <option value="fotografia">Fotografía de naturaleza — $35.000 por persona</option>
              <option value="bienestar">Terapias de bienestar — Desde $80.000 por persona</option>
            </select>
            <div class="addons-group">
              <span class="addons-label">Adicionales de alimentación (opcional para cualquier servicio)</span>
              <div class="addons-grid">
                <label class="addon-card"><input type="checkbox" id="addon-desayuno" name="adicional_desayuno"><div class="addon-details"><strong>Desayuno</strong><small>+$18.000 / persona</small></div></label>
                <label class="addon-card"><input type="checkbox" id="addon-almuerzo" name="adicional_almuerzo"><div class="addon-details"><strong>Almuerzo</strong><small>+$38.000 / persona</small></div></label>
                <label class="addon-card"><input type="checkbox" id="addon-refrigerio" name="adicional_refrigerio"><div class="addon-details"><strong>Refrigerio</strong><small>+$10.000 / persona</small></div></label>
              </div>
            </div>
            <div class="rate-output" aria-live="polite"><strong id="tarifa-nombre">Pasadía común</strong><span id="tarifa-precio">$35.000</span></div>
            <label for="mensaje">Comentarios</label><textarea id="mensaje" name="mensaje" rows="3" placeholder="¿Tienes alguna preferencia, restricción alimentaria o solicitud especial?"></textarea>
            <button type="submit" class="button button-dark">Enviar solicitud por WhatsApp</button>
          </form>
          <div class="location-block reveal">
            <iframe title="Mapa de Casa Vieja Mountain Lodge en La Buitrera, Palmira" src="${sanitizeText(c.mapsEmbedUrl || '')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
            <p>${sanitizeText(c.address || '')}</p>
            <div class="location-links">
              <a href="${sanitizeText(c.mapsUrl || '#')}" target="_blank" rel="noopener">📍 Abrir en Google Maps ↗</a>
              <a href="${sanitizeText(c.wazeUrl || '#')}" target="_blank" rel="noopener">🗺️ Cómo llegar en Waze ↗</a>
            </div>
          </div>
        </section>
      `;

    case 'table': {
      // Requirement 4: Inserción y edición de tablas
      const headers = c.headers || ['Columna 1', 'Columna 2', 'Columna 3'];
      const rows = c.rows || [['Dato 1', 'Dato 2', 'Dato 3']];
      const isStriped = c.striped !== false;
      const isBordered = c.bordered !== false;
      const responsiveMode = c.responsiveMode || 'scroll'; // 'scroll' or 'stacked'

      return `
        <section class="table-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="section-heading reveal">
            ${c.eyebrow ? `<p class="eyebrow ${c.eyebrowDark ? 'eyebrow-dark' : ''}" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow)}</p>` : ''}
            <h2 data-cms-bind="title">${sanitizeText(c.title || 'Tabla de Información')}</h2>
            ${c.description ? `<p data-cms-bind="description">${sanitizeText(c.description)}</p>` : ''}
          </div>
          <div class="cms-table-wrapper ${responsiveMode === 'stacked' ? 'cms-table-stacked' : 'cms-table-scroll'} reveal">
            <table class="cms-table ${isStriped ? 'cms-table-striped' : ''} ${isBordered ? 'cms-table-bordered' : ''}" style="${c.headerBg ? `--table-th-bg:${sanitizeText(c.headerBg)};` : ''}${c.headerTextColor ? `--table-th-color:${sanitizeText(c.headerTextColor)};` : ''}">
              <thead>
                <tr>
                  ${headers.map(h => `<th>${sanitizeText(h)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    ${row.map((cell, ci) => `<td data-label="${sanitizeText(headers[ci] || '')}">${sanitizeText(cell)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${c.note ? `<p class="fine-print">${sanitizeText(c.note)}</p>` : ''}
        </section>
      `;
    }

    case 'rich_text':
      return `
        <section class="rich-text-section section" id="${sanitizeText(section.id)}"${previewAttrs}>
          <div class="rich-text-container ${c.align === 'center' ? 'text-center' : ''} reveal">
            ${c.eyebrow ? `<p class="eyebrow ${c.eyebrowDark ? 'eyebrow-dark' : ''}" data-cms-bind="eyebrow">${sanitizeText(c.eyebrow)}</p>` : ''}
            ${c.title ? `<h2 data-cms-bind="title">${sanitizeText(c.title)}</h2>` : ''}
            <div class="rich-text-body">
              ${sanitizeHtml(c.contentHtml || c.body || '')}
            </div>
            ${c.buttonText ? `<div style="margin-top:25px;"><a class="button button-dark" href="${sanitizeText(c.buttonUrl || '#')}">${sanitizeText(c.buttonText)}</a></div>` : ''}
          </div>
        </section>
      `;

    default:
      return `<section id="${sanitizeText(section.id)}"${previewAttrs}><p>[Sección no reconocida: ${sanitizeText(section.name || section.id)}]</p></section>`;
  }
}

function renderCmsPage(cmsData, options = {}) {
  const isPreview = Boolean(options.isPreview);
  const data = cmsData || getDefaultCmsData();
  const global = data.globalStyles || {};
  const header = data.header || {};
  const footer = data.footer || {};
  const sections = data.sections || [];

  // Scoped section custom styles
  const sectionStylesCss = sections.map(sec => {
    let css = '';
    const st = sec.styles || {};
    if (st.backgroundColor || st.textColor || st.paddingTop || st.paddingBottom) {
      css += `#${sec.id} {`;
      if (st.backgroundColor) css += ` background-color: ${st.backgroundColor} !important;`;
      if (st.textColor) css += ` color: ${st.textColor} !important;`;
      if (st.paddingTop) css += ` padding-top: ${st.paddingTop} !important;`;
      if (st.paddingBottom) css += ` padding-bottom: ${st.paddingBottom} !important;`;
      css += ` }\n`;
    }
    if (st.customCss) {
      css += `\n/* Custom CSS for #${sec.id} */\n${st.customCss}\n`;
    }
    return css;
  }).join('\n');

  // Preview overlay styles and click-to-inspect helper script
  const previewInjection = isPreview ? `
    <style>
      [data-cms-section-id] {
        position: relative;
        cursor: pointer;
        transition: outline 0.2s ease, box-shadow 0.2s ease;
      }
      body.cms-edit-mode [data-cms-section-id]:hover {
        outline: 2px dashed #86041D !important;
        outline-offset: 4px;
      }
      body.cms-edit-mode [data-cms-section-id].cms-selected-section {
        outline: 3px solid #86041D !important;
        outline-offset: 4px;
        box-shadow: 0 0 20px rgba(134,4,29,0.25) !important;
      }
      .cms-section-badge {
        display: none;
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 999;
        background: #86041D;
        color: #FFFFFF;
        font: 700 11px Arial, sans-serif;
        padding: 4px 10px;
        border-radius: 4px;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      body.cms-edit-mode [data-cms-section-id]:hover > .cms-section-badge,
      body.cms-edit-mode [data-cms-section-id].cms-selected-section > .cms-section-badge {
        display: block;
      }
    </style>
    <script>
      document.body.classList.add('cms-edit-mode');
      document.querySelectorAll('[data-cms-section-id]').forEach(sec => {
        const badge = document.createElement('div');
        badge.className = 'cms-section-badge';
        badge.textContent = '✎ ' + (sec.dataset.cmsSectionType || 'Sección') + ': #' + sec.dataset.cmsSectionId;
        sec.prepend(badge);
      });

      document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('cms-edit-mode')) return;
        const targetSec = e.target.closest('[data-cms-section-id]');
        if (targetSec) {
          e.preventDefault();
          document.querySelectorAll('.cms-selected-section').forEach(el => el.classList.remove('cms-selected-section'));
          targetSec.classList.add('cms-selected-section');
          const bindEl = e.target.closest('[data-cms-bind]');
          window.parent.postMessage({
            type: 'cms:section_selected',
            sectionId: targetSec.dataset.cmsSectionId,
            bindProp: bindEl ? bindEl.dataset.cmsBind : null
          }, '*');
        }
      }, true);

      window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;
        if (msg.type === 'cms:select_section') {
          document.querySelectorAll('.cms-selected-section').forEach(el => el.classList.remove('cms-selected-section'));
          const sec = document.querySelector('[data-cms-section-id="' + msg.sectionId + '"]');
          if (sec) {
            sec.classList.add('cms-selected-section');
            sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (msg.type === 'cms:set_mode') {
          document.body.classList.toggle('cms-edit-mode', msg.mode === 'edit');
        }
      });
    </script>
  ` : '';

  // Render hero as first section inside header or main
  const heroSection = sections.find(s => s.type === 'hero' && s.visible);
  const otherSections = sections.filter(s => s.type !== 'hero');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Casa Vieja Mountain Lodge | Un refugio entre montaña y naturaleza</title>
  <meta name="description" content="Casa Vieja Mountain Lodge: una casa histórica de 1890 en La Buitrera, Palmira, para descansar, observar aves y vivir la naturaleza con calma.">
  <meta name="theme-color" content="${global.headingColor || '#17231C'}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Casa Vieja Mountain Lodge">
  <meta property="og:description" content="Un refugio entre la montaña, la historia y la naturaleza.">
  <meta property="og:image" content="/Casa-Lodge-Img/imagen_06.jpg">
  <link rel="icon" type="image/jpeg" href="/Casa-Lodge-Img/imagen_30.jpg">
  <link rel="stylesheet" href="/style.css">
  <style>
    :root {
      ${global.headingColor ? `--text-heading: ${global.headingColor};` : ''}
      ${global.bodyColor ? `--text-body: ${global.bodyColor};` : ''}
      ${global.accentDark ? `--accent-dark: ${global.accentDark};` : ''}
      ${global.accentLight ? `--accent-light: ${global.accentLight};` : ''}
      ${global.bgLight ? `--bg-light: ${global.bgLight};` : ''}
      ${global.bgDark ? `--bg-dark: ${global.bgDark};` : ''}
      ${global.fontFamily ? `--serif: ${global.fontFamily};` : ''}
    }
    /* Estilos del componente de tabla del CMS */
    .table-section { max-width: 1220px; margin: 0 auto; padding: 70px 20px; }
    .cms-table-wrapper { width: 100%; margin: 30px auto; overflow-x: auto; background: var(--bg-light); border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .cms-table { width: 100%; border-collapse: collapse; font-family: var(--sans); font-size: 14px; text-align: left; }
    .cms-table th { background: var(--table-th-bg, var(--accent-dark)); color: var(--table-th-color, #ffffff); padding: 16px 20px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
    .cms-table td { padding: 16px 20px; color: var(--text-body); border-bottom: 1px solid rgba(0,0,0,0.08); vertical-align: top; }
    .cms-table-striped tbody tr:nth-child(even) { background: rgba(0,0,0,0.025); }
    .cms-table-bordered th, .cms-table-bordered td { border: 1px solid rgba(0,0,0,0.08); }
    .cms-table tr:hover td { background: rgba(134,4,29,0.04); }
    @media (max-width: 768px) {
      .cms-table-stacked table, .cms-table-stacked thead, .cms-table-stacked tbody, .cms-table-stacked th, .cms-table-stacked td, .cms-table-stacked tr { display: block; }
      .cms-table-stacked thead tr { position: absolute; top: -9999px; left: -9999px; }
      .cms-table-stacked tr { border: 1px solid rgba(0,0,0,0.12); border-radius: 6px; margin-bottom: 16px; background: #ffffff; padding: 10px; }
      .cms-table-stacked td { border: none; border-bottom: 1px solid rgba(0,0,0,0.06); position: relative; padding-left: 45%; }
      .cms-table-stacked td:last-child { border-bottom: none; }
      .cms-table-stacked td:before { position: absolute; left: 14px; width: 40%; font-weight: 700; color: var(--accent-dark); content: attr(data-label); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .rich-text-section { max-width: 960px; margin: 0 auto; padding: 70px 20px; line-height: 1.8; }
    .rich-text-body p { margin-bottom: 20px; font-size: 17px; }
    .rich-text-body h3 { font-size: 26px; margin-top: 35px; margin-bottom: 15px; color: var(--text-heading); }
    .rich-text-body ul, .rich-text-body ol { margin-bottom: 25px; padding-left: 28px; }
    .rich-text-body li { margin-bottom: 8px; font-size: 16px; }
    ${sectionStylesCss}
    ${global.customCss || ''}
  </style>
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header" id="inicio">
    <nav class="nav" aria-label="Navegación principal">
      <a class="brand" href="#inicio">
        <img src="${sanitizeText(header.brandLogo || 'Casa-Lodge-Img/imagen_30.jpg')}" alt="" width="48" height="48">
        <span>${sanitizeText(header.brandName || 'Casa Vieja')}<small>${sanitizeText(header.brandSub || 'Mountain Lodge')}</small></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Abrir menú"><span></span><span></span></button>
      <div class="nav-menu" id="nav-menu">
        ${(header.menuLinks || []).map(link => `<a href="${sanitizeText(link.url || '#')}">${sanitizeText(link.label || '')}</a>`).join('')}
        <span class="nav-actions">
          ${header.catalogBtn ? `<a class="nav-catalog" href="${sanitizeText(header.catalogBtn.url || '/catalogo')}">${sanitizeText(header.catalogBtn.label || 'Catálogo')}</a>` : ''}
          ${header.ctaBtn ? `<a class="nav-cta" href="${sanitizeText(header.ctaBtn.url || '#contacto')}">${sanitizeText(header.ctaBtn.label || 'Cotizar')}</a>` : ''}
        </span>
      </div>
    </nav>
    ${heroSection ? renderSectionHtml(heroSection, isPreview) : ''}
    <a class="scroll-cue" href="#experiencia" aria-label="Conocer la experiencia"><span></span>Desliza para entrar</a>
  </header>
  <main id="contenido">
    ${otherSections.map(sec => renderSectionHtml(sec, isPreview)).join('\n')}
  </main>
  <a class="whatsapp-float" href="https://wa.me/573104190444" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">WA</a>
  <script src="/catalog.js" defer></script>
  <footer class="footer">
    <span>${sanitizeText(footer.brand || 'Casa Vieja Mountain Lodge')}</span>
    <span>${sanitizeText(footer.sub || 'Historia · Aves · Bienestar · RNT 169434')}</span>
    <div>
      ${(footer.socialLinks || []).map(sl => `<a href="${sanitizeText(sl.url || '#')}" target="_blank" rel="noopener">${sanitizeText(sl.label || '')}</a>`).join('')}
    </div>
  </footer>
  <script>
    const contactSection = document.querySelector('.contact-section');
    const contactIntro = document.querySelector('.contact-intro');
    const bookingFormElement = document.querySelector('.cotiza-form');
    if (contactSection && contactIntro && bookingFormElement) {
      const contactTop = document.createElement('div');
      contactTop.className = 'contact-top';
      contactSection.insertBefore(contactTop, contactIntro);
      contactTop.append(contactIntro, bookingFormElement);
    }
    const nav = document.querySelector('.nav'); const menuToggle = document.querySelector('.menu-toggle'); const navMenu = document.querySelector('.nav-menu'); const revealItems = document.querySelectorAll('.reveal');
    const rateSelect = document.getElementById('tarifa'); const rateName = document.getElementById('tarifa-nombre'); const ratePrice = document.getElementById('tarifa-precio'); const guestsInput = document.getElementById('huespedes'); const departureLabel = document.querySelector('label[for="salida"]'); const dateNote = document.querySelector('.form-note');
    const addonDesayuno = document.getElementById('addon-desayuno'); const addonAlmuerzo = document.getElementById('addon-almuerzo'); const addonRefrigerio = document.getElementById('addon-refrigerio');
    const rateOptions = { pasadia: 'Pasadía común (solo visita)', alojamiento: 'Alojamiento en casa histórica', fotografia: 'Fotografía de naturaleza', bienestar: 'Terapias de bienestar' };
    if (rateSelect) rateSelect.replaceChildren(...Object.entries(rateOptions).map(([value, label]) => new Option(label, value)));
    const revealObserver = new IntersectionObserver((entries, observer) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }); }, { threshold: 0.1 }); revealItems.forEach((item) => revealObserver.observe(item));
    if (nav) window.addEventListener('scroll', () => nav.classList.toggle('is-scrolled', window.scrollY > 30), { passive: true });
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => { const isOpen = navMenu.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
      navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { navMenu.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
    }
    document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => { const target = document.querySelector(link.getAttribute('href')); if (!target) return; event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.replaceState(null, '', window.location.pathname + window.location.search); }));
    function formatCurrency(value) { return '$' + value.toLocaleString('es-CO'); }
    function getRate() {
      if (!guestsInput || !rateSelect) return ['Experiencia', '$0', 0, []];
      const guests = Math.max(1, Number(guestsInput.value) || 1); const type = rateSelect.value; let baseCost = 0; let baseLabel = rateOptions[type] || 'Experiencia';
      if (type === 'alojamiento') { if (guests === 1) { baseCost = 130000; baseLabel = 'Alojamiento · 1 huésped'; } else if (guests === 2) { baseCost = 200000; baseLabel = 'Alojamiento · 2 huéspedes'; } else if (guests <= 4) { baseCost = 380000; baseLabel = 'Alojamiento · 3 a 4 huéspedes'; } else if (guests <= 9) { baseCost = 700000; baseLabel = 'Alojamiento · 5 a 9 huéspedes'; } else { return ['Alojamiento', 'Máximo 9 huéspedes', 0, []]; } }
      else if (type === 'pasadia') { baseCost = 35000 * guests; baseLabel = 'Pasadía común · ' + guests + (guests === 1 ? ' persona' : ' personas'); }
      else if (type === 'fotografia') { baseCost = 35000 * guests; baseLabel = 'Fotografía de naturaleza · ' + guests + (guests === 1 ? ' persona' : ' personas'); }
      else if (type === 'bienestar') { baseCost = 80000 * guests; baseLabel = 'Bienestar (desde $80.000) · ' + guests + (guests === 1 ? ' persona' : ' personas'); }
      const addons = []; let addonsCost = 0;
      if (addonDesayuno && addonDesayuno.checked) { const cost = 18000 * guests; addonsCost += cost; addons.push('Desayuno (' + formatCurrency(cost) + ')'); }
      if (addonAlmuerzo && addonAlmuerzo.checked) { const cost = 38000 * guests; addonsCost += cost; addons.push('Almuerzo (' + formatCurrency(cost) + ')'); }
      if (addonRefrigerio && addonRefrigerio.checked) { const cost = 10000 * guests; addonsCost += cost; addons.push('Refrigerio (' + formatCurrency(cost) + ')'); }
      const total = baseCost + addonsCost; const title = addons.length ? baseLabel + ' + ' + addons.join(' + ') : baseLabel; return [title, formatCurrency(total), total, addons];
    }
    const arrival = document.getElementById('llegada'); const departure = document.getElementById('salida');
    function updateDates() {
      if (!rateSelect || !departureLabel || !departure || !dateNote) return;
      const isAccommodation = rateSelect.value === 'alojamiento';
      departureLabel.textContent = isAccommodation ? 'Fecha de salida' : 'Fecha de salida (solo alojamiento)'; departure.disabled = !isAccommodation; departure.required = isAccommodation;
      if (isAccommodation) departure.removeAttribute('readonly'); else departure.setAttribute('readonly', '');
      dateNote.textContent = isAccommodation ? 'Elige tu fecha de salida. Se sugiere el día siguiente a la llegada.' : 'Este servicio se realiza durante el día; la fecha de salida no aplica.';
      if (!isAccommodation) departure.value = '';
    }
    function updateRate() {
      if (!rateName || !ratePrice) return;
      const [name, price] = getRate(); const isAccommodation = rateSelect && rateSelect.value === 'alojamiento';
      if (guestsInput) { guestsInput.max = isAccommodation ? '9' : ''; guestsInput.setCustomValidity(isAccommodation && Number(guestsInput.value) > 9 ? 'El alojamiento admite máximo 9 huéspedes.' : ''); }
      rateName.textContent = name; ratePrice.textContent = price; updateDates();
    }
    if (rateSelect) rateSelect.addEventListener('change', updateRate);
    if (guestsInput) guestsInput.addEventListener('input', updateRate);
    [addonDesayuno, addonAlmuerzo, addonRefrigerio].forEach((cb) => { if (cb) cb.addEventListener('change', updateRate); });
    document.querySelectorAll('[data-rate]').forEach((button) => button.addEventListener('click', () => { const map = { 0: 'alojamiento', 4: 'pasadia', 5: 'fotografia', 6: 'bienestar' }; if (rateSelect) rateSelect.value = map[button.dataset.rate] || 'pasadia'; updateRate(); }));
    if (arrival && departure) {
      arrival.min = new Date().toISOString().split('T')[0];
      arrival.addEventListener('change', () => { if (!arrival.value || (rateSelect && rateSelect.value !== 'alojamiento')) { departure.value = ''; return; } departure.min = arrival.value; if (!departure.value || departure.value <= arrival.value) { const nextDay = new Date(arrival.value + 'T12:00:00'); nextDay.setDate(nextDay.getDate() + 1); departure.value = nextDay.toISOString().split('T')[0]; } });
    }
    updateRate();
    const cotizaForm = document.getElementById('cotiza-form');
    if (cotizaForm) {
      cotizaForm.addEventListener('submit', async (event) => {
        event.preventDefault(); const form = event.currentTarget; const submitButton = form.querySelector('button[type="submit"]'); const data = new FormData(form); const [selectedRate, selectedPrice, , selectedAddons] = getRate();
        submitButton.disabled = true; submitButton.textContent = 'Guardando solicitud...'; const addonsText = selectedAddons.length ? selectedAddons.join(', ') : 'Ninguno';
        const fullComments = [data.get('mensaje') ? 'Comentarios: ' + data.get('mensaje') : '', selectedAddons.length ? '[Adicionales de alimentación: ' + addonsText + ']' : ''].filter(Boolean).join(' | ');
        try {
          const response = await fetch('/api/cotizaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: data.get('nombre'), email: data.get('email'), telefono: data.get('telefono'), llegada: data.get('llegada'), salida: data.get('salida'), huespedes: data.get('huespedes'), experiencia: data.get('tarifa'), experienciaNombre: selectedRate, cotizacion: selectedPrice, comentarios: fullComments }) });
          const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No pudimos guardar la solicitud.');
          const message = ['Hola, quiero cotizar mi visita a Casa Vieja Mountain Lodge.', 'Nombre: ' + data.get('nombre'), 'Correo: ' + data.get('email'), 'Teléfono / WhatsApp: ' + data.get('telefono'), 'Llegada: ' + data.get('llegada'), 'Salida: ' + (data.get('salida') || 'No aplica: servicio durante el día'), 'Huéspedes / visitantes: ' + data.get('huespedes'), 'Experiencia base: ' + (rateOptions[data.get('tarifa')] || data.get('tarifa')), 'Adicionales de alimentación: ' + addonsText, 'Cotización total: ' + selectedPrice, 'Comentarios: ' + (data.get('mensaje') || 'Ninguno')].join('\\n');
          window.open('https://wa.me/573104190444?text=' + encodeURIComponent(message), '_blank', 'noopener'); submitButton.textContent = 'Solicitud guardada';
        } catch (error) { submitButton.disabled = false; submitButton.textContent = 'Enviar solicitud por WhatsApp'; window.alert(error.message); }
      });
    }
  </script>
  <script src="/reviews.js"></script>
  ${previewInjection}
</body>
</html>`;
}

// Storage helpers: MongoDB with automatic file fallback
async function getCmsCollection(database) {
  if (!database) return null;
  const col = database.collection('cms_content');
  return col;
}

async function getVersionsCollection(database) {
  if (!database) return null;
  const col = database.collection('cms_versions');
  await col.createIndex({ publishedAt: -1 });
  return col;
}

async function loadCmsDraft(database) {
  try {
    if (database) {
      const col = await getCmsCollection(database);
      const doc = await col.findOne({ key: 'draft' });
      if (doc && doc.data) return doc.data;
    }
  } catch (err) {
    console.warn('CMS: No se pudo cargar draft de Mongo, probando archivo local:', err.message);
  }
  if (fs.existsSync(DRAFT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf-8'));
    } catch (_) {}
  }
  // If no draft exists, initialize with published or default
  return loadCmsPublished(database);
}

async function saveCmsDraft(database, data, user = 'admin') {
  data.updatedAt = new Date().toISOString();
  data.updatedBy = user;
  try {
    fs.writeFileSync(DRAFT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando cms draft local:', e.message);
  }
  try {
    if (database) {
      const col = await getCmsCollection(database);
      await col.updateOne({ key: 'draft' }, { $set: { key: 'draft', data, updatedAt: new Date(), updatedBy: user } }, { upsert: true });
    }
  } catch (err) {
    console.warn('CMS: Guardado en Mongo falló, persistido localmente:', err.message);
  }
  return true;
}

async function loadCmsPublished(database) {
  try {
    if (database) {
      const col = await getCmsCollection(database);
      const doc = await col.findOne({ key: 'published' });
      if (doc && doc.data) return doc.data;
    }
  } catch (err) {
    console.warn('CMS: No se pudo cargar published de Mongo, probando archivo local:', err.message);
  }
  if (fs.existsSync(PUBLISHED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf-8'));
    } catch (_) {}
  }
  return getDefaultCmsData();
}

async function publishCms(database, data, user = 'admin', note = 'Publicación manual') {
  data.version = (data.version || 1) + 1;
  data.publishedAt = new Date().toISOString();
  data.publishedBy = user;

  // 1. Save published file and draft sync
  try {
    fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(data, null, 2), 'utf-8');
    fs.writeFileSync(DRAFT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando publish local:', e.message);
  }

  // 2. Save version in version history
  const versionRecord = {
    versionId: 'v-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
    version: data.version,
    publishedAt: new Date().toISOString(),
    publishedBy: user,
    note: note || 'Publicación',
    sectionsCount: (data.sections || []).length,
    data: JSON.parse(JSON.stringify(data))
  };

  let versions = [];
  if (fs.existsSync(VERSIONS_FILE)) {
    try { versions = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf-8')); } catch (_) {}
  }
  versions.unshift(versionRecord);
  if (versions.length > 50) versions = versions.slice(0, 50); // Keep last 50 versions
  try {
    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2), 'utf-8');
  } catch (e) {}

  // 3. Mongo persistence if available
  try {
    if (database) {
      const col = await getCmsCollection(database);
      await col.updateOne({ key: 'published' }, { $set: { key: 'published', data, publishedAt: new Date(), publishedBy: user } }, { upsert: true });
      await col.updateOne({ key: 'draft' }, { $set: { key: 'draft', data, updatedAt: new Date(), updatedBy: user } }, { upsert: true });

      const vCol = await getVersionsCollection(database);
      await vCol.insertOne(versionRecord);
    }
  } catch (err) {
    console.warn('CMS publish Mongo error:', err.message);
  }

  return versionRecord;
}

async function listCmsVersions(database) {
  try {
    if (database) {
      const vCol = await getVersionsCollection(database);
      const docs = await vCol.find({}).sort({ publishedAt: -1 }).limit(30).toArray();
      if (docs && docs.length) {
        return docs.map(d => ({
          versionId: d.versionId,
          version: d.version,
          publishedAt: d.publishedAt,
          publishedBy: d.publishedBy,
          note: d.note,
          sectionsCount: d.sectionsCount || (d.data?.sections?.length || 0)
        }));
      }
    }
  } catch (err) {
    console.warn('Error cargando versiones de Mongo:', err.message);
  }
  if (fs.existsSync(VERSIONS_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf-8'));
      return list.map(d => ({
        versionId: d.versionId,
        version: d.version,
        publishedAt: d.publishedAt,
        publishedBy: d.publishedBy,
        note: d.note,
        sectionsCount: d.sectionsCount || (d.data?.sections?.length || 0)
      }));
    } catch (_) {}
  }
  return [];
}

async function restoreCmsVersion(database, versionId, user = 'admin') {
  let targetData = null;
  try {
    if (database) {
      const vCol = await getVersionsCollection(database);
      const doc = await vCol.findOne({ versionId });
      if (doc && doc.data) targetData = doc.data;
    }
  } catch (e) {}

  if (!targetData && fs.existsSync(VERSIONS_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf-8'));
      const found = list.find(v => v.versionId === versionId);
      if (found && found.data) targetData = found.data;
    } catch (_) {}
  }

  if (!targetData) throw new Error('No se encontró la versión solicitada.');

  // Save as draft and publish it
  await saveCmsDraft(database, targetData, user);
  const publishedVersion = await publishCms(database, targetData, user, `Restaurado de versión ${targetData.version || versionId}`);
  return { ok: true, versionId: publishedVersion.versionId, data: targetData };
}

function getMediaLibraryAssets() {
  const assetsDir = path.resolve(__dirname, 'public', 'Casa-Lodge-Img');
  const files = [];
  if (fs.existsSync(assetsDir)) {
    try {
      const names = fs.readdirSync(assetsDir);
      names.forEach(name => {
        if (/\.(jpg|jpeg|png|webp|gif|svg|mp4)$/i.test(name)) {
          files.push({
            url: `Casa-Lodge-Img/${name}`,
            name,
            type: name.endsWith('.mp4') ? 'video' : 'image'
          });
        }
      });
    } catch (e) {}
  }
  return files;
}

module.exports = {
  getDefaultCmsData,
  renderSectionHtml,
  renderCmsPage,
  loadCmsDraft,
  saveCmsDraft,
  loadCmsPublished,
  publishCms,
  listCmsVersions,
  restoreCmsVersion,
  validateCss,
  sanitizeHtml,
  getMediaLibraryAssets
};

