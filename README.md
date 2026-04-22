# GigaChat Shell

## Демо

- Ссылка: TODO (добавьте после деплоя)
- Скриншоты/видео: TODO

## Стек

- React `18.3.1`
- TypeScript `5.5.4`
- Vite `5.4.1`
- React Router `6.26.2`
- Стейт-менеджмент: React Context + `useReducer` (см. `ChatProvider`)
- Стили: CSS Modules

## Запуск локально

### Через Docker

1) Запуск dev-сервера:

`docker compose up --build`

2) Открыть в браузере:

`http://localhost:5173`

3) Если появится экран **Вход**, вставьте токен/credentials (см. ниже).

### Без Docker

1) Клонировать репозиторий:

`git clone <URL>`

2) Установить зависимости:

`npm install`

3) Создать `.env` из примера и заполнить переменные:

`cp .env.example .env`

4) Запуск dev-сервера:

`npm run dev`

## Где взять токен / credentials

Этот проект ходит напрямую в GigaChat API. Чтобы “общение с ИИ” работало, вам нужен доступ к GigaChat:

- **Вариант A (проще):** готовый `access token` (строка вида `eyJ…`), который обычно выдаёт преподаватель/методичка/личный кабинет.
- **Вариант B:** `client_id` и `client_secret` (Client Credentials). Из них приложение получает токен по OAuth.

Если у вас **нет ни токена, ни client credentials**, технически отправлять запросы в GigaChat нельзя — попросите эти данные у преподавателя.

### Как сделать Base64 из `client_id:client_secret` (Windows PowerShell)

`[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('client_id:client_secret'))`

В приложении можно вставлять:

- `Bearer <token>` или просто `<token>`
- либо Base64 строку (или `Basic <base64>`)

## Переменные окружения

Все переменные должны быть заданы через `.env` / настройки хостинга (Vercel/Netlify/GitHub Pages) и начинаться с `VITE_`.

| Переменная | Описание |
|---|---|
| `VITE_GIGACHAT_BASE_URL` | Базовый URL API (по умолчанию `https://gigachat.devices.sberbank.ru/api/v1`) |
| `VITE_GIGACHAT_OAUTH_URL` | OAuth endpoint для получения токена (client_credentials) |
| `VITE_GIGACHAT_ACCESS_TOKEN` | Готовый access token (без префикса `Bearer`), опционально |
| `VITE_GIGACHAT_CREDENTIALS_BASE64` | Basic credentials в Base64 (`client_id:client_secret`), опционально |
| `VITE_GIGACHAT_SCOPE` | Scope: `GIGACHAT_API_PERS` \| `GIGACHAT_API_B2B` \| `GIGACHAT_API_CORP` |

## Аудит бандла

- Сгенерировать отчет визуализатора:

`npm run analyze`

- Скриншот:
  1) Запустите команду выше (она откроет/сгенерирует визуализацию бандла)
  2) Сделайте скриншот treemap
  3) Добавьте файл в `docs/` и вставьте ссылку в этот README (TODO)

## Деплой (Vercel)

- Добавьте env-переменные из секции выше в настройках проекта на Vercel
- Для корректной работы React Router уже добавлен `vercel.json` (SPA rewrite на `index.html`)
- После деплоя обновите секцию **Демо** публичной ссылкой
