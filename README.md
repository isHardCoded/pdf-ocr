# PDF OCR — копируемый текст из сканированных PDF

Локальное веб-приложение: загружаете сканированный PDF (500–1000 страниц — норма), получаете тот же PDF, но с распознанным текстовым слоем. Текст становится выделяемым, копируемым и искомым.

- **OCR-ядро (Python):** [OCRmyPDF](https://ocrmypdf.readthedocs.io/) + Tesseract 5 (`rus`); воркер в фоне обрабатывает очередь задач из SQLite
- **API (Node.js):** Fastify + Prisma (SQLite) + Zod; слои: репозитории, сервисы, контроллеры
- **Frontend:** Next.js 15 + React 19 + TailwindCSS + react-pdf; запросы к API идут через `app/api/[[...path]]` (прокси на бэкенд)
- **Работает полностью локально** — файлы не покидают ваш компьютер

## Быстрый старт (рекомендуется: Docker)

Требования: [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows.

```bash
docker compose up --build
```

Открыть в браузере: **http://localhost:3000**

Сервисы:

- **api** — HTTP API (порт `8000` с хоста)
- **worker** — Python-воркер OCR (те же `DATA_DIR` и `app.db`, что и у API)
- **frontend** — Next.js (порт `3000`); внутри Docker к API: `BACKEND_URL=http://api:8000`

Все задачи и файлы сохраняются в папке `./data/` на хост-машине (вход, выход, `app.db`).

**Если `localhost:3000` в браузере бесконечно грузится (Windows + Docker):** чаще всего помогает открыть **`http://127.0.0.1:3000`**, а не `http://localhost:3000` — из‑за IPv6/проброса портов. Убедитесь, что в **Docker → Ports** у контейнера фронта `3000:3000` в статусе, а `http://127.0.0.1:8000/health` с хоста отвечает `ok`.

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

Страница **История** показывает все задачи, сохранённые в SQLite.

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

1. **Node.js 20+** — API:
   ```powershell
   cd api
   npm install
   $env:DATABASE_URL = "file:../../data/app.db"   # путь к SQLite; при необходимости укажите DATA_DIR
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
   python -m app.worker
   ```
   `DATA_DIR` должен совпадать с каталогом, куда API пишет `input/`, `output/` и `app.db`.

3. **Node.js 20+** — фронтенд (третий терминал):
   ```powershell
   cd frontend
   npm install
   $env:BACKEND_URL = "http://127.0.0.1:8000"
   npm run dev
   ```
   Откройте **http://localhost:3000** — прокси Next направит `/api/*` на `BACKEND_URL`.

## Переменные окружения (кратко)

| Переменная    | Где        | Назначение |
|---------------|------------|------------|
| `DATA_DIR`    | API, worker| Каталог данных: `input/`, `output/`, `app.db` (по умолчанию у API — `data` в корне репо, см. `api/src/config/env.ts`) |
| `DATABASE_URL`| API        | Prisma, например `file:../../data/app.db` (локально) или `file:/data/app.db` (Docker) |
| `PORT`        | API        | Порт HTTP (по умолчанию `8000`) |
| `BACKEND_URL` | frontend   | URL API для server-side прокси в Next.js (Docker: `http://api:8000`) |

## Структура репозитория

```
pdf-ocr/
├── docker-compose.yml        # api + worker + frontend
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
│   │   ├── api/[[...path]]/  # прокси → BACKEND_URL
│   │   ├── page.tsx
│   │   ├── jobs/…
│   │   └── …
│   └── …
└── data/                     # вход, выход, SQLite (в .gitignore; монтируется в Docker)
```

## API (HTTP)

База путей совпадает с прежним контрактом. Фронт обращается к **`/api/...`**, Next проксирует на бэкенд (без префикса `/api` на стороне API).

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
