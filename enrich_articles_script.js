import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeAndEnrichArticles() {
  try {
    console.log('🔍 Анализируем статьи в базе данных...\n');

    // Получаем все статьи
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('id, title, title_ru, key_findings, key_findings_ru, publication_date')
      .order('publication_date', { ascending: false });

    if (error) {
      console.error('Ошибка при получении статей:', error);
      return;
    }

    console.log(`📊 Всего статей в базе: ${papers.length}\n`);

    // Анализируем ключевые выводы
    const needEnrichment = [];
    let totalFindings = 0;
    let articlesWithThreeOrMore = 0;

    papers.forEach(paper => {
      const keyFindings = paper.key_findings_ru || paper.key_findings || [];
      const findingsCount = keyFindings.length;
      totalFindings += findingsCount;

      if (findingsCount >= 3) {
        articlesWithThreeOrMore++;
      } else {
        needEnrichment.push({
          id: paper.id,
          title: paper.title_ru || paper.title,
          currentFindings: findingsCount,
          missingFindings: 3 - findingsCount,
          publication_date: paper.publication_date
        });
      }
    });

    // Статистика
    const averageFindings = totalFindings / papers.length;
    const percentageNeedingEnrichment = (needEnrichment.length / papers.length * 100).toFixed(1);

    console.log('📈 СТАТИСТИКА:');
    console.log(`├─ Среднее количество выводов: ${averageFindings.toFixed(1)}`);
    console.log(`├─ Статей с ≥3 выводами: ${articlesWithThreeOrMore} (${(articlesWithThreeOrMore/papers.length*100).toFixed(1)}%)`);
    console.log(`└─ Статей требующих обогащения: ${needEnrichment.length} (${percentageNeedingEnrichment}%)\n`);

    // Группируем по недостающим выводам
    console.log('🎯 СТАТЬИ ТРЕБУЮЩИЕ ОБОГАЩЕНИЯ:');
    
    const groupedByMissing = needEnrichment.reduce((acc, article) => {
      const key = article.missingFindings;
      if (!acc[key]) acc[key] = [];
      acc[key].push(article);
      return acc;
    }, {});

    Object.keys(groupedByMissing).forEach(missingCount => {
      const articles = groupedByMissing[missingCount];
      console.log(`\n📝 Нужно добавить ${missingCount} ${missingCount === '1' ? 'вывод' : missingCount === '2' ? 'вывода' : 'выводов'} (${articles.length} статей):`);
      
      articles.slice(0, 5).forEach((article, index) => {
        const title = article.title.length > 80 ? 
          article.title.substring(0, 80) + '...' : 
          article.title;
        console.log(`  ${index + 1}. [${article.currentFindings} → 3] ${title}`);
      });
      
      if (articles.length > 5) {
        console.log(`  ... и ещё ${articles.length - 5} статей`);
      }
    });

    // Возвращаем данные для дальнейшего использования
    return {
      totalArticles: papers.length,
      articlesNeedingEnrichment: needEnrichment,
      statistics: {
        averageFindings,
        articlesWithThreeOrMore,
        percentageNeedingEnrichment
      }
    };

  } catch (error) {
    console.error('Ошибка при анализе:', error);
  }
}

// Функция для обогащения статей через OpenAI
async function enrichArticleWithAI(articleId, currentFindings, missingCount, openaiApiKey) {
  if (!openaiApiKey) {
    console.log('⚠️ OpenAI API ключ не предоставлен, пропускаем обогащение');
    return null;
  }

  try {
    // Получаем полную информацию о статье
    const { data: paper, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error) throw error;

    console.log(`🤖 Обогащаем статью: ${paper.title_ru || paper.title}`);

    // Вызываем Edge Function для обогащения
    const { data, error: functionError } = await supabase.functions.invoke('enhance-papers', {
      body: { 
        papers: [paper],
        openai_api_key: openaiApiKey,
        task: 'enrich_key_findings',
        required_findings: 3
      }
    });

    if (functionError) throw functionError;

    if (data && data.enhanced && data.enhanced.length > 0) {
      const enhanced = data.enhanced[0];
      
      // Обновляем статью в базе
      const { error: updateError } = await supabase
        .from('research_papers')
        .update({
          key_findings_ru: enhanced.key_findings_ru || enhanced.key_findings,
          key_findings: enhanced.key_findings
        })
        .eq('id', articleId);

      if (updateError) throw updateError;

      console.log(`✅ Статья обогащена: ${enhanced.key_findings_ru?.length || enhanced.key_findings?.length} выводов`);
      return enhanced;
    }

  } catch (error) {
    console.error(`❌ Ошибка при обогащении статьи ${articleId}:`, error);
    return null;
  }
}

// Основная функция
async function main() {
  console.log('🚀 ЗАПУСК АНАЛИЗА И ОБОГАЩЕНИЯ СТАТЕЙ\n');
  
  const analysis = await analyzeAndEnrichArticles();
  
  if (!analysis) return;

  console.log('\n📋 ПЛАН ДЕЙСТВИЙ:');
  console.log(`1. Проанализировано ${analysis.totalArticles} статей`);
  console.log(`2. Найдено ${analysis.articlesNeedingEnrichment.length} статей для обогащения`);
  console.log(`3. Для запуска AI обогащения требуется OpenAI API ключ`);
  
  console.log('\n⏳ Ожидание OpenAI API ключа для продолжения...');
}

// Экспортируем функции для использования
export { analyzeAndEnrichArticles, enrichArticleWithAI, main };

// Запускаем анализ
main().catch(console.error);