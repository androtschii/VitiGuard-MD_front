import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as report from '@/lib/diagnosisReport'
import * as mapImage from '@/lib/mapImage'
import * as sharing from '@/lib/share'
import { record } from '@/test/historyData'
import { diagnosis } from '@/test/handlers'
import { diagnosisToRecord, useDiagnosisExport } from './useDiagnosisExport'

describe('useDiagnosisExport', () => {
  it('преобразует Diagnosis в DiagnosisRecord', () => {
    const rec = diagnosisToRecord({ ...diagnosis, id: 'saved-1' }, 'Тестовый')
    expect(rec.disease).toBe('powdery_mildew')
    expect(rec.confidence).toBe(diagnosis.confidence)
    expect(rec.vineyard_name).toBe('Тестовый')
    expect(rec.id).toBe('saved-1')
  })

  it('скачивает PDF отчёт', async () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    const build = vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    const save = vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
    const rec = record('r-1')
    const photo = new Blob(['photo'])

    const { result } = renderHook(() => useDiagnosisExport(rec))

    await act(async () => {
      await result.current.run('pdf', photo)
    })

    expect(build).toHaveBeenCalledWith(
      rec,
      photo,
      null,
      expect.any(Function),
      'ru',
    )
    expect(save).toHaveBeenCalledWith(
      pdf,
      'vitiguard-diagnosis-2026-06-10-r-1.pdf',
    )
    expect(result.current.busy).toBeNull()
    expect(result.current.failed).toBeNull()
  })

  it('делится проверкой через share', async () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    const send = vi.spyOn(sharing, 'share').mockResolvedValue('shared')
    const rec = record('r-2')
    const photo = new Blob(['photo'])

    const { result } = renderHook(() => useDiagnosisExport(rec))

    await act(async () => {
      await result.current.run('share', photo)
    })

    expect(send).toHaveBeenCalled()
    expect(result.current.isCopied).toBe(false)
  })

  it('отмечает isCopied, если скопировано', async () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    vi.spyOn(sharing, 'share').mockResolvedValue('copied')
    const rec = record('r-3')
    const photo = new Blob(['photo'])

    const { result } = renderHook(() => useDiagnosisExport(rec))

    await act(async () => {
      await result.current.run('share', photo)
    })

    expect(result.current.isCopied).toBe(true)
  })

  it('обрабатывает ошибку', async () => {
    vi.spyOn(report, 'diagnosisPdf').mockRejectedValue(new Error('fail'))
    const rec = record('r-4')
    const photo = new Blob(['photo'])

    const { result } = renderHook(() => useDiagnosisExport(rec))

    await act(async () => {
      await result.current.run('pdf', photo)
    })

    expect(result.current.failed).toBe('pdf')
  })
})
