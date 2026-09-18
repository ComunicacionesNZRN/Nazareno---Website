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

    // Cuenta Maestra
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
    const client = getSupabaseClient();
    if (!client) throw new Error("Cliente no disponible.");

    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      window.location.replace("login.html");
      return null;
    }

    const user = session.user;
    const profile = await getAdminProfile(user);
    if (!profile || profile.activo === false) {
      window.location.replace("login.html");
      return null;
    }

    // Aplicar UI inmediatamente en la página activa
    applyPermissionsUI(user, profile);

    const isSuperAdmin = profile.rol === "principal" || user.email?.toLowerCase() === "comunicaciones@nazarenocali.org";
    if (isSuperAdmin) return { user, profile };

    // Permisos por Rol Especial
    const roleLower = String(profile.rol || "").toLowerCase();
    if (roleLower === "director creativo" && ["carrusel", "eventos", "devocionales"].includes(permission)) {
      return { user, profile };
    }
    if (roleLower === "director plan del maestro" && ["grupos", "devocionales", "plan_maestro", "encuentros", "equipo", "bautismos"].includes(permission)) {
      return { user, profile };
    }

    // Permiso explícito en JSON
    if (profile.permisos?.[permission]) {
      return { user, profile };
    }

    throw new Error("Tu cuenta no tiene permisos para acceder a este módulo.");
  };

  // Aplica la visibilidad en toda la interfaz
  const applyPermissionsUI = (user, profile) => {
    if (!user || !profile) return;
    const isSuperAdmin = profile.rol === "principal" || user.email?.toLowerCase() === "comunicaciones@nazarenocali.org";
    const roleLower = String(profile.rol || "").toLowerCase();
    const isDirectorPlan = roleLower === "director plan del maestro";
    const isDirectorCreativo = roleLower === "director creativo";

    // 1. Mostrar correo en la barra superior
    document.querySelectorAll("[data-admin-email]").forEach((el) => {
      el.textContent = user.email || "Usuario activo";
    });

    // 2. Saludo personalizado
    const greetingEl = document.querySelector("[data-admin-greeting]");
    if (greetingEl) {
      const displayName = profile.nombre?.trim() || user.email?.split("@")[0] || "Administrador";
      greetingEl.innerHTML = `Hola, ${escapeHtml(displayName)}.`;
    }

    // 3. Texto del rol en el sidebar
    const brandEl = document.querySelector(".admin-brand span, [data-admin-brand-text]");
    if (brandEl) {
      const displayRole = formatRole(profile.rol);
      brandEl.textContent = isSuperAdmin ? "Nazareno Admin" : `Nazareno · ${displayRole}`;
    }

    // 4. Filtrar enlaces de navegación
    const navLinks = document.querySelectorAll(".admin-nav a");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.includes("index.html") || href.includes("perfil.html")) {
        link.style.display = "";
        return;
      }
      if (isSuperAdmin) {
        link.style.display = "";
        return;
      }

      let hasAccess = false;
      const modules = ["eventos", "grupos", "plan-maestro", "carrusel", "devocionales", "configuracion", "encuentros", "equipo"];

      modules.forEach((mod) => {
        if (href.includes(mod)) {
          const permKey = mod.replace("-", "_");
          if (
            profile.permisos?.[permKey] ||
            (isDirectorCreativo && ["carrusel", "eventos", "devocionales"].includes(permKey)) ||
            (isDirectorPlan && ["grupos", "devocionales", "plan_maestro", "encuentros", "equipo"].includes(permKey))
          ) {
            hasAccess = true;
          }
        }
      });

      link.style.display = hasAccess ? "" : "none";
    });

    // 5. Filtrar tarjetas del Dashboard
    const dashboardCards = document.querySelectorAll(".admin-card[data-permission]");
    dashboardCards.forEach((card) => {
      if (isSuperAdmin) {
        card.style.display = "";
        return;
      }
      const perm = card.dataset.permission;
      const hasAccess = Boolean(
        profile.permisos?.[perm] ||
        (isDirectorCreativo && ["carrusel", "eventos", "devocionales"].includes(perm)) ||
        (isDirectorPlan && ["grupos", "devocionales", "plan_maestro", "encuentros", "equipo"].includes(perm))
      );
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