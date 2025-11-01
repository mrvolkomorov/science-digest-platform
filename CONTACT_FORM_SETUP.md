# Инструкция по завершению настройки формы обратной связи

## Текущий статус

### Выполнено ✅
1. **Edge Function создана**: `supabase/functions/send-contact-email/index.ts`
   - Интеграция с Resend API
   - Отправка писем на vvolkomorov@yandex.ru
   - Валидация входных данных
   - Обработка ошибок

2. **Frontend задеплоен**: https://3xcm333tueyh.space.minimax.io
   - Страница контактов: `/contact`
   - Форма с полями: имя, email, тема, сообщение
   - Валидация формы
   - Индикаторы статуса (загрузка, успех, ошибка)
   - Ссылка в футере: "Написать нам →"

3. **Скрипт деплоя подготовлен**: `deploy-edge-function.sh`

### Требуется для завершения ⚠️

**Деплой Edge Function в Supabase**

Вариант 1: Через batch_deploy_edge_functions (автоматический)
- Требуется: `supabase_access_token` и `supabase_project_id`
- Координатор должен вызвать `ask_for_supabase_auth`

Вариант 2: Через Supabase CLI (ручной)
```bash
# 1. Установить access token
export SUPABASE_ACCESS_TOKEN=your_token_here

# 2. Задеплоить функцию
cd /workspace/science-digest-platform
./deploy-edge-function.sh
```

Вариант 3: Через Supabase Dashboard (веб-интерфейс)
1. Перейти на https://supabase.com/dashboard/project/azlrxwfbgyednniyxuhe
2. Edge Functions → Create new function
3. Скопировать код из `supabase/functions/send-contact-email/index.ts`
4. Settings → Secrets → Add secret
   - Name: `RESEND_API_KEY`
   - Value: `re_2yETijD1_P4NwjgV2BQXhJH3RibdmRypM`

## После деплоя Edge Function

### Тестирование формы
1. Открыть https://3xcm333tueyh.space.minimax.io/contact
2. Заполнить форму:
   - Имя: Тестовое имя
   - Email: test@example.com
   - Тема: Тестовое сообщение
   - Сообщение: Проверка работы формы обратной связи
3. Нажать "Отправить сообщение"
4. Проверить:
   - Появилось зеленое уведомление об успехе
   - Письмо пришло на vvolkomorov@yandex.ru
   - В письме корректно отображаются все данные

### Возможные проблемы и решения

**Ошибка "RESEND_API_KEY не настроен"**
- Проверить, что секрет установлен в Supabase
- Перезапустить Edge Function после установки секрета

**Ошибка CORS**
- Edge Function уже настроена с правильными CORS headers
- Если проблема persist, проверить настройки проекта Supabase

**Email не приходит**
- Проверить spam/junk папку
- Проверить лог Edge Function в Supabase Dashboard
- Убедиться что Resend API key действителен

## Технические детали

- **Supabase Project**: azlrxwfbgyednniyxuhe
- **Edge Function**: send-contact-email
- **Email Provider**: Resend (API)
- **Recipient**: vvolkomorov@yandex.ru
- **From Address**: noreply@resend.dev (Resend default)
- **Frontend URL**: https://3xcm333tueyh.space.minimax.io
- **Contact Page**: https://3xcm333tueyh.space.minimax.io/contact
