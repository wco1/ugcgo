# Progress

## Что готово ✅
- [x] Лендинг (index.html) — hero, marquee, stats, features (6 AI-инструментов), видео, креаторы, pricing (3 плана), CTA, footer
- [x] 3 визуальные темы (light, dark, oakley) с CSS-переменными и переключателем
- [x] Страница авторизации (auth.html) — выбор роли (бренд/креатор), логин/регистрация через Supabase
- [x] Основная платформа (platform.html) — SPA-маркетплейс с навигацией showPage()
- [x] Дашборд бренда — Overview, Campaigns, Applications, Find Creators, Marketplace, Messages, Profile
- [x] Дашборд креатора — Overview, Browse Campaigns, My Applications, Portfolio, AI Studio, Messages, Profile
- [x] CRUD кампаний (создание через модалку, загрузка из Supabase)
- [x] Система заявок на кампании (подача через модалку, сохранение в Supabase)
- [x] AI Studio (studio.html) — 5 инструментов: Image, Script, Video, Voice, Remix
- [x] Серверные прокси для API-ключей (api/generate-image.js, generate-video.js, generate-script.js)
- [x] Supabase Auth — регистрация, логин, сессии, роли
- [x] Supabase Storage — загрузка аватаров, UGC-медиа, портфолио
- [x] Realtime чат (Supabase channels)
- [x] Адаптивная навигация (sidebar → нижняя на мобильных)
- [x] Демо-контент (фото, видео креаторов, бренды)
- [x] Vercel-конфигурация (vercel.json, serverless functions)
- [x] Git-репозиторий с .gitignore

## В процессе 🔧
- [ ] Деплой на Vercel (конфигурация готова, нужно подключить)
- [ ] Исправление редиректов (auth.html → trycloudflare.com)

## Что предстоит ❌
- [ ] Удалить устаревшие файлы: ugcgo-v2...v12.html, ugcgo-dashboard-full.html
- [ ] Перевод на фреймворк (Next.js / React) — опционально
- [ ] Портфолио креатора — полноценное сохранение работ в Supabase Storage
- [ ] Система уведомлений (in-app + email)
- [ ] Оплата / транзакции (Stripe?)
- [ ] Полноценный чат между брендом и креатором (UI + realtime)
- [ ] Аналитика и отчёты для брендов
- [ ] Email-уведомления (Supabase Edge Functions)
- [ ] Модерация контента
- [ ] SEO-оптимизация
- [ ] RLS-политики в Supabase для безопасности
- [ ] Минификация CSS/JS
