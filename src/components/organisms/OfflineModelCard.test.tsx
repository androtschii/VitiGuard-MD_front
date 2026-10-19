import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteModel, loadModel, saveModel } from '@/lib/modelStore'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { OfflineModelCard } from './OfflineModelCard'

const meta = {
  name: 'efficientnet_b0',
  classes: ['healthy'],
  image_size: 224,
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
  version: '3f1c9a0b7d2e4f60',
  size_bytes: 16_036_543,
}

beforeEach(async () => {
  await deleteModel()
  // Движок WebAssembly при скачивании запрашивается для кэша Service Worker
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('wasm')))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('OfflineModelCard', () => {
  it('скачивает модель и сохраняет её на устройстве', async () => {
    server.use(
      http.get('/api/v1/ai/models/classifier/file', () =>
        HttpResponse.arrayBuffer(new Uint8Array([1, 2, 3]).buffer),
      ),
    )
    renderWithQueryClient(<OfflineModelCard />)

    expect(
      await screen.findByText(/Скачайте модель \(около 15,3 МБ\)/),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Скачать модель' }),
    )

    expect(
      await screen.findByText(
        /Модель на устройстве \(версия 3f1c9a0b, 15,3 МБ\)/,
      ),
    ).toBeInTheDocument()
    expect((await loadModel())?.meta.version).toBe(meta.version)
    expect(fetch).toHaveBeenCalled()
  })

  it('предлагает обновить устаревшую копию и удаляет её', async () => {
    await saveModel({
      meta: { ...meta, version: '0000000000000000' },
      bytes: new ArrayBuffer(1),
    })
    renderWithQueryClient(<OfflineModelCard />)

    expect(await screen.findByText(/новая версия модели/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Обновить модель' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }))

    await waitFor(async () => expect(await loadModel()).toBeNull())
    expect(await screen.findByText(/Скачайте модель/)).toBeInTheDocument()
  })

  it('без сети скачать нельзя, а размер — примерный', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    renderWithQueryClient(<OfflineModelCard />)

    expect(
      await screen.findByText(/Скачайте модель \(около 16 МБ\)/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Скачать модель' }),
    ).toBeDisabled()
  })

  it('сообщает, если модель не сохранилась', async () => {
    server.use(
      http.get('/api/v1/ai/models/classifier/file', () =>
        HttpResponse.json({ detail: 'нет модели' }, { status: 503 }),
      ),
    )
    renderWithQueryClient(<OfflineModelCard />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Скачать модель' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить модель',
    )
  })
})
