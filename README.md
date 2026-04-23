# PDF OCR — копируемый текст из сканированных PDF

Локальное веб-приложение: загружаете сканированный PDF (500–1000 страниц — норма), получаете тот же PDF, но с распознанным текстовым слоем. Текст становится выделяемым, копируемым и искомым.

- **OCR ядро:** [OCRmyPDF](https://ocrmypdf.readthedocs.io/) + Tesseract 5 (`rus`)
- **Backend:** FastAPI + SQLModel + SSE (прогресс по страницам)
- **Frontend:** Next.js 15 + React 19 + TailwindCSS + react-pdf
- **Работает полностью локально** — файлы не покидают ваш компьютер

## Быстрый старт (рекомендуется: Docker)

Требования: [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows.

```bash
docker compose up --build
```

Открыть в браузере: **http://localhost:3000**

Все задачи и файлы сохраняются в папке `./data/` на хост-машине.

## Использование

1. На главной странице перетащите PDF в зону загрузки.
2. Выберите настройки:
   - **Язык** — `rus` по умолчанию (также `rus+eng` и `eng`).
   - **Режим страниц с текстом**:
     - *Пропустить* — уже распознанные страницы не трогаются (быстро и безопасно).
     - *Пересканировать сомнительные* (`redo_ocr`) — перезаписать слабый текстовый слой.
     - *Пересканировать все* (`force_ocr`) — полный OCR всех страниц.
   - **Оптимизация размера** — `3` даёт меньший итоговый PDF без потерь в тексте.
   - **Deskew** — выравнивать наклон сканов.
3. Нажмите **Запустить OCR**. Откроется страница задачи с живым прогресс-баром и ETA.
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

Если не хотите ставить Docker, понадобится вручную установить системные зависимости:

1. **Tesseract OCR 5**: https://github.com/UB-Mannheim/tesseract/wiki — при установке отметьте русский (`rus.traineddata`).
2. **Ghostscript**: https://www.ghostscript.com/releases/gsdnld.html
3. **Python 3.11+** и бэкенд:
   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -e .
   uvicorn app.main:app --reload --port 8000
   ```
4. **Node.js 20+** и фронтенд:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## Структура

```
pdf-reader/
├── docker-compose.yml
├── backend/                FastAPI + OCRmyPDF
│   └── app/
│       ├── main.py
│       ├── db.py  models.py  config.py
│       ├── routes/         jobs.py, stream.py (SSE)
│       └── services/       ocr.py, progress.py
├── frontend/               Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx        загрузка
│   │   ├── jobs/page.tsx   история
│   │   └── jobs/[id]/page.tsx  прогресс + превью
│   └── components/
└── data/                   входные, выходные файлы, SQLite (сохраняется)
```

## API (бэкенд)

| Метод | Путь                     | Описание                          |
|-------|--------------------------|-----------------------------------|
| POST  | `/jobs`                  | Загрузить PDF, создать OCR-задачу |
| GET   | `/jobs`                  | Список задач                      |
| GET   | `/jobs/{id}`             | Состояние задачи                  |
| DELETE| `/jobs/{id}`             | Удалить задачу и файлы            |
| GET   | `/jobs/{id}/stream`      | SSE поток прогресса               |
| GET   | `/jobs/{id}/download`    | Скачать готовый PDF               |
| GET   | `/jobs/{id}/preview`     | Inline PDF для превью             |

## Лицензии и ссылки

- OCRmyPDF — MPL-2.0
- Tesseract — Apache 2.0
- Ghostscript — AGPL (для некоммерческого использования бесплатно)
