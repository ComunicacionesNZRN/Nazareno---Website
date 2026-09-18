/* ========================================================================
  1. NAVEGACION GLOBAL Y ESTADO DEL ENCABEZADO
  ======================================================================== */
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const header = document.querySelector("[data-header]");

// Acceso global seguro a Supabase (compatible con cualquier cliente inicializado)
const getSupabaseClient = () => window._supabase || window.supabaseClient || window.supabaseAdmin?.client;

if (!document.querySelector('link[href*="font-awesome"]')) {
  const iconStylesheet = document.createElement("link");
  iconStylesheet.rel = "stylesheet";
  iconStylesheet.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
  document.head.appendChild(iconStylesheet);
}

const primaryNavigation = [
  ["Donación", "donar.html"],
  ["Grupos", "grupos.html"],
  ["Servir", "ministerios.html"],
  ["Actividades", "eventos.html"],
  ["Conócenos", "nosotros.html"],
];

const utilityNavigation = [
  ["Inicio", "index.html"],
  ["Visítanos", "visitanos.html"],
  ["Primera vez", "primera-vez.html"],
  ["Recursos", "devocional.html"],
  ["Grupos", "grupos.html"],
  ["En vivo y prédicas", "mensajes.html"],
  ["Contacto", "contacto.html"],
];

const currentPage = window.location.pathname.split("/").pop() || "index.html";

const navigationMarkup = (items, numbered = false) =>
  items
    .map(
      ([label, href], index) =>
        `<a${href === currentPage ? ' class="active"' : ""} href="${href}">${label}${numbered ? ` <small>${String(index + 1).padStart(2, "0")}</small>` : ""}</a>`,
    )
    .join("");

if (header) {
  const mainNavigation = header.querySelector(".main-nav");
  if (mainNavigation) {
    // Antes de reconstruir los enlaces, guardamos la barra de búsqueda que
    // vive dentro de .main-nav para no perderla al reemplazar el innerHTML.
    const searchForm = mainNavigation.querySelector(".site-search");
    mainNavigation.innerHTML = navigationMarkup(primaryNavigation);
    if (searchForm) mainNavigation.prepend(searchForm);
  }
}

/* ========================================================================
  CARRUSEL INTERACTIVO DE PORTADA ("DESCUBRE MÁS MANERAS DE CONECTAR")
  ======================================================================== */
const connectCarousel = document.querySelector("[data-connect-carousel]");
const connectDots = document.querySelector("[data-connect-dots]");
let connectItems = [];
let connectIndex = 0;
let connectAnimationTimer;

const CONNECT_GAP = "var(--connect-gap, 24px)";
const connectTransformFor = (state) =>
  state === "active" ? "translateX(-50%)" :
  state === "prev" ? `translateX(calc(-150% - ${CONNECT_GAP}))` :
  state === "next" ? `translateX(calc(50% + ${CONNECT_GAP}))` :
  `translateX(calc(50% + ${CONNECT_GAP}))`;

const connectTitleSize = (title = "") =>
  title.length > 42 ? "clamp(30px, 4vw, 58px)" :
  title.length > 26 ? "clamp(35px, 5vw, 70px)" :
  "clamp(40px, 6vw, 84px)";

const applyConnectTitleSize = () =>
  connectCarousel?.querySelectorAll(".discover-card").forEach((slide) => {
    const title = slide.querySelector(".discover-card-overlay strong, :scope > strong");
    if (title) slide.style.setProperty("--connect-title-size", connectTitleSize(title.textContent.trim()));
  });

const updateConnectCarousel = () => {
  if (!connectCarousel) return;
  const slides = connectCarousel.querySelectorAll(".discover-card");
  const total = slides.length;
  if (!total) return;

  // Ajustar índice de forma segura
  connectIndex = (connectIndex % total + total) % total;

  slides.forEach((slide, index) => {
    const previous = (connectIndex - 1 + total) % total;
    const next = (connectIndex + 1) % total;
    const state =
      index === connectIndex ? "active" :
      index === previous ? "prev" :
      index === next ? "next" :
      "hidden";

    slide.classList.toggle("is-active", index === connectIndex);
    slide.classList.toggle("is-prev", index === previous);
    slide.classList.toggle("is-next", index === next);
    slide.style.display = state === "hidden" ? "none" : "flex";
    slide.style.setProperty("opacity", state === "active" ? "1" : "0.62", "important");
    slide.style.pointerEvents = state === "hidden" ? "none" : "auto";
    slide.style.zIndex = state === "active" ? "2" : "1";
    slide.style.setProperty("transform", connectTransformFor(state), "important");
  });

  connectDots?.querySelectorAll("[data-connect-dot]").forEach((dot, index) =>
    dot.classList.toggle("is-active", index === connectIndex)
  );

  connectCarousel.style.setProperty("--connect-index", connectIndex);
  applyConnectTitleSize();

  window.clearTimeout(connectAnimationTimer);
  connectAnimationTimer = window.setTimeout(() => {
    slides.forEach((slide, index) => {
      const previous = (connectIndex - 1 + total) % total;
      const next = (connectIndex + 1) % total;
      const state =
        index === connectIndex ? "active" :
        index === previous ? "prev" :
        index === next ? "next" :
        "hidden";
      slide.style.setProperty("transform", connectTransformFor(state), "important");
      slide.style.transition = "none";
    });
    window.requestAnimationFrame(() =>
      slides.forEach((slide) => {
        slide.style.transition = "";
      })
    );
  }, 620);
};

const prevSlide = () => {
  const slides = connectCarousel?.querySelectorAll(".discover-card");
  const total = slides?.length || connectItems.length;
  if (!total) return;
  connectIndex = (connectIndex - 1 + total) % total;
  updateConnectCarousel();
};

const nextSlide = () => {
  const slides = connectCarousel?.querySelectorAll(".discover-card");
  const total = slides?.length || connectItems.length;
  if (!total) return;
  connectIndex = (connectIndex + 1) % total;
  updateConnectCarousel();
};

// Enlazar botones prev y next
document.querySelectorAll("[data-connect-prev]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    prevSlide();
  });
});

document.querySelectorAll("[data-connect-next]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextSlide();
  });
});

const renderConnectCarousel = (items) => {
  if (!connectCarousel || !items.length) return;
  connectItems = items;
  connectCarousel.innerHTML = items
    .map(
      (item, index) =>
        `<a class="discover-card ${index === 0 ? "is-active" : ""}" href="${item.link_url || "contacto.html"}" data-connect-slide="${index}">
          <img src="${item.image_url || "Media/01.jpg"}" alt="${item.image_alt || item.titulo}" />
          <span class="discover-card-overlay">
            <small>${item.eyebrow || (item.tipo === "fijo" ? "Actividad fija" : "Actividad del mes")}</small>
            <strong>${item.titulo}</strong>
            <span>${item.descripcion || "Conoce más sobre esta actividad"} ↗</span>
          </span>
        </a>`
    )
    .join("");

  if (connectDots) {
    connectDots.innerHTML = items
      .map(
        (_, index) =>
          `<button type="button" class="discover-connect-dot${index === 0 ? " is-active" : ""}" data-connect-dot="${index}" aria-label="Ver contenido ${index + 1}"></button>`
      )
      .join("");
  }

  // Permitir hacer clic directamente sobre las tarjetas laterales para avanzar o retroceder
  connectCarousel.querySelectorAll("[data-connect-slide]").forEach((slide) =>
    slide.addEventListener("click", (event) => {
      const targetIndex = Number(slide.dataset.connectSlide);
      if (targetIndex !== connectIndex) {
        event.preventDefault();
        connectIndex = targetIndex;
        updateConnectCarousel();
      }
    })
  );

  connectDots?.querySelectorAll("[data-connect-dot]").forEach((dot) =>
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      connectIndex = Number(dot.dataset.connectDot);
      updateConnectCarousel();
    })
  );

  updateConnectCarousel();
};

const loadConnectCarousel = async () => {
  const sb = getSupabaseClient();
  if (!connectCarousel || !sb) return;
  try {
    const month = new Date().getMonth() + 1;
    const { data, error } = await sb
      .from("carrusel_conexion")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error || !data?.length) return;
    const currentItems = data.filter((item) => item.tipo === "fijo" || item.mes === month);
    if (currentItems.length) renderConnectCarousel(currentItems);
  } catch (err) {
    console.warn("Aviso carrusel:", err);
  }
};

// Inicialización de respaldo si hay tarjetas estáticas en el HTML
if (connectCarousel) {
  const fallbackSlides = [...connectCarousel.querySelectorAll(".discover-card")];
  if (fallbackSlides.length) {
    connectItems = fallbackSlides;
    fallbackSlides.forEach((slide, index) => {
      slide.dataset.connectSlide = index;
    });

    if (connectDots) {
      connectDots.innerHTML = fallbackSlides
        .map(
          (_, index) =>
            `<button type="button" class="discover-connect-dot${index === 0 ? " is-active" : ""}" data-connect-dot="${index}" aria-label="Ver contenido ${index + 1}"></button>`
        )
        .join("");
    }

    fallbackSlides.forEach((slide) =>
      slide.addEventListener("click", (event) => {
        const targetIndex = Number(slide.dataset.connectSlide);
        if (targetIndex !== connectIndex) {
          event.preventDefault();
          connectIndex = targetIndex;
          updateConnectCarousel();
        }
      })
    );

    connectDots?.querySelectorAll("[data-connect-dot]").forEach((dot) =>
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        connectIndex = Number(dot.dataset.connectDot);
        updateConnectCarousel();
      })
    );

    updateConnectCarousel();
  }
  loadConnectCarousel();
}

/* ========================================================================
  MENÚ LATERAL MÓVIL Y ACCIONES
  ======================================================================== */
if (mobileNav) {
  const menuSections = [
    ["Participa", [
      ["Visítanos", "Horarios y ubicación", "visitanos.html", "fa-house"],
      ["En vivo y prédicas", "Conéctate desde donde estés", "mensajes.html", "fa-play"],
      ["Grupos", "Crece en comunidad", "grupos.html", "fa-people-group"],
      ["Donación", "Generosidad en acción", "donar.html", "fa-heart"],
      ["Servir", "Pon tus dones en movimiento", "ministerios.html", "fa-hands-helping"],
      ["Actividades", "Próximos encuentros", "eventos.html", "fa-calendar-days"],
    ]],
    ["Descubre", [
      ["Primera vez", "Todo lo que necesitas saber", "primera-vez.html", "fa-compass"],
      ["Recursos", "Devocionales y materiales", "devocional.html", "fa-book-open"],
      ["Bautismos", "Celebra tu decisión de seguir a Jesús", "contacto.html", "fa-cross"],
    ]],
    ["Conócenos", [
      ["Nuestra iglesia", "Conoce nuestra historia y misión", "nosotros.html", "fa-church"],
      ["Contacto", "Hablemos por WhatsApp", "contacto.html", "fa-message"],
    ]],
  ];
  const menuSectionMarkup = menuSections
    .map(
      ([heading, items]) =>
        `<section class="menu-section"><h2>${heading}</h2><div class="menu-section-items">${items
          .map(
            ([label, description, href, icon]) =>
              `<a class="menu-item" href="${href}"><span class="menu-item-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><span><strong>${label}</strong><small>${description}</small></span><b aria-hidden="true">↗</b></a>`
          )
          .join("")}</div></section>`
    )
    .join("");

  mobileNav.innerHTML = `<div class="mobile-nav-head"><div><span class="nav-kicker">Explora Nazareno</span><h2>Encuentra tu<br /><em>lugar.</em></h2></div><span class="nav-menu-label">MENÚ</span></div><p class="mobile-nav-intro">Conecta con la iglesia, encuentra información y da tu próximo paso.</p>${menuSectionMarkup}<div class="mobile-nav-contact"><strong>Hablemos</strong><a href="https://wa.link/62syyk" target="_blank" rel="noreferrer">WhatsApp ↗</a><p>Cali · Colombia</p></div>`;
}

if (header) {
  const headerActions = header.querySelector(".header-actions");
  headerActions?.querySelectorAll(".header-cta, .live-pill").forEach((element) => element.remove());
}

const mainContent = document.querySelector("main");
if (mainContent) {
  mainContent.id = mainContent.id || "contenido-principal";
  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = `#${mainContent.id}`;
  skipLink.textContent = "Saltar al contenido principal";
  document.body.prepend(skipLink);
}

const setMenu = (open) => {
  if (!menuButton || !mobileNav) return;
  const menuLines = menuButton.querySelectorAll("span");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  mobileNav.setAttribute("aria-hidden", String(!open));
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  if (menuLines.length) {
    menuLines[0].style.transform = open ? "translateY(7px) rotate(45deg)" : "";
    menuLines[menuLines.length - 1].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
    if (menuLines.length > 2) {
      menuLines[1].style.opacity = open ? "0" : "";
    }
  }
};

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
}

const updateHeader = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ========================================================================
  2. TITULOS ANIMADOS SEGUN EL SCROLL
  ======================================================================== */
const scrollTitles = document.querySelectorAll(
  ".hero h1, .manifesto h2, .community-heading h2, .visit h2, .media-intro h2, .groups-intro h2, .inner-hero h1, .inner-band h2, .info-panel h2, .contact-grid h2, .feature-list h2, .feature-list h3, .dedicated-player .media-caption h2",
);
let scrollTitlesTicking = false;

const updateScrollTitles = () => {
  scrollTitles.forEach((title) => {
    const bounds = title.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, (window.innerHeight * 0.82 - bounds.top) / (window.innerHeight * 0.48)),
    );
    title.style.setProperty("--title-progress", progress.toFixed(3));
  });
  scrollTitlesTicking = false;
};

const requestScrollTitlesUpdate = () => {
  if (!scrollTitlesTicking) {
    scrollTitlesTicking = true;
    window.requestAnimationFrame(updateScrollTitles);
  }
};

updateScrollTitles();
window.addEventListener("scroll", requestScrollTitlesUpdate, { passive: true });

/* ========================================================================
  3. PESTAÑAS DE CONTENIDO AUDIOVISUAL DE LA PORTADA
  ======================================================================== */
const tabs = document.querySelectorAll("[data-media-tab]");
const panels = document.querySelectorAll("[data-media-panel]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.mediaTab;

    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.mediaPanel === target;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

/* ========================================================================
  4. REPRODUCTORES DE LA PAGINA DE MENSAJES
  ======================================================================== */
const dedicatedPlayer = document.querySelector(".dedicated-player");

if (dedicatedPlayer) {
  const dedicatedLead = dedicatedPlayer.previousElementSibling?.querySelector(".inner-lead");
  if (dedicatedLead) {
    dedicatedLead.textContent = "Escoge entre el mensaje editado o la experiencia completa de nuestra última transmisión.";
  }
  dedicatedPlayer.innerHTML = `
    <div class="media-tabs inner-media-tabs" role="tablist" aria-label="Opciones de reproducción">
      <button class="media-tab is-active" type="button" role="tab" id="sermon-tab" aria-selected="true" aria-controls="sermon-panel" data-media-tab="sermon">Mirar prédica</button>
      <button class="media-tab" type="button" role="tab" id="experience-tab" aria-selected="false" aria-controls="experience-panel" data-media-tab="experience">Mirar experiencia completa</button>
    </div>
    <div class="media-panel is-active" role="tabpanel" id="sermon-panel" aria-labelledby="sermon-tab" data-media-panel="sermon">
      <div class="player-shell">
        <iframe title="Prédica editada de la Iglesia del Nazareno Cali" src="https://www.youtube.com/embed/kZNdlw4Z4Nw?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <div class="media-caption">
        <div><p class="eyebrow">Mirar prédica</p><h2>El mensaje, directo al corazón.</h2></div>
        <a class="button button-dark" href="https://www.youtube.com/watch?v=kZNdlw4Z4Nw" target="_blank" rel="noreferrer">Mirar en YouTube <span>↗</span></a>
      </div>
    </div>
    <div class="media-panel" role="tabpanel" id="experience-panel" aria-labelledby="experience-tab" hidden data-media-panel="experience">
      <div class="player-shell">
        <iframe title="Experiencia completa de la Iglesia del Nazareno Cali" src="https://www.youtube.com/embed/LWOoJB_YuL8?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <div class="media-caption">
        <div><p class="eyebrow">Mirar experiencia completa</p><h2>Alabanza, prédica y despedida en una sola experiencia.</h2></div>
        <a class="button button-dark" href="https://www.youtube.com/watch?v=LWOoJB_YuL8" target="_blank" rel="noreferrer">Mirar en YouTube <span>↗</span></a>
      </div>
    </div>`;

  const dedicatedTabs = dedicatedPlayer.querySelectorAll("[data-media-tab]");
  const dedicatedPanels = dedicatedPlayer.querySelectorAll("[data-media-panel]");
  dedicatedTabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      dedicatedTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      dedicatedPanels.forEach((panel) => {
        const active = panel.dataset.mediaPanel === tab.dataset.mediaTab;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    })
  );
}

/* ========================================================================
  5. EVENTOS (PORTADA BANNER + GRID ELEVATION EN EVENTOS.HTML)
  ======================================================================== */
const eventosData = [
  { id: "1", titulo: "Celebraciones de domingo", fecha: "2026-09-20", hora: "08:15:00", ubicacion: "Sede Principal Cali", estado: "proximo", link_registro: "visitanos.html", imagen_fondo: "Media/01.jpg" },
  { id: "2", titulo: "Reunión de jóvenes JNI", fecha: "2026-09-26", hora: "17:30:00", ubicacion: "Auditorio Juvenil", estado: "proximo", link_registro: "ministerios.html", imagen_fondo: "Media/03.jpg" },
  { id: "3", titulo: "Grupos de conexión", fecha: "2026-09-22", hora: "19:00:00", ubicacion: "Varios sectores de Cali", estado: "proximo", link_registro: "grupos.html", imagen_fondo: "Media/06.jpg" }
];

const eventStatusLabels = { proximo: "Próximo", "próximo": "Próximo", agotado: "Cupos agotados", finalizado: "Finalizado", cancelado: "Cancelado" };

const formatPublicTime = (time) => {
  if (!time) return "";
  const parts = String(time).split(":");
  if (!parts[0]) return time;
  const hour = parseInt(parts[0], 10);
  const ampm = hour >= 12 ? "p. m." : "a. m.";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${parts[1] || "00"} ${ampm}`;
};

const renderElevationEvents = (events) => {
  const featuredSlot = document.querySelector("[data-featured-event-slot]");
  const gridContainer = document.querySelector(".events-elevation-grid");

  if (!gridContainer && !featuredSlot) return;

  const featuredEvent = events.find((e) => e.es_destacado) || events[0];
  const otherEvents = events.filter((e) => e.id !== featuredEvent?.id);

  if (featuredSlot && featuredEvent) {
    featuredSlot.innerHTML = `
      <div class="event-hero-banner" style="background-image: url('${featuredEvent.imagen_fondo || 'Media/01.jpg'}')">
        <div class="event-hero-content">
          <div class="event-hero-info">
            <span class="event-hero-tag">★ Evento Destacado</span>
            <h2>${featuredEvent.titulo}</h2>
            ${featuredEvent.descripcion ? `<p>${featuredEvent.descripcion}</p>` : ""}
            <div class="event-hero-meta">
              <span><i class="fa-regular fa-calendar"></i> ${formatPublicDate(featuredEvent.fecha)}</span>
              <span><i class="fa-regular fa-clock"></i> ${formatPublicTime(featuredEvent.hora)}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${featuredEvent.ubicacion || "Sede Cali"}</span>
              ${featuredEvent.requisitos ? `<span><i class="fa-solid fa-circle-info"></i> ${featuredEvent.requisitos}</span>` : ""}
            </div>
          </div>
          <div class="event-hero-actions">
            <a class="button button-light" href="${featuredEvent.link_registro || 'contacto.html'}">
              ${featuredEvent.link_registro ? 'Registrarme' : 'Más información'} <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  if (gridContainer) {
    const listToRender = otherEvents.length ? otherEvents : events;
    gridContainer.innerHTML = listToRender
      .map(
        (event) => `
      <a class="event-elevation-card" href="${event.link_registro || 'contacto.html'}">
        <div class="event-elevation-thumb">
          <img src="${event.imagen_fondo || 'Media/02.jpg'}" alt="${event.titulo}" loading="lazy" />
          <span class="event-elevation-status ${event.estado || 'proximo'}">${eventStatusLabels[event.estado] || event.estado || 'Próximo'}</span>
        </div>
        <div class="event-elevation-body">
          <h3>${event.titulo}</h3>
          <p class="event-elevation-location">${event.ubicacion || 'Sede Principal Cali'}</p>
          <div class="event-elevation-details">
            <span><i class="fa-regular fa-calendar"></i> ${formatPublicDate(event.fecha)}</span>
            <span><i class="fa-regular fa-clock"></i> ${formatPublicTime(event.hora)}</span>
            ${event.requisitos ? `<span><i class="fa-solid fa-circle-check"></i> ${event.requisitos}</span>` : ""}
          </div>
        </div>
      </a>`
      )
      .join("");
  }
};

const loadPublicEvents = async () => {
  const isEventsPage = document.querySelector(".events-elevation-grid") || document.querySelector("[data-featured-event-slot]");
  const sb = getSupabaseClient();

  if (sb) {
    try {
      const { data, error } = await sb.from("eventos").select("*").order("fecha", { ascending: true });
      if (!error && data && data.length) {
        if (isEventsPage) renderElevationEvents(data);
        return;
      }
    } catch (e) {
      console.warn("Aviso eventos:", e);
    }
  }

  if (isEventsPage) renderElevationEvents(eventosData);
};

loadPublicEvents();

/* ========================================================================
  6. DEVOCIONALES Y FECHAS
  ======================================================================== */
const devotionalDate = document.querySelector("#devotional-date");

if (devotionalDate) {
  devotionalDate.textContent = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

const loadPublishedDevotional = async () => {
  const devotionalSection = document.querySelector("[data-public-devotional]");
  const sb = getSupabaseClient();
  if (!devotionalSection || !sb) return;

  try {
    const { data } = await sb
      .from("devocionales")
      .select("titulo, resumen, contenido, imagen_url, publicar_at")
      .eq("publicado", true)
      .lte("publicar_at", new Date().toISOString())
      .order("publicar_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return;
    const title = document.querySelector("#today-title");
    const copy = document.querySelector("#devotional-copy");
    if (title) title.textContent = data.titulo;
    if (copy) copy.textContent = data.resumen || data.contenido;
  } catch (err) {
    console.warn("Aviso devocional:", err);
  }
};

loadPublishedDevotional();

/* ========================================================================
  7. REVELADO PROGRESIVO DE ELEMENTOS (.reveal)
  ======================================================================== */
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.08 },
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const heroTextEl = document.querySelector(".hero-video-copy");
if (heroTextEl) {
  heroTextEl.style.opacity = "1";
  heroTextEl.style.visibility = "visible";
}

/* ========================================================================
  8. MINISTERIOS, DONACIONES, BANCOS, COPIA Y ORACION
  ======================================================================== */
const ministryData = [
  { title: "Niños", audience: "Niños", promise: "Un lugar seguro, alegre y preparado para conocer a Jesús y hacer amigos.", link: "contacto.html" },
  { title: "Jóvenes JNI", audience: "Jóvenes", promise: "Conversaciones honestas, comunidad y fe en movimiento.", link: "eventos.html" },
  { title: "Familias", audience: "Familias", promise: "Acompañamiento para crecer en la fe y construir comunidad en casa.", link: "contacto.html" },
  { title: "Servicio", audience: "Familias", promise: "Usa tus dones para cuidar personas y servir a nuestra ciudad.", link: "contacto.html" },
];

const ministryList = document.querySelector("[data-ministry-list]");
const renderMinistries = (audience = "Todos") => {
  if (!ministryList) return;
  ministryList.innerHTML = "";
  ministryData
    .filter((ministry) => audience === "Todos" || ministry.audience === audience)
    .forEach((ministry, index) => {
      const article = document.createElement("article");
      article.dataset.audience = ministry.audience;
      article.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><h2>${ministry.title}</h2><p>${ministry.promise}</p><a class="text-link" href="${ministry.link}">Quiero conocer más <span>↗</span></a>`;
      ministryList.appendChild(article);
    });
};
renderMinistries();

document.querySelectorAll("[data-ministry-filter]").forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    document.querySelectorAll("[data-ministry-filter]").forEach((button) => button.classList.toggle("is-active", button === filterButton));
    renderMinistries(filterButton.dataset.ministryFilter);
  });
});

document.querySelectorAll("[data-donation-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.donationTab;
    document.querySelectorAll("[data-donation-tab]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-donation-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.donationPanel !== target;
      panel.classList.toggle("is-active", !panel.hidden);
    });
  });
});

document.querySelectorAll("[data-bank-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.bankTab;
    document.querySelectorAll("[data-bank-tab]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-bank-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.bankPanel !== target;
      panel.classList.toggle("is-active", !panel.hidden);
    });
  });
});

document.querySelectorAll("[data-copy-target]").forEach((copyButton) => {
  copyButton.addEventListener("click", async () => {
    const value = copyButton.dataset.copyTarget;
    try {
      await navigator.clipboard.writeText(value);
      copyButton.textContent = "Copiado";
    } catch {
      copyButton.textContent = "Selecciona el texto";
    }
  });
});

const prayerForm = document.querySelector("[data-prayer-form]");
if (prayerForm) {
  prayerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = prayerForm.querySelector("[data-form-status]");
    if (!prayerForm.checkValidity()) {
      prayerForm.reportValidity();
      if (status) status.textContent = "Revisa los campos antes de enviar.";
      return;
    }
    if (status) status.textContent = "Gracias. Recibimos tu pedido de oración.";
    prayerForm.reset();
  });
}

/* ========================================================================
  9. GRUPOS DE CONEXION Y MAPA (RECARGA INTELIGENTE SIN CUADROS ROTOS)
  ======================================================================== */
const mapElement = document.querySelector("#groups-map");
const groupsResults = document.querySelector("[data-groups-results]");
const groupCount = document.querySelector("[data-group-count]");
const groupSearch = document.querySelector("#group-search");

let groupsMapInstance = null;

const getZoneCoordinates = (zona = "", index = 0) => {
  const z = String(zona).toLowerCase();
  if (z.includes("sur") || z.includes("lili")) return [3.3720 + (index * 0.003), -76.5310];
  if (z.includes("norte") || z.includes("flora")) return [3.4750 + (index * 0.003), -76.5260];
  if (z.includes("oeste") || z.includes("peñon")) return [3.4480 + (index * 0.003), -76.5420];
  if (z.includes("oriente") || z.includes("aguablanca")) return [3.4210 + (index * 0.003), -76.4980];
  return [3.4341 + ((index % 2 === 0 ? 1 : -1) * 0.005 * index), -76.5455 + ((index % 2 === 0 ? -1 : 1) * 0.004 * index)];
};

const initGroupsApp = async () => {
  if (!mapElement || !window.L) return;

  if (groupsMapInstance) {
    groupsMapInstance.remove();
    groupsMapInstance = null;
  }

  // 1. Crear mapa de Leaflet
  const groupsMap = L.map("groups-map", {
    scrollWheelZoom: false,
    zoomControl: true,
    fadeAnimation: true
  }).setView([3.435, -76.535], 12);

  groupsMapInstance = groupsMap;

  // 2. OpenStreetMap oficial (100% libre y sin claves API)
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    tileSize: 256
  }).addTo(groupsMap);

  // Forzar a Leaflet a calcular el tamaño real de todos sus cuadros
  const fullMapRefresh = () => {
    if (groupsMap) {
      groupsMap.invalidateSize(true);
    }
  };

  // Reintentos automáticos
  setTimeout(fullMapRefresh, 100);
  setTimeout(fullMapRefresh, 500);
  setTimeout(fullMapRefresh, 1000);
  window.addEventListener("resize", fullMapRefresh);

  // Observador ANTICIPADO para index.html: precarga los cuadros 300px antes de llegar con el scroll
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fullMapRefresh();
        }
      });
    },
    { rootMargin: "300px 0px 300px 0px", threshold: 0.01 }
  );

  const parentSection = document.querySelector("#grupos") || mapElement;
  sectionObserver.observe(parentSection);

  // También recalcular con el scroll de la ventana
  window.addEventListener("scroll", () => {
    const bounds = mapElement.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      fullMapRefresh();
    }
  }, { passive: true });

  // 3. Cargar grupos de Supabase (sin direcciones exactas por seguridad)
  let activeGroups = [];
  const sb = getSupabaseClient();

  if (sb) {
    try {
      const { data, error } = await sb
        .from("grupos_conexion")
        .select("*")
        .eq("estado", "activo")
        .order("created_at", { ascending: false });

      if (!error && data) {
        activeGroups = data.map((g) => {
          const nameFinal = g.nombre || g.nombre_grupo || "Grupo de conexión";
          return {
            id: g.id,
            name: nameFinal,
            zone: g.zona || "Cali",
            day: [g.dia, g.hora ? formatPublicTime(g.hora) : ""].filter(Boolean).join(" · ") || "Por confirmar",
            leader: g.lider || "Líder de grupo",
            contact: g.contacto?.startsWith("http") ? g.contacto : (g.contacto ? `https://wa.me/${g.contacto.replace(/\D/g, '')}` : "contacto.html"),
            lat: Number(g.lat) || 3.435,
            lng: Number(g.lng) || -76.535
          };
        });
      }
    } catch (err) {
      console.error("Error cargando grupos de Supabase:", err);
    }
  }

  // 4. Marcadores en el mapa
  const markerIcon = L.divIcon({
    className: "custom-map-marker",
    html: `<div class="marker-pin"><i class="fa-solid fa-church"></i></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });

  const markers = new Map();

  activeGroups.forEach((group) => {
    const popupContent = `
      <article class="group-popup">
        <strong>${group.name}</strong>
        <p><b>Zona:</b> ${group.zone}</p>
        <p><b>Horario:</b> ${group.day}</p>
        <p><b>Líder:</b> ${group.leader}</p>
        <a href="${group.contact}" target="_blank" rel="noreferrer">Solicitar dirección al líder ↗</a>
      </article>
    `;
    const marker = L.marker([group.lat, group.lng], { icon: markerIcon })
      .addTo(groupsMap)
      .bindPopup(popupContent);
    markers.set(group.name, marker);
  });

  const focusGroup = (group) => {
    if (!group) return;
    const marker = markers.get(group.name);
    groupsMap.flyTo([group.lat, group.lng], 15, { duration: 0.65 });
    if (marker) marker.openPopup();
    document
      .querySelectorAll(".group-result")
      .forEach((item) => item.classList.toggle("is-active", item.dataset.group === group.name));
  };

  // 5. Lista lateral y buscador
  const renderGroups = (query = "") => {
    if (!groupsResults) return;
    const normalized = query.trim().toLowerCase();
    const filtered = activeGroups.filter((group) =>
      `${group.name} ${group.zone} ${group.day} ${group.leader}`.toLowerCase().includes(normalized)
    );

    if (groupCount) {
      groupCount.textContent = `${filtered.length} grupo${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;
    }

    if (!filtered.length) {
      groupsResults.innerHTML = '<p style="padding: 24px 20px; color: #a8a5ad; font-size: 13px;">No hay grupos de conexión registrados actualmente.</p>';
      return;
    }

    groupsResults.innerHTML = filtered
      .map(
        (group) => `
        <button class="group-result" type="button" data-group="${group.name}">
          <strong>${group.name}</strong>
          <span>${group.zone} · ${group.day}</span>
          <small>Ver en el mapa ↗</small>
        </button>`
      )
      .join("");

    groupsResults.querySelectorAll(".group-result").forEach((button) =>
      button.addEventListener("click", () =>
        focusGroup(activeGroups.find((group) => group.name === button.dataset.group))
      )
    );
  };

  renderGroups();

  if (groupSearch) {
    groupSearch.addEventListener("input", (event) => renderGroups(event.target.value));
  }
};

initGroupsApp();

/* ========================================================================
  11. FORMULARIO DE BOLETÍN EN EL FOOTER
  ======================================================================== */
const footerNewsletterForm = document.querySelector("[data-footer-newsletter]");
if (footerNewsletterForm) {
  footerNewsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const statusEl = footerNewsletterForm.querySelector("[data-newsletter-status]");
    if (statusEl) {
      statusEl.textContent = "¡Gracias por suscribirte! Te mantendremos informado.";
      footerNewsletterForm.reset();
      setTimeout(() => {
        statusEl.textContent = "";
      }, 6000);
    }
  });
}