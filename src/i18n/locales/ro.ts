import type { Messages } from './ru'

export const ro: Messages = {
  common: {
    loading: 'Se încarcă…',
    close: 'Închide',
    menu: 'Meniu',
    closeMenu: 'Închide meniul',
    mainNavigation: 'Navigare principală',
    skipToContent: 'Salt la conținut',
    noData: 'Nu există date',
    logout: 'Ieșire',
    language: 'Limba',
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
    description:
      'Monitorizarea sănătății viilor din Moldova: diagnosticarea bolilor după fotografiile frunzelor, indici satelitari și prognoza riscului de infecție.',
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
  validation: {
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
  },
}
