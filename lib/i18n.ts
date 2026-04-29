import { Compass, LayoutDashboard, List, PlusCircle } from "lucide-react";

export const LOCALE_COOKIE_NAME = "locale";
export const DEFAULT_LOCALE = "es";

export type Locale = "es" | "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en";
}

const dictionaries = {
  es: {
    metadata: {
      title: "Restaurant Roulette",
      description:
        "Guarda restaurantes, organízalos y gira una ruleta elegante para decidir tu próxima salida."
    },
    common: {
      email: "Correo electrónico",
      password: "Contraseña",
      loading: "Cargando tu tablero de restaurantes...",
      saveRestaurant: "Guardar restaurante",
      updateRestaurant: "Guardar cambios",
      viewCatalog: "Ver catalogo",
      addRestaurant: "Agregar restaurante",
      addRestaurants: "Agregar restaurantes",
      noRating: "Sin calificacion",
      unspecified: "Sin especificar",
      openingHoursUnavailable: "Horario no disponible",
      notYetVisited: "Aun sin visitar",
      signOut: "Cerrar sesion",
      signedIn: "Sesion activa",
      spanish: "Espanol",
      english: "Ingles",
      language: "Idioma",
      appearance: "Apariencia",
      lightMode: "Claro",
      darkMode: "Oscuro"
    },
    nav: {
      dashboard: "Inicio",
      add: "Agregar",
      catalog: "Catalogo",
      roulette: "Ruleta",
      lists: "Listas"
    },
    shell: {
      brandSubtitle: "Decide la siguiente cita",
      smartShortlistTitle: "Lista inteligente",
      smartShortlistBody:
        "Trae datos desde Google Places y luego completa con tus notas, visitas, etiquetas y favoritos.",
      workspace: "Espacio",
      currentLanguage: "Idioma actual"
    },
    login: {
      eyebrow: "Restaurant Roulette",
      title: "Construye una lista corta que de verdad quieras visitar.",
      description:
        "Guarda restaurantes prometedores, agrega notas para la siguiente salida y gira la ruleta cuando el grupo no logra decidir.",
      signInTitle: "Iniciar sesion",
      signInDescription: "Continua con tu cuenta existente.",
      signInButton: "Entrar",
      googleButton: "Continuar con Google",
      signUpTitle: "Crear cuenta",
      signUpDescription: "Configura un espacio privado para tus lugares guardados.",
      signUpButton: "Crear cuenta",
      openSignUpButton: "Crear cuenta nueva",
      closeSignUp: "Cerrar formulario de registro",
      passwordPlaceholder: "Escribe tu contrasena",
      strongPasswordPlaceholder: "Elige una contrasena segura",
      emailPlaceholder: "tu@correo.com"
    },
    lists: {
      title: "Listas compartidas",
      description: "Crea grupos de restaurantes, invita amigos y cambia la lista activa antes de usar la ruleta.",
      activeList: "Lista activa",
      switchList: "Cambiar lista",
      importTitle: "Importar restaurantes",
      importDescription: "Copia restaurantes desde otra lista accesible hacia esta lista.",
      importSourceList: "Lista de origen",
      importRestaurants: "Restaurantes a importar",
      importButton: "Importar a esta lista",
      importEmpty: "Esta lista no tiene restaurantes disponibles para importar.",
      importSelectedCount: "{count} restaurantes seleccionados",
      deleteList: "Borrar lista",
      cannotDeletePersonal: "La lista personal no se puede borrar",
      members: "miembros",
      owner: "Propietario",
      member: "Miembro",
      createTitle: "Crear lista",
      createName: "Nombre de la lista",
      createDescription: "Descripcion",
      createButton: "Crear lista",
      inviteTitle: "Invitar amigo",
      inviteEmail: "Correo del invitado",
      inviteList: "Lista",
      inviteButton: "Enviar invitacion",
      pendingTitle: "Invitaciones pendientes",
      acceptButton: "Aceptar invitacion",
      emptyPending: "No tienes invitaciones pendientes.",
      personalBadge: "Personal",
      groupBadge: "Compartida"
    },
    dashboard: {
      emptyEyebrow: "Resumen",
      emptyTitle: "Tu espacio de restaurantes empieza aqui.",
      emptyDescription:
        "Agrega el primer lugar desde Google Maps y luego usa el catalogo y la ruleta para convertir una lista suelta en un plan real.",
      emptyStateTitle: "Todavia no has guardado restaurantes",
      emptyStateDescription:
        "Empieza con un enlace de Google Maps o un place ID y la app rellenara los detalles utiles por ti.",
      emptyStateCta: "Agregar tu primer restaurante",
      eyebrow: "Panel",
      title: "Una vista mas clara de donde deberias comer despues.",
      description:
        "Sigue lo que guardaste, detecta lo que aun no pruebas y mantén la lista viva en lugar de perderla en notas viejas.",
      quickSnapshot: "Resumen rapido",
      savedPlaces: "Lugares guardados",
      unvisitedOptions: "Opciones sin visitar",
      favorites: "Favoritos",
      averageRating: "Calificacion promedio",
      recentAdditions: "Agregados recientes",
      newestIdeas: "Las ideas mas nuevas de tu lista.",
      visits: "Visitas",
      lastVisited: "Ultima visita",
      playbook: "Guia rapida",
      popularTags: "Etiquetas populares",
      addTagsHint: "Agrega etiquetas en cada restaurante para crear grupos personalizados.",
      recentVisits: "Visitas recientes",
      recentVisitsDescription: "Restaurantes que ya salieron del backlog.",
      recentVisitsEmpty: "Marca una visita desde el catalogo para empezar a construir historial.",
      favoritePicks: "Favoritos del momento",
      favoritePicksDescription: "Una lista corta para tus ganadores recurrentes.",
      favoritePicksEmpty: "Marca cualquier restaurante como favorito para fijarlo aqui."
    },
    tips: [
      "Pega un enlace de Google Maps y deja que Places complete lo esencial.",
      "Usa etiquetas para agrupar citas, comidas de trabajo o brunch de fin de semana.",
      "Marca favoritos y gira solo entre lugares sin visitar cuando nadie se pone de acuerdo."
    ],
    add: {
      eyebrow: "Agregar restaurante",
      title: "Guarda un lugar prometedor antes de que se pierda en el chat.",
      description:
        "Pega un enlace de Google Maps o un place ID para autocompletar el perfil del restaurante y luego ajusta los detalles a tu forma de planear.",
      editEyebrow: "Editar restaurante",
      editTitle: "Actualiza la ficha del restaurante sin perder el historial.",
      editDescription:
        "Ajusta los datos guardados, corrige detalles importados desde Google Places y mantén notas, visitas y favoritos al dia.",
      prefillTitle: "Empieza con Google Places",
      prefillDescription: "Pega un enlace de Google Maps o un place ID para rellenar el formulario.",
      prefillButton: "Rellenar datos",
      lookupSourceLocal: "Reutilizado desde restaurantes guardados",
      lookupSourceCache: "Cargado desde cache temporal",
      lookupSourceGoogle: "Consultado en vivo desde Google Places",
      name: "Nombre del restaurante",
      category: "Categoria",
      cuisine: "Tipo de cocina",
      priceLevel: "Nivel de precio",
      selectPriceLevel: "Selecciona el nivel de precio",
      rating: "Calificacion",
      visitCount: "Numero de visitas",
      lastVisited: "Ultima visita",
      tags: "Etiquetas",
      tagsPlaceholder: "Cita, comida de equipo, brunch",
      openingHours: "Horario",
      notes: "Notas",
      notesPlaceholder: "Platos a probar, estacionamiento, quien lo recomendo...",
      favorite: "Marcar como favorito",
      sidebarStoredTitle: "Que se guarda",
      sidebarStored1: "Nombre, categoria, cocina, horario, calificacion y precio pueden venir desde Google Places.",
      sidebarStored2: "Visitas, notas, etiquetas, favoritos e historial de visitas quedan privados para el usuario actual.",
      sidebarStored3: "Puedes corregir cualquier campo antes de guardar, incluso si Places llega incompleto.",
      sidebarFlowTitle: "Flujo recomendado",
      flow: [
        "Pega el enlace de Google Maps desde una recomendacion.",
        "Ajusta cocina, etiquetas o notas segun tu forma de organizar restaurantes.",
        "Usa el catalogo para registrar visitas y la ruleta para elegir la siguiente mesa."
      ]
    },
    catalog: {
      eyebrow: "Catalogo",
      title: "Filtra la lista como una herramienta de decision real.",
      description:
        "Separa tus restaurantes por categoria, cocina, calificacion y precio, y luego ordena segun el momento exacto.",
      emptyTitle: "Aun no hay nada en el catalogo",
      emptyDescription: "Agrega un restaurante primero para empezar a filtrar, ordenar y registrar visitas.",
      search: "Buscar",
      searchPlaceholder: "Buscar por nombre o etiqueta",
      allCategories: "Todas las categorias",
      allCuisineTypes: "Todos los tipos de cocina",
      minimumRating: "Calificacion minima",
      anyRating: "Cualquier calificacion",
      allPriceLevels: "Todos los niveles de precio",
      favoritesFilter: "Favoritos",
      allFavorites: "Todos",
      favoritesOnly: "Solo favoritos",
      visitFilter: "Estado de visita",
      allVisits: "Todos",
      unvisitedOnly: "Sin visitar",
      visitedOnly: "Ya visitados",
      sortBy: "Ordenar por",
      showing: "Mostrando",
      of: "de",
      restaurants: "restaurantes",
      favorite: "Favorito",
      favorited: "En favoritos",
      edit: "Editar",
      logVisit: "Registrar visita",
      delete: "Borrar",
      added: "Agregado",
      notes: "Notas"
    },
    roulette: {
      eyebrow: "Ruleta",
      title: "Cuando el grupo se atasca, deja que la rueda decida.",
      description:
        "Gira entre todos los restaurantes guardados, solo los no visitados o tus favoritos frecuentes. El elegido aparece claramente al terminar.",
      emptyTitle: "La ruleta necesita opciones",
      emptyDescription: "Agrega algunos restaurantes y la rueda se construira con tus lugares guardados.",
      spinTitle: "Gira la lista corta",
      spinDescription:
        "Puedes incluir toda la lista, solo los lugares nuevos o una seleccion mas cerrada de los mas repetidos.",
      currentPool: "Pool actual",
      allPool: "Todos los lugares guardados estan en la rueda.",
      unvisitedPool: "Solo se incluyen lugares con cero visitas.",
      favoritesPool: "Solo se incluyen tus restaurantes marcados como favoritos.",
      categoryPool: "La ruleta usa la categoria {category}.",
      categoryPoolEmpty: "Selecciona una categoria para construir el pool.",
      manualPool: "El pool manual incluye {count} restaurantes elegidos por ti.",
      manualPoolEmpty: "Selecciona restaurantes manualmente para crear el pool.",
      spinning: "Girando...",
      spinButton: "Girar ruleta",
      openInMaps: "Abrir en Google Maps",
      categoryLabel: "Categoria para la ruleta",
      categoryPlaceholder: "Selecciona una categoria",
      manualPickerButton: "Elegir restaurantes manualmente",
      manualPickerTitle: "Arma tu pool manual",
      manualPickerDescription: "Cambia entre listas y ve marcando restaurantes. La seleccion se acumula aunque vengan de listas distintas.",
      manualSelectionCount: "{count} restaurantes seleccionados",
      listLabel: "Lista disponible",
      restaurantLabel: "Restaurantes para el pool",
      manualPickerEmpty: "Esta lista no tiene restaurantes disponibles.",
      manualPickerCancel: "Cancelar",
      manualPickerApply: "Usar seleccion",
      selectedRestaurant: "Restaurante seleccionado",
      selectedPlaceholder: "Gira la rueda y aqui aparecera el restaurante elegido con sus detalles clave.",
      selectedHint: "Usa los filtros primero si quieres un grupo mas acotado.",
      visitsSoFar: "Visitas hasta ahora",
      howItWorks: "Como funciona",
      how1: "Cada restaurante guardado se convierte en un segmento de la rueda.",
      how2: "La animacion usa un giro largo y suave para que la seleccion se sienta deliberada.",
      how3: "Cuando la rueda termina, el restaurante elegido aparece con categoria, calificacion y precio.",
      bestUseCases: "Mejores casos de uso",
      useCases: ["Comida de viernes", "Cita", "Probar algo nuevo", "Repetir favoritos"]
    },
    authMessages: {
      invalidCredentials: "Usa un correo valido y una contrasena de al menos 8 caracteres.",
      createdAccount:
        "Cuenta creada. Si la confirmacion por correo esta activa, revisa tu bandeja antes de iniciar sesion."
    },
    formMessages: {
      reviewForm: "Revisa los valores del formulario e intentalo otra vez.",
      sessionExpired: "Tu sesion expiro. Inicia sesion nuevamente para continuar.",
      placeLookupFailed: "No se pudieron obtener los detalles del lugar.",
      unauthorized: "No autorizado",
      placesKeyMissing: "GOOGLE_PLACES_API_KEY no esta configurada."
    },
    sortOptions: {
      recent: "Mas recientes",
      rating: "Mejor calificados",
      visited: "Mas visitados"
    },
    rouletteFilters: {
      all: "Todos",
      unvisited: "Sin visitar",
      favorites: "Mis favoritos",
      category: "Por categoria",
      manual: "Seleccion manual"
    }
  },
  en: {
    metadata: {
      title: "Restaurant Roulette",
      description: "Save restaurants, organize them, and spin a polished roulette to choose your next outing."
    },
    common: {
      email: "Email",
      password: "Password",
      loading: "Loading your restaurant board...",
      saveRestaurant: "Save restaurant",
      updateRestaurant: "Save changes",
      viewCatalog: "Open catalog",
      addRestaurant: "Add restaurant",
      addRestaurants: "Add restaurants",
      noRating: "No rating",
      unspecified: "Unspecified",
      openingHoursUnavailable: "Opening hours unavailable",
      notYetVisited: "Not yet visited",
      signOut: "Log out",
      signedIn: "Signed in",
      spanish: "Spanish",
      english: "English",
      language: "Language",
      appearance: "Appearance",
      lightMode: "Light",
      darkMode: "Dark"
    },
    nav: {
      dashboard: "Dashboard",
      add: "Add Restaurant",
      catalog: "Catalog",
      roulette: "Roulette",
      lists: "Lists"
    },
    shell: {
      brandSubtitle: "Decide the next date",
      smartShortlistTitle: "Smart shortlist",
      smartShortlistBody:
        "Pull details from Google Places, then keep your own notes, visits, tags, and favorites layered on top.",
      workspace: "Workspace",
      currentLanguage: "Current language"
    },
    login: {
      eyebrow: "Restaurant Roulette",
      title: "Build a shortlist worth actually visiting.",
      description:
        "Save promising restaurants, keep notes for the next outing, and spin a polished roulette when the group hits decision fatigue.",
      signInTitle: "Sign in",
      signInDescription: "Continue with your existing account.",
      signInButton: "Sign in",
      googleButton: "Continue with Google",
      signUpTitle: "Create account",
      signUpDescription: "Set up a private workspace for your saved places.",
      signUpButton: "Create account",
      openSignUpButton: "Create new account",
      closeSignUp: "Close sign-up form",
      passwordPlaceholder: "Enter your password",
      strongPasswordPlaceholder: "Choose a strong password",
      emailPlaceholder: "you@example.com"
    },
    lists: {
      title: "Shared lists",
      description: "Create restaurant groups, invite friends, and switch the active list before using the roulette.",
      activeList: "Active list",
      switchList: "Switch list",
      importTitle: "Import restaurants",
      importDescription: "Copy restaurants from another accessible list into this list.",
      importSourceList: "Source list",
      importRestaurants: "Restaurants to import",
      importButton: "Import into this list",
      importEmpty: "This list does not have restaurants available to import.",
      importSelectedCount: "{count} restaurants selected",
      deleteList: "Delete list",
      cannotDeletePersonal: "The personal list cannot be deleted",
      members: "members",
      owner: "Owner",
      member: "Member",
      createTitle: "Create list",
      createName: "List name",
      createDescription: "Description",
      createButton: "Create list",
      inviteTitle: "Invite friend",
      inviteEmail: "Invitee email",
      inviteList: "List",
      inviteButton: "Send invitation",
      pendingTitle: "Pending invitations",
      acceptButton: "Accept invitation",
      emptyPending: "You do not have any pending invitations.",
      personalBadge: "Personal",
      groupBadge: "Shared"
    },
    dashboard: {
      emptyEyebrow: "Overview",
      emptyTitle: "Your restaurant workspace starts here.",
      emptyDescription:
        "Add the first place from Google Maps, then use the catalog and roulette to turn a loose idea list into something you can actually act on.",
      emptyStateTitle: "No restaurants saved yet",
      emptyStateDescription:
        "Start with a Google Maps link or place ID and the app will prefill the useful details for you.",
      emptyStateCta: "Add your first restaurant",
      eyebrow: "Dashboard",
      title: "A sharper view of where you should eat next.",
      description:
        "Track what you have saved, spot what is still unexplored, and keep the shortlist moving instead of fading into a notes app graveyard.",
      quickSnapshot: "Quick snapshot",
      savedPlaces: "Saved places",
      unvisitedOptions: "Unvisited options",
      favorites: "Favorites",
      averageRating: "Average rating",
      recentAdditions: "Recent additions",
      newestIdeas: "The newest ideas in your queue.",
      visits: "Visits",
      lastVisited: "Last visited",
      playbook: "Playbook",
      popularTags: "Popular tags",
      addTagsHint: "Add tags on restaurant cards to build custom slices.",
      recentVisits: "Recent visits",
      recentVisitsDescription: "Restaurants that already made it out of the backlog.",
      recentVisitsEmpty: "Mark a restaurant as visited from the catalog to start building history.",
      favoritePicks: "Favorite picks",
      favoritePicksDescription: "A quick shortlist for repeat winners.",
      favoritePicksEmpty: "Toggle the favorite badge on any saved restaurant to pin your standouts here."
    },
    tips: [
      "Paste a Google Maps link and let Places fill in the essentials.",
      "Use tags to group date-night spots, work lunches, or weekend brunch ideas.",
      "Mark favorites and spin only unvisited places when the group cannot decide."
    ],
    add: {
      eyebrow: "Add restaurant",
      title: "Capture a promising place before it disappears into chat history.",
      description:
        "Paste a Google Maps URL or place ID to prefill the restaurant profile, then tailor the details for your own planning style.",
      editEyebrow: "Edit restaurant",
      editTitle: "Update the restaurant profile without losing its history.",
      editDescription:
        "Adjust saved details, correct imported Google Places data, and keep notes, visits, and favorites current.",
      prefillTitle: "Start with Google Places",
      prefillDescription: "Paste a Google Maps link or place ID to prefill the form.",
      prefillButton: "Prefill details",
      lookupSourceLocal: "Reused from saved restaurants",
      lookupSourceCache: "Loaded from temporary cache",
      lookupSourceGoogle: "Fetched live from Google Places",
      name: "Restaurant name",
      category: "Category",
      cuisine: "Cuisine type",
      priceLevel: "Price level",
      selectPriceLevel: "Select price level",
      rating: "Rating",
      visitCount: "Visit count",
      lastVisited: "Last visited",
      tags: "Tags",
      tagsPlaceholder: "Date night, team lunch, brunch",
      openingHours: "Opening hours",
      notes: "Notes",
      notesPlaceholder: "Best dishes to try, parking tips, who recommended it...",
      favorite: "Mark as favorite",
      sidebarStoredTitle: "What gets stored",
      sidebarStored1: "Name, category, cuisine, hours, rating, and pricing can be prefilled from Google Places.",
      sidebarStored2: "Visits, notes, tags, favorites, and last-visited history stay private to the signed-in user.",
      sidebarStored3: "You can adjust any prefilled field before saving, so the app stays useful even when Places data is incomplete.",
      sidebarFlowTitle: "Recommended workflow",
      flow: [
        "Paste the Google Maps link from a recommendation thread.",
        "Tweak cuisine, tags, or notes to fit how you plan restaurants.",
        "Use the catalog to log visits and the roulette to pick the next table."
      ]
    },
    catalog: {
      eyebrow: "Catalog",
      title: "Filter the list like a real decision tool.",
      description:
        "Slice your saved restaurants by category, cuisine, rating, and pricing, then sort for the exact moment.",
      emptyTitle: "Nothing in the catalog yet",
      emptyDescription: "Add a restaurant first so you can start filtering, sorting, and logging visits.",
      search: "Search",
      searchPlaceholder: "Search names or tags",
      allCategories: "All categories",
      allCuisineTypes: "All cuisine types",
      minimumRating: "Minimum rating",
      anyRating: "Any rating",
      allPriceLevels: "All price levels",
      favoritesFilter: "Favorites",
      allFavorites: "All",
      favoritesOnly: "Favorites only",
      visitFilter: "Visit status",
      allVisits: "All",
      unvisitedOnly: "Unvisited only",
      visitedOnly: "Visited only",
      sortBy: "Sort by",
      showing: "Showing",
      of: "of",
      restaurants: "restaurants",
      favorite: "Favorite",
      favorited: "Favorited",
      edit: "Edit",
      logVisit: "Log visit",
      delete: "Delete",
      added: "Added",
      notes: "Notes"
    },
    roulette: {
      eyebrow: "Roulette",
      title: "When the group stalls, let the wheel settle it.",
      description:
        "Spin across every saved restaurant, only untouched options, or your frequent standbys. The selected place appears clearly once the animation finishes.",
      emptyTitle: "The roulette needs options",
      emptyDescription: "Add a few restaurants to your list and the wheel will build itself from your saved places.",
      spinTitle: "Spin the shortlist",
      spinDescription: "Pick the whole list, only untouched places, or a tighter frequent-picks pool.",
      currentPool: "Current pool",
      allPool: "Everything you have saved is on the wheel.",
      unvisitedPool: "Only places with zero visits are included.",
      favoritesPool: "Only your favorited restaurants are included.",
      categoryPool: "The wheel is using the {category} category.",
      categoryPoolEmpty: "Choose a category to build the pool.",
      manualPool: "Your manual pool currently includes {count} restaurants.",
      manualPoolEmpty: "Select restaurants manually to build the pool.",
      spinning: "Spinning...",
      spinButton: "Spin roulette",
      openInMaps: "Open in Google Maps",
      categoryLabel: "Roulette category",
      categoryPlaceholder: "Choose a category",
      manualPickerButton: "Pick restaurants manually",
      manualPickerTitle: "Build your manual pool",
      manualPickerDescription: "Switch between lists and keep checking restaurants. The selection accumulates across different lists.",
      manualSelectionCount: "{count} restaurants selected",
      listLabel: "Available list",
      restaurantLabel: "Restaurants in pool",
      manualPickerEmpty: "This list does not have restaurants available.",
      manualPickerCancel: "Cancel",
      manualPickerApply: "Use selection",
      selectedRestaurant: "Selected restaurant",
      selectedPlaceholder: "Spin the wheel and the chosen restaurant will land here with the key details you need.",
      selectedHint: "Use the filter chips first if you want a tighter pool.",
      visitsSoFar: "Visits so far",
      howItWorks: "How it works",
      how1: "Each saved restaurant becomes a segment on the wheel.",
      how2: "The animation uses a long eased rotation to keep the spin feeling deliberate instead of abrupt.",
      how3: "Once the wheel settles, the chosen restaurant details are surfaced alongside the category, rating, and price level.",
      bestUseCases: "Best use cases",
      useCases: ["Friday team lunch", "Date night", "Try something new", "Repeat favorites"]
    },
    authMessages: {
      invalidCredentials: "Use a valid email and a password with at least 8 characters.",
      createdAccount:
        "Account created. If email confirmation is enabled, verify your inbox before signing in."
    },
    formMessages: {
      reviewForm: "Please review the form values and try again.",
      sessionExpired: "Your session expired. Sign in again to continue.",
      placeLookupFailed: "Unable to fetch place details.",
      unauthorized: "Unauthorized",
      placesKeyMissing: "GOOGLE_PLACES_API_KEY is not configured."
    },
    sortOptions: {
      recent: "Recently added",
      rating: "Highest rating",
      visited: "Most visited"
    },
    rouletteFilters: {
      all: "All places",
      unvisited: "Only unvisited",
      favorites: "Favorites",
      category: "By category",
      manual: "Manual selection"
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getNavItems(locale: Locale) {
  const dict = getDictionary(locale);
  return [
    { href: "/", label: dict.nav.dashboard, icon: LayoutDashboard },
    { href: "/add", label: dict.nav.add, icon: PlusCircle },
    { href: "/catalog", label: dict.nav.catalog, icon: List },
    { href: "/roulette", label: dict.nav.roulette, icon: Compass },
    { href: "/lists", label: dict.nav.lists, icon: List }
  ];
}

export function getSortOptions(locale: Locale) {
  const dict = getDictionary(locale);
  return [
    { value: "recent", label: dict.sortOptions.recent },
    { value: "rating", label: dict.sortOptions.rating },
    { value: "visited", label: dict.sortOptions.visited }
  ] as const;
}

export function getRouletteFilters(locale: Locale) {
  const dict = getDictionary(locale);
  return [
    { value: "all", label: dict.rouletteFilters.all },
    { value: "unvisited", label: dict.rouletteFilters.unvisited },
    { value: "favorites", label: dict.rouletteFilters.favorites },
    { value: "category", label: dict.rouletteFilters.category },
    { value: "manual", label: dict.rouletteFilters.manual }
  ] as const;
}
