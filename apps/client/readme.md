# Архитектура клиентского приложения (trick-surf-front)

## Введение

Проект **trick-surf-front** переписан на современную архитектуру, полностью соответствующую принципам **Feature-Sliced Design (FSD)**, **Vertical Slice Architecture (VSA)** и элементам **Domain-Driven Design (DDD)** проекта `insight-book`.

Стек технологий:
- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **Pinia** + **@pinia/colada** (серверный и клиентский стейт)
- **Three.js** (3D просмотрщик CS2 серф-карт и моделей с орбитальными контролами, HDR-окружением и тенями)
- **Vue Router** (HTML5 history, View Transitions, метаданные страниц)
- **ofetch** (HTTP-клиент с интерцепторами авторизации и централизованной обработкой ошибок)
- **unplugin-auto-import** & **unplugin-icons** (автоимпорты и SVG-иконки Iconify)
- **SCSS Design System** (многоуровневая система тем: `blue`, `dark`, `light`, переменные и миксины)
- **Zod & ACL** (валидация моделей и сетевых данных)
- **Vite & PWA** (оптимальная разбивка чанков, сжатие gzip/brotli, оффлайн Service Worker)

---

## Структура слоев (`src/`)

```
src/
├── 00.plugins/          # DI-контейнер репозиториев, vue-i18n, плагины
├── 01.shared/           # Общий не-компонентный код
│   ├── composables/     # useChangeTheme, useToast, useHaptic, useMap, useAppScrollLock
│   ├── constants/       # Маршруты, темы, перечисления
│   ├── directives/      # v-ripple, v-long-press
│   ├── events/          # AppEventBus шина событий
│   ├── lib/             # helpers, env, router, acl, view-transitions
│   ├── locales/         # ru.json, en.json
│   ├── repositories/    # Repository Pattern (map, trick, trigger, auth)
│   ├── services/        # api.service (ofetch), offline.service (localforage), pwa.service
│   ├── store/           # Pinia stores (map, tricks, toast, auth, settings, network, pwa)
│   └── types/           # Модели, DTO, Zod-схемы
├── 02.kit/              # UI Kit (Design System)
│   ├── atoms/           # kit-btn, kit-input, kit-checkbox, kit-image, kit-skeleton, kit-page-loader, kit-logo
│   ├── molecules/       # kit-select, kit-tabs, kit-toast, kit-toggle, kit-tooltip, kit-dropdown, kit-drawer, kit-image-preview
│   └── organisms/       # kit-dialog, kit-toast-manager, kit-reload-prompt, kit-network-timeout-dialog, kit-offline-badge
├── 03.domain/           # Доменные сущности (MapEntity, TrickEntity, TriggerEntity, UserEntity)
├── 04.features/         # Функциональные вертикальные срезы (auth, tricks-sort, tricks-filter)
├── 05.modules/          # Крупные композиционные блоки и виджеты
│   ├── scene/           # 3D Three.js WebGL просмотрщик
│   ├── tricks/          # Список триков, заголовки с сортировкой, аккордеон рутов
│   ├── triggers/        # Галерея триггеров с модальным просмотром
│   ├── records/         # Рекорды и лидерборды
│   ├── faq/             # FAQ, команды и разработчики
│   ├── header/          # Шапка с переключателем тем и брендингом
│   ├── navigation/      # Выдвижное меню выбора карт (Drawer)
│   └── footer/          # Wave SVG подвал с социальными ссылками
├── 06.layouts/          # Шаблоны страниц (default, tricks, empty)
├── 07.views/            # Точки входа Vue Router (index, faq, tricks, triggers, records, not-found)
├── assets/              # SCSS темы, миксины, переменные, глобальные стили
├── app.vue              # Корневой компонент
└── main.ts              # Точка входа приложения
```

---

## Команды

- `bun run dev` — Запуск dev-сервера Vite
- `bun run build` — Сборка продакшн-бандла
- `bun run lint` — Проверка кода через ESLint
- `bun run lint:fix` — Автоисправление форматирования
- `bun run typecheck` — Строгая проверка типов через `vue-tsc`
- `bun run test` — Запуск unit-тестов Vitest
