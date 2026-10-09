import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const id = useId()
  const current = i18n.resolvedLanguage ?? 'ru'

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="sr-only">
        {t('common.language')}
      </label>
      <select
        id={id}
        value={current}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
      >
        {LANGUAGES.map((language) => (
          // Название языка — на самом языке: так его найдёт тот, кто не читает текущий
          <option
            key={language.code}
            value={language.code}
            lang={language.code}
          >
            {language.short} · {language.label}
          </option>
        ))}
      </select>
    </div>
  )
}
