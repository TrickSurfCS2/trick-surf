# TrickSurf — CS2 Trick Surf Platform

Монорепозиторий веб-платформы для трекинга и отображения триксерф-карт, зон (триггеров), трюков и рекордов для Counter-Strike 2.

### Стек технологий:
- **Client (Frontend)**: Vue 3, Vite, TypeScript, Pinia, Three.js, SCSS, PWA
- **Server (Backend)**: Bun, Elysia, TypeScript, Prisma ORM, OpenTelemetry (SigNoz)
- **Database**: PostgreSQL 16 (всегда запускается в Docker)
- **Монорепозиторий**: Turborepo, Bun Workspaces

---

## Содержание
1. [Предварительные требования](#предварительные-требования)
2. [Важно: Решение ошибки Docker на Windows](#важно-решение-ошибки-docker-на-windows)
3. [Вариант 1: Локальная разработка (Client + Server локально, БД в Docker) — РЕКОМЕНДУЕТСЯ](#вариант-1-локальная-разработка-client--server-локально-бд-в-docker--рекомендуется)
4. [Вариант 2: Полный запуск в Docker (Все сервисы в контейнерах)](#вариант-2-полный-запуск-в-docker-все-сервисы-в-контейнерах)
5. [Полезные команды и управление базой данных](#полезные-команды-и-управление-базой-данных)
6. [Частые проблемы (FAQ)](#частые-проблемы-faq)

---

## Предварительные требования

Перед началом работы убедитесь, что на компьютере установлены:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — необходим для запуска базы данных PostgreSQL (и опционально всего стека).
2. **[Bun](https://bun.sh/)** *(версия >= 1.4.0)* — JavaScript/TypeScript рантайм и пакетный менеджер:
   - **Windows (PowerShell)**:
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```
   - **Linux / macOS**:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
3. **[Git](https://git-scm.com/)** — для клонирования репозитория.

---

## Важно: Решение ошибки Docker на Windows

Если при выполнении любой команды `docker` появляется ошибка:
> `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine... The system cannot find the file specified`

Это означает, что **Docker Desktop не запущен** или **не инициализирован WSL 2**.

### Что нужно сделать:
1. Запустите приложение **Docker Desktop** из меню «Пуск».
2. Дождитесь, пока в левом нижнем углу окна Docker Desktop статус станет зеленым (**"Engine running"**), а в трее иконка кита перестанет мигать.
3. *Если Docker Desktop не запускается или сообщает об ошибке WSL 2*:
   - Откройте PowerShell от имени администратора и выполните:
     ```powershell
     wsl --update
     ```
   - Перезагрузите компьютер.
4. Проверьте работоспособность в терминале:
   ```bash
   docker ps
   ```
   *(Команда должна выполниться без ошибок и вывести список контейнеров).*

---

## Вариант 1: Локальная разработка (Client + Server локально, БД в Docker) — РЕКОМЕНДУЕТСЯ

> **Подходит для разработки и тестирования**: клиент и сервер запускаются локально на машине разработчика с автоматической перезагрузкой при изменении кода (Hot-Reload / Watch mode), а база данных PostgreSQL работает в Docker-контейнере.

### Шаг 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/trick-surf.git
cd trick-surf
```

### Шаг 2. Настройка файлов окружения (.env)

Создайте файлы конфигурации для сервера и клиента:

1. **Сервер**:
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```
   *Содержимое `apps/server/.env` по умолчанию:*
   ```dotenv
   HOST=localhost
   PORT=8080
   DATABASE_URL=postgresql://surfgxds:surfgxds@localhost:5432/surfgxds_dev
   ```

2. **Клиент**:
   ```bash
   cp apps/client/.env.example apps/client/.env
   ```
   *Убедитесь, что в `apps/client/.env` указан адрес локального бэкенда:*
   ```dotenv
   VITE_API_URL=http://localhost:8080
   ```

---

### Шаг 3. Запуск базы данных в Docker

Запустите контейнер с PostgreSQL:
```bash
docker compose -f docker/docker-compose.local.yml up -d trick-surf-db
```

> Флаг `-d` запускает контейнер в фоновом режиме. База данных будет доступна на порту `localhost:5432`.

---

### Шаг 4. Установка зависимостей

В корневой директории проекта установите все пакеты с помощью `bun`:
```bash
bun install
```

---

### Шаг 5. Применение миграций и наполнение базы данными (Seed)

Создайте структуру таблиц и загрузите начальные данные (карты, триггеры, трюки):
```bash
# Применение миграций Prisma
bun run prisma:migrate

# Заполнение базы начальными данными
bun run prisma:seed
```

---

### Шаг 6. Запуск сервера и клиента

#### Способ А: Запустить всё одной командой (через Turborepo)
```bash
bun dev
```

#### Способ Б: Запустить раздельно в двух терминалах (удобно для просмотра логов)
- **Терминал 1 (Бэкенд)**:
  ```bash
  bun dev:server
  ```
- **Терминал 2 (Фронтенд)**:
  ```bash
  bun dev:client
  ```

---

### Доступные адреса:
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Server (Backend API)**: [http://localhost:8080](http://localhost:8080)
- **Swagger API Docs**: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Prisma Studio (Веб-интерфейс БД)**: запустите `bun run prisma:studio` и откройте [http://localhost:5555](http://localhost:5555)

---

## Вариант 2: Полный запуск в Docker (Все сервисы в контейнерах)

> **Подходит для тестирования релизной сборки (как на продакшене)**: все сервисы (PostgreSQL, сервер на Bun, фронтенд на Nginx) запускаются изолированно в Docker.

### Шаг 1. Создание общего .env файла
```bash
cp docker/.env.example docker/.env
```

---

### Шаг 2. Сборка и запуск всех контейнеров
```bash
docker compose -f docker/docker-compose.local.yml up --build -d
```

Проверить статус запущенных контейнеров:
```bash
docker compose -f docker/docker-compose.local.yml ps
```

---

### Шаг 3. Применение миграций и seed внутри контейнера

Так как база запускается в первый раз, примените миграции и сид через контейнер сервера:
```bash
# Применение миграций
docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:migrate

# Заполнение начальными данными
docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:seed
```

---

### Доступные адреса в Docker-режиме:
- **Client (Frontend / Nginx)**: [http://localhost:3334](http://localhost:3334)
- **Server (Backend API)**: [http://localhost:8080](http://localhost:8080)
- **Swagger API Docs**: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- **PostgreSQL**: `localhost:5432`

---

## Полезные команды и управление базой данных

### Параметры подключения к PostgreSQL
- **Хост**: `localhost`
- **Порт**: `5432`
- **Пользователь**: `surfgxds`
- **Пароль**: `surfgxds`
- **Имя БД**: `surfgxds_dev`

### Сброс базы данных (полное пересоздание и повторный seed)
- **При локальной разработке**:
  ```bash
  cd apps/server
  bun run prisma:reset
  ```
- **В Docker-окружении**:
  ```bash
  docker compose -f docker/docker-compose.local.yml exec trick-surf-server bun run prisma:reset
  ```

### Остановка контейнеров
- **Остановить контейнеры**:
  ```bash
  docker compose -f docker/docker-compose.local.yml stop
  ```
- **Остановить и удалить контейнеры**:
  ```bash
  docker compose -f docker/docker-compose.local.yml down
  ```
- **Остановить и полностью удалить данные базы (Volume)**:
  ```bash
  docker compose -f docker/docker-compose.local.yml down -v
  ```

### Просмотр логов
```bash
# Логи сервера
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-server

# Логи клиента
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-client

# Логи базы данных
docker compose -f docker/docker-compose.local.yml logs -f trick-surf-db
```

---

## Частые проблемы (FAQ)

<details>
<summary><b>1. Ошибка "dockerDesktopLinuxEngine: The system cannot find the file specified"</b></summary>

Docker Desktop не запущен.
1. Откройте приложение **Docker Desktop**.
2. Убедитесь, что статус в нижнем левом углу перешел в "Engine running".
3. Повторите запуск команды.
</details>

<details>
<summary><b>2. Ошибка "Port 5432 is already in use"</b></summary>

На компьютере уже запущен локальный PostgreSQL вне Docker.
- Либо остановите локальную службу PostgreSQL в службах Windows (`services.msc` -> Postgres -> Остановить) или `sudo systemctl stop postgresql` на Linux.
- Либо измените порт в `docker/docker-compose.local.yml` (например, `"5433:5432"`) и обновите `DATABASE_URL`.
</details>

<details>
<summary><b>3. Фронтенд не загружает данные / Ошибка CORS или Network Error</b></summary>

1. Проверьте, запущен ли бэкенд: перейдите на [http://localhost:8080/health](http://localhost:8080/health) (должно вернуть `{"status":"ok"}`).
2. Проверьте `apps/client/.env`: переменная `VITE_API_URL` должна иметь значение `http://localhost:8080`.
3. Убедитесь, что миграции и сид были выполнены (`bun run prisma:seed`).
</details>
