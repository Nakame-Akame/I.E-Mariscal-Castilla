let supabaseClient = null;
let estudianteSession = null;
let estudiantePerfil = null;
let otpUsuarioPendiente = null;
let otpCooldownTimer = null;
let autenticacionOtpEnCurso = false;

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
  mostrarFormularioRecuperacion(false);
  mostrarFormularioOtp(false);
  mostrarFormularioRegistro(false);
  clearInterval(otpCooldownTimer);
  if (otpUsuarioPendiente && supabaseClient) supabaseClient.auth.signOut();
  otpUsuarioPendiente = null;
  limpiarEstadoLogin();
}

function limpiarEstadoLogin() {
  const estado = document.getElementById('login-estado');
  if (estado) estado.textContent = '';
}

function mostrarEstadoLogin(mensaje, tipo = '') {
  const estados = [
    document.getElementById('login-estado'),
    document.getElementById('registration-estado'),
  ].filter(Boolean);
  const estado = estados.find((elemento) => !elemento.closest('[hidden]')) || estados[0];
  if (!estado) return;
  estado.textContent = mensaje;
  estado.className = `login-estado ${tipo}`.trim();
}

function esCorreoInstitucional(correo) {
  const config = window.SUPABASE_CONFIG;
  const correoNormalizado = correo.trim().toLowerCase();
  const dominio = config?.institutionalEmailDomain?.trim().toLowerCase();
  return Boolean(dominio && correoNormalizado.endsWith(`@${dominio}`));
}

function obtenerUrlRedireccion() {
  const urlConfigurada = window.SUPABASE_CONFIG?.authRedirectUrl?.trim();
  if (urlConfigurada) return urlConfigurada;
  if (window.location.protocol === 'file:') {
    return 'http://localhost:8000/index.html#login';
  }
  return `${window.location.origin}${window.location.pathname}#login`;
}

function mostrarErrorRegistro(error, boton, formularioRegistro = false) {
  const mensaje = error?.message?.toLowerCase() || '';
  console.error('Error de registro en Supabase:', error);

  if (mensaje.includes('error sending confirmation email') || mensaje.includes('unexpected_failure')) {
    mostrarEstadoLogin(
      'Supabase no pudo enviar el correo de confirmación. Configura un proveedor SMTP en Authentication > SMTP o desactiva la confirmación de correo.',
      'error'
    );
    return;
  }
  if (mensaje.includes('redirect url') || mensaje.includes('redirect_to')) {
    mostrarEstadoLogin(
      'La URL local no está autorizada en Supabase. Añade la dirección actual en Authentication > URL Configuration.',
      'error'
    );
    return;
  }
  if (mensaje.includes('already registered') || mensaje.includes('already been registered')) {
    boton.textContent = 'Iniciar sesión';
    if (formularioRegistro) {
      mostrarFormularioRegistro(false);
      mostrarEstadoLogin('Este correo ya está registrado. Confirma el correo y vuelve a iniciar sesión.', 'error');
      document.getElementById('login-confirm-resend-link')?.removeAttribute('hidden');
    } else {
      mostrarEstadoLogin('Este correo ya está registrado. Inicia sesión.', 'error');
    }
    return;
  }
  if (mensaje.includes('rate limit') || mensaje.includes('too many')) {
    mostrarEstadoLogin('Demasiados intentos de registro. Espera unos minutos y vuelve a intentarlo.', 'error');
    return;
  }
  mostrarEstadoLogin(error?.message || 'No se pudo registrar el usuario.', 'error');
}

function mostrarFormularioRecuperacion(mostrar) {
  document.getElementById('login-form')?.toggleAttribute('hidden', mostrar);
  document.getElementById('password-recovery-form')?.toggleAttribute('hidden', !mostrar);
  document.getElementById('login-recovery-link')?.toggleAttribute('hidden', mostrar);
}

function mostrarFormularioOtp(mostrar) {
  document.getElementById('login-form')?.toggleAttribute('hidden', mostrar);
  document.getElementById('otp-form')?.toggleAttribute('hidden', !mostrar);
  document.getElementById('registration-form')?.toggleAttribute('hidden', true);
  document.getElementById('login-recovery-link')?.toggleAttribute('hidden', mostrar);
}

function mostrarFormularioRegistro(mostrar) {
  document.getElementById('login-form')?.toggleAttribute('hidden', mostrar);
  document.getElementById('registration-form')?.toggleAttribute('hidden', !mostrar);
  document.getElementById('otp-form')?.toggleAttribute('hidden', true);
  document.getElementById('login-recovery-link')?.toggleAttribute('hidden', mostrar);
}

function iniciarCooldownOtp(segundos = 60) {
  const boton = document.getElementById('otp-resend');
  if (!boton) return;
  let restantes = segundos;
  boton.disabled = true;
  boton.textContent = `Reenviar código (${restantes}s)`;
  clearInterval(otpCooldownTimer);
  otpCooldownTimer = setInterval(() => {
    restantes -= 1;
    if (restantes <= 0) {
      clearInterval(otpCooldownTimer);
      boton.disabled = false;
      boton.textContent = 'Reenviar código';
      return;
    }
    boton.textContent = `Reenviar código (${restantes}s)`;
  }, 1000);
}

async function solicitarRecuperacionPassword(event) {
  event.preventDefault();
  const correo = document.getElementById('recovery-email').value.trim().toLowerCase();
  const boton = event.currentTarget.querySelector('button[type="submit"]');

  if (!esCorreoInstitucional(correo)) {
    mostrarEstadoLogin('Usa un correo institucional válido.', 'error');
    return;
  }

  if (!supabaseConfigurado()) {
    mostrarEstadoLogin('Configura Supabase para recuperar el acceso.', 'error');
    return;
  }

  boton.disabled = true;
  mostrarEstadoLogin('Si la cuenta existe, recibirás instrucciones en tu correo.');
  const { error } = await supabaseClient.auth.resetPasswordForEmail(correo, {
    redirectTo: obtenerUrlRedireccion(),
  });
  boton.disabled = false;

  if (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    mostrarEstadoLogin('No se pudo enviar el correo. Intenta nuevamente más tarde.', 'error');
  }
}

async function actualizarPassword(event) {
  event.preventDefault();
  const password = document.getElementById('new-password').value;
  const confirmacion = document.getElementById('new-password-confirmation').value;
  const boton = event.currentTarget.querySelector('button[type="submit"]');

  if (password.length < 8) {
    mostrarEstadoLogin('La contraseña debe tener al menos 8 caracteres.', 'error');
    return;
  }
  if (password !== confirmacion) {
    mostrarEstadoLogin('Las contraseñas no coinciden.', 'error');
    return;
  }

  boton.disabled = true;
  const { error } = await supabaseClient.auth.updateUser({ password });
  boton.disabled = false;
  if (error) {
    console.error('Error al actualizar la contraseña:', error);
    mostrarEstadoLogin('No se pudo actualizar la contraseña. Intenta nuevamente.', 'error');
    return;
  }

  document.getElementById('password-recovery-form').reset();
  mostrarFormularioRecuperacion(false);
  mostrarEstadoLogin('Contraseña actualizada. Ya puedes iniciar sesión.', 'success');
  await supabaseClient.auth.signOut();
}

async function iniciarSesionEstudiante(event) {
  event.preventDefault();
  const formulario = event.currentTarget;
  const correo = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const boton = formulario.querySelector('button[type="submit"]');

  if (!esCorreoInstitucional(correo)) {
    mostrarEstadoLogin('Usa un correo institucional válido.', 'error');
    return;
  }

  if (password.length < 8) {
    mostrarEstadoLogin('La contraseña debe tener al menos 8 caracteres.', 'error');
    return;
  }

  if (!supabaseConfigurado()) {
    mostrarEstadoLogin('Configura Supabase en supabase-config.js para activar el acceso.', 'error');
    return;
  }

  boton.disabled = true;
  mostrarEstadoLogin('Verificando...');
  autenticacionOtpEnCurso = true;

  // La sesión de Supabase se crea, pero el contenido queda bloqueado hasta validar el OTP.
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: correo,
    password,
  });

  boton.disabled = false;
  autenticacionOtpEnCurso = false;

  if (error) {
    const mensaje = error.message?.toLowerCase() || '';
    console.error('Error de inicio de sesión en Supabase:', error);
    if (mensaje.includes('email not confirmed')) {
      mostrarEstadoLogin('Confirma primero el correo en Supabase Authentication.', 'error');
      document.getElementById('login-confirm-resend-link')?.removeAttribute('hidden');
    } else if (mensaje.includes('invalid login credentials')) {
      mostrarEstadoLogin('El correo o la contraseña no son válidos.', 'error');
      document.getElementById('login-register-link')?.setAttribute('hidden', '');
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
      mostrarEstadoLogin('No se pudo iniciar sesión. Intenta nuevamente.', 'error');
    }
    return;
  }

  otpUsuarioPendiente = data.session.user.id;
  const resultado = await enviarCodigoOtp(otpUsuarioPendiente);
  boton.disabled = false;
  if (!resultado) {
    await supabaseClient.auth.signOut();
    otpUsuarioPendiente = null;
    return;
  }
  document.getElementById('otp-email')?.replaceChildren(document.createTextNode(correo));
  mostrarFormularioOtp(true);
  mostrarEstadoLogin('Te enviamos un código de 6 dígitos a tu correo institucional.');
  iniciarCooldownOtp();
  document.getElementById('login-register-link')?.setAttribute('hidden', '');
  document.getElementById('otp-code')?.focus();
}

async function registrarCuentaDesdeLogin(correo, password, boton) {
  boton.disabled = true;
  mostrarEstadoLogin('Registrando usuario...');
  const { data, error } = await supabaseClient.auth.signUp({
    email: correo,
    password,
    options: { emailRedirectTo: obtenerUrlRedireccion() },
  });
  boton.disabled = false;

  if (error) {
    mostrarErrorRegistro(error, boton, true);
    return;
  }

  if (data.session) await supabaseClient.auth.signOut();
  const mensaje = data.session
    ? 'Usuario registrado. Ya puedes iniciar sesión.'
    : 'Usuario registrado. Revisa tu correo y spam para confirmar la cuenta.';
  mostrarEstadoLogin(mensaje, 'success');
  boton.textContent = 'Iniciar sesión';
}

async function enviarCodigoOtp(userId) {
  try {
    const { error } = await supabaseClient.functions.invoke('send-otp', {
      body: { user_id: userId },
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    let detalle = '';
    if (error?.context?.clone) {
      const respuesta = await error.context.clone().json().catch(() => null);
      detalle = respuesta?.error || '';
    }
    if (detalle.toLowerCase().includes('only send testing emails')) {
      detalle = 'Resend solo permite enviar al correo de prueba. Verifica el dominio institucional en Resend';
    }
    mostrarEstadoLogin(
      detalle ? `No se pudo enviar el código: ${detalle}.` : 'No se pudo enviar el código. Intenta nuevamente.',
      'error'
    );
    return false;
  }
}

async function verificarOtp(event) {
  event.preventDefault();
  const codigo = document.getElementById('otp-code').value.trim();
  const boton = event.currentTarget.querySelector('button[type="submit"]');
  if (!/^\d{6}$/.test(codigo) || !otpUsuarioPendiente) {
    mostrarEstadoLogin('Ingresa un código válido de 6 dígitos.', 'error');
    return;
  }
  boton.disabled = true;
  const { data, error } = await supabaseClient.functions.invoke('verify-otp', {
    body: { user_id: otpUsuarioPendiente, code: codigo },
  });
  boton.disabled = false;
  if (error || !data?.success) {
    mostrarEstadoLogin(data?.error || 'El código no es válido o ha expirado.', 'error');
    return;
  }
  sessionStorage.setItem('otp_verificado_user_id', otpUsuarioPendiente);
  const { data: sesion } = await supabaseClient.auth.getSession();
  const perfil = await cargarPerfilAcceso(sesion.session.user.email);
  actualizarSesionEstudiante(sesion.session, perfil);
  await cargarContenidoRestringido();
  otpUsuarioPendiente = null;
  cerrarLogin();
  navigate('estudiante');
}

async function reenviarOtp() {
  if (!otpUsuarioPendiente) return;
  const enviado = await enviarCodigoOtp(otpUsuarioPendiente);
  if (enviado) {
    mostrarEstadoLogin('Código reenviado. Revisa tu correo.');
    iniciarCooldownOtp();
  }
}

async function registrarEstudiante(event) {
  event.preventDefault();
  const formulario = event.currentTarget;
  const correo = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  const boton = formulario.querySelector('button[type="submit"]');
  if (!esCorreoInstitucional(correo)) {
    mostrarEstadoLogin('Usa un correo institucional válido.', 'error');
    return;
  }
  if (password.length < 8) {
    mostrarEstadoLogin('La contraseña debe tener al menos 8 caracteres.', 'error');
    return;
  }
  if (!supabaseConfigurado()) {
    mostrarEstadoLogin('Configura Supabase para activar el registro.', 'error');
    return;
  }
  boton.disabled = true;
  const { data, error } = await supabaseClient.auth.signUp({
    email: correo,
    password,
    options: { emailRedirectTo: obtenerUrlRedireccion() },
  });
  boton.disabled = false;
  if (error) {
    mostrarErrorRegistro(error, boton);
    return;
  }
  if (data.session) await supabaseClient.auth.signOut();
  mostrarFormularioRegistro(false);
  document.getElementById('login-email').value = correo;
  document.getElementById('login-password')?.focus();
  const mensaje = data.session
    ? 'Registro creado. Ya puedes iniciar sesión.'
    : 'Registro creado. Revisa tu correo y spam para confirmar la cuenta.';
  mostrarEstadoLogin(mensaje, 'success');
  formulario.reset();
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
  return Boolean(
    session?.user && sessionStorage.getItem('otp_verificado_user_id') === session.user.id
  );
}

async function enviarEmailAdmision(nombre, correo) {
  try {
    const { error } = await supabaseClient.functions.invoke('enviar-email-admision', {
      body: {
        nombre,
        correo,
      },
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error al enviar email de admisión:', err);
    return false; // This line is now redundant and can be removed if desired
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

async function cargarPerfilAcceso(correo) {
  const perfilEstudiante = await cargarPerfilEstudiante(correo);
  if (perfilEstudiante) return perfilEstudiante;

  const { data, error } = await supabaseClient
    .from('usuarios_acceso')
    .select('id, nombres, apellidos, email, rol, activo')
    .ilike('email', correo.trim())
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    console.error('No se pudo consultar el acceso del usuario:', error);
    mostrarEstadoLogin(
      'No se pudo verificar el acceso. Revisa las políticas RLS y la tabla usuarios_acceso.',
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

function actualizarEnlacePerfil(elemento, user, movil = false) {
  if (!elemento) return;
  elemento.replaceChildren();

  if (!user) {
    elemento.textContent = movil ? '🔐 Acceso estudiante' : 'Acceso estudiante';
    return;
  }

  const avatar = document.createElement('span');
  avatar.className = 'profile-nav-avatar';
  const foto = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  if (foto) {
    const imagen = document.createElement('img');
    imagen.src = foto;
    imagen.alt = '';
    imagen.referrerPolicy = 'no-referrer';
    imagen.addEventListener('error', () => {
      avatar.textContent = (user.email || '?').charAt(0).toUpperCase();
    }, { once: true });
    avatar.appendChild(imagen);
  } else {
    avatar.textContent = (user.email || '?').charAt(0).toUpperCase();
  }

  const texto = document.createElement('span');
  texto.textContent = 'Mi perfil';
  elemento.append(avatar, texto);
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
    actualizarEnlacePerfil(acceso, session.user);
    actualizarEnlacePerfil(accesoMovil, session.user, true);
    if (usuario) usuario.textContent = session.user.email;
    if (saludo) saludo.textContent = `Sesión activa: ${session.user.email}`;
    actualizarPerfilEstudiante(estudiantePerfil);
    if (botonSesion) botonSesion.textContent = 'Cerrar sesión';
  } else {
    actualizarEnlacePerfil(acceso, null);
    actualizarEnlacePerfil(accesoMovil, null, true);
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

  const perfil = session?.user ? await cargarPerfilAcceso(session.user.email) : null;
  actualizarSesionEstudiante(session, perfil);
  if (session) await cargarContenidoRestringido();

  supabaseClient.auth.onAuthStateChange(async (event, nuevaSesion) => {
    if (event === 'PASSWORD_RECOVERY') {
      mostrarLogin();
      mostrarFormularioRecuperacion(true);
      mostrarEstadoLogin('Crea una nueva contraseña para tu cuenta.');
      return;
    }

    if (autenticacionOtpEnCurso || (nuevaSesion && otpUsuarioPendiente === nuevaSesion.user.id)) return;

    if (nuevaSesion && !(await sesionEstaAprobada(nuevaSesion))) {
      await supabaseClient.auth.signOut();
      return;
    }

    const perfilActualizado = nuevaSesion?.user
      ? await cargarPerfilEstudiante(nuevaSesion.user.email)
      : null;

    actualizarSesionEstudiante(nuevaSesion, perfilActualizado);
    if (nuevaSesion) await cargarContenidoRestringido();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')?.addEventListener('submit', iniciarSesionEstudiante);
  document.getElementById('otp-form')?.addEventListener('submit', verificarOtp);
  document.getElementById('otp-resend')?.addEventListener('click', reenviarOtp);
  document.getElementById('registration-form')?.addEventListener('submit', registrarEstudiante);
  document.getElementById('login-register-link')?.addEventListener('click', () => {
    document.getElementById('register-email').value = document.getElementById('login-email').value;
    mostrarFormularioRegistro(true);
    document.getElementById('register-email').focus();
  });
  document.getElementById('login-confirm-resend-link')?.addEventListener('click', async (event) => {
    const boton = event.currentTarget;
    const correo = document.getElementById('login-email').value.trim().toLowerCase();
    if (!correo || !esCorreoInstitucional(correo)) return;

    boton.disabled = true;
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: correo,
      options: { emailRedirectTo: obtenerUrlRedireccion() },
    });
    if (error) {
      const mensaje = error.message?.toLowerCase() || '';
      mostrarEstadoLogin(
        mensaje.includes('rate limit') || mensaje.includes('too many')
          ? 'Espera unos minutos antes de solicitar otro correo de confirmación.'
          : 'No se pudo reenviar el correo de confirmación. Intenta nuevamente más tarde.',
        'error'
      );
      boton.disabled = false;
      return;
    }
    mostrarEstadoLogin('Correo de confirmación reenviado. Revisa recibidos y spam.', 'success');
    window.setTimeout(() => {
      boton.disabled = false;
    }, 60000);
  });
  document.getElementById('login-back-link')?.addEventListener('click', () => {
    mostrarFormularioRegistro(false);
    document.getElementById('login-email')?.focus();
  });

  document
    .getElementById('password-recovery-form')
    ?.addEventListener('submit', actualizarPassword);
  document
    .getElementById('login-recovery-form')
    ?.addEventListener('submit', solicitarRecuperacionPassword);
  document.getElementById('login-recovery-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    mostrarFormularioRecuperacion(true);
    document.getElementById('recovery-email').value =
      document.getElementById('login-email').value;
    document.getElementById('recovery-email').focus();
  });
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
  document.getElementById('register-password-toggle')?.addEventListener('click', (event) => {
    const boton = event.currentTarget;
    const password = document.getElementById('register-password');
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
