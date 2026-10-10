export const ru = {
  common: {
    loading: 'Загрузка…',
    close: 'Закрыть',
    menu: 'Меню',
    closeMenu: 'Закрыть меню',
    mainNavigation: 'Основная навигация',
    skipToContent: 'Перейти к содержимому',
    noData: 'Нет данных',
    logout: 'Выйти',
    language: 'Язык',
  },
  theme: {
    label: 'Тема',
    system: 'Как в системе',
    light: 'Светлая',
    dark: 'Тёмная',
  },
  nav: {
    home: 'Главная',
    map: 'Карта',
  },
  map: {
    title: 'Карта виноградников',
    label: 'Карта виноградников Молдовы',
    zoomIn: 'Приблизить',
    zoomOut: 'Отдалить',
    resetBearing: 'Повернуть на север',
    fullscreenEnter: 'Во весь экран',
    fullscreenExit: 'Выйти из полноэкранного режима',
    attribution: 'Источники данных карты',
    unsupported:
      'Браузер не может показать карту: нужна поддержка WebGL. Обновите браузер или включите аппаратное ускорение в его настройках.',
    basemap: {
      label: 'Подложка',
      scheme: 'Схема',
      satellite: 'Спутник',
      hybrid: 'Гибрид',
    },
  },
  pagination: {
    label: 'Страницы',
    previous: 'Назад',
    next: 'Вперёд',
    page: 'Страница {{page}}',
  },
  api: {
    serverUnavailable: 'Сервер недоступен',
    serverError: 'Ошибка сервера ({{status}})',
    connecting: 'Подключение к API…',
    unavailable: 'API недоступен',
    status: 'API {{version}}, окружение {{environment}}',
  },
  footer: {
    tagline: 'мониторинг здоровья виноградников Молдовы',
  },
  home: {
    description:
      'Мониторинг здоровья виноградников Молдовы: диагностика болезней по фото листьев, спутниковые индексы и прогноз риска заражения.',
    openMap: 'Открыть карту',
  },
  errorPage: {
    title: 'Что-то пошло не так',
    text: 'На странице произошла ошибка. Попробуйте обновить её — если ошибка повторится, сообщите нам.',
    reload: 'Обновить страницу',
  },
  notFound: {
    title: 'Страница не найдена',
    text: 'Возможно, адрес набран с ошибкой или страница была перенесена.',
    home: 'На главную',
  },
  auth: {
    email: 'Email',
    password: 'Пароль',
    fullName: 'Имя',
    confirmPassword: 'Повторите пароль',
    newPassword: 'Новый пароль',
    role: 'Роль',
    passwordHint: 'Не короче 8 символов, с буквами и цифрами',
    roles: {
      user: 'Виноградарь',
      agronomist: 'Агроном',
    },
    login: {
      title: 'Вход',
      submit: 'Войти',
      failed: 'Не удалось войти',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      forgotPassword: 'Забыли пароль?',
      accountCreated: 'Аккаунт создан. Войдите, используя email и пароль.',
      passwordChanged: 'Пароль изменён. Войдите с новым паролем.',
    },
    register: {
      title: 'Регистрация',
      submit: 'Зарегистрироваться',
      failed: 'Не удалось зарегистрироваться',
      emailTaken: 'Пользователь с таким email уже зарегистрирован',
      haveAccount: 'Уже есть аккаунт?',
      login: 'Войти',
    },
    forgot: {
      title: 'Восстановление пароля',
      intro:
        'Укажите email, с которым вы регистрировались: мы отправим ссылку для создания нового пароля.',
      submit: 'Отправить ссылку',
      failed: 'Не удалось отправить письмо',
      backToLogin: 'Вернуться ко входу',
      sent: 'Если аккаунт с адресом <strong>{{email}}</strong> существует, мы отправили на него письмо со ссылкой для создания нового пароля. Проверьте также папку «Спам».',
    },
    reset: {
      title: 'Новый пароль',
      submit: 'Сохранить пароль',
      failed: 'Не удалось изменить пароль',
      invalidTitle: 'Ссылка недействительна',
      invalidText:
        'В адресе нет ключа для смены пароля. Откройте ссылку из письма целиком или <request>запросите новую</request>.',
      requestNew: 'Запросить новую ссылку',
    },
  },
  validation: {
    emailRequired: 'Введите email',
    emailInvalid: 'Введите корректный email',
    passwordRequired: 'Введите пароль',
    passwordMin: 'Не короче 8 символов',
    passwordMax: 'Не длиннее 128 символов',
    passwordLetter: 'Добавьте хотя бы одну букву',
    passwordDigit: 'Добавьте хотя бы одну цифру',
    passwordsMismatch: 'Пароли не совпадают',
    confirmRequired: 'Повторите пароль',
    nameRequired: 'Введите имя',
  },
}

// Словари других языков обязаны повторять структуру русского: тип проверяет,
// что ни один ключ не пропущен и не добавлен лишний
type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> }
export type Messages = Shape<typeof ru>
