import type { LocalizedText } from "@/i18n/localeText";

export type FaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type FaqCategory = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    slug: "how-hiros-works",
    title: { tr: "Hiros nasıl çalışır", en: "How Hiros works" },
    description: {
      tr: "Hiros nedir, çevrimiçi süreç nasıl işler ve bakımınıza kimler katılır.",
      en: "What Hiros is, how the online process works, and who is involved in your care.",
    },
    items: [
      {
        question: { tr: "Hiros nedir?", en: "What is Hiros?" },
        answer: {
          tr: "Hiros, kişisel sağlık konularında bakıma ulaşmayı daha basit ve daha özel hale getirmek için tasarlanmış dijital bir platformdur. İlk adımları çevrimiçi tamamlamanıza yardımcı olur ve tıbbi değerlendirme gerektiğinde sizi bağımsız lisanslı sağlık uzmanlarıyla buluşturur.",
          en: "Hiros is a digital platform designed to make accessing care for personal health concerns simpler and more private. The platform helps you complete the initial steps online and connects you with independent licensed healthcare professionals where medical assessment is required.",
        },
      },
      {
        question: { tr: "Hiros nasıl çalışır?", en: "How does Hiros work?" },
        answer: {
          tr: "Konunuzu seçip yönlendirilmiş bir çevrimiçi değerlendirme doldurarak başlarsınız. Bilgileriniz ardından uygun lisanslı bir sağlık uzmanıyla paylaşılabilir. Durumunuza göre, herhangi bir tıbbi karar öncesinde ek bilgi veya bir görüşme gerekebilir.",
          en: "You start by selecting your concern and completing a guided online assessment. Your information can then be shared with an appropriate licensed healthcare professional for review. Depending on your situation, additional information or a consultation may be required before any medical decision is made.",
        },
      },
      {
        question: { tr: "Hiros bir sağlık hizmeti sağlayıcısı mıdır?", en: "Is Hiros a healthcare provider?" },
        answer: {
          tr: "Hayır. Hiros, bakıma erişimi kolaylaştıran teknolojiyi ve dijital deneyimi sağlar. Tıbbi değerlendirmeler, tanılar, reçeteler ve diğer klinik kararlar, uygun şekilde lisanslı sağlık uzmanlarınca bağımsız olarak alınır.",
          en: "No. Hiros provides the technology and digital experience that helps facilitate access to care. Medical assessments, diagnoses, prescriptions and other clinical decisions are made independently by appropriately licensed healthcare professionals.",
        },
      },
      {
        question: { tr: "Kliniğe gitmem gerekir mi?", en: "Do I need to visit a clinic?" },
        answer: {
          tr: "Zorunlu değil. Sürecin bir kısmı uzaktan tamamlanabilir. Yüz yüze randevu veya ek muayene gerekip gerekmediği bireysel durumunuza bağlıdır ve bakımınıza katılan sağlık uzmanı tarafından belirlenir.",
          en: "Not necessarily. Parts of the process can be completed remotely. Whether an in-person appointment or additional examination is necessary depends on your individual situation and is determined by the healthcare professional involved in your care.",
        },
      },
      {
        question: { tr: "Hiros hangi sağlık konularını kapsar?", en: "What health concerns does Hiros support?" },
        answer: {
          tr: "Hiros, insanların özel ve pratik şekilde ele almayı tercih edebileceği kişisel sağlık konuları etrafında geliştirilmektedir. Mevcut yollar platformda gösterilir ve zamanla genişleyebilir.",
          en: "Hiros is being developed around personal health concerns that people may prefer to approach privately and conveniently. Available pathways are shown on the platform and may expand over time.",
        },
      },
    ],
  },
  {
    slug: "assessment-and-care",
    title: { tr: "Değerlendirme ve bakım", en: "Your assessment & care" },
    description: {
      tr: "Tıbbi kararlar, uygunluk, ek bilgi ve takip.",
      en: "Medical decisions, eligibility, extra information, and follow-up.",
    },
    items: [
      {
        question: { tr: "Değerlendirmeyi tamamladıktan sonra ne olur?", en: "What happens after I complete an assessment?" },
        answer: {
          tr: "Yanıtlarınız, sağlık uzmanına konunuzla ilgili bilgi sağlar. Uzman bilgileri inceleyebilir, ek ayrıntı isteyebilir veya başka bir değerlendirme biçiminin gerekli olduğuna karar verebilir.",
          en: "Your responses provide the healthcare professional with information relevant to your concern. They may review the information, request additional details or determine that another form of assessment is necessary.",
        },
      },
      {
        question: { tr: "Benim için uygun bakıma kim karar verir?", en: "Who decides what care is appropriate for me?" },
        answer: {
          tr: "Tıbbi kararlar, değerlendirmenizden sorumlu lisanslı sağlık uzmanı tarafından alınır. Hiros tanı koymaz, reçeteli ilaç uygunluğunuza karar vermez ve reçete kararı almaz.",
          en: "Medical decisions are made by the licensed healthcare professional responsible for your assessment. Hiros does not diagnose conditions, determine your eligibility for prescription medication or make prescribing decisions.",
        },
      },
      {
        question: {
          tr: "Değerlendirmeyi tamamlamak reçete alacağımı garanti eder mi?",
          en: "Does completing an assessment guarantee that I will receive a prescription?",
        },
        answer: {
          tr: "Hayır. Değerlendirmeyi tamamlamak tanı, reçete veya belirli bir tedaviyi garanti etmez. Sağlık uzmanı sizin için tıbben neyin uygun olduğuna, varsa, kendisi karar verir.",
          en: "No. Completing an assessment does not guarantee a diagnosis, prescription or particular treatment. The healthcare professional decides what, if anything, is medically appropriate for you.",
        },
      },
      {
        question: { tr: "Hekim daha fazla bilgi isterse ne olur?", en: "What if the doctor needs more information?" },
        answer: {
          tr: "Sağlık uzmanı karar verebilmek için sizden ek bilgi isteyebilir veya bir görüşme tamamlamanızı isteyebilir.",
          en: "You may be asked to provide additional information or complete a consultation before the healthcare professional can make a decision.",
        },
      },
      {
        question: { tr: "İlk değerlendirmeden sonra ne olur?", en: "What happens after the initial assessment?" },
        answer: {
          tr: "Uygun olduğunda dijital deneyim, bakımınızı takip etmenize ve zaman içinde kontrolleri tamamlamanıza yardımcı olabilir. Takip süreci hizmete ve ilgili sağlık uzmanına göre değişir.",
          en: "Where applicable, the digital experience can help you keep track of your care and complete follow-ups over time. The exact follow-up process depends on the service and the healthcare professional involved.",
        },
      },
    ],
  },
  {
    slug: "account-and-privacy",
    title: { tr: "Hesap ve gizlilik", en: "Account & privacy" },
    description: {
      tr: "Bilgilerinizi kimler görür, veri talepleri ve gizlilik odaklı iletişim.",
      en: "Who can see your information, data requests, and discreet communication.",
    },
    items: [
      {
        question: { tr: "Bilgilerimi kimler görebilir?", en: "Who can see my information?" },
        answer: {
          tr: "Bilgilerinize erişim amacına göre sınırlıdır. Tıbbi değerlendirme için gereken bilgiler ilgili sağlık uzmanına açılabilir; Hiros ise platformu işletmek için gerekli bilgileri işleyebilir. Ayrıntılar [Gizlilik Politikası](/privacy) ve [KVKK aydınlatma metinlerinde](/health-privacy) yer alır.",
          en: "Access to your information is limited according to its purpose. Information needed for a medical assessment may be made available to the healthcare professional involved, while Hiros may process information required to operate the platform. Further details are provided in our [Privacy Policy](/privacy) and [KVKK information notices](/health-privacy).",
        },
      },
      {
        question: { tr: "Hiros bilgilerimi gizli tutar mı?", en: "Does Hiros keep my information private?" },
        answer: {
          tr: "Hiros gizlilik düşünülerek tasarlanmıştır; çünkü kişisel sağlık konuları hassas bilgi içerebilir. Kişisel veriler, yürürlükteki gizlilik ve veri koruma yükümlülüklerine göre işlenir.",
          en: "Hiros is designed with privacy in mind, particularly because personal health concerns can involve sensitive information. Personal data is handled according to applicable privacy and data-protection requirements.",
        },
      },
      {
        question: { tr: "Hiros’u ne için kullandığımı başkası öğrenir mi?", en: "Will anyone know what I’m using Hiros for?" },
        answer: {
          tr: "İletişimi gizli tutmayı ve kişisel bilgileri size açıklanan amaçlar dışında kullanmamayı hedefleriz. Fiziksel teslimat olduğunda paketlemeyi de mümkün olduğunca gizlilikle tutarız.",
          en: "We aim to keep communication discreet and only use personal information for the purposes explained to you. Where physical delivery is involved, we also aim to keep packaging appropriately discreet.",
        },
      },
      {
        question: {
          tr: "Bilgilerime erişim veya silinmesini talep edebilir miyim?",
          en: "Can I request access to or deletion of my information?",
        },
        answer: {
          tr: "Kişisel verileriniz ve Türk veri koruma hukukundaki haklarınız için [bize ulaşabilirsiniz](/contact). Yasal bir yükümlülük varsa bazı bilgilerin saklanması gerekebilir.",
          en: "You can [contact us](/contact) regarding your personal data and exercise applicable rights under Turkish data-protection law. Certain information may need to be retained where there is a legal obligation to do so.",
        },
      },
      {
        question: { tr: "Neden kişisel bilgiye ihtiyacınız var?", en: "Why do you need personal information?" },
        answer: {
          tr: "Farklı amaçlar için farklı bilgiler gerekir. Bazı bilgiler Hiros’un hesabınızı ve platformu işletmesini sağlar; tıbbi değerlendirme için gereken bilgiler ise sağlık sürecinde kullanılır. Meşru bir amacı olan bilgileri toplamayı hedefleriz.",
          en: "Different information is required for different purposes. Some information enables Hiros to operate your account and the platform, while information required for medical assessment is used within the healthcare process. We aim to collect only information that has a legitimate purpose.",
        },
      },
    ],
  },
  {
    slug: "prescriptions-and-pharmacy",
    title: { tr: "Reçete ve eczane", en: "Prescriptions & pharmacy" },
    description: {
      tr: "Kim reçete yazabilir, reçeteden sonra ne olur ve teslimat.",
      en: "Who can prescribe, what happens after a prescription, and fulfilment.",
    },
    items: [
      {
        question: { tr: "Hiros ilaç reçete edebilir mi?", en: "Can Hiros prescribe medication?" },
        answer: {
          tr: "Hayır. Hiros ilaç reçete etmez. Reçete kararı, tıbben uygun olup olmadığını değerlendirdikten sonra uygun şekilde lisanslı bir sağlık uzmanı tarafından bağımsız olarak alınır.",
          en: "No. Hiros does not prescribe medication. Any prescription decision is made independently by an appropriately licensed healthcare professional after assessing whether it is medically appropriate.",
        },
      },
      {
        question: {
          tr: "Çevrimiçi değerlendirmeyi tamamlamak reçeteyle sonuçlanır mı?",
          en: "Will completing the online assessment result in a prescription?",
        },
        answer: {
          tr: "Zorunlu değil. Değerlendirme sürecin bir parçasıdır. Sağlık uzmanı ek bilgi, görüşme, başka bir bakım biçimi veya reçete yazmamayı uygun görebilir.",
          en: "Not necessarily. The assessment is one part of the process. A healthcare professional may decide that further information, a consultation, another form of care or no prescription is appropriate.",
        },
      },
      {
        question: { tr: "Reçeteyi kim düzenler?", en: "Who issues my prescription?" },
        answer: {
          tr: "Reçeteli ilaç uygun görüldüğünde reçete, tıbbi karardan sorumlu lisanslı sağlık uzmanı tarafından, yürürlükteki Türk mevzuatına uygun şekilde düzenlenir.",
          en: "Where prescription medication is considered appropriate, the prescription is issued by the licensed healthcare professional responsible for the medical decision, in accordance with applicable Turkish requirements.",
        },
      },
      {
        question: { tr: "İlaç nereden gelir?", en: "Where does medication come from?" },
        answer: {
          tr: "Reçeteli ilaç, yetkili eczane kanalları üzerinden verilir. Hiros’un kendisi eczane değildir.",
          en: "Prescription medication is dispensed through appropriately authorised pharmacy channels. Hiros itself is not a pharmacy.",
        },
      },
      {
        question: { tr: "Belirli bir ilaç talep edebilir miyim?", en: "Can I request a particular medication?" },
        answer: {
          tr: "Durumunuz ve önceki deneyimleriniz hakkında bilgi verebilirsiniz; ancak herhangi bir tedavinin uygun olup olmadığına karar vermek sağlık uzmanının sorumluluğundadır.",
          en: "You can provide relevant information about your situation and previous experiences, but the healthcare professional remains responsible for determining whether any particular treatment is appropriate.",
        },
      },
    ],
  },
  {
    slug: "orders-and-delivery",
    title: { tr: "Sipariş ve teslimat", en: "Orders & delivery" },
    description: {
      tr: "Teslimat, takip, paketleme ve adres değişikliği.",
      en: "Delivery, tracking, packaging, and changing an address.",
    },
    items: [
      {
        question: { tr: "Siparişimin gönderildiğini nasıl anlarım?", en: "How will I know when my order has been sent?" },
        answer: {
          tr: "İlgili hizmette teslimat varsa, siparişinizin durumu ve varsa takip bilgileri size iletilir.",
          en: "Where delivery is available through the relevant service, you will receive information about the status of your order and any available tracking details.",
        },
      },
      {
        question: { tr: "Paketleme gizli midir?", en: "Is the packaging discreet?" },
        answer: {
          tr: "Hiros teslimat deneyimini koordine ettiğinde gizlilik sürecin önemli bir parçasıdır. Paketleme, sağlık konunuzla ilgili hassas bilgiyi gereksiz yere açıklamamalıdır.",
          en: "Where Hiros coordinates the customer experience around delivery, discretion is an important part of the process. Packaging should not unnecessarily disclose sensitive information about your health concern.",
        },
      },
      {
        question: { tr: "Teslimat adresimi değiştirebilir miyim?", en: "Can I change my delivery address?" },
        answer: {
          tr: "Siparişiniz henüz kargoya hazırlanmadıysa teslimat adresini güncellemek mümkün olabilir. Değişiklik gerekiyorsa mümkün olan en kısa sürede [destekle iletişime geçin](/contact).",
          en: "If your order has not yet been processed for dispatch, it may be possible to update the delivery address. [Contact support](/contact) as soon as possible if you need to make a change.",
        },
      },
      {
        question: { tr: "Teslimat ne kadar sürer?", en: "How long does delivery take?" },
        answer: {
          tr: "Teslimat süreleri eczaneye, varış yerine ve gönderim yöntemine göre değişir. Geçerli teslimat tahmini süreç içinde gösterilir veya iletilir.",
          en: "Delivery times depend on the pharmacy, destination and fulfilment method. The applicable delivery estimate will be shown or communicated during the process.",
        },
      },
    ],
  },
  {
    slug: "payments-and-support",
    title: { tr: "Ödeme ve destek", en: "Payments & support" },
    description: {
      tr: "Fiyatlandırma, ödemeler, iadeler ve bize nasıl ulaşacağınız.",
      en: "Pricing, payments, refunds, and how to reach us.",
    },
    items: [
      {
        question: { tr: "Hiros ne kadar tutar?", en: "How much does Hiros cost?" },
        answer: {
          tr: "Fiyat, seçtiğiniz hizmete göre değişir. Ödeme yapmadan önce geçerli ücretler açıkça gösterilir.",
          en: "Pricing depends on the service you choose. Any applicable costs will be shown clearly before you make a payment.",
        },
      },
      {
        question: { tr: "Gizli ücret var mı?", en: "Are there any hidden fees?" },
        answer: {
          tr: "Hiros ücretlerini ödeme öncesinde açık göstermeyi hedefleriz. Ayrı bir sağlık sağlayıcısı, eczane veya başka bir üçüncü tarafın ücreti varsa, bu da sürecin ilgili adımında netleştirilmelidir.",
          en: "We aim to show applicable Hiros charges clearly before payment. Where a separate healthcare provider, pharmacy or other third party charges for a service, this should also be made clear during the relevant part of the process.",
        },
      },
      {
        question: { tr: "Hiros’a nasıl ulaşabilirim?", en: "How can I contact Hiros?" },
        answer: {
          tr: "Hiros ekibine doğrudan [destek kanallarımız](/contact) üzerinden ulaşabilirsiniz. İlk dönemde desteği bilinçli olarak kişisel tutuyoruz; böylece sorular gerçek bir ekip üyesi tarafından ele alınabiliyor.",
          en: "You can contact the Hiros team directly through our [support channels](/contact). During our initial launch, we’re keeping support deliberately personal so that questions can be handled by a real member of our team.",
        },
      },
      {
        question: { tr: "WhatsApp üzerinden ulaşabilir miyim?", en: "Can I contact you through WhatsApp?" },
        answer: {
          tr: "Evet. Hiros, hesabınız ve sürecin nasıl işlediğiyle ilgili sorular için ekibe WhatsApp üzerinden ulaşabilirsiniz.",
          en: "Yes. You can reach the Hiros team through WhatsApp for questions about Hiros, your account and how the process works.",
        },
      },
      {
        question: { tr: "Hiros desteği tıbbi soruları yanıtlayabilir mi?", en: "Can Hiros support answer medical questions?" },
        answer: {
          tr: "Destek ekibimiz Hiros platformu ve süreci konusunda yardımcı olabilir; tıbbi tavsiye veremez. Belirtiler, yan etkiler, tanı veya tedavi kararlarıyla ilgili sorular uygun bir sağlık uzmanına yöneltilmelidir.",
          en: "Our support team can help with the Hiros platform and process, but cannot provide medical advice. Questions about symptoms, side effects, diagnoses or treatment decisions should be addressed by an appropriate healthcare professional.",
        },
      },
    ],
  },
];

export function getFaqCategory(slug: string) {
  return faqCategories.find((category) => category.slug === slug);
}
