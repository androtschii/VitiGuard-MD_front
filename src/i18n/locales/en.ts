import type { Messages } from './ru'

export const en: Messages = {
  common: {
    loading: 'Loading…',
    close: 'Close',
    menu: 'Menu',
    closeMenu: 'Close menu',
    mainNavigation: 'Main navigation',
    skipToContent: 'Skip to content',
    noData: 'No data',
    logout: 'Log out',
    language: 'Language',
  },
  theme: {
    label: 'Theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  nav: {
    profile: 'Profile',
    home: 'Home',
    map: 'Map',
    regions: 'Districts',
    diagnosis: 'Diagnosis',
  },
  map: {
    tools: {
      hide: 'Hide panel',
      show: 'Tools',
      layers: 'Filters and layers',
    },
    title: 'Vineyard map',
    label: "Map of Moldova's vineyards",
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetBearing: 'Reset bearing to north',
    fullscreenEnter: 'Enter fullscreen',
    fullscreenExit: 'Exit fullscreen',
    attribution: 'Map data sources',
    unsupported:
      'Your browser cannot display the map: WebGL support is required. Update your browser or enable hardware acceleration in its settings.',
    basemap: {
      label: 'Base map',
      scheme: 'Map',
      satellite: 'Satellite',
      hybrid: 'Hybrid',
    },
  },
  draw: {
    start: 'Draw a parcel',
    hint: 'Click on the map to mark the corners of the parcel. To finish, click the first point or press Enter; Esc cancels drawing.',
    cancel: 'Cancel',
    area: 'Area: {{area}} ha',
    editHint:
      'Drag points to adjust the outline; white points on the edges add new corners.',
    remove: 'Remove outline',
  },
  vineyard: {
    formLabel: 'New parcel',
    name: 'Parcel name',
    namePlaceholder: 'For example, Cricova, north slope',
    create: 'Save parcel',
    created: 'Parcel “{{name}}” saved',
    saveFailed: 'Could not save the parcel',
    area: 'Area: {{area}} ha',
    addedOn: 'Added on {{date}}',
    variety: 'Variety',
    varietyNone: 'Not specified',
    plantingYear: 'Planting year',
    plantingYearPlaceholder: 'For example, 2015',
    varietyLine: 'Variety: {{name}}',
    plantedLine: 'Planted in {{year}}',
    card: {
      district: 'District: {{name}}',
      weather: 'Weather now',
      weatherNow:
        '{{temperature}} °C, humidity {{humidity}} %, precipitation {{precipitation}} mm',
      weatherFailed: 'Weather is not available right now',
      surroundings: 'Around the plot',
      nearby: 'OpenStreetMap vineyards within 1 km: {{count}}',
      nearest: 'The nearest is {{distance}} m away',
      overlap: 'Matches OpenStreetMap mapping by {{value}} %',
      download: 'Download boundaries:',
      downloadFailed: 'Could not download the boundaries',
      delete: 'Delete plot',
      confirmDelete: 'Delete the plot? This cannot be undone.',
      cancel: 'Cancel',
    },
  },
  search: {
    label: 'Search for a parcel or coordinates',
    placeholder: 'Name or 47.14, 28.86',
    point: 'Go to point {{lat}}, {{lon}}',
    nothing: 'Nothing found',
    hectares: 'ha',
  },
  measure: {
    start: 'Measure distance and area',
    hint: 'Click on the map to place points. From three points the area of the shape is calculated too. Esc — finish.',
    distance: 'Distance: {{distance}}',
    meters: '{{value}} m',
    kilometers: '{{value}} km',
    area: 'Area: {{hectares}} ha ({{squareMeters}} m²)',
    undo: 'Remove point',
    finish: 'Done',
  },
  filter: {
    label: 'Parcel filter',
    variety: 'Variety',
    all: 'All varieties',
    none: 'No variety',
    minArea: 'Area from, ha',
    maxArea: 'to, ha',
    reset: 'Reset',
    shown: 'Showing {{shown}} of {{total}}',
  },
  osm: {
    toggle: 'OpenStreetMap vineyards',
    zoomIn: 'Zoom in to see them',
  },
  pagination: {
    label: 'Pages',
    previous: 'Previous',
    next: 'Next',
    page: 'Page {{page}}',
  },
  api: {
    serverUnavailable: 'Server unavailable',
    serverError: 'Server error ({{status}})',
    connecting: 'Connecting to the API…',
    unavailable: 'API unavailable',
    status: 'API {{version}}, environment {{environment}}',
  },
  footer: {
    tagline: 'vineyard health monitoring for Moldova',
  },
  home: {
    title: 'Farm overview',
    stats: {
      vineyards: 'Plots',
      area: 'Total area',
      high: 'At high risk',
      medium: 'At medium risk',
      today: 'today, the worse of downy and powdery mildew',
    },
    plots: 'Risk by plot today',
    columns: {
      name: 'Plot',
      area: 'Area, ha',
    },
    noEstimate: 'no estimate today',
    noVineyards: 'No plots yet — draw the first one on the map.',
    loadError: 'Could not load the plots. Reload the page.',
    description:
      'Vineyard health monitoring for Moldova: disease diagnosis from leaf photos, satellite indices and infection risk forecasts.',
    openMap: 'Open map',
    openDiagnosis: 'Check a leaf',
    openRegions: 'District statistics',
  },
  errorPage: {
    title: 'Something went wrong',
    text: 'An error occurred on this page. Try reloading it — if the error persists, let us know.',
    reload: 'Reload page',
  },
  notFound: {
    title: 'Page not found',
    text: 'The address may be mistyped, or the page may have moved.',
    home: 'Go to home page',
  },
  auth: {
    email: 'Email',
    password: 'Password',
    fullName: 'Name',
    confirmPassword: 'Repeat password',
    newPassword: 'New password',
    role: 'Role',
    passwordHint: 'At least 8 characters, with letters and digits',
    roles: {
      admin: 'Administrator',
      user: 'Grower',
      agronomist: 'Agronomist',
    },
    login: {
      title: 'Sign in',
      submit: 'Sign in',
      failed: 'Could not sign in',
      noAccount: 'No account?',
      register: 'Sign up',
      forgotPassword: 'Forgot password?',
      accountCreated: 'Account created. Sign in with your email and password.',
      passwordChanged: 'Password changed. Sign in with your new password.',
    },
    register: {
      title: 'Sign up',
      submit: 'Sign up',
      failed: 'Could not sign up',
      emailTaken: 'A user with this email is already registered',
      haveAccount: 'Already have an account?',
      login: 'Sign in',
    },
    forgot: {
      title: 'Password recovery',
      intro:
        'Enter the email you registered with: we will send you a link to create a new password.',
      submit: 'Send link',
      failed: 'Could not send the email',
      backToLogin: 'Back to sign in',
      sent: 'If an account with <strong>{{email}}</strong> exists, we have sent it an email with a link to create a new password. Please also check your spam folder.',
    },
    reset: {
      title: 'New password',
      submit: 'Save password',
      failed: 'Could not change the password',
      invalidTitle: 'Invalid link',
      invalidText:
        'The address has no password reset key. Open the full link from the email or <request>request a new one</request>.',
      requestNew: 'Request a new link',
    },
  },
  diagnosis: {
    title: 'Leaf photo diagnosis',
    intro:
      'Upload a photo of a grape leaf: the model will identify the disease and show how confident it is.',
    photo: 'Leaf photo',
    input: 'Choose a leaf photo',
    layers: {
      title: 'Where the model saw the disease',
      heatmap: 'Heatmap',
      lesion: 'Lesions',
      photo: 'Photo only',
      severity:
        'About {{value}} of the leaf area is affected (U-Net mask, approximate)',
      heatmapHint: 'Bright areas influenced the model’s answer the most.',
    },
    result: 'Result',
    drop: 'Drag a photo here or',
    choose: 'choose a file',
    formats: 'JPEG, PNG or WebP up to 10 MB',
    preview: 'Selected leaf photo',
    change: 'Choose another photo',
    wrongType: 'A JPEG, PNG or WebP photo is required',
    tooLarge: 'The file is larger than 10 MB',
    analyze: 'Identify disease',
    analyzing: 'Analysing the photo…',
    empty: 'The analysis result will appear here.',
    tips: 'For an accurate answer: one leaf close up, daylight, no glare or shadows.',
    verdict: 'Diagnosis',
    confidence: 'Model confidence: {{value}}',
    lowConfidence:
      'The model is not sure. Retake the photo close up in daylight: one leaf, no glare or shadows.',
    probabilities: 'Probabilities',
    model: 'Model: {{name}}',
    disclaimer:
      'The result is a hint, not an agronomist’s conclusion: the model makes more mistakes on field photos than on laboratory ones.',
  },
  profile: {
    title: 'Profile',
    account: 'Account',
    save: 'Save',
    saved: 'Changes saved',
    failed: 'Could not save the profile',
    loadError: 'Could not load the profile. Reload the page.',
    interface: 'Interface',
    interfaceHint: 'Language and theme are kept in this browser.',
  },
  diseaseInfo: {
    title: 'About the disease',
    symptoms: 'Signs',
    conditions: 'When it develops',
    control: 'What to do',
    note: 'Choose products and doses from the state register of approved plant protection products, together with an agronomist.',
    healthy: {
      symptoms: 'The model found no spots, coating or drying on the leaf.',
      conditions:
        'Disease risk rises after rain, with dew and in a dense canopy.',
      control:
        'Inspect the vines once a week and after rain; weather-based risk is on the plot map.',
    },
    black_rot: {
      symptoms:
        'Round brown spots with a dark border and black dots inside; berries turn brown and shrivel into black “mummies”.',
      conditions:
        'Warm, wet weather and rain from bud break until bunch closure.',
      control:
        'Remove and destroy mummies and infected shoots, keep the canopy open; preventive fungicide sprays from bloom until bunch closure.',
    },
    esca: {
      symptoms:
        '“Tiger stripes” between the veins — yellow or red at first, then brown; in hot weather the vine can suddenly wilt.',
      conditions:
        'A wood disease: the fungi enter through pruning wounds, more often in old vines; signs are stronger in hot summers.',
      control:
        'There is no chemical cure. Prune in dry weather and seal large cuts, cut out and burn infected arms, mark diseased vines.',
    },
    leaf_blight: {
      symptoms:
        'Irregular brown spots on the leaf that later merge; infected leaves drop early.',
      conditions: 'Warm, humid weather in the second half of summer.',
      control:
        'Remove fallen leaves, keep the canopy open; sprays against downy mildew and black rot are usually enough.',
    },
    downy_mildew: {
      symptoms:
        'Yellow “oil spots” on top of the leaf with white downy growth underneath; it also attacks flower clusters and young berries.',
      conditions:
        'Rain and wet leaves above 10 °C — the “three tens” rule; spots appear 5–18 days after infection.',
      control:
        'Follow the downy mildew risk on the map: contact (copper) products before rain, systemic ones in the first days after infection; remove laterals.',
    },
    powdery_mildew: {
      symptoms:
        'Grey-white powdery coating on both sides of the leaf and on berries, musty smell; berries crack.',
      conditions: 'Warm 20–30 °C, humid air without rain, a dense canopy.',
      control:
        'Sulphur and systemic fungicides at intervals set by the Gubler-Thomas index; canopy management and airflow.',
    },
  },
  diseases: {
    healthy: 'Healthy leaf',
    black_rot: 'Black rot',
    esca: 'Esca',
    leaf_blight: 'Leaf blight',
    downy_mildew: 'Downy mildew',
    powdery_mildew: 'Powdery mildew',
  },
  regions: {
    title: 'District statistics',
    intro:
      'Vineyards mapped in OpenStreetMap and your plots by district of Moldova. A vineyard belongs to the district that contains its middle.',
    summary: {
      osmCount: 'Vineyards in OpenStreetMap',
      osmArea: 'Their area',
      mine: 'My plots',
    },
    ha: '{{value}} ha',
    mineValue: '{{count}} · {{area}} ha',
    chart: 'Districts with the largest vineyard area',
    table: 'Vineyards by district',
    columns: {
      name: 'District',
      area: 'District area, ha',
      osmCount: 'OSM vineyards',
      osmArea: 'Their area, ha',
      share: 'District share',
      mine: 'My plots, pcs · ha',
    },
    source:
      'Source: OpenStreetMap (ODbL), district boundaries by geoBoundaries. OpenStreetMap is not fully mapped, so the real vineyard area is larger.',
  },
  vegetation: {
    open: 'Vegetation dynamics',
    title: 'Vegetation dynamics: {{name}}',
    description:
      'Indices from Sentinel-2 images over the season: NDVI — green biomass, NDRE — chlorophyll, shows stress earlier.',
    series: {
      ndvi: 'NDVI — biomass',
      ndre: 'NDRE — chlorophyll',
    },
    chartLabel:
      'NDVI and NDRE chart: {{count}} images from {{from}} to {{to}}; values are in the table below the chart',
    summary:
      'Latest NDVI {{ndvi}} ({{date}}). Clear images: {{clear}}, covered by clouds over the plot: {{cloudy}}.',
    empty:
      'No indices yet. Press “Update from new images” — the calculation takes a few minutes.',
    refresh: 'Update from new images',
    refreshing:
      'The calculation has started: season images are processed one by one, the chart will fill in over a few minutes.',
    table: 'Table of values',
    columns: {
      date: 'Date',
      cloud: 'Clouds over the plot',
    },
  },
  risk: {
    mapLegend: 'Plot colour — today’s risk',
    mapLegendWorst: 'The worse of downy and powdery mildew',
    section: 'Disease risk',
    open: 'Risk by day',
    title: 'Disease risk: {{name}}',
    description:
      'From the weather at the plot: the “three tens” rule and the Goidanich model for downy mildew, the Gubler-Thomas index for powdery mildew. Days after today use the weather forecast.',
    downy: 'Downy mildew',
    powdery: 'Powdery mildew',
    levels: {
      low: 'low',
      medium: 'medium',
      high: 'high',
    },
    today: 'Today',
    lastDay: 'Latest estimate — {{date}}',
    notCalculated: 'Risk has not been calculated yet',
    offSeason:
      'Today is out of season: the models estimate risk from April to September (the “three tens” rule — until June).',
    incubation:
      'Downy mildew incubation is under way after the infection on {{date}}: {{progress}} % done.',
    symptoms:
      'The Goidanich model expects downy mildew spots after the infection on {{date}} — the treatment should have been done before this day.',
    noIncubation: 'No downy mildew incubation right now.',
    gublerToday: 'Gubler-Thomas powdery mildew index — {{index}}.',
    week: 'Week ahead (weather forecast)',
    columns: {
      date: 'Date',
    },
    powderyChart: 'Powdery mildew: Gubler-Thomas index',
    powderyChartLabel:
      'Gubler-Thomas index over the season: from 0 to 100, 60 and above is high risk',
    gublerShort: 'Index',
    downyChart: 'Downy mildew: Goidanich incubation, %',
    downyChartLabel:
      'Downy mildew incubation progress over the season: 100 % means spots are expected; triangles mark infection days',
    incubationShort: 'Incubation',
    todayMark: 'today',
    infectionMark: 'Infection by the “three tens” rule: {{date}}',
    markersHint:
      'Triangles on the axis are days when the “three tens” rule allowed primary infection.',
    empty:
      'Risk has not been calculated yet. Press “Recalculate” — the server will load the season weather and forecast.',
    refresh: 'Recalculate with fresh weather',
    disclaimer:
      'Agronomic models estimate conditions for the disease from the weather, not its presence: the agronomist decides on treatment.',
  },
  validation: {
    nameMax: 'At most 255 characters',
    emailRequired: 'Enter your email',
    emailInvalid: 'Enter a valid email',
    passwordRequired: 'Enter your password',
    passwordMin: 'At least 8 characters',
    passwordMax: 'At most 128 characters',
    passwordLetter: 'Add at least one letter',
    passwordDigit: 'Add at least one digit',
    passwordsMismatch: 'Passwords do not match',
    confirmRequired: 'Repeat your password',
    nameRequired: 'Enter your name',
    vineyardNameRequired: 'Enter the parcel name',
    vineyardNameMax: 'At most 255 characters',
    plantingYear: 'Planting year — from 1900 to the current year',
  },
}
