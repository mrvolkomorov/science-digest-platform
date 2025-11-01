export function Footer() {
  return (
    <footer className="border-t border-background-divider bg-background-surface mt-4xl">
      <div className="container max-w-grid py-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          {/* About */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
              О платформе
            </h3>
            <p className="font-ui text-sm text-text-secondary leading-relaxed">
              Ежедневный нейродайджест - платформа для автоматической публикации научных дайджестов 
              по психологии, нейронаукам, AI/ML и другим актуальным направлениям исследований.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
              Тематики
            </h3>
            <ul className="font-ui text-sm text-text-secondary space-y-2">
              <li>Психология</li>
              <li>Нейронауки</li>
              <li>AI/ML</li>
              <li>Поведенческая экономика</li>
              <li>Генетика</li>
              <li>Вычислительная психиатрия</li>
              <li>Социология</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
              Контакты
            </h3>
            <p className="font-ui text-sm text-text-secondary mb-3">
              Для вопросов и предложений свяжитесь с нами через форму обратной связи.
            </p>
            <a 
              href="/contact" 
              className="inline-block font-ui text-sm text-accent-primary hover:text-accent-hover transition-colors mb-2"
            >
              Написать нам →
            </a>
            <br />
            <a 
              href="/cookie-test" 
              className="inline-block font-ui text-xs text-text-tertiary hover:text-accent-primary transition-colors"
              title="Тестовая страница для проверки работы cookie banner"
            >
              🧪 Тест cookies
            </a>
          </div>
        </div>

        <div className="mt-xl pt-lg border-t border-background-divider">
          <p className="font-ui text-sm text-text-tertiary text-center">
            © {new Date().getFullYear()} Ежедневный нейродайджест. Все права защищены.<br />
            Права на сайт принадлежат <strong>Владимиру Волкоморову</strong> (<strong>mrvolkomorov</strong>)
          </p>
        </div>
      </div>
    </footer>
  )
}