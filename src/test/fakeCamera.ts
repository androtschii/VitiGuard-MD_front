import { vi } from 'vitest'

// Камера для тестов: дорожка с заданными возможностями и поток из неё
export function fakeTrack(capabilities: Record<string, unknown> = {}) {
  return {
    getCapabilities: vi.fn(() => capabilities),
    applyConstraints: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
  }
}

export function fakeStream(track = fakeTrack()) {
  return {
    track,
    getVideoTracks: () => [track],
    getTracks: () => [track],
  }
}

export function stubCamera(
  result: ReturnType<typeof fakeStream> | DOMException,
) {
  const getUserMedia = vi.fn<
    (constraints?: MediaStreamConstraints) => Promise<unknown>
  >(() =>
    result instanceof DOMException
      ? Promise.reject(result)
      : Promise.resolve(result),
  )
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  return getUserMedia
}

export function removeCamera() {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: undefined,
  })
}
