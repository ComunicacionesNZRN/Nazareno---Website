const getSupabaseClient = () => window.supabaseAdmin?.client;

const getCurrentUser = async () => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) throw new Error("No se pudo inicializar el cliente de Supabase.");
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user;
};

const requireAdminSession = async () => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("No se pudo inicializar el cliente de Supabase.");
  }

  const user = await getCurrentUser();
  if (!user || user.app_metadata?.role !== "admin") {
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
  requireAdminSession,
  signOutAdmin,
  showAuthError,
};
