export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "notice"; text: string }
  | { type: "ul"; items: string[] };

export type LegalSectionCopy = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocCopy = {
  title: string;
  lastUpdated: string;
  introNotice?: string;
  sections: LegalSectionCopy[];
};

export const legalCopy = {
  tr: {
    privacy: {
      title: "Gizlilik Politikası (KVKK Aydınlatma Metni)",
      lastUpdated: "21 Ağustos 2026",
      sections: [
        {
          title: "Veri Sorumlusu",
          blocks: [
            {
              type: "p",
              text: "Bu web sitesi ve Hiros iletişim/demo süreci bakımından veri sorumlusu, Türkiye Cumhuriyeti’nde tüzel kişilik olarak kurulmakta olan Hiros’tur. İletişim: [info@hiros.com.tr](mailto:info@hiros.com.tr).",
            },
          ],
        },
        {
          title: "Şu Anda Topladığımız Veriler",
          blocks: [
            {
              type: "p",
              text: "Bu aşamada site yalnızca iletişim formu aracılığıyla gönüllü olarak ilettiğiniz bilgileri toplar: ad, e-posta adresi, varsa mesleki bağlantı ve mesaj içeriği. Şu anda analitik veya izleme çerezi kullanmıyoruz.",
            },
          ],
        },
        {
          title: "Hukuki Sebep",
          blocks: [
            {
              type: "p",
              text: "Bu verileri KVKK madde 5(2)(c) kapsamında — bir sözleşmenin kurulması veya ifası ya da sözleşme öncesi görüşmeler için gerekli işleme — ve uygulanabildiği ölçüde madde 5(2)(f) kapsamında, taleplere yanıt vermeye yönelik meşru menfaatimiz temelinde işleriz.",
            },
          ],
        },
        {
          title: "Amaç",
          blocks: [
            {
              type: "p",
              text: "Hiros ile ilgilenen hekim, klinik ve diğer tarafların taleplerine yanıt vermek ve ürün gösterimleri planlamak.",
            },
          ],
        },
        {
          title: "Saklama",
          blocks: [
            {
              type: "p",
              text: "İletişim başvuruları, talebe yanıt vermek ve takip etmek için gerekli süre boyunca veya yasal zorunluluk varsa o süre boyunca saklanır; ardından silinir veya anonimleştirilir.",
            },
          ],
        },
        {
          title: "Alıcılar ve Aktarımlar",
          blocks: [
            {
              type: "p",
              text: "Veriler pazarlama amacıyla satılmaz veya üçüncü taraflarla paylaşılmaz. Bir hizmet sağlayıcı (örneğin e-posta barındırma) bu verileri bizim adımıza işliyorsa, bu işlem o hizmeti yürütmek için gerekli olanla sınırlıdır. Kurucu ekibin Hollanda’daki üssü nedeniyle bazı veriler Türkiye dışındaki altyapıda işlenebilir; bu bir yurt dışı aktarım oluşturduğunda KVKK madde 9’da izin verilen mekanizmalara dayanırız (örneğin açık rıza veya uygulanabilir olduğunda Kurul onaylı bir aktarım mekanizması).",
            },
          ],
        },
        {
          title: "Haklarınız (KVKK Madde 11)",
          blocks: [
            {
              type: "p",
              text: "Verilerinizin işlenip işlenmediğini öğrenme, bu konuda bilgi talep etme, işlemenin amacını öğrenme, paylaşıldığı üçüncü kişileri bilme, düzeltme veya silme talep etme ve otomatik analiz sonuçlarına itiraz etme hakkınız vardır. Talepler [info@hiros.com.tr](mailto:info@hiros.com.tr) adresine gönderilebilir. Sonuç alınamazsa Kişisel Verileri Koruma Kurulu’na şikayette bulunabilirsiniz.",
            },
          ],
        },
        {
          title: "VERBİS",
          blocks: [
            {
              type: "p",
              text: "Veri Sorumluları Sicili’ne (VERBİS) kayıt, KVKK Kurulu’nun belirlediği belirli büyüklük/faaliyet eşiklerinin üzerindeki çoğu veri sorumlusu için zorunludur. Hiros’un tüzel kişiliği ve çalışan sayısı netleştiğinde uygulanabilirliği hukuk danışmanıyla doğrulayın.",
            },
          ],
        },
        {
          title: "Gelecekteki Kapsam",
          blocks: [
            {
              type: "p",
              text: "Bu politika şu anda yalnızca web sitesi/iletişim formu verilerini kapsar. Hiros partner klinikler aracılığıyla hasta sağlık verisi işlemeye başladığında bu işleme ayrı [Tüketici/Hasta Sağlık Verisi Gizlilik Politikası](/health-privacy) ile yönetilecek ve bu politika o metne çapraz atıf verecek şekilde güncellenecektir.",
            },
          ],
        },
      ],
    },
    terms: {
      title: "Şartlar ve Koşullar",
      lastUpdated: "21 Ağustos 2026",
      sections: [
        {
          title: "Kapsam ve Kabul",
          blocks: [
            {
              type: "p",
              text: "İşbu Şartlar ve Koşullar (“Şartlar”), [alan adı eklenecek] adresindeki web sitesine (“Web Sitesi”) erişimi ve kullanımını ile bu site üzerinden, yüz yüze, görüntülü veya uzaktan sunulan Hiros yazılım platformunun herhangi bir gösterim sürümünü (“Demo”) yönetir. Web Sitesine erişerek veya bir Demo’ya katılarak siz (“Kullanıcı,” “siz”) bu Şartlara bağlı olmayı kabul edersiniz.",
            },
            {
              type: "p",
              text: "Hiros, Türkiye Cumhuriyeti’nde tüzel kişilik olarak kurulmaktadır (“Hiros,” “biz,” “bize”). Tescil tamamlanana kadar bu Şartlar, Hiros adı altında faaliyet gösteren kurucu ekip adına yayımlanır.",
            },
          ],
        },
        {
          title: "Platformun Mevcut Aşaması — Yalnızca Demo",
          blocks: [
            {
              type: "p",
              text: "Herhangi bir Demo’da gösterilen Hiros uygulaması, geliştirilmekte olan bir teknoloji gösterimidir. Sertifikalı, lisanslı veya hukuken faal bir tıbbi yazılım ürünü **değildir**. Özellikle:",
            },
            {
              type: "ul",
              items: [
                "Demo tıbbi danışmanlık, tanı, reçete veya herhangi bir tedavi sunmaz.",
                "Demo’ya **gerçek, kimliği belirlenebilir hasta verisi** girilmemeli, saklanmamalı veya işlenmemelidir. Demo sırasında girilen her veri — değerlendirme yanıtları, fotoğraflar veya sağlık bilgisi dahil — yalnızca kurgusal, anonimleştirilmiş veya sentetik test verisi olmalıdır.",
                "Demo’nun ürettiği hiçbir çıktı, risk değerlendirmesi, triyaj önerisi veya iş akışı sonucu gerçek klinik veya hasta bakımı kararı için dayanak alınmamalıdır.",
                "Hiros, Demo’nun özellik, doğruluk, güvenlik duruşu veya mevzuata uyum bakımından platformun nihai üretim sürümünü yansıttığına dair herhangi bir beyan vermez.",
              ],
            },
            {
              type: "p",
              text: "Demo’ya katılarak amacının yalnızca öngörülen işlevselliği göstermek olduğunu anladığınızı ve gerçek bir hastanın kişisel veya sağlık verisini sisteme girmeyeceğinizi kabul edersiniz.",
            },
          ],
        },
        {
          title: "Gizlilik ve Fikri Mülkiyet",
          blocks: [
            {
              type: "p",
              text: "Demo’ya erişim, henüz yayımlanmamış özellikler, iş akışları, tasarımlar ve Hiros’a ait gizli ve mülkiyete tabi iş yöntemleriyle karşılaşmayı içerebilir. Demo’ya katılarak şunları kabul edersiniz:",
            },
            {
              type: "ul",
              items: [
                "Demo’ya ilişkin kamuya açık olmayan bilgileri — işlevsellik, tasarım, temel mantık ve gösterim sırasında paylaşılan materyaller dahil — Hiros’un önceden yazılı izni olmadıkça veya hukuken açıklama zorunluluğu bulunmadıkça gizli tutmayı.",
                "Demo’nun kaynak kodunu, algoritmalarını veya iş mantığını kopyalamamayı, tersine mühendislik yapmamayı, kaynak koda indirmemeyi veya çıkarmaya çalışmamayı.",
                "Demo sırasında gözlemlenen hiçbir şeyi rakip bir ürün veya hizmet geliştirmek için kullanmamayı.",
              ],
            },
            {
              type: "p",
              text: "Web Sitesindeki ve Demo’daki tüm içerik — metin, grafikler, logolar, ürün tasarımı ve temel yazılım dahil — Hiros’un (veya lisans verenlerinin) fikri mülkiyetidir ve önceden yazılı izin olmadan çoğaltılamaz, dağıtılamaz veya kullanılamaz.",
            },
          ],
        },
        {
          title: "Tıbbi Tavsiye Yok; Garanti Yok",
          blocks: [
            {
              type: "p",
              text: "Web Sitesindeki veya Demo’daki hiçbir şey tıbbi tavsiye oluşturmaz. Web Sitesi yalnızca bilgilendirme amaçlıdır. Tüm tıbbi kararlar, kendi mesleki muhakemelerini kullanan lisanslı hekimlerin sorumluluğundadır.",
            },
            {
              type: "p",
              text: "Web Sitesi ve Demo, mevcut geliştirme aşamalarıyla uyumlu olarak, belirli bir amaca uygunluk, doğruluk veya kesintisiz erişilebilirlik dahil olmak üzere açık veya zımni hiçbir garanti olmaksızın “olduğu gibi” ve “mevcut olduğu şekilde” sunulur.",
            },
          ],
        },
        {
          title: "Sorumluluğun Sınırlandırılması",
          blocks: [
            {
              type: "p",
              text: "Türk hukukunun izin verdiği azami ölçüde Hiros, Web Sitesine erişimden veya bir Demo’ya katılımdan doğan dolaylı, arızi veya sonuç niteliğindeki zararlardan sorumlu değildir.",
            },
            {
              type: "p",
              text: "6098 sayılı Türk Borçlar Kanunu’nun 115. maddesi uyarınca, bu Şartlardaki hiçbir hüküm ağır ihmal veya kasten verilen zararlardan doğan ve Türk hukuku uyarınca feragat edilemeyen sorumluluğu sınırlamaz veya ortadan kaldırmaz.",
            },
          ],
        },
        {
          title: "Kişisel Veriler",
          blocks: [
            {
              type: "p",
              text: "Web Sitesi üzerinden (örneğin bir iletişim formuyla) veya bir Demo’nun planlanmasıyla bağlantılı olarak toplanan kişisel veriler, [Gizlilik Politikamıza](/privacy) ve 6698 sayılı Kişisel Verilerin Korunması Kanunu’na (“KVKK”) uygun olarak işlenir. Bir Demo oturumunda Kullanıcının kendi kişisel verisinin (örneğin planlama için verilen adınız ve mesleki bağlantınız) arızi olarak işlenmesi, gösterimi planlamak ve yürütmek için gerekli olanla sıkı biçimde sınırlıdır.",
            },
            {
              type: "p",
              text: "Sağlık verisi dahil özel nitelikli kişisel veriler, KVKK uyarınca yalnızca açık rıza veya kanunun özellikle izin verdiği başka bir hukuki sebeple işlenebilir. Platformun Mevcut Aşaması — Yalnızca Demo bölümünde belirtildiği üzere gerçek hasta sağlık verisi Demo’ya asla girilmemeli ve Hiros bu aşamada böyle bir veriyi bilerek toplamaz veya işlemez.",
            },
          ],
        },
        {
          title: "Ticari İşlem Yok",
          blocks: [
            {
              type: "p",
              text: "Web Sitesi üzerinden halihazırda mal, hizmet, abonelik veya lisans satılmamakta, sipariş edilmemekte veya sözleşmeye bağlanmamaktadır. Bu nedenle 6563 sayılı Elektronik Ticaret Kanunu’nun sipariş oluşumu ve mesafeli sözleşme hükümleri şu anda uygulanmaz. Hiros gelecekte Web Sitesi üzerinden ücretli hizmet sunmaya başlarsa bu Şartlar buna göre güncellenecek ve ilgili e-ticaret açıklamaları o tarihte eklenecektir.",
            },
          ],
        },
        {
          title: "Demo veya Bu Şartlarda Değişiklik",
          blocks: [
            {
              type: "p",
              text: "Hiros, mevcut geliştirme aşaması nedeniyle Demo’yu veya içindeki herhangi bir özelliği herhangi bir zamanda bildirimde bulunmaksızın değiştirebilir, askıya alabilir veya sona erdirebilir. Platform evrildikçe bu Şartları güncelleyebiliriz; Web Sitesinin kullanılmaya devam edilmesi veya gelecekteki Demo’lara katılım, o tarihteki Şartların kabulü anlamına gelir.",
            },
          ],
        },
        {
          title: "Uygulanacak Hukuk ve Yetki",
          blocks: [
            {
              type: "p",
              text: "Bu Şartlar Türkiye Cumhuriyeti hukukuna tabidir. Bu Şartlardan doğan her uyuşmazlık, [şehir eklenecek — faaliyet üssü netleşince büyük olasılıkla İstanbul] mahkemelerinin münhasır yetkisine tabidir.",
            },
          ],
        },
        {
          title: "İletişim",
          blocks: [
            {
              type: "p",
              text: "Bu Şartlarla ilgili sorular [info@hiros.com.tr](mailto:info@hiros.com.tr) adresine gönderilebilir.",
            },
          ],
        },
      ],
    },
    telehealth: {
      title: "Tele-sağlık / Uzaktan Hizmet Onayı",
      lastUpdated: "21 Ağustos 2026",
      introNotice:
        "İleriye dönük — bir partner klinik Hiros üzerinden hastalara uzaktan/dijital takip bakımı verdiğinde kullanılmak üzere. Mevcut demo aşamasında yürürlükte değildir.",
      sections: [
        {
          title: "Önemli Kapsam Notu",
          blocks: [
            {
              type: "notice",
              text: "Bu onay, kliniğinizden Hiros aracılığıyla uzaktan, asenkron takip bakımı almak için teknolojinin aracılık ettiği yönleri kapsar — platform üzerinden iletişim, fotoğraf ve anket yanıtları gönderme ve hatırlatmalar alma. 1219 sayılı Kanun’un 70. maddesi ve Hasta Hakları Yönetmeliği’nin 24–31. maddeleri uyarınca hekiminizin belirli bir tanı veya tedavi kararı için sizden doğrudan alması gereken aydınlatılmış onamın yerine geçmez ve ondan ayrıdır. Klinik onam, tedavi eden hekiminizin doğrudan sorumluluğunda kalır ve tanınızı, önerilen müdahaleyi, alternatifleri, riskleri, beklenen yararları ve tedaviyi reddetmenin sonuçlarını kapsamalıdır — genel bir platform onay kutusu bunun yerini tutamaz.",
            },
          ],
        },
        {
          title: "Neye Onay Veriyorsunuz",
          blocks: [
            {
              type: "p",
              text: "Kliniğinizden Hiros üzerinden takip bakımı alarak şunları kabul ve beyan edersiniz:",
            },
            {
              type: "ul",
              items: [
                "Kliniğiniz size Hiros üzerinden, Türkiye’nin Uzaktan Sağlık Hizmetlerinin Sunumu Hakkında Yönetmeliği’ne uygun uzaktan sağlık hizmeti sunmaktadır. Kliniğiniz, uzaktan sağlık hizmeti sunmak için gereken Sağlık Bakanlığı yetkisini taşıdığını ve bu yetkinin size bu platform üzerinden sunulan hizmetleri kapsadığını teyit eder.",
                "Hiros üzerinden iletişim (mesajlar, fotoğraflar, anket yanıtları) tedavi eden hekiminiz veya klinik ekibi tarafından incelenir; yalnızca yazılım tarafından otomatik olarak işleme konulmaz.",
                "Platformun ürettiği herhangi bir risk değerlendirmesi veya triyaj göstergesi yalnızca karar desteğidir ve tanı oluşturmaz; tanı koymak veya tedavi reçete etmek yalnızca hekiminizin yetkisindedir.",
                "Uzaktan izlemenin yüz yüze muayeneye kıyasla sınırlarını anlar ve uzaktan bilgi yetersizse hekiminizin yüz yüze bir görüşme isteyebileceğini kabul edersiniz.",
                "Platform üzerinden ilettiğiniz sağlık verileriniz [Tüketici/Hasta Sağlık Verisi Gizlilik Politikası](/health-privacy) kapsamında işlenecektir.",
                "Bu onayı kliniğinize bildirerek istediğiniz zaman geri çekebilirsiniz; bu, bakımı başka yollarla alma hakkınızı etkilemez.",
              ],
            },
          ],
        },
        {
          title: "Hekim/Klinik Sorumluluğu",
          blocks: [
            {
              type: "p",
              text: "Bu onamdaki hiçbir hüküm, klinik karar alma, tanı veya tedavi sorumluluğunu tedavi eden hekim ve klinikten kaydırmaz; bunlar 1219 sayılı Kanun, Hasta Hakları Yönetmeliği ve Sağlık Bakanlığı uzaktan sağlık hizmeti yükümlülükleri kapsamında bağlı kalmaya devam eder.",
            },
          ],
        },
        {
          title: "İletişim",
          blocks: [
            {
              type: "p",
              text: "Bu onayla ilgili sorular tedavi eden kliniğinize veya [info@hiros.com.tr](mailto:info@hiros.com.tr) adresine yöneltilebilir.",
            },
          ],
        },
      ],
    },
    healthPrivacy: {
      title: "Tüketici/Hasta Sağlık Verisi Gizlilik Politikası",
      lastUpdated: "21 Ağustos 2026",
      sections: [
        {
          title: "Kapsam",
          blocks: [
            {
              type: "p",
              text: "Bu politika, bir partner klinik tarafından gerçek hasta kullanımı için devreye alındığında Hiros platformu üzerinden işlenen sağlıkla ilgili verileri yönetir: değerlendirme tıbbi öyküsü, yaşam tarzı ve tedavi hedefleri, ilerleme fotoğrafları, yan etki ve uyum anket yanıtları ve platforma girilen hekim notları.",
            },
          ],
        },
        {
          title: "Roller: Veri Sorumlusu ve Veri İşleyen",
          blocks: [
            {
              type: "p",
              text: "KVKK kapsamında, hasta bakımı sırasında toplanan sağlık verisinin veri sorumlusu genellikle tedavi eden klinik veya hekimdir; hasta ile doğrudan ilişkiyi ve tedavinin hukuki sebebini onlar taşır. Hiros veri işleyen olarak bu verileri yalnızca her partner klinikle imzalanan bir veri işleme sözleşmesi çerçevesinde, kliniğin belgelenmiş talimatları doğrultusunda işler. Hiros hasta sağlık verisini kendi ticari kullanımı için bağımsız olarak satmaz, lisanslamaz veya başka amaçla kullanmaz.",
            },
          ],
        },
        {
          title: "Sağlık Verisinin İşlenmesinin Hukuki Sebebi",
          blocks: [
            {
              type: "p",
              text: "Sağlık verisi KVKK madde 6 uyarınca özel nitelikli kişisel veridir ve yalnızca hastanın açık rızasıyla veya, ayrı açık rıza olmadan, kamu sağlığının korunması, koruyucu hekimlik, tıbbi teşhis, tedavi, bakım veya sağlık hizmetlerinin planlanması ve finansmanı amaçlarıyla — meslek sırrı yükümlülüğü altındaki kişiler (hekimler gibi) veya yetkili kurumlar tarafından — işlenebilir. Uygulamada tedavi eden klinik, kendi hasta kabul sürecinin parçası olarak ilgili rızayı alır veya bu yasal istisnaya dayanır; Hiros veriyi kliniğin işleyeni olarak yalnızca bu yetkili kapsam içinde işler.",
            },
            {
              type: "p",
              text: "Hiros’un kendisinin ayrı bir hukuki sebebe ihtiyaç duyduğu durumlarda — örneğin platformu iyileştirmek için kimliği belirsizleştirilmiş veya toplulaştırılmış veri kullanmak — bu yalnızca tedavinin rızasından açıkça ayrılmış, hastanın ayrı, spesifik ve açık rızasıyla yapılır.",
            },
          ],
        },
        {
          title: "Neler Toplanır ve Neden",
          blocks: [
            {
              type: "ul",
              items: [
                "Değerlendirme bilgileri (tıbbi öykü, yaşam tarzı, hedefler, kontrendikasyonlar) — kliniğin yapılandırılmış değerlendirmesini ve hekim kararını desteklemek için.",
                "İlerleme fotoğrafları — tedavi eden hekimin incelediği görsel süreklilik izlemesini desteklemek için.",
                "Yan etki ve uyum yanıtları — süregelen izlemeyi ve hekim dikkatini gerektiren durumların erken fark edilmesini desteklemek için.",
              ],
            },
            {
              type: "p",
              text: "Bu verilerin hiçbiri reklam için kullanılmaz, üçüncü taraflara satılmaz veya yasal zorunluluk ya da hastanın açık rızası dışında tedavi eden kliniğin bakım ekibinin dışına paylaşılmaz.",
            },
          ],
        },
        {
          title: "Güvenlik Önlemleri",
          blocks: [
            {
              type: "p",
              text: "KVKK Kurulu’nun özel nitelikli verilere ilişkin rehberliğiyle (sağlık verisinin yetkisiz ifşasına ilişkin 2022/594 sayılı Kurul Kararı dahil) uyumlu olarak Hiros, aktarımda ve durağan halde şifreleme, yetkili klinik personele sınırlı rol tabanlı erişim, hasta kayıtlarına erişimin denetim kaydı ve sistem erişimi olan tüm personel için gizlilik yükümlülükleri uygular.",
            },
          ],
        },
        {
          title: "Saklama",
          blocks: [
            {
              type: "p",
              text: "Hasta sağlık verisi, kliniğin süregelen bakım için ihtiyaç duyduğu süre ve Türk sağlık kaydı tutma yükümlülükleri boyunca saklanır; ardından klinikle koordineli olarak silinir veya anonimleştirilir.",
            },
          ],
        },
        {
          title: "Hasta Hakları",
          blocks: [
            {
              type: "p",
              text: "Hastalar KVKK madde 11 haklarını (erişim, düzeltme, silme, itiraz) doğrudan tedavi eden kliniklerine veya işleyen sıfatıyla ilgili klinikle koordinasyon sağlayacak Hiros’a [info@hiros.com.tr](mailto:info@hiros.com.tr) üzerinden başvurarak kullanabilir.",
            },
          ],
        },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy Policy (KVKK Aydınlatma Metni)",
      lastUpdated: "21 August 2026",
      sections: [
        {
          title: "Data Controller",
          blocks: [
            {
              type: "p",
              text: "For the purposes of this website and the Hiros contact/demo process, the data controller (veri sorumlusu) is Hiros, currently being established as a legal entity in the Republic of Türkiye. Contact: [info@hiros.com.tr](mailto:info@hiros.com.tr).",
            },
          ],
        },
        {
          title: "What We Currently Collect",
          blocks: [
            {
              type: "p",
              text: "At this stage, this website collects only the information you voluntarily submit through our contact form: name, email address, professional affiliation (if provided), and message content. We do not currently use analytics or tracking cookies.",
            },
          ],
        },
        {
          title: "Legal Basis",
          blocks: [
            {
              type: "p",
              text: "We process this data under Article 5(2)(c) of KVKK — processing necessary for the establishment or performance of a contract or pre-contractual negotiation — and Article 5(2)(f), our legitimate interest in responding to inquiries, where applicable.",
            },
          ],
        },
        {
          title: "Purpose",
          blocks: [
            {
              type: "p",
              text: "To respond to inquiries from physicians, clinics, and other parties interested in Hiros, and to arrange product demonstrations.",
            },
          ],
        },
        {
          title: "Retention",
          blocks: [
            {
              type: "p",
              text: "Contact submissions are retained only as long as necessary to respond to and follow up on the inquiry, or as required by law, after which they are deleted or anonymized.",
            },
          ],
        },
        {
          title: "Recipients and Transfers",
          blocks: [
            {
              type: "p",
              text: "Data is not sold or shared with third parties for marketing purposes. Where a service provider (e.g., email hosting) processes this data on our behalf, this is limited to what’s necessary to operate that service. Given the founding team’s base in the Netherlands, some data may be processed on infrastructure located outside Türkiye; where this involves a cross-border transfer, we will rely on the mechanisms permitted under KVKK Article 9 (e.g., explicit consent, or a KVKK Board-approved transfer mechanism once applicable).",
            },
          ],
        },
        {
          title: "Your Rights (KVKK Article 11)",
          blocks: [
            {
              type: "p",
              text: "You have the right to learn whether your data is processed, request information about it, learn the purpose of processing, know third parties it’s shared with, request correction or deletion, and object to results produced by automated analysis. Requests can be sent to [info@hiros.com.tr](mailto:info@hiros.com.tr). If unresolved, you may lodge a complaint with the Turkish Personal Data Protection Board (Kişisel Verileri Koruma Kurumu).",
            },
          ],
        },
        {
          title: "VERBİS",
          blocks: [
            {
              type: "p",
              text: "Registration with the Data Controllers’ Registry (VERBİS) is required for most data controllers above certain size/activity thresholds set by the KVKK Board. Confirm applicability with counsel once Hiros’ legal entity and headcount are finalized.",
            },
          ],
        },
        {
          title: "Future Scope",
          blocks: [
            {
              type: "p",
              text: "This policy currently covers only website/contact-form data. Once Hiros processes patient health data through partner clinics, that processing will be governed by the separate [Consumer/Patient Health Data Privacy Policy](/health-privacy), and this policy will be updated to cross-reference it.",
            },
          ],
        },
      ],
    },
    terms: {
      title: "Terms and Conditions",
      lastUpdated: "21 August 2026",
      sections: [
        {
          title: "Scope and Acceptance",
          blocks: [
            {
              type: "p",
              text: "These Terms and Conditions (“Terms”) govern access to and use of the website located at [insert domain] (the “Website”) and any demonstration version of the Hiros software platform made available through it or shown in person, by video, or remotely (the “Demo”). By accessing the Website or participating in a Demo, you (“User,” “you”) agree to be bound by these Terms.",
            },
            {
              type: "p",
              text: "Hiros is currently being established as a legal entity in the Republic of Türkiye (“Hiros,” “we,” “us”). Until incorporation is finalized, these Terms are issued on behalf of the founding team operating under the Hiros name.",
            },
          ],
        },
        {
          title: "Current Stage of the Platform — Demo Only",
          blocks: [
            {
              type: "p",
              text: "The Hiros application shown in any Demo is a work-in-progress technology demonstration. It is **not** a certified, licensed, or legally operative medical software product. Specifically:",
            },
            {
              type: "ul",
              items: [
                "The Demo does not provide medical consultations, diagnoses, prescriptions, or treatment of any kind.",
                "The Demo must not be used to enter, store, or process **real, identifiable patient data**. Any data entered during a Demo — including intake answers, photographs, or health information — must be fictitious, anonymized, or synthetic test data only.",
                "No output, risk assessment, triage suggestion, or workflow result generated by the Demo should be relied upon for any actual clinical or patient-care decision.",
                "Hiros makes no representation that the Demo reflects the final, production version of the platform in features, accuracy, security posture, or regulatory compliance.",
              ],
            },
            {
              type: "p",
              text: "By participating in a Demo, you confirm that you understand its purpose is solely to illustrate intended functionality, and you agree not to input any real patient’s personal or health data into it.",
            },
          ],
        },
        {
          title: "Confidentiality and Intellectual Property",
          blocks: [
            {
              type: "p",
              text: "Access to the Demo may involve exposure to unreleased features, workflows, designs, and business methods that are confidential and proprietary to Hiros. By participating in a Demo, you agree to:",
            },
            {
              type: "ul",
              items: [
                "Keep confidential any non-public information about the Demo, including its functionality, design, underlying logic, and any materials shared during the demonstration, except where you have Hiros’ prior written consent to disclose it or disclosure is required by law.",
                "Not copy, reverse-engineer, decompile, or attempt to extract the underlying source code, algorithms, or business logic of the Demo.",
                "Not use anything observed during the Demo to develop a competing product or service.",
              ],
            },
            {
              type: "p",
              text: "All content on the Website and within the Demo — including text, graphics, logos, product design, and underlying software — is the intellectual property of Hiros (or its licensors) and may not be reproduced, distributed, or used without prior written permission.",
            },
          ],
        },
        {
          title: "No Medical Advice; No Warranty",
          blocks: [
            {
              type: "p",
              text: "Nothing on the Website or in the Demo constitutes medical advice. The Website is provided for informational purposes only. All medical decisions remain the sole responsibility of licensed physicians using their own professional judgment.",
            },
            {
              type: "p",
              text: "The Website and the Demo are provided “as is” and “as available,” without warranties of any kind, express or implied, including but not limited to fitness for a particular purpose, accuracy, or uninterrupted availability — consistent with their current stage of development.",
            },
          ],
        },
        {
          title: "Limitation of Liability",
          blocks: [
            {
              type: "p",
              text: "To the maximum extent permitted under Turkish law, Hiros shall not be liable for any indirect, incidental, or consequential damages arising from access to the Website or participation in a Demo.",
            },
            {
              type: "p",
              text: "Consistent with Article 115 of the Turkish Code of Obligations (Law No. 6098), nothing in these Terms limits or excludes liability for damages caused by gross negligence or willful misconduct, which cannot be waived under Turkish law.",
            },
          ],
        },
        {
          title: "Personal Data",
          blocks: [
            {
              type: "p",
              text: "Any personal data collected through the Website (for example, via a contact form) or in connection with arranging a Demo is processed in accordance with our [Privacy Policy](/privacy) and Türkiye’s Personal Data Protection Law No. 6698 (“KVKK”). Where a Demo session involves any incidental processing of a User’s own personal data (such as your name and professional affiliation, provided for scheduling purposes), this is limited strictly to what is necessary to arrange and conduct the demonstration.",
            },
            {
              type: "p",
              text: "Sensitive personal data, including health data, may under KVKK only be processed with explicit consent or another lawful basis specifically permitted by law. As stated in Current Stage of the Platform — Demo Only, real patient health data must never be entered into the Demo, and no such data is knowingly collected or processed by Hiros at this stage.",
            },
          ],
        },
        {
          title: "No Commercial Transaction",
          blocks: [
            {
              type: "p",
              text: "No goods, services, subscriptions, or licenses are currently sold, ordered, or contracted through the Website. Accordingly, the order-formation and distance-contract provisions of Türkiye’s E-Commerce Law No. 6563 do not currently apply. Should Hiros begin offering paid services through the Website in the future, these Terms will be updated accordingly, and the applicable e-commerce disclosures will be added at that time.",
            },
          ],
        },
        {
          title: "Changes to the Demo or These Terms",
          blocks: [
            {
              type: "p",
              text: "Hiros may modify, suspend, or discontinue the Demo, or any feature within it, at any time without notice, given its current development stage. We may update these Terms as the platform evolves; continued use of the Website or participation in future Demos constitutes acceptance of the then-current Terms.",
            },
          ],
        },
        {
          title: "Governing Law and Jurisdiction",
          blocks: [
            {
              type: "p",
              text: "These Terms are governed by the laws of the Republic of Türkiye. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of [insert city — likely Istanbul, once your operating base is confirmed].",
            },
          ],
        },
        {
          title: "Contact",
          blocks: [
            {
              type: "p",
              text: "Questions about these Terms can be sent to [info@hiros.com.tr](mailto:info@hiros.com.tr).",
            },
          ],
        },
      ],
    },
    telehealth: {
      title: "Telehealth / Remote Service Consent",
      lastUpdated: "21 August 2026",
      introNotice:
        "Forward-looking — for use once a partner clinic is providing remote/digital follow-up care to patients through Hiros. Not in effect during the current demo stage.",
      sections: [
        {
          title: "Important Scope Note",
          blocks: [
            {
              type: "notice",
              text: "This consent covers the technology-mediated aspects of using Hiros to receive remote, asynchronous follow-up care from your clinic — communicating through the platform, submitting photos and questionnaire responses, and receiving reminders. It does not replace, and is separate from, the informed consent your physician must obtain directly from you for any specific diagnosis or treatment decision, as required under Article 70 of Law No. 1219 and Articles 24–31 of the Patient Rights Regulation. That clinical consent remains your treating physician’s direct responsibility and must cover your diagnosis, the proposed intervention, alternatives, risks, expected benefits, and consequences of declining treatment — a general platform checkbox cannot substitute for it.",
            },
          ],
        },
        {
          title: "What You’re Consenting To",
          blocks: [
            {
              type: "p",
              text: "By using Hiros to receive follow-up care from your clinic, you acknowledge and agree that:",
            },
            {
              type: "ul",
              items: [
                "Your clinic is providing remote health services to you through Hiros in accordance with Türkiye’s Regulation on the Provision of Remote Health Services (Uzaktan Sağlık Hizmetlerinin Sunumu Hakkında Yönetmelik). Your clinic confirms it holds any Ministry of Health authorization required to provide remote health services, and that this authorization covers the services provided to you through this platform.",
                "Communication through Hiros (messages, photos, questionnaire responses) will be reviewed by your treating physician or their clinical team, not automatically acted upon by software alone.",
                "Any risk-assessment or triage indicators generated by the platform are decision-support only and do not constitute a diagnosis; only your physician can diagnose or prescribe treatment.",
                "You understand the limitations of remote monitoring compared to an in-person examination, and that your physician may require an in-person visit if remote information is insufficient.",
                "Your health data submitted through the platform will be processed as described in the [Consumer/Patient Health Data Privacy Policy](/health-privacy).",
                "You may withdraw this consent at any time by notifying your clinic, without affecting your right to receive care through other means.",
              ],
            },
          ],
        },
        {
          title: "Physician/Clinic Responsibility",
          blocks: [
            {
              type: "p",
              text: "Nothing in this consent shifts responsibility for clinical decision-making, diagnosis, or treatment away from the treating physician and clinic, who remain bound by their obligations under Law No. 1219, the Patient Rights Regulation, and Ministry of Health remote health service requirements.",
            },
          ],
        },
        {
          title: "Contact",
          blocks: [
            {
              type: "p",
              text: "Questions about this consent can be directed to your treating clinic, or to [info@hiros.com.tr](mailto:info@hiros.com.tr).",
            },
          ],
        },
      ],
    },
    healthPrivacy: {
      title: "Consumer/Patient Health Data Privacy Policy",
      lastUpdated: "21 August 2026",
      sections: [
        {
          title: "Scope",
          blocks: [
            {
              type: "p",
              text: "This policy governs health-related data processed through the Hiros platform once deployed by a partner clinic for real patient use: intake medical history, lifestyle and treatment goals, progress photographs, side-effect and adherence questionnaire responses, and physician notes entered into the platform.",
            },
          ],
        },
        {
          title: "Roles: Controller and Processor",
          blocks: [
            {
              type: "p",
              text: "Under KVKK, health data collected during a patient’s care is generally controlled by the treating clinic or physician (veri sorumlusu), who holds the direct relationship with the patient and the underlying legal basis for treatment. Hiros acts as the data processor (veri işleyen), processing this data solely on the clinic’s documented instructions, under a data processing agreement executed with each partner clinic. Hiros does not independently sell, license, or repurpose patient health data for its own commercial use.",
            },
          ],
        },
        {
          title: "Legal Basis for Processing Health Data",
          blocks: [
            {
              type: "p",
              text: "Health data is a special category of personal data under KVKK Article 6 and may only be processed with the patient’s explicit consent (açık rıza), or, without separate explicit consent, when processed for the purposes of protecting public health, preventive medicine, medical diagnosis, treatment, care, or health services planning and financing — by persons under a professional confidentiality obligation (such as physicians) or authorized institutions. In practice, the treating clinic obtains the applicable consent or relies on this statutory exception as part of its own patient intake process; Hiros processes the data strictly within that authorized scope as the clinic’s processor.",
            },
            {
              type: "p",
              text: "Where Hiros itself needs a separate basis — for example, to use de-identified or aggregated data to improve the platform — this will only be done with the patient’s separate, specific, explicit consent, clearly distinguished from consent to treatment.",
            },
          ],
        },
        {
          title: "What Is Collected and Why",
          blocks: [
            {
              type: "ul",
              items: [
                "Intake information (medical history, lifestyle, goals, contraindications) — to support the clinic’s structured assessment and physician decision-making.",
                "Progress photographs — to support visual continuity monitoring reviewed by the treating physician.",
                "Side-effect and adherence responses — to support ongoing monitoring and early identification of issues requiring physician attention.",
              ],
            },
            {
              type: "p",
              text: "None of this data is used for advertising, sold to third parties, or shared outside the treating clinic’s care team except as required by law or with the patient’s explicit consent.",
            },
          ],
        },
        {
          title: "Security Measures",
          blocks: [
            {
              type: "p",
              text: "Consistent with KVKK Board guidance on special category data (including Board Decision No. 2022/594 on unauthorized disclosure of health data), Hiros applies encryption in transit and at rest, role-based access restricted to authorized clinical staff, audit logging of access to patient records, and confidentiality obligations for all personnel with system access.",
            },
          ],
        },
        {
          title: "Retention",
          blocks: [
            {
              type: "p",
              text: "Patient health data is retained for as long as the clinic requires it for ongoing care and as required under Turkish healthcare record-keeping obligations, after which it is deleted or anonymized in coordination with the clinic.",
            },
          ],
        },
        {
          title: "Patient Rights",
          blocks: [
            {
              type: "p",
              text: "Patients may exercise their KVKK Article 11 rights (access, correction, deletion, objection) by contacting their treating clinic directly, or Hiros at [info@hiros.com.tr](mailto:info@hiros.com.tr), who will coordinate with the relevant clinic as processor.",
            },
          ],
        },
      ],
    },
  },
} as const satisfies Record<"tr" | "en", Record<"privacy" | "terms" | "telehealth" | "healthPrivacy", LegalDocCopy>>;

export type LegalDocKey = keyof (typeof legalCopy)["tr"];
