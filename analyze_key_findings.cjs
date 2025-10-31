const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://azlrxwfbgyednniyxuhe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bHJ4d2ZiZ3llZG5uaXl4dWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTA4NzgsImV4cCI6MjA3NzQ2Njg3OH0.F1eH0gOuN0ntKiTx1QGQPP5JZJnKL5Th9GNhVlve3F8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeKeyFindings() {
  try {
    // Fetch a sample of papers to analyze key findings
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('id, title, key_findings, key_findings_ru')
      .limit(10)
      .order('id', { ascending: false })

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('=== АНАЛИЗ КЛЮЧЕВЫХ ВЫВОДОВ ===\n')
    
    papers.forEach((paper, index) => {
      console.log(`${index + 1}. Статья ID: ${paper.id}`)
      console.log(`   Заголовок: ${paper.title?.substring(0, 60)}...`)
      
      const keyFindings = paper.key_findings_ru || paper.key_findings
      if (keyFindings && Array.isArray(keyFindings)) {
        console.log(`   Ключевых выводов: ${keyFindings.length}`)
        keyFindings.forEach((finding, fIndex) => {
          console.log(`   ${fIndex + 1}: ${finding.substring(0, 80)}...`)
        })
      } else {
        console.log(`   Ключевых выводов: ОТСУТСТВУЮТ`)
      }
      console.log('   ---')
    })

    // Calculate statistics
    const stats = papers.reduce((acc, paper) => {
      const keyFindings = paper.key_findings_ru || paper.key_findings
      if (keyFindings && Array.isArray(keyFindings)) {
        acc.total += keyFindings.length
        acc.articles += 1
        if (keyFindings.length < 3) acc.needsMore += 1
        if (keyFindings.length >= 3) acc.hasEnough += 1
      } else {
        acc.empty += 1
      }
      return acc
    }, { total: 0, articles: 0, needsMore: 0, hasEnough: 0, empty: 0 })

    console.log('\n=== СТАТИСТИКА ===')
    console.log(`Всего статей: ${papers.length}`)
    console.log(`Статей с ключевыми выводами: ${stats.articles}`)
    console.log(`Статей без выводов: ${stats.empty}`)
    console.log(`Статей с <3 выводами: ${stats.needsMore}`)
    console.log(`Статей с ≥3 выводами: ${stats.hasEnough}`)
    console.log(`Среднее количество выводов: ${stats.articles > 0 ? (stats.total / stats.articles).toFixed(1) : 0}`)

  } catch (error) {
    console.error('Script error:', error)
  }
}

analyzeKeyFindings()