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
      menu: "Menüyü aç",
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
    hero: {
      titleLine1: "Sohbeti atlayın.",
      titleLine2: "Özel bakıma başlayın.",
      subtitle:
        "Kısa birkaç soruyu yanıtlayın. Lisanslı bir hekim vakanızı inceler ve sonraki adımı yönlendirir.",
      cards: [
        {
          href: "/intake?condition=hair-loss",
          title: "Saç dökülmesi",
          badge: "Online form",
          description: "Kendi durumunuza göre rehberlik alın",
        },
        {
          href: "/intake?condition=mental-health",
          title: "Bana yol göster",
          badge: null,
          description: "Emin değil misiniz? Size yol gösteririz",
        },
      ],
      socialProof: "Lisanslı hekimlerce incelenir · 400+ hasta güvenir",
    },
    about: {
      titleLine1: "Bazı şeyler daha kolay",
      titleLine2: "özel halledilir",
    },
    privacy: [
      {
        key: "start-privately",
        titleLine1: "Özel olarak",
        titleLine2: "hassas konular",
        description:
          "Kendi özel alanınızdan birkaç yönlendirilmiş soruyu yanıtlayın—randevu veya bekleme salonu gerekmez.",
      },
      {
        key: "licensed-physicians",
        titleLine1: "İnceleme ile",
        titleLine2: "lisanslı hekimler",
        description:
          "Bilgilerinizi kayıtlı, bağımsız hekimler değerlendirir ve sizin için doğru sonraki adımı belirler.",
      },
      {
        key: "ongoing-support",
        titleLine1: "Süregelen destek,",
        titleLine2: "tek seferlik değil",
        description:
          "Zamanla destek alın: takip görüşmeleri, ilerleme izleme ve durumunuzun net bir özeti.",
      },
      {
        key: "clear-next-steps",
        titleLine1: "Net sonraki adımlar,",
        titleLine2: "ne zaman ihtiyaç olsa",
        description:
          "Basit bir rehberlik, şeffaf seçenekler ve ihtiyaçlarınıza uyan pratik öneriler alın.",
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
    faq: {
      titleLine1: "Aklınıza takılan",
      titleLine2: "sorular",
      cta: "Tüm SSS'leri gör",
      href: "/faq",
      items: [
        {
          question: "Bu gerçek bir tıbbi hizmet mi?",
          answer:
            "Evet. Bilgileriniz lisanslı hekimlerce incelenir ve uygun sonraki adım belirlenir. Hiros, bilgilerinizi net ve özel şekilde paylaşmanız için yapılandırılmış bir yol sunar.",
        },
        {
          question: "Ben herhangi bir şeye bağlanmak zorunda mıyım?",
          answer:
            "Hayır. Basit bir formla başlayabilir ve nasıl ilerleyeceğinize siz karar verirsiniz. Siz tercih etmedikçe devam etme zorunluluğu yoktur.",
        },
        {
          question: "Bu, bir kliniğe gitmekten nasıl farklıdır?",
          answer:
            "Hiros, kendi alanınızdan özel şekilde başlamanıza yardımcı olur. Önce randevu almak yerine durumunuzu net paylaşırsınız; hekim sonraki adımdan önce neyin uygun olduğunu değerlendirir.",
        },
        {
          question: "Benim bilgilerim gizli tutuluyor mu?",
          answer:
            "Evet. Bilgileriniz güvenle işlenir ve yalnızca bakımınıza katılan lisanslı sağlık uzmanlarıyla paylaşılır. Ne paylaşacağınız ve ne zaman paylaşacağınız sizin kontrolünüzdedir.",
        },
        {
          question: "Formu bitirdikten sonra tam olarak ne olur?",
          answer:
            "Bilgileriniz bir hekim tarafından incelenir ve uygun sonraki adım belirlenir. Durumunuza göre nasıl ilerleyeceğinize dair net bir yönlendirme alırsınız.",
        },
      ],
    },
    footer: {
      columns: [
        ["Blog", "Saç kaybı neden olur", "Minoksidil ve finasterid", "Tedaviden neden kaçınılır", "Çoğu erkek bir yıl içinde bırakır"],
        ["Yasal", "Gizlilik Politikası", "Şartlar ve Koşullar", "Tüketici Sağlık Verisi Gizlilik Politikası", "Tele-sağlık Onayı"],
        ["Şirket", "Hakkımızda", "Bize Ulaşın", "SSS"],
      ],
      links: [
        "Şartlar & koşullar",
        "Gizlilik politikası",
        "Site haritası",
        "Tele-sağlık Onayı & Açık Ödemeler",
        "Tüketici Sağlık Verisi Gizlilik Politikası",
        "Sizin gizlilik tercihleriniz",
      ],
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
      menu: "Open menu",
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
    hero: {
      titleLine1: "Skip the conversation.",
      titleLine2: "Start care privately.",
      subtitle:
        "Answer a few questions. A licensed physician reviews your case and guides your next step.",
      cards: [
        {
          href: "/intake?condition=hair-loss",
          title: "Hair loss",
          badge: "Online intake",
          description: "Get guidance based on your situation",
        },
        {
          href: "/intake?condition=mental-health",
          title: "Help me choose",
          badge: null,
          description: "Not sure what's right? We'll guide you",
        },
      ],
      socialProof: "Reviewed by licensed physicians · Trusted by 400+ patients",
    },
    about: {
      titleLine1: "Some things are easier",
      titleLine2: "handled privately",
    },
    privacy: [
      {
        key: "start-privately",
        titleLine1: "Designed for",
        titleLine2: "sensitive concerns",
        description:
          "Answer a few guided questions from your own space—no appointments or waiting rooms required.",
      },
      {
        key: "licensed-physicians",
        titleLine1: "Reviewed by",
        titleLine2: "licensed physicians",
        description:
          "Your information is assessed by registered, independent doctors who determine the right next step.",
      },
      {
        key: "ongoing-support",
        titleLine1: "Ongoing support,",
        titleLine2: "not one-time care",
        description:
          "Stay supported over time with follow-ups, progress tracking, and a clear overview of your situation.",
      },
      {
        key: "clear-next-steps",
        titleLine1: "Clear next steps,",
        titleLine2: "whenever you need them",
        description:
          "Get simple guidance, transparent options, and practical recommendations that fit your needs.",
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
    faq: {
      titleLine1: "Things you might",
      titleLine2: "wonder",
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
            "Hiros helps you start privately, from your own space. Instead of booking first, you begin by sharing your situation clearly, so a physician can assess what’s appropriate before any next step.",
        },
        {
          question: "Is my information kept private?",
          answer:
            "Yes. Your information is handled securely and only shared with licensed medical professionals involved in your care. You stay in control of what you share and when.",
        },
        {
          question: "What happens after I complete the intake?",
          answer:
            "Your information is reviewed by a physician, who determines the appropriate next step. You’ll receive clear guidance on how to proceed, based on your situation.",
        },
      ],
    },
    footer: {
      columns: [
        ["Blog", "Why hair loss happens", "Minoxidil vs. finasteride", "Why some men avoid treatment", "Why most men quit within a year"],
        ["Legal", "Privacy Policy", "Terms & Conditions", "Consumer Health Data Privacy Policy", "Telehealth Consent"],
        ["Company", "About Us", "Contact Us", "FAQs"],
      ],
      links: [
        "Terms & conditions",
        "Privacy policy",
        "Sitemap",
        "Telehealth Consent & Open Payments",
        "Consumer Health Data Privacy Policy",
        "Your privacy choices",
      ],
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
