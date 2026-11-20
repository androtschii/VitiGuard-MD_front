import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type {
  PhenologyEstimate,
  TerroirBioclimaticProfile,
} from '@/api/bioclimatic'
import i18n from '@/i18n'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { PhenologyPanel } from './PhenologyPanel'

const defaultEstimate: PhenologyEstimate = {
  current_bbch: 75,
  current_stage_name: 'Смыкание ягод (размер «горошина»)',
  accumulated_gdd: 820.5,
  next_bbch: 81,
  next_stage_name: 'Начало созревания (веaison)',
  gdd_to_next: 160.0,
  progress_percentage: 45.2,
  is_season_complete: false,
  variety_name: 'feteasca_regala',
}

const defaultIndices: TerroirBioclimaticProfile = {
  winkler: {
    gdd_sum: 1720.5,
    region_class: 'Region III',
    region_title: 'Тёплый климат (Warm)',
    suitable_varieties: ['Cabernet Sauvignon', 'Merlot'],
  },
  huglin: {
    hi_value: 2140.0,
    thermal_class: 'HI-4 (Тёплый)',
    thermal_description: 'Отлично вызревают позднеспелые красные сорта.',
  },
  cool_night: {
    ci_temperature: 13.2,
    night_class: 'CI+1 (Прохладные ночи)',
    aroma_color_potential: 'Прекрасный баланс созревания сахаров.',
  },
  selyaninov: {
    htc_value: 0.85,
    moisture_class: 'Слабозасушливая зона (умеренный дефицит)',
    irrigation_need: 'Оптимальный лёгкий водный стресс.',
  },
}

describe('PhenologyPanel', () => {
  it('отображает загрузку пока данные не пришли', () => {
    server.use(
      http.get(
        '/api/v1/vineyards/:id/bioclimatic/phenology-estimate',
        () => new Promise(() => {}),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(
      screen.getByRole('region', { name: 'Фенология BBCH и агроклимат' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })

  it('отображает текущую фазу BBCH, полосу прогресса и таблицу индексов', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json(defaultEstimate),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(defaultIndices),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    // Текущая фаза
    expect(
      await screen.findByText(/BBCH 75 · Смыкание ягод/),
    ).toBeInTheDocument()
    // Прогресс
    expect(screen.getByText('45,2 %')).toBeInTheDocument()
    expect(
      screen.getByText(/До следующей фазы: 160 °C·дней/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Сумма активных температур: 820,5 °C·дней/),
    ).toBeInTheDocument()

    // Индексы
    expect(screen.getByText('Индекс Винклера')).toBeInTheDocument()
    expect(screen.getByText(/1 720,5 °C·дней · Region III/)).toBeInTheDocument()
    expect(screen.getByText('Индекс Гуглина')).toBeInTheDocument()
    expect(screen.getByText(/2 140 · HI-4/)).toBeInTheDocument()
    expect(screen.getByText('ГТК Селянинова')).toBeInTheDocument()
    expect(screen.getByText(/0,85 · Слабозасушливая зона/)).toBeInTheDocument()
  })

  it('отображает статус завершённого сезона, когда is_season_complete = true', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json({
          ...defaultEstimate,
          current_bbch: 89,
          current_stage_name: 'Техническая зрелость (сбор урожая)',
          next_bbch: null,
          next_stage_name: null,
          gdd_to_next: 0,
          progress_percentage: 100,
          is_season_complete: true,
        }),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(defaultIndices),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByText('Сезон завершён')).toBeInTheDocument()
    expect(
      screen.getByText(/BBCH 89 · Техническая зрелость/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Сезон завершён' }),
    ).toHaveAttribute('aria-valuenow', '100')
  })

  it('показывает ошибку и позволяет повторить запрос кнопкой', async () => {
    let attempts = 0
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () => {
        attempts++
        if (attempts === 1) {
          return HttpResponse.json(
            { detail: 'Серверный сбой' },
            { status: 500 },
          )
        }
        return HttpResponse.json(defaultEstimate)
      }),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(defaultIndices),
      ),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Серверный сбой')
    const retryBtn = screen.getByRole('button', { name: 'Повторить' })
    await user.click(retryBtn)

    await waitFor(() => expect(screen.getByText(/BBCH 75/)).toBeInTheDocument())
  })

  it('показывает сообщение «Нет метеоданных», если метеоданные отсутствуют', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json({
          ...defaultEstimate,
          accumulated_gdd: 0,
          current_bbch: 0,
          current_stage_name: 'Покой (зимняя почка)',
        }),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json({
          ...defaultIndices,
          winkler: { ...defaultIndices.winkler, gdd_sum: 0 },
          huglin: { ...defaultIndices.huglin, hi_value: 0 },
          selyaninov: {
            ...defaultIndices.selyaninov,
            moisture_class: 'Недостаточно активных дней',
          },
        }),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByText('Нет метеоданных')).toBeInTheDocument()
  })

  it('показывает сообщение «Нет метеоданных» при ошибке с ключевым словом «метео»', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json(
          { detail: 'Нет метеоданных для участка' },
          { status: 400 },
        ),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByText('Нет метеоданных')).toBeInTheDocument()
  })

  it('показывает «Нет метеоданных» при ошибке индексов со словом «метео»', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(
          { detail: 'Метеоданные недоступны' },
          { status: 400 },
        ),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByText('Нет метеоданных')).toBeInTheDocument()
  })

  it('показывает ошибку загрузки, если ошибка в индексах', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json({ detail: 'Сбой индексов' }, { status: 500 }),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Сбой индексов')
  })

  it('корректно отображает прогресс, если next_bbch равен null', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json({
          ...defaultEstimate,
          next_bbch: null,
          next_stage_name: null,
        }),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(defaultIndices),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(await screen.findByText('45,2 %')).toBeInTheDocument()
  })

  it('использует строковый fallback при неизвестном коде BBCH и классе региона', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json({
          ...defaultEstimate,
          current_bbch: 999,
          current_stage_name: 'Нестандартная фаза',
          next_bbch: 1000,
          next_stage_name: 'Следующая нестандартная',
        }),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json({
          ...defaultIndices,
          winkler: {
            ...defaultIndices.winkler,
            region_title: 'Неизвестный класс региона',
          },
        }),
      ),
    )
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(
      await screen.findByText(/BBCH 999 · Нестандартная фаза/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Следующая нестандартная/)).toBeInTheDocument()
    expect(screen.getByText(/Неизвестный класс региона/)).toBeInTheDocument()
  })

  it('переводит названия фаз и классов на румынский и английский языки', async () => {
    await i18n.changeLanguage('ro')
    server.use(
      http.get('/api/v1/vineyards/:id/bioclimatic/phenology-estimate', () =>
        HttpResponse.json(defaultEstimate),
      ),
      http.get('/api/v1/vineyards/:id/bioclimatic/indices', () =>
        HttpResponse.json(defaultIndices),
      ),
    )
    const { unmount } = renderWithQueryClient(
      <PhenologyPanel vineyardId="vineyard-1" />,
    )

    expect(
      await screen.findByText(/BBCH 75 · Boabe de mărimea bobului de mazăre/),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/Până la următoarea fază/)[0],
    ).toBeInTheDocument()
    expect(screen.getByText(/Începutul coacerii/)).toBeInTheDocument()
    expect(screen.getByText('Indicele Winkler')).toBeInTheDocument()
    expect(screen.getByText(/Climat cald/)).toBeInTheDocument()

    unmount()
    await i18n.changeLanguage('en')
    renderWithQueryClient(<PhenologyPanel vineyardId="vineyard-1" />)

    expect(
      await screen.findByText(/BBCH 75 · Berries pea-sized/),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/To next stage/)[0]).toBeInTheDocument()
    expect(screen.getByText(/Beginning of ripening/)).toBeInTheDocument()
    expect(screen.getByText('Winkler Index')).toBeInTheDocument()
    expect(screen.getByText(/Warm climate/)).toBeInTheDocument()
  })
})
