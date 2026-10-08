export type PageItem = number | 'ellipsis'

// Номера страниц для панели: первая, последняя и окно вокруг текущей;
// пропуск в одну страницу показывается самой страницей, а не многоточием
export function getPageItems(
  page: number,
  pageCount: number,
  siblings = 1,
): PageItem[] {
  const visible = new Set<number>([1, pageCount])
  for (let n = page - siblings; n <= page + siblings; n++) {
    if (n >= 1 && n <= pageCount) visible.add(n)
  }

  const numbers = [...visible].sort((a, b) => a - b)
  const items: PageItem[] = []
  numbers.forEach((n, index) => {
    const previous = numbers[index - 1]
    if (previous !== undefined) {
      if (n - previous === 2) items.push(previous + 1)
      else if (n - previous > 2) items.push('ellipsis')
    }
    items.push(n)
  })
  return items
}
