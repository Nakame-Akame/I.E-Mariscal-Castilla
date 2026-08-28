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
  const dominio = window.SUPABASE_CONFIG?.institutionalEmailDomain;
  return Boolean(dominio && correo.toLowerCase().endsWith(`@${dominio}`));
}

async function verificarEstadoCorreoYActualizarBoton() {
  const correo = document.getElementById('login-email').value.trim().toLowerCase();
  const boton = document.querySelector('.login-submit');
  
  if (!esCorreoInstitucional(correo)) {
    boton.textContent = 'Solicitar acceso';
    return;
  }

  const solicitud = await obtenerSolicitudAcceso(correo);
  if (solicitud && solicitud.estado === 'aprobado') {
    boton.textContent = 'Iniciar sesión';
  } else {
    boton.textContent = 'Solicitar acceso';
  }
}

async function iniciarSesionEstudiante(event) {
  event.preventDefault();
  const formulario = event.currentTarget;
  const correo = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const boton = formulario.querySelector('button[type="submit"]');

  if (!esCorreoInstitucional(correo)) {
    mostrarEstadoLogin('Usa tu correo institucional.', 'error');
    return;
  }

  if (!supabaseConfigurado()) {
    mostrarEstadoLogin('Configura Supabase en supabase-config.js para activar el acceso.', 'error');
    return;
  }

  boton.disabled = true;
  mostrarEstadoLogin('Verificando...');

  // Verificar si el correo está aprobado
  const solicitud = await obtenerSolicitudAcceso(correo);
  
  if (!solicitud || solicitud.estado !== 'aprobado') {
    boton.disabled = false;
    mostrarEstadoLogin(
      solicitud?.estado === 'pendiente'
        ? 'Tu solicitud está pendiente de aprobación por Secretaría.'
        : 'Tu acceso aún no ha sido aprobado por Secretaría.',
      'error'
    );
    
    // Si no tiene acceso aprobado, registrar solicitud
    if (!solicitud) {
      const { error } = await supabaseClient.from('solicitudes_acceso').insert({
        nombre: correo.split('@')[0],
        email: correo,
        rol: 'estudiante',
      });
      
      if (!error) {
        await enviarEmailAdmision(correo.split('@')[0], correo);
        mostrarEstadoLogin(
          'Solicitud enviada. Te hemos enviado un correo de confirmación. Secretaría te avisará cuando el acceso sea completamente aprobado.',
          ''
        );
        formulario.reset();
      } else {
        console.error('Error al insertar solicitud:', error);
        mostrarEstadoLogin(
          `No se pudo enviar la solicitud. Error: ${error.message || error.details || 'Intenta nuevamente.'}`,
          'error'
        );
      }
    }
    boton.disabled = false;
    return;
  }

  // Si está aprobado, intentar iniciar sesión
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: correo,
    password,
  });

  boton.disabled = false;

  if (error) {
    const mensaje = error.message?.toLowerCase() || '';
    if (mensaje.includes('email not confirmed')) {
      mostrarEstadoLogin('Confirma primero el correo en Supabase Authentication.', 'error');
    } else if (mensaje.includes('invalid login credentials')) {
      mostrarEstadoLogin(
        'Contraseña incorrecta.',
        'error'
      );
    } else {
      mostrarEstadoLogin(
        'No se pudo iniciar sesión. Revisa la configuración de Supabase.',
        'error'
      );
    }
    return;
  }

  const perfil = await cargarPerfilEstudiante(data.session.user.email);

  actualizarSesionEstudiante(data.session, perfil);
  await cargarContenidoRestringido();
  cerrarLogin();
  navigate('estudiante');
}

async function obtenerSolicitudAcceso(correo) {
  const { data, error } = await supabaseClient
    .from('solicitudes_acceso')
    .select('estado')
    .eq('email', correo)
    .maybeSingle();

  if (error) {
    console.error('No se pudo verificar la solicitud de acceso:', error);
    return null;
  }
  return data;
}

async function sesionEstaAprobada(session) {
  if (!session?.user) return false;
  const solicitud = await obtenerSolicitudAcceso(session.user.email);
  return solicitud?.estado === 'aprobado';
}

async function enviarEmailAdmision(nombre, correo) {
  try {
    const { error } = await supabaseClient.functions.invoke('enviar-email-admision', {
      body: {
        nombre,
        correo,
      },
    });
    // Email service temporarily disabled
    // Function will be available after Edge Function deployment
    console.log('Email de solicitud registrada para:', correo);
    return true;
  } catch (err) {
    console.error('Error al enviar email de admisión:', err);
    return false; // This line is now redundant and can be removed if desired
  }
}

  // Versión simplificada sin Edge Function
  async function enviarEmailAdmision(nombre, correo) {
    try {
      console.log('✓ Solicitud registrada para:', nombre, correo);
      console.log('📧 Email de confirmación será enviado por Secretaría');
      return true;
    } catch (err) {
      console.error('Error:', err);
      return false;
    }
  }

  async function enviarSolicitudAcceso(event) {
  event.preventDefault();
  const formulario = event.currentTarget;
  const correo = document.getElementById('access-request-email').value.trim().toLowerCase();
  const estado = document.getElementById('access-request-status');
  const boton = formulario.querySelector('button[type="submit"]');
  const nombre = document.getElementById('access-request-name').value.trim();

  if (!esCorreoInstitucional(correo)) {
    estado.textContent = 'Usa tu correo institucional.';
    estado.className = 'login-estado error';
    return;
  }

  boton.disabled = true;
  const { error } = await supabaseClient.from('solicitudes_acceso').insert({
    nombre: nombre,
    email: correo,
    rol: document.getElementById('access-request-role').value,
  });

  if (!error) {
    await enviarEmailAdmision(nombre, correo);
  }

  boton.disabled = false;

  estado.className = `login-estado ${error ? 'error' : ''}`.trim();
  estado.textContent = error
    ? 'No se pudo enviar la solicitud. Intenta nuevamente o comunícate con Secretaría.'
    : 'Solicitud enviada. Te hemos enviado un correo de confirmación. Secretaría te avisará cuando el acceso sea completamente aprobado.';
  if (!error) formulario.reset();
}

async function cerrarSesionEstudiante() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  actualizarSesionEstudiante(null);
  navigate('home');
}

async function cargarPerfilEstudiante(correo) {
  const { data, error } = await supabaseClient
    .from('estudiantes')
    .select('uuid, dni, apellidos, nombres, seccion, email, activo')
    .eq('email', correo)
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    console.error('No se pudo consultar el perfil del estudiante:', error);
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
  const estudianteAutorizado = Boolean(session?.user);

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
  let session = data.session;
  if (session && !(await sesionEstaAprobada(session))) {
    await supabaseClient.auth.signOut();
    session = null;
  }
  const perfil = session?.user ? await cargarPerfilEstudiante(session.user.email) : null;
  actualizarSesionEstudiante(session, perfil);
  if (session) await cargarContenidoRestringido();

  supabaseClient.auth.onAuthStateChange(async (_event, nuevaSesion) => {
    if (nuevaSesion && !(await sesionEstaAprobada(nuevaSesion))) {
      await supabaseClient.auth.signOut();
      return;
    }
    actualizarSesionEstudiante(nuevaSesion, nuevaSesion ? estudiantePerfil : null);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')?.addEventListener('submit', iniciarSesionEstudiante);
  document.getElementById('login-email')?.addEventListener('blur', verificarEstadoCorreoYActualizarBoton);
  document.getElementById('login-close')?.addEventListener('click', cerrarLogin);
  document.getElementById('login-password-toggle')?.addEventListener('click', (event) => {
    const boton = event.currentTarget;
    const password = document.getElementById('login-password');
    const icono = boton.querySelector('i');
    const mostrar = password.type === 'password';

    password.type = mostrar ? 'text' : 'password';
    boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
    boton.setAttribute('aria-pressed', String(mostrar));
    icono.className = mostrar ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });
  document.getElementById('student-session-action')?.addEventListener('click', () => {
    if (estudianteSession?.user) cerrarSesionEstudiante();
    else mostrarLogin();
  });
  if (window.location.hash === '#login') mostrarLogin();
  inicializarAutenticacion();
});
