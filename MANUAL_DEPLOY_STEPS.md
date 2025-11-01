# Финальные шаги настройки формы обратной связи

## Что уже сделано ✅

1. **Frontend полностью готов и задеплоен**
   - URL: https://3xcm333tueyh.space.minimax.io
   - Страница контактов: https://3xcm333tueyh.space.minimax.io/contact
   - Форма с полной валидацией и обработкой ошибок
   - Ссылка "Написать нам →" добавлена в футер

2. **Edge Function готова к деплою**
   - Файл: `supabase/functions/send-contact-email/index.ts`
   - Интеграция с Resend API
   - Отправка на vvolkomorov@yandex.ru
   - CORS настроен
   - Валидация данных

## Что нужно сделать (простой способ через Dashboard) 🔧

### Шаг 1: Откройте Supabase Dashboard
Перейдите на: https://supabase.com/dashboard/project/azlrxwfbgyednniyxuhe/functions

### Шаг 2: Создайте новую Edge Function
1. Нажмите "Create a new function"
2. Function name: `send-contact-email`
3. Скопируйте код ниже:

```typescript
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            throw new Error('Все поля обязательны для заполнения');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Некорректный формат email');
        }

        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('RESEND_API_KEY не настроен');
        }

        // Send email via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'noreply@resend.dev',
                to: 'vvolkomorov@yandex.ru',
                subject: `[Нейродайджест] ${subject}`,
                html: `
                    <h2>Новое сообщение с формы обратной связи</h2>
                    <p><strong>Имя:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Тема:</strong> ${subject}</p>
                    <p><strong>Сообщение:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `,
                reply_to: email
            }),
        });

        if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            console.error('Resend API error:', errorData);
            throw new Error(`Ошибка отправки email: ${errorData.message || 'Неизвестная ошибка'}`);
        }

        const emailData = await resendResponse.json();

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Сообщение успешно отправлено',
                emailId: emailData.id
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Contact form error:', error);

        const errorResponse = {
            error: {
                code: 'CONTACT_FORM_ERROR',
                message: error.message || 'Произошла ошибка при отправке сообщения'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
```

4. Нажмите "Deploy"

### Шаг 3: Настройте секрет RESEND_API_KEY
1. Перейдите в Settings → Edge Functions → Secrets
2. Добавьте новый секрет:
   - Name: `RESEND_API_KEY`
   - Value: `re_2yETijD1_P4NwjgV2BQXhJH3RibdmRypM`
3. Сохраните

### Шаг 4: Протестируйте форму
1. Откройте https://3xcm333tueyh.space.minimax.io/contact
2. Заполните все поля формы
3. Нажмите "Отправить сообщение"
4. Проверьте email vvolkomorov@yandex.ru

## Готово! 🎉

Форма обратной связи полностью функциональна и готова к использованию.

## Альтернативный способ (через CLI)

Если у вас есть Supabase CLI и access token:

```bash
# В директории проекта
export SUPABASE_ACCESS_TOKEN=your_token

# Запустите скрипт деплоя
./deploy-edge-function.sh
```
