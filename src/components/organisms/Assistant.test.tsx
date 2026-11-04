import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { useMapStore } from '@/store/map'
import { Assistant } from './Assistant'

const point = (
  name: string,
  kind: string,
  lon: number,
  lat: number,
  website?: string,
) => ({
  type: 'Feature',
  properties: { name, kind, website },
  geometry: { type: 'Point', coordinates: [lon, lat] },
})

const plot = (id: string, name: string) => ({
  id,
  name,
  geometry: { type: 'MultiPolygon', coordinates: [] },
  area_ha: 2,
  variety: null,
  planting_year: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
})

function farm(vineyards: ReturnType<typeof plot>[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: vineyards,
        total: vineyards.length,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
}

async function open() {
  renderWithQueryClient(
    <MemoryRouter>
      <Assistant />
    </MemoryRouter>,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Открыть помощника' }),
  )
}

async function askByInput(text: string) {
  await userEvent.type(screen.getByLabelText('Ваш вопрос'), text)
  await userEvent.click(screen.getByRole('button', { name: 'Спросить' }))
}

describe('Assistant', () => {
  beforeEach(() => {
    server.use(
      http.get('/wineries.geojson', () =>
        HttpResponse.json({
          type: 'FeatureCollection',
          features: [
            point('Криково', 'winery', 28.86, 47.14, 'https://cricova.md'),
            point('Магазин рядом', 'shop', 28.0, 45.0),
            point('Пуркарь', 'winery', 29.87, 46.53),
          ],
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useMapStore.setState({ showWineries: false })
  })

  it('открывается, приветствует и закрывается по Esc и крестику', async () => {
    await open()
    expect(screen.getByText(/Спросите, где сегодня риск/)).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('log')).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: 'Открыть помощника' }),
    )
    expect(screen.queryByRole('log')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByRole('log')).toBeNull()
  })

  it('на вопрос про вредителей отвечает обработками', async () => {
    await open()
    await askByInput('Чем брызгать от клеща?')

    expect(screen.getByText(/Паутинный клещ/)).toBeInTheDocument()
    expect(screen.getByText(/Госреестр/)).toBeInTheDocument()
  })

  it('подсказывает вино к блюду кнопкой', async () => {
    await open()
    await userEvent.click(
      screen.getByRole('button', { name: 'Какое вино выбрать' }),
    )

    expect(screen.getByText(/Красное мясо/)).toBeInTheDocument()
  })

  it('не притворяется, что понял непонятный вопрос, и пустой не шлёт', async () => {
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Спросить' }))
    expect(screen.queryByText(/Пока я умею/)).toBeNull()

    await askByInput('Как дела?')
    expect(screen.getByText(/Пока я умею/)).toBeInTheDocument()
  })

  it('показывает винодельни, а по точке — всё ближайшее', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) =>
          ok({
            coords: { latitude: 45.01, longitude: 28.01 },
          } as GeolocationPosition),
      },
    })
    await open()
    await askByInput('Где купить вино?')

    expect(
      await screen.findByRole('link', { name: 'Криково' }),
    ).toHaveAttribute('href', 'https://cricova.md')
    expect(screen.queryByText('Магазин рядом')).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: 'Найти рядом со мной' }),
    )

    const shop = await screen.findByText('Магазин рядом')
    expect(shop.parentElement).toHaveTextContent(/1\sкм/)
  })

  it('сообщает, что точку определить не удалось', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (_: unknown, fail: () => void) => fail(),
      },
    })
    await open()
    await askByInput('Где купить вино?')
    await userEvent.click(
      screen.getByRole('button', { name: 'Найти рядом со мной' }),
    )

    expect(await screen.findByText(/Не удалось определить/)).toBeInTheDocument()
  })

  it('без геолокации в браузере тоже сообщает о неудаче', async () => {
    vi.stubGlobal('navigator', { ...navigator, geolocation: undefined })
    await open()
    await askByInput('Где купить вино?')
    await userEvent.click(
      screen.getByRole('button', { name: 'Найти рядом со мной' }),
    )

    expect(await screen.findByText(/Не удалось определить/)).toBeInTheDocument()
  })

  it('ведёт на карту с включённым слоем виноделен', async () => {
    await open()
    await askByInput('Где купить вино?')
    await userEvent.click(
      screen.getByRole('link', { name: 'Показать на карте' }),
    )

    expect(useMapStore.getState().showWineries).toBe(true)
    expect(screen.queryByRole('log')).toBeNull()
  })

  it('сообщает, если список не загрузился', async () => {
    server.use(
      http.get(
        '/wineries.geojson',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    await open()
    await askByInput('Где купить вино?')

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Не удалось загрузить/,
      ),
    )
  })

  it('показывает риск на сегодня по каждому участку', async () => {
    farm([plot('v1', 'Криково'), plot('v2', 'Пуркарь')])
    server.use(
      http.get('/api/v1/risks/today', () =>
        HttpResponse.json([
          {
            vineyard_id: 'v1',
            day: '2026-06-10',
            downy: 'high',
            powdery: 'low',
          },
        ]),
      ),
    )
    await open()
    await askByInput('Где сегодня опасно?')

    expect(await screen.findByText('Криково')).toBeInTheDocument()
    expect(screen.getByText(/Милдью:/)).toHaveTextContent('Милдью: высокий')
    expect(screen.getByText('оценки на сегодня нет')).toBeInTheDocument()
    expect(screen.getByText(/вне сезона/)).toBeInTheDocument()
  })

  it('без участков просит их нарисовать', async () => {
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Риск сегодня' }))

    expect(await screen.findByText(/Участков пока нет/)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'План обработок' }),
    )
    await waitFor(() =>
      expect(screen.getAllByText(/Участков пока нет/)).toHaveLength(2),
    )
  })

  it('сообщает, если риск не загрузился', async () => {
    farm([plot('v1', 'Криково')])
    server.use(
      http.get('/api/v1/risks/today', () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    )
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Риск сегодня' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить риск',
    )
  })

  it('план обработок: защита, шаги и причина', async () => {
    farm([plot('v1', 'Криково'), plot('v2', 'Пуркарь')])
    server.use(
      http.get('/api/v1/vineyards/v1/treatments/plan', () =>
        HttpResponse.json({
          today: '2026-06-10',
          protected_until: { downy_mildew: null, powdery_mildew: '2026-06-14' },
          recommendations: [
            {
              action: 'protect',
              disease: 'downy_mildew',
              fungicide: 'contact',
              due_by: '2026-06-11',
              risk_day: '2026-06-12',
              reason: 'downy_infection_forecast',
            },
          ],
        }),
      ),
    )
    await open()
    await askByInput('Когда обрабатывать от милдью?')

    expect(
      await screen.findByText(/защищён от оидиума до 14 июн/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Защитная обработка \(Контактный\)/),
    ).toHaveTextContent('Заражение милдью по прогнозу погоды')
    expect(
      await screen.findByText('обработки на неделю не нужны'),
    ).toBeInTheDocument()
  })

  it('показывает последние проверки и заключение агронома', async () => {
    server.use(
      http.get('/api/v1/diagnoses', () =>
        HttpResponse.json({
          items: [
            {
              id: 'd1',
              created_at: '2026-06-10T06:30:00Z',
              updated_at: '2026-06-10T06:30:00Z',
              vineyard_id: 'v1',
              vineyard_name: 'Криково',
              model: 'efficientnet_b0',
              model_version: '1',
              disease: 'downy_mildew',
              confidence: 0.91,
              top: [],
              severity: null,
              overlays: [],
              location: null,
              review: {
                disease: 'powdery_mildew',
                comment: null,
                reviewed_at: '2026-06-11T00:00:00Z',
                reviewer: null,
              },
            },
          ],
          total: 1,
          page: 1,
          size: 12,
          pages: 1,
        }),
      ),
    )
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Мои проверки' }))

    expect(await screen.findByText(/агроном: Оидиум/)).toBeInTheDocument()
    expect(screen.getByText(/Криково/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вся история' })).toHaveAttribute(
      'href',
      '/history',
    )
  })

  it('без проверок подсказывает, где их сделать', async () => {
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Мои проверки' }))

    expect(
      await screen.findByText(/Сохранённых проверок пока нет/),
    ).toBeInTheDocument()
  })

  it('рассказывает о болезни по названию', async () => {
    await open()
    await askByInput('Что такое оидиум?')

    expect(screen.getByText('Оидиум')).toBeInTheDocument()
    expect(screen.getByText(/мучнистый налёт/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Проверить лист по фото' }),
    ).toHaveAttribute('href', '/diagnosis')
  })

  it('на «болезни» без названия предлагает список', async () => {
    await open()
    await askByInput('болезни винограда')

    expect(screen.getByText(/Справка о болезнях/)).toBeInTheDocument()
  })

  it('план: больше пяти участков, сбой одного плана и осмотр без препарата', async () => {
    farm(
      ['Криково', 'Пуркарь', 'Мимя', 'Гымбоала', 'Миллештий', 'Лозова'].map(
        (name, index) => plot(`v${index}`, name),
      ),
    )
    server.use(
      http.get('/api/v1/vineyards/v0/treatments/plan', () =>
        HttpResponse.json({
          today: '2026-06-10',
          protected_until: {
            downy_mildew: '2026-06-12',
            powdery_mildew: null,
          },
          recommendations: [
            {
              action: 'inspect',
              disease: 'downy_mildew',
              fungicide: null,
              due_by: '2026-06-20',
              risk_day: '2026-06-20',
              reason: 'downy_symptoms',
            },
          ],
        }),
      ),
      http.get('/api/v1/vineyards/v1/treatments/plan', () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    )
    await open()
    await userEvent.click(
      screen.getByRole('button', { name: 'План обработок' }),
    )

    expect(
      await screen.findByText(/защищён от милдью до 12 июн/),
    ).toBeInTheDocument()
    expect(await screen.findByText(/Осмотр участка —/)).toHaveTextContent(
      'Ожидаются пятна милдью',
    )
    expect(
      await screen.findByText(/Не удалось загрузить план/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Ещё участков: 1/)).toBeInTheDocument()
    expect(screen.queryByText('Лозова')).toBeNull()
  })

  it('сообщает, если участки или проверки не загрузились', async () => {
    server.use(
      http.get('/api/v1/vineyards', () =>
        HttpResponse.json(null, { status: 500 }),
      ),
      http.get('/api/v1/diagnoses', () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    )
    await open()
    await userEvent.click(
      screen.getByRole('button', { name: 'План обработок' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить план',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Мои проверки' }))
    expect(
      await screen.findByText(/Не удалось загрузить проверки/),
    ).toBeInTheDocument()
  })
})
