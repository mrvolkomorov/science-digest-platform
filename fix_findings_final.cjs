#!/usr/bin/env node

const https = require('https');

const SUPABASE_URL = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

// Паттерны для очистки
const BAD_PATTERNS = [
  'Дополнительный научный вывод',
  'Дополнительный вывод',
  'MYMEMORY WARNING',
  'Это исследование показывает',
  'Исследование демонстрирует',
  'Дополнительные научные выводы'
];

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'azlrxwfbgyednniyxuhe.supabase.co',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = responseData ? JSON.parse(responseData) : null;
            resolve(parsed);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
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

function cleanFindings(findingsArray) {
  if (!Array.isArray(findingsArray)) return [];
  
  return findingsArray.filter(finding => {
    if (!finding || typeof finding !== 'string') return false;
    
    const findingLower = finding.toLowerCase();
    
    // Проверяем на плохие паттерны
    const hasBadPattern = BAD_PATTERNS.some(pattern => 
      findingLower.includes(pattern.toLowerCase())
    );
    
    // Проверяем длину (должно быть минимум 20 символов)
    const isLongEnough = finding.trim().length >= 20;
    
    return !hasBadPattern && isLongEnough;
  });
}

async function fixAllFindings() {
  try {
    console.log('🛠️  ИСПРАВЛЕНИЕ КЛЮЧЕВЫХ ВЫВОДОВ\n');

    // Получаем все статьи с ключевыми выводами
    console.log('📊 Получаем статьи из базы данных...');
    const papersResponse = await makeRequest('/rest/v1/research_papers?select=id,title,abstract_ru,abstract,key_findings_ru,key_findings&order=id.desc');
    const papers = papersResponse || [];

    console.log(`✅ Найдено ${papers.length} статей для проверки\n`);

    let cleanedCount = 0;
    let totalRemoved = 0;

    for (const paper of papers) {
      const title = paper.title;
      const currentFindingsRu = paper.key_findings_ru || [];
      const currentFindingsEn = paper.key_findings || [];
      const abstract = paper.abstract_ru || paper.abstract;

      // Очищаем русские выводы
      const cleanedFindingsRu = cleanFindings(currentFindingsRu);
      // Очищаем английские выводы
      const cleanedFindingsEn = cleanFindings(currentFindingsEn);

      const removedRu = currentFindingsRu.length - cleanedFindingsRu.length;
      const removedEn = currentFindingsEn.length - cleanedFindingsEn.length;
      const totalRemovedForPaper = removedRu + removedEn;

      if (totalRemovedForPaper > 0) {
        console.log(`🔧 Очищаем: "${title.substring(0, 50)}..."`);
        console.log(`   Удалено плохих выводов: ${totalRemovedForPaper}`);
        console.log(`   Осталось (RU): ${cleanedFindingsRu.length}`);
        console.log(`   Осталось (EN): ${cleanedFindingsEn.length}`);
        
        // Если после очистки выводов стало меньше 3, попробуем добавить из аннотации
        let finalFindingsRu = [...cleanedFindingsRu];
        let finalFindingsEn = [...cleanedFindingsEn];

        if (finalFindingsRu.length < 3 && abstract && abstract.length > 50) {
          console.log(`   📝 Попытка добавить выводы из аннотации...`);
          
          // Простое извлечение выводов из аннотации
          const sentences = abstract.split(/[.!?]+/).filter(s => s.trim().length > 20);
          const relevantSentences = sentences.filter(sentence => {
            const lower = sentence.toLowerCase();
            return lower.includes('показал') || lower.includes('демонстрирует') || 
                   lower.includes('обнаружено') || lower.includes('выявлено') ||
                   lower.includes('результаты') || lower.includes('данные');
          });

          for (const sentence of relevantSentences) {
            if (finalFindingsRu.length >= 3) break;
            
            let finding = sentence.trim();
            if (finding.length > 200) {
              finding = finding.substring(0, 200).trim() + '...';
            }
            
            if (finding.length > 30) {
              finalFindingsRu.push(finding);
            }
          }
        }

        // Обновляем в базе данных
        try {
          await makeRequest(`/rest/v1/research_papers?id=eq.${paper.id}`, 'PATCH', {
            key_findings_ru: finalFindingsRu,
            key_findings: finalFindingsEn
          });
          
          console.log(`   ✅ Успешно обновлено`);
          cleanedCount++;
          totalRemoved += totalRemovedForPaper;
        } catch (error) {
          console.error(`   ❌ Ошибка обновления:`, error.message);
        }
        console.log('   ---');
      } else {
        console.log(`✅ "${title.substring(0, 50)}..." - выводы OK`);
      }
    }

    console.log('\n📈 ИТОГИ ОЧИСТКИ:');
    console.log(`🔧 Очищено статей: ${cleanedCount}`);
    console.log(`🗑️  Удалено плохих выводов: ${totalRemoved}`);
    console.log(`📊 Статей без изменений: ${papers.length - cleanedCount}`);

    // Финальная статистика
    console.log('\n🔍 ФИНАЛЬНАЯ СТАТИСТИКА...');
    const finalResponse = await makeRequest('/rest/v1/research_papers?select=key_findings_ru,key_findings');
    const finalPapers = finalResponse || [];

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
    console.log(`🔤 Общее количество выводов (RU): ${stats.ruTotal} (среднее: ${stats.total > 0 ? (stats.ruTotal / stats.total).toFixed(1) : 0})`);
    console.log(`🔤 Общее количество выводов (EN): ${stats.enTotal} (среднее: ${stats.total > 0 ? (stats.enTotal / stats.total).toFixed(1) : 0})`);
    console.log(`❌ Статей без выводов: ${stats.empty} (${stats.total > 0 ? (stats.empty / stats.total * 100).toFixed(1) : 0}%)`);
    console.log(`✅ Статей с выводами: ${stats.hasFindings} (${stats.total > 0 ? (stats.hasFindings / stats.total * 100).toFixed(1) : 0}%)`);

    console.log('\n🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!');
    console.log('🔄 Перезагрузите страницу сайта для просмотра результатов');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

fixAllFindings().catch(console.error);