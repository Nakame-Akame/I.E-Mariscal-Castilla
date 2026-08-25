let supabaseClient = null;
let estudianteSession = null;
let estudiantePerfil = null;

function supabaseConfigurado() {
  const config = window.SUPABASE_CONFIG;
  return Boolean(
    config &&
    config.url &&
    config.anonKey &&
    !config.url.includes('TU-PROYECTO') &&
    !config.anonKey.includes('TU_CLAVE') &&
    window.supabase
  );
}

function mostrarLogin() {
  document.getElementById('login-overlay')?.classList.add('active');
  document.getElementById('login-email')?.focus();
}

function cerrarLogin() {
  document.getElementById('login-overlay')?.classList.remove('active');
  limpiarEstadoLogin();
}

function limpiarEstadoLogin() {
  const estado = document.getElementById('login-estado');
  if (estado) estado.textContent = '';
}

function mostrarEstadoLogin(mensaje, tipo = '') {
  const estado = document.getElementById('login-estado');
  if (!estado) return;
  estado.textContent = mensaje;
  estado.className = `login-estado ${tipo}`.trim();
}

function esCorreoInstitucional(correo) {
  const config = window.SUPABASE_CONFIG;
  const correoNormalizado = correo.trim().toLowerCase();
  const dominio = config?.institutionalEmailDomain;
  const correosDePrueba = (config?.allowedTestEmails || []).map((email) =>
    email.trim().toLowerCase()
  );
  return Boolean(
    (dominio && correoNormalizado.endsWith(`@${dominio}`)) ||
    correosDePrueba.includes(correoNormalizado)
  );
}

async function iniciarSesionEstudiante(event) {
  event.preventDefault();
  const formulario = event.currentTarget;
  const correo = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const boton = formulario.querySelector('button[type="submit"]');

  if (!esCorreoInstitucional(correo)) {
    mostrarEstadoLogin('Usa tu correo institucional o el correo de prueba autorizado.', 'error');
    return;
  }

  if (!supabaseConfigurado()) {
    mostrarEstadoLogin('Configura Supabase en supabase-config.js para activar el acceso.', 'error');
    return;
  }

  boton.disabled = true;
  mostrarEstadoLogin('Verificando acceso...');

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: correo,
    password,
  });

  boton.disabled = false;

  if (error) {
    const mensaje = error.message?.toLowerCase() || '';
    console.error('Error de inicio de sesión en Supabase:', error);
    if (mensaje.includes('email not confirmed')) {
      mostrarEstadoLogin('Confirma primero el correo en Supabase Authentication.', 'error');
    } else if (mensaje.includes('invalid login credentials')) {
      mostrarEstadoLogin(
        'El correo no existe en Authentication o la contraseña no coincide.',
        'error'
      );
    } else if (mensaje.includes('email logins are disabled')) {
      mostrarEstadoLogin(
        'El acceso por correo está desactivado en Supabase Authentication.',
        'error'
      );
    } else if (mensaje.includes('rate limit')) {
      mostrarEstadoLogin(
        'Se alcanzó el límite de intentos. Espera unos minutos y vuelve a intentar.',
        'error'
      );
    } else if (mensaje.includes('failed to fetch')) {
      mostrarEstadoLogin(
        'No se pudo contactar con Supabase. Revisa tu conexión a Internet.',
        'error'
      );
    } else if (mensaje.includes('captcha')) {
      mostrarEstadoLogin(
        'La protección CAPTCHA está activa en Supabase, pero este formulario no tiene CAPTCHA configurado. Desactívala en Authentication > Protection.',
        'error'
      );
    } else {
      mostrarEstadoLogin(
        `Supabase rechazó el acceso: ${error.message || 'error desconocido'}`,
        'error'
      );
    }
    return;
  }

  const perfil = await cargarPerfilEstudiante(data.session.user.email);

  if (!perfil) {
    await supabaseClient.auth.signOut();
    mostrarEstadoLogin(
      `El correo ${data.session.user.email} inició sesión, pero no tiene un registro activo en la tabla estudiantes.`,
      'error'
    );
    return;
  }

  actualizarSesionEstudiante(data.session, perfil);
  await cargarContenidoRestringido();
  cerrarLogin();
  navigate('estudiante');
}

async function cerrarSesionEstudiante() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  actualizarSesionEstudiante(null);
  navigate('home');
}

async function cargarPerfilEstudiante(correo) {
  const { data, error } = await supabaseClient
    .from('estudiantes')
    .select('id, dni, apellidos, nombres, seccion, email, activo')
    .ilike('email', correo.trim())
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    console.error('No se pudo consultar el perfil del estudiante:', error);
    mostrarEstadoLogin(
      'No se pudo verificar el registro estudiantil. Revisa las políticas RLS.',
      'error'
    );
    return null;
  }

  estudiantePerfil = data;
  return data;
}

async function cargarContenidoRestringido() {
  const contenedor = document.getElementById('restricted-content-list');
  if (!contenedor || !supabaseClient) return;

  contenedor.textContent = 'Cargando contenido...';
  const { data, error } = await supabaseClient
    .from('contenido_restringido')
    .select('id, titulo, contenido, area, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('No se pudo consultar el contenido restringido:', error);
    contenedor.textContent = 'No se pudo cargar el contenido privado.';
    return;
  }

  contenedor.replaceChildren();
  if (!data?.length) {
    contenedor.textContent = 'Todavía no hay comunicados privados publicados.';
    return;
  }

  data.forEach((publicacion) => {
    const articulo = document.createElement('article');
    articulo.className = 'restricted-content-card';

    const area = document.createElement('span');
    area.className = 'restricted-content-area';
    area.textContent = publicacion.area || 'General';

    const titulo = document.createElement('h3');
    titulo.textContent = publicacion.titulo || 'Sin título';

    const contenido = document.createElement('p');
    contenido.textContent = publicacion.contenido || '';

    articulo.append(area, titulo, contenido);
    contenedor.appendChild(articulo);
  });
}

function actualizarPerfilEstudiante(perfil) {
  const datos = document.getElementById('student-profile-data');
  if (!datos) return;

  datos.replaceChildren();

  if (!perfil) {
    datos.textContent = 'Inicia sesión para consultar tus datos.';
    return;
  }

  const nombre = document.createElement('strong');
  nombre.textContent = `${perfil.nombres || ''} ${perfil.apellidos || ''}`.trim();
  const dni = document.createElement('span');
  dni.textContent = `DNI: ${perfil.dni || 'No registrado'}`;
  const seccion = document.createElement('span');
  seccion.textContent = `Sección: ${perfil.seccion || 'No registrada'}`;
  datos.append(nombre, dni, seccion);
}

function actualizarSesionEstudiante(session, perfil = estudiantePerfil) {
  estudianteSession = session;
  estudiantePerfil = session?.user ? perfil : null;
  const acceso = document.getElementById('student-access');
  const accesoMovil = document.getElementById('student-access-mobile');
  const usuario = document.getElementById('student-user-email');
  const saludo = document.getElementById('student-greeting');
  const botonSesion = document.getElementById('student-session-action');
  const accesoAreas = document.getElementById('areas-curriculares-nav');
  const accesoAreasMovil = document.getElementById('areas-curriculares-nav-mobile');
  const accesoAreasFooter = document.getElementById('areas-curriculares-footer');
  const estudianteAutorizado = Boolean(session?.user && perfil);

  [accesoAreas, accesoAreasMovil, accesoAreasFooter].forEach((elemento) => {
    if (elemento) elemento.hidden = !estudianteAutorizado;
  });

  if (session?.user) {
    if (acceso) acceso.textContent = 'Mi área';
    if (accesoMovil) accesoMovil.textContent = '🔐 Mi área';
    if (usuario) usuario.textContent = session.user.email;
    if (saludo) saludo.textContent = `Sesión activa: ${session.user.email}`;
    actualizarPerfilEstudiante(estudiantePerfil);
    if (botonSesion) botonSesion.textContent = 'Cerrar sesión';
  } else {
    if (acceso) acceso.textContent = 'Acceso estudiante';
    if (accesoMovil) accesoMovil.textContent = '🔐 Acceso estudiante';
    if (usuario) usuario.textContent = '';
    if (saludo) saludo.textContent = '';
    actualizarPerfilEstudiante(null);
    if (botonSesion) botonSesion.textContent = 'Iniciar sesión';
  }
}

function abrirAreaEstudiante() {
  if (estudianteSession?.user) {
    navigate('estudiante');
    return;
  }
  mostrarLogin();
}

async function inicializarAutenticacion() {
  actualizarSesionEstudiante(null, null);

  if (!supabaseConfigurado()) return;

  supabaseClient = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );

  const { data } = await supabaseClient.auth.getSession();
  const perfil = data.session?.user ? await cargarPerfilEstudiante(data.session.user.email) : null;
  actualizarSesionEstudiante(data.session, perfil);
  if (data.session) await cargarContenidoRestringido();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    actualizarSesionEstudiante(session, session ? estudiantePerfil : null);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')?.addEventListener('submit', iniciarSesionEstudiante);
  document.getElementById('login-close')?.addEventListener('click', cerrarLogin);
  document.getElementById('login-overlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'login-overlay') cerrarLogin();
  });
  document.getElementById('student-session-action')?.addEventListener('click', () => {
    if (estudianteSession?.user) cerrarSesionEstudiante();
    else mostrarLogin();
  });
  if (window.location.hash === '#login') mostrarLogin();
  inicializarAutenticacion();
});
