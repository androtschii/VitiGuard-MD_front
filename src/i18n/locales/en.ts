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
    description:
      'Vineyard health monitoring for Moldova: disease diagnosis from leaf photos, satellite indices and infection risk forecasts.',
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
  validation: {
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
  },
}
