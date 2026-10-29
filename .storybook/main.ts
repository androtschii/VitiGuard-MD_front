import type { StorybookConfig } from '@storybook/react-vite'
import type { PluginOption } from 'vite'

// Плагины Vite бывают вложенными массивами (так их отдаёт vite-plugin-pwa)
function flatten(plugins: PluginOption[]): PluginOption[] {
  return plugins.flatMap((plugin) =>
    Array.isArray(plugin) ? flatten(plugin) : [plugin],
  )
}

const isPwa = (plugin: PluginOption) =>
  Boolean(
    plugin &&
    typeof plugin === 'object' &&
    'name' in plugin &&
    plugin.name.startsWith('vite-plugin-pwa'),
  )

// Документация компонентов (pr-099): истории лежат рядом с компонентами
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // Service Worker приложения витрине компонентов не нужен
  viteFinal: (vite) => ({
    ...vite,
    plugins: flatten(vite.plugins ?? []).filter((plugin) => !isPwa(plugin)),
  }),
}

export default config
