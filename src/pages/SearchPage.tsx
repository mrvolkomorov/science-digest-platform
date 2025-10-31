import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, type ResearchPaper } from '@/lib/supabase'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [topCategories, setTopCategories] = useState<Array<{ tag: string; count: number }>>([])

  useEffect(() => {
    document.title = 'Поиск - Ежедневный нейродайджест'
    fetchTopCategories()
  }, [])

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

      // Get top 8 categories
      const top = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      setTopCategories(top)
    } catch (error) {
      console.error('Error fetching top categories:', error)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setPapers([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      // Search in title, abstract, and significance
      const { data, error } = await supabase
        .from('research_papers')
        .select('*')
        .or(
          `title.ilike.%${searchQuery}%,title_ru.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,abstract_ru.ilike.%${searchQuery}%,significance.ilike.%${searchQuery}%,significance_ru.ilike.%${searchQuery}%`
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      setPapers(data || [])
    } catch (error) {
      console.error('Error searching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  function highlightText(text: string, query: string) {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-text-primary">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="container max-w-grid py-3xl">
      {/* Search Header */}
      <header className="max-w-reading mx-auto mb-3xl">
        <h1 className="font-display text-display-mobile md:text-display font-bold text-text-primary mb-lg text-center">
          Поиск статей
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-lg">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск по статьям..."
            className="input-field w-full pl-12"
          />
        </div>

        <button
          onClick={handleSearch}
          className="btn-primary w-full"
        >
          Найти
        </button>
      </header>

      {/* Popular Categories */}
      {topCategories.length > 0 && (
        <section className="mb-3xl">
          <h2 className="font-display text-headline-mobile md:text-headline font-semibold text-text-primary mb-lg text-center">
            Или выберите категорию
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

      {/* Results */}
      {loading ? (
        <div className="text-center py-4xl">
          <div className="animate-spin w-12 h-12 border-4 border-background-divider border-t-accent-primary rounded-full mx-auto"></div>
          <p className="font-ui text-text-secondary mt-4">Поиск...</p>
        </div>
      ) : hasSearched ? (
        papers.length === 0 ? (
          <div className="text-center py-4xl">
            <p className="font-ui text-text-secondary text-lg">
              Статьи не найдены. Попробуйте изменить запрос.
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            <p className="font-ui text-text-secondary text-center mb-2xl">
              Найдено: {papers.length} {papers.length === 1 ? 'статья' : papers.length < 5 ? 'статьи' : 'статей'}
            </p>
            
            {papers.map((paper) => (
              <SearchResultCard 
                key={paper.id} 
                paper={paper} 
                searchQuery={searchQuery}
                highlightText={highlightText}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-4xl">
          <p className="font-ui text-text-secondary text-lg mb-4">
            Введите поисковый запрос или выберите категорию выше
          </p>
        </div>
      )}
    </div>
  )
}

function SearchResultCard({ 
  paper, 
  searchQuery,
  highlightText 
}: { 
  paper: ResearchPaper
  searchQuery: string
  highlightText: (text: string, query: string) => React.ReactNode
}) {
  const title = paper.title_ru || paper.title
  const abstract = paper.abstract_ru || paper.abstract

  return (
    <article className="article-card">
      {/* Status Badge */}
      {paper.status && (
        <div className="mb-4">
          <span className={paper.status === 'peer-reviewed' ? 'badge-peer-reviewed' : 'badge-preprint'}>
            {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-display text-subhead font-semibold text-text-primary mb-3">
        {highlightText(title, searchQuery)}
      </h3>

      {/* Authors & Source */}
      {(paper.authors || paper.source) && (
        <p className="font-ui text-metadata text-text-secondary mb-4">
          {paper.authors && <span>{paper.authors}</span>}
          {paper.authors && paper.source && <span> | </span>}
          {paper.source && paper.source_url ? (
            <a 
              href={paper.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-hover"
            >
              {paper.source}
            </a>
          ) : paper.source && (
            <span>{paper.source}</span>
          )}
        </p>
      )}

      {/* Abstract */}
      {abstract && (
        <p className="font-body text-body text-text-primary mb-4 line-clamp-3">
          {highlightText(abstract, searchQuery)}
        </p>
      )}

      {/* Link to Article */}
      <Link 
        to={`/article/${paper.id}`}
        className="font-ui text-sm text-accent-primary hover:text-accent-hover inline-flex items-center gap-1 mt-4"
      >
        Читать статью →
      </Link>

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-lg pt-4 border-t border-background-divider">
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
    </article>
  )
}
