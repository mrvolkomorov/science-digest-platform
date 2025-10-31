import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Получаем OpenAI API ключ
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(prompt, retries = 3) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API ключ не найден в переменных окружения');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ты профессиональный переводчик научных текстов с английского на русский язык. Переводи точно, сохраняя научную терминологию и стиль. Не добавляй пояснений или комментариев, возвращай только переведённый текст.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API ошибка: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();

    } catch (error) {
      console.log(`❌ Попытка ${attempt}/${retries} неудачна:`, error.message);
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

function needsTranslation(text) {
  if (!text) return false;
  
  // Проверяем на ошибки MyMemory API
  if (text.includes('MYMEMORY WARNING')) return true;
  
  // Проверяем, является ли текст английским (упрощённая проверка)
  const englishPattern = /^[a-zA-Z0-9\s.,;:!?'"()\-\[\]{}\/\\]+$/;
  const hasEnglishWords = /\b(the|and|of|to|in|for|with|by|from|on|at|this|that|these|those|is|was|were|are|been|have|has|had|will|would|could|should|may|might|can|study|research|analysis|results|conclusion|findings|data|method|approach|patients|subjects|participants|significant|effect|increase|decrease|compared|control|group|treatment|intervention|baseline|outcome|clinical|trial|randomized|systematic|review|meta|analysis)\b/i;
  
  return englishPattern.test(text) && hasEnglishWords.test(text);
}

async function translateText(text, fieldName) {
  if (!needsTranslation(text)) {
    return text; // Уже переведено или не требует перевода
  }

  const prompt = `Переведи следующий научный текст с английского на русский язык:

${text}`;

  try {
    const translation = await callOpenAI(prompt);
    console.log(`  ✅ ${fieldName}: переведено`);
    return translation;
  } catch (error) {
    console.log(`  ❌ ${fieldName}: ошибка перевода - ${error.message}`);
    return text; // Возвращаем оригинал при ошибке
  }
}

async function fixTranslations() {
  try {
    console.log('🚀 НАЧИНАЕМ ИСПРАВЛЕНИЕ ПЕРЕВОДОВ\n');

    // Получаем все статьи
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('id, title, title_ru, abstract, abstract_ru, key_findings, key_findings_ru')
      .order('publication_date', { ascending: false });

    if (error) throw error;

    // Находим статьи с проблемами переводов
    const articlesToFix = papers.filter(paper => {
      return needsTranslation(paper.title_ru) || 
             needsTranslation(paper.abstract_ru) ||
             (paper.key_findings_ru && paper.key_findings_ru.some(finding => needsTranslation(finding)));
    });

    console.log(`📊 Найдено ${articlesToFix.length} статей с проблемами переводов из ${papers.length} общих\n`);

    if (articlesToFix.length === 0) {
      console.log('✅ Все переводы в порядке!');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < articlesToFix.length; i++) {
      const article = articlesToFix[i];
      const originalTitle = article.title_ru || article.title;
      
      console.log(`\n📝 [${i + 1}/${articlesToFix.length}] Исправляем: "${originalTitle.substring(0, 60)}..."`);

      try {
        const updates = {};

        // Переводим заголовок
        if (needsTranslation(article.title_ru)) {
          updates.title_ru = await translateText(article.title, 'заголовок');
        }

        // Переводим аннотацию
        if (needsTranslation(article.abstract_ru)) {
          updates.abstract_ru = await translateText(article.abstract, 'аннотация');
        }

        // Переводим ключевые выводы
        if (article.key_findings_ru && article.key_findings_ru.some(finding => needsTranslation(finding))) {
          const translatedFindings = [];
          for (let j = 0; j < article.key_findings_ru.length; j++) {
            const finding = article.key_findings_ru[j];
            if (needsTranslation(finding)) {
              const translated = await translateText(finding, `вывод ${j + 1}`);
              translatedFindings.push(translated);
            } else {
              translatedFindings.push(finding);
            }
          }
          updates.key_findings_ru = translatedFindings;
        }

        // Обновляем в базе данных, если есть изменения
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('research_papers')
            .update(updates)
            .eq('id', article.id);

          if (updateError) throw updateError;

          console.log(`  ✅ Статья успешно обновлена (${Object.keys(updates).length} полей)`);
          successCount++;
        } else {
          console.log(`  ℹ️  Статья не требует исправлений`);
          successCount++;
        }

        // Пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`  ❌ Ошибка:`, error.message);
        failureCount++;
      }
    }

    console.log('\n📈 ИТОГИ ИСПРАВЛЕНИЯ ПЕРЕВОДОВ:');
    console.log(`✅ Успешно исправлено: ${successCount} статей`);
    console.log(`❌ Ошибок: ${failureCount} статей`);
    console.log(`📊 Процент успеха: ${(successCount / articlesToFix.length * 100).toFixed(1)}%`);

    // Финальная проверка
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕВОДОВ...');
    const { data: updatedPapers } = await supabase
      .from('research_papers')
      .select('title_ru, abstract_ru, key_findings_ru')
      .order('publication_date', { ascending: false });

    const stillBroken = updatedPapers.filter(paper => {
      return needsTranslation(paper.title_ru) || 
             needsTranslation(paper.abstract_ru) ||
             (paper.key_findings_ru && paper.key_findings_ru.some(finding => needsTranslation(finding)));
    });

    console.log(`✅ Статей с корректными переводами: ${updatedPapers.length - stillBroken.length} (${((updatedPapers.length - stillBroken.length) / updatedPapers.length * 100).toFixed(1)}%)`);
    console.log(`⚠️  Статей с проблемами переводов: ${stillBroken.length} (${(stillBroken.length / updatedPapers.length * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем исправление переводов
fixTranslations().catch(console.error);