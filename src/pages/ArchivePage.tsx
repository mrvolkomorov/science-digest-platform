import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type DailyDigest } from '@/lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 12

interface DigestWithCount extends DailyDigest {
  paperCount: number
  topTags: string[]
}

export default function ArchivePage() {
  const [digests, setDigests] = useState<DigestWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [topCategories, setTopCategories] = useState<Array<{ tag: string; count: number }>>([])

  useEffect(() => {
    document.title = 'Архив - Ежедневный нейродайджест'
    fetchDigests()
    fetchTopCategories()
  }, [])

  async function fetchDigests() {
    setLoading(true)
    try {
      // Fetch all digests
      const { data: digestsData, error: digestsError } = await supabase
        .from('daily_digests')
        .select('*')
        .order('digest_date', { ascending: false })

      if (digestsError) throw digestsError
      if (!digestsData) return

      // For each digest, fetch paper counts and tags
      const digestsWithInfo = await Promise.all(
        digestsData.map(async (digest) => {
          const { data: papers, count } = await supabase
            .from('research_papers')
            .select('tags', { count: 'exact' })
            .eq('digest_id', digest.id)

          // Get top tags for this digest
          const allTags = (papers || []).flatMap((paper: any) => paper.tags || [])
          const tagCounts = allTags.reduce((acc: Record<string, number>, tag) => {
            acc[tag] = (acc[tag] || 0) + 1
            return acc
          }, {})
          const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([tag]) => tag)

          return {
            ...digest,
            paperCount: count || 0,
            topTags
          }
        })
      )

      setDigests(digestsWithInfo)
    } catch (error) {
      console.error('Error fetching digests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTopCategories() {
    try {
      const { data } = await supabase
        .from('research_papers')
        .select('tags')

      if (!data) return

      // Count all tags
      const allTags = data.flatMap((paper: any) => paper.tags || [])
      const tagCounts = allTags.reduce((acc: Record<string, number>, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {})

      // Get top 10 categories
      const top = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setTopCategories(top)
    } catch (error) {
      console.error('Error fetching top categories:', error)
    }
  }

  const totalPages = Math.ceil(digests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const displayedDigests = digests.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="container max-w-grid py-3xl">
      {/* Page Header */}
      <header className="text-center mb-3xl">
        <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-md">
          Архив дайджестов
        </h1>
        <p className="font-ui text-lg text-text-secondary">
          Просмотрите предыдущие выпуски научных дайджестов
        </p>
      </header>

      {/* Popular Categories */}
      {topCategories.length > 0 && (
        <section className="mb-3xl">
          <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-lg text-center">
            Популярные категории
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {topCategories.map(({ tag, count }) => (
              <Link
                key={tag}
                to={`/category/${encodeURIComponent(tag)}`}
                className="filter-tab group"
              >
                {tag}
                <span className="ml-2 text-xs text-text-tertiary group-hover:text-accent-primary">
                  ({count})
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Digests Grid */}
      {loading ? (
        <div className="text-center py-4xl">
          <div className="animate-spin w-12 h-12 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
          <p className="font-ui text-text-secondary mt-4">Загрузка архива...</p>
        </div>
      ) : digests.length === 0 ? (
        <div className="text-center py-4xl">
          <p className="font-ui text-text-secondary text-lg">
            Дайджесты по выбранной тематике не найдены
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-2xl">
            {displayedDigests.map((digest) => (
              <DigestCard key={digest.id} digest={digest} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-background-divider rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-background-surface transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="font-ui text-text-primary">
                Страница {currentPage} из {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-background-divider rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-background-surface transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DigestCard({ digest }: { digest: DigestWithCount }) {
  const formattedDate = new Date(digest.digest_date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Link to={`/digest/${digest.id}`} className="article-card block">
      {/* Дата как подзаголовок */}
      <p className="font-ui text-sm text-accent-primary font-medium mb-3">
        📅 {formattedDate}
      </p>

      {/* Заголовок дайджеста */}
      {digest.trends_summary && (
        <h3 className="font-display text-lg md:text-xl font-semibold text-text-primary mb-4 line-clamp-2 hover:text-accent-primary transition-colors">
          {digest.trends_summary}
        </h3>
      )}

      {/* Paper Count */}
      <p className="font-ui text-sm text-text-secondary mb-4">
        {digest.paperCount} {digest.paperCount === 1 ? 'статья' : digest.paperCount < 5 ? 'статьи' : 'статей'}
      </p>

      {/* Top Tags */}
      {digest.topTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-lg pt-4 border-t border-background-divider">
          {digest.topTags.map((tag) => (
            <Link
              key={tag}
              to={`/category/${encodeURIComponent(tag)}`}
              className="tag-chip text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </Link>
  )
}
