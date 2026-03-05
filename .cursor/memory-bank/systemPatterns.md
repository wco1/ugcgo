# System Patterns

## Архитектура
- Многостраничный статический фронтенд (HTML/CSS/JS) + Vercel Serverless API
- SPA-подобное поведение внутри platform.html (переключение .page.active)
- Серверные функции — только прокси для AI-генерации (защита API-ключей)

## Навигация

### Между страницами
```
index.html (лендинг) 
  → platform.html (маркетплейс)
  → platform.html?auth=1 (авторизация)
  → /studio (AI Studio)

auth.html (отдельная авторизация)
  → /platform?role=brand|creator
```

### Внутри platform.html (SPA)
- Функция `showPage(id)` — переключает CSS-классы `.page.active`
- Страницы: marketplace, login, register, brand-dashboard, creator-dashboard
- Мобильно: sidebar → нижняя навигация

## Аутентификация

### Поток
1. Пользователь выбирает роль (Brand / Creator) на auth.html или в platform.html
2. Регистрация/логин через Supabase Auth (email + password)
3. При регистрации: upsert в `user_profiles` (id, full_name, role)
4. Роль сохраняется в `user_metadata.role` и `user_profiles.role`
5. После входа — перенаправление на Brand или Creator Dashboard

### Проверка сессии
- `sb.auth.getSession()` при загрузке страницы
- `sb.auth.onAuthStateChange()` для отслеживания изменений
- Тема сохраняется в `localStorage('ugcgo-theme')`

## Темизация
- 3 темы: light, dark, oakley
- `body[data-theme="..."]` + CSS-переменные
- Переключатель тем в навигации
- Сохранение в `localStorage('ugcgo-theme')`

## AI-генерация

### Паттерн для изображений и скриптов
```
Клиент → POST /api/generate-image (или /api/generate-script)
       → Vercel Serverless → OpenRouter → Gemini
       ← результат ← клиенту
```

### Паттерн для видео (очередь)
```
Клиент → POST /api/generate-video {action: "submit"}
       → fal.ai queue submit → request_id

Клиент → POST /api/generate-video {action: "status", request_id}
       → fal.ai status → polling...

Клиент → POST /api/generate-video {action: "result", request_id}
       → fal.ai result → video URL
```

### Модели
- Изображения: `google/gemini-2.0-flash-exp:free` через OpenRouter
- Скрипты: `google/gemini-2.0-flash-exp:free` через OpenRouter
- Видео: `fal-ai/kling-video/v1.6/standard/text-to-video` через fal.ai
- Remix: `fal-ai/stable-video` через fal.ai
- Голос: Web Speech API (браузерный)

## Realtime
- Supabase Realtime channels для чата между брендом и креатором
- Подписка на таблицу `messages`

## Загрузка видео (iOS Safari)
- Создание `<video>` через `document.createElement` для обхода autoplay ограничений
- `#t=0.001` трик для iOS
- IntersectionObserver для ленивой загрузки
- Blob preload с shimmer-эффектом

## Анти-паттерны (текущие проблемы)
- Supabase anon key в открытом виде в HTML (это нормально для anon key, но нужен RLS)
- Нет системы сборки (CSS/JS не минифицирован)
- Нет переиспользуемых компонентов (всё inline в HTML)
- Старые версии лендинга (ugcgo-v2...v12) занимают место
- Ссылки в старых версиях ведут на несуществующий ugcgo-auth.html
- auth.html редирект на trycloudflare.com — нужно обновить на продакшн
