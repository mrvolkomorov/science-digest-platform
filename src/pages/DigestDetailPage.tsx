import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, type DigestWithPapers, type ResearchPaper } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

export default function DigestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [digest, setDigest] = useState(null)
  const [prevDigestId, setPrevDigestId] = useState(null)
  const [nextDigestId, setNextDigestId] = useState(null)
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
      <div className="min-h-screen bg-background-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
          <p className="font-ui text-text-secondary">Загрузка дайджеста...</p>
        </div>
      </div>
    )
  }

  if (!digest) {
    return (
      <div className="min-h-screen bg-background-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-text-primary mb-4">Дайджест не найден</h1>
          <Link 
            to="/archive"
            className="inline-block px-6 py-3 bg-accent-primary text-white rounded-lg font-ui hover:bg-accent-hover transition-colors"
          >
            Вернуться в архив
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(digest.digest_date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background-surface">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Ежедневный нейродайджест
          </h1>
          <p className="font-ui text-lg text-text-secondary mb-4">{formattedDate}</p>
          <h2 className="font-display text-2xl md:text-3xl text-accent-primary">
            Выпуск №{digest.id}
          </h2>
        </div>

        {/* Table of Contents */}
        {digest.papers.length > 0 && (
          <div className="mb-12">
            <h3 className="font-display text-xl text-text-primary mb-4">Содержание</h3>
            <ol className="font-ui text-text-secondary space-y-2">
              {digest.papers.map((paper, index) => (
                <li key={paper.id}>
                  <a 
                    href={`#paper-${paper.id}`}
                    className="text-accent-primary hover:text-accent-hover transition-colors"
                  >
                    {index + 1}. {paper.title_ru || paper.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Trends Summary */}
        {digest.trends_summary && (
          <div className="mb-12 p-6 bg-background-card rounded-lg border border-background-divider">
            <h3 className="font-display text-xl text-text-primary mb-4">Общая сводка</h3>
            <p className="font-ui text-text-secondary leading-relaxed whitespace-pre-line">
              {digest.trends_summary}
            </p>
          </div>
        )}

        {/* Research Papers */}
        <div className="space-y-12">
          {digest.papers.map((paper, index) => (
            <PaperSection key={paper.id} paper={paper} index={index} />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-background-divider">
          {prevDigestId ? (
            <Link 
              to={`/digest/${prevDigestId}`}
              className="flex items-center space-x-2 px-4 py-2 text-accent-primary hover:text-accent-hover transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-ui">Предыдущий</span>
            </Link>
          ) : (
            <div></div>
          )}

          <Link 
            to="/archive"
            className="px-6 py-3 bg-background-card text-text-primary rounded-lg border border-background-divider font-ui hover:bg-background-hover transition-colors"
          >
            Все дайджесты
          </Link>

          {nextDigestId ? (
            <Link 
              to={`/digest/${nextDigestId}`}
              className="flex items-center space-x-2 px-4 py-2 text-accent-primary hover:text-accent-hover transition-colors"
            >
              <span className="font-ui">Следующий</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaperSection({ paper, index }: { paper: ResearchPaper; index: number }) {
  // Используем русские переводы, если доступны
  const title = paper.title_ru || paper.title
  const abstract = paper.abstract_ru || paper.abstract
  const keyFindings = paper.key_findings_ru || paper.key_findings
  const significance = paper.significance_ru || paper.significance

  const keyFinding = keyFindings && keyFindings.length > 0
    ? keyFindings[0]
    : null

  return (
    <article id={`paper-${paper.id}`} className="bg-background-card rounded-lg p-8 border border-background-divider">
      {/* Status Badge */}
      {paper.status && (
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-xs font-ui rounded-full ${
            paper.status === 'peer-reviewed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-display text-2xl md:text-3xl text-text-primary mb-6">
        {index + 1}. {title}
      </h3>

      {/* Authors & Source */}
      <div className="flex flex-wrap items-center gap-4 mb-6 font-ui text-sm text-text-secondary">
        {paper.authors && (
          <span className="font-medium">
            <span className="text-text-tertiary">Авторы:</span> {paper.authors}
          </span>
        )}
        {paper.authors && paper.source && <span>•</span>}
        {paper.source && (
          <span>
            <span className="text-text-tertiary">Источник:</span> {paper.source}
          </span>
        )}
        {paper.doi && (
          <>
            {paper.source && <span>•</span>}
            <a 
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-accent-primary hover:text-accent-hover transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>DOI</span>
            </a>
          </>
        )}
      </div>

      {/* Abstract */}
      {abstract && (
        <div className="mb-6">
          <h4 className="font-display text-lg text-text-primary mb-3">Аннотация</h4>
          <p className="font-ui text-text-secondary leading-relaxed whitespace-pre-line">
            {abstract}
          </p>
        </div>
      )}

      {/* Pull Quote (Key Finding) */}
      {keyFinding && (
        <div className="mb-6">
          <blockquote className="border-l-4 border-accent-primary pl-4 py-2 bg-background-surface rounded-r">
            <p className="font-ui text-text-secondary italic">
              {keyFinding}
            </p>
          </blockquote>
        </div>
      )}

      {/* Key Findings List */}
      {keyFindings && keyFindings.length > 1 && (
        <div className="mb-6">
          <h4 className="font-display text-lg text-text-primary mb-3">Ключевые выводы</h4>
          <ul className="space-y-2">
            {keyFindings.map((finding, i) => (
              <li key={i} className="font-ui text-text-secondary flex items-start">
                <span className="text-accent-primary mr-2">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Significance */}
      {significance && (
        <div className="mb-6">
          <h4 className="font-display text-lg text-text-primary mb-3">Значимость</h4>
          <p className="font-ui text-text-secondary leading-relaxed whitespace-pre-line">
            {significance}
          </p>
        </div>
      )}

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {paper.tags.map((tag, i) => (
            <span 
              key={i}
              className="px-3 py-1 bg-accent-primary bg-opacity-10 text-accent-primary text-sm font-ui rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
