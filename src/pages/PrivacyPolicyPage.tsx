import { ArrowLeft, Shield, User, Cookie, Mail, FileText, BookOpen, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section]");
      const scrollPosition = window.scrollY + 150;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        const offsetTop = element.offsetTop;
        const offsetBottom = offsetTop + element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          setActiveSection(element.dataset.section || "");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-surface border-b border-divider">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-text-secondary hover:text-accent-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-surface border-b border-divider">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-accent-primary" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Политика конфиденциальности
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Настоящая политика конфиденциальности определяет порядок обработки персональных данных пользователей сайта ndgst.ru
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Дата последнего обновления: 01.11.2025
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Российская Федерация
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-surface rounded-xl border border-divider p-6">
                <h3 className="font-semibold text-text-primary mb-4">Содержание</h3>
                <nav className="space-y-2">
                  {[
                    { id: "general", title: "1. Общие положения", icon: BookOpen },
                    { id: "definitions", title: "2. Основные понятия", icon: User },
                    { id: "data-types", title: "3. Персональные данные", icon: FileText },
                    { id: "processing-purposes", title: "4. Цели обработки", icon: Shield },
                    { id: "legal-basis", title: "5. Правовые основания", icon: FileText },
                    { id: "processing-methods", title: "6. Способы обработки", icon: Cookie },
                    { id: "security", title: "7. Защита данных", icon: Shield },
                    { id: "user-rights", title: "8. Права субъекта", icon: User },
                    { id: "final", title: "9. Заключение", icon: Mail },
                  ].map(({ id, title, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${
                        activeSection === id
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-background"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* 1. Общие положения */}
            <section data-section="general" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">1. Общие положения</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>
                    1.1. Настоящая Политика конфиденциальности (далее — «Политика») разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» (далее — Закон «О персональных данных») и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных Администрацией сайта ndgst.ru (далее — «Сайт», «Администрация»).
                  </p>
                  <p>
                    1.2. Использование Сайта означает согласие субъекта персональных данных с настоящей Политикой и указанными в ней условиями обработки его персональных данных.
                  </p>
                  <p>
                    1.3. В случае несогласия с условиями Политики субъект персональных данных должен прекратить использование Сайта.
                  </p>
                  <p>
                    1.4. Настоящая Политика применяется только к Сайту ndgst.ru. Администрация не контролирует и не несет ответственность за сайты третьих лиц, на которые пользователь может перейти по ссылкам, доступным на Сайте.
                  </p>
                  <p>
                    1.5. Администрация не проверяет достоверность персональных данных, предоставляемых субъектом персональных данных.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Основные понятия */}
            <section data-section="definitions" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">2. Основные понятия, используемые в Политике</h2>
                <div className="space-y-3 text-text-secondary">
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Персональные данные:</span>
                    <span>любая информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу (субъекту персональных данных);</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Обработка персональных данных:</span>
                    <span>любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Автоматизированная обработка персональных данных:</span>
                    <span>обработка персональных данных с помощью средств вычислительной техники;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Блокирование персональных данных:</span>
                    <span>временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных);</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Обезличивание персональных данных:</span>
                    <span>действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному субъекту персональных данных;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Трансграничная передача персональных данных:</span>
                    <span>передача персональных данных на территорию иностранного государства иностранному лицу;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Субъект персональных данных:</span>
                    <span>физическое лицо, персональные данные которого обрабатываются;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-accent-primary min-w-[140px]">Администрация Сайта:</span>
                    <span>уполномоченные сотрудники на управление сайтом, действующие от имени Администрации, которые организуют и осуществляют обработку персональных данных, а также определяют состав и цели содержания персональных данных;</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Персональные данные */}
            <section data-section="data-types" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">3. Персональные данные, которые мы обрабатываем</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">3.1. Персональные данные, предоставляемые пользователями:</h3>
                    <ul className="space-y-2 text-text-secondary ml-4">
                      <li className="list-disc"> имя пользователя (при комментировании или регистрации);</li>
                      <li className="list-disc"> адрес электронной почты (при подписке на рассылку или регистрации);</li>
                      <li className="list-disc"> иная информация, добровольно предоставляемая пользователем через формы обратной связи.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">3.2. Персональные данные, автоматически собираемые при использовании Сайта:</h3>
                    <ul className="space-y-2 text-text-secondary ml-4">
                      <li className="list-disc"> IP-адрес пользователя;</li>
                      <li className="list-disc"> тип браузера и операционной системы;</li>
                      <li className="list-disc"> время и дата посещения Сайта;</li>
                      <li className="list-disc"> просматриваемые страницы и разделы Сайта;</li>
                      <li className="list-disc"> время, проведенное на Сайте;</li>
                      <li className="list-disc"> реферер (адрес предыдущей страницы);</li>
                      <li className="list-disc"> файлы cookie и аналогичные технологии.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">3.3. Файлы cookie и аналогичные технологии:</h3>
                    <p className="text-text-secondary mb-3">
                      Мы используем файлы cookie и аналогичные технологии для:
                    </p>
                    <ul className="space-y-2 text-text-secondary ml-4">
                      <li className="list-disc"> обеспечения работы Сайта и его функциональности;</li>
                      <li className="list-disc"> анализа использования Сайта и улучшения пользовательского опыта;</li>
                      <li className="list-disc"> запоминания предпочтений пользователя;</li>
                      <li className="list-disc"> предоставления персонализированного контента и рекламы;</li>
                      <li className="list-disc"> измерения эффективности рекламных кампаний.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Цели обработки */}
            <section data-section="processing-purposes" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">4. Цели обработки персональных данных</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>Персональные данные обрабатываются Администрацией в следующих целях:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="list-disc"> предоставление пользователю доступа к персонализированным функциям Сайта;</li>
                    <li className="list-disc"> обеспечение работы Сайта и его отдельных функций;</li>
                    <li className="list-disc"> анализ использования Сайта и улучшение его работы;</li>
                    <li className="list-disc"> отправка уведомлений о новых публикациях (при наличии согласия);</li>
                    <li className="list-disc"> ответы на обращения и запросы пользователей;</li>
                    <li className="list-disc"> обеспечение безопасности и предотвращение мошенничества;</li>
                    <li className="list-disc"> соблюдение требований российского законодательства;</li>
                    <li className="list-disc"> защита прав и интересов Администрации и пользователей.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Правовые основания */}
            <section data-section="legal-basis" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">5. Правовые основания обработки персональных данных</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>Обработка персональных данных осуществляется Администрацией на основании следующих правовых оснований:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="list-disc"> <strong>часть 1 пункта 1 статьи 6</strong> Закона «О персональных данных»: согласие субъекта персональных данных;</li>
                    <li className="list-disc"> <strong>часть 1 пункта 3 статьи 6</strong> Закона «О персональных данных»: обработка необходима для выполнения договора, стороной которого либо выгодоприобретателем или поручителем по которому является субъект персональных данных, а также для заключения договора по инициативе субъекта персональных данных;</li>
                    <li className="list-disc"> <strong>часть 1 пункта 5 статьи 6</strong> Закона «О персональных данных»: обработка персональных данных осуществляется в статистических или иных исследовательческих целях, при условии обязательного обезличивания персональных данных;</li>
                    <li className="list-disc"> <strong>часть 2 статьи 6</strong> Закона «О персональных данных»: обработка персональных данных осуществляется в рамках реализации межведомственных проектов.</li>
                  </ul>
                  <p>
                    Обработка файлов cookie и данных о посещениях осуществляется на основании согласия пользователя, выражаемого в использовании Сайта.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Способы обработки */}
            <section data-section="processing-methods" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">6. Способы, сроки обработки и хранения персональных данных</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">6.1. Способы обработки персональных данных:</h3>
                    <ul className="space-y-2 text-text-secondary ml-4">
                      <li className="list-disc"> сбор, систематизация, накопление;</li>
                      <li className="list-disc"> хранение, уточнение (обновление, изменение);</li>
                      <li className="list-disc"> извлечение, использование, передача (распространение, предоставление, доступ);</li>
                      <li className="list-disc"> обезличивание, блокирование, удаление, уничтожение;</li>
                      <li className="list-disc"> автоматизированная и смешанная обработка персональных данных.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">6.2. Сроки обработки и хранения:</h3>
                    <ul className="space-y-2 text-text-secondary ml-4">
                      <li className="list-disc"> <strong>персональные данные пользователей</strong>: в течение срока, необходимого для достижения целей обработки, но не более 3 лет с момента последней активности пользователя;</li>
                      <li className="list-disc"> <strong>данные для аналитики</strong>: в обезличенном виде в течение неограниченного срока;</li>
                      <li className="list-disc"> <strong>технические логи</strong>: в течение 1 года;</li>
                      <li className="list-disc"> <strong>файлы cookie</strong>: в соответствии с настройками браузера пользователя (обычно от сессии до 1 года).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">6.3. Лица, имеющие доступ к персональным данным:</h3>
                    <p className="text-text-secondary mb-3">
                      К персональным данным имеют доступ только уполномоченные сотрудники Администрации, связанные обязательствами соблюдения конфиденциальности и получившие необходимый уровень доступа для выполнения своих должностных обязанностей.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Защита данных */}
            <section data-section="security" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">7. Меры по защите персональных данных</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>Администрация применяет следующие меры по защите персональных данных:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="list-disc"> <strong>технические меры</strong>: использование безопасных протоколов передачи данных (HTTPS), регулярное обновление программного обеспечения, мониторинг безопасности;</li>
                    <li className="list-disc"> <strong>организационные меры</strong>: ограничение доступа к персональным данных, обучение персонала правилам работы с персональными данными;</li>
                    <li className="list-disc"> <strong>правовые меры</strong>: заключение договоров о неразглашении персональных данных с третьими лицами;</li>
                    <li className="list-disc"> <strong>физические меры</strong>: защита серверов и оборудования от несанкционированного доступа;</li>
                    <li className="list-disc"> <strong>шифрование</strong>: использование современных алгоритмов шифрования для защиты данных при передаче и хранении.</li>
                  </ul>
                  <p>
                    При обнаружении нарушения безопасности персональных данных Администрация уведомляет об этом уполномоченный орган по защите прав субъектов персональных данных в соответствии с требованиями статьи 19 Закона «О персональных данных».
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Права субъекта */}
            <section data-section="user-rights" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">8. Права субъекта персональных данных</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>Субъект персональных данных имеет право:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="list-disc"> <strong>получать информацию</strong>, касающуюся обработки своих персональных данных;</li>
                    <li className="list-disc"> <strong>требовать уточнения</strong>, блокирования или уничтожения своих персональных данных, если они являются неполными, устаревшими, неточными;</li>
                    <li className="list-disc"> <strong>отзывать согласие</strong> на обработку персональных данных;</li>
                    <li className="list-disc"> <strong>обжаловать в уполномоченный орган</strong> по защите прав субъектов персональных действия или бездействие при обработке своих персональных данных;</li>
                    <li className="list-disc"> <strong>требовать возмещения убытков</strong>, понесенных вследствие нарушения требований Закона «О персональных данных»;</li>
                    <li className="list-disc"> <strong>на компенсацию морального вреда</strong>, причиненного нарушением прав субъекта персональных данных;</li>
                    <li className="list-disc"> <strong>знать</strong> о трансграничной передаче персональных данных;</li>
                    <li className="list-disc"> <strong>на защиту</strong> своих прав и интересов как субъекта персональных данных.</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                    <h4 className="font-semibold text-text-primary mb-2">Как реализовать свои права:</h4>
                    <p className="text-sm">
                      Для реализации прав субъекта персональных данных необходимо направить письменный запрос на электронный адрес: privacy@ndgst.ru с указанием предмета запроса и приложением документов, подтверждающих личность субъекта персональных данных.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Заключение */}
            <section data-section="final" className="scroll-mt-20">
              <div className="bg-surface rounded-xl border border-divider p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">9. Заключительные положения</h2>
                <div className="space-y-4 text-text-secondary">
                  <p>
                    9.1. Настоящая Политика может быть изменена Администрацией в одностороннем порядке. Новая редакция Политики вступает в силу с момента ее размещения на Сайте, если иное не предусмотрено новой редакцией Политики.
                  </p>
                  <p>
                    9.2. Пользователь обязуется самостоятельно отслеживать изменения в Политике. Продолжение использования Сайта после внесения изменений означает согласие пользователя с новой редакцией Политики.
                  </p>
                  <p>
                    9.3. В случае если пользователь не согласен с условиями Политики, он должен прекратить использование Сайта.
                  </p>
                  <p>
                    9.4. Настоящая Политика действует в отношении всех персональных данных, обрабатываемых Администрацией через Сайт.
                  </p>
                  <p>
                    9.5. Все отношения, возникающие в связи с обработкой персональных данных, регулируются российским законодательством.
                  </p>
                  
                  <div className="mt-6 p-4 bg-surface rounded-lg border border-divider">
                    <h4 className="font-semibold text-text-primary mb-2">Контактная информация</h4>
                    <p className="text-sm space-y-1">
                      <strong>По вопросам обработки персональных данных:</strong><br />
                      Email: privacy@ndgst.ru<br />
                      Тема письма: "Обращение по персональным данным"
                    </p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-surface rounded-lg border border-divider">
                    <h4 className="font-semibold text-text-primary mb-2">Регулирующие нормы</h4>
                    <p className="text-sm space-y-1">
                      Настоящая Политика разработана в соответствии с требованиями:<br />
                      • Федеральный закон от 27.07.2006 № 152-ФЗ "О персональных данных"<br />
                      • Федеральный закон от 13.03.2006 № 38-ФЗ "О рекламе"<br />
                      • Федеральный закон от 07.07.2003 № 126-ФЗ "О связи"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-divider">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-surface border border-divider rounded-lg text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                К началу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;