# Project Brief — ugcgo.ai

## Что это
UGC-платформа (User Generated Content), соединяющая **бренды** и **UGC-креаторов** с упором на AI-генерацию контента (AI-креаторы).

## Домен
ugcgo.ai

## Целевая аудитория
1. **Бренды** — запускают UGC-кампании, ищут креаторов, управляют бюджетами
2. **Креаторы** — создают контент (в том числе с помощью AI), откликаются на кампании, монетизируют аудиторию

## Ключевые фичи
- **Маркетплейс кампаний** — бренды создают кампании, креаторы откликаются
- **AI Studio** — генерация фото (OpenRouter / Gemini), видео (fal.ai / Kling), скриптов, Voice (Web Speech API), Remix (image-to-video)
- **Дашборд бренда** — Overview, Campaigns, Applications, Find Creators, Marketplace, Messages, Profile
- **Дашборд креатора** — Overview, Browse Campaigns, My Applications, Portfolio, AI Studio, Messages, Profile
- **Аутентификация** — регистрация/логин по ролям через Supabase Auth
- **3 темы оформления** — light, dark, oakley (тёплая nude-палитра)
- **Pricing** — Starter $199, Growth $499, Scale $999

## GitHub
https://github.com/melodywco-byte/ugcgo.git (ветка: main)

## Supabase Project
- URL: https://vhcwsbeqphytmdjrsgvb.supabase.co
- Ref: vhcwsbeqphytmdjrsgvb

## Деплой
Vercel (serverless) — vercel.json с cleanUrls, security headers, кеш для статики
