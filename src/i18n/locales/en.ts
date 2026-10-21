import type { Messages } from './ru'

export const en: Messages = {
  common: {
    loading: 'Loading…',
    close: 'Close',
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
    history: 'History',
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
    locate: 'My location',
    locateUnavailable: 'Location not available',
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
  offlineModel: {
    title: 'Diagnosis without a network',
    missing:
      'Download the model (about {{size}} MB) to identify diseases right on your phone in the field, with no signal.',
    downloading: 'Downloading the model… {{progress}}',
    ready:
      'The model is on this device (version {{version}}, {{size}} MB): without a network it will analyse photos.',
    outdated: 'A new model version is on the server — update the saved copy.',
    download: 'Download model',
    update: 'Update model',
    remove: 'Delete',
    failed:
      'Could not save the model. Check the free space on the device and try again.',
  },
  network: {
    offline:
      'No network: showing data that is already loaded. Photo analysis, risk recalculation and saving plots will work once the network is back.',
  },
  outbox: {
    waiting_one:
      '{{count}} offline check is queued: it will be saved to history once the network is back.',
    // В английском только one и other; few и many нужны для общей схемы ключей
    waiting_few:
      '{{count}} offline checks are queued: they will be saved to history once the network is back.',
    waiting_many:
      '{{count}} offline checks are queued: they will be saved to history once the network is back.',
    waiting_other:
      '{{count}} offline checks are queued: they will be saved to history once the network is back.',
    sending: 'Network is back: sending queued checks ({{count}})…',
    sent_one: 'The queued check was saved to history.',
    sent_few: '{{count}} queued checks were saved to history.',
    sent_many: '{{count}} queued checks were saved to history.',
    sent_other: '{{count}} queued checks were saved to history.',
    rejected_one:
      'The server did not accept {{count}} photo; it was removed from the queue.',
    rejected_few:
      'The server did not accept {{count}} photos; they were removed from the queue.',
    rejected_many:
      'The server did not accept {{count}} photos; they were removed from the queue.',
    rejected_other:
      'The server did not accept {{count}} photos; they were removed from the queue.',
    failed: 'Could not send the queued checks ({{count}}): we will try again.',
    retry: 'Send now',
    queued:
      'The photo is queued: once the network is back, the server will check it again and save it to history.',
    queueFailed: 'Could not queue the photo: is the device out of space?',
  },
  pwa: {
    updateReady: 'A new version of the app is available. Reload the page now?',
    offlineReady:
      'The app is saved on this device: it will open without a network.',
    reload: 'Update',
    later: 'Later',
    ok: 'Got it',
  },
  mapExport: {
    save: 'Save map',
    png: 'Save map as PNG',
    pdf: 'Save map as PDF',
    title: 'VitiGuard MD — vineyard map, {{date}}',
    failed: 'Could not save the map. Please try again.',
  },
  osm: {
    toggle: 'OpenStreetMap vineyards',
    zoomIn: 'Zoom in to see them',
  },
  ndvi: {
    toggle: 'NDVI map',
    low: 'bare soil',
    high: 'dense foliage',
    transparency: 'Transparency',
    date: 'Image date',
    latest: 'latest image',
    hint: 'Latest cloud-free image over the vineyard. No layer? Refresh vegetation in the vineyard card.',
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
    openCompare: 'Compare vineyards',
    openTips: 'Field tips',
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
    location: {
      taken: 'Taken at {{latitude}}, {{longitude}} (photo GPS)',
      onPlot: '— on the plot “{{name}}”.',
      offPlot: '— outside your plots.',
    },
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
    chooseTouch: 'Choose a photo from the gallery',
    camera: 'Take a photo of the leaf',
    choose: 'choose a file',
    formats: 'JPEG, PNG or WebP up to 10 MB',
    preview: 'Selected leaf photo',
    change: 'Choose another photo',
    crop: {
      open: 'Crop',
      title: 'Crop photo',
      description:
        'Keep a single leaf in the square: the model sees the image as a 224 × 224 square, and extra background takes detail away from the leaf.',
      frame: 'Crop frame: move it with the mouse, a finger or the arrow keys',
      size: 'Frame size',
      apply: 'Crop',
      cancel: 'Cancel',
      failed: 'Could not crop the photo. Please try again.',
    },
    wrongType: 'A JPEG, PNG or WebP photo is required',
    tooLarge: 'The file is larger than 10 MB',
    analyze: 'Identify disease',
    analyzing: 'Analysing the photo…',
    empty: 'The analysis result will appear here.',
    tips: 'For an accurate answer: one leaf close up, daylight, no glare or shadows.',
    offlineNoModel:
      'Without a network only the downloaded model can analyse photos — download it below once you are online.',
    deviceFailed:
      'Could not analyse the photo on this device. Try again or wait for the network.',
    onDevice:
      'Determined on this device without a network: the same classifier as on the server, but without the heatmap and lesion mask.',
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
  history: {
    title: 'Check history',
    intro:
      'Saved leaf checks: the photo, the model diagnosis and the plot. They show where and when a disease was found.',
    save: 'Save the photo and result to history',
    plot: 'Plot',
    noPlot: 'No plot',
    filters: 'History filters',
    disease: 'Diagnosis',
    any: 'All',
    from: 'From',
    to: 'To',
    count_one: '{{count}} check',
    // В английском только one и other; few и many нужны для общей схемы ключей
    count_few: '{{count}} checks',
    count_many: '{{count}} checks',
    count_other: '{{count}} checks',
    empty: 'No saved checks yet.',
    check: 'Check a leaf',
    nothingFound: 'No checks match the selected filters.',
    loadError: 'Could not load the history. Reload the page.',
    photo: 'Leaf photo: {{disease}}',
    photoMissing: 'Photo not available',
    delete: 'Delete',
    confirmDelete: 'Delete this check?',
    cancel: 'Cancel',
    deleteFailed: 'Could not delete the check.',
  },
  print: {
    button: 'Print',
    header: 'VitiGuard MD · printed {{date}}',
  },
  period: {
    label: 'Period',
    week: 'Week',
    month: 'Month',
    season: 'Season',
    custom: 'Dates',
    from: 'From',
    to: 'To',
    empty: 'No data for the selected period.',
  },
  compare: {
    title: 'Compare vineyards',
    intro:
      'Two vineyards side by side: today’s disease risk, vegetation from Sentinel-2 images and NDVI drops. It shows which vineyard needs attention first.',
    first: 'Vineyard A',
    second: 'Vineyard B',
    same: 'Choose two different vineyards.',
    needTwo:
      'You need at least two vineyards to compare — draw them on the map.',
    table: 'Vineyard comparison',
    rows: {
      area: 'Area',
      variety: 'Variety',
      planted: 'Planting year',
      downy: 'Downy mildew today',
      powdery: 'Powdery mildew today',
      ndvi: 'Latest NDVI',
      clear: 'Cloud-free images',
      drops: 'NDVI drops',
    },
    noDrops: 'none',
    drops: '{{count}}, confirmed: {{confirmed}}',
    chart: 'NDVI over the common image period',
    chartLabel:
      'NDVI of {{a}} (A) and {{b}} (B) from {{from}} to {{to}}; values are in each vineyard’s vegetation table',
    noCommon:
      'The vineyards have no common image period: refresh vegetation in each vineyard card.',
  },
  share: {
    open: 'Share',
    text: 'VitiGuard MD: {{disease}} (model confidence {{confidence}}), {{place}}, {{date}}. The check card is in the attached PDF.',
    copied: 'Check summary copied — paste it into a message.',
    failed: 'Could not share the check. Please try again.',
  },
  report: {
    save: 'Download the check card as PDF',
    failed: 'Could not save the card. Please try again.',
    title: 'VitiGuard MD — grape leaf check',
    severity: 'About {{value}} of the leaf area is affected (U-Net mask)',
    vineyard: 'Vineyard: {{name}}',
    date: 'Taken: {{date}}',
    location: 'Photo location: {{lat}}, {{lon}}',
    probabilities: 'Disease probabilities',
    model: 'Model {{model}}, version {{version}}',
    disclaimer:
      'The model’s diagnosis is a guide, not a verdict: it errs more often on field photos. Treatment decisions are made by an agronomist.',
  },
  review: {
    open: 'Review',
    title: 'Agronomist review',
    description:
      'The model found: {{disease}}. The review is stored next to the model answer and does not change it.',
    question: 'Is the model diagnosis correct?',
    modelRight: 'Yes, the model is right',
    modelWrong: 'No, the photo shows something else',
    correct: 'Correct diagnosis',
    comment: 'Comment (optional)',
    save: 'Save review',
    withdraw: 'Withdraw review',
    failed: 'Could not save the review. Please try again.',
    confirmed: '{{reviewer}}: diagnosis confirmed',
    corrected: '{{reviewer}}: actually {{disease}}',
    expert: 'Agronomist',
  },
  advice: {
    downyInfection:
      'Conditions for downy mildew infection. If there was no protective spray before the rain, use a systemic product in the first days after infection.',
    downyIncubation:
      'Downy mildew spots may appear soon: check the undersides of the leaves.',
    downySymptoms:
      'Downy mildew spots are expected: inspect the plot and remove infected leaves.',
    powderyHigh:
      'High powdery mildew risk: spray sulphur or a systemic product, open up the canopy.',
    powderyMedium: 'Powdery mildew risk is rising: inspect leaves and bunches.',
    calm: 'No dangerous conditions.',
  },
  alerts: {
    title: 'Alerts',
    intro:
      'High disease risk on your plots for today and the next two days — from the risk recalculation every 6 hours.',
    bell: 'Alerts',
    bellUnread_one: 'Alerts: {{count}} unread',
    bellUnread_few: 'Alerts: {{count}} unread',
    bellUnread_many: 'Alerts: {{count}} unread',
    bellUnread_other: 'Alerts: {{count}} unread',
    text: '{{disease}}: high risk on plot “{{plot}}”',
    today: 'today',
    tomorrow: 'tomorrow',
    forecast: 'weather forecast',
    markRead: 'Mark as read',
    markAllRead: 'Mark all as read',
    filter: 'Which alerts to show',
    unread: 'Unread',
    all: 'All',
    none: 'No alerts yet.',
    noneUnread: 'No unread alerts.',
    loadError: 'Could not load the alerts. Reload the page.',
    showAll_one: 'All alerts ({{count}})',
    showAll_few: 'All alerts ({{count}})',
    showAll_many: 'All alerts ({{count}})',
    showAll_other: 'All alerts ({{count}})',
  },
  tips: {
    title: 'Field tips',
    intro:
      'In short: how to photograph a leaf, how to read the risk and how to prepare for working without a signal. This page opens offline too.',
    photo: {
      title: 'How to photograph a leaf',
      items: {
        one: 'One leaf, close up, entirely in the frame — the model was trained on such photos.',
        light:
          'Diffuse daylight, no glare or harsh shadows; do not shoot against the sun.',
        close:
          'If the spots are small, move closer instead of zooming in: you will get more detail.',
        both: 'Downy mildew shows on the underside (white down): when in doubt, photograph the underside too.',
        gps: 'Enable location for the camera: the plot is filled in from the photo coordinates.',
      },
    },
    risk: {
      title: 'What the risk levels mean',
      items: {
        high: 'High — the weather favoured infection or spots are expected: see “What to do” in the “Risk by day” window.',
        medium:
          'Medium — risk is rising (downy mildew incubation, powdery mildew index from 30): inspect the plot.',
        low: 'Low — no dangerous conditions; routine inspection.',
        forecast:
          'Days after today use the weather forecast and are refined at every recalculation.',
      },
    },
    offline: {
      title: 'Working without a signal',
      items: {
        model:
          'Download the model on the “Diagnosis” page in advance — without a network the phone will analyse the photo.',
        map: 'Open the map of the plots you need while online: the viewed basemap will be kept.',
        install:
          'Install the app on your phone (“Add to Home screen”) — it will open without a network.',
        sync: 'Offline checks are not saved to history: repeat the analysis with saving once you are online.',
      },
    },
    safety: {
      title: 'Safety when spraying',
      items: {
        label:
          'Take the product, dose and number of sprays from the label and the state register of plant protection products.',
        ppe: 'Wear gloves, goggles and a respirator; do not eat or smoke while spraying.',
        wind: 'Do not spray in wind or before rain: the product will drift or wash off.',
        wait: 'Keep the pre-harvest interval after the last spray — it is on the label.',
      },
    },
    diseases: 'Disease signs',
    check: 'Check a leaf by photo',
  },
  notifications: {
    title: 'Disease alerts',
    question: 'Which risk to alert about',
    high: 'High risk only',
    highHint:
      'Downy mildew infection by the “three tens” rule, expected spots, powdery mildew index of 60 and above.',
    medium: 'Medium and high risk',
    mediumHint:
      'Also incubation onset and a rising powdery mildew index — there will be more alerts.',
    off: 'No alerts',
    offHint: 'Risk is still shown on the map and the home page.',
    saved: 'Saved',
    failed: 'Could not save. Please try again.',
    loadError: 'Could not load the alert settings.',
  },
  camera: {
    title: 'Photograph the leaf',
    preview: 'Camera view',
    hint: 'Fit a single whole leaf inside the frame, in daylight and without glare.',
    take: 'Take photo',
    torchOn: 'Turn on flash',
    torchOff: 'Turn off flash',
    zoom: 'Zoom',
    denied:
      'No access to the camera. Allow it in the browser settings or choose a photo from the gallery.',
    missing: 'No camera found. Choose a photo from the gallery.',
    failed:
      'The camera did not start. Try again or choose a photo from the gallery.',
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
    weatherChart: 'Season weather at the plot',
    temperatureChartLabel:
      'Mean daily temperature over the season; triangles mark downy mildew infection days',
    temperatureShort: 'Temperature',
    temperatureLegend: 'Mean daily temperature, °C',
    precipitationChartLabel: 'Daily precipitation bars over the season, mm',
    precipitationValue: '{{value}} mm',
    precipitationShort: 'Precipitation',
    precipitationLegend: 'Daily precipitation, mm',
    weatherHint:
      'Downy mildew infects leaves after at least 10 mm of rain above 10 °C. Days after today use the forecast.',
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
    plan: 'What to do: today and the week ahead (weather forecast)',
    columns: {
      advice: 'What to do',
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
