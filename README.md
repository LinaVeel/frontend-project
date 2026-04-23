# GigaChat Shell
# Сделано студенткой Лукьяновой Алиной

## Демо

- Ссылка на видеодемонстрацию: https://drive.google.com/file/d/1UWTcqYUA4pjmuMbneBu-ypN_Oy9Jd4Jd/view?usp=drive_link

## Стек

- React `18.3.1`
- TypeScript `5.5.4`
- Vite `5.4.1`
- React Router `6.26.2`
- Стейт-менеджмент: React Context + `useReducer` (см. `ChatProvider`)
- Стили: CSS Modules

## Запуск локально

1) Клонировать репозиторий и перейти в папку проекта:

`git clone <repo-url>`

`cd <project-folder>`

2) Установить зависимости:

`npm install`

3) Заполнить переменные окружения:

- Создайте файл `.env` на основе примера `.env.example`.

PowerShell:

`Copy-Item .env.example .env`

bash/zsh:

`cp .env.example .env`

- Откройте `.env` и укажите нужные значения (см. секцию “Переменные окружения”).

4) Запустить dev-сервер:

`npm run dev`

5) Открыть в браузере:

`http://localhost:5173`

## Быстрый старт

### Через Docker (dev)

В репозитории есть [compose.yaml](compose.yaml). Он поднимает Vite dev-сервер в контейнере.

1) Запуск:

`docker compose up --build`

2) Открыть:

`http://localhost:5173`

3) Если появился экран **Вход** — см. раздел “Авторизация”.

### Без Docker (dev)

1) Установить зависимости:

`npm install`

2) (Опционально) Создать `.env` из примера:

`cp .env.example .env`

3) Запуск dev-сервера:

`npm run dev`

4) Открыть:

`http://localhost:5173`

## Авторизация

Приложение поддерживает 2 варианта:

### Вариант A — Bearer access token

В поле **Credentials** вставьте:

- `Bearer <token>`
- или просто `<token>`

Токен можно также задать через `VITE_GIGACHAT_ACCESS_TOKEN` (без префикса `Bearer`).

### Вариант B — Basic credentials (client_id:client_secret → Base64)

Если у вас есть пара `client_id`/`client_secret`, приложение может само получить `access_token` через OAuth (grant_type=client_credentials).

1) Сгенерируйте Base64 от строки `client_id:client_secret`.

PowerShell:

`[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("<client_id>:<client_secret>"))`

bash/zsh:

`printf "%s" "<client_id>:<client_secret>" | base64`

2) Вставьте в поле **Credentials**:

- `Basic <base64>`
- или просто `<base64>`

3) Выберите правильный **Scope** (обычно `GIGACHAT_API_PERS`) и нажмите “Войти”.

Примечание: введённые данные сохраняются в `localStorage` (чтобы не вводить их каждый раз).

## Доступ к GigaChat

Чтобы всё работало, нужен доступ к GigaChat API в кабинете разработчика:

https://developers.sber.ru/portal/products/gigachat-api

## Переменные окружения

Все переменные задаются через `.env` / настройки хостинга и должны начинаться с `VITE_`.

Dev-режим:

- `VITE_GIGACHAT_OAUTH_URL` можно **не задавать** — OAuth идёт через `/oauth` (прокси Vite).
- `VITE_GIGACHAT_BASE_URL` можно не задавать — API идёт через `/api/v1` (прокси Vite).

Prod-режим:

- если вы НЕ используете backend, укажите `VITE_GIGACHAT_OAUTH_URL` явным URL (см. таблицу) или задайте готовый `VITE_GIGACHAT_ACCESS_TOKEN`.

| Переменная | Описание |
|---|---|
| `VITE_GIGACHAT_BASE_URL` | Базовый URL GigaChat API. Если не задан — используется значение по умолчанию в коде. В dev можно использовать прокси `/api/v1`. |
| `VITE_GIGACHAT_OAUTH_URL` | OAuth endpoint для получения токена (client_credentials). В dev обычно не нужен (идёт через `/oauth` прокси). |
| `VITE_GIGACHAT_ACCESS_TOKEN` | Готовый access token (без префикса `Bearer`). Если задан — OAuth не нужен. |
| `VITE_GIGACHAT_CREDENTIALS_BASE64` | Basic credentials в Base64 (`client_id:client_secret`). Альтернатива форме входа. |
| `VITE_GIGACHAT_SCOPE` | Scope: `GIGACHAT_API_PERS` \| `GIGACHAT_API_B2B` \| `GIGACHAT_API_CORP`. По умолчанию `GIGACHAT_API_PERS`. |

## Troubleshooting

- `OAuth: HTTP 401/400` — неверные credentials/scope. Проверьте Base64 от `client_id:client_secret` и выбранный scope.
- `OAuth: HTTP 500` в dev/Docker — часто проблема TLS/сертификатов на прокси. В этом проекте в dev-прокси отключена строгая TLS-проверка (см. [vite.config.ts](vite.config.ts)).
- `Не удалось выполнить запрос (возможен CORS/сеть)` — запрос не дошёл до прокси/сервиса. Проверьте, что вы в dev ходите на `http://localhost:5173`, а Vite поднят.


