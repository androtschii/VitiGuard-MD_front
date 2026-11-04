import type { Disease } from '@/api/diagnosis'

export type AssistantTopic =
  'risk' | 'plan' | 'history' | 'disease' | 'spray' | 'wine' | 'buy'

export type InfoDisease = Exclude<Disease, 'healthy'>

// Вопрос о своём хозяйстве важнее справки: «когда обрабатывать от милдью» —
// план участков, а не общий совет. «Где купить вино» — про магазин, а не про
// выбор вина. Название болезни без слов об обработке — справка о болезни;
// она раньше вина: «болезни винограда» содержат основу «вин»
const ORDER: AssistantTopic[] = [
  'plan',
  'risk',
  'history',
  'buy',
  'spray',
  'disease',
  'wine',
]

// Милдью раньше оидиума: «ложная мучнистая роса» — это милдью
const DISEASE_ORDER: InfoDisease[] = [
  'downy_mildew',
  'powdery_mildew',
  'black_rot',
  'esca',
  'leaf_blight',
]

function mentions(text: string, words: string) {
  return words.split(',').some((word) => {
    const stem = word.trim()
    return stem !== '' && text.includes(stem)
  })
}

// Помощник работает по правилам, без внешней модели: ищет в вопросе основы слов
export function matchTopic(
  question: string,
  keywords: Record<AssistantTopic, string>,
): AssistantTopic | null {
  const text = question.toLowerCase()
  return ORDER.find((topic) => mentions(text, keywords[topic])) ?? null
}

export function matchDisease(
  question: string,
  words: Record<InfoDisease, string>,
): InfoDisease | null {
  const text = question.toLowerCase()
  return DISEASE_ORDER.find((disease) => mentions(text, words[disease])) ?? null
}
