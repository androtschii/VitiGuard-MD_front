import { describe, expect, it } from 'vitest'
import { matchDisease, matchTopic } from './assistant'

const keywords = {
  risk: 'риск, опасн',
  plan: 'план, когда обраб',
  history: 'истори, последн',
  disease: 'милдью, оидиум, мучнист, болезн',
  spray: 'брызг, обраб, клещ',
  wine: 'вин',
  buy: 'купи, магазин, где',
}

const words = {
  downy_mildew: 'милдью, ложная мучнист',
  powdery_mildew: 'оидиум, мучнист',
  black_rot: 'чёрная гниль',
  esca: 'эска',
  leaf_blight: 'пятнист',
}

describe('matchTopic', () => {
  it('покупка важнее выбора вина', () => {
    expect(matchTopic('Где КУПИТЬ вино?', keywords)).toBe('buy')
  })

  it('находит тему по основе слова', () => {
    expect(matchTopic('чем брызгать', keywords)).toBe('spray')
    expect(matchTopic('какое вино выбрать', keywords)).toBe('wine')
    expect(matchTopic('мои последние проверки', keywords)).toBe('history')
  })

  it('вопрос о своём хозяйстве важнее общих подсказок', () => {
    // «Где» — и про магазин, но «опасно» — это риск участков
    expect(matchTopic('Где сегодня опасно?', keywords)).toBe('risk')
    // «Обработ» — и общий совет, но «когда обрабатывать» — план участков
    expect(matchTopic('Когда обрабатывать от милдью?', keywords)).toBe('plan')
  })

  it('название болезни — справка, а с обработкой — совет по обработкам', () => {
    expect(matchTopic('что такое милдью', keywords)).toBe('disease')
    expect(matchTopic('чем брызгать от милдью', keywords)).toBe('spray')
    // «Болезни винограда» содержат основу «вин», но это не про вино
    expect(matchTopic('болезни винограда', keywords)).toBe('disease')
  })

  it('не угадывает незнакомый вопрос', () => {
    expect(matchTopic('как дела', keywords)).toBeNull()
  })
})

describe('matchDisease', () => {
  it('узнаёт болезнь по названию', () => {
    expect(matchDisease('Что такое оидиум?', words)).toBe('powdery_mildew')
    expect(matchDisease('пятнистость листьев', words)).toBe('leaf_blight')
  })

  it('«ложная мучнистая роса» — это милдью, а не оидиум', () => {
    expect(matchDisease('ложная мучнистая роса', words)).toBe('downy_mildew')
  })

  it('без названия болезни ничего не выбирает', () => {
    expect(matchDisease('болезни винограда', words)).toBeNull()
  })
})
