// Shared Supabase access boundary.
function crearClienteSupabase() {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey || !window.supabase) return null;
  return window.supabase.createClient(config.url, config.anonKey);
}

async function invocarFuncionSupabase(cliente, nombre, body) {
  return cliente.functions.invoke(nombre, { body });
}

function consultarSolicitudAcceso(cliente, correo) {
  return cliente
    .from('solicitudes_acceso')
    .select('estado')
    .eq('email', correo)
    .maybeSingle();
}

function insertarSolicitudAcceso(cliente, solicitud) {
  return cliente.from('solicitudes_acceso').insert(solicitud);
}

function consultarEstudiante(cliente, correo) {
  return cliente
    .from('estudiantes')
    .select('id, dni, apellidos, nombres, seccion, email, activo')
    .ilike('email', correo.trim())
    .eq('activo', true)
    .maybeSingle();
}

function consultarUsuarioAcceso(cliente, correo) {
  return cliente
    .from('usuarios_acceso')
    .select('id, nombres, apellidos, email, rol, activo')
    .ilike('email', correo.trim())
    .eq('activo', true)
    .maybeSingle();
}

function consultarContenidoRestringido(cliente) {
  return cliente
    .from('contenido_restringido')
    .select('id, titulo, contenido, area, created_at')
    .order('created_at', { ascending: false });
}
