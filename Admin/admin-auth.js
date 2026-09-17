const getSupabaseClient = () => window.supabaseAdmin?.client;

const getCurrentUser = async () => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) throw new Error("No se pudo inicializar el cliente de Supabase.");
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user;
};

const getAdminProfile = async (user = null) => {
  const supabaseClient = getSupabaseClient();
  const currentUser = user || await getCurrentUser();
  if (!currentUser) return null;
  const { data, error } = await supabaseClient
    .from("admin_perfiles")
    .select("usuario_id, correo, nombre, rol, permisos, activo")
    .eq("usuario_id", currentUser.id)
    .maybeSingle();
  if (error) throw error;
  return data || { usuario_id: currentUser.id, correo: currentUser.email, rol: "principal", permisos: {}, activo: true };
};

const requireAdminSession = async () => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("No se pudo inicializar el cliente de Supabase.");
  }

  const user = await getCurrentUser();
  let profile = null;
  if (user && !["admin", "owner"].includes(user.app_metadata?.role)) {
    const { data } = await supabaseClient.from("admin_perfiles").select("activo").eq("usuario_id", user.id).maybeSingle();
    profile = data;
  }
  if (!user || (!["admin", "owner"].includes(user.app_metadata?.role) && !profile?.activo)) {
    await supabaseClient.auth.signOut();
    if (user) {
      throw new Error("Esta cuenta no tiene permisos de administrador.");
    }
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`login.html?next=${encodeURIComponent(next)}`);
    return null;
  }
  return user;
};

const requireAdminPermission = async (permission) => {
  const user = await requireAdminSession();
  if (!user) return null;
  const profile = await getAdminProfile(user);
  if (profile.rol !== "principal" && !profile.permisos?.[permission]) {
    throw new Error("Tu cuenta no tiene permisos para este módulo.");
  }
  return { user, profile };
};

const signOutAdmin = async () => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) throw new Error("No se pudo inicializar el cliente de Supabase.");
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  window.location.replace("login.html");
};

const showAuthError = (element, error) => {
  if (element) element.textContent = error?.message || "No fue posible completar la operación.";
};

const supabaseClient = getSupabaseClient();
if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (!session && document.body.dataset.adminProtected === "true") {
      window.location.replace("login.html");
    }
  });
}

window.supabaseAdmin = {
  client: getSupabaseClient(),
  getCurrentUser,
  getAdminProfile,
  requireAdminSession,
  requireAdminPermission,
  signOutAdmin,
  showAuthError,
};