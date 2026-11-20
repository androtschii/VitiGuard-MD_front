import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { renderWithRouter } from '@/test/render'
import { ModelsPage } from './ModelsPage'

describe('ModelsPage', () => {
  it('рендерит все карточки моделей, метрики и ограничения', () => {
    renderWithRouter(<ModelsPage />)

    expect(
      screen.getByRole('heading', { name: 'О моделях машинного обучения' }),
    ).toBeInTheDocument()

    // Блок ограничений
    expect(
      screen.getByRole('heading', { name: /Ограничения моделей/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/преимущественно на лабораторных фото/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Детектор шпалеры может пропускать грозди/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Все выводы и рекомендации моделей являются интеллектуальной подсказкой/,
      ),
    ).toBeInTheDocument()

    // 1. Классификатор листьев
    expect(
      screen.getByRole('heading', { name: 'Классификатор болезней листа' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0,995')).toBeInTheDocument()
    expect(screen.getByText('99,67 %')).toBeInTheDocument()
    expect(screen.getByText('≈ 40 %')).toBeInTheDocument()
    expect(screen.getByText('≈ 50 мс')).toBeInTheDocument()
    // 6 классов
    for (const name of [
      'Здоровый лист',
      'Чёрная гниль',
      'Эска',
      'Пятнистость листьев',
      'Милдью',
      'Оидиум',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }

    // 2. Фильтр листа
    expect(
      screen.getByRole('heading', { name: 'Проверка «это лист винограда»' }),
    ).toBeInTheDocument()
    expect(screen.getByText('99,7 %')).toBeInTheDocument()
    expect(screen.getByText('95–99 %')).toBeInTheDocument()

    // 3. Детектор ряда
    expect(
      screen.getByRole('heading', { name: 'Детектор ряда (стволы и грозди)' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0,786')).toBeInTheDocument()
    expect(screen.getByText('0,413')).toBeInTheDocument()
    expect(screen.getByText('0,303')).toBeInTheDocument()
    expect(screen.getByText('0,524')).toBeInTheDocument()

    // 4. Прогноз милдью
    expect(
      screen.getByRole('heading', {
        name: 'Прогноз заражения милдью на завтра',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('0,65')).toBeInTheDocument()
    expect(screen.getByText('0,42')).toBeInTheDocument()
    expect(screen.getByText('1 день')).toBeInTheDocument()
  })

  it('корректно отображает страницу на румынском и английском языках', async () => {
    await i18n.changeLanguage('ro')
    const { unmount } = renderWithRouter(<ModelsPage />)

    expect(
      screen.getByRole('heading', {
        name: 'Despre modelele de învățare automată',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Clasificator boli foliare' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 zi')).toBeInTheDocument()
    expect(screen.getByText('≈ 50 ms')).toBeInTheDocument()

    unmount()
    await i18n.changeLanguage('en')
    renderWithRouter(<ModelsPage />)

    expect(
      screen.getByRole('heading', { name: 'About machine learning models' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Leaf disease classifier' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 day')).toBeInTheDocument()
    expect(screen.getByText('≈ 50 ms')).toBeInTheDocument()
  })

  it('в английской версии числа с точкой', async () => {
    await act(() => i18n.changeLanguage('en'))
    renderWithRouter(<ModelsPage />)

    expect(screen.getByText('0.995')).toBeInTheDocument()
    expect(screen.getByText('99.67 %')).toBeInTheDocument()
    expect(screen.queryByText('0,995')).not.toBeInTheDocument()

    await act(() => i18n.changeLanguage('ru'))
  })
})
