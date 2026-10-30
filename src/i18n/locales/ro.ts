import type { Messages } from './ru'

export const ro: Messages = {
  common: {
    loading: 'Se încarcă…',
    close: 'Închide',
    mainNavigation: 'Navigare principală',
    skipToContent: 'Salt la conținut',
    noData: 'Nu există date',
    logout: 'Ieșire',
    language: 'Limba',
  },
  theme: {
    label: 'Tema',
    system: 'Ca în sistem',
    telegram: 'Ca în Telegram',
    light: 'Luminoasă',
    dark: 'Întunecată',
  },
  nav: {
    history: 'Istoric',
    profile: 'Profil',
    home: 'Acasă',
    map: 'Harta',
    regions: 'Raioane',
    diagnosis: 'Diagnostic',
    admin: 'Administrare',
  },
  map: {
    tools: {
      hide: 'Ascunde panoul',
      show: 'Instrumente',
      layers: 'Filtre și straturi',
    },
    title: 'Harta viilor',
    label: 'Harta viilor din Moldova',
    locate: 'Locația mea',
    locateUnavailable: 'Locația nu este disponibilă',
    zoomIn: 'Apropie',
    zoomOut: 'Depărtează',
    resetBearing: 'Orientează spre nord',
    fullscreenEnter: 'Ecran complet',
    fullscreenExit: 'Ieși din ecran complet',
    attribution: 'Sursele datelor hărții',
    unsupported:
      'Browserul nu poate afișa harta: este nevoie de suport WebGL. Actualizați browserul sau activați accelerarea hardware în setările lui.',
    basemap: {
      label: 'Fundal',
      scheme: 'Schemă',
      satellite: 'Satelit',
      hybrid: 'Hibrid',
    },
  },
  draw: {
    start: 'Desenați parcela',
    hint: 'Marcați colțurile parcelei cu clicuri pe hartă. Pentru a termina, faceți clic pe primul punct sau apăsați Enter; Esc anulează desenarea.',
    cancel: 'Anulează',
    area: 'Suprafața: {{area}} ha',
    editHint:
      'Trageți punctele pentru a corecta conturul; punctele albe de pe laturi adaugă colțuri noi.',
    remove: 'Șterge conturul',
  },
  vineyard: {
    formLabel: 'Parcelă nouă',
    name: 'Denumirea parcelei',
    namePlaceholder: 'De exemplu, Cricova, versantul de nord',
    create: 'Salvează parcela',
    created: 'Parcela „{{name}}” a fost salvată',
    saveFailed: 'Parcela nu a putut fi salvată',
    area: 'Suprafața: {{area}} ha',
    addedOn: 'Adăugată la {{date}}',
    variety: 'Soi',
    varietyNone: 'Nespecificat',
    plantingYear: 'Anul plantării',
    plantingYearPlaceholder: 'De exemplu, 2015',
    varietyLine: 'Soi: {{name}}',
    plantedLine: 'Plantată în {{year}}',
    card: {
      district: 'Raion: {{name}}',
      weather: 'Vremea acum',
      weatherNow:
        '{{temperature}} °C, umiditate {{humidity}} %, precipitații {{precipitation}} mm',
      weatherFailed: 'Vremea nu este disponibilă acum',
      surroundings: 'În jurul parcelei',
      nearby: 'Vii OpenStreetMap pe o rază de 1 km: {{count}}',
      nearest: 'Cea mai apropiată — la {{distance}} m',
      overlap:
        'Coincide cu cartografierea OpenStreetMap în proporție de {{value}} %',
      download: 'Descarcă limitele:',
      downloadFailed: 'Limitele nu au putut fi descărcate',
      delete: 'Șterge parcela',
      confirmDelete: 'Ștergeți parcela? Acțiunea nu poate fi anulată.',
      cancel: 'Anulează',
    },
  },
  search: {
    label: 'Căutarea parcelei sau a coordonatelor',
    placeholder: 'Denumire sau 47.14, 28.86',
    point: 'Mergi la punctul {{lat}}, {{lon}}',
    nothing: 'Nu s-a găsit nimic',
    hectares: 'ha',
  },
  measure: {
    start: 'Măsurați distanța și suprafața',
    hint: 'Puneți puncte cu clicuri pe hartă. De la trei puncte se calculează și suprafața figurii. Esc — terminați.',
    distance: 'Distanța: {{distance}}',
    meters: '{{value}} m',
    kilometers: '{{value}} km',
    area: 'Suprafața: {{hectares}} ha ({{squareMeters}} m²)',
    undo: 'Elimină punctul',
    finish: 'Gata',
  },
  track: {
    start: 'Înregistrează traseul',
    stop: 'Oprește și salvează',
    waiting: 'Căutăm sateliții… Țineți telefonul deschis.',
    recording:
      'Se înregistrează. Ecranul nu se stinge cât timp înregistrarea e pornită.',
    summary: '{{distance}} · {{duration}}',
    minutes_one: '{{count}} minut',
    minutes_few: '{{count}} minute',
    // В румынском нет формы many; ключ нужен для общей схемы
    minutes_many: '{{count}} de minute',
    minutes_other: '{{count}} de minute',
    denied:
      'Nu există acces la locație: permiteți-l pentru site în setările browserului.',
    unavailable: 'Locația nu este disponibilă pe acest dispozitiv.',
    saved: 'Trasee salvate',
    show: 'Arată',
    hide: 'Ascunde',
    gpx: 'GPX',
    delete: 'Șterge',
  },
  filter: {
    label: 'Filtrul parcelelor',
    variety: 'Soi',
    all: 'Toate soiurile',
    none: 'Fără soi',
    minArea: 'Suprafața de la, ha',
    maxArea: 'până la, ha',
    reset: 'Resetează',
    shown: 'Afișate {{shown}} din {{total}}',
  },
  offlineModel: {
    title: 'Diagnostic fără rețea',
    missing:
      'Descărcați modelul (circa {{size}} MB) pentru a determina boala direct pe telefon, în câmp, fără semnal.',
    unavailable:
      'Modelul nu este încă disponibil pe server. Îl veți putea descărca atunci când va apărea.',
    downloading: 'Se descarcă modelul… {{progress}}',
    ready:
      'Modelul este pe dispozitiv (versiunea {{version}}, {{size}} MB): fără rețea fotografia va fi analizată de el.',
    outdated:
      'Pe server este o versiune nouă a modelului — actualizați copia salvată.',
    download: 'Descarcă modelul',
    update: 'Actualizează modelul',
    remove: 'Șterge',
    failed:
      'Modelul nu a putut fi salvat. Verificați spațiul pe dispozitiv și încercați din nou.',
  },
  network: {
    offline:
      'Fără rețea: sunt afișate datele deja încărcate. Analiza fotografiei, recalcularea riscului și salvarea parcelelor vor funcționa când rețeaua revine.',
  },
  admin: {
    title: 'Utilizatori și roluri',
    intro:
      'Agronomul confirmă diagnosticele și dă recomandări, administratorul gestionează utilizatorii. Utilizatorul blocat iese imediat de pe toate dispozitivele.',
    search: 'Căutare după email și nume',
    user: 'Utilizator',
    role: 'Rol',
    roleOf: 'Rolul {{email}}',
    created: 'Înregistrat',
    access: 'Acces',
    active: 'Activ',
    blocked: 'Blocat',
    block: 'Blochează',
    unblock: 'Deblochează',
    blockUser: 'Blochează {{email}}',
    unblockUser: 'Deblochează {{email}}',
    empty: 'Nu s-a găsit nimeni.',
    roles: {
      user: 'Utilizator',
      agronomist: 'Agronom',
      admin: 'Administrator',
    },
  },
  telegram: {
    title: 'Telegram',
    about:
      'Conectați botul @VitiGuard_bot: primește fotografii ale frunzelor pentru diagnostic direct din chat, trimite avertizări despre risc pe parcele, iar mini-aplicația se deschide fără parolă.',
    connect: 'Conectează Telegram',
    open: 'Deschideți botul și apăsați «Start»',
    expires:
      '— linkul este valabil {{minutes}} minute și funcționează o singură dată.',
    linked:
      'Chatul cu botul este conectat: fotografiile din Telegram ajung în istoric, avertizările vin în chat.',
    unlink: 'Deconectează',
    notConfigured: 'Botul Telegram nu este încă configurat pe server.',
  },
  quick: {
    title: 'Diagnostic rapid',
    intro:
      'Fotografiați o singură frunză de aproape, la lumina zilei — modelul va determina boala, iar verificarea se va salva în istoric.',
    analyze: 'Determină boala',
    saved: 'Verificarea a fost salvată.',
    history: 'Deschide istoricul',
    fullApp: 'Versiunea completă VitiGuard MD',
  },
  outbox: {
    waiting_one:
      'În coadă: {{count}} verificare fără rețea; va ajunge în istoric când revine rețeaua.',
    waiting_few:
      'În coadă: {{count}} verificări fără rețea; vor ajunge în istoric când revine rețeaua.',
    // В румынском нет формы many; ключ нужен для общей схемы
    waiting_many:
      'În coadă: {{count}} de verificări fără rețea; vor ajunge în istoric când revine rețeaua.',
    waiting_other:
      'În coadă: {{count}} de verificări fără rețea; vor ajunge în istoric când revine rețeaua.',
    sending: 'Rețeaua a revenit: trimitem verificările din coadă ({{count}})…',
    sent_one: 'Verificarea din coadă a fost salvată în istoric.',
    sent_few: '{{count}} verificări din coadă au fost salvate în istoric.',
    sent_many: '{{count}} de verificări din coadă au fost salvate în istoric.',
    sent_other: '{{count}} de verificări din coadă au fost salvate în istoric.',
    rejected_one:
      'Serverul nu a acceptat {{count}} fotografie — a fost scoasă din coadă.',
    rejected_few:
      'Serverul nu a acceptat {{count}} fotografii — au fost scoase din coadă.',
    rejected_many:
      'Serverul nu a acceptat {{count}} de fotografii — au fost scoase din coadă.',
    rejected_other:
      'Serverul nu a acceptat {{count}} de fotografii — au fost scoase din coadă.',
    failed:
      'Verificările din coadă ({{count}}) nu au putut fi trimise: vom încerca din nou.',
    retry: 'Trimite acum',
    queued:
      'Fotografia a fost pusă în coadă: când revine rețeaua, serverul o va verifica din nou și o va salva în istoric.',
    queueFailed:
      'Fotografia nu a putut fi pusă în coadă: nu este destul spațiu pe dispozitiv?',
  },
  pwa: {
    updateReady:
      'A apărut o versiune nouă a aplicației. Reîncărcați pagina acum?',
    offlineReady:
      'Aplicația a fost salvată pe dispozitiv: se va deschide și fără rețea.',
    reload: 'Actualizează',
    later: 'Mai târziu',
    ok: 'Am înțeles',
  },
  mapExport: {
    save: 'Salvează harta',
    png: 'Salvează harta în PNG',
    pdf: 'Salvează harta în PDF',
    title: 'VitiGuard MD — harta parcelelor, {{date}}',
    failed: 'Harta nu a putut fi salvată. Încercați din nou.',
  },
  osm: {
    toggle: 'Viile din OpenStreetMap',
    zoomIn: 'Apropiați harta pentru a le vedea',
  },
  ndvi: {
    toggle: 'Harta NDVI',
    low: 'sol',
    high: 'frunziș dens',
    transparency: 'Transparență',
    date: 'Data imaginii',
    latest: 'cea mai recentă imagine',
    hint: 'Cea mai recentă imagine fără nori deasupra parcelei. Nu apare stratul? Actualizați vegetația în fișa parcelei.',
  },
  pagination: {
    label: 'Pagini',
    previous: 'Înapoi',
    next: 'Înainte',
    page: 'Pagina {{page}}',
  },
  api: {
    serverUnavailable: 'Serverul nu este disponibil',
    serverError: 'Eroare de server ({{status}})',
    connecting: 'Conectare la API…',
    unavailable: 'API indisponibil',
    status: 'API {{version}}, mediul {{environment}}',
  },
  footer: {
    tagline: 'monitorizarea sănătății viilor din Moldova',
  },
  home: {
    title: 'Prezentarea gospodăriei',
    ringTitle: 'Parcele după risc',
    stats: {
      vineyards: 'Parcele',
      area: 'Suprafața totală',
      high: 'Cu risc ridicat',
      medium: 'Cu risc mediu',
      today: 'azi, cel mai mare dintre mană și făinare',
    },
    plots: 'Riscul pe parcele azi',
    columns: {
      name: 'Parcelă',
      area: 'Suprafață, ha',
    },
    noEstimate: 'fără estimare azi',
    noVineyards: 'Încă nu aveți parcele — desenați prima pe hartă.',
    loadError: 'Parcelele nu s-au încărcat. Reîncărcați pagina.',
    description:
      'Monitorizarea sănătății viilor din Moldova: diagnosticarea bolilor după fotografiile frunzelor, indici satelitari și prognoza riscului de infecție.',
    openMap: 'Deschide harta',
    openDiagnosis: 'Verifică o frunză',
    openRegions: 'Statistica raioanelor',
    openCompare: 'Compară parcelele',
    openTips: 'Sfaturi pentru câmp',
  },
  errorPage: {
    title: 'Ceva nu a mers bine',
    text: 'A apărut o eroare pe pagină. Încercați să o reîncărcați — dacă eroarea se repetă, anunțați-ne.',
    reload: 'Reîncarcă pagina',
  },
  notFound: {
    title: 'Pagina nu a fost găsită',
    text: 'Este posibil ca adresa să fie greșită sau pagina să fi fost mutată.',
    home: 'Pagina principală',
  },
  auth: {
    email: 'Email',
    password: 'Parola',
    fullName: 'Nume',
    confirmPassword: 'Repetați parola',
    newPassword: 'Parola nouă',
    role: 'Rol',
    passwordHint: 'Cel puțin 8 caractere, cu litere și cifre',
    roles: {
      admin: 'Administrator',
      user: 'Viticultor',
      agronomist: 'Agronom',
    },
    login: {
      title: 'Autentificare',
      submit: 'Intră',
      failed: 'Autentificarea a eșuat',
      noAccount: 'Nu aveți cont?',
      register: 'Înregistrați-vă',
      forgotPassword: 'Ați uitat parola?',
      accountCreated:
        'Contul a fost creat. Autentificați-vă cu emailul și parola.',
      passwordChanged:
        'Parola a fost schimbată. Autentificați-vă cu parola nouă.',
    },
    register: {
      title: 'Înregistrare',
      submit: 'Înregistrați-vă',
      failed: 'Înregistrarea a eșuat',
      emailTaken: 'Un utilizator cu acest email este deja înregistrat',
      haveAccount: 'Aveți deja cont?',
      login: 'Intră',
    },
    forgot: {
      title: 'Recuperarea parolei',
      intro:
        'Indicați emailul cu care v-ați înregistrat: vă vom trimite un link pentru crearea unei parole noi.',
      submit: 'Trimite linkul',
      failed: 'Emailul nu a putut fi trimis',
      backToLogin: 'Înapoi la autentificare',
      sent: 'Dacă există un cont cu adresa <strong>{{email}}</strong>, i-am trimis un email cu un link pentru crearea unei parole noi. Verificați și dosarul „Spam”.',
    },
    reset: {
      title: 'Parola nouă',
      submit: 'Salvează parola',
      failed: 'Parola nu a putut fi schimbată',
      invalidTitle: 'Link nevalid',
      invalidText:
        'Adresa nu conține cheia pentru schimbarea parolei. Deschideți linkul din email integral sau <request>solicitați unul nou</request>.',
      requestNew: 'Solicitați un link nou',
    },
  },
  diagnosis: {
    location: {
      taken:
        'Fotografiat în punctul {{latitude}}, {{longitude}} (după GPS din fotografie)',
      onPlot: '— pe parcela „{{name}}”.',
      offPlot: '— în afara parcelelor dvs.',
    },
    title: 'Diagnostic după fotografia frunzei',
    intro:
      'Încărcați o fotografie a frunzei de viță: modelul va determina boala și va arăta cât de sigur este de răspuns.',
    photo: 'Fotografia frunzei',
    input: 'Alegeți fotografia frunzei',
    layers: {
      title: 'Unde a văzut modelul boala',
      heatmap: 'Hartă termică',
      lesion: 'Leziuni',
      photo: 'Doar fotografia',
      severity:
        'Afectată circa {{value}} din suprafața frunzei (după masca U-Net, orientativ)',
      heatmapHint:
        'Zonele luminoase au influențat cel mai mult răspunsul modelului.',
    },
    result: 'Rezultat',
    drop: 'Trageți fotografia aici sau',
    chooseTouch: 'Alegeți o fotografie din galerie',
    camera: 'Fotografiați frunza',
    choose: 'alegeți un fișier',
    formats: 'JPEG, PNG sau WebP până la 10 MB',
    preview: 'Fotografia aleasă a frunzei',
    change: 'Alegeți altă fotografie',
    crop: {
      open: 'Decupează',
      title: 'Decuparea fotografiei',
      description:
        'Păstrați o singură frunză în pătrat: modelul vede imaginea ca un pătrat de 224 × 224, iar fundalul în plus îi ia frunzei din detalii.',
      frame:
        'Cadrul decupării: mutați-l cu mouse-ul, cu degetul sau cu săgețile',
      size: 'Mărimea cadrului',
      apply: 'Decupează',
      cancel: 'Anulează',
      failed: 'Fotografia nu a putut fi decupată. Încercați din nou.',
    },
    wrongType: 'Este nevoie de o fotografie JPEG, PNG sau WebP',
    tooLarge: 'Fișierul depășește 10 MB',
    analyze: 'Determină boala',
    analyzing: 'Analizăm fotografia…',
    empty: 'Aici va apărea rezultatul analizei.',
    tips: 'Pentru un răspuns precis: o singură frunză de aproape, lumină de zi, fără reflexe și umbre.',
    offlineNoModel:
      'Fără rețea fotografia este analizată doar de modelul descărcat — descărcați-l mai jos când apare rețeaua.',
    deviceFailed:
      'Fotografia nu a putut fi analizată pe dispozitiv. Încercați din nou sau așteptați rețeaua.',
    onDevice:
      'Determinat pe dispozitiv fără rețea: același clasificator ca pe server, dar fără hartă termică și mască a leziunilor.',
    verdict: 'Diagnostic',
    confidence: 'Încrederea modelului: {{value}}',
    lowConfidence:
      'Modelul nu este sigur de răspuns. Refotografiați frunza de aproape, la lumina zilei: o singură frunză, fără reflexe și umbre.',
    probabilities: 'Probabilități',
    model: 'Model: {{name}}',
    disclaimer:
      'Rezultatul este un indiciu, nu concluzia agronomului: pe fotografiile din câmp modelul greșește mai des decât pe cele de laborator.',
  },
  profile: {
    title: 'Profil',
    account: 'Cont',
    save: 'Salvează',
    saved: 'Modificările au fost salvate',
    failed: 'Profilul nu a putut fi salvat',
    loadError: 'Profilul nu s-a încărcat. Reîncărcați pagina.',
    interface: 'Interfață',
    interfaceHint: 'Limba și tema se păstrează în acest browser.',
  },
  history: {
    title: 'Istoricul verificărilor',
    intro:
      'Verificările salvate ale frunzelor: fotografia, diagnosticul modelului și parcela. Se vede unde și când a fost găsită boala.',
    save: 'Salvează fotografia și rezultatul în istoric',
    plot: 'Parcela',
    noPlot: 'Fără parcelă',
    filters: 'Filtrele istoricului',
    disease: 'Diagnostic',
    any: 'Toate',
    from: 'De la data',
    to: 'Până la data',
    count_one: '{{count}} verificare',
    count_few: '{{count}} verificări',
    // В румынском нет формы many; ключ нужен для общей схемы
    count_many: '{{count}} de verificări',
    count_other: '{{count}} de verificări',
    empty: 'Încă nu există verificări salvate.',
    check: 'Verifică o frunză',
    nothingFound: 'Nu există verificări după condițiile alese.',
    loadError: 'Istoricul nu s-a încărcat. Reîncărcați pagina.',
    photo: 'Fotografia frunzei: {{disease}}',
    photoMissing: 'Fotografia nu este disponibilă',
    delete: 'Șterge',
    confirmDelete: 'Ștergeți verificarea?',
    cancel: 'Anulează',
    deleteFailed: 'Verificarea nu a putut fi ștearsă.',
  },
  print: {
    button: 'Tipărește',
    header: 'VitiGuard MD · tipărit {{date}}',
  },
  period: {
    label: 'Perioada',
    week: 'Săptămână',
    month: 'Lună',
    season: 'Sezon',
    custom: 'Date',
    from: 'De la',
    to: 'Până la',
    empty: 'Nu există date pentru perioada aleasă.',
  },
  compare: {
    title: 'Compararea parcelelor',
    intro:
      'Două parcele alături: riscul bolilor azi, vegetația după imaginile Sentinel-2 și scăderile NDVI. Așa se vede care parcelă are nevoie de atenție mai întâi.',
    first: 'Parcela A',
    second: 'Parcela B',
    same: 'Alegeți două parcele diferite.',
    needTwo:
      'Pentru comparare sunt necesare cel puțin două parcele — desenați-le pe hartă.',
    table: 'Compararea parcelelor',
    rows: {
      area: 'Suprafața',
      variety: 'Soiul',
      planted: 'Anul plantării',
      downy: 'Mana azi',
      powdery: 'Făinarea azi',
      ndvi: 'Ultimul NDVI',
      clear: 'Imagini fără nori',
      drops: 'Scăderi NDVI',
    },
    noDrops: 'nu sunt',
    drops: '{{count}}, confirmate: {{confirmed}}',
    chart: 'NDVI pe perioada comună a imaginilor',
    chartLabel:
      'NDVI al parcelelor {{a}} (A) și {{b}} (B) de la {{from}} până la {{to}}; valorile sunt în tabelul dinamicii fiecărei parcele',
    noCommon:
      'Parcelele nu au o perioadă comună de imagini: actualizați vegetația în fișa fiecărei parcele.',
  },
  share: {
    open: 'Distribuie',
    text: 'VitiGuard MD: {{disease}} (încrederea modelului {{confidence}}), {{place}}, {{date}}. Fișa verificării este în PDF-ul atașat.',
    copied: 'Descrierea verificării a fost copiată — lipiți-o în mesaj.',
    failed: 'Verificarea nu a putut fi distribuită. Încercați din nou.',
  },
  report: {
    save: 'Descarcă fișa verificării în PDF',
    failed: 'Fișa nu a putut fi salvată. Încercați din nou.',
    title: 'VitiGuard MD — verificarea frunzei de viță-de-vie',
    severity:
      'Este afectată circa {{value}} din suprafața frunzei (masca U-Net)',
    vineyard: 'Parcela: {{name}}',
    date: 'Fotografiată: {{date}}',
    location: 'Coordonatele fotografiei: {{lat}}, {{lon}}',
    probabilities: 'Probabilitățile bolilor',
    model: 'Modelul {{model}}, versiunea {{version}}',
    disclaimer:
      'Diagnosticul modelului este orientativ, nu o concluzie: pe fotografiile din teren greșește mai des. Decizia privind tratamentul o ia agronomul.',
  },
  review: {
    open: 'Aviz',
    title: 'Avizul agronomului',
    description:
      'Modelul a determinat: {{disease}}. Avizul se păstrează alături de răspunsul modelului și nu îl schimbă.',
    question: 'Diagnosticul modelului este corect?',
    modelRight: 'Da, modelul are dreptate',
    modelWrong: 'Nu, în fotografie este altceva',
    correct: 'Diagnosticul corect',
    comment: 'Comentariu (opțional)',
    save: 'Salvează avizul',
    withdraw: 'Retrage avizul',
    failed: 'Avizul nu a putut fi salvat. Încercați din nou.',
    confirmed: '{{reviewer}}: diagnostic confirmat',
    corrected: '{{reviewer}}: de fapt — {{disease}}',
    expert: 'Agronom',
  },
  advice: {
    downyInfection:
      'Condiții pentru infecția cu mană. Dacă înainte de ploaie nu a fost un tratament de protecție — un produs sistemic în primele zile după infecție.',
    downyIncubation:
      'În curând pot apărea pete de mană: verificați dosul frunzelor.',
    downySymptoms:
      'Sunt așteptate pete de mană: verificați parcela, înlăturați frunzele afectate.',
    powderyHigh:
      'Risc ridicat de făinare: tratament cu sulf sau cu un produs sistemic, aerisirea coronamentului.',
    powderyMedium:
      'Riscul de făinare crește: verificați frunzele și strugurii.',
    calm: 'Nu există condiții periculoase.',
  },
  alerts: {
    title: 'Avertizări',
    intro:
      'Risc ridicat de boli pe parcelele dvs. pentru azi și următoarele două zile — după recalcularea riscului la fiecare 6 ore.',
    bell: 'Avertizări',
    bellUnread_one: 'Avertizări: {{count}} necitită',
    bellUnread_few: 'Avertizări: {{count}} necitite',
    bellUnread_many: 'Avertizări: {{count}} de necitite',
    bellUnread_other: 'Avertizări: {{count}} de necitite',
    text: '{{disease}}: risc ridicat pe parcela „{{plot}}”',
    today: 'azi',
    tomorrow: 'mâine',
    forecast: 'după prognoza meteo',
    markRead: 'Citit',
    markAllRead: 'Marchează toate ca citite',
    filter: 'Ce avertizări să fie afișate',
    unread: 'Necitite',
    all: 'Toate',
    none: 'Încă nu au fost avertizări.',
    noneUnread: 'Nu există avertizări necitite.',
    loadError: 'Avertizările nu s-au încărcat. Reîncărcați pagina.',
    showAll_one: 'Toate avertizările ({{count}})',
    showAll_few: 'Toate avertizările ({{count}})',
    showAll_many: 'Toate avertizările ({{count}})',
    showAll_other: 'Toate avertizările ({{count}})',
  },
  tips: {
    title: 'Sfaturi pentru lucrul în câmp',
    intro:
      'Pe scurt despre cum să fotografiați frunza, cum să citiți riscul și cum să vă pregătiți pentru lucru fără semnal. Pagina se deschide și fără rețea.',
    photo: {
      title: 'Cum să fotografiați frunza',
      items: {
        one: 'O singură frunză, de aproape, întreagă în cadru — modelul a fost antrenat pe astfel de fotografii.',
        light:
          'Lumină de zi difuză, fără reflexe și umbre puternice; nu fotografiați contra soarelui.',
        close:
          'Dacă petele sunt mici, apropiați-vă în loc să folosiți zoomul: vor fi mai multe detalii.',
        both: 'Mana se vede pe dosul frunzei (puf alb): dacă aveți îndoieli, fotografiați și partea de jos.',
        gps: 'Activați localizarea pentru cameră: după coordonatele fotografiei parcela se completează singură.',
      },
    },
    risk: {
      title: 'Ce înseamnă nivelurile de risc',
      items: {
        high: 'Ridicat — vremea favorizează infecția sau sunt așteptate pete: vedeți „Ce trebuie făcut” în fereastra „Riscul pe zile”.',
        medium:
          'Mediu — riscul crește (incubația manei, indicele de făinare de la 30): verificați parcela.',
        low: 'Scăzut — nu există condiții periculoase; verificare obișnuită.',
        forecast:
          'Zilele de după azi sunt calculate după prognoza meteo și se precizează la fiecare recalculare.',
      },
    },
    offline: {
      title: 'Lucrul fără semnal',
      items: {
        model:
          'Descărcați din timp modelul pe pagina „Diagnostic” — fără rețea fotografia o va analiza telefonul.',
        map: 'Deschideți harta parcelelor necesare când aveți semnal: fundalul vizualizat se va păstra.',
        install:
          'Instalați aplicația pe telefon („Adaugă pe ecranul principal”) — se va deschide și fără rețea.',
        sync: 'Fără rețea verificările nu se salvează în istoric: repetați analiza cu salvare când apare semnalul.',
      },
    },
    safety: {
      title: 'Siguranța la tratamente',
      items: {
        label:
          'Produsul, doza și numărul de tratamente — după etichetă și registrul de stat al produselor de protecție a plantelor.',
        ppe: 'Lucrați cu mănuși, ochelari de protecție și respirator; nu mâncați și nu fumați în timpul tratamentului.',
        wind: 'Nu stropiți pe vânt și înainte de ploaie: produsul va fi purtat sau spălat.',
        wait: 'Respectați termenul de pauză de la ultimul tratament până la recoltare — este indicat pe etichetă.',
      },
    },
    diseases: 'Semnele bolilor',
    check: 'Verifică frunza după fotografie',
  },
  notifications: {
    title: 'Avertizări despre boli',
    question: 'Despre ce risc să fiți avertizat',
    high: 'Doar despre riscul ridicat',
    highHint:
      'Infecția cu mană după regula „celor trei de zece”, pete așteptate, indicele de făinare de la 60.',
    medium: 'Despre riscul mediu și ridicat',
    mediumHint:
      'Și despre începutul incubației și creșterea indicelui de făinare — vor fi mai multe avertizări.',
    off: 'Fără avertizări',
    offHint: 'Riscul se vede în continuare pe hartă și pe pagina principală.',
    saved: 'Salvat',
    failed: 'Nu s-a putut salva. Încercați din nou.',
    loadError: 'Setările avertizărilor nu s-au încărcat.',
  },
  camera: {
    title: 'Fotografierea frunzei',
    preview: 'Imaginea de la cameră',
    hint: 'Încadrați o singură frunză întreagă, la lumina zilei și fără reflexe.',
    take: 'Fotografiază',
    torchOn: 'Pornește blițul',
    torchOff: 'Oprește blițul',
    zoom: 'Zoom',
    denied:
      'Nu există acces la cameră. Permiteți-l în setările browserului sau alegeți o fotografie din galerie.',
    missing: 'Camera nu a fost găsită. Alegeți o fotografie din galerie.',
    failed:
      'Camera nu a pornit. Încercați din nou sau alegeți o fotografie din galerie.',
  },
  diseaseInfo: {
    title: 'Despre boală',
    symptoms: 'Semne',
    conditions: 'Când se dezvoltă',
    control: 'Ce trebuie făcut',
    note: 'Alegeți produsele și dozele după registrul de stat al produselor de protecție a plantelor și împreună cu agronomul.',
    healthy: {
      symptoms: 'Modelul nu a găsit pete, depuneri sau uscare pe frunză.',
      conditions:
        'Riscul de boli crește după ploi, la rouă și într-un coronament des.',
      control:
        'Verificați butucii o dată pe săptămână și după ploi; riscul după vreme — pe harta parcelelor.',
    },
    black_rot: {
      symptoms:
        'Pete rotunde brune cu margine închisă și puncte negre în interior; boabele se înnegresc și se zbârcesc în „mumii”.',
      conditions:
        'Vreme caldă și umedă, ploi de la dezmugurire până la închiderea strugurelui.',
      control:
        'Adunați și distrugeți „mumiile” și lăstarii afectați, aerisiți coronamentul; tratamente preventive cu fungicide de la înflorire până la închiderea strugurelui.',
    },
    esca: {
      symptoms:
        'Dungi „tigrate” între nervuri — întâi galbene sau roșii, apoi brune; pe arșiță butucul se poate usca brusc.',
      conditions:
        'Boală a lemnului: ciupercile pătrund prin rănile de tăiere, mai des la butucii bătrâni; în verile calde semnele sunt mai puternice.',
      control:
        'Nu există tratament chimic. Tăiați pe vreme uscată și acoperiți tăieturile mari, înlăturați și ardeți brațele afectate, marcați butucii bolnavi.',
    },
    leaf_blight: {
      symptoms:
        'Pete brune neregulate pe frunză, care apoi se unesc; frunzele afectate cad devreme.',
      conditions: 'Vreme caldă și umedă în a doua jumătate a verii.',
      control:
        'Adunați frunzele căzute, aerisiți coronamentul; de obicei ajung tratamentele împotriva manei și putregaiului negru.',
    },
    downy_mildew: {
      symptoms:
        'Pe fața frunzei — pete galbene „uleioase”, pe dos sub ele — puf alb; atacă inflorescențele și boabele tinere.',
      conditions:
        'Ploaie și frunză udă la peste 10 °C — regula „celor trei de zece”; după infecție petele apar în 5–18 zile.',
      control:
        'Urmăriți riscul de mană pe hartă: produse de contact (cu cupru) — înainte de ploaie, sistemice — în primele zile după infecție; înlăturați copilii.',
    },
    powdery_mildew: {
      symptoms:
        'Depunere făinoasă alb-cenușie pe ambele fețe ale frunzei și pe boabe, miros de mucegai; boabele crapă.',
      conditions:
        'Căldură de 20–30 °C și aer umed fără ploaie, coronament des.',
      control:
        'Produse pe bază de sulf și fungicide sistemice la intervale după indicele Gubler-Thomas; lucrări în verde și aerisirea coronamentului.',
    },
  },
  diseases: {
    healthy: 'Frunză sănătoasă',
    black_rot: 'Putregai negru',
    esca: 'Esca',
    leaf_blight: 'Pătarea frunzelor',
    downy_mildew: 'Mană',
    powdery_mildew: 'Făinare',
  },
  regions: {
    title: 'Statistica pe raioane',
    intro:
      'Viile cartografiate în OpenStreetMap și parcelele dvs. pe raioanele Moldovei. O vie aparține raionului în care se află mijlocul ei.',
    summary: {
      osmCount: 'Vii în OpenStreetMap',
      osmArea: 'Suprafața lor',
      mine: 'Parcelele mele',
    },
    ha: '{{value}} ha',
    mineValue: '{{count}} · {{area}} ha',
    chart: 'Raioanele cu cea mai mare suprafață de vii',
    table: 'Vii pe raioane',
    columns: {
      name: 'Raion',
      area: 'Suprafața raionului, ha',
      osmCount: 'Vii OSM',
      osmArea: 'Suprafața lor, ha',
      share: 'Cota raionului',
      mine: 'Parcelele mele, buc. · ha',
    },
    source:
      'Sursa: OpenStreetMap (ODbL), limitele raioanelor — geoBoundaries. OpenStreetMap nu este cartografiat complet, așa că suprafața reală a viilor este mai mare.',
  },
  vegetation: {
    open: 'Dinamica vegetației',
    title: 'Dinamica vegetației: {{name}}',
    description:
      'Indici după imaginile Sentinel-2 din sezon: NDVI — biomasa verde, NDRE — clorofila, reflectă mai devreme stresul.',
    series: {
      ndvi: 'NDVI — biomasă',
      ndre: 'NDRE — clorofilă',
    },
    chartLabel:
      'Graficul NDVI și NDRE: {{count}} imagini între {{from}} și {{to}}; valorile sunt în tabelul de sub grafic',
    summary:
      'Ultimul NDVI {{ndvi}} ({{date}}). Imagini fără nori: {{clear}}, acoperite de nori deasupra parcelei: {{cloudy}}.',
    empty:
      'Încă nu există indici. Apăsați „Actualizează după imagini noi” — calculul durează câteva minute.',
    refresh: 'Actualizează după imagini noi',
    refreshing:
      'Calculul a pornit: imaginile sezonului sunt procesate pe rând, graficul se va completa în câteva minute.',
    table: 'Tabelul valorilor',
    columns: {
      date: 'Data',
      cloud: 'Nori deasupra parcelei',
    },
  },
  risk: {
    weatherChart: 'Vremea sezonului pe parcelă',
    temperatureChartLabel:
      'Graficul temperaturii medii zilnice pe sezon; triunghiurile — zilele de infecție cu mană',
    temperatureShort: 'Temperatura',
    temperatureLegend: 'Temperatura medie zilnică, °C',
    precipitationChartLabel: 'Coloanele precipitațiilor zilnice pe sezon, mm',
    precipitationValue: '{{value}} mm',
    precipitationShort: 'Precipitații',
    precipitationLegend: 'Precipitații zilnice, mm',
    weatherHint:
      'Mana infectează frunza după o ploaie de cel puțin 10 mm la peste 10 °C. Zilele de după azi — după prognoză.',
    mapLegend: 'Culoarea parcelelor — riscul de azi',
    mapLegendWorst: 'Cel mai mare dintre mană și făinare',
    section: 'Riscul de boli',
    open: 'Riscul pe zile',
    title: 'Riscul de boli: {{name}}',
    description:
      'După vremea de pe parcelă: regula „celor trei de zece” și modelul Goidanich pentru mană, indicele Gubler-Thomas pentru făinare. Zilele de după azi — după prognoza meteo.',
    downy: 'Mană',
    powdery: 'Făinare',
    levels: {
      low: 'scăzut',
      medium: 'mediu',
      high: 'ridicat',
    },
    today: 'Azi',
    lastDay: 'Ultima estimare — {{date}}',
    notCalculated: 'Riscul încă nu este calculat',
    offSeason:
      'Azi este în afara sezonului: modelele calculează riscul din aprilie până în septembrie (regula „celor trei de zece” — până în iunie).',
    incubation:
      'Este în curs incubația manei după infecția din {{date}}: parcurs {{progress}} %.',
    symptoms:
      'După modelul Goidanich sunt așteptate pete de mană după infecția din {{date}} — tratamentul trebuia făcut înainte de această zi.',
    noIncubation: 'Acum nu există incubație de mană.',
    gublerToday: 'Indicele de făinare Gubler-Thomas — {{index}}.',
    plan: 'Ce trebuie făcut: azi și săptămâna următoare (după prognoza meteo)',
    outlookTitle: 'Probabilitatea focarului pe 7 zile',
    outlookMembers: 'Ansamblul ICON-EPS: {{count}} variante',
    outlookWeek: 'Pe săptămână',
    offSeasonShort: 'în afara sezonului',
    outlookTableNote:
      'Sub nivelul de risc în rândurile de prognoză este indicată probabilitatea focarului conform ansamblului ICON-EPS.',
    columns: {
      advice: 'Ce trebuie făcut',
      date: 'Data',
    },
    powderyChart: 'Făinare: indicele Gubler-Thomas',
    powderyChartLabel:
      'Graficul indicelui Gubler-Thomas pe sezon: de la 0 la 100, de la 60 — risc ridicat',
    gublerShort: 'Indice',
    downyChart: 'Mană: incubația după modelul Goidanich, %',
    downyChartLabel:
      'Graficul progresului incubației manei pe sezon: 100 % — sunt așteptate pete; triunghiurile — zile de infecție',
    incubationShort: 'Incubație',
    todayMark: 'azi',
    infectionMark: 'Infecție după regula „celor trei de zece”: {{date}}',
    markersHint:
      'Triunghiurile de pe axă — zilele în care, după regula „celor trei de zece”, era posibilă infecția primară.',
    empty:
      'Riscul încă nu este calculat. Apăsați „Recalculează” — serverul va încărca vremea sezonului și prognoza.',
    refresh: 'Recalculează după vremea actuală',
    disclaimer:
      'Modelele agronomice estimează condițiile pentru boală după vreme, nu prezența bolii: decizia privind tratamentul o ia agronomul.',
  },
  notes: {
    open: 'Notițe din teren',
    title: 'Notițe din teren: {{name}}',
    description:
      'Text, fotografie și punct pe parcelă. Fără rețea, notița așteaptă pe telefon și se trimite singură.',
    textLabel: 'Ce ați observat',
    textPlaceholder: 'De exemplu: pete pe etajul inferior, rândul 12',
    photoLabel: 'Fotografie',
    locate: 'Marchează poziția mea',
    located: 'Poziția a fost marcată',
    locateFailed: 'Poziția nu a putut fi determinată',
    save: 'Salvează notița',
    emptyError: 'Scrieți un text sau adăugați o fotografie',
    empty: 'Încă nu există notițe.',
    loadFailed: 'Notițele nu s-au încărcat.',
    waiting: 'Așteaptă rețeaua',
    photoOnly: 'Notiță cu fotografie',
    photoAlt: 'Fotografia notiței din {{date}}',
    onMap: 'Pe hartă',
    delete: 'Șterge',
    deleteNote: 'Șterge notița din {{date}}',
    deleteQueued: 'Scoate notița din coadă',
    rejected_one: 'Serverul nu a acceptat {{count}} notiță din coadă.',
    rejected_few: 'Serverul nu a acceptat {{count}} notițe din coadă.',
    rejected_many: 'Serverul nu a acceptat {{count}} de notițe din coadă.',
    rejected_other: 'Serverul nu a acceptat {{count}} de notițe din coadă.',
  },
  wineries: {
    toggle: 'Vinării și magazine',
    kinds: { winery: 'Vinărie', shop: 'Magazin' },
    website: 'Site',
    approximate:
      'Adresa exactă nu este confirmată: harta arată orașul. Verificați pe site.',
  },
  assistant: {
    open: 'Deschide asistentul',
    title: 'Asistentul VitiGuard',
    greeting:
      'Întrebați cu ce să tratați via, ce vin să alegeți și de unde să-l cumpărați.',
    inputLabel: 'Întrebarea dvs.',
    placeholder: 'De exemplu: cu ce stropesc contra păianjenului',
    send: 'Întreabă',
    unknown:
      'Deocamdată știu să răspund despre tratamente, alegerea vinului și de unde îl puteți cumpăra. Apăsați unul dintre butoanele de mai jos.',
    chips: {
      spray: 'Cu ce stropesc',
      wine: 'Ce vin aleg',
      buy: 'De unde cumpăr vin',
    },
    keywords: {
      spray:
        'stropi, trata, boal, dăunăt, daunat, parazit, mană, mana, făinare, fainare, păianjen, paianjen, molie, putregai, filoxer, fungicid',
      wine: 'vin, băutur, bautur',
      buy: 'cumpăr, cumpar, magazin, vinări, crama, cramă, unde',
    },
    spray: {
      intro:
        'Abordări generale. Mai întâi stabiliți ce este pe viță: verificarea după fotografie vă poate ajuta.',
      note: 'Alegeți produsul și doza după Registrul de stat și etichetă, iar perioada de pauză notați-o în jurnalul tratamentelor. Dacă aveți dubii, întrebați un agronom.',
    },
    pests: {
      downy: {
        name: 'Mană',
        advice:
          'Produse de contact, de exemplu cuprice, înainte de ploaie; sistemice în primele zile după infectare.',
      },
      powdery: {
        name: 'Făinare',
        advice:
          'Produse pe bază de sulf sau fungicide sistemice. Pe caniculă nu se lucrează cu sulf: poate arde frunzele.',
      },
      botrytis: {
        name: 'Putregai cenușiu',
        advice:
          'Rărirea frunzelor din jurul strugurilor și botriticide înainte de închiderea ciorchinilor și la începutul maturării.',
      },
      moth: {
        name: 'Molia strugurilor',
        advice:
          'Momentul îl arată capcanele cu feromoni; produse biologice cu Bacillus thuringiensis sau insecticide permise la ieșirea omizilor.',
      },
      mites: {
        name: 'Păianjenul roșu',
        advice:
          'Acaricide doar la o populare vizibilă: tratamentele inutile distrug acarienii prădători. Sulful limitează parțial.',
      },
      phylloxera: {
        name: 'Filoxera',
        advice:
          'Stropirea nu rezolvă problema: protecția principală este plantarea pe portaltoi rezistenți.',
      },
    },
    wine: {
      intro: 'Asocieri cu soiuri moldovenești. Sunt un reper, nu o regulă:',
      note: 'Alcoolul se vinde doar persoanelor majore. Consumați cu moderație.',
    },
    wines: {
      meat: {
        dish: 'Carne roșie și grătar',
        wine: 'Fetească Neagră, Rară Neagră, Cabernet Sauvignon',
      },
      fish: {
        dish: 'Pește și salate',
        wine: 'Fetească Albă, Viorica, Sauvignon Blanc',
      },
      cheese: { dish: 'Brânzeturi', wine: 'Fetească Regală, rose sec' },
      dessert: { dish: 'Deserturi', wine: 'muscat dulce, vin de gheață' },
      party: { dish: 'Sărbătoare', wine: 'spumant, de exemplu de la Cricova' },
    },
    buy: {
      intro:
        'Vinării din apropierea Chișinăului. Puteți cumpăra la fața locului sau de pe site-urile lor:',
      nearby: 'Cele mai apropiate vinării și magazine:',
      km: '{{value}} km',
      locate: 'Caută lângă mine',
      locateFailed: 'Poziția nu a putut fi determinată.',
      map: 'Arată pe hartă',
      failed: 'Lista nu s-a încărcat.',
      source:
        'Date OpenStreetMap: programul și disponibilitatea verificați-le la vânzător.',
    },
  },
  palette: {
    open: 'Căutare rapidă',
    title: 'Căutare rapidă',
    placeholder: 'Secțiune, parcelă sau acțiune',
    sections: 'Secțiune',
    plots: 'Parcelă',
    actions: 'Acțiune',
    wineries: 'Arată vinăriile pe hartă',
    empty: 'Nu s-a găsit nimic',
  },
  weatherEvents: {
    title: 'Evenimente meteo',
    date: 'Ziua',
    kind: 'Ce s-a întâmplat',
    severity: 'Daune',
    note: 'Notiță',
    save: 'Notează evenimentul',
    empty: 'Încă nu există evenimente.',
    loadFailed: 'Jurnalul nu s-a încărcat.',
    delete: 'Șterge',
    deleteOne: 'Șterge evenimentul din {{date}}',
    kinds: {
      frost: 'Îngheț',
      hail: 'Grindină',
      wind: 'Vânt puternic',
      drought: 'Secetă',
      heat: 'Caniculă',
    },
    severities: { 1: 'Ușoare', 2: 'Vizibile', 3: 'Puternice' },
  },
  phenology: {
    harvestBlocked:
      'Perioada de pauză nu s-a încheiat: după jurnalul tratamentelor, recoltarea nu mai devreme de {{date}}.',
    open: 'Fenofaze',
    title: 'Fenofaze: {{name}}',
    description:
      'Notați ce se întâmplă acum cu via: jurnalul sezonului pe scara Eichhorn–Lorenz.',
    current: 'Acum: {{stage}}',
    noCurrent: 'În acest sezon nu sunt notate fenofaze',
    date: 'Ziua',
    stage: 'Fenofaza',
    save: 'Notează fenofaza',
    empty: 'Încă nu există notări.',
    loadFailed: 'Notările nu s-au încărcat.',
    delete: 'Șterge',
    deleteOne: 'Șterge notarea din {{date}}',
    stages: {
      1: 'mugure de iarnă',
      4: 'dezmugurire',
      12: 'lăstari de circa 10 cm',
      19: 'începutul înfloritului',
      23: 'înflorit, 50 % din căpăcele',
      27: 'legarea boabelor',
      31: 'boabe cât un bob de mazăre',
      35: 'pârgă',
      38: 'recoltare',
      43: 'începutul căderii frunzelor',
    },
  },
  treatments: {
    open: 'Tratamente și plan',
    title: 'Tratamente și plan: {{name}}',
    description:
      'Planul tratamentelor preventive și curative pentru o săptămână și registrul stropirilor efectuate.',
    planTitle: 'Planul pentru o săptămână',
    protectionStatus: 'Starea protecției',
    protectedUntil: 'Protejat până la {{date}}',
    notProtected: 'Neprotejat',
    noRecommendations:
      'Nu există recomandări de tratament: parcela este protejată sau nu sunt condiții de infecție.',
    actions: {
      protect: 'Tratament preventiv',
      cure: 'Tratament curativ',
      inspect: 'Inspectarea parcelei',
    },
    fungicides: {
      contact: 'De contact (cupru, mancozeb)',
      systemic: 'Sistemic',
      sulfur: 'Sulf',
    },
    fungicideShort: {
      contact: 'De contact',
      systemic: 'Sistemic',
      sulfur: 'Sulf',
    },
    reasons: {
      downy_infection_forecast: 'Infecție de mană după prognoza meteo',
      downy_infection_past: 'Infecție de mană în ultimele 3 zile',
      downy_symptoms: 'Pete de mană așteptate după modelul Goidanich',
      powdery_high: 'Risc ridicat de făinare (indice ≥ 60)',
      powdery_high_hot:
        'Risc ridicat de făinare pe caniculă (sulful este înlocuit cu sistemic)',
    },
    dueBy: 'Până la {{date}}',
    riskDay: 'Risc pe {{date}}',
    journalTitle: 'Registrul tratamentelor',
    addTreatment: 'Înregistrează tratament',
    cancel: 'Anulează',
    save: 'Salvează',
    futureDateError: 'Data tratamentului nu a sosit încă',
    emptyJournal: 'Nu sunt înregistrate tratamente.',
    appliedOn: 'Data tratamentului',
    fungicideLabel: 'Tipul fungicidului',
    productLabel: 'Denumirea produsului',
    productPlaceholder: 'De exemplu, Ridomil Gold',
    waitingLabel: 'Pauză până la recoltare, zile',
    waitingHint: 'Este indicată pe eticheta produsului',
    harvestFrom:
      'Recoltarea — nu mai devreme de {{date}}: este în curs pauza după tratament.',
    waitingValue: '{{count}} zile',
    deleteTreatment: 'Șterge înregistrarea tratamentului din {{date}}',
    confirmDeleteTreatment: 'Confirmă ștergerea înregistrării din {{date}}',
    confirmDelete: 'Ștergi înregistrarea?',
    delete: 'Șterge',
    columns: {
      waiting: 'Pauză',
      date: 'Data',
      fungicide: 'Tip fungicid',
      product: 'Produs',
      actions: 'Acțiuni',
      action: 'Acțiune',
      disease: 'Boală',
      dueBy: 'Termen',
      reason: 'Motiv',
    },
    note: 'Durata protecției este orientativă (contact — 8 zile, sistemic — 12 zile, sulf — 7 zile). Instrucțiunea produsului are prioritate.',
  },
  reports: {
    pdf: 'Raport PDF',
    downloadPdf: 'Descarcă raportul PDF',
    generatingPdf: 'Se generează raportul…',
    pdfFailed: 'Nu s-a putut descărca raportul PDF',
    exportData: 'Exportă date',
    exportDialogTitle: 'Export date: {{name}}',
    format: 'Formatul fișierului',
    formatXlsx: 'XLSX (foaie de calcul)',
    formatCsv: 'CSV (arhivă ZIP)',
    periodStart: 'Începutul perioadei',
    periodEnd: 'Sfârșitul perioadei',
    download: 'Descarcă',
    cancel: 'Anulare',
    exportFailed: 'Nu s-au putut exporta datele',
    periodInvalid: 'Începutul perioadei este după sfârșit',
    periodTooLong: 'Perioada depășește trei ani: exportați-o pe părți',
  },
  validation: {
    nameMax: 'Cel mult 255 de caractere',
    emailRequired: 'Introduceți emailul',
    emailInvalid: 'Introduceți un email corect',
    passwordRequired: 'Introduceți parola',
    passwordMin: 'Cel puțin 8 caractere',
    passwordMax: 'Cel mult 128 de caractere',
    passwordLetter: 'Adăugați cel puțin o literă',
    passwordDigit: 'Adăugați cel puțin o cifră',
    passwordsMismatch: 'Parolele nu coincid',
    confirmRequired: 'Repetați parola',
    nameRequired: 'Introduceți numele',
    vineyardNameRequired: 'Introduceți denumirea parcelei',
    vineyardNameMax: 'Cel mult 255 de caractere',
    plantingYear: 'Anul plantării — de la 1900 până la anul curent',
  },
}
