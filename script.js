/* ========================================================================
  1. NAVEGACION GLOBAL Y ESTADO DEL ENCABEZADO
  ======================================================================== */
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const header = document.querySelector("[data-header]");

if (!document.querySelector('link[href*="font-awesome"]')) {
  const iconStylesheet = document.createElement("link");
  iconStylesheet.rel = "stylesheet";
  iconStylesheet.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
  document.head.appendChild(iconStylesheet);
}

const primaryNavigation = [
  ["Inicio", "index.html"],
  ["Reuniones", "visitanos.html"],
  ["¿Es tu primera vez?", "primera-vez.html"],
  ["Ministerios", "ministerios.html"],
  ["Eventos", "eventos.html"],
  ["Recursos", "devocional.html"],
  ["Nosotros", "nosotros.html"],
];
const utilityNavigation = [
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
    mainNavigation.innerHTML = navigationMarkup(primaryNavigation);
  }
}
if (mobileNav) {
  mobileNav.innerHTML = `<div class="mobile-nav-head"><span>Explora Nazareno</span><span>MENÚ</span></div>${navigationMarkup([...primaryNavigation, ...utilityNavigation], true)}<a class="mobile-live" href="mensajes.html"><span class="live-dot"></span> Ver la transmisión</a><div class="mobile-nav-contact"><strong>Hablemos</strong><a href="https://wa.link/62syyk" target="_blank" rel="noreferrer">WhatsApp ↗</a><p>Cali · Colombia</p></div>`;
}

if (header) {
  const headerActions = header.querySelector(".header-actions");
  const oldHeaderCta = headerActions?.querySelector('.header-cta[href="visitanos.html"]');
  oldHeaderCta?.remove();
  if (headerActions && !headerActions.querySelector('a.header-cta[href="donar.html"]')) {
    const donateLink = document.createElement("a");
    donateLink.className = "header-cta";
    donateLink.href = "donar.html";
    donateLink.innerHTML = 'Donar <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>';
    headerActions.insertBefore(donateLink, headerActions.firstChild);
  }
  if (headerActions && !headerActions.querySelector('a.header-cta[href="visitanos.html"]')) {
    const visitLink = document.createElement("a");
    visitLink.className = "header-cta header-cta-secondary";
    visitLink.href = "visitanos.html";
    visitLink.innerHTML = 'Planifica tu visita <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>';
    headerActions.appendChild(visitLink);
  }
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
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  mobileNav.setAttribute("aria-hidden", String(!open));
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
};

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ========================================================================
  2. TITULOS ANIMADOS SEGUN EL SCROLL
  ======================================================================== */
const scrollTitles = document.querySelectorAll(
  ".hero h1, .manifesto h2, .community-heading h2, .visit h2, .agenda-head h2, .media-intro h2, .groups-intro h2, .inner-hero h1, .inner-band h2, .info-panel h2, .contact-grid h2, .feature-list h2, .feature-list h3, .event-calendar h2, .dedicated-player .media-caption h2",
);
let scrollTitlesTicking = false;

const updateScrollTitles = () => {
  scrollTitles.forEach((title) => {
    const bounds = title.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(
        0,
        (window.innerHeight * 0.82 - bounds.top) / (window.innerHeight * 0.48),
      ),
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
  3. PESTANAS DE CONTENIDO AUDIOVISUAL DE LA PORTADA
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
  const dedicatedLead =
    dedicatedPlayer.previousElementSibling?.querySelector(".inner-lead");
  if (dedicatedLead) {
    dedicatedLead.textContent =
      "Escoge entre el mensaje editado o la experiencia completa de nuestra última transmisión.";
  }
  dedicatedPlayer.innerHTML = `<div class="media-tabs inner-media-tabs" role="tablist" aria-label="Opciones de reproducción"><button class="media-tab is-active" type="button" role="tab" id="sermon-tab" aria-selected="true" aria-controls="sermon-panel" data-media-tab="sermon">Mirar prédica</button><button class="media-tab" type="button" role="tab" id="experience-tab" aria-selected="false" aria-controls="experience-panel" data-media-tab="experience">Mirar experiencia completa</button></div><div class="media-panel is-active" role="tabpanel" id="sermon-panel" aria-labelledby="sermon-tab" data-media-panel="sermon"><div class="player-shell"><iframe title="Prédica editada de la Iglesia del Nazareno Cali" src="https://www.youtube.com/embed/kZNdlw4Z4Nw?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="media-caption"><div><p class="eyebrow">Mirar prédica</p><h2>El mensaje, directo al corazón.</h2></div><a class="button button-dark" href="https://www.youtube.com/watch?v=kZNdlw4Z4Nw" target="_blank" rel="noreferrer">Mirar en YouTube <span>↗</span></a></div></div><div class="media-panel" role="tabpanel" id="experience-panel" aria-labelledby="experience-tab" hidden data-media-panel="experience"><div class="player-shell"><iframe title="Experiencia completa de la Iglesia del Nazareno Cali" src="https://www.youtube.com/embed/LWOoJB_YuL8?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="media-caption"><div><p class="eyebrow">Mirar experiencia completa</p><h2>Alabanza, prédica y despedida en una sola experiencia.</h2></div><a class="button button-dark" href="https://www.youtube.com/watch?v=LWOoJB_YuL8" target="_blank" rel="noreferrer">Mirar en YouTube <span>↗</span></a></div></div>`;
  const dedicatedTabs = dedicatedPlayer.querySelectorAll("[data-media-tab]");
  const dedicatedPanels =
    dedicatedPlayer.querySelectorAll("[data-media-panel]");
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
    }),
  );
}

/* ========================================================================
  5. TARJETAS INTERACTIVAS DE EVENTOS
  ======================================================================== */
const eventosData = [
  { titulo: "Celebraciones de domingo", fecha: "Cada domingo", hora: "6:30 a. m. · 8:15 a. m. · 10:00 a. m. · 12:00 p. m.", estado: "próximo", link_registro: "primera-vez.html", imagen_fondo: "Media/01.jpg" },
  { titulo: "Reunión de jóvenes JNI", fecha: "Cada sábado", hora: "5:30 p. m.", estado: "próximo", link_registro: "ministerios.html", imagen_fondo: "Media/03.jpg" },
  { titulo: "Ayuno", fecha: "Cada miércoles", hora: "5:00 a. m.", estado: "próximo", link_registro: "contacto.html", imagen_fondo: "Media/04.jpg" },
  { titulo: "Noche de adoración", fecha: "Fecha por confirmar", hora: "Por confirmar", estado: "agotado", link_registro: "eventos.html", imagen_fondo: "Media/04.jpg" },
  { titulo: "Servicio especial", fecha: "Fecha anterior", hora: "Consulta novedades", estado: "finalizado", link_registro: "contacto.html", imagen_fondo: "Media/05.jpg" },
  { titulo: "Grupos de conexión", fecha: "Entre semana", hora: "Varias zonas de Cali", estado: "próximo", link_registro: "grupos.html", imagen_fondo: "Media/06.jpg" },
];

const eventStatusLabels = { próximo: "Próximo", agotado: "Cupos agotados", finalizado: "Finalizado", cancelado: "Cancelado" };
const renderEventCard = (eventData, compact = false) => {
  const card = document.createElement("a");
  card.className = "event";
  card.href = eventData.link_registro;
  card.dataset.status = eventData.estado;
  card.dataset.statusLabel = eventStatusLabels[eventData.estado] || eventData.estado;
  card.style.backgroundImage = `url("${eventData.imagen_fondo}")`;
  card.innerHTML = `<div class="event-overlay"><time class="event-meta">${eventData.fecha} · ${eventData.hora}</time><h3>${eventData.titulo}</h3><span class="event-more">${compact ? "Ver más" : "Conocer más"} <b>↗</b></span></div>`;
  return card;
};

const renderEventFeeds = (events) => {
  document.querySelectorAll("[data-event-feed]").forEach((eventFeed) => {
    eventFeed.classList.remove("event-calendar");
    eventFeed.classList.add("event-list");
    eventFeed.innerHTML = "";
    events.slice(0, 6).forEach((eventData) => {
      eventFeed.appendChild(renderEventCard(eventData, eventFeed.dataset.eventFeed === "home"));
    });
  });
};

const loadPublicEvents = async () => {
  if (!window._supabase) {
    renderEventFeeds(eventosData);
    return;
  }
  const { data, error } = await window._supabase
    .from("eventos")
    .select("*")
    .limit(6);
  renderEventFeeds(error ? eventosData : data || []);
};

loadPublicEvents();

if (window._supabase && document.querySelector("[data-event-feed]")) {
  window._supabase
    .channel("public-eventos-feed")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "eventos" },
      loadPublicEvents,
    )
    .subscribe();
}

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
  ministryData.filter((ministry) => audience === "Todos" || ministry.audience === audience).forEach((ministry, index) => {
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
      status.textContent = "Revisa los campos antes de enviar.";
      return;
    }
    status.textContent = "Gracias. Recibimos tu pedido de oración.";
    prayerForm.reset();
  });
}
// Actualiza la fecha visible del devocional local.
const devotionalDate = document.querySelector("#devotional-date");

if (devotionalDate) {
  devotionalDate.textContent = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/* ========================================================================
  6. FALLBACK PARA VIDEOS ABIERTOS COMO ARCHIVO LOCAL
  ======================================================================== */
// YouTube bloquea los iframes sin Referer cuando la pagina se abre como archivo local.
// En esa vista se muestra una miniatura funcional con acceso directo al video.
if (window.location.protocol === "file:") {
  const localSermonFrame = document.querySelector("#sermon-panel iframe");
  if (localSermonFrame) {
    const localSermonLink = document.createElement("a");
    localSermonLink.className = "local-video-fallback";
    localSermonLink.href = "https://youtu.be/kZNdlw4Z4Nw?si=HF3feUEWbyTApKJW";
    localSermonLink.target = "_blank";
    localSermonLink.rel = "noreferrer";
    localSermonLink.innerHTML = `<img src="https://img.youtube.com/vi/kZNdlw4Z4Nw/hqdefault.jpg" alt="Vista previa de la prédica en YouTube"><span>Ver prédica en YouTube <b>↗</b></span>`;
    localSermonFrame.replaceWith(localSermonLink);
  }
}

document.querySelectorAll("[data-media-target]").forEach((link) => {
  link.addEventListener("click", () => {
    const targetTab = document.querySelector(
      `[data-media-tab="${link.dataset.mediaTarget}"]`,
    );
    if (targetTab) targetTab.click();
  });
});

/* ========================================================================
  7. CONFIGURACION OPCIONAL DE TRANSMISION EN VIVO
  ======================================================================== */
// Reemplaza este valor por el ID de YouTube de la emision activa cuando haya un en vivo.
const liveVideoId = "";
const livePlayer = document.querySelector("[data-live-player] iframe");
const liveLabel = document.querySelector("[data-live-label]");

if (liveVideoId && livePlayer && liveLabel) {
  livePlayer.src = `https://www.youtube-nocookie.com/embed/${liveVideoId}?rel=0`;
  liveLabel.textContent = "En vivo ahora";
}

/* ========================================================================
  8. REVELADO PROGRESIVO DE ELEMENTOS
  ======================================================================== */
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 },
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));

/* ========================================================================
  9. DATOS DE GRUPOS DE CONEXION
  ======================================================================== */
// Reemplaza los ejemplos por informacion aprobada por cada lider.
// Por seguridad, la coordenada debe ser aproximada y la direccion detallada se comparte al contacto.
const connectionGroups = [
  {
    name: "Grupo San Fernando",
    zone: "San Fernando",
    day: "Martes · 7:00 p. m.",
    leader: "Líder por confirmar",
    network: "Red de 12 por confirmar",
    address: "Dirección por confirmar con el líder",
    contact: "contacto.html",
    lat: 3.4341,
    lng: -76.5455,
  },
  {
    name: "Grupo Valle del Lili",
    zone: "Valle del Lili",
    day: "Miércoles · 7:00 p. m.",
    leader: "Líder por confirmar",
    network: "Red de 12 por confirmar",
    address: "Dirección por confirmar con el líder",
    contact: "contacto.html",
    lat: 3.3678,
    lng: -76.5346,
  },
  {
    name: "Grupo La Flora",
    zone: "La Flora",
    day: "Jueves · 7:00 p. m.",
    leader: "Líder por confirmar",
    network: "Red de 12 por confirmar",
    address: "Dirección por confirmar con el líder",
    contact: "contacto.html",
    lat: 3.4809,
    lng: -76.5152,
  },
];

/* ========================================================================
  10. BUSCADOR, LISTADO Y MAPA INTERACTIVO
  ======================================================================== */
const mapElement = document.querySelector("#groups-map");
const groupsResults = document.querySelector("[data-groups-results]");
const groupCount = document.querySelector("[data-group-count]");
const groupSearch = document.querySelector("#group-search");

if (mapElement && window.L) {
  // Inicializacion del mapa y sus marcadores.
  const groupsMap = L.map("groups-map", { scrollWheelZoom: false }).setView(
    [3.425, -76.535],
    12,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(groupsMap);
  const markers = new Map();
  const markerIcon = L.divIcon({
    className: "group-pin",
    html: "<span>⌂</span>",
    iconSize: [42, 42],
    iconAnchor: [21, 38],
    popupAnchor: [0, -39],
  });

  // Plantilla de informacion mostrada al seleccionar un grupo.
  const popup = (group) =>
    `<article class="group-popup"><strong>${group.name}</strong><p><b>Zona</b><br>${group.zone}</p><p><b>Horario</b><br>${group.day}</p><p><b>Líder del grupo</b><br>${group.leader}</p><p><b>Red de 12</b><br>${group.network}</p><p><b>Dirección</b><br>${group.address}</p><a href="${group.contact}">Solicitar información ↗</a></article>`;
  connectionGroups.forEach((group) => {
    const marker = L.marker([group.lat, group.lng], { icon: markerIcon })
      .addTo(groupsMap)
      .bindPopup(popup(group));
    markers.set(group.name, marker);
  });

  // Sincroniza la seleccion de la lista con la vista del mapa.
  const focusGroup = (group) => {
    const marker = markers.get(group.name);
    groupsMap.flyTo([group.lat, group.lng], 15, { duration: 0.65 });
    marker.openPopup();
    document
      .querySelectorAll(".group-result")
      .forEach((item) =>
        item.classList.toggle("is-active", item.dataset.group === group.name),
      );
  };

  // Filtra y renderiza los grupos disponibles.
  const renderGroups = (query = "") => {
    const normalized = query.trim().toLocaleLowerCase("es");
    const filtered = connectionGroups.filter((group) =>
      `${group.name} ${group.zone} ${group.day} ${group.leader}`
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
    groupCount.textContent = `${filtered.length} grupo${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;
    groupsResults.innerHTML =
      filtered
        .map(
          (group) =>
            `<button class="group-result" type="button" data-group="${group.name}"><strong>${group.name}</strong><span>${group.zone} · ${group.day}</span><small>Ver en el mapa ↗</small></button>`,
        )
        .join("") ||
      '<p class="groups-empty">No encontramos grupos con esa búsqueda.</p>';
    groupsResults
      .querySelectorAll(".group-result")
      .forEach((button) =>
        button.addEventListener("click", () =>
          focusGroup(
            connectionGroups.find(
              (group) => group.name === button.dataset.group,
            ),
          ),
        ),
      );
  };

  renderGroups();
  groupSearch.addEventListener("input", (event) =>
    renderGroups(event.target.value),
  );
}
