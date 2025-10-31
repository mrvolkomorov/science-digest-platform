#!/usr/bin/env node

// Простой скрипт для очистки шаблонных выводов без внешних зависимостей
const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

// Паттерны шаблонных выводов для поиска
const TEMPLATE_PATTERNS = [
  'Дополнительный научный вывод',
  'Дополнительный вывод',
  'Scientific finding',
  'Это исследование показывает',
  'Исследование демонстрирует'
];

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function cleanTemplateFindings() {
  try {
    console.log('🧹 НАЧИНАЕМ ОЧИСТКУ ШАБЛОННЫХ ВЫВОДОВ\n');

    // Получаем все статьи с ключевыми выводами
    const papersResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/research_papers?select=id,title,title_ru,abstract,abstract_ru,key_findings,key_findings_ru&order=id.desc`);
    const papers = papersResponse.data || [];

    console.log(`📊 Найдено ${papers.length} статей для проверки\n`);

    let cleanedCount = 0;
    let removedFindingsCount = 0;

    for (const paper of papers) {
      const title = paper.title_ru || paper.title;
      const currentFindingsRu = paper.key_findings_ru || [];
      const currentFindings = paper.key_findings || [];

      // Ищем шаблонные выводы в русской версии
      const cleanedFindingsRu = currentFindingsRu.filter(finding => {
        const isTemplate = TEMPLATE_PATTERNS.some(pattern => 
          finding.toLowerCase().includes(pattern.toLowerCase())
        );
        return !isTemplate;
      });

      // Ищем шаблонные выводы в английской версии
      const cleanedFindings = currentFindings.filter(finding => {
        const isTemplate = TEMPLATE_PATTERNS.some(pattern => 
          finding.toLowerCase().includes(pattern.toLowerCase())
        );
        return !isTemplate;
      });

      // Если нашли и очистили шаблонные выводы
      if (cleanedFindingsRu.length !== currentFindingsRu.length || 
          cleanedFindings.length !== currentFindings.length) {
        
        const removedRu = currentFindingsRu.length - cleanedFindingsRu.length;
        const removedEn = currentFindings.length - cleanedFindings.length;
        const totalRemoved = removedRu + removedEn;
        
        console.log(`🔧 Очищаем: "${title.substring(0, 50)}..."`);
        console.log(`   Удалено шаблонных выводов: ${totalRemoved}`);
        console.log(`   Осталось выводов (RU): ${cleanedFindingsRu.length} → (EN): ${cleanedFindings.length}`);
        
        // Обновляем в базе
        try {
          const updateResponse = await makeRequest(
            `${SUPABASE_URL}/rest/v1/research_papers?id=eq.${paper.id}`,
            'PATCH',
            {
              key_findings_ru: cleanedFindingsRu,
              key_findings: cleanedFindings
            }
          );
          
          console.log(`   ✅ Успешно обновлено`);
          cleanedCount++;
          removedFindingsCount += totalRemoved;
        } catch (error) {
          console.error(`   ❌ Ошибка обновления:`, error.message);
        }
        console.log('   ---');
      }
    }

    console.log('\n📈 ИТОГИ ОЧИСТКИ:');
    console.log(`🔧 Очищено статей: ${cleanedCount}`);
    console.log(`🗑️  Удалено шаблонных выводов: ${removedFindingsCount}`);
    console.log(`📊 Статей без изменений: ${papers.length - cleanedCount}`);

    // Финальная статистика
    console.log('\n🔍 ФИНАЛЬНАЯ СТАТИСТИКА...');
    const finalResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/research_papers?select=key_findings_ru,key_findings`);
    const finalPapers = finalResponse.data || [];

    const stats = finalPapers.reduce((acc, paper) => {
      const findingsRu = paper.key_findings_ru || [];
      const findingsEn = paper.key_findings || [];
      acc.total++;
      acc.ruTotal += findingsRu.length;
      acc.enTotal += findingsEn.length;
      if (findingsRu.length === 0 && findingsEn.length === 0) acc.empty++;
      else if (findingsRu.length >= 1) acc.hasFindings++;
      return acc;
    }, { total: 0, ruTotal: 0, enTotal: 0, empty: 0, hasFindings: 0 });

    console.log(`📊 Всего статей: ${stats.total}`);
    console.log(`🔤 Общее количество выводов (RU): ${stats.ruTotal} (среднее: ${(stats.ruTotal / stats.total).toFixed(1)})`);
    console.log(`🔤 Общее количество выводов (EN): ${stats.enTotal} (среднее: ${(stats.enTotal / stats.total).toFixed(1)})`);
    console.log(`❌ Статей без выводов: ${stats.empty} (${(stats.empty / stats.total * 100).toFixed(1)}%)`);
    console.log(`✅ Статей с выводами: ${stats.hasFindings} (${(stats.hasFindings / stats.total * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем очистку
cleanTemplateFindings().catch(console.error);