import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, Settings, RotateCcw } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'ndgst-cookie-consent'
const COOKIE_SETTINGS_KEY = 'ndgst-cookie-settings'

interface CookieSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export default function CookieTestPage() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Всегда обязательные
    analytics: false,
    marketing: false,
    preferences: false
  })
  const [showBanner, setShowBanner] = useState(false)
  const [consentHistory, setConsentHistory] = useState<any[]>([])

  useEffect(() => {
    // Загружаем настройки
    const savedSettings = localStorage.getItem(COOKIE_SETTINGS_KEY)
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Показываем баннер если нет согласия
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }

    // История согласий
    const history = localStorage.getItem(COOKIE_CONSENT_HISTORY_KEY)
    if (history) {
      setConsentHistory(JSON.parse(history))
    }
  }, [])

  const clearAllCookieData = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    localStorage.removeItem(COOKIE_SETTINGS_KEY)
    localStorage.removeItem(COOKIE_CONSENT_HISTORY_KEY)
    setShowBanner(true)
    alert('Все данные о cookies очищены. Баннер будет показан снова.')
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    
    saveConsent(allAccepted, 'accepted_all')
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    
    saveConsent(onlyNecessary, 'rejected_all')
    setShowBanner(false)
  }

  const handleSaveSettings = () => {
    saveConsent(settings, 'custom_settings')
    setShowBanner(false)
  }

  const saveConsent = (cookieSettings: CookieSettings, action: string) => {
    const consent = {
      settings: cookieSettings,
      action: action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    localStorage.setItem(COOKIE_CONSENT_KEY, action)
    localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(cookieSettings))
    
    // Сохраняем историю
    const history = localStorage.getItem(COOKIE_CONSENT_HISTORY_KEY)
    const historyArray = history ? JSON.parse(history) : []
    historyArray.push(consent)
    localStorage.setItem(COOKIE_CONSENT_HISTORY_KEY, JSON.stringify(historyArray))
    
    console.log('Сохранено согласие на cookies:', consent)
  }

  const updateSetting = (key: keyof CookieSettings, value: boolean) => {
    if (key === 'necessary') return // necessary всегда true
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Управление cookies</h1>
                <p className="text-gray-600">Тестовая страница для проверки работы cookie banner</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Настройки cookies</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h3 className="font-medium text-green-900">Необходимые cookies</h3>
                      <p className="text-sm text-green-700">Обязательные для работы сайта</p>
                    </div>
                    <div className="text-green-600">✓</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <h3 className="font-medium text-blue-900">Аналитические cookies</h3>
                      <p className="text-sm text-blue-700">Сбор статистики посещений</p>
                    </div>
                    <div className="text-blue-600">
                      {settings.analytics ? '✓' : '✗'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <h3 className="font-medium text-purple-900">Маркетинговые cookies</h3>
                      <p className="text-sm text-purple-700">Персонализация рекламы</p>
                    </div>
                    <div className="text-purple-600">
                      {settings.marketing ? '✓' : '✗'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <h3 className="font-medium text-orange-900">Cookies предпочтений</h3>
                      <p className="text-sm text-orange-700">Сохранение настроек пользователя</p>
                    </div>
                    <div className="text-orange-600">
                      {settings.preferences ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={clearAllCookieData}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Очистить все данные
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Навигация</h2>
                
                <div className="space-y-3">
                  <Link
                    to="/"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <span>← Вернуться на главную</span>
                  </Link>
                  
                  <Link
                    to="/privacy"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <span>📋 Политика конфиденциальности</span>
                  </Link>
                </div>

                {consentHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">История действий</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {consentHistory.slice(-5).map((entry, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-gray-500">
                            {new Date(entry.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-4 border-blue-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
              <Cookie className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Тестирование Cookie Banner
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Это тестовая страница для проверки работы cookie banner. 
                Настройте предпочтения и нажмите "Сохранить" или выберите "Принять все".
              </p>
              
              {!showAdvanced && (
                <button
                  onClick={() => setShowAdvanced(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  <Settings className="w-4 h-4" />
                  Настроить типы cookies
                </button>
              )}
              
              {showAdvanced && (
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Настройки cookies:</h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={settings.analytics}
                        onChange={(e) => updateSetting('analytics', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Аналитические cookies</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={settings.marketing}
                        onChange={(e) => updateSetting('marketing', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Маркетинговые cookies</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={settings.preferences}
                        onChange={(e) => updateSetting('preferences', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Cookies предпочтений</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={() => setShowAdvanced(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Скрыть настройки
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:flex-shrink-0 w-full lg:w-auto">
            <button
              onClick={handleRejectAll}
              className="flex-1 lg:flex-none px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
            >
              Отклонить все
            </button>
            
            {showAdvanced && (
              <button
                onClick={handleSaveSettings}
                className="flex-1 lg:flex-none px-6 py-3 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 transition-colors"
              >
                Сохранить настройки
              </button>
            )}
            
            <button
              onClick={handleAcceptAll}
              className="flex-1 lg:flex-none px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg border border-blue-600 transition-colors shadow-sm"
            >
              Принять все
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Ключ для истории согласий
const COOKIE_CONSENT_HISTORY_KEY = 'ndgst-cookie-consent-history'