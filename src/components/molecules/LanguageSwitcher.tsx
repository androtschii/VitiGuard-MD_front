import { useTranslation } from 'react-i18next'
import { SlidingChoice } from '@/components/molecules/SlidingChoice'
import { LANGUAGES } from '@/i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <SlidingChoice
      label={t('common.language')}
      value={i18n.resolvedLanguage ?? 'ru'}
      onChange={(code) => void i18n.changeLanguage(code)}
      // Название языка — на самом языке: так его найдёт тот, кто не читает текущий
      options={LANGUAGES.map((language) => ({
        value: language.code,
        label: language.label,
        content: language.short,
        lang: language.code,
      }))}
    />
  )
}
