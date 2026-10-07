# VitiGuard MD — frontend

[![CI](https://github.com/androtschii/VitiGuard-MD_front/actions/workflows/ci.yml/badge.svg)](https://github.com/androtschii/VitiGuard-MD_front/actions/workflows/ci.yml)

Веб-приложение системы мониторинга здоровья виноградников Республики Молдова: карта участков, диагностика болезней по фото листьев, спутниковые индексы и прогноз риска заражения. Работает как PWA, в том числе без интернета.

Бэкенд: [VitiGuard-MD_back](https://github.com/androtschii/VitiGuard-MD_back)

## Стек

React 19, TypeScript, Vite, Tailwind CSS 4, Vitest + Testing Library.

## Запуск

Нужен Node.js 24 (версия указана в `.nvmrc`).

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:5173

## Проверки

```bash
npm run typecheck
npm run lint
npm run lint:css
npm run format:check
npm test
npm run build
```

Автоформатирование: `npm run format`.

## Документация

- [docs/roadmap.md](docs/roadmap.md) — план работ
- [docs/decisions.md](docs/decisions.md) — принятые технические решения
