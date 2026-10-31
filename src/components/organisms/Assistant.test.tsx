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
    expect(screen.getByText(/Спросите, чем обработать/)).toBeInTheDocument()

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
})
