# Backend service for TrickSurf

## Endpoints

| Метод | Путь                  | Описание                                                                                                                             |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| GET   | `/user/`              | Массив объектов `User`, содержащих информацию о всех пользователях.                                                                  |
| GET   | `/user/:id`           | Объект `User`, содержащий информацию о пользователе с указанным `id`. Если пользователь не найден, возвращает ошибку 404.            |
| GET   | `/user/:id/permisson` | Массив объектов `UserPermission`, содержащих информацию о разрешениях пользователя с указанным `id`.                                 |
| GET   | `/trigger/`           | Массив объектов `Trigger`, содержащих информацию о всех триггерах. Может быть отфильтрован по `mapId`, `name`, `fullName`, `id`.     |
| GET   | `/trick/`             | Массив объектов `Trick`, содержащих информацию о всех трюках.                                                                        |
| GET   | `/trick/list`         | Массив объектов `Trick`, содержащих информацию о трюках, отфильтрованных по `mapId`.                                                 |
| GET   | `/trick/:trickId/wr`  | Объект `TrickRecord`, содержащий информацию о рекордах трика по `time` и `speed`. Если таковые не найдены, возвращает поля с `null`. |
| GET   | `/map/`               | Массив объектов `Map`, содержащих информацию о всех картах.                                                                          |

## Local Development

> Required dependencies

- `bun >= 1.4.0` as runtime and package manager

> Run project

- `bun install` installing dependencies
- `bun run dev` starting development mode with hot reload
- `bun run start` starting in production mode

```md
✨ Server listening on port 8080

🌱 REST endpoints
http://localhost:8080/api/v1/...

📚 OpenAPI / Swagger documentation
http://localhost:8080/swagger

🔍 OpenTelemetry / SigNoz
OTLP collector endpoint (traces, metrics, logs via OTEL_EXPORTER_OTLP_ENDPOINT)
```

### In order for everything to work correctly, the MySQL database must be up and running.

```bash
docker run -p 3306:3306 \
  --name surfgxds-mysql \
  -e MYSQL_PASSWORD=surfgxds \
  -e MYSQL_USER=surfgxds \
  -e MYSQL_DATABASE=surfgxds_dev \
  -e MYSQL_ROOT_PASSWORD=surfgxds_root_pwd \
  -d \
  --restart always \
  mysql:8.4
```

After launching, perform migrations and seeding of all data, this can be done by writing:

- `bun run prisma:reset`
