import { describe, expect, it } from 'vitest'
import { matchTopic } from './assistant'

const keywords = { spray: 'брызг, клещ', wine: 'вин', buy: 'купи, магазин' }

describe('matchTopic', () => {
  it('покупка важнее выбора вина', () => {
    expect(matchTopic('Где КУПИТЬ вино?', keywords)).toBe('buy')
  })

  it('находит тему по основе слова', () => {
    expect(matchTopic('чем брызгать', keywords)).toBe('spray')
    expect(matchTopic('какое вино выбрать', keywords)).toBe('wine')
  })

  it('не угадывает незнакомый вопрос', () => {
    expect(matchTopic('как дела', keywords)).toBeNull()
  })
})
