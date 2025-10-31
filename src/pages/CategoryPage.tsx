import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, type ResearchPaper } from '@/lib/supabase'
import { ChevronRight } from 'lucide-react'
import PaperCard from '@/components/PaperCard'

const ITEMS_PER_PAGE = 6

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>()
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : ''

  useEffect(() => {
    document.title = `${decodedCategory} - Ежедневный нейродайджест`
  }, [decodedCategory])

  useEffect(() => {
    if (!decodedCategory) return
    loadInitialPapers()
  }, [decodedCategory])

  const loadInitialPapers = async () => {
    setLoading(true)
    setPage(0)
    setPapers([])
    setHasMore(true)

    try {
      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .contains('tags', [decodedCategory])
        .order('publication_date', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1)

      if (error) throw error

      setPapers(data || [])
      setHasMore((data || []).length === ITEMS_PER_PAGE)
      setPage(1)
    } catch (error) {
      console.error('Error loading papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMorePapers = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const start = page * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .contains('tags', [decodedCategory])
        .order('publication_date', { ascending: false })
        .range(start, end)

      if (error) throw error

      if (data && data.length > 0) {
        setPapers(prev => [...prev, ...data])
        setHasMore(data.length === ITEMS_PER_PAGE)
        setPage(prev => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more papers:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [page, loadingMore, hasMore, decodedCategory])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePapers()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loadMorePapers])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
          <p className="font-ui text-text-secondary mt-4">Загрузка статей...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-background-surface border-b border-background-divider py-4">
        <div className="container max-w-grid">
          <nav className="font-ui text-sm text-text-tertiary flex items-center gap-2">
            <Link to="/" className="hover:text-accent-primary transition-colors">
              Главная
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-secondary">{decodedCategory}</span>
          </nav>
        </div>
      </section>

      {/* Category Header */}
      <section className="container max-w-grid py-3xl">
        <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-md">
          {decodedCategory}
        </h1>
        <p className="font-ui text-lg text-text-secondary">
          {papers.length > 0 ? `Найдено статей: ${papers.length}${hasMore ? '+' : ''}` : 'Статьи не найдены'}
        </p>
      </section>

      {/* Papers Grid */}
      {papers.length > 0 ? (
        <section className="container max-w-grid pb-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} variant="compact" />
            ))}
          </div>

          {/* Loading More Indicator */}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-3xl">
              {loadingMore && (
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
                  <p className="font-ui text-sm text-text-secondary mt-4">Загрузка...</p>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="container max-w-grid pb-4xl">
          <div className="text-center py-4xl">
            <p className="font-ui text-lg text-text-secondary mb-md">
              В этой категории пока нет статей
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              Вернуться на главную
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
