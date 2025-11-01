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
    <Link to={`/article/${paper.id}`} className="article-card block">
      {/* Status Badge */}
      {paper.status && (
        <div className="mb-4">
          <span className={paper.status === 'peer-reviewed' ? 'badge-peer-reviewed' : 'badge-preprint'}>
            {paper.status === 'peer-reviewed' ? 'Рецензируемая' : 'Препринт'}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className={`font-display font-semibold text-text-primary mb-3 ${
        variant === 'compact' ? 'text-lg' : 'text-subhead'
      }`}>
        {title}
      </h3>

      {/* Authors */}
      {paper.authors && (
        <p className="font-ui text-metadata text-text-secondary mb-4">
          {paper.authors}
        </p>
      )}

      {/* Abstract (truncated) */}
      {abstract && variant !== 'compact' && (
        <p className="font-body text-body text-text-primary mb-4 line-clamp-3">
          {abstract}
        </p>
      )}

      {/* Key Findings */}
      {keyFindings && keyFindings.length > 0 && (
        <div className="mb-4">
          <p className="font-ui text-sm font-semibold text-text-primary mb-2">
            Ключевые выводы:
          </p>
          <ul className="editorial-list list-disc list-inside space-y-1">
            {(showFullFindings ? keyFindings : keyFindings.slice(0, 2)).map((finding, index) => (
              <li key={index} className="font-body text-sm text-text-secondary">
                {finding}
              </li>
            ))}
            {!showFullFindings && keyFindings.length > 2 && (
              <li className="font-body text-sm text-text-tertiary italic">
                ...и ещё {keyFindings.length - 2} {keyFindings.length - 2 === 1 ? 'вывод' : 'выводов'}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex flex-wrap items-center gap-2 mt-lg pt-4 border-t border-background-divider">
        {/* Source with link */}
        {paper.source && (
          <span 
            className="font-ui text-metadata text-accent-primary hover:text-accent-hover transition-colors cursor-pointer"
            onClick={(e) => {
              if (paper.source_url) {
                e.preventDefault()
                window.open(paper.source_url, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            {paper.source}
          </span>
        )}
        
        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-auto">
            {paper.tags.slice(0, variant === 'compact' ? 1 : 3).map((tag) => (
              <Link
                key={tag}
                to={`/category/${encodeURIComponent(tag)}`}
                className="tag-chip"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            ))}
            {paper.tags.length > (variant === 'compact' ? 1 : 3) && (
              <span className="font-ui text-xs text-text-tertiary">
                +{paper.tags.length - (variant === 'compact' ? 1 : 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
