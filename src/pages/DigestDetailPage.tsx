import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, type DigestWithPapers, type ResearchPaper } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

export default function DigestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [digest, setDigest] = useState<DigestWithPapers | null>(null)
  const [prevDigestId, setPrevDigestId] = useState<number | null>(null)
  const [nextDigestId, setNextDigestId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Дайджест - Ежедневный нейродайджест'
  }, [])

  useEffect(() => {
    if (!id) return
    fetchDigest(parseInt(id))
  }, [id])

  async function fetchDigest(digestId: number) {
    setLoading(true)
    try {
      // Fetch digest
      const { data: digestData, error: digestError } = await supabase
        .from('daily_digests')
        .select('*')
        .eq('id', digestId)
        .maybeSingle()

      if (digestError) throw digestError
      if (!digestData) return

      // Fetch papers
      const { data: papersData, error: papersError } = await supabase
        .from('research_papers')
        .select('*')
        .eq('digest_id', digestId)
        .order('article_potential', { ascending: false })

      if (papersError) throw papersError

      setDigest({
        ...digestData,
        papers: papersData as ResearchPaper[]
      })

      // Fetch prev/next digest IDs
      const { data: allDigests } = await supabase
        .from('daily_digests')
        .select('id, digest_date')
        .order('digest_date', { ascending: false })

      if (allDigests) {
        const currentIndex = allDigests.findIndex(d => d.id === digestId)
        if (currentIndex > 0) {
          setNextDigestId(allDigests[currentIndex - 1].id)
        }
        if (currentIndex < allDigests.length - 1) {
          setPrevDigestId(allDigests[currentIndex + 1].id)
        }
      }
    } catch (error) {
      console.error('Error fetching digest:', error)
    } finally {
      setLoading(false)
    }
  }

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
          Дайджест не найден
        </h1>
        <Link to="/archive" className="btn-primary">
          Вернуться в архив
        </Link>
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
      {/* Hero */}
      <section className="bg-background-surface border-b border-background-divider py-2xl">
        <div className="container max-w-reading text-center">
          <p className="font-ui text-metadata text-text-tertiary uppercase tracking-wide mb-4">
            {formattedDate}
          </p>
          <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary">
            Выпуск №{digest.id}
          </h1>
        </div>
      </section>

      {/* Table of Contents */}
      {digest.papers.length > 0 && (
        <section className="container max-w-reading py-2xl">
          <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-lg">
            Содержание
          </h2>
          <ol className="space-y-2">
            {digest.papers.map((paper, index) => (
              <li key={paper.id}>
                <a 
                  href={`#paper-${paper.id}`}
                  className="font-ui text-text-secondary hover:text-accent-primary transition-colors"
                >
                  {index + 1}. {paper.title}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Trends Summary */}
      {digest.trends_summary && (
        <section className="container max-w-reading py-3xl border-t border-background-divider">
          <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-lg">
            Общая сводка
          </h2>
          <div className="drop-cap font-body text-body-mobile md:text-body text-text-primary">
            {digest.trends_summary}
          </div>
        </section>
      )}

      {/* Research Papers */}
      {digest.papers.map((paper, index) => (
        <PaperSection key={paper.id} paper={paper} index={index} />
      ))}

      {/* Navigation */}
      <section className="container max-w-reading py-3xl border-t border-background-divider">
        <div className="flex items-center justify-between">
          {prevDigestId ? (
            <Link 
              to={`/digest/${prevDigestId}`}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Предыдущий
            </Link>
          ) : (
            <div className="opacity-0 pointer-events-none">
              <div className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Предыдущий
              </div>
            </div>
          )}

          <Link to="/archive" className="btn-primary">
            Все дайджесты
          </Link>

          {nextDigestId ? (
            <Link 
              to={`/digest/${nextDigestId}`}
              className="btn-secondary flex items-center gap-2"
            >
              Следующий
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="opacity-0 pointer-events-none">
              <div className="btn-secondary flex items-center gap-2">
                Следующий
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function PaperSection({ paper, index }: { paper: ResearchPaper; index: number }) {
  const keyFinding = paper.key_findings && paper.key_findings.length > 0 
    ? paper.key_findings[0] 
    : null

  return (
    <section 
      id={`paper-${paper.id}`}
      className="container max-w-reading py-3xl border-t border-background-divider scroll-mt-24"
    >
      {/* Status Badge */}
      {paper.status && (
        <div className="mb-4">
          <span className={paper.status === 'peer-reviewed' ? 'badge-peer-reviewed' : 'badge-preprint'}>
            {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
          </span>
        </div>
      )}

      {/* Title */}
      <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
        {index + 1}. {paper.title}
      </h2>

      {/* Authors & Source */}
      <p className="font-ui text-metadata text-text-secondary mb-lg">
        {paper.authors && <span>{paper.authors}</span>}
        {paper.authors && paper.source && <span> | </span>}
        {paper.source && <span>Источник: {paper.source}</span>}
        {paper.doi && (
          <a 
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-2 text-accent-primary hover:text-accent-hover"
          >
            DOI <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </p>

      {/* Abstract */}
      {paper.abstract && (
        <div className="font-body text-body-mobile md:text-body text-text-primary mb-xl leading-relaxed">
          {paper.abstract}
        </div>
      )}

      {/* Pull Quote (Key Finding) */}
      {keyFinding && (
        <blockquote className="pull-quote">
          {keyFinding}
        </blockquote>
      )}

      {/* Key Findings List */}
      {paper.key_findings && paper.key_findings.length > 1 && (
        <div className="mb-xl">
          <h3 className="font-display text-subhead font-semibold text-text-primary mb-4">
            Ключевые выводы
          </h3>
          <ul className="editorial-list list-disc list-inside space-y-3 font-body text-body-mobile md:text-body text-text-primary">
            {paper.key_findings.map((finding, i) => (
              <li key={i}>{finding}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Significance */}
      {paper.significance && (
        <div className="mb-xl">
          <h3 className="font-display text-subhead font-semibold text-text-primary mb-4">
            Значимость
          </h3>
          <p className="font-body text-body-mobile md:text-body text-text-primary leading-relaxed">
            {paper.significance}
          </p>
        </div>
      )}

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-lg">
          {paper.tags.map((tag) => (
            <Link 
              key={tag} 
              to={`/category/${encodeURIComponent(tag)}`}
              className="tag-chip"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
