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
              content: 'Ты эксперт по научным исследованиям. Твоя задача - анализировать научные статьи и генерировать содержательные ключевые выводы на русском языке. Выводы должны быть точными, конкретными и научно обоснованными на основе содержания статьи.'
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

function extractKeyFindingsFromAbstract(abstract, currentFindings, neededCount) {
  // Если аннотации нет, возвращаем пустой массив
  if (!abstract || abstract.length < 50) {
    return [];
  }

  // Простая эвристика для извлечения выводов из аннотации
  // Ищем ключевые фразы, указывающие на выводы
  const conclusionPatterns = [
    /показал(и)?[а-я\s]*\b(что|является|представляет|имеет|позволяет|обеспечивает)\b/gi,
    /исследование[а-я\s]*\b(подтверждает|демонстрирует|указывает|показывает)\b/gi,
    /\b(обнаружено|выявлено|определено|установлено)\b[а-я\s]*/gi,
    /\b(результаты показывают|данные свидетельствуют)\b[а-я\s]*/gi
  ];

  const findings = [];
  const sentences = abstract.split(/[.!?]+/).filter(s => s.trim().length > 20);

  for (const pattern of conclusionPatterns) {
    for (const sentence of sentences) {
      const matches = sentence.match(pattern);
      if (matches && matches.length > 0) {
        // Очищаем предложение и ограничиваем длину
        let finding = sentence.trim();
        finding = finding.replace(/\s+/g, ' '); // Убираем лишние пробелы
        
        // Ограничиваем длину и убираем начальные фразы
        if (finding.length > 150) {
          finding = finding.substring(0, 150).trim() + '...';
        }
        
        // Убираем начальные неинформативные фразы
        finding = finding.replace(/^(Это исследование показывает|Данное исследование демонстрирует|The study shows)/i, '');
        finding = finding.replace(/^\s*,\s*/, '').trim();
        
        if (finding.length > 20) {
          findings.push(finding);
        }
        
        if (findings.length >= neededCount) {
          break;
        }
      }
    }
    if (findings.length >= neededCount) {
      break;
    }
  }

  return findings.slice(0, neededCount);
}

async function enrichArticleKeyFindings(article) {
  const title = article.title_ru || article.title;
  const abstract = article.abstract_ru || article.abstract;
  const currentFindings = article.key_findings_ru || article.key_findings || [];
  
  const neededCount = 3 - currentFindings.length;
  
  if (neededCount <= 0) {
    return null; // Уже достаточно выводов
  }

  console.log(`   Нужно добавить выводов: ${neededCount}`);

  // Сначала пробуем AI
  try {
    const prompt = `
НАУЧНАЯ СТАТЬЯ:
Заголовок: ${title}
Аннотация: ${abstract}

ТЕКУЩИЕ КЛЮЧЕВЫЕ ВЫВОДЫ (${currentFindings.length}):
${currentFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

ЗАДАЧА: Добавь ${neededCount} новых содержательных ключевых выводов на основе аннотации статьи. 

ТРЕБОВАНИЯ:
- Каждый вывод должен быть конкретным и научно обоснованным
- НЕ дублируй существующие выводы
- НЕ используй шаблонные фразы типа "Дополнительный научный вывод"
- Длина каждого вывода: 20-100 слов
- Выводы должны раскрывать различные аспекты исследования
- Основывайся ТОЛЬКО на информации из аннотации

ФОРМАТ ОТВЕТА:
Верни только новые выводы в формате JSON массива:
["Новый вывод 1", "Новый вывод 2"]
`;

    const response = await callOpenAI(prompt);
    console.log(`   🤖 OpenAI ответ:`, response.substring(0, 100) + '...');

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
    console.log(`   ⚠️  AI не сработал, используем fallback:`, error.message);
    
    // Fallback: извлекаем выводы из аннотации
    const extractedFindings = extractKeyFindingsFromAbstract(abstract, currentFindings, neededCount);
    
    if (extractedFindings.length > 0) {
      console.log(`   🔍 Извлечено из аннотации: ${extractedFindings.length} выводов`);
      return {
        key_findings_ru: [...currentFindings, ...extractedFindings],
        key_findings: [...currentFindings, ...extractedFindings]
      };
    } else {
      // Если ничего не извлекли, просто оставляем текущие выводы
      console.log(`   ⚠️  Fallback не дал результатов, оставляем как есть`);
      return {
        key_findings_ru: currentFindings,
        key_findings: currentFindings
      };
    }
  }
}

async function enrichAllArticles() {
  try {
    console.log('🚀 НАЧИНАЕМ ОБОГАЩЕНИЕ СТАТЕЙ (УЛУЧШЕННАЯ ВЕРСИЯ)\n');

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
    let noChangesCount = 0;
    let failureCount = 0;

    for (let i = 0; i < articlesToEnrich.length; i++) {
      const article = articlesToEnrich[i];
      const currentFindings = article.key_findings_ru || article.key_findings || [];
      const title = article.title_ru || article.title;
      
      console.log(`\n📝 [${i + 1}/${articlesToEnrich.length}] Обогащаем: "${title.substring(0, 60)}..."`);
      console.log(`   Текущих выводов: ${currentFindings.length}`);

      try {
        // Обогащаем статью
        const enrichedData = await enrichArticleKeyFindings(article);

        if (!enrichedData) {
          console.log(`   ✅ Уже достаточно выводов`);
          noChangesCount++;
          continue;
        }

        // Проверяем, есть ли реальные изменения
        const newFindingsCount = enrichedData.key_findings_ru.length;
        const oldFindingsCount = currentFindings.length;
        
        if (newFindingsCount === oldFindingsCount) {
          console.log(`   ⚠️  Нет изменений в количестве выводов`);
          noChangesCount++;
          continue;
        }

        // Обновляем в базе данных
        const { error: updateError } = await supabase
          .from('research_papers')
          .update({
            key_findings_ru: enrichedData.key_findings_ru,
            key_findings: enrichedData.key_findings
          })
          .eq('id', article.id);

        if (updateError) throw updateError;

        console.log(`   ✅ Успешно обогащено: ${oldFindingsCount} → ${newFindingsCount} выводов`);
        successCount++;

        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`   ❌ Ошибка:`, error.message);
        failureCount++;
      }
    }

    console.log('\n📈 ИТОГИ ОБОГАЩЕНИЯ:');
    console.log(`✅ Успешно обогащено: ${successCount} статей`);
    console.log(`⚠️  Без изменений: ${noChangesCount} статей`);
    console.log(`❌ Ошибок: ${failureCount} статей`);
    console.log(`📊 Процент успеха: ${successCount > 0 ? (successCount / articlesToEnrich.length * 100).toFixed(1) : 0}%`);

    // Финальная проверка
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА...');
    const { data: updatedPapers } = await supabase
      .from('research_papers')
      .select('key_findings_ru, key_findings')
      .order('publication_date', { ascending: false });

    const finalStats = updatedPapers.reduce((acc, paper) => {
      const findings = paper.key_findings_ru || [];
      acc.total++;
      if (findings.length >= 3) acc.compliant++;
      else if (findings.length > 0) acc.partial++;
      else acc.empty++;
      return acc;
    }, { total: 0, compliant: 0, partial: 0, empty: 0 });

    console.log(`✅ Статей с ≥3 выводами: ${finalStats.compliant} (${(finalStats.compliant / finalStats.total * 100).toFixed(1)}%)`);
    console.log(`⚠️  Статей с 1-2 выводами: ${finalStats.partial} (${(finalStats.partial / finalStats.total * 100).toFixed(1)}%)`);
    console.log(`❌ Статей без выводов: ${finalStats.empty} (${(finalStats.empty / finalStats.total * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем обогащение
enrichAllArticles().catch(console.error);