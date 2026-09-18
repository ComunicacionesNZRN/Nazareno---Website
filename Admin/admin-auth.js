(() => {
  const getSupabaseClient = () => window.supabaseAdmin?.client || window._supabase || window.supabaseClient;

  const rolesMap = {
    principal: "Administrador Principal",
    "director plan del maestro": "Director Plan del Maestro",
    "director creativo": "Director Creativo",
    "director de producción": "Director de Producción",
    maestro: "Maestro",
    colaborador: "Colaborador / Líder"
  };

  const formatRole = (rol) => rolesMap[String(rol).toLowerCase()] || rol || "Colaborador";

  const getCurrentUser = async () => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Cliente de Supabase no disponible.");
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user;
  };

  const getAdminProfile = async (user = null) => {
    const client = getSupabaseClient();
    const currentUser = user || (await getCurrentUser().catch(() => null));
    if (!currentUser) return null;

    const { data, error } = await client
      .from("admin_perfiles")
      .select("usuario_id, correo, nombre, rol, permisos, activo")
      .eq("usuario_id", currentUser.id)
      .maybeSingle();

    // Si es el correo maestro principal siempre tiene acceso total
    if (currentUser.email?.toLowerCase() === "comunicaciones@nazarenocali.org") {
      return {
        usuario_id: currentUser.id,
        correo: currentUser.email,
        nombre: data?.nombre || "Administrador General",
        rol: "principal",
        permisos: {
          eventos: true,
          grupos: true,
          plan_maestro: true,
          encuentros: true,
          bautismos: true,
          carrusel: true,
          devocionales: true,
          configuracion: true,
          equipo: true
        },
        activo: true
      };
    }

    if (error || !data) {
      return {
        usuario_id: currentUser.id,
        correo: currentUser.email,
        rol: "colaborador",
        permisos: {},
        activo: true,
        nombre: ""
      };
    }
    return data;
  };

  const requireAdminSession = async () => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Cliente de Supabase no inicializado.");

    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) {
      window.location.replace("login.html");
      return null;
    }

    const user = session.user;
    const profile = await getAdminProfile(user);
    if (!profile || profile.activo === false) {
      await client.auth.signOut();
      alert("Tu cuenta no está activa o no tiene permisos de acceso.");
      window.location.replace("login.html");
      return null;
    }

    applyPermissionsUI(user, profile);
    return user;
  };

  const requireAdminPermission = async (permission) => {
    const user = await requireAdminSession();
    if (!user) return null;
    const profile = await getAdminProfile(user);

    // Administrador general tiene acceso ilimitado
    if (profile.rol === "principal" || user.email?.toLowerCase() === "comunicaciones@nazarenocali.org") {
      return { user, profile };
    }

    // Permisos por rol específico de Director
    if (profile.rol === "director plan del maestro" && ["grupos", "devocionales", "plan_maestro", "bautismos", "encuentros", "equipo"].includes(permission)) {
      return { user, profile };
    }

    if (!profile.permisos?.[permission]) {
      throw new Error("Tu cuenta no tiene permisos para administrar este módulo.");
    }
    return { user, profile };
  };

  // Aplica la visibilidad en toda la interfaz
  const applyPermissionsUI = (user, profile) => {
    const isSuperAdmin = profile.rol === "principal" || user.email?.toLowerCase() === "comunicaciones@nazarenocali.org";
    const isDirectorPlan = profile.rol === "director plan del maestro";

    // 1. Mostrar correo en la esquina superior derecha
    document.querySelectorAll("[data-admin-email]").forEach((el) => {
      el.textContent = user?.email || "Usuario activo";
    });

    // 2. Saludo personalizado dinámico: "Hola, [Nombre]."
    const greetingEl = document.querySelector("[data-admin-greeting]");
    if (greetingEl) {
      const displayName = profile.nombre?.trim() || user.email?.split("@")[0] || "Administrador";
      greetingEl.innerHTML = `Hola, ${escapeHtml(displayName)}.`;
    }

    // 3. Texto del rol junto al logo en el sidebar
    const brandEl = document.querySelector(".admin-brand span, [data-admin-brand-text]");
    if (brandEl) {
      const displayRole = formatRole(profile.rol);
      brandEl.textContent = isSuperAdmin ? "Nazareno Admin" : `Nazareno · ${displayRole}`;
    }

    // 4. Filtrar los enlaces de navegación del Sidebar
    const navLinks = document.querySelectorAll(".admin-nav a");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      
      // Siempre visibles para todos los usuarios autenticados
      if (href.includes("index.html") || href.includes("perfil.html")) {
        link.style.display = "";
        return;
      }

      // Si es SuperAdmin ve todo
      if (isSuperAdmin) {
        link.style.display = "";
        return;
      }

      // Lista de módulos administrables
      const modules = ["eventos", "grupos", "plan-maestro", "carrusel", "devocionales", "configuracion", "encuentros", "equipo"];
      let hasAccess = false;

      modules.forEach((mod) => {
        if (href.includes(mod)) {
          const permKey = mod.replace("-", "_");
          if (profile.permisos?.[permKey] || (isDirectorPlan && ["grupos", "devocionales", "plan_maestro", "encuentros", "equipo"].includes(permKey))) {
            hasAccess = true;
          }
        }
      });

      link.style.display = hasAccess ? "" : "none";
    });

    // 5. Filtrar las tarjetas del Dashboard (index.html)
    const dashboardCards = document.querySelectorAll(".admin-card[data-permission]");
    dashboardCards.forEach((card) => {
      if (isSuperAdmin) {
        card.style.display = "";
        return;
      }
      const perm = card.dataset.permission;
      const hasAccess = Boolean(profile.permisos?.[perm]) || (isDirectorPlan && ["grupos", "devocionales", "plan_maestro", "encuentros", "bautismos", "equipo"].includes(perm));
      card.style.display = hasAccess ? "" : "none";
    });
  };

  const escapeHtml = (val = "") =>
    String(val).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);

  const signOutAdmin = async () => {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    window.location.replace("login.html");
  };

  const showAuthError = (element, error) => {
    if (element) element.textContent = error?.message || "Ocurrió un error.";
  };

  window.supabaseAdmin = {
    client: getSupabaseClient(),
    getCurrentUser,
    getAdminProfile,
    requireAdminSession,
    requireAdminPermission,
    formatRole,
    signOutAdmin,
    showAuthError
  };
})();