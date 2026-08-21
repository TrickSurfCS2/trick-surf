# 🐳 Руководство по развертыванию TrickSurf через Docker

В этой директории содержатся конфигурации для сборки и развертывания полного стека проекта **TrickSurf**:
- **`trick-surf-db`** — База данных PostgreSQL 16 (с автоматической проверкой healthcheck).
- **`trick-surf-server`** — Бэкенд на Bun + Elysia + Prisma ORM + OpenTelemetry / SigNoz.
- **`trick-surf-client`** — Фронтенд на Vue 3 + Vite, раздаваемый через Nginx с динамической подстановкой рантайм-конфигурации (`app-config.js`).

---

## 📁 Структура файлов

```text
docker/
├── Dockerfile.client        # Многоэтапная сборка фронтенда + Nginx
├── Dockerfile.server        # Сборка бэкенда на oven/bun с OpenSSL для Prisma
├── docker-compose.local.yml # Локальный запуск (порты db:5432, server:8080, client:3334)
├── docker-compose.yml       # Продакшен запуск (Traefik, внешняя сеть trip-net)
├── .env.example             # Пример переменных окружения
├── .gitignore               # Игнорирование локальных .env и конфигов
├── configs/                 # Директория для монтирования конфигов
└── README.md                # Данное руководство
```

---

## 🚀 1. Быстрый локальный старт

### Шаг 1: Подготовка `.env`

Перейдите в директорию `docker/` (или оставайтесь в корне) и создайте файл `.env` из примера:

```bash
cp docker/.env.example docker/.env
```

При необходимости отредактируйте параметры (логин/пароль БД, порт, endpoint SigNoz и т.д.).

### Шаг 2: Сборка и запуск контейнеров

Запустите контейнеры в фоновом режиме:

```bash
docker compose -f docker/docker-compose.local.yml up --build -d
```

### Шаг 3: Проверка статуса контейнеров

```bash
docker compose -f docker/docker-compose.local.yml ps
```

Доступные адреса по умолчанию:
- **Client (Frontend)**: [http://localhost:3334](http://localhost:3334)
- **Server (Backend API)**: [http://localhost:8080](http://localhost:8080)
- **Swagger UI**: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- **Health check**: [http://localhost:8080/health](http://localhost:8080/health)
- **PostgreSQL**: `localhost:5432`

---

## 🌱 2. Миграции и запуск SEED внутри контейнера

После первого запуска база данных будет пустой. Для создания структуры таблиц и наполнения начальными данными выполните команды внутри запущенного контейнера `trick-surf-server`.

### Вариант А: Запуск через `docker compose exec` (Рекомендуется)

1. **Применить миграции базы данных:**
```bash
docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:migrate
```

2. **Запустить сидирование данных (Seed):**
```bash
docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:seed
```

3. *(Опционально)* **Полный сброс базы и повторный seed:**
```bash
docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:reset
```

---

### Вариант Б: Запуск интерактивно внутри контейнера

Вы можете открыть shell внутри запущенного контейнера сервера:

```bash
# Вход в контейнер сервера
docker exec -it trick-surf-server-local /bin/sh

# Внутри контейнера:
bun run prisma:migrate
bun run prisma:seed

# Выход
exit
```

---

### Вариант В: Подключение к PostgreSQL напрямую

```bash
docker exec -it trick-surf-db-local psql -U surfgxds -d surfgxds_dev
```

Полезные команды psql:
- `\dt` — список всех таблиц.
- `SELECT count(*) FROM map;` — проверить количество карт.
- `SELECT count(*) FROM trick;` — проверить количество трюков.
- `\q` — выйти.

---

## 🌐 3. Продакшен развертывание (`docker-compose.yml`)

Продакшен конфигурация рассчитана на работу с обратным прокси-сервером **Traefik** и единой docker-сетью `prod-net`.

### Шаг 1: Создание внешней сети (если не создана ранее)

```bash
docker network create prod-net
```

### Шаг 2: Настройка переменных окружения

В `docker/.env` укажите домены и продакшен параметры:

```dotenv
DOMAIN_CLIENT=trick-surf.limited-dissolve.ru
DOMAIN_API=trick-surf-api.limited-dissolve.ru
NODE_ENV=production
POSTGRES_PASSWORD=strong_generated_password
```

### Шаг 3: Запуск в проде

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

### Шаг 4: Применение миграций и seed в проде

```bash
docker compose -f docker/docker-compose.yml exec trick-surf-server bun run prisma:migrate
docker compose -f docker/docker-compose.yml exec trick-surf-server bun run prisma:seed
```

---

## 📊 4. Мониторинг через SigNoz (OpenTelemetry)

Проект полностью переведен с Prometheus на нативный стек **OpenTelemetry (SigNoz)**:
- **Server**: Трейсы запросов (`/v1/traces`), OTLP-метрики (`/v1/metrics`), логи через `pino-opentelemetry-transport`.
- **Client**: Web SDK (навигация, клики, fetch/XHR перехват, Web Vitals: LCP, INP, CLS, TTFB, FCP, клиентские ошибки).

Для активации отправки данных в SigNoz достаточно указать OTLP эндпоинт в `docker/.env`:

```dotenv
OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-ingester:4318
OTEL_SERVICE_NAME=trick-surf-server
```

*(Если переменная `OTEL_EXPORTER_OTLP_ENDPOINT` пустая, сборщик телеметрии будет отключен и не будет вызывать сетевых задержек).*

---

## 🛠 5. Полезные команды обслуживания

```bash
# Просмотр логов сервера в реальном времени
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-server

# Просмотр логов клиента Nginx
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-client

# Просмотр логов базы данных
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-db

# Перезапуск отдельного сервиса
docker compose -f docker/docker-compose.local.yml restart trick-surf-server

# Остановка всех сервисов
docker compose -f docker/docker-compose.local.yml down

# Остановка с удалением volume базы данных (ВНИМАНИЕ: удалит все данные БД!)
docker compose -f docker/docker-compose.local.yml down -v
```
