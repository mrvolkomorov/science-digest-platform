import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'ndgst-cookie-consent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [consentStatus, setConsentStatus] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем локальное хранилище
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    console.log('CookieBanner: Проверка localStorage, значение:', consent)
    setConsentStatus(consent)
    
    if (!consent) {
      // Показываем баннер только если согласие не дано
      setShowBanner(true)
      console.log('CookieBanner: Показываем баннер')
    } else {
      console.log('CookieBanner: Согласие уже дано, баннер не показывается')
    }
  }, [])

  const handleAccept = () => {
    console.log('CookieBanner: Принятие cookies')
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setShowBanner(false)
    setConsentStatus('accepted')
  }

  const handleReject = () => {
    console.log('CookieBanner: Отклонение cookies')
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setShowBanner(false)
    setConsentStatus('rejected')
  }

  const handleClose = () => {
    console.log('CookieBanner: Закрытие баннера')
    setShowBanner(false)
  }

  // Debug информация в development
  if (process.env.NODE_ENV === 'development') {
    console.log('CookieBanner: Текущее состояние - showBanner:', showBanner, 'consentStatus:', consentStatus)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-4 border-red-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Иконка и текст */}
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
              <Cookie className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Использование файлов cookie
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Мы используем файлы cookie для улучшения работы сайта и анализа посещаемости. 
                Cookies помогают нам предоставлять вам персонализированный контент и анализировать трафик.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Подробная информация о обработке данных представлена в нашей{' '}
                <a 
                  href="/privacy" 
                  className="text-red-600 hover:text-red-800 underline font-medium"
                  target="_blank"
                >
                  политике конфиденциальности
                </a>
              </p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-3 lg:flex-shrink-0 w-full lg:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 lg:flex-none px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
              title="Отклонить все cookies"
            >
              Отклонить
            </button>
            
            <button
              onClick={handleAccept}
              className="flex-1 lg:flex-none px-8 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg border border-red-600 transition-colors shadow-sm"
              title="Принять использование cookies"
            >
              Принять
            </button>
            
            <button
              onClick={handleClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              title="Закрыть уведомление"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}