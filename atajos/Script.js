/* ==========================================================================
   DIRECTORIO INSTITUCIONAL 2026 · IE "MARISCAL CASTILLA"
   ==========================================================================
   Lógica completa: listado de áreas → personas por área → horario de
   atención (padres y estudiantes) de cada persona.

   Datos generados a partir de:
     - DIRECTORIO_MC-2026.xlsx            (personas por área)
     - ATENCION_A_PADRES.docx             (horario de atención a padres)
     - ATENCION_A_ESTUDIANTES.docx        (horario de atención a estudiantes)

   Por privacidad, los números de celular NO se incluyen en los datos ni se
   renderizan en ningún lado.

   Por ahora solo EPT y ED. RELIGIOSA tienen horario de atención cargado.
   El resto de áreas se irá completando más adelante: el código ya está
   preparado para eso, no hace falta tocar nada cuando llegue esa info,
   solo hay que agregar la entrada correspondiente dentro de
   `horariosAtencion`.

   ---------------------------------------------------------------------
   CONTRATO DE IDs QUE ESTE JS ESPERA ENCONTRAR EN TU HTML
   ---------------------------------------------------------------------
   Buscador global (arriba de todo):
     #input-buscador-global      <input>  (evento oninput -> buscarGlobal())

   Vista 1 — Listado de áreas:
     #vista-areas                contenedor de la vista completa
     #grid-areas                 contenedor donde se insertan las tarjetas de área
     #areas-count-label          (opcional) texto "X áreas en total"

   Vista 2 — Personas de un área:
     #vista-detalle              contenedor de la vista completa
     #detalle-titulo             nombre del área
     #detalle-descripcion        descripción del área
     #total-docentes             número de integrantes
     #input-buscador             <input> buscador dentro del área (oninput -> filtrarDocentes())
     #grid-docentes              contenedor donde se insertan las tarjetas de persona

   Vista 3 — Horario de atención de una persona:
     #vista-horario              contenedor de la vista completa
     #horario-nombre             nombre de la persona
     #horario-cargo              cargo / descripción del cargo
     #horario-area               nombre del área a la que pertenece
     #horario-contenido          contenedor donde se insertan las tablas de horario
                                  (o el mensaje de "sin horario registrado")

   Botones de navegación (llamar directo desde el HTML con onclick):
     mostrarVistaAreas()         vuelve del detalle de área al listado de áreas
     volverADetalleArea()        vuelve del horario de una persona a su área

   Todo el resto (armar las tarjetas, filtrar, mostrar/ocultar vistas) lo
   hace este archivo. Vos solo maquetás y le das estilos con tus propias
   clases/IDs.
   ========================================================================== */

/* ============================ DATOS ============================ */

// Personas agrupadas por área (sin número de celular)
const directorioData = {
  "DIRECTIVOS": [{
    "nombre": "Marquez Rondan María Esther",
    "cargo": "DIRECTORA",
    "situacion": "Reasignada",
    "cumpleanos": "",
    "correo": "mmarquez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Garay Diaz, Edson",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "",
    "correo": "egaray@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Davila Alania, Antonio David",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Reasignado",
    "cumpleanos": "",
    "correo": "adavila@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Alayo Huaman, Carlos Antonio",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "",
    "correo": "calayo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Muñoz Javier, Erlinda Victoria",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "",
    "correo": "emuñoz@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Jorge Meza, Abel Arturo",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "23 de May",
    "correo": "ajorge@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Villanes Aranda, Pedro Ruben",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "",
    "correo": "pvillanes@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Flores Chavez, Ingrid Marisol",
    "cargo": "SUB-DIRECTOR",
    "situacion": "Designado",
    "cumpleanos": "",
    "correo": "iflores@mariscalcastilla.edu.pe",
  }],
  "JERARQUICOS": [{
    "nombre": "(Vacante)",
    "cargo": "COORD. PED. - EDUCACIÓN FÍSICA",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Uceda Havez, Gladys María",
    "cargo": "COORD. PED. - PI - ETP/REL",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "guceda@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Condor Mendoza, Edgar Jaime",
    "cargo": "COORD. PED. - PI - COM",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "econdor@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Gamero Tello, Victoria Esther",
    "cargo": "COORD. PED. - PII - MAT",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "vgamero@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Carlos Dionisio Nina",
    "cargo": "COORD. PED. - PII - ING/AC",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "ncarlos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "COORD. PED. - PII -CCSS/DPCC",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Soto Rojas, Adler Julio",
    "cargo": "COORDINADOR DE TUTORIA - QUINTOS",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "asoto@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "COORDINADOR DE TUTORIA - PRIMEROS",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Quispe Villegas, Isabel Lourdes",
    "cargo": "COORDINADOR DE TUTORIA - TERCEROS",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "iquispe@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Baquerizo Davila, Liz Gloria",
    "cargo": "COORDINADOR DE TUTORIA - SEGUNDOS",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "lbaquerizo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Canales Davalos, Julio Cesar",
    "cargo": "COORDINADOR DE TUTORIA - CUARTOS",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "jcanales@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ambrosio Orellana, Betzabe Rosio",
    "cargo": "JEFE DE LABORATORIO",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Parraga Melo, Nora",
    "cargo": "JEFE DE LABORATORIO",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Socualaya Cerron, Wilder",
    "cargo": "JEFE DE LABORATORIO",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "wcerron@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Valenzuela Huaman, Jenny Magaly",
    "cargo": "JEFE DE LABORATORIO",
    "situacion": "ENCARGADO",
    "cumpleanos": "",
    "correo": "jvalenzuela@mariscalcastilla.edu.pe",
  }],
  "MATEMÁTICA": [{
    "nombre": "Cancho Figueroa Irene Sofia",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "icancho@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Chávez Yupanqui Marivel Yoli",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mchavez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Conchoy Lozano Wilfredo Terry",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "wconchoy@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Espejo Salvatierra, Rolando",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "respejo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Gamero Tello Victoria Esther",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Hinostroza Eulogio Benjamín",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Hormaza Paucar Mercedes",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "DESTACADA",
    "cumpleanos": "",
    "correo": "mhormaza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Huaranga Barra Alcides Juan",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ahuaranga@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Laureano Quintanilla Román Dionicio",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Lazo Calderón Nadia Teresa",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Mejia Balvin Wuilliam",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Mendoza Aliaga Edwin Edgar",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Mendoza Ayre Jaime Walter",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Paira Zevallos Gladys Lupe",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "gpaira@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Paucar Castillo Alejandro",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Quispe Lifonzo Irene Clara",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Ramos Varillas Jose Luis",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jramos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Salas Vilca Linda Diana",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Sanca Hurtado Esther Ana",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Soto Rojas, Adler Julio",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Torres Raymundo Lizet",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ltorres@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Santiago Malpartida, Luis",
    "cargo": "PROFESOR - MATEMÁTICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }],
  "COMUNICACIÓN": [{
    "nombre": "Zevallos Baldeon, Ruben Dario",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "educaperu22@gmail.com",
  }, {
    "nombre": "Fano Córdova, Juan",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "juanfanocordova@gmail.com",
  }, {
    "nombre": "Macha Zapaico, Edwin Lester",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "emacha@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Vargas Cervantes, Yeen",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "yeenvc@gmail.com",
  }, {
    "nombre": "Huaroc Taipe, Edison",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ehuaroct@gmail.com",
  }, {
    "nombre": "Barriga Palomino, Carola Yanet",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "yanetkapb@gmail.com",
  }, {
    "nombre": "Cueva Haro, Cindy Hellen",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "DESTACADA",
    "cumpleanos": "",
    "correo": "cindyhellen_8@hotmail.com",
  }, {
    "nombre": "Ortiz Tito, Carmen",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "DESTACADA",
    "cumpleanos": "",
    "correo": "carmencristina.ortiztito@gmail.com",
  }, {
    "nombre": "Moreno Vasquez, Patricia Lourdes",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "pmoreno@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Baquerizo Villar, Carmen Judith",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "cjbv_925@hotmail.com",
  }, {
    "nombre": "Villalobos Moncada, Eloy Oswaldo",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "eloyvillalobos067@gmail.com",
  }, {
    "nombre": "Santiago Malpartida, Gloria María",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "gsantiago@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Carlos Dionisio, David Stalin",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "dacar77777@gmail.com",
  }, {
    "nombre": "Rojas Orna, Jackeline Elva",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jackierojasorna@gmail.com",
  }, {
    "nombre": "Cóndor Mendoza, Edgar Jaime",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "edgarcondormendoza@gmail.com",
  }, {
    "nombre": "Laureano Agüero, Lisbeth Giovanna",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "DESTACADA",
    "cumpleanos": "",
    "correo": "ludbika11@gmail.com",
  }, {
    "nombre": "Carrillo Onofre, Jeanet Angela",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "carrilloonofrej@gmail.com",
  }, {
    "nombre": "Vilchez Gutarra, Efraín Alfredo",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "efrainvilchezg@gmail.com",
  }, {
    "nombre": "Camarena Tueros, Enrique",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "DESTACADO",
    "cumpleanos": "",
    "correo": "enriquecamarenatueros66@gmail.com",
  }, {
    "nombre": "Salazar Chuquillanqui, Estephany Lisbeth",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "estephanysalazar.17@gmail.com",
  }, {
    "nombre": "Rojas Lope, Elisa Katherine",
    "cargo": "PROFESOR - COMUNICACIÓN",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "elikatu031729@gmail.com",
  }],
  "INGLÉS": [{
    "nombre": "Dorregaray Avellaneda, Gina Ivonny",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "gdorregaray@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Castillo Cahuana, Rosario Isabel",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "rcastillo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Untiveros Munive, Julia",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "juntiveros@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Lozano Vilcapoma Jony",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jlozano@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Peñaloza Olivera, Evelyn",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "epeñaloza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Rodriguez Romero Ana",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "arodriguez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Palomino Santillana Ruth Noemí",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRADA",
    "cumpleanos": "",
    "correo": "npalomino@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Fierro Castro Cecilia Noemí",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "cfierro@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Tovar Romo Sara",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "stovar@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ramos Macha María Martha",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "mramos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Lazaro Ramos Erick",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "elazaro@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Capcha Capcha, Leo Roger",
    "cargo": "PROFESOR - INGLÉS",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "lcapcha@mariscalcastilla.edu.pe",
  }],
  "CIENCIA Y TECNOLOGÍA": [{
    "nombre": "Perez Chavez, Yul Florencio",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "yperez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Leguia Obregon Oscar Armando",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Villon Espejo, Luz Elsa",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "lvillon@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Bejarano Rodriguez, Margarita Florencia",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mbejarano@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ramirez Nuñez, Carmen Rosa",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "cramirez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Baldarrago Escurra Raquel Pilar",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Mallma Lifonzo, Marleny",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mmallma@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Andrade Salome, Julia Elizabeth",
    "cargo": "PROFESOR - CT",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jandrade@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Narvaez Alanya, Ivan Kock",
    "cargo": "PROFESOR - CT",
    "situacion": "REASIGNADO",
    "cumpleanos": "",
    "correo": "inarvaez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "PROFESOR - CT",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Medina Catay, Robert Stalin",
    "cargo": "PROFESOR - CT",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "rmedina@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "PROFESOR - CT",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "(Vacante)",
    "cargo": "PROFESOR - CT",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "",
  }],
  "CC.SS. - DPCC": [{
    "nombre": "Travezaño Condor, Silvia Olinda",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "stravezaño@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Pariona Pariona, Alicia",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "apariona@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Flores Paitan, Ybonne Yoan",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "yflores@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Huaman Baquerizo de Avellaneda, Elva Libia",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ehuaman@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Monroy Astete, Nelly Mercedes",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "nmonroy@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Bonilla Colonio, Rosario Luz",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "rbonilla@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Piñas Samaniego, Filadelfo Dimas",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "fpiñas@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Morales Lozada, Elizabeth Norma",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "REASIGNADA",
    "cumpleanos": "",
    "correo": "emorales@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Romani Gamion, Maricela Esperanza",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mromani@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Parraguirre Cordova, Carolina",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "cparraguirre@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Trujillo Meza, Marco Antonio",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mtrujillo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Campos Nuñez, Antonio",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "acampos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Castro Gaspar, Magno",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mcastro@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Dextre Revolo, Yudee Teresa",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ydextre@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Salazar Gamarra, Raul Armando",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "REASIGNADA",
    "cumpleanos": "",
    "correo": "rsalazar@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Zuñiga Norero, Daniel Angel",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "dzuñiga@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Hinostroza Alvino, Jakelyn Jenyfer",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jhinostroza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Rojas Castro, Pedro Florencio",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "projas@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Brañez Cochachi, Marco Antonio",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mbrañez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Utos Barrante, Uber Elfri",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "uutos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Mendoza Mendoza, Maricielo",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "mmendoza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Lopez Caballero, Elizabeth Monica",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "elopez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Cenzano Pecho, Blanca Eva",
    "cargo": "PROFESOR - CCSS/DPCC",
    "situacion": "CONTRATADA",
    "cumpleanos": "",
    "correo": "bcenzano@mariscalcastilla.edu.pe",
  }],
  "ARTE Y CULTURA": [{
    "nombre": "Castro Ladera, Dina Teodora",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "dcastro@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Hurtado Soller, Jose Luis",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jhurtado@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Inga Morales, Samuel Zenon",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "singa@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Inga Ortiz, Daniel Armando",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "dinga@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Limaco Basurto, Oliver",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "olimaco@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Palomino Flores, William Alfredo",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "wpalomino@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Salvatierra Orihuela, Lila Mercedes",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "lsalvatierra@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Lizana Martinez, Fernando",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "flizana@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Cerron Salvatierra, Ruben",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "rcerron@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Gonzales Campos Luis Alfredo",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "NOMBRADO",
    "cumpleanos": "05 de August",
    "correo": "lgonzales@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Jerónimo Mendoza Flor Judith",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "fjeronimo@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Filimon Jhon Naula Ramos",
    "cargo": "PROFESOR - ARTE Y CULTURA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "fnaula@mariscalcastilla.edu.pe",
  }],
  "ED. RELIGIOSA": [{
    "nombre": "Del Valle Aguirre, Edwin David",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "12 de junio",
    "correo": "edel@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ricaldi Panez, Irma Luz",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "17 de December",
    "correo": "iricaldi@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ruiz Salazar, Janet Magaly",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "NOMBRADO",
    "cumpleanos": "18 de mayo",
    "correo": "jruiz@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Corilloclla Ccente Marisol",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "CONTRATADO",
    "cumpleanos": "30 de agosto",
    "correo": "mcorilloclla@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Mucha Espinoza Yanina Katherine",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "CONTRATADO",
    "cumpleanos": "27 de marzo",
    "correo": "ymucha@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Nolasco Novela Mirtha Soledad",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "CONTRATADO",
    "cumpleanos": "02 de abril",
    "correo": "mnolasco@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Acuña Cardenas Melva",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "CONTRATADO",
    "cumpleanos": "02 de diciemb",
    "correo": "macuña@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Hermitaño Alvarado Sonia",
    "cargo": "PROFESOR - RELIGIÓN",
    "situacion": "CONTRATADO",
    "cumpleanos": "17 de September",
    "correo": "shermitaño@mariscalcastilla.edu.pe",
  }],
  "ED. FÍSICA": [{
    "nombre": "Mendoza Colonio, Lizardo",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "lizardomendoza66@gmail.com",
  }, {
    "nombre": "Laura Capcha, Gilmer Juan",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "glc1606@outlook.com",
  }, {
    "nombre": "Saravia Galindo, Teresa Enma",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "tsaraviagalindo@gmail.com",
  }, {
    "nombre": "Carpena Cruz, David Roger",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "davidcc2054@gmail,com",
  }, {
    "nombre": "Enriquez Loayza Marina",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "DESTACADA",
    "cumpleanos": "",
    "correo": "marienlo1174@gmail.com",
  }, {
    "nombre": "Aliaga Orihuela, Isabel Marleny",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "isabelaliaga64@gmail.com",
  }, {
    "nombre": "Cerron Ramos, Wilfredo Jose",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "REASIGNADO",
    "cumpleanos": "",
    "correo": "willy190572@hotmail.com",
  }, {
    "nombre": "Ataucusi Galvan, Ruth",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ruth.atgal@gmail.com",
  }, {
    "nombre": "Lorenzo Huamancaja, Rosa Nelly",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "REASIGNADO",
    "cumpleanos": "",
    "correo": "Lorenzorosa42@gmail.com",
  }, {
    "nombre": "Mendoza Rutti, Jose Miguel",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "migmen1616@gmail.com",
  }, {
    "nombre": "Mayta Atencio; Dimas Manuel",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "pascodmma@hotmail.com",
  }, {
    "nombre": "Castillo Callupe Gabriel Alberti",
    "cargo": "PROFESOR - ED. FÍSICA",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "hereiam2723@gmail.com",
  }],
  "EPT": [{
    "nombre": "Machuca Manrique, Diana Lili",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "23 septiembre",
    "correo": "dmachuca@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ruiz Tacunan, Delia",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "27 de enero",
    "correo": "druiz@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Rodriguez Davila, German Alexander",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "9 de enero",
    "correo": "grodriguez@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Tacza Huaire, Guzman Domingo",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "04 de August",
    "correo": "gtacza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Heredia Carrasco, Biuler",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "11 de noviembre",
    "correo": "bheredia@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ñaupari Rafael, Juan Carlos",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "5 de agosto",
    "correo": "jnaupari@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Galarza Nuñez, María Isabel",
    "cargo": "PROFESOR - EPT",
    "situacion": "NOMBRADO",
    "cumpleanos": "28 d ediciembre",
    "correo": "mgalarza@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Quispe Paitan Edison",
    "cargo": "PROFESOR - EPT",
    "situacion": "CONTRATADO",
    "cumpleanos": "5 de mayo",
    "correo": "equispe@mariscalcastilla.edu.pe",
  }],
  "PIP": [{
    "nombre": "Recuay Salcedo, Isabel Clemencia",
    "cargo": "PROFESOR - AIP",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "irecuay@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "PROFESOR - AIP",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "otacure@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "PROFESOR - AIP",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "ccastro@mariscalcastilla.edu.pe",
  }],
  "AUXILIARES DE EDUCACIÓN": [{
    "nombre": "Arauco Alvarez, Williams",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "warauco@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "wospinal@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Vilcahuaman Canto, Ofelia Ylma",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ovilcahuaman@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Manzanares Miranda, Angel Johny",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "amanzanares@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Paucar Bello Vda de Dongo, Patricia Ivon",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ppaucar@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Angeles Durand, Jose Enrique",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jangeles@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Astuhuaman Pardave, Julio Cesar",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jastuhuaman@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Victoria Ortega, Jessica Yohelma",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jvictoria@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Cristobal Miguel, Karim Gisela",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "kcristobal@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Piñas Casas, Jesica Karina",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jpiñas@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Meneses Madueño, Yrma Aida",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ymeneses@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Astuvilca Alderete, Edgar Pepe",
    "cargo": "AUXILIAR DE EDUCACION",
    "situacion": "REASIGNADO",
    "cumpleanos": "",
    "correo": "eastuvilca@mariscalcastilla.edu.pe",
  }],
  "NOTAS Y MATRICULAS": [{
    "nombre": "Medrano Salcedo, Carlos Alberto",
    "cargo": "OPERADOR PAD I - 1º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "cmedrano@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Vargas Salas, Jesus Alejandrino",
    "cargo": "OFICINISTA II - 2º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jvargas@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Puga Sakamoto Olga Yliana",
    "cargo": "OPERADOR PAD I - 3º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "opuga@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Flores Meza, Maxima Lucila",
    "cargo": "OFICINISTA II - 4º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mflores@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "OPERADOR PAD I - 5º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ssovero@mariscalcastilla.edu.pe",
  }],
  "ACTAS Y CERTIFICADOS": [{
    "nombre": "Sanabria Meza, Maria Luisa",
    "cargo": "OPERADOR PAD I",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "msanabria@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Bruno Torres, Maritza Sofia",
    "cargo": "OFICINISTA II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "mbruno@mariscalcastilla.edu.pe",
  }],
  "SECRETARIA GENERAL": [{
    "nombre": "(Vacante)",
    "cargo": "OFICINISTA II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ediaz@mariscalcastilla.edu.pe",
  }],
  "MESA DE PARTES": [{
    "nombre": "Iparraguirre Laveriano, Liber Maximiliano",
    "cargo": "OFICINISTA II - 1º GRADO",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "liparraguirre@mariscalcastilla.edu.pe",
  }],
  "TESORERIA": [{
    "nombre": "Vasquez Berrocal, Washington",
    "cargo": "AUXILIAR DE CONTABILIDAD",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "wvasquez@mariscalcastilla.edu.pe",
  }],
  "AUXILIAR DE LABORATORIO": [{
    "nombre": "Reyes Contreras, Apolonia",
    "cargo": "AUXILIAR DE LABORATORIO I",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "areyes@mariscalcastilla.edu.pe",
  }],
  "AUXILIAR DE BIBLIOTECA": [{
    "nombre": "Aguilar Acuña, Silvia Georgina",
    "cargo": "AUXILIAR DE BIBLIOTECA II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "saguilar@mariscalcastilla.edu.pe",
  }],
  "PATRIMONIO": [{
    "nombre": "Mendoza Chamorro, Ana Bertha",
    "cargo": "OFICINISTA II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "amendoza@mariscalcastilla.edu.pe",
  }],
  "TRABAJADOR DE SERVICIO": [{
    "nombre": "Castro Loayza, Sergio Lorenzo",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "scastro@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Chirinos Arroyo, Francisco",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "fchirinos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "TRABAJADOR DE SERVICIO III",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "",
  }, {
    "nombre": "Chuquivilca Ureta, Edyn Efrain",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "echuquivilca@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Cueva Espinal, Romualdo Fernando",
    "cargo": "TRABAJADOR DE SERVICIO III",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "rcueva@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Ore Arce, Julio Raul",
    "cargo": "TRABAJADOR DE SERVICIO III",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "jore@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Sovero Soto, Sam Isaac",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ssovero@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Yarasca Martinez, Alipio Luis",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "NOMBRADO",
    "cumpleanos": "",
    "correo": "ayarasca@mariscalcastilla.edu.pe",
  }, {
    "nombre": "(Vacante)",
    "cargo": "TRABAJADOR DE SERVICIO II",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "jmatos@mariscalcastilla.edu.pe",
  }, {
    "nombre": "Tacza Tacza, Fernando",
    "cargo": "TRABAJADOR DE SERVICIO III",
    "situacion": "CONTRATADO",
    "cumpleanos": "",
    "correo": "ftacza@mariscalcastilla.edu.pe",
  }],
};

// Descripción corta de cada área, se muestra en la cabecera de la Vista 2
const descripcionesAreas = {
  "DIRECTIVOS":
    "Lidera, organiza y gestiona los procesos pedagógicos e institucionales para asegurar la calidad educativa y el bienestar de la comunidad escolar.",
  "JERARQUICOS":
    "Coordinadores pedagógicos, de tutoría y jefes de laboratorio que articulan el trabajo docente por nivel y área curricular.",
  "MATEMÁTICA":
    "Desarrolla el pensamiento lógico, crítico y la resolución de problemas mediante el análisis numérico, geométrico y estadístico.",
  "COMUNICACIÓN":
    "Fomenta la comprensión lectora, la expresión oral y escrita, y el análisis crítico de textos.",
  "INGLÉS":
    "Desarrolla competencias comunicativas en una segunda lengua para interactuar en contextos globales.",
  "CIENCIA Y TECNOLOGÍA":
    "Promueve la indagación científica y la aplicación tecnológica para el cuidado ambiental y la salud.",
  "CC.SS. - DPCC":
    "Estudia los procesos históricos, geográficos y cívicos para construir una ciudadanía activa y democrática.",
  "ARTE Y CULTURA":
    "Estimula la sensibilidad, la creatividad y la expresión artística de los estudiantes.",
  "ED. RELIGIOSA":
    "Promueve la formación en valores y el conocimiento de la dimensión espiritual del ser humano.",
  "ED. FÍSICA":
    "Desarrolla la motricidad, el cuidado de la salud y la práctica de valores a través del deporte.",
  "EPT":
    "Educación para el Trabajo: desarrolla competencias técnico-productivas para la inserción laboral y el emprendimiento.",
  "PIP":
    "Personal del Aula de Innovación Pedagógica (AIP), a cargo de los recursos tecnológicos educativos.",
  "AUXILIARES DE EDUCACIÓN":
    "Apoya la formación integral y la convivencia escolar, velando por la disciplina y el bienestar estudiantil.",
  "NOTAS Y MATRICULAS":
    "Gestiona el registro académico: matrícula, actas de notas y trámites relacionados por grado.",
  "ACTAS Y CERTIFICADOS":
    "Encargada de la emisión y custodia de actas, certificados y documentación oficial de estudiantes.",
  "SECRETARIA GENERAL":
    "Gestiona la documentación y trámites administrativos de la dirección institucional.",
  "MESA DE PARTES":
    "Recibe y deriva la correspondencia y trámites documentarios de la institución.",
  "TESORERIA":
    "Administra los recursos económicos y la contabilidad institucional.",
  "AUXILIAR DE LABORATORIO":
    "Apoya la preparación y mantenimiento de los laboratorios de ciencias.",
  "AUXILIAR DE BIBLIOTECA":
    "Gestiona el préstamo y cuidado del material bibliográfico institucional.",
  "PATRIMONIO":
    "Administra, cuida y registra los bienes y recursos físicos de la institución.",
  "TRABAJADOR DE SERVICIO":
    "Personal dedicado al mantenimiento, limpieza y seguridad de los ambientes escolares.",
};

// Horarios de atención por área -> nombre exacto (tal cual aparece en
// directorioData) -> { padres: {...}, estudiantes: {...} }
// Cada día es null (sin atención ese día) o { hora, lugar }.
// Áreas que todavía no tienen horario cargado simplemente no aparecen acá;
// cuando llegue su información, se agrega una clave nueva con el mismo formato.
const horariosAtencion = {
  "EPT": {
    "Machuca Manrique, Diana Lili": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "martes": null,
        "miercoles": {
          "hora": "12:15-13:00",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "jueves": null,
        "viernes": null,
      },
    },
    "Ñaupari Rafael, Juan Carlos": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Rodriguez Davila, German Alexander": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRONICA" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Galarza Nuñez, María Isabel": {
      "padres": {
        "lunes": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "martes": null,
        "miercoles": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
      },
    },
    "Tacza Huaire, Guzman Domingo": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "3 HORA (T)", "lugar": "MECANICA PRODUCCION" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE MECANICA DE PRODUC.",
        },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Ruiz Tacunan, Delia": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
        "viernes": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "11:30-13:00",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Heredia Carrasco, Biuler": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "miercoles": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "11:30-13:00", "lugar": "TALLER DE ELECTRONICA" },
      },
    },
    "Quispe Paitan Edison": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
  },
  "ED. RELIGIOSA": {
    "Del Valle Aguirre, Edwin David": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "301C" },
        "miercoles": null,
        "jueves": { "hora": "7 HORA (M)", "lugar": "301C" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12.40 -14:10", "lugar": "301C" },
        "viernes": null,
      },
    },
    "Ricaldi Panez, Irma Luz": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "3-4 HORA(M)", "lugar": "302C" },
      },
      "estudiantes": {
        "lunes": { "hora": "12:40-13:25", "lugar": "302C" },
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:40-13:25", "lugar": "302C" },
        "viernes": null,
      },
    },
    "Ruiz Salazar, Janet Magaly": {
      "padres": {
        "lunes": { "hora": "5-6 HORA(T)", "lugar": "303C" },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": { "hora": "12:15-13:00", "lugar": "303C" },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "12:15-13:00", "lugar": "303C" },
      },
    },
    "Corilloclla Ccente Marisol": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "3 HORA (T)", "lugar": "301C" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": { "hora": "12:15-13:00", "lugar": "301C" },
        "jueves": null,
        "viernes": null,
      },
    },
    "Mucha Espinoza Yanina Katherine": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "6 HORA (M)", "lugar": "303C" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:40-13:25", "lugar": "303C" },
        "viernes": null,
      },
    },
    "Nolasco Novela Mirtha Soledad": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": { "hora": "Bolsa de horas", "lugar": "" },
        "martes": { "hora": "Bolsa de horas", "lugar": "" },
        "miercoles": { "hora": "Bolsa de horas", "lugar": "" },
        "jueves": { "hora": "Bolsa de horas", "lugar": "" },
        "viernes": { "hora": "Bolsa de horas", "lugar": "" },
      },
    },
    "Acuña Cardenas Melva": {
      "padres": {
        "lunes": { "hora": "5 HORA (M)", "lugar": "304C" },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": { "hora": "12:40-13:25", "lugar": "304C" },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Hermitaño Alvarado Sonia": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "3-4 HORA (T)", "lugar": "302C" },
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": { "hora": "11:30-13:00", "lugar": "30C" },
        "jueves": null,
        "viernes": null,
      },
    },
  },
  "ED. FISICA": {
    "Mendoza Colonio, Lizardo": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "martes": null,
        "miercoles": {
          "hora": "12:15-13:00",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "jueves": null,
        "viernes": null,
      },
    },
    "Laura Capcha, Gilmer Juan": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Saravia Galindo, Teresa Enma": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRONICA" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Carpena Cruz, David Roger": {
      "padres": {
        "lunes": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "martes": null,
        "miercoles": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
      },
    },
    "Enriquez Loayza Marina": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "3 HORA (T)", "lugar": "MECANICA PRODUCCION" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE MECANICA DE PRODUC.",
        },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Aliaga Orihuela, Isabel Marleny": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
        "viernes": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "11:30-13:00",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Cerron Ramos, Wilfredo Jose": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "miercoles": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "11:30-13:00", "lugar": "TALLER DE ELECTRONICA" },
      },
    },
    "Ataucusi Galvan, Ruth": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Lorenzo Huamancaja, Rosa Nelly": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Mendoza Rutti, Jose Miguel": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Mayta Atencio; Dimas Manuel": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Castillo Callupe Gabriel Alberti": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
  },
  "ARTE Y CULTURA": {
    "Castro Ladera, Dina Teodora": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "5 HORA (M)", "lugar": "INDUSTRIAS ALIMENTARIAS" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "martes": null,
        "miercoles": {
          "hora": "12:15-13:00",
          "lugar": "TALLER DE INDUSTRIAS ALIMENTARIAS",
        },
        "jueves": null,
        "viernes": null,
      },
    },
    "Hurtado Soller, Jose Luis": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Inga Morales, Samuel Zenon": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (M)", "lugar": "ELECTRICIDAD" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": { "hora": "12:40-13:25", "lugar": "TALLER DE ELECTRONICA" },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Inga Ortiz, Daniel Armando": {
      "padres": {
        "lunes": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "martes": null,
        "miercoles": { "hora": "5 HORA (M)", "lugar": "CONF. TEXTIL" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
      },
    },
    "Limaco Basurto, Oliver": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "3 HORA (T)", "lugar": "MECANICA PRODUCCION" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": {
          "hora": "12:40-13:25",
          "lugar": "TALLER DE MECANICA DE PRODUC.",
        },
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Palomino Flores, William Alfredo": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
        "viernes": { "hora": "5 HORA (T)", "lugar": "CONF. TEXTIL" },
      },
      "estudiantes": {
        "lunes": {
          "hora": "11:30-13:00",
          "lugar": "TALLER DE CONFECCION TEXTIL",
        },
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Salvatierra Orihuela, Lila Mercedes": {
      "padres": {
        "lunes": null,
        "martes": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "miercoles": { "hora": "5 HORA (T)", "lugar": "ELECTRONICA" },
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": { "hora": "11:30-13:00", "lugar": "TALLER DE ELECTRONICA" },
      },
    },
    "Lizana Martinez, Fernando": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Cerron Salvatierra, Ruben": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Gonzales Campos Luis Alfredo": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Jerónimo Mendoza Flor Judith": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
    "Filimon Jhon Naula Ramos": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "5 HORA (T)", "lugar": "CARPINTERIA" },
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": { "hora": "12:15-13:00", "lugar": "TALLER DE ELECTRICIDAD" },
        "viernes": null,
      },
    },
  },
  "CIENCIA Y TECNOLOGÍA": {
    "Perez Chavez, Yul Florencio": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Leguia Obregon Oscar Armando": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Villon Espejo, Luz Elsa": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Bejarano Rodriguez, Margarita Florencia": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Ramirez Nuñez, Carmen Rosa": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Baldarrago Escurra Raquel Pilar": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Mallma Lifonzo, Marleny": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Andrade Salome, Julia Elizabeth": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Narvaez Alanya, Ivan Kock": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Medina Catay, Robert Stalin": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
  },
  "CC.SS. -DPCC": {
    "Travezaño Condor, Silvia Olinda": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Pariona Pariona, Alicia": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Flores Paitan, Ybonne Yoan": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Huaman Baquerizo de Avellaneda, Elva Libia": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Monroy Astete, Nelly Mercedes": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Bonilla Colonio, Rosario Luz": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Piñas Samaniego, Filadelfo Dimas": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Morales Lozada, Elizabeth Norma": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Romani Gamion, Maricela Esperanza": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Parraguirre Cordova, Carolina": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Trujillo Meza, Marco Antonio": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Campos Nuñez, Antonio": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Castro Gaspar, Magno": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Dextre Revolo, Yudee Teresa": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Salazar Gamarra, Raul Armando": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Zuñiga Norero, Daniel Angel": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Hinostroza Alvino, Jakelyn Jenyfer": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Rojas Castro, Pedro Florencio": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Brañez Cochachi, Marco Antonio": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Utos Barrante, Uber Elfri": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Mendoza Mendoza, Maricielo": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Lopez Caballero, Elizabeth Monica": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
    "Cenzano Pecho, Blanca Eva": {
      "padres": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
      "estudiantes": {
        "lunes": null,
        "martes": null,
        "miercoles": null,
        "jueves": null,
        "viernes": null,
      },
    },
  },
};

const DIAS_SEMANA = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
];

/* ============================ ESTADO ============================ */

let areaActual = "";
let personaActual = "";

/* ============================ UTILIDADES ============================ */

function obtenerDescripcion(area) {
  return descripcionesAreas[area] ||
    "Área encargada de desarrollar competencias específicas dentro de la institución.";
}

function iniciales(nombre) {
  const limpio = nombre.replace("(Vacante)", "V").trim();
  const partes = limpio.split(/[\s,]+/).filter(Boolean);
  if (partes.length === 0) return "—";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Devuelve el horario de una persona o null si todavía no está cargado
function obtenerHorarioPersona(area, nombre) {
  return (horariosAtencion[area] && horariosAtencion[area][nombre]) || null;
}

function tieneHorario(area, nombre) {
  return obtenerHorarioPersona(area, nombre) !== null;
}

/* ============================ VISTA 1: ÁREAS ============================ */

function renderizarTarjetasAreas(filtro) {
  const grid = document.getElementById("grid-areas");
  grid.innerHTML = "";
  const areas = Object.keys(directorioData);

  const labelEl = document.getElementById("areas-count-label");
  if (labelEl) {
    labelEl.textContent = `Áreas y oficinas · ${areas.length} en total`;
  }

  const texto = filtro ? filtro.toLowerCase().trim() : "";
  let visibles = 0;

  areas.forEach((area, i) => {
    const miembros = directorioData[area];
    if (!miembros || miembros.length === 0) return;

    const matchArea = area.toLowerCase().includes(texto);
    const matchMiembro = miembros.some((d) =>
      d.nombre.toLowerCase().includes(texto) ||
      (d.cargo || "").toLowerCase().includes(texto)
    );
    const visible = !texto || matchArea || matchMiembro;
    if (visible) visibles++;

    const div = document.createElement("div");
    div.className = "card-area" + (visible ? " match" : "");
    div.dataset.area = area;
    div.onclick = () => mostrarDetalleArea(area);
    div.innerHTML = `
      <span class="idx">${String(i + 1).padStart(2, "0")}</span>
      <h3>${area}</h3>
      <span class="badge-count">${miembros.length} ${
      miembros.length === 1 ? "integrante" : "integrantes"
    }</span>
    `;
    grid.appendChild(div);
  });

  if (visibles === 0) {
    grid.innerHTML =
      `<div class="no-match">No se encontraron áreas ni personas que coincidan con "${filtro}".</div>`;
  }
}

function buscarGlobal() {
  const texto = document.getElementById("input-buscador-global").value;
  renderizarTarjetasAreas(texto);
}

/* ============================ VISTA 2: PERSONAS DE UN ÁREA ============================ */

function mostrarDetalleArea(area) {
  areaActual = area;
  document.getElementById("detalle-titulo").textContent = area;
  document.getElementById("detalle-descripcion").textContent =
    obtenerDescripcion(area);
  document.getElementById("input-buscador").value = "";
  renderizarDocentes(directorioData[area]);
  cambiarVista("vista-detalle");
}

function mostrarVistaAreas() {
  cambiarVista("vista-areas");
}

function renderizarDocentes(lista) {
  const grid = document.getElementById("grid-docentes");
  document.getElementById("total-docentes").textContent = lista.length;
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML =
      `<div class="no-results">No se encontraron personas con esa búsqueda.</div>`;
    return;
  }

  lista.forEach((doc) => {
    const conHorario = tieneHorario(areaActual, doc.nombre);

    const card = document.createElement("div");
    card.className = "card-docente" + (conHorario ? " con-horario" : "");
    card.onclick = () => mostrarHorarioPersona(areaActual, doc.nombre);

    const htmlCargo = doc.cargo
      ? `<span class="cargo">${doc.cargo}</span>${
        doc.situacion
          ? `<span class="situacion-tag">${doc.situacion}</span>`
          : ""
      }`
      : `<span class="cargo">Personal institucional</span>`;

    const htmlCorreo = doc.correo
      ? `<div class="info-line"><span class="ic">✉</span><a href="mailto:${doc.correo}" onclick="event.stopPropagation()">${doc.correo}</a></div>`
      : ``;
    const htmlCumple = doc.cumpleanos
      ? `<div class="info-line"><span class="ic">✦</span>${doc.cumpleanos}</div>`
      : ``;
    const htmlHorarioTag = conHorario
      ? `<div class="tag-horario">📅 Ver horario de atención</div>`
      : ``;

    card.innerHTML = `
      <div class="carnet-top">
        <div class="avatar">${iniciales(doc.nombre)}</div>
        <div>
          <h4>${doc.nombre}</h4>
          <div class="carnet-id">IE Mariscal Castilla</div>
        </div>
      </div>
      <div class="carnet-body">
        ${htmlCargo}
        ${htmlCorreo}
        ${htmlCumple}
        ${htmlHorarioTag}
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrarDocentes() {
  const texto = document.getElementById("input-buscador").value.toLowerCase();
  const docentesArea = directorioData[areaActual] || [];
  const filtrados = docentesArea.filter((doc) =>
    doc.nombre.toLowerCase().includes(texto) ||
    (doc.cargo || "").toLowerCase().includes(texto)
  );
  renderizarDocentes(filtrados);
}

/* ============================ VISTA 3: HORARIO DE ATENCIÓN ============================ */

function mostrarHorarioPersona(area, nombre) {
  areaActual = area;
  personaActual = nombre;

  const persona = (directorioData[area] || []).find((d) => d.nombre === nombre);

  document.getElementById("horario-nombre").textContent = nombre;
  document.getElementById("horario-cargo").textContent = persona
    ? persona.cargo
    : "";
  document.getElementById("horario-area").textContent = area;

  renderizarHorario(area, nombre);
  cambiarVista("vista-horario");
}

function volverADetalleArea() {
  cambiarVista("vista-detalle");
}

function renderizarHorario(area, nombre) {
  const contenedor = document.getElementById("horario-contenido");
  const horario = obtenerHorarioPersona(area, nombre);

  if (!horario) {
    contenedor.innerHTML = `
      <div class="horario-vacio">
        Aún no se ha registrado el horario de atención de esta persona.
        Esta información se irá completando más adelante.
      </div>`;
    return;
  }

  contenedor.innerHTML = `
    ${construirTablaHorario("Atención a padres de familia", horario.padres)}
    ${construirTablaHorario("Atención a estudiantes", horario.estudiantes)}
  `;
}

function construirTablaHorario(titulo, datosSemana) {
  if (!datosSemana) {
    return `
      <div class="bloque-horario">
        <h3 class="horario-titulo">${titulo}</h3>
        <div class="horario-vacio-parcial">Sin información registrada.</div>
      </div>`;
  }

  const filas = DIAS_SEMANA.map(({ key, label }) => {
    const info = datosSemana[key];
    if (!info) {
      return `
        <div class="horario-dia sin-atencion">
          <span class="horario-dia-label">${label}</span>
          <span class="horario-dia-valor">—</span>
        </div>`;
    }
    return `
      <div class="horario-dia">
        <span class="horario-dia-label">${label}</span>
        <span class="horario-dia-valor">
          <strong>${info.hora}</strong>
          ${
      info.lugar ? `<span class="horario-lugar">${info.lugar}</span>` : ""
    }
        </span>
      </div>`;
  }).join("");

  return `
    <div class="bloque-horario">
      <h3 class="horario-titulo">${titulo}</h3>
      <div class="horario-grid">${filas}</div>
    </div>`;
}

/* ============================ NAVEGACIÓN ENTRE VISTAS ============================ */

function cambiarVista(idVistaDestino) {
  const vistas = ["vista-areas", "vista-detalle", "vista-horario"];
  vistas.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (id === idVistaDestino) ? "block" : "none";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================ INICIO ============================ */

renderizarTarjetasAreas();
cambiarVista("vista-areas");
