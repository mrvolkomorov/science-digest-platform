import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, User, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.error) {
        throw new Error(data.error.message)
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      console.error('Contact form error:', err)
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения')
    }
  }

  return (
    <div className="min-h-screen bg-background-base">
      <div className="container max-w-grid py-3xl">
        {/* Header */}
        <div className="text-center mb-2xl">
          <h1 className="font-display text-5xl font-bold text-text-primary mb-lg">
            Свяжитесь с нами
          </h1>
          <p className="font-ui text-lg text-text-secondary max-w-2xl mx-auto">
            Есть вопросы, предложения или хотите обсудить сотрудничество? Мы будем рады вашему сообщению.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-background-surface rounded-lg shadow-sm border border-background-divider p-xl">
            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="flex items-center gap-2 font-ui text-sm font-medium text-text-primary mb-2">
                  <User className="w-4 h-4" />
                  Ваше имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 font-ui text-base border border-background-divider rounded-md bg-background-base text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                  placeholder="Введите ваше имя"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 font-ui text-sm font-medium text-text-primary mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 font-ui text-base border border-background-divider rounded-md bg-background-base text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="flex items-center gap-2 font-ui text-sm font-medium text-text-primary mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Тема сообщения
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 font-ui text-base border border-background-divider rounded-md bg-background-base text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                  placeholder="О чем вы хотите написать?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="flex items-center gap-2 font-ui text-sm font-medium text-text-primary mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 font-ui text-base border border-background-divider rounded-md bg-background-base text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all resize-y"
                  placeholder="Напишите ваше сообщение здесь..."
                />
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="font-ui text-sm text-green-800">
                    Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="font-ui text-sm text-red-800">
                    {errorMessage || 'Произошла ошибка при отправке сообщения. Попробуйте позже.'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-primary text-white font-ui font-medium rounded-md hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Отправить сообщение
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Contact Info */}
          <div className="mt-xl p-lg bg-background-surface rounded-lg border border-background-divider">
            <h3 className="font-display text-xl font-semibold text-text-primary mb-md">
              О платформе
            </h3>
            <p className="font-ui text-sm text-text-secondary leading-relaxed">
              Ежедневный нейродайджест - автоматическая платформа для публикации научных дайджестов 
              по психологии, нейронаукам, AI/ML и другим актуальным направлениям исследований. 
              Мы стремимся сделать науку доступной и понятной для широкой аудитории.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
