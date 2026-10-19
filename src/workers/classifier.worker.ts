/// <reference lib="webworker" />
// Классификатор листа в браузере (pr-074): ONNX Runtime Web в отдельном
// потоке, чтобы десятки миллисекунд вычислений не замирал интерфейс.
// Модель берётся из IndexedDB, куда её скачал пользователь (pr-072)
import * as ort from 'onnxruntime-web/wasm'
import wasmMjs from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url'
import wasmBinary from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import { rankClasses, softmax, toTensorData } from '@/lib/leafTensor'
import { loadModel } from '@/lib/modelStore'
import type { WorkerRequest, WorkerResponse } from '@/lib/offlineClassifier'

// Файлы WebAssembly — со своего сервера, а не с CDN: иначе без сети не
// загрузится и сам движок. Один поток: несколько требуют изоляции страницы
// (COOP/COEP), а снимок один — выигрыш невелик
ort.env.wasm.wasmPaths = { mjs: wasmMjs, wasm: wasmBinary }
ort.env.wasm.numThreads = 1

let cached: { version: string; session: ort.InferenceSession } | null = null

async function classify({ image }: WorkerRequest) {
  const stored = await loadModel()
  if (!stored) throw new Error('model-missing')
  const { meta } = stored
  if (cached?.version !== meta.version) {
    cached = {
      version: meta.version,
      session: await ort.InferenceSession.create(new Uint8Array(stored.bytes)),
    }
  }
  const { session } = cached
  const size = meta.image_size
  // Как на сервере: фото целиком сжимается в квадрат size×size
  const bitmap = await createImageBitmap(image, {
    resizeWidth: size,
    resizeHeight: size,
    resizeQuality: 'medium',
  })
  const canvas = new OffscreenCanvas(size, size)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas')
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  const pixels = context.getImageData(0, 0, size, size).data
  const input = new ort.Tensor(
    'float32',
    toTensorData(pixels, size, meta.mean, meta.std),
    [1, 3, size, size],
  )
  const [inputName = 'input'] = session.inputNames
  const [outputName = 'logits'] = session.outputNames
  const outputs = await session.run({ [inputName]: input })
  const logits = outputs[outputName]?.data as Float32Array
  return {
    model: meta.name,
    ranked: rankClasses(meta.classes, softmax(logits)),
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id } = event.data
  classify(event.data).then(
    (result) =>
      self.postMessage({ id, ok: true, ...result } satisfies WorkerResponse),
    (error: unknown) =>
      self.postMessage({
        id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      } satisfies WorkerResponse),
  )
}
