# Tech Context

## Стек
- **Frontend**: Статический HTML/CSS/JS (без фреймворков, без сборки)
- **Шрифты**: Inter (Google Fonts)
- **Auth + DB + Storage**: Supabase (supabase-js v2 через CDN)
- **AI — Изображения**: OpenRouter API → Nano Banana 2 (gemini-3.1-flash-image-preview) + fallback: Nano Banana Pro (gemini-3-pro-image-preview)
- **AI — Видео**: fal.ai → Kling 3.0 Pro (text-to-video + image-to-video), без fallback
- **AI — Скрипты**: OpenRouter API → Gemini 3 Flash Preview + fallback: Gemini 2.5 Flash, Gemini 2.5 Pro
- **AI — Голос**: Web Speech API (браузерный, без сервера)
- **Backend**: Vercel Serverless Functions (api/*.js)
- **Деплой**: Vercel (ugcgo-delta.vercel.app)
- **Git**: GitHub (wco1/ugcgo)

## Структура файлов

```
ugcgo/
├── .cursor/
│   ├── memory-bank/           # Memory Bank (5 файлов)
│   └── rules/                 # Правила для AI (3 файла)
├── .env                       # Все ключи (НЕ в git!)
├── .gitignore                 # .DS_Store, .cursor, .env, node_modules, .vercel
├── vercel.json                # Конфигурация Vercel
├── index.html                 # Лендинг (308 строк)
├── auth.html                  # Авторизация (187 строк)
├── platform.html              # SPA-маркетплейс и дашборды (2029 строк)
├── studio.html                # AI Studio (1104 строки)
├── api/
│   ├── generate-image.js      # Прокси OpenRouter → Nano Banana 2 (изображения)
│   ├── generate-script.js     # Прокси OpenRouter → Gemini 3 Flash (скрипты)
│   └── generate-video.js      # Прокси fal.ai → Kling 3.0 Pro (видео)
├── img/
│   ├── brands/                # 8 логотипов брендов
│   ├── creators/              # ~30 фото креаторов
│   ├── creators_new/          # Новые фото (Sofia, Aisha, Emma и др.)
│   ├── demo/                  # Демо-контент по категориям
│   ├── testimonials/          # 6 аватаров для отзывов
│   └── ugc/                   # 12 UGC-примеров
├── video/                     # 6 видео креаторов (.mp4)
├── ugcgo-v2...v12.html        # УСТАРЕВШИЕ (можно удалить)
└── ugcgo-dashboard-full.html  # УСТАРЕВШИЙ (можно удалить)
```

## Git Remotes
- `origin` → https://github.com/wco1/ugcgo.git (основной, Vercel)
- `melody` → https://github.com/melodywco-byte/ugcgo.git (старый)

## Внешние API

| Сервис | Endpoint | Прокси | Env Var |
|--------|----------|--------|---------|
| Supabase Auth | supabase-js | нет (CDN) | NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Supabase REST | /rest/v1/* | нет (CDN) | NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Supabase Storage | /storage/v1 | нет (CDN) | NEXT_PUBLIC_SUPABASE_ANON_KEY |
| OpenRouter (image) | /api/generate-image | да | OPENROUTER_KEY |
| OpenRouter (script) | /api/generate-script | да | OPENROUTER_KEY |
| fal.ai (video) | /api/generate-video | да | FAL_KEY |

## Supabase

### Project
- Ref: vhcwsbeqphytmdjrsgvb
- URL: https://vhcwsbeqphytmdjrsgvb.supabase.co
- Это проект на ДРУГОМ аккаунте (не совпадает с MCP Supabase)
- Доступ через SUPABASE_PAT в .env

### Таблицы
- `user_profiles` — id, role, company_name, full_name, avatar_url, bio, website, created_at, updated_at (21 запись)
- `campaigns` — id, brand_id, title, description, budget, status, category, requirements, deadline, created_at, updated_at, cover_url, brand_icon, video_url (13 записей)
- `applications` — id, campaign_id, creator_id, pitch, samples, handle, followers, rate, status (пустая)
- `chat_messages` — для чата
- `conversations` — для чатов
- `kanban_tasks` — kanban-доска
- `messages` — сообщения

### Storage buckets
- `avatars`, `ugc-media`, `portfolios`

## Environment Variables (.env)
| Переменная | Назначение | В Vercel? |
|-----------|-----------|-----------|
| NEXT_PUBLIC_SUPABASE_URL | URL Supabase | Да |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Публичный ключ | Да |
| SUPABASE_SERVICE_ROLE_KEY | Серверный ключ | Да |
| SUPABASE_PAT | Personal Access Token | ? |
| VERCEL_TOKEN | Токен Vercel | Нет (не нужен) |
| FAL_KEY | fal.ai для видео | Да |
| OPENROUTER_KEY | OpenRouter для AI | Нужно проверить! |
| YOUTUBE_API_KEY | YouTube API | ? |

## Vercel Config
- `cleanUrls: true`, `trailingSlash: false`
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Cache для img/ и video/: max-age=31536000, immutable
- Serverless Functions: api/*.js (Node.js runtime)
- Автодеплой при push в main

## Темы оформления
3 темы: light, dark, oakley

### CSS-переменные
- `--bg`, `--text`, `--accent`, `--accent-text`
- `--nav-bg`, `--card-bg`, `--section-alt`
- `--lime: #c8ff00`, `--dark: #0a0a0a`, oakley: `#d4a017`
