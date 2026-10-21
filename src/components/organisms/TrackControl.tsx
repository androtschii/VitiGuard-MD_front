import type { GeoJSONSource, LayerSpecification } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteTrack, useSaveTrack, useTracks } from '@/api/tracks'
import { Button } from '@/components/atoms/Button'
import { useMap } from '@/lib/mapContext'
import { saveBlob } from '@/lib/mapImage'
import {
  acceptPoint,
  trackBounds,
  trackFeatures,
  trackStats,
  trackToGpx,
  type Track,
  type TrackPoint,
} from '@/lib/track'
import { saveTrack } from '@/lib/trackStore'

const SOURCE = 'track'
// Голубой — трек не путается ни с участками, ни с линейкой
const COLOR = '#0284c7'

const layers: LayerSpecification[] = [
  {
    id: 'track-line',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: { 'line-color': COLOR, 'line-width': 3 },
  },
  {
    id: 'track-position',
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 6,
      'circle-color': COLOR,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
    },
  },
]

// Запись трека обхода виноградника (pr-084): телефон отмечает путь по GPS,
// трек сохраняется на устройстве и выгружается в GPX
export function TrackControl() {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const tracks = useTracks()
  const save = useSaveTrack()
  const remove = useDeleteTrack()
  const [points, setPoints] = useState<TrackPoint[] | null>(null)
  const [shown, setShown] = useState<Track | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [startedAt, setStartedAt] = useState('')
  // Для сохранения при уходе со страницы: эффект очистки видит только ссылки
  const latest = useRef<Omit<Track, 'id'> | null>(null)
  const isRecording = points !== null

  useEffect(() => {
    latest.current = points && { startedAt, points }
  }, [points, startedAt])

  useEffect(() => {
    if (!isRecording) return
    // Экран телефона не гаснет, пока идёт запись: иначе браузер перестаёт
    // получать координаты
    const wakeLock = navigator.wakeLock?.request('screen').catch(() => null)
    const { geolocation } = navigator
    const watch = geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const next = {
          lng: coords.longitude,
          lat: coords.latitude,
          accuracy: coords.accuracy,
          time: timestamp,
        }
        setPoints((current) =>
          current && acceptPoint(current, next) ? [...current, next] : current,
        )
      },
      (failure) =>
        setError(
          failure.code === failure.PERMISSION_DENIED
            ? t('track.denied')
            : t('track.unavailable'),
        ),
      { enableHighAccuracy: true, maximumAge: 0 },
    )
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      geolocation.clearWatch(watch)
      window.clearInterval(timer)
      void wakeLock?.then((sentinel) => sentinel?.release())
    }
  }, [isRecording, t])

  // Ушли со страницы посреди обхода — записанное не пропадает
  useEffect(
    () => () => {
      const unsaved = latest.current
      if (unsaved && unsaved.points.length >= 2) void saveTrack(unsaved)
    },
    [],
  )

  const visible = points ?? shown?.points ?? null
  const hasLayer = visible !== null
  useEffect(() => {
    if (!map || !hasLayer) return
    map.addSource(SOURCE, { type: 'geojson', data: trackFeatures([]) })
    for (const layer of layers) map.addLayer(layer)
    return () => {
      try {
        for (const layer of [...layers].reverse()) map.removeLayer(layer.id)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map, hasLayer])

  useEffect(() => {
    if (!map || !visible) return
    void map.getSource<GeoJSONSource>(SOURCE)?.setData(trackFeatures(visible))
  }, [map, visible])

  if (!map) return null

  const number = (value: number, digits: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, {
      maximumFractionDigits: digits,
    }).format(value)
  const describe = (meters: number, durationMs: number) => {
    const distance =
      meters < 1000
        ? t('measure.meters', { value: number(meters, 0) })
        : t('measure.kilometers', { value: number(meters / 1000, 2) })
    const minutes = Math.floor(durationMs / 60_000)
    return t('track.summary', {
      distance,
      duration: t('track.minutes', { count: minutes }),
    })
  }

  const start = () => {
    setError(null)
    if (!('geolocation' in navigator)) {
      setError(t('track.unavailable'))
      return
    }
    setStartedAt(new Date().toISOString())
    setShown(null)
    setNow(Date.now())
    setPoints([])
  }

  const stop = () => {
    if (points && points.length >= 2) save.mutate({ startedAt, points })
    setPoints(null)
  }

  const show = (track: Track) => {
    setShown(track)
    map.fitBounds(trackBounds(track.points), { padding: 40, maxZoom: 18 })
  }

  const date = (iso: string) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      {isRecording ? (
        <>
          <p aria-live="polite" className="text-ink">
            {describe(trackStats(points).meters, now - Date.parse(startedAt))}
          </p>
          <p className="text-ink-soft">
            {points.length === 0 ? t('track.waiting') : t('track.recording')}
          </p>
          <Button size="sm" onClick={stop}>
            {t('track.stop')}
          </Button>
        </>
      ) : (
        <Button size="sm" variant="secondary" onClick={start}>
          {t('track.start')}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      {!isRecording && (tracks.data?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-2" aria-label={t('track.saved')}>
          {tracks.data?.map((track) => {
            const stats = trackStats(track.points)
            return (
              <li key={track.id} className="flex flex-col gap-1">
                <span className="text-ink">{date(track.startedAt)}</span>
                <span className="text-ink-soft">
                  {describe(stats.meters, stats.durationMs)}
                </span>
                <span className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-pressed={shown?.id === track.id}
                    onClick={() =>
                      shown?.id === track.id ? setShown(null) : show(track)
                    }
                  >
                    {shown?.id === track.id ? t('track.hide') : t('track.show')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      saveBlob(
                        new Blob([trackToGpx(track, date(track.startedAt))], {
                          type: 'application/gpx+xml',
                        }),
                        `vitiguard-track-${track.startedAt.slice(0, 10)}.gpx`,
                      )
                    }
                  >
                    {t('track.gpx')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (shown?.id === track.id) setShown(null)
                      remove.mutate(track.id)
                    }}
                  >
                    {t('track.delete')}
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
