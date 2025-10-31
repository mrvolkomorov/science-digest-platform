#!/usr/bin/env node

// Простая проверка базы данных
const https = require('https');

const SUPABASE_URL = 'https://azlrxwfbgyednniyxuhe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5MDg3OCwiZXhwIjoyMDc3NDY2ODc4fQ.T0tj0GY68cbLAt_iGRbRxQs_vr4lTKsACag9avKdIQs';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'azlrxwfbgyednniyxuhe.supabase.co',
      port: 443,
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData.substring(0, 500)}...`);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            console.log('Response is not JSON:', responseData);
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

    req.end();
  });
}

async function checkDatabase() {
  try {
    console.log('🔍 ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ\n');

    // Проверяем доступность таблицы research_papers
    console.log('📊 Получаем список статей...');
    const papersResponse = await makeRequest('/rest/v1/research_papers?select=count');
    
    console.log('Response:', JSON.stringify(papersResponse, null, 2));
    
    console.log('\n📄 Получаем первые 5 статей...');
    const firstPapersResponse = await makeRequest('/rest/v1/research_papers?select=id,title,key_findings_ru&limit=5');
    
    console.log('First papers:', JSON.stringify(firstPapersResponse, null, 2));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkDatabase().catch(console.error);