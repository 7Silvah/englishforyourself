// Todos los textos de la interfaz. Ningún texto visible va suelto en JSX.
export const es = {
  app: {
    name: "English for Yourself",
    tagline: "Aprende inglés desde el español",
  },
  a11y: {
    skipToContent: "Saltar al contenido",
    openMenu: "Abrir menú",
    mainNav: "Navegación principal",
  },
  nav: {
    home: "Inicio",
    course: "Curso",
    exercises: "Ejercicios",
    library: "Biblioteca",
    progress: "Progreso",
    about: "Acerca de",
  },
  theme: {
    toggle: "Cambiar tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  },
  home: {
    title: "Aprende inglés desde el español",
    intro:
      "Explicaciones claras en español, la estructura del inglés paso a paso y ejercicios interactivos para practicar cada tema.",
    startCourse: "Empieza el curso",
    browseLibrary: "Explorar la biblioteca",
    pillars: {
      course: {
        title: "Curso de Fundamentos",
        description:
          "Unidad por unidad: cómo se arma una frase en inglés, comparada con el español.",
      },
      exercises: {
        title: "Ejercicios interactivos",
        description: "Completa, ordena, transforma y corrige frases con corrección al instante.",
      },
      library: {
        title: "Biblioteca",
        description:
          "Más de 150 lecciones de consulta: tiempos verbales, gramática, vocabulario y más.",
      },
    },
  },
  course: {
    title: "Curso de Fundamentos",
    description: "La estructura básica del inglés, unidad por unidad.",
    unit: "Unidad",
  },
  exercises: {
    title: "Ejercicios",
    description: "Practica cada tema con ejercicios interactivos.",
    set: "Ejercicio",
    itemsCount: (n: number) => (n === 1 ? "1 ejercicio" : `${n} ejercicios`),
  },
  library: {
    title: "Biblioteca",
    description: "Lecciones de consulta organizadas por temas.",
    lesson: "Lección",
    lessonsCount: (n: number) => (n === 1 ? "1 lección" : `${n} lecciones`),
    wordsCount: (n: number) => (n === 1 ? "1 palabra" : `${n} palabras`),
    wordlist: "Lista",
    partOf: "Parte de",
    inThisTopic: "En este tema",
    previous: "Anterior",
    next: "Siguiente",
    practice: "Practica este tema",
    emptySection: "Esta sección todavía no tiene lecciones.",
  },
  progress: {
    title: "Tu progreso",
    description: "Unidades, ejercicios y repasos completados.",
  },
  about: {
    title: "Acerca de English for Yourself",
    body: [
      "English for Yourself es una app gratuita para aprender inglés desde el español: explicaciones en español, ejemplos en inglés y ejercicios para practicar.",
      "Las lecciones de la Biblioteca provienen del sitio englishforyourself.com, recuperado del archivo público de Internet Archive. Este proyecto no está afiliado a sus autores originales.",
    ],
  },
  notFound: {
    title: "Página no encontrada",
    description: "La página que buscas no existe o cambió de dirección.",
    backHome: "Volver al inicio",
  },
  placeholder: {
    comingSoon: "Próximamente",
    phase: (phase: string) => `Esta sección se construye en la fase ${phase} del plan.`,
  },
  footer: {
    madeFor: "Hecho para hispanohablantes que aprenden inglés.",
  },
} as const;
