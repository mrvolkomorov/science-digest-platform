import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type DigestWithPapers, type ResearchPaper } from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'
import PaperCard from '@/components/PaperCard'

export default function HomePage() {
  const [digest, setDigest] = useState<DigestWithPapers | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Ежедневный нейродайджест'
    async function fetchLatestDigest() {
      try {
        // Fetch latest digest
        const { data: digestData, error: digestError } = await supabase
          .from('daily_digests')
          .select('*')
          .order('digest_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (digestError) throw digestError
        if (!digestData) return

        // Fetch papers for this digest
        const { data: papersData, error: papersError } = await supabase
          .from('research_papers')
          .select('*')
          .eq('digest_id', digestData.id)
          .order('article_potential', { ascending: false })

        if (papersError) throw papersError

        setDigest({
          ...digestData,
          papers: papersData as ResearchPaper[]
        })
      } catch (error) {
        console.error('Error fetching digest:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestDigest()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
          <p className="font-ui text-text-secondary mt-4">Загрузка дайджеста...</p>
        </div>
      </div>
    )
  }

  if (!digest) {
    return (
      <div className="container max-w-reading py-4xl text-center">
        <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-4">
          Дайджесты не найдены
        </h1>
        <p className="font-ui text-text-secondary">
          На данный момент дайджесты отсутствуют. Пожалуйста, проверьте позже.
        </p>
      </div>
    )
  }

  const formattedDate = new Date(digest.digest_date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-background-surface border-b border-background-divider py-2xl">
        <div className="container max-w-reading text-center">
          <p className="font-ui text-metadata text-text-tertiary uppercase tracking-wide mb-4">
            {formattedDate}
          </p>
          <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-md">
            Научный дайджест
          </h1>
          <p className="font-ui text-lg text-text-secondary">
            {digest.total_papers} статей за день
          </p>
        </div>
      </section>

      {/* Trends Summary */}
      {digest.trends_summary && (
        <section className="container max-w-reading py-3xl">
          <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-lg">
            Общая сводка
          </h2>
          <div className="drop-cap font-body text-body-mobile md:text-body text-text-primary">
            {digest.trends_summary}
          </div>
        </section>
      )}

      {/* Research Papers */}
      <section className="container max-w-grid py-3xl">
        <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-2xl text-center">
          Статьи дня
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {digest.papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} variant="detailed" />
          ))}
        </div>
      </section>

      {/* CTA to Archive */}
      <section className="bg-background-surface border-y border-background-divider py-4xl mt-4xl">
        <div className="container max-w-reading text-center">
          <h2 className="font-display text-headline-mobile md:text-headline font-bold text-text-primary mb-md">
            Изучите архив дайджестов
          </h2>
          <p className="font-ui text-lg text-text-secondary mb-2xl max-w-[540px] mx-auto">
            Просмотрите предыдущие выпуски, отфильтруйте по интересующим тематикам 
            и найдите самые значимые исследования
          </p>
          <Link to="/archive" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Перейти в архив
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-background-primary border-b border-background-divider py-4xl">
        <div className="container max-w-reading text-center">
          <h2 className="font-display text-headline-mobile md:text-headline font-bold text-text-primary mb-md">
            Остались вопросы?
          </h2>
          <p className="font-ui text-lg text-text-secondary mb-2xl max-w-[540px] mx-auto">
            Если у вас есть вопросы, предложения или обратная связь по нашему дайджесту, 
            мы будем рады с вами пообщаться
          </p>
          <Link to="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
            Написать нам
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  )
}
