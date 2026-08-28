const areasSupabaseConfigured = () => {
  const config = window.SUPABASE_CONFIG;
  return Boolean(
    config?.url &&
    config?.anonKey &&
    !config.url.includes('TU-PROYECTO') &&
    !config.anonKey.includes('TU_CLAVE') &&
    window.supabase
  );
};

const areasCurriculares = document.getElementById('subcategoria-areas');
const areasLoginRequired = document.getElementById('areas-login-required');
const areasLoginButton = document.getElementById('areas-login-button');

function actualizarAccesoAreas(session, perfil) {
  const tieneSesion = Boolean(session?.user);
  areasCurriculares?.classList.toggle('acceso-autorizado', tieneSesion);
  if (areasLoginRequired) areasLoginRequired.hidden = tieneSesion;
}

async function iniciarGuardAreas() {
  if (!areasSupabaseConfigured()) {
    actualizarAccesoAreas(null, null);
    return;
  }

  const cliente = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );
  const { data } = await cliente.auth.getSession();
  const perfil = data.session?.user
    ? await obtenerPerfilEstudiante(cliente, data.session.user.email)
    : null;
  actualizarAccesoAreas(data.session, perfil);

  cliente.auth.onAuthStateChange(async (_event, session) => {
    const perfilActual = session?.user
      ? await obtenerPerfilEstudiante(cliente, session.user.email)
      : null;
    actualizarAccesoAreas(session, perfilActual);
  });
}

async function obtenerPerfilEstudiante(cliente, correo) {
  const { data } = await cliente
    .from('estudiantes')
    .select('uuid')
    .eq('email', correo)
    .eq('activo', true)
    .maybeSingle();
  return data;
}

areasLoginButton?.addEventListener('click', () => {
  window.location.href = '../index.html#login';
});

iniciarGuardAreas();
