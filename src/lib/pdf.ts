// Одностраничный PDF с картинкой JPEG — без библиотеки: картинка вставляется
// как есть (фильтр DCTDecode), а структура файла — пять объектов и таблица
// смещений. Текст в PDF не пишется: стандартные шрифты PDF не знают кириллицы,
// поэтому подписи рисуются на самой картинке

export type PdfPage = { width: number; height: number; margin: number }

// A4 в пунктах (1/72 дюйма) и поля страницы: карта — альбомом, карточка — книгой
export const LANDSCAPE: PdfPage = { width: 842, height: 595, margin: 28 }
export const PORTRAIT: PdfPage = { width: 595, height: 842, margin: 28 }

const encoder = new TextEncoder()

export function fitImage(width: number, height: number, page = LANDSCAPE) {
  const maxWidth = page.width - page.margin * 2
  const maxHeight = page.height - page.margin * 2
  const scale = Math.min(maxWidth / width, maxHeight / height)
  const w = width * scale
  const h = height * scale
  return { x: (page.width - w) / 2, y: (page.height - h) / 2, w, h }
}

export function imagePdf(
  jpeg: Uint8Array,
  width: number,
  height: number,
  page = LANDSCAPE,
) {
  const { x, y, w, h } = fitImage(width, height, page)
  const draw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`
  const objects: (string | Uint8Array)[][] = [
    ['<< /Type /Catalog /Pages 2 0 R >>'],
    ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>'],
    [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}]` +
        ' /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
    ],
    [
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height}` +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode' +
        ` /Length ${jpeg.length} >>\nstream\n`,
      jpeg,
      '\nendstream',
    ],
    [`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`],
  ]

  const chunks: Uint8Array[] = []
  let length = 0
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    length += bytes.length
  }

  push('%PDF-1.4\n')
  const offsets = objects.map((parts, index) => {
    const offset = length
    push(`${index + 1} 0 obj\n`)
    parts.forEach(push)
    push('\nendobj\n')
    return offset
  })
  const xref = length
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  for (const offset of offsets) {
    push(`${String(offset).padStart(10, '0')} 00000 n \n`)
  }
  push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
  )

  const file = new Uint8Array(length)
  let position = 0
  for (const chunk of chunks) {
    file.set(chunk, position)
    position += chunk.length
  }
  return file
}
