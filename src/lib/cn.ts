import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// twMerge убирает конфликтующие классы, поэтому className снаружи
// перекрывает стили компонента по умолчанию, а не спорит с ними
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
