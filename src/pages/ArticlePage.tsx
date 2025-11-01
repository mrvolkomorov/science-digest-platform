import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, type ResearchPaper } from '@/lib/supabase'
import { ChevronLeft, ExternalLink, ChevronRight, Lightbulb, Star } from 'lucide-react'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paper, setPaper] = useState<ResearchPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [digestId, setDigestId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    fetchPaper(parseInt(id))
  }, [id])

  useEffect(() => {
    if (paper) {
      const title = paper.title_ru || paper.title
      document.title = `${title} - Ежедневный нейродайджест`
    }
  }, [paper])

  async function fetchPaper(paperId: number) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .eq('id', paperId)
        .maybeSingle()

      if (error) throw error
      if (!data) return

      setPaper(data)
      setDigestId(data.digest_id)
    } catch (error) {
      console.error('Error fetching paper:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
          <p className="font-ui text-text-secondary mt-4">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="container max-w-reading py-4xl text-center">
        <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-4">
          Статья не найдена
        </h1>
        <Link to="/" className="btn-primary">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  const title = paper.title_ru || paper.title
  const abstract = paper.abstract_ru || paper.abstract
  const keyFindings = paper.key_findings_ru || paper.key_findings
  const significance = paper.significance_ru || paper.significance

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-background-surface border-b border-background-divider py-4">
        <div className="container max-w-reading">
          <nav className="font-ui text-metadata text-text-tertiary flex items-center gap-2">
            <Link to="/" className="hover:text-accent-primary transition-colors">
              Главная
            </Link>
            <ChevronRight className="w-3 h-3" />
            {digestId && (
              <>
                <Link 
                  to={`/digest/${digestId}`}
                  className="hover:text-accent-primary transition-colors"
                >
                  Дайджест
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-text-secondary">Статья</span>
          </nav>
        </div>
      </section>

      {/* Article Content */}
      <article className="container max-w-reading py-xl">
        {/* Status Badge */}
        {paper.status && (
          <div className="mb-lg">
            <span className={paper.status === 'peer-reviewed' ? 'badge-peer-reviewed' : 'badge-preprint'}>
              {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-display text-headline-mobile md:text-headline font-bold text-text-primary mb-lg">
          {title}
        </h1>

        {/* Metadata */}
        <div className="space-y-3 mb-xl pb-lg border-b border-background-divider">
          {/* Authors */}
          {paper.authors && (
            <div>
              <span className="font-ui text-metadata font-semibold text-text-primary">Авторы: </span>
              <span className="font-ui text-metadata text-text-secondary">{paper.authors}</span>
            </div>
          )}

          {/* Source with link */}
          {paper.source && (
            <div>
              <span className="font-ui text-metadata font-semibold text-text-primary">Источник: </span>
              {paper.source_url ? (
                <a 
                  href={paper.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-metadata text-accent-primary hover:text-accent-hover inline-flex items-center gap-1"
                >
                  {paper.source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-ui text-metadata text-text-secondary">{paper.source}</span>
              )}
            </div>
          )}

          {/* Publication Date */}
          {paper.publication_date && (
            <div>
              <span className="font-ui text-metadata font-semibold text-text-primary">Дата публикации: </span>
              <span className="font-ui text-metadata text-text-secondary">
                {new Date(paper.publication_date).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Tags */}
          {paper.tags && paper.tags.length > 0 && (
            <div>
              <span className="font-ui text-metadata font-semibold text-text-primary mb-2 block">Категории:</span>
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}
        </div>

        {/* Abstract */}
        {abstract && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
              Аннотация
            </h2>
            <div className="font-body text-body-mobile md:text-body text-text-primary leading-relaxed">
              {abstract}
            </div>
          </section>
        )}

        {/* Key Findings */}
        {keyFindings && keyFindings.length > 0 && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
              Ключевые выводы
            </h2>
            <ul className="editorial-list list-disc list-inside space-y-2 font-body text-body-mobile md:text-body text-text-primary">
              {keyFindings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Significance */}
        {significance && significance !== 'Требуется анализ для определения значимости' && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
              Значимость исследования
            </h2>
            <div className="font-body text-body-mobile md:text-body text-text-primary leading-relaxed">
              {significance}
            </div>
          </section>
        )}

        {/* Rating */}
        {paper.rating && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
              Рейтинг
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Number(paper.rating)
                        ? 'fill-accent-primary text-accent-primary'
                        : 'text-background-divider'
                    }`}
                  />
                ))}
              </div>
              <span className="font-display text-lg font-semibold text-accent-primary">
                {paper.rating}/5
              </span>
            </div>
          </section>
        )}

        {/* Article Potential */}
        {paper.article_potential_ru && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-primary" />
              Потенциал для статьи
            </h2>
            <div className="bg-background-surface border-l-4 border-accent-primary p-lg rounded-r-lg">
              <div className="font-body text-body-mobile md:text-body text-text-primary leading-relaxed">
                {paper.article_potential_ru}
              </div>
            </div>
          </section>
        )}

        {/* Suggested Headlines */}
        {paper.suggested_headlines && paper.suggested_headlines.length > 0 && (
          <section className="mb-xl">
            <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-md">
              Возможные заголовки для статьи
            </h2>
            <div className="space-y-3">
              {paper.suggested_headlines.map((headline, i) => (
                <div
                  key={i}
                  className="bg-background-surface border border-background-divider p-md rounded-lg hover:border-accent-primary transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-primary text-background-primary font-ui text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="font-body text-body-mobile md:text-body text-text-primary flex-1">
                      {headline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-lg border-t border-background-divider">
          {paper.source_url ? (
            <a
              href={paper.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Читать оригинал
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-sm font-ui">
              Источник недоступен
              <ExternalLink className="w-4 h-4" />
            </div>
          )}
          {digestId ? (
            <Link 
              to={`/digest/${digestId}`}
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад к дайджесту
            </Link>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
