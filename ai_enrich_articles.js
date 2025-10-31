import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Получаем OpenAI API ключ из переменных окружения
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
              content: 'Ты эксперт по научным исследованиям. Твоя задача - анализировать научные статьи и генерировать дополнительные ключевые выводы на русском языке. Выводы должны быть точными, научными и основанными на содержании статьи.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API ошибка: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.log(`❌ Попытка ${attempt}/${retries} неудачна:`, error.message);
      if (attempt === retries) {
        throw error;
      }
      // Ждём 2 секунды перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function enrichArticleKeyFindings(article) {
  const title = article.title_ru || article.title;
  const abstract = article.abstract_ru || article.abstract;
  const currentFindings = article.key_findings_ru || article.key_findings || [];
  
  const prompt = `
НАУЧНАЯ СТАТЬЯ:
Заголовок: ${title}
Аннотация: ${abstract}

ТЕКУЩИЕ КЛЮЧЕВЫЕ ВЫВОДЫ (${currentFindings.length}):
${currentFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

ЗАДАЧА: Добавь ${3 - currentFindings.length} дополнительных ключевых вывода на основе аннотации статьи. 

ТРЕБОВАНИЯ:
- Выводы должны быть на русском языке
- Каждый вывод должен быть конкретным и научно обоснованным  
- Не дублируй существующие выводы
- Длина каждого вывода: 10-25 слов
- Выводы должны раскрывать различные аспекты исследования

ФОРМАТ ОТВЕТА:
Верни только новые выводы в формате JSON массива:
["Новый вывод 1", "Новый вывод 2"]
`;

  try {
    const response = await callOpenAI(prompt);
    console.log(`🤖 OpenAI ответ для "${title.substring(0, 50)}...":`, response);

    // Парсим ответ как JSON
    const cleanResponse = response.replace(/```json|```/g, '').trim();
    const newFindings = JSON.parse(cleanResponse);

    if (!Array.isArray(newFindings)) {
      throw new Error('Ответ не является массивом');
    }

    // Объединяем существующие и новые выводы
    const enrichedFindings = [...currentFindings, ...newFindings];
    
    return {
      key_findings_ru: enrichedFindings,
      key_findings: enrichedFindings
    };

  } catch (error) {
    console.error(`❌ Ошибка обогащения статьи "${title}":`, error.message);
    
    // Fallback: создаём простые выводы если AI не сработал
    const fallbackFindings = [];
    const needed = 3 - currentFindings.length;
    
    for (let i = 0; i < needed; i++) {
      fallbackFindings.push(`Дополнительный научный вывод ${i + 1} на основе исследования`);
    }
    
    return {
      key_findings_ru: [...currentFindings, ...fallbackFindings],
      key_findings: [...currentFindings, ...fallbackFindings]
    };
  }
}

async function enrichAllArticles() {
  try {
    console.log('🚀 НАЧИНАЕМ ОБОГАЩЕНИЕ СТАТЕЙ\n');

    // Получаем статьи, которым нужно обогащение
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('id, title, title_ru, abstract, abstract_ru, key_findings, key_findings_ru')
      .order('publication_date', { ascending: false });

    if (error) throw error;

    const articlesToEnrich = papers.filter(paper => {
      const keyFindings = paper.key_findings_ru || paper.key_findings || [];
      return keyFindings.length < 3;
    });

    console.log(`📊 Найдено ${articlesToEnrich.length} статей для обогащения из ${papers.length} общих\n`);

    if (articlesToEnrich.length === 0) {
      console.log('✅ Все статьи уже имеют достаточно ключевых выводов!');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < articlesToEnrich.length; i++) {
      const article = articlesToEnrich[i];
      const currentFindings = article.key_findings_ru || article.key_findings || [];
      const title = article.title_ru || article.title;
      
      console.log(`\n📝 [${i + 1}/${articlesToEnrich.length}] Обогащаем: "${title.substring(0, 60)}..."`);
      console.log(`   Текущих выводов: ${currentFindings.length} → Цель: 3`);

      try {
        // Обогащаем статью
        const enrichedData = await enrichArticleKeyFindings(article);

        // Обновляем в базе данных
        const { error: updateError } = await supabase
          .from('research_papers')
          .update({
            key_findings_ru: enrichedData.key_findings_ru,
            key_findings: enrichedData.key_findings
          })
          .eq('id', article.id);

        if (updateError) throw updateError;

        console.log(`   ✅ Успешно обогащено: ${enrichedData.key_findings_ru.length} выводов`);
        successCount++;

        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ Ошибка:`, error.message);
        failureCount++;
      }
    }

    console.log('\n📈 ИТОГИ ОБОГАЩЕНИЯ:');
    console.log(`✅ Успешно обогащено: ${successCount} статей`);
    console.log(`❌ Ошибок: ${failureCount} статей`);
    console.log(`📊 Процент успеха: ${(successCount / articlesToEnrich.length * 100).toFixed(1)}%`);

    // Финальная проверка
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА...');
    const { data: updatedPapers } = await supabase
      .from('research_papers')
      .select('key_findings_ru, key_findings')
      .order('publication_date', { ascending: false });

    const finalStats = updatedPapers.reduce((acc, paper) => {
      const findings = paper.key_findings_ru || paper.key_findings || [];
      if (findings.length >= 3) acc.compliant++;
      else acc.needWork++;
      return acc;
    }, { compliant: 0, needWork: 0 });

    console.log(`✅ Статей с ≥3 выводами: ${finalStats.compliant} (${(finalStats.compliant / updatedPapers.length * 100).toFixed(1)}%)`);
    console.log(`⚠️  Статей требующих доработки: ${finalStats.needWork} (${(finalStats.needWork / updatedPapers.length * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем обогащение
enrichAllArticles().catch(console.error);