# PDF OCR — копируемый текст из сканированных PDF

Локальное веб-приложение: загружаете сканированный PDF (500–1000 страниц — норма), получаете тот же PDF, но с распознанным текстовым слоем. Текст становится выделяемым, копируемым и искомым.

- **OCR-ядро (Python):** [OCRmyPDF](https://ocrmypdf.readthedocs.io/) + Tesseract 5 (`rus`); воркер в фоне обрабатывает очередь задач из **PostgreSQL**
- **API (Node.js):** Fastify + Prisma (**PostgreSQL**) + Zod; слои: репозитории, сервисы, контроллеры
- **Frontend:** Next.js 15 + React 19 + TailwindCSS + react-pdf; запросы в браузере к Fastify напрямую (`NEXT_PUBLIC_API_URL`, CORS на API)
- **Работает полностью локально** — файлы не покидают ваш компьютер

## Быстрый старт (рекомендуется: Docker)

Требования: [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows.

```bash
docker compose up --build
```

Открыть в браузере: **http://localhost:3000**

Сервисы:

- **db** — [PostgreSQL](https://www.postgresql.org/) 16 (том `pgdata`, пользователь/пароль/БД в `docker-compose.yml`)
- **api** — HTTP API (порт `8000` с хоста), при старте выполняет `prisma db push` (схема в БД)
- **worker** — Python-воркер OCR: те же `DATA_DIR` и `DATABASE_URL`, что у API
- **frontend** — Next.js (порт `3000`); бандл собирается с `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` — **хост/порт**, с которого браузер с вашей машины зовёт API (тот же публичный `8000`, не имя `api` внутри сети Docker)

Состояние задач в PostgreSQL; **файлы** PDF (вход/выход) — в `./data/` на хосте (монтирование в `api` и `worker`).

Переход с SQLite: старый `data/app.db` больше не используется; поднимите стек с пустой БД или сделайте миграцию данных вручную.

**Если страница «висит» на загрузке:** (1) главная не использует `useSearchParams` (у Next 15 это нередко ломает отдачу маршрута) — (2) при **Docker + Windows** попробуйте **`http://127.0.0.1:3000`**, не `http://localhost:3000` (IPv6) — (3) в **Docker → Ports** фронт `3000:3000`, `http://127.0.0.1:8000/health` = `ok`.

**Контейнер `pdf-reader-backend`:** это **старый** сервис из прошлой схемы (FastAPI). В текущем `docker-compose.yml` есть только **api** и **ocr-worker** с каталога `backend/`. Остановите и удалите: `docker rm -f pdf-reader-backend` (либо в Docker Desktop → Containers) и перезапустите `docker compose up` из **этой** папки проекта.

## Использование

1. На главной странице перетащите PDF в зону загрузки.
2. Выберите настройки:
   - **Язык** — `rus` по умолчанию (также `rus+eng` и `eng`).
   - **Режим распознавания** (по умолчанию — полный OCR):
     - *Все страницы* (`force_ocr`) — надёжно для больших сканов, текст можно копировать на каждой странице.
     - *Сомнительный OCR* (`redo_ocr`) — переложить слабый/старый слой, не трогая нормальный цифровой текст, где это возможно.
     - *Пропустить, если есть текст* (`skip_text`) — быстрее, но страница целиком не обрабатывается, если в PDF уже отмечен слой с текстом: на «шумных» сканах иногда копирование остаётся лишь с части страниц.
   - **Оптимизация размера** — `3` даёт меньший итоговый PDF без потерь в тексте.
   - **Deskew** — выравнивать наклон сканов.
3. Нажмите **Запустить OCR**. Откроется страница задачи с живым прогресс-баром и ETA (SSE + опрос БД).
4. По завершении — кнопка **Скачать**. Превью справа позволяет убедиться, что текст копируется.

Страница **История** показывает все задачи из PostgreSQL.

## Производительность

OCRmyPDF распараллеливает страницы по всем ядрам CPU. Ориентир:

| Страниц | 4 ядра | 8 ядер |
|---------|--------|--------|
| 100     | ~5 мин | ~2 мин |
| 500     | ~25 мин| ~12 мин|
| 1000    | ~50 мин| ~25 мин|

Точные цифры зависят от DPI сканов и режима оптимизации.

## Нативный запуск (без Docker) на Windows

Системные зависимости для OCR (как в Docker-образе воркера): Tesseract (в т.ч. `rus`, `eng`), Ghostscript, qpdf, unpaper, pngquant и т.д. — проще поставить вручную по [документации OCRmyPDF](https://ocrmypdf.readthedocs.io/en/latest/installation.html#installing-on-windows) или ориентироваться на `backend/Dockerfile` (пакеты Debian).

0. **PostgreSQL** (локально или Docker) с базой, например `pdf_ocr`, и пользователем с правами на неё.

1. **Node.js 20+** — API:
   ```powershell
   cd api
   npm install
   $env:DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/pdf_ocr"   # как в вашем Postgres
   npx prisma db push
   npm run dev
   ```
   API слушает `http://127.0.0.1:8000` (см. `api/src/server.ts`, переменная `PORT`).

2. **Python 3.11+** — воркер OCR (отдельный терминал, из корня репозитория):
   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -e .
   $env:DATA_DIR = (Resolve-Path ..\data).Path
   $env:DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/pdf_ocr"   # тот же DSN, что и у Prisma; драйвер Python сам подставит +psycopg2
   python -m app.worker
   ```
   `DATA_DIR` — каталог, куда API пишет `input/` и `output/`.

3. **Node.js 20+** — фронтенд (третий терминал):
   ```powershell
   cd frontend
   npm install
   $env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"   # опционально, то же в `frontend/.env.local`
   npm run dev
   ```
   Откройте **http://localhost:3000** — UI ходит на `NEXT_PUBLIC_API_URL` (по умолчанию `http://127.0.0.1:8000` в коде, если не задали).

## Переменные окружения (кратко)

Шаблон: **`copy .env.example .env`** в корне. Добавьте `NEXT_PUBLIC_API_URL` (для `docker compose build` фронта). Для `npm`/`npx prisma` в `api` — `api/.env` из `api/.env.example`. `docker compose` читает корневой `.env` (в т.ч. `POSTGRES_*`, `DATABASE_URL` для `db`).

| Переменная     | Где         | Назначение |
|----------------|------------|------------|
| `DATA_DIR`     | API, worker| Каталог: только **файлы** `input/`, `output/` (по умолчанию `data` в корне, см. `api/src/config/env.ts`) |
| `DATABASE_URL` | API, worker| `postgresql://user:pass@host:5432/db` (Prisma и, через преобразование, SQLAlchemy/psycopg2 в воркере) |
| `PORT`         | API        | Порт HTTP (по умолчанию `8000`) |
| `NEXT_PUBLIC_API_URL` | frontend   | **Публичный** URL API для браузера, например `http://127.0.0.1:8000` (для `docker compose build` передаётся build-arg) |
| `POSTGRES_*`  | `db` (compose) | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` в корневом `.env` (см. шаблон) |

## Структура репозитория

```
pdf-ocr/
├── docker-compose.yml        # db (Postgres) + api + worker + frontend
├── api/                      # Node: Fastify, Prisma, Zod
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── db/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/          # Zod
│   │   └── mappers/
│   └── Dockerfile
├── backend/                  # Python: только OCR-воркер
│   ├── app/
│   │   ├── worker.py
│   │   ├── db.py, models.py, config.py
│   │   └── services/         # ocr.py, progress.py
│   └── Dockerfile
├── frontend/                 # Next.js (App Router)
│   ├── app/
│   │   ├── page.tsx
│   │   ├── jobs/…
│   │   └── …
│   └── …
└── data/                     # только вход/выход PDF (в .gitignore; в Docker: том для файлов, не БД)
```

Именованный том Docker **`pgdata`** — данные PostgreSQL.

## API (HTTP)

Пути на Fastify: **`/jobs`**, `/health` и т.д. (без префикса `/api`). С клиента полные URL: **`NEXT_PUBLIC_API_URL` + путь** (CORS в `api` разрешён).

| Метод  | Путь (на бэкенде)        | Описание |
|--------|--------------------------|----------|
| POST   | `/jobs`                  | Загрузить PDF, создать OCR-задачу |
| GET    | `/jobs`                  | Список задач (пагинация) |
| GET    | `/jobs/{id}`             | Состояние задачи |
| DELETE | `/jobs/{id}`             | Удалить задачу и файлы |
| GET    | `/jobs/{id}/stream`      | SSE: прогресс (снимок + опрос) |
| GET    | `/jobs/{id}/download`    | Скачать готовый PDF |
| GET    | `/jobs/{id}/preview`     | Inline PDF для превью |
| GET    | `/health`                | Проверка живости |

## Лицензии и ссылки

- OCRmyPDF — MPL-2.0
- Tesseract — Apache 2.0
- Ghostscript — AGPL (для некоммерческого использования бесплатно)
