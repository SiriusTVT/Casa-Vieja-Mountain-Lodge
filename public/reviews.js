const manualReviews = [
  ['Ines Fabiola Restrepo', 5, 'Me gustó mucho el Parque de las Aves. Hay mucha variedad de ellas y su canto es encantador. Otro atractivo es la chorrera al aire libre. El sonido del agua es un arrullo para dormir. Es un sitio altamente recomendado.'],
  ['Daniel Carvajal', 5, 'Casa Vieja es toda una experiencia por su hermosa casa antigua y su comodidad. El canto del agua que rueda por sus acequias hace de la noche un lugar como muy pocos. Las atenciones de su dueña la hacen inolvidable.'],
  ['Fernando Vargas', 5, 'Casa Vieja es un lugar mágico, casa construida hace más de un siglo, con todo el encanto de nuestros abuelos y el romanticismo de esa época. Casa amplia, con muy buenas habitaciones a la usanza de antaño y amplios pasillos.'],
  ['Lorena Solarte', 5, 'La mejor, solamente tengo para decir cosas positivas. Un sitio soñado donde logramos descansar, en medio de la naturaleza, el sonido de diversas aves y un paisaje hermoso. Fuimos en familia y todos quedamos enamorados de Casa Vieja.'],
  ['Kelly Vanessa', 5, 'Excelente lugar, muy acogedor, perfecto para tardear y ver aves en la mañana. Muy buena atención, agradable, cuenta con hospedaje y estadía. Definitivamente volvería, me encantó.'],
  ['Margarita Franco', 1, 'Sitio ideal para descansar y disfrutar de la naturaleza, para dormir arrullada por el rumor de la acequia que rodea la casona antigua, caminar por el sendero boscoso hacia la quebrada Vilela de aguas cristalinas.'],
  ['Sandra Hurtado', 5, 'La estadía en Casa Vieja fue muy agradable. El sonido del agua y el canto de los pájaros ayuda a conectar con el medio ambiente, relaja el cuerpo y nos llena de paz y tranquilidad.'],
  ['Alejandro Hurtado', 5, 'La casa evoca otra época en un lugar arrullado por el agua y enorme diversidad de aves. Excelente servicio, sensibilidad ecológica y gestión medio ambiental. También fuimos al riachuelo y lo disfrutamos en familia.'],
  ['Diana Cadavid', 5, 'We have had several stays at Casa Vieja and can truly say it is a real treasure. It is easy to access, the house is well equipped, clean and full of history, it feels like you are taken back in time where the world was slow and simple!'],
  ['Lore MS', 5, 'El lugar es maravilloso 10 de 10, tranquilidad, comodidad y su exuberante fauna y flora lo hacen único. Si eres amante de las aves, será tu lugar favorito. Ni hablar de la excelente atención de su propietaria.'],
  ['Stefany Correa', 5, 'Mi estadía en este lugar fue simplemente mágica, un rincón lleno de vida, naturaleza y una energía especial que no se encuentra fácilmente. Desde el momento en que llegamos, quedamos maravillados por el entorno.'],
  ['Luis Gonzalo Carvajal Ramos', 5, 'Súper recomendado, me sentí como en casa. Lily te felicito por ese gran proyecto de turismo de naturaleza.'],
  ['Andrea Martinez Quintero', 4, 'Es un lugar muy tranquilo, para descansar y desconectarse de la ciudad. La atención de la señora Liliana es buena. Como aspecto para mejorar, hace falta una ducha adicional.'],
  ['Fernando Ramirez', 5, 'La llegada fue fácil, solo hay que tener en cuenta las indicaciones. El lugar es excelente y la casa muy acogedora. La anfitriona es muy amable. Si buscas ver aves o fotografiarlas, debes ir. Y no olvides ir al río.'],
  ['Adriana Gardeazabal', 5, 'Durante años he tenido la fortuna de visitar Casa Vieja y no me cansaré de ir. Amo el arrullo de su acequia y el dulce canto de los pájaros. Es un verdadero descanso y contacto permanente con la naturaleza.'],
  ['Carro Ful', 5, 'Un lugar perfecto para el descanso y el avistamiento de aves. Bien atendido y cuidada casa de antaño. Clima frío en las noches y soleado en el día.'],
  ['Cesar Augusto Cardenas Mariño', 5, 'Es un lugar hermoso, tranquilo y romántico, ideal para los amantes de la tranquilidad y la naturaleza. Si disfrutas de la fotografía, puedes hacer excelentes fotos de aves muy fácilmente.'],
  ['Lany Ortega', 5, 'Un fin de semana de ensueño. Es un lugar maravilloso para los amantes de la naturaleza y su dueña nos brindó una atención hermosa. 100% recomendado.'],
  ['Martha Ines Arango', 5, 'Es un lugar muy especial, un paraíso en todo el sentido de la palabra; bellísimo, acogedor, cómodo, muy bien atendido. Se disfruta en mucha paz y armonía con fauna y flora.'],
  ['Xandra Jaramillo', 5, 'Experiencia maravillosa rodeada de naturaleza. Excelente atención y servicio, hermoso paisaje. Muy recomendado para fines de semana o temporadas de vacaciones.'],
  ['Gina Patricia Marin Calderon', 5, 'Deseábamos encontrar un lugar para disfrutar un día rodeados de naturaleza, tranquilo y hermoso para fotografiar aves, y encontramos el lugar perfecto.'],
  ['Silvia Cristina Granobles Granobles', 5, 'Es un lugar que da mucha paz y tranquilidad. Es una experiencia espectacular. Los colibríes los amo y en este lugar se pueden apreciar. Enamorada del lugar.'],
  ['Miguel Castaño', 5, 'Gracias por ofrecer tan espectacular sitio, de lo mejor que he visitado, sobre todo para el avistamiento de mis aves favoritas.'],
  ['David Montoya', 5, 'Sitio súper tranquilo, cielo despejado por la noche y se ven todas las estrellas. Divinas las aves y colibríes. Es un lugar espectacular, 100% recomendado.'],
  ['Nora Aguado', 5, 'Es un lugar muy bello, tranquilo y con unas aves preciosas. Sentí mucha paz y calma. La dueña es una excelente anfitriona.'],
  ['Ximena Jaramillo', 5, 'Es una casa hermosa, muy silenciosa, perfecta para tener varios días de descanso. Su anfitriona es muy amable y pendiente de los huéspedes.'],
  ['Ana Sofia Rodas', 5, 'Muy agradable la estadía, las habitaciones muy cómodas e impecables, la casa rodeada de naturaleza para un buen descanso de fin de semana. Gran variedad de pájaros. Excelente anfitriona.'],
  ['Sebastián Giraldo Dávila', 5, 'Un gran lugar para conectarte con el recurso hídrico, las aves y la naturaleza. Muy recomendado. La atención, el alojamiento y los senderos son de primera calidad.'],
  ['Santiago', 5, 'Ninguna queja, excelente lugar, hermosa casa con bellos paisajes y sendero natural incluido, habitaciones y espacios impecables, y una atención personalizada que dan muchas ganas de volver.'],
  ['Luz Marina Benavides Lopez', 5, 'Es un lugar maravilloso, encuentro total con la naturaleza, aves espectaculares y muchísima calma. Maravillosa atención.'],
  ['Waira Viento', 5, 'Es un sitio ideal para descansar, tener contacto con la naturaleza, facilitar un encuentro con uno mismo y disfrutar una magnífica atención.'],
  ['Gustavo Lema', 5, 'Excelente lugar para descansar en silencio y paz; además el avistamiento de aves y la visita al río son un hit.'],
  ['Antonio Quiceno', 5, 'Muy agradable para conectarse con la naturaleza. La casa es impresionante y te lleva a viajar en la historia.'],
  ['Kelly Delgado', 4, 'Es un lugar tranquilo y adecuado para relajarse unos días, ya que está rodeado de naturaleza.'],
  ['Carmen Enith Torres Carvajal', 5, 'Tuvimos un maravilloso paseo, excelente atención, sitio aseado, naturaleza pura y muy bien cuidado.'],
  ['Esteban Lema', 5, 'Un sitio muy confortable, hermosa variedad de pájaros y una tranquilidad invaluable.'],
  ['Luis Fernando Piza Velandia', 5, 'Agradable lugar lleno de vida, excelente servicio con grandes espacios. Dios siga dando vida a este mágico lugar.'],
  ['Jairo Romero', 5, 'Muy lindo sitio. La Casa Vieja espectacular y la atención, lo mejor.'],
  ['Katterine Sánchez Vega', 5, 'Es un lugar fascinante y la guía, la maestra, es una persona de luz. Su conocimiento te brinda sabiduría para la vida. Recomendadísimo.'],
  ['Andres Bravo', 4, 'Linda casa del siglo XIX. Pasar la noche con el sonido del agua y amanecer con los cantos de las aves.'],
  ['Camilo Mercado', 5, 'Excelente lugar para encontrarse con la naturaleza y con uno mismo. Descanso verdadero.'],
  ['Yadira Gonzalez', 5, 'Me encantó ir al río y poder relajarme en un espacio privado.'],
  ['Claudia Viviana Suarez Tascon', 5, 'Un lugar lleno de paz y naturaleza.'],
  ['Maria Alejandra Africano', 5, 'Excelente experiencia para conectar con la naturaleza. Habitaciones cómodas y una experiencia muy agradable.'],
  ['Lucero Bustamante', 5, 'Was very good and peaceful environment.'],
  ['Natalia González', 5, 'Todo perfecto, la atención divina, lugar mágico.'],
  ['Subgerencia Tian', 5, 'Excelente servicio, un remanso de paz y silencio.'],
  ['Franduarly Hoyos Martinez', 5, 'La mejor anfitriona.'],
  ['Guillaume', 5, 'Mucho más que un simple alojamiento. Este lugar único cuenta una historia propia y te transporta a otro mundo desde el momento de tu llegada.'],
  ['Alexis Hernandez', 5, 'El lugar me gustó mucho. Esta es su casa.'],
  ['ALEJANDRA MURCIA ORTIZ', 5, 'Habitaciones: 5. Servicio: 5.'],
  ['Martina Arte y Café', 5, 'Muchas gracias por la experiencia y la atención.'],
  ['Luisa Fernanda Becerra Carvajal', 5, 'Habitaciones: 5. Servicio: 5.'],
  ['Beatriz Eugenia Velez Sandoval', 5, 'Habitaciones: 5. Servicio: 5.'],
  ['Juan Camilo Montoya', 5, 'Me alegra que le haya gustado su estadía aquí.'],
  ['Andrea Velasquezandrea', 5, 'Calificación de 5 estrellas en Google.'],
  ['Leidy Hurtado', 5, 'Calificación de 5 estrellas en Google.']
];

const footer = document.querySelector('.footer');
if (footer && !footer.querySelector('.admin-link')) {
  const adminLink = document.createElement('a');
  adminLink.className = 'admin-link';
  adminLink.href = '/admin.html';
  adminLink.textContent = 'Panel administrador';
  footer.append(adminLink);
}

const testimonials = document.querySelector('#testimonios');
const main = document.querySelector('main');
if (testimonials && main) main.append(testimonials);

const quoteFeature = document.querySelector('.quote-feature');
if (quoteFeature) {
  const wrapper = document.createElement('div');
  wrapper.className = 'manual-reviews';
  manualReviews.forEach(([author, rating, text]) => {
    const article = document.createElement('article');
    article.className = 'manual-review';
    article.dataset.rating = String(rating);
    article.innerHTML = `<div class="manual-review-stars" aria-label="${rating} de 5 estrellas">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div><blockquote></blockquote><cite>${author} · Google Maps</cite>`;
    article.querySelector('blockquote').textContent = text;
    wrapper.append(article);
  });
  const filters = document.createElement('div');
  filters.className = 'review-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filtrar reseñas por estrellas');
  [['5', '★★★★★'], ['4', '★★★★☆'], ['1', '★☆☆☆☆']].forEach(([value, label], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.filter = value;
    button.className = index === 0 ? 'is-active' : '';
    button.setAttribute('aria-label', `${value} estrellas`);
    button.textContent = label;
    filters.append(button);
  });
  const moreButton = document.createElement('button');
  moreButton.type = 'button';
  moreButton.className = 'review-more';
  moreButton.textContent = 'Ver más reseñas';
  filters.append(moreButton);
  let activeFilter = '5';
  let showAll = false;
  function updateReviews() {
    const matching = [...wrapper.querySelectorAll('.manual-review')].filter((review) => review.dataset.rating === activeFilter);
    wrapper.querySelectorAll('.manual-review').forEach((review) => review.classList.add('is-hidden'));
    matching.slice(0, showAll ? matching.length : 3).forEach((review) => review.classList.remove('is-hidden'));
    moreButton.classList.toggle('is-hidden', matching.length <= 3 || showAll);
  }
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button === moreButton) { showAll = true; updateReviews(); return; }
    filters.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    activeFilter = button.dataset.filter;
    showAll = false;
    updateReviews();
  });
  quoteFeature.parentNode.insertBefore(filters, quoteFeature);
  quoteFeature.replaceWith(wrapper);
  updateReviews();
}
