import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { type ResearchPaper } from '@/lib/supabase'

interface PaperCardProps {
  paper: ResearchPaper
  variant?: 'default' | 'compact' | 'detailed'
  showFullFindings?: boolean
}

export default function PaperCard({
  paper,
  variant = 'default',
  showFullFindings = true
}: PaperCardProps) {
  const title = paper.title_ru || paper.title
  const abstract = paper.abstract_ru || paper.abstract
  const keyFindings = paper.key_findings_ru || paper.key_findings

  const handleSourceClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (paper.source_url) {
      window.open(paper.source_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Link to={`/article/${paper.id}`} className={`block rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 hover:no-underline ${variant === 'compact' ? 'p-3' : 'p-4'} bg-white dark:bg-gray-800`}>
      {/* Status Badge */}
      {paper.status && (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${paper.status === 'peer-reviewed' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20'}`}>
          {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
        </span>
      )}

      {/* Title */}
      <h3 className={`text-lg font-semibold mt-2 text-gray-900 dark:text-white ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}`}>{title}</h3>

      {/* Authors */}
      {paper.authors && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{paper.authors}</p>
      )}

      {/* Abstract (truncated) */}
      {abstract && variant !== 'compact' && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{abstract}</p>
      )}

      {/* Key Findings */}
      {keyFindings && keyFindings.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Ключевые выводы:</p>
          <ul className="mt-1 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-0.5">
            {(showFullFindings ? keyFindings : keyFindings.slice(0, 2)).map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
            {!showFullFindings && keyFindings.length > 2 && (
              <li>...и ещё {keyFindings.length - 2} {keyFindings.length - 2 === 1 ? 'вывод' : 'выводов'}</li>
            )}
          </ul>
        </div>
      )}

      {/* Original Source Button */}
      {paper.source_url && (
        <div className="mt-4">
          <button
            onClick={handleSourceClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20 rounded-md transition-colors ring-1 ring-blue-200 dark:ring-blue-400/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Читать оригинал
          </button>
        </div>
      )}

      {/* Metadata Footer */}
      <div className={`mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${variant === 'compact' ? 'flex-col sm:flex-row items-start sm:items-center' : ''}`}>
        {/* Source without link */}
        {paper.source && !paper.source_url && (
          <span>{paper.source}</span>
        )}

        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${variant === 'compact' ? 'mt-2 sm:mt-0' : ''}`}>
            {paper.tags.slice(0, variant === 'compact' ? 1 : 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600/20"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </span>
            ))}
            {paper.tags.length > (variant === 'compact' ? 1 : 3) && (
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600/20">
                +{paper.tags.length - (variant === 'compact' ? 1 : 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
