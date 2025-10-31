import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 h-[72px] bg-background-primary border-b border-background-divider">
      <div className="container max-w-grid h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold text-text-primary">
          Ежедневный нейродайджест
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Главная
          </Link>
          <Link 
            to="/archive" 
            className={`nav-link ${isActive('/archive') ? 'active' : ''}`}
          >
            Архив
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          >
            <Search className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-background-primary border-b border-background-divider shadow-modal">
          <div className="container flex flex-col gap-4 py-6">
            <Link 
              to="/" 
              className={`nav-link text-lg ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/archive" 
              className={`nav-link text-lg ${isActive('/archive') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Архив
            </Link>
            <Link 
              to="/search" 
              className={`nav-link text-lg ${isActive('/search') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Поиск
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
