export type Locale = "tr" | "en";

export const homeCopy = {
  tr: {
    nav: {
      about: "Hakkımızda",
      specialisms: "Uzmanlıklar",
      how: "Nasıl çalışır",
      research: "Araştırma",
      contact: "İletişim",
      login: "Giriş yap",
      account: "Hesap",
      menu: "Menüyü aç",
    },
    authPage: {
      title: "Hiros'a giriş yapın",
      subtitle: "Değerlendirme sırasında oluşturduğunuz e-posta ile giriş yapın.",
      createTitle: "Hiros hesabı oluşturun",
      createSubtitle: "İlerlemenizi kaydetmek ve daha sonra devam etmek için bir e-posta hesabı oluşturun.",
      signedIn: "Şu hesapla giriş yaptınız",
      goToDashboard: "Care Dashboard'a git",
      startIntake: "Değerlendirmeye başla",
      signOut: "Çıkış yap",
    },
    loginDrawer: {
      title: "Giriş",
      createTitle: "Hesap oluştur",
      close: "Kapat",
      welcomeBack: "Tekrar hoş geldiniz",
      createHeading: "Hesap oluşturun",
      email: "E-posta",
      password: "Şifre",
      passwordMinLength: "En az 8 karakter olmalı.",
      confirmPassword: "Şifreyi tekrar yazın",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      forgotUnavailable: "Bu demoda henüz kullanılamıyor.",
      logIn: "Giriş yap",
      createAccount: "Hesap oluştur",
      firstTime: "İlk kez misiniz?",
      createAccountLink: "Hesap oluşturun",
      haveAccount: "Zaten hesabınız var mı?",
      logInLink: "Giriş yapın",
      or: "veya",
      google: "Google ile devam et",
      apple: "Apple ile devam et",
      comingSoon: "Bu demoda kullanılamıyor",
      legal: {
        beforeTerms: "E-posta, Google veya Apple ile hesap oluşturarak ",
        terms: "Şartlar ve Koşullar",
        beforePrivacy: "’ı kabul eder, ",
        privacy: "Gizlilik Politikasını",
        after: " onaylarım.",
      },
    },
    siteMenu: {
      title: "Menü",
      close: "Menüyü kapat",
      account: "Hesap",
      exploreHeading: "Keşfet",
      supportHeading: "Destek",
      cta: "Değerlendirmeye başla",
      explore: [
        { href: "/intake?condition=hair-loss", label: "Saç dökülmesi" },
        { href: "/intake?condition=erection", label: "Ereksiyon kaygıları" },
        { href: "/intake?condition=premature-ejaculation", label: "Erken boşalma" },
        { href: "/intake?condition=intimate-skin", label: "Mahrem cilt" },
        { href: "/#how", label: "Hiros nasıl çalışır" },
        { href: "/blog", label: "Araştırma" },
        { href: "/about", label: "Hiros hakkında" },
      ],
      support: [
        { href: "/faq", label: "SSS" },
        { href: "/contact", label: "Bize ulaşın" },
        { href: "/privacy", label: "Gizlilik ve verileriniz" },
      ],
    },
    language: {
      aria: "Dil seçimi",
      tr: "TR",
      en: "EN",
    },
    announcement: {
      text: "Kliniğe gitmeden başlayın. Birkaç soruyu yanıtlamanız yeterli.",
      cta: "Başlayın",
      href: "#get-started",
    },
    hero: {
      titleLine1: "Sağlığınız için ilk adım.",
      titleLine2: "Evinizin rahatlığında.",
      steps: [
        {
          step: "ADIM 1",
          title: "Birkaç kısa soruyu yanıtlayın.",
          description: "Sağlığınızla ilgili bilgileri evinizden, rahatça ve gizlilik içinde paylaşın.",
          cta: "Değerlendirmeye başla",
          href: "#get-started",
          imageSrc: "/step_1.png",
        },
        {
          step: "ADIM 2",
          title: "Bir doktorla görüşmeye başlayın.",
          description: "Yanıtlarınız Türkiye’de görev yapan deneyimli bir hekim tarafından değerlendirilir. İlk adım için telefon etmeniz veya kliniğe gitmeniz gerekmez.",
          cta: "Hekiminizle tanışın",
          href: "#get-started",
          imageSrc: "/step_2b.png",
        },
      ],
      physicianCard: {
        name: "Dr. Mehmet Demir",
        specialty: "Dermatoloji",
        badge: "Lisanslı hekim",
        affiliation: "Acıbadem Sağlık Grubu",
        experience: "10+ yıl deneyim",
        patients: "Türkiye genelinde hastalar",
        imageSrc: "/mehmet_demir.jpg",
      },
      cards: [
        {
          href: "/intake?condition=hair-loss",
          title: "Saç dökülmesi",
          badge: null,
          description: "Saç dökülmesi için destek alın.",
          iconSrc: "/topic_hair.png",
        },
        {
          href: "/intake?condition=erection",
          title: "Ereksiyon kaygıları",
          badge: null,
          description: "Sertleşme sorunları için destek alın.",
          iconSrc: "/topic_pill.png",
        },
        {
          href: "/intake?condition=premature-ejaculation",
          title: "Erken boşalma",
          badge: null,
          description: "Erken boşalma konusunda destek alın.",
          iconSrc: "/topic_hourglass.png",
        },
        {
          href: "/intake?condition=intimate-skin",
          title: "Mahrem cilt",
          badge: null,
          description: "Cilt sağlığınız hakkında bilgi edinin.",
          iconSrc: "/topic_cream.png",
        },
      ],
    },
    about: {
      titleLine1: "Bazı konuları konuşmak daha kolaydır.",
      titleLine2: "Özellikle kendinizi rahat hissettiğinizde.",
      subtitle:
        "Evinizden başlayın, birkaç kısa soruyu kendi zamanınızda yanıtlayın. Paylaştığınız bilgiler bir hekim tarafından değerlendirilir ve sonraki adımlar buna göre belirlenir. İlk adım için randevu almanız gerekmez.",
      cta: "Başlayın",
      ctaHref: "#get-started",
    },
    startGallery: {
      eyebrow: "EVDEN BAŞLAYIN",
      titleLine1: "Sağlık desteğine",
      titleLine2: "daha kolay bir başlangıç.",
      body: "Evinizden, kendi zamanınızda kısa bir ön değerlendirme formunu doldurun. Yanıtlarınız bir hekim tarafından incelenir ve sonraki adımlar hakkında bilgilendirilirsiniz.",
      slides: [
        {
          key: "start-1",
          imageSrc: "/home_large5.jpg",
          imageAlt: "Tedavi planı, hekim mesajları ve ilerleme",
          titleLine1: "Sağlık sürecinizde",
          titleLine2: "her adımda yanınızda.",
          body: "Doktorunuzla iletişimde kalın, tedavi planınızı takip edin ve sürecinizdeki değişimleri izleyin. Düzenli durum değerlendirmeleri ve yan etki takibi sayesinde süreciniz hakkında bilgi sahibi olun.",
        },
        {
          key: "start-2",
          imageSrc: "/large_section1.jpg",
          imageAlt: "Hiros değerlendirme formu",
          titleLine1: "Sağlığınızla ilgili konular.",
          titleLine2: "Kendi hızınızda.",
          body: "Şikâyetleriniz ve sağlık geçmişiniz hakkında birkaç soruyu yanıtlayın. Her şeyi yüz yüze anlatmak zorunda kalmadan, bilgilerinizi gizlilik içinde paylaşın.",
        },
        {
          key: "start-3",
          imageSrc: "/large_section4.jpg",
          imageAlt: "Lisanslı hekim değerlendirmesi",
          titleLine1: "Tıbbi kararları",
          titleLine2: "doktorlar verir.",
          body: "Paylaştığınız bilgiler, doktorunuzun durumunuzu daha iyi anlamasına yardımcı olur. Görüşme veya ek muayene gerekip gerekmediğine doktorunuz karar verir.",
        },
      ],
    },
    physicianGallery: {
      eyebrow: "HEKİM BAKIMI",
      titleLine1: "Yüz yüze.",
      titleLine2: "Her yerden.",
      body: "Sonuçlarınızı lisanslı bir hekimle güvenli görüntülü görüşme veya mesajla konuşun. Uygun olduğunda hekimin belirlediği planı alın.",
      slides: [
        {
          key: "physician-1",
          imageSrc: "/why_hiros_doctors.webp",
          imageAlt: "Licensed physician",
          objectPosition: "object-[center_top]",
        },
        {
          key: "physician-2",
          imageSrc: "/gallery_physician_call.jpg",
          imageAlt: "Physician video consultation",
          titleLine1: "Sonuçlarınızı",
          titleLine2: "hekimle konuşun",
        },
        {
          key: "physician-3",
          imageSrc: "/hiros_intake_doctor.webp",
          imageAlt: "Physician consultation",
        },
      ],
    },
    careTogether: {
      eyebrow: "HER ŞEY TEK YERDE",
      title: "Bakımınız, bir arada.",
      body: "Hekiminize mesaj atın, tedavi planınızı görün, ilerlemenizi takip edin ve takip desteği alın — hepsi güvenli bir yerde.",
      phones: [
        { key: "plan", label: "Tedavi planı", imageSrc: "/phone_treatment_plan.jpg", imageAlt: "Treatment plan" },
        { key: "chat", label: "Hekim mesajları", imageSrc: "/phone_physician_chat.jpg", imageAlt: "Physician chat" },
        { key: "progress", label: "İlerleme", imageSrc: "/phone_progress.jpg", imageAlt: "Progress tracking" },
      ],
      testimonial:
        "Hiros doğru tedaviye ulaşmayı ve devam etmeyi kolaylaştırdı. Takip bana güven veriyor.",
      testimonialAttribution: "Can, 32 — İstanbul",
    },
    statement: {
      titleLine1: "Anlamlı netlik.",
      titleLine2: "Bilime dayalı.",
      body: "Hiros, kişisel bakım yolculuğunuzda size destek olmak için tasarlandı — kullandığınız ürünlerin içine yerleşik, sezgisel ve hekim onaylı adımlarla.",
      cta: "Başlayın",
      ctaHref: "#get-started",
      ctaNote: "Doktor randevusu gerekmez. Hemen başlayın.",
    },
    privacy: [
      {
        key: "start-privately",
        titleLine1: "Bakımınıza özel olarak,",
        titleLine2: "evden başlayın",
        description:
          "Evden basit, özel bir formla başlayın. Randevu veya hekim ziyareti gerekmez.",
        quote:
          "“Kliniğe gitmeden, kendi hızımda başlayabildim. Birkaç sorudan sonra bir hekim formu inceledi ve net bir sonraki adım verdi.”",
        attributionName: "Placeholder hasta",
        attributionRole: "Hiros üzerinden bakım alan hasta",
        cta: "Başlayın",
        ctaHref: "#get-started",
      },
      {
        key: "licensed-physicians",
        titleLine1: "Deneyimli lisanslı",
        titleLine2: "hekimlerce incelenir",
        description:
          "Tıbbi formunuz, yerleşik sağlık kurumlarındaki lisanslı hekimlerce incelenir.",
        quote:
          "“Her formu bizzat inceliyoruz. Hastalar evden başlıyor; biz de klinik standartlarla devam ediyoruz.”",
        attributionName: "Dr. Emre Yılmaz",
        attributionRole: "Lisanslı hekim, Hiros ağı",
        cta: "Nasıl çalışır",
        ctaHref: "#how",
      },
      {
        key: "ongoing-support",
        titleLine1: "Tüm bakım yolculuğunuzu",
        titleLine2: "tek yerde tutun",
        description:
          "Formunuz, hekim iletişiminiz ve sağlık bilgileriniz tek bir yerde bir arada kalır.",
        quote:
          "“Formum, hekim mesajlarım ve ilerlemem aynı yerde kaldı. Takip etmek çok daha kolaydı.”",
        attributionName: "Placeholder hasta",
        attributionRole: "Hiros Care kullanan hasta",
        cta: "Daha fazla",
        ctaHref: "/about",
      },
    ],
    how: {
      title: "Kliniğe gitmeden hekim onaylı tedavi alın",
      cards: [
        {
          key: "understand-science",
          titleLine1: "Bilimi net anlayın",
          titleLine2: "bu bakımın ardında",
          description: "Planınızın neye dayandığını, net sade ve açık ifadelerle anlayın.",
          cta: "Daha fazla",
          href: "/blog",
        },
        {
          key: "stay-in-control",
          titleLine1: "Özel olarak",
          titleLine2: "hassas konular",
          description: "Kısa birkaç soruyu yanıtlayın ve sonraki adımınızı netleştirin.",
          cta: "Forma başla",
          href: "/intake?condition=hair-loss",
        },
      ],
    },
    logoCarousel: {
      eyebrow: "İş birliği içinde",
      ariaLabel: "Türkiye'deki sağlık ve teknoloji kurumları",
      logos: [
        { id: "ministry-health", label: "T.C. Sağlık Bakanlığı", src: "/logos/ministry-health.png", tall: true },
        { id: "acibadem", label: "Acıbadem", src: "/logos/acibadem.svg" },
        { id: "kizilay", label: "Türk Kızılay", src: "/logos/kizilay.svg", tall: true },
        { id: "medical-park", label: "Medical Park", src: "/logos/medical-park.svg" },
        { id: "ministry-tech", label: "T.C. Sanayi ve Teknoloji Bakanlığı", src: "/logos/ministry-tech.svg", tall: true },
        { id: "memorial", label: "Memorial", src: "/logos/memorial.png" },
        { id: "meb", label: "T.C. Milli Eğitim Bakanlığı", src: "/logos/meb.svg", tall: true },
        { id: "anadolu", label: "Anadolu Sağlık", src: "/logos/anadolu-logo.png" },
        { id: "acibadem-mark", label: "Acıbadem Healthcare Group", src: "/logos/acibadem-mark.svg", tall: true },
        { id: "liv", label: "Liv Hospital", src: "/logos/liv-logo.png" },
        { id: "diyanet", label: "Diyanet İşleri Başkanlığı", src: "/logos/diyanet.svg", tall: true },
        { id: "tubitak", label: "TÜBİTAK", src: "/logos/tubitak.svg" },
      ],
    },
    faq: {
      eyebrow: "SIK SORULAN SORULAR",
      titleLine1: "Sık sorulan",
      titleLine2: "sorular",
      cta: "Tüm SSS'leri gör",
      href: "/faq",
      items: [
        {
          question: "Bu gerçek bir sağlık hizmeti mi?",
          answer:
            "Evet. Paylaştığınız bilgiler hekimler tarafından değerlendirilir ve sizin için uygun sonraki adım belirlenir. Hiros, sağlık durumunuzu açık ve gizlilik içinde paylaşmanızı kolaylaştırır.",
        },
        {
          question: "Devam etmek zorunda mıyım?",
          answer:
            "Hayır. Ön değerlendirme formunu doldurarak başlayabilir, sonrasında nasıl ilerleyeceğinize kendiniz karar verebilirsiniz. Devam etmek zorunda değilsiniz.",
        },
        {
          question: "Kliniğe gitmekten farkı ne?",
          answer:
            "Hiros, sağlık sürecinize evinizden ve gizlilik içinde başlamanızı sağlar. Önce randevu almak yerine durumunuzu paylaşabilirsiniz. Doktorunuz, sonraki adımın ne olması gerektiğini değerlendirir.",
        },
        {
          question: "Bilgilerim gizli tutuluyor mu?",
          answer:
            "Evet. Bilgileriniz güvenli şekilde işlenir ve yalnızca sağlık sürecinizde görev alan yetkili sağlık profesyonelleriyle paylaşılır. Paylaşacağınız bilgilere siz karar verirsiniz.",
        },
        {
          question: "Formu doldurduktan sonra ne olur?",
          answer:
            "Yanıtlarınız bir hekim tarafından değerlendirilir. Ardından, durumunuza uygun şekilde nasıl ilerleyebileceğiniz konusunda bilgilendirilirsiniz.",
        },
      ],
    },
    professionals: {
      titleLine1: "Sağlık profesyoneli misiniz?",
      titleLine2: "Hekimler için Hiros.",
      cards: [
        {
          key: "physician-workspace",
          title: "Hekim paneli",
          description:
            "Hasta bilgilerini inceleyin, vakaları önceliklendirin ve hastalarla güvenli şekilde iletişim kurun. Hepsi tek bir çalışma alanında.",
          cta: "Daha fazla bilgi",
          href: "/contact",
          imageSrc: "/home2.png",
          imageAlt: "Hiros hekim paneli",
        },
        {
          key: "patient-care",
          title: "Hasta bakımı",
          description:
            "Mesajlaşmayı, tedavi planlarını ve hasta takibini tek bir yerde yönetin. Tıbbi kararlar size aittir; Hiros günlük işlerinizi kolaylaştırır.",
          cta: "Daha fazla bilgi",
          href: "/contact",
          imageSrc: "/step_2.png",
          imageAlt: "Hekim hasta görüşmesi",
        },
      ],
    },
    footer: {
      columns: [
        ["Blog", "Saç kaybı neden olur", "Minoksidil ve finasterid", "Tedaviden neden kaçınılır", "Çoğu erkek bir yıl içinde bırakır"],
        ["Yasal", "Gizlilik Politikası", "Şartlar ve Koşullar", "Tüketici Sağlık Verisi Gizlilik Politikası", "Tele-sağlık Onayı"],
        ["Şirket", "Hakkımızda", "Blog", "Bize Ulaşın", "SSS"],
      ],
      links: [
        "Şartlar & koşullar",
        "Gizlilik politikası",
        "Site haritası",
        "Tele-sağlık Onayı & Açık Ödemeler",
        "Tüketici Sağlık Verisi Gizlilik Politikası",
        "Sizin gizlilik tercihleriniz",
      ],
      simpleLinks: [
        { href: "/about", label: "Hakkımızda" },
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "Sık sorulan sorular" },
        { href: "/privacy", label: "Gizlilik" },
        { href: "/terms", label: "Koşullar" },
        { href: "/contact", label: "İletişim" },
      ],
      disclaimer:
        "Bu web sitesindeki bilgiler yalnızca genel bilgilendirme amacı taşır; tıbbi tavsiye, tanı veya tedavinin yerini tutmaz. Hiros bir acil sağlık hizmeti değildir. Tıbbi değerlendirme ve kararlar, sağlık sürecinizde görev alan yetkili hekimlerin sorumluluğundadır. Hiros herhangi bir sağlık hizmeti sağlayıcısını önermez veya desteklemez. Sitedeki içerikler, toplumun sağlık konusunda daha bilinçli kararlar almasına yardımcı olmayı amaçlar.",
      addressLines: ["Teşvikiye Cad. No: 48/3", "Nişantaşı, Şişli", "34365 İstanbul, Türkiye"],
    },
    chat: {
      aria: "Hiros asistanı",
      close: "Sohbeti kapat",
      open: "Sohbeti aç",
      heading: "Nasıl yardımcı olayım?",
      initial: "Merhaba, Hiros asistanıyım. Bugün size nasıl yardımcı olabilirim?",
      thinking: "Düşünüyor…",
      placeholder: "Hiros hakkında sorun…",
      suggestions: ["Saç dökülmesi", "Cilt sorunları", "Cinsel sağlık"],
    },
    carousel: {
      previous: "Önceki kartlar",
      next: "Sonraki kartlar",
    },
  },
  en: {
    nav: {
      about: "About us",
      specialisms: "Specialisms",
      how: "How it works",
      research: "Research",
      contact: "Contact",
      login: "Log in",
      account: "Account",
      menu: "Open menu",
    },
    authPage: {
      title: "Sign in to Hiros",
      subtitle: "Use the email you created during your intake.",
      createTitle: "Create a Hiros account",
      createSubtitle: "Create an email account to save your progress and come back later.",
      signedIn: "You are signed in as",
      goToDashboard: "Go to Care Dashboard",
      startIntake: "Start assessment",
      signOut: "Sign out",
    },
    loginDrawer: {
      title: "Login",
      createTitle: "Create an account",
      close: "Close",
      welcomeBack: "Welcome back",
      createHeading: "Create an account",
      email: "Email",
      password: "Password",
      passwordMinLength: "Must be a minimum of 8 characters",
      confirmPassword: "Confirm password",
      forgotPassword: "Forgot your password?",
      forgotUnavailable: "Not available in this demo.",
      logIn: "Log in",
      createAccount: "Create account",
      firstTime: "First time here?",
      createAccountLink: "Create an account",
      haveAccount: "Already have an account?",
      logInLink: "Log in",
      or: "or",
      google: "Continue with Google",
      apple: "Continue with Apple",
      comingSoon: "Not available in this demo",
      legal: {
        beforeTerms: "By creating an account using email, Google or Apple, I agree to the ",
        terms: "Terms & Conditions",
        beforePrivacy: " and acknowledge the ",
        privacy: "Privacy Policy",
        after: ".",
      },
    },
    siteMenu: {
      title: "Menu",
      close: "Close menu",
      account: "Account",
      exploreHeading: "Explore",
      supportHeading: "Support",
      cta: "Start assessment",
      explore: [
        { href: "/intake?condition=hair-loss", label: "Hair loss" },
        { href: "/intake?condition=erection", label: "Erection concerns" },
        { href: "/intake?condition=premature-ejaculation", label: "Premature ejaculation" },
        { href: "/intake?condition=intimate-skin", label: "Intimate skin" },
        { href: "/#how", label: "How Hiros works" },
        { href: "/blog", label: "Research" },
        { href: "/about", label: "About Hiros" },
      ],
      support: [
        { href: "/faq", label: "FAQs" },
        { href: "/contact", label: "Contact us" },
        { href: "/privacy", label: "Privacy & your data" },
      ],
    },
    language: {
      aria: "Language",
      tr: "TR",
      en: "EN",
    },
    announcement: {
      text: "No visit needed. Start with a few questions.",
      cta: "Get started",
      href: "#get-started",
    },
    hero: {
      titleLine1: "Start care privately.",
      titleLine2: "Right from home.",
      steps: [
        {
          step: "STEP 1",
          title: "Answer a few simple questions.",
          description: "A private and secure intake from the comfort of your home.",
          cta: "Start intake",
          href: "#get-started",
          imageSrc: "/step_1.png",
        },
        {
          step: "STEP 2",
          title: "Get connected with a licensed physician.",
          description: "Your intake is reviewed by an experienced physician in Türkiye. No call or visit needed.",
          cta: "Meet your physician",
          href: "#get-started",
          imageSrc: "/step_2b.png",
        },
      ],
      physicianCard: {
        name: "Dr. Mehmet Demir",
        specialty: "Dermatology",
        badge: "Licensed physician",
        affiliation: "Acıbadem Healthcare Group",
        experience: "10+ years experience",
        patients: "Patients across Türkiye",
        imageSrc: "/mehmet_demir.jpg",
      },
      cards: [
        {
          href: "/intake?condition=hair-loss",
          title: "Hair loss",
          badge: null,
          description: "Take action on hair loss",
          iconSrc: "/topic_hair.png",
        },
        {
          href: "/intake?condition=erection",
          title: "Erection concerns",
          badge: null,
          description: "Get help with erections",
          iconSrc: "/topic_pill.png",
        },
        {
          href: "/intake?condition=premature-ejaculation",
          title: "Premature ejaculation",
          badge: null,
          description: "Get help with control",
          iconSrc: "/topic_hourglass.png",
        },
        {
          href: "/intake?condition=intimate-skin",
          title: "Intimate skin",
          badge: null,
          description: "Get answers about your skin",
          iconSrc: "/topic_cream.png",
        },
      ],
    },
    about: {
      titleLine1: "Some things are easier",
      titleLine2: "handled privately.",
      subtitle:
        "Start with a private intake from home — no appointment needed. Answer a few questions in your own time, and a physician reviews what you share before any next step.",
      cta: "Get started",
      ctaHref: "#get-started",
    },
    startGallery: {
      eyebrow: "START FROM HOME",
      titleLine1: "A simpler way to",
      titleLine2: "begin care.",
      body: "Begin with a short guided intake at home, in your own time. A licensed physician reviews what you share and clarifies the next step.",
      slides: [
        {
          key: "start-1",
          imageSrc: "/home_large5.jpg",
          imageAlt: "Treatment plan, physician messages, and progress",
          titleLine1: "Better care.",
          titleLine2: "Every step of the way.",
          body: "Stay connected with your physician, manage your treatment, and track your progress. Regular check-ins and side-effect monitoring help you stay informed throughout your care.",
        },
        {
          key: "start-2",
          imageSrc: "/large_section1.jpg",
          imageAlt: "Hiros intake form",
          titleLine1: "Your health concerns.",
          titleLine2: "Your own pace.",
          body: "Answer a few questions about your health concerns from home. Share your information privately with a licensed physician, without having to explain everything face to face.",
        },
        {
          key: "start-3",
          imageSrc: "/large_section4.jpg",
          imageAlt: "Licensed physician review",
          titleLine1: "Medical decisions",
          titleLine2: "belong to physicians.",
          body: "A licensed physician reviews your information and determines the appropriate next steps. They'll assess whether your care can continue remotely or an in-person visit is needed.",
        },
      ],
    },
    physicianGallery: {
      eyebrow: "PHYSICIAN CARE",
      titleLine1: "Face to face.",
      titleLine2: "From anywhere.",
      body: "Discuss your results with a licensed physician through secure video or chat, and receive a physician-selected plan when appropriate.",
      slides: [
        {
          key: "physician-1",
          imageSrc: "/why_hiros_doctors.webp",
          imageAlt: "Licensed physician",
          objectPosition: "object-[center_top]",
        },
        {
          key: "physician-2",
          imageSrc: "/gallery_physician_call.jpg",
          imageAlt: "Physician video consultation",
          titleLine1: "Discuss your results",
          titleLine2: "with a physician",
        },
        {
          key: "physician-3",
          imageSrc: "/hiros_intake_doctor.webp",
          imageAlt: "Physician consultation",
        },
      ],
    },
    careTogether: {
      eyebrow: "EVERYTHING IN ONE PLACE",
      title: "Your care, all together.",
      body: "Message your physician, view your treatment plan, track your progress and get follow-up support, all in one secure place.",
      phones: [
        { key: "plan", label: "Treatment plan", imageSrc: "/phone_treatment_plan.jpg", imageAlt: "Treatment plan" },
        { key: "chat", label: "Physician chat", imageSrc: "/phone_physician_chat.jpg", imageAlt: "Physician chat" },
        { key: "progress", label: "Progress", imageSrc: "/phone_progress.jpg", imageAlt: "Progress tracking" },
      ],
      testimonial:
        "Hiros made it easy to get the right treatment and actually stick with it. The follow-up gives me confidence.",
      testimonialAttribution: "Can, 32 — Istanbul",
    },
    statement: {
      titleLine1: "Meaningful clarity.",
      titleLine2: "Backed by science.",
      body: "Hiros is built to support you on your personal care journey — with intuitive, physician-reviewed steps designed into the experience you use every day.",
      cta: "Get started",
      ctaHref: "#get-started",
      ctaNote: "No doctors appointment needed. Start right away.",
    },
    privacy: [
      {
        key: "start-privately",
        titleLine1: "Start your care privately",
        titleLine2: "from home",
        description:
          "Begin with a simple private intake from home. No appointment or doctor visit required.",
        quote:
          "“I could start privately, at my own pace — no clinic visit. A physician reviewed what I shared and made the next step clear.”",
        attributionName: "Placeholder patient",
        attributionRole: "Patient starting care with Hiros",
        cta: "Get started",
        ctaHref: "#get-started",
      },
      {
        key: "licensed-physicians",
        titleLine1: "Reviewed by experienced",
        titleLine2: "licensed physicians",
        description:
          "Your medical intake is reviewed by licensed physicians at established medical institutions.",
        quote:
          "“We review every intake personally. Patients start from home; we continue with the same clinical standard.”",
        attributionName: "Dr. Emre Yılmaz",
        attributionRole: "Licensed physician, Hiros network",
        cta: "How it works",
        ctaHref: "#how",
      },
      {
        key: "ongoing-support",
        titleLine1: "Keep your entire care journey",
        titleLine2: "in one place",
        description:
          "Your intake, physician communication, and health information stay together in one place.",
        quote:
          "“My intake, physician messages, and progress stayed in one place. Following up became much easier.”",
        attributionName: "Placeholder patient",
        attributionRole: "Patient using Hiros Care",
        cta: "Learn more",
        ctaHref: "/about",
      },
    ],
    how: {
      title: "Get clinician-reviewed treatment without clinic visits",
      cards: [
        {
          key: "understand-science",
          titleLine1: "Understand the science",
          titleLine2: "behind your care",
          description: "Understand what your plan is based on, in clear, simple terms.",
          cta: "Learn more",
          href: "/blog",
        },
        {
          key: "stay-in-control",
          titleLine1: "Designed for",
          titleLine2: "sensitive concerns",
          description: "Answer a few questions and get clarity on your next step.",
          cta: "Start intake",
          href: "/intake?condition=hair-loss",
        },
      ],
    },
    logoCarousel: {
      eyebrow: "In collaboration with",
      ariaLabel: "Healthcare and technology institutions in Turkey",
      logos: [
        { id: "ministry-health", label: "Ministry of Health", src: "/logos/ministry-health.png", tall: true },
        { id: "acibadem", label: "Acıbadem", src: "/logos/acibadem.svg" },
        { id: "kizilay", label: "Turkish Red Crescent", src: "/logos/kizilay.svg", tall: true },
        { id: "medical-park", label: "Medical Park", src: "/logos/medical-park.svg" },
        { id: "ministry-tech", label: "Ministry of Industry and Technology", src: "/logos/ministry-tech.svg", tall: true },
        { id: "memorial", label: "Memorial", src: "/logos/memorial.png" },
        { id: "meb", label: "Ministry of National Education", src: "/logos/meb.svg", tall: true },
        { id: "anadolu", label: "Anadolu Sağlık", src: "/logos/anadolu-logo.png" },
        { id: "acibadem-mark", label: "Acıbadem Healthcare Group", src: "/logos/acibadem-mark.svg", tall: true },
        { id: "liv", label: "Liv Hospital", src: "/logos/liv-logo.png" },
        { id: "diyanet", label: "Presidency of Religious Affairs", src: "/logos/diyanet.svg", tall: true },
        { id: "tubitak", label: "TÜBİTAK", src: "/logos/tubitak.svg" },
      ],
    },
    faq: {
      eyebrow: "FREQUENTLY ASKED",
      titleLine1: "Frequently asked",
      titleLine2: "questions",
      cta: "See all FAQs",
      href: "/faq",
      items: [
        {
          question: "Is this a real medical service?",
          answer:
            "Yes. Your information is reviewed by licensed physicians who determine the appropriate next step. Hiros provides a structured way to share your information clearly and privately.",
        },
        {
          question: "Do I have to commit to anything?",
          answer:
            "No. You can start with a simple intake and decide how to proceed. There’s no obligation to continue unless you choose to.",
        },
        {
          question: "How is this different from going to a clinic?",
          answer:
            "With Hiros, you can share your health concerns and medical history from home. A physician reviews your information and determines the appropriate next steps. Depending on your situation, care may continue remotely or you may need an in-person visit.",
        },
        {
          question: "Is my information kept private?",
          answer:
            "Your health information is handled securely and in accordance with applicable Turkish data-protection requirements. Access to your information is restricted as described in our Privacy Policy.",
          link: {
            href: "/privacy",
            label: "Learn more about how we protect your information →",
          },
        },
        {
          question: "What happens after I complete the intake?",
          answer:
            "Your information is reviewed by a physician, who determines the appropriate next step. You’ll receive clear guidance on how to proceed, based on your situation.",
        },
      ],
    },
    professionals: {
      titleLine1: "Are you a healthcare professional?",
      titleLine2: "Hiros for physicians.",
      cards: [
        {
          key: "physician-workspace",
          title: "Physician workspace",
          description:
            "Review structured intakes, prioritize cases, and message patients securely. All in one clinical workspace.",
          cta: "Learn more",
          href: "/contact",
          imageSrc: "/home2.png",
          imageAlt: "Hiros physician workspace",
        },
        {
          key: "patient-care",
          title: "Patient care",
          description:
            "Keep patient messages, treatment plans, and follow-ups in one place. You remain in control of clinical decisions, while Hiros makes managing patient care easier.",
          cta: "Learn more",
          href: "/contact",
          imageSrc: "/step_2.png",
          imageAlt: "Physician consultation",
        },
      ],
    },
    footer: {
      columns: [
        ["Blog", "Why hair loss happens", "Minoxidil vs. finasteride", "Why some men avoid treatment", "Why most men quit within a year"],
        ["Legal", "Privacy Policy", "Terms & Conditions", "Consumer Health Data Privacy Policy", "Telehealth Consent"],
        ["Company", "About Us", "Blog", "Contact Us", "FAQs"],
      ],
      links: [
        "Terms & conditions",
        "Privacy policy",
        "Sitemap",
        "Telehealth Consent & Open Payments",
        "Consumer Health Data Privacy Policy",
        "Your privacy choices",
      ],
      simpleLinks: [
        { href: "/about", label: "About" },
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "FAQs" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/contact", label: "Contact" },
      ],
      disclaimer:
        "Information on this website is for general informational purposes only and does not replace medical advice, diagnosis, or treatment. Hiros is not an emergency medical service; clinical evaluation and decisions remain the responsibility of the licensed physicians involved in your care. Hiros does not recommend or endorse any healthcare provider; content on this site is intended to help the public stay better informed about health.",
      addressLines: ["Teşvikiye Cad. No: 48/3", "Nişantaşı, Şişli", "34365 Istanbul, Turkey"],
    },
    chat: {
      aria: "Hiros assistant",
      close: "Close chat",
      open: "Open chat",
      heading: "How can I help?",
      initial: "Hi, I’m the Hiros assistant. How can I help you today?",
      thinking: "Thinking…",
      placeholder: "Ask about Hiros…",
      suggestions: ["Hair loss", "Skin concerns", "Sexual health"],
    },
    carousel: {
      previous: "Previous cards",
      next: "Next cards",
    },
  },
} as const;

export type HomeCopy = (typeof homeCopy)[Locale];

export function footerLinkHref(label: string) {
  if (label === "Terms & conditions" || label === "Terms & Conditions" || label === "Şartlar & koşullar" || label === "Şartlar ve Koşullar") {
    return "/terms";
  }

  if (
    label === "Privacy policy" ||
    label === "Privacy Policy" ||
    label === "Gizlilik politikası" ||
    label === "Gizlilik Politikası" ||
    label === "Your privacy choices" ||
    label === "Sizin gizlilik tercihleriniz"
  ) {
    return "/privacy";
  }

  if (
    label === "Telehealth Consent & Open Payments" ||
    label === "Tele-sağlık Onayı & Açık Ödemeler" ||
    label === "Telehealth Consent" ||
    label === "Tele-sağlık Onayı"
  ) {
    return "/telehealth-consent";
  }

  if (label === "Consumer Health Data Privacy Policy" || label === "Tüketici Sağlık Verisi Gizlilik Politikası") {
    return "/health-privacy";
  }

  if (label === "About Us" || label === "Hakkımızda") {
    return "/about";
  }

  if (label === "FAQs" || label === "SSS") {
    return "/faq";
  }

  if (label === "Contact Us" || label === "Bize Ulaşın") {
    return "/contact";
  }

  if (label === "Blog") {
    return "/blog";
  }

  if (label === "Why hair loss happens" || label === "Saç kaybı neden olur") {
    return "/blog/why-hair-loss-happens";
  }

  if (label === "Minoxidil vs. finasteride" || label === "Minoksidil ve finasterid") {
    return "/blog/minoxidil-vs-finasteride";
  }

  if (label === "Why some men avoid treatment" || label === "Tedaviden neden kaçınılır") {
    return "/blog/waiting-to-start-treatment";
  }

  if (label === "Why most men quit within a year" || label === "Çoğu erkek bir yıl içinde bırakır") {
    return "/blog";
  }

  return null;
}
