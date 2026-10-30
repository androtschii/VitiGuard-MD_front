export type AssistantTopic = 'spray' | 'wine' | 'buy'

// «Где купить вино» — про магазин, а не про выбор вина: покупка проверяется первой
const ORDER: AssistantTopic[] = ['buy', 'spray', 'wine']

// Помощник работает по правилам, без внешней модели: ищет в вопросе основы слов
export function matchTopic(
  question: string,
  keywords: Record<AssistantTopic, string>,
): AssistantTopic | null {
  const text = question.toLowerCase()
  return (
    ORDER.find((topic) =>
      keywords[topic].split(',').some((word) => text.includes(word.trim())),
    ) ?? null
  )
}
