(() => {
  "use strict";

  const cfg = window.HAYATI_CONFIG;

  const $ = (id) => document.getElementById(id);

  let supabaseClient = null;
  let products = [];
  let cart = [];
  let activeCategory = "";

  /* =========================
     أدوات
  ========================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(text) {
    return String(text ?? "")
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ");
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("fr-DZ");
  }

  function imageOf(product) {
    return (
      product?.image_url ||
      product?.image ||
      product?.photo ||
      "https://via.placeholder.com/700x700?text=Hayati"
    );
  }

  function showToast(message) {
    const toast = $("toast");

    if (!toast) {
      alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.__hayatiToastTimer);

    window.__hayatiToastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  /* =========================
     الولايات والبلديات
  ========================= */

  const municipalities = {
    "أدرار": "أدرار,تامست,شروين,رڨان,تيت,تسابيت,فنوغيل,زاوية كنتة,أولف,تيمقتن,تمنطيط,سالي,سبع,أقبلي,أولاد أحمد تيمي",
    "الشلف": "الشلف,تنس,بني حواء,وادي قوسين,الظهرة,تاوقريت,بوقادير,بني راشد,الكريمية,أولاد فارس,سيدي عكاشة,أبو الحسن,الزبوجة,وادي سلي,الصبحة,الحجاج,سنجاس,الهرانفة,بوزغاية,عين مران,المرسى",
    "الأغواط": "الأغواط,قصر الحيران,بن ناصر بن شهرة,الحاج المشري,العسافية,عين ماضي,تاجموت,الخنق,تاجرونة,قلتة سيدي سعد,حاسي الدلاعة,حاسي الرمل,وادي مرة,الغيشة,سبقاق,سيدي مخلوف",
    "أم البواقي": "أم البواقي,عين البيضاء,عين مليلة,عين فكرون,عين كرشة,الحرملية,الزرق,العامرية,بريش,سيقوس,عين ببوش,الجازية,الضلعة,مسكيانة,البلالة,الزوية",
    "باتنة": "باتنة,مروانة,نقاوس,سريانة,تازولت,عين التوتة,بريكة,أريس,منعة,تكوت,ثنية العابد,بوزينة,المعذر,وادي الماء,فسديس,وادي الشعبة,إشمول,إينوغيسن,شير,رحبات,عين ياقوت,الشمرة,القصبات,الجزار,أولاد سلام,تيمقاد",
    "بجاية": "بجاية,أميزور,أوقاس,أدكار,خراطة,سوق الإثنين,تيشي,صدوق,شميني,سيدي عيش,تازمالت,أقبو,إغيل علي,برباشة,بوخليفة,توجة,درقينة,ملبو,تامريجت,لفلاي,القصر,بني معوش,بني جليل,بوحمزة,بني مليكش,تيفرة,تيبان",
    "بسكرة": "بسكرة,طولقة,أورلال,فوغالة,زريبة الوادي,سيدي عقبة,مشونش,الحوش,ليوة,جمورة,برانيس,القنطرة,عين زعطوط,خنقة سيدي ناجي,المزيرعة,الحاجب,أوماش,مليلي,الغروس,الفيض",
    "بشار": "بشار,القنادسة,لحمر,العبادلة,بني ونيف,تاغيت,كرزاز,تبلبالة,الواتة,بني عباس,إقلي,القصابي",
    "البليدة": "البليدة,بوعينان,بوفاريك,الشفة,الأربعاء,بوقرة,موزاية,الصومعة,وادي العلايق,بني مراد,بني تامو,الشريعة,حمام ملوان,مفتاح,بن خليل",
    "البويرة": "البويرة,سور الغزلان,الأخضرية,مشدالله,برج أخريص,عين بسام,حيزر,الهاشمية,بشلول,العجيبة,الشرفة,ديرة,عين الترك,الحاكمية,المقراني,الأسنام,قرومة,أهل القصر,أغبالو",
    "تمنراست": "تمنراست,عين أمقل,أبالسة,إدلس,تازروك,فقارة الزوى",
    "تبسة": "تبسة,بئر العاتر,الشريعة,العقلة,الونزة,مرسط,الماء الأبيض,نقرين,الكويف,بكارية,الحويجبات,الحمامات,المريج,العوينات,ثليجان,بولحاف الدير,المزرعة,أم علي",
    "تلمسان": "تلمسان,المنصورة,شتوان,الرمشي,مغنية,سبدو,ندرومة,الغزوات,باب العسة,مرسى بن مهيدي,بني بوسعيد,صبرة,الحناية,أولاد ميمون,عين تالوت,بني سنوس,سيدي الجيلالي,العريشة,بني مستار,عين فزة,عين يوسف,سيدي العبدلي,زناتة,أولاد رياح,بوحلو,سوق الثلاثاء",
    "تيارت": "تيارت,فرندة,مهدية,قصر الشلالة,السوقر,عين الذهب,حمادية,مغيلة,رحوية,دحموني,مدريسة,ملاكو,وادي ليلي,سيدي حسني,سبعين,توسنينة,عين بوشقيف,النعيمة,مشرع الصفا,قرطوفة,تاقدمت,سيدي علي ملال,جيلالي بن عمار,زمالة الأمير عبد القادر",
    "تيزي وزو": "تيزي وزو,ذراع بن خدة,عزازقة,بوغني,الأربعاء نايث إيراثن,واقنون,ذراع الميزان,تيقزيرت,أزفون,بوزغن,عين الحمام,مقلع,بني دوالة,تادمايت,إفليسن,تيزي راشد,معاتقة,أيت يحيى,أيت محمود,أيت بومهدي",
    "الجزائر": "الجزائر الوسطى,سيدي امحمد,المدنية,المرادية,المرسى,برج الكيفان,باب الزوار,الدار البيضاء,الحراش,بوروبة,باش جراح,براقي,الكاليتوس,سيدي موسى,بئر توتة,تسالة المرجة,الدويرة,الدرارية,العاشور,الرحمانية,زرالدة,سطاوالي,الشراقة,دالي إبراهيم,الحمامات,باب الوادي,بولوغين,القصبة,وادي قريش,رايس حميدو",
    "الجلفة": "الجلفة,حاسي بحبح,عين وسارة,مسعد,القديد,الإدريسية,فيض البطمة,دار الشيوخ,حد الصحاري,سيدي لعجال,عين الإبل,البيرين,عمورة,زعفران,عين الشهداء,عين معبد,مليليحة,سلمانة,الدويس,تعظميت,بن يعقوب,قرنيني,عين فقه,سيدي بايزيد,الخميس,قطارة",
    "جيجل": "جيجل,الطاهير,الميلية,العنصر,القنار نشفي,تاكسنة,العوانة,سيدي معروف,الشحنة,غبالة,بودريعة بن ياجيس,وجانة,بوراوي بلهادف,السطارة,أولاد رابح,بوسيف أولاد عسكر",
    "سطيف": "سطيف,العلمة,عين أرنات,عين ولمان,عين آزال,صالح باي,بوقاعة,حمام قرقور,بابور,بني عزيز,عين عباسة,قجال,عين الكبيرة,بئر العرش,الرصفة,مزلوق,الأوريسيا,تيزي نبشار,الدهامشة,بني ورتيلان,بوعنداس,حمام السخنة,جميلة,عين الروى,عموشة,ماوكلان,بني فودة",
    "سعيدة": "سعيدة,عين الحجر,الحساسنة,يوب,سيدي بوبكر,مولاي العربي,عين السلطان,سيدي أحمد,أولاد خالد,دوي ثابت,عين السخونة",
    "سكيكدة": "سكيكدة,عزابة,الحروش,القل,تمالوس,رمضان جمال,فلفلة,الحدائق,عين شرشار,بن عزوز,أم الطوب,زردازة,أولاد أحبابة,الزيتونة,عين قشرة,السبت,بوشطاطة,صالح بوالشعور,جندل سعدي محمد,كركرة,بني بشير",
    "سيدي بلعباس": "سيدي بلعباس,تلاغ,سفيزف,رأس الماء,بن باديس,مرين,مولاي سليسن,تنيرة,تسالة,سيدي علي بوسيدي,عين البرد,سيدي خالد,طابية,بوخنفيس,حاسي دحو,وادي السبع,مرحوم,سيدي لحسن,زروالة,لمطار",
    "عنابة": "عنابة,البوني,الحجار,برحال,سرايدي,شطايبي,التريعات,وادي العنب",
    "قالمة": "قالمة,حمام دباغ,وادي الزناتي,هيليوبوليس,بوشقوف,بوحمدان,عين مخلوف,حمام النبائل,قلعة بوصبع,نشماية,بلخير,لخزارة,بن جراح,الركنية,الفجوج,عين صندل,مجاز عمار",
    "قسنطينة": "قسنطينة,الخروب,حامة بوزيان,ديدوش مراد,عين سمارة,زيغود يوسف,ابن زياد,مسعود بوجريو,عين عبيد,بن باديس",
    "المدية": "المدية,البرواقية,قصر البخاري,تابلاط,العمارية,وزرة,سي المحجوب,بن شكاو,الحمدانية,مغراوة,سيدي نعمان,الزبيرية,بعطة,العيساوية,أولاد عنتر,سغوان,الشهبونية,بوسكن,عين بوسيف,شلالة العذاورة",
    "مستغانم": "مستغانم,عين تادلس,حاسي ماماش,سيدي علي,ماسرة,مزغران,عشعاشة,خير الدين,سيدي لخضر,فرناكة,بوقيراط,عين النويصي,الطواهرية,نقمارية,منصورة,ستيدية,صيادة,سيدي بلعطار,أولاد بوغالم",
    "المسيلة": "المسيلة,بوسعادة,مقرة,سيدي عيسى,حمام الضلعة,عين الحجل,برهوم,أولاد دراج,شلال,جبل مساعد,خبانة,محمد بوضياف,عين الخضراء,بلعايبة,بن سرور,زرزور,أمسيف,عين الملح,سيدي عامر,الهامل,ولتام,المعاضيد,ونوغة,بني يلمان",
    "معسكر": "معسكر,بوحنيفية,غريس,سيق,تيغنيف,محمدية,عين فارس,الحشم,عوف,وادي الأبطال,البرج,القطنة,تيزي,المنور,المامونية,عين فكان,عقاز,زهانة,سيدي قادة",
    "ورقلة": "ورقلة,الرويسات,عين البيضاء,حاسي مسعود,حاسي بن عبد الله,أنقوسة,سيدي خويلد,البرمة,الطيبات,الحجيرة,العالية",
    "وهران": "وهران,السانية,بئر الجير,قديل,بطيوة,أرزيو,مرسى الحجاج,عين الترك,بوتليليس,بوسفر,الكرمة,سيدي الشحمي,البرية,حاسي بن عقبة,حاسي بونيف,مسرغين",
    "البيض": "البيض,بوقطب,بريزينة,بوعلام,رقاصة,الأبيض سيدي الشيخ,الخيثر,المحرة,كراكدة,اربوات,بنود,ستيتن,عين العراك,الشلالة,سيدي طيفور",
    "إليزي": "إليزي,جانت,برج عمر إدريس,دبداب,إن أمناس",
    "برج بوعريريج": "برج بوعريريج,رأس الوادي,برج الغدير,المنصورة,مجانة,الحمادية,عين تاغروت,بئر قاصد علي,برج زمورة,غيلاسة,العناصر,حسناوة,الماين,تفرق,أولاد إبراهيم,الجعافرة,تسامرت",
    "بومرداس": "بومرداس,برج منايل,دلس,خميس الخشنة,الثنية,يسر,بودواو,الرغاية,الناصرية,بغلية,سيدي داود,زموري,قورصو,تيجلابين,بني عمران,عمال,سوق الحد,شعبة العامر,لقاطة,أولاد موسى,حمادي,بودواو البحري,جنات,تاورقة",
    "الطارف": "الطارف,القالة,البسباس,الذرعان,بن مهيدي,الشيحاني,العيون,الشط,الزيتونة,بحيرة الطيور,رمل السوق,بوحجار,حمام بني صالح,الشافية,عين الكرمة",
    "تندوف": "تندوف,أم العسل",
    "تيسمسيلت": "تيسمسيلت,ثنية الحد,برج بونعامة,خميستي,لرجام,الأربعاء,سيدي العنتري,عماري,بني لحسن,تملاحت,أولاد بسام,الملعب,سيدي بوتوشنت,برج الأمير عبد القادر",
    "الوادي": "الوادي,قمار,الرقيبة,الدبيلة,حساني عبد الكريم,الرباح,كوينين,البياضة,النخلة,الطالب العربي,حاسي خليفة,المقرن,ورماس,الحمراية,العقلة,بن قشة,المرارة,سيدي عون,العواسا",
    "خنشلة": "خنشلة,قايس,الحامة,ششار,بابار,عين الطويلة,بوحمامة,أولاد رشاش,يابوس,بغاي,المحمل,الرميلة,جلال,تاوزيانت,الولجة,خيران,أنسيغة",
    "سوق أهراس": "سوق أهراس,سدراتة,تاورة,مداوروش,الحنانشة,المشروحة,أولاد إدريس,أولاد مومن,بئر بوحوش,الراقوبة,الزوابي,خميسة,عين سلطان,ويلان,ترقالت",
    "تيبازة": "تيبازة,شرشال,القليعة,حجوط,فوكة,الدواودة,بوسماعيل,سيدي راشد,سيدي غيلاس,الناظور,أحمر العين,مراد,الحطاطبة,عين تاقورايت,لارهاط,سيدي عمر,قوراية,داموس,بوهارون,مناصر,بورقيقة,الشعيبة",
    "ميلة": "ميلة,فرجيوة,شلغوم العيد,وادي العثمانية,التلاغمة,القرارم قوقة,عين البيضاء أحريش,بوحاتم,ترعي باينان,سيدي مروان,أحمد راشدي,الرواشد,مينار زارزة,الشيقارة,عميرة أراس,دراحي بوصلاح,تسالة لمطاعي,حمالة,يحيى بني قشة,عين الملوك,مشيرة,وادي النجاء",
    "عين الدفلى": "عين الدفلى,خميس مليانة,مليانة,العطاف,العبادية,الروينة,جندل,بومدفع,عين الأشياخ,عين السلطان,الحسينية,بطحية,عين البنيان,الماين,واد الجمعة,بئر ولد خليفة,العامرة,تاشتة زوقاغة,تبركانين,زدين",
    "النعامة": "النعامة,المشرية,عين الصفراء,مغرار,عسلة,البيوض,جنين بورزق,القصدير,تيوت,صفيصيفة,مكمن بن عمار",
    "عين تموشنت": "عين تموشنت,بني صاف,المالح,حمام بوحجر,العامرية,السانية,حاسي الغلة,أولاد بوجمعة,أغلال,عين الكيحل,أولاد كحيل,سيدي بن عدة,وادي الصباح,شنتوف,سيدي صافي,بوزجار,تامزورة",
    "غرداية": "غرداية,بونورة,العطف,القرارة,متليلي,بريان,ضاية بن ضحوة,سبسب,زلفانة,حاسي القارة",
    "غليزان": "غليزان,وادي رهيو,مازونة,عمي موسى,سيدي محمد بن علي,جديوية,يلل,عين طارق,منداس,الرمكة,سيدي خطاب,بلعسل,زمورة,مرجة سيدي عابد,واريزان,الحمادنة,القطار,بني درقن,سوق الحد,دار بن عبد الله,عين الرحمة,سيدي لزرق,لحلاف,أولاد يعيش",
    "تيميمون": "تيميمون,أوقروت,شروين,دلدول,المطارفة,تنركوك,طلمين,أولاد سعيد,قصر قدور",
    "برج باجي مختار": "برج باجي مختار,تيمياوين",
    "أولاد جلال": "أولاد جلال,الدوسن,الشعيبة,البسباس,سيدي خالد,راس الميعاد",
    "بني عباس": "بني عباس,إقلي,كرزاز,الواتة,تبلبالة,تامترت,أولاد خضير,القصابي,بني يخلف",
    "إن صالح": "إن صالح,فقارة الزوى,عين غار",
    "إن قزام": "إن قزام,تين زواتين",
    "تقرت": "تقرت,الزاوية العابدية,النقر,تماسين,الطيبات,الحجيرة,العالية,بلدة عمر,المقارين,بن ناصر,سيدي سليمان,المنقر",
    "جانت": "جانت,برج الحواس",
    "المغير": "المغير,جامعة,سيدي خليل,أم الطيور,سطيل,مرارة,الحمراية,سيدي عمران,المقرن",
    "المنيعة": "المنيعة,حاسي القارة,حاسي لفحل"
  };

  const wilayaNames = Object.keys(municipalities);

  /* =========================
     Supabase
  ========================= */

  function connectSupabase() {
    if (
      !cfg ||
      !cfg.SUPABASE_URL ||
      !cfg.SUPABASE_ANON_KEY
    ) {
      console.error("إعدادات Supabase غير موجودة.");
      return false;
    }

    if (!window.supabase) {
      console.error("مكتبة Supabase غير محملة.");
      return false;
    }

    supabaseClient = window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );

    return true;
  }

  /* =========================
     الولايات
  ========================= */

  function setupWilayas() {
    const select = $("wilaya");

    if (!select) return;

    select.innerHTML =
      '<option value="">اختاري الولاية</option>';

    wilayaNames.forEach((wilaya) => {
      const option = document.createElement("option");
      option.value = wilaya;
      option.textContent = wilaya;
      select.appendChild(option);
    });
  }

  /* =========================
     البلدية
  ========================= */

  function setupMunicipality() {
    const wilayaSelect = $("wilaya");

    if (!wilayaSelect) return;

    let municipality =
      document.querySelector(
        'select[name="municipality"]'
      ) ||
      document.querySelector(
        'input[name="municipality"]'
      );

    if (!municipality) return;

    if (municipality.tagName !== "SELECT") {
      const select = document.createElement("select");

      select.name = "municipality";
      select.id = "municipality";
      select.required = true;

      municipality.replaceWith(select);
      municipality = select;
    }

    municipality.id = "municipality";

    function updateMunicipalities() {
      const selectedWilaya = wilayaSelect.value;

      municipality.innerHTML =
        '<option value="">اختاري البلدية</option>';

      municipality.disabled = !selectedWilaya;

      if (!selectedWilaya) return;

      const list =
        municipalities[selectedWilaya]
          ?.split(",")
          .map((x) => x.trim())
          .filter(Boolean) || [];

      list.forEach((name) => {
        const option =
          document.createElement("option");

        option.value = name;
        option.textContent = name;

        municipality.appendChild(option);
      });
    }

    wilayaSelect.addEventListener(
      "change",
      updateMunicipalities
    );

    updateMunicipalities();
  }

  /* =========================
     تحميل المنتجات
  ========================= */

  async function loadProducts() {
    const list = $("list");

    if (!list) return;

    list.innerHTML =
      '<div class="status">جارٍ تحميل المنتجات...</div>';

    if (!connectSupabase()) {
      list.innerHTML =
        '<div class="status">تعذر الاتصال بقاعدة البيانات.</div>';
      return;
    }

    try {
      const { data, error } =
        await supabaseClient
          .from("products")
          .select("*")
          .order("created_at", {
            ascending: false
          });

      if (error) {
        console.error(
          "Products error:",
          error
        );

        list.innerHTML =
          '<div class="status">تعذر تحميل المنتجات.</div>';

        return;
      }

      products = Array.isArray(data)
        ? data
        : [];

      renderProducts();
    } catch (error) {
      console.error(error);

      list.innerHTML =
        '<div class="status">حدث خطأ أثناء تحميل المنتجات.</div>';
    }
  }

  /* =========================
     عرض المنتجات
  ========================= */

  function filteredProducts() {
    const searchValue =
      normalize($("search")?.value || "");

    return products.filter((product) => {
      const name =
        normalize(product.name);

      const category =
        normalize(product.category);

      const matchesCategory =
        !activeCategory ||
        category === normalize(activeCategory);

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        category.includes(searchValue);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }

  function renderProducts() {
    const list = $("list");

    if (!list) return;

    const visible =
      filteredProducts();

    if (!visible.length) {
      list.innerHTML =
        '<div class="status">لا توجد منتجات مطابقة.</div>';
      return;
    }

    list.innerHTML = visible
      .map((product) => {
        const price =
          Number(product.price || 0);

        const oldPrice =
          Number(
            product.old_price || 0
          );

        const hasOldPrice =
          oldPrice > price;

        const image =
          imageOf(product);

        return `
          <article class="card">

            <div class="card-img">

              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(product.name || "منتج")}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/700x700?text=Hayati'"
              >

              <button
                class="heart"
                type="button"
                aria-label="منتج">
                ♡
              </button>

            </div>

            <div class="card-body">

              <h3>
                ${escapeHtml(
                  product.name || "منتج"
                )}
              </h3>

              ${
                hasOldPrice
                  ? `
                    <div style="
                      display:flex;
                      align-items:center;
                      gap:8px;
                      flex-wrap:wrap;
                    ">
                      <span
                        style="
                          text-decoration:line-through;
                          color:#999;
                          font-size:12px;
                        ">
                        ${formatNumber(oldPrice)} دج
                      </span>

                      <span class="price">
                        ${formatNumber(price)} دج
                      </span>
                    </div>
                  `
                  : `
                    <div class="price">
                      ${formatNumber(price)} دج
                    </div>
                  `
              }

              <button
                class="add"
                type="button"
                data-add="${escapeHtml(product.id)}">
                أضف إلى السلة
              </button>

            </div>
          </article>
        `;
      })
      .join("");

    list
      .querySelectorAll("[data-add]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            addToCart(
              button.dataset.add
            );
          }
        );
      });
  }

  /* =========================
     البحث
  ========================= */

  function setupSearch() {
    const search = $("search");

    if (!search) return;

    search.addEventListener(
      "input",
      renderProducts
    );
  }

  /* =========================
     الأقسام
  ========================= */

  function setupCategories() {
    document
      .querySelectorAll(".cat")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            activeCategory =
              button.dataset.cat || "";

            renderProducts();

            const productsSection =
              $("products");

            productsSection?.scrollIntoView({
              behavior: "smooth"
            });
          }
        );
      });
  }

  /* =========================
     السلة
  ========================= */

  function loadCart() {
    try {
      const saved =
        localStorage.getItem(
          "hayati_cart"
        );

      cart = saved
        ? JSON.parse(saved)
        : [];

      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch {
      cart = [];
    }

    updateCartCount();
  }

  function saveCart() {
    localStorage.setItem(
      "hayati_cart",
      JSON.stringify(cart)
    );

    updateCartCount();
  }

  function updateCartCount() {
    const count =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.qty || 1),
        0
      );

    const counter =
      $("cartCount");

    if (counter) {
      counter.textContent =
        count;
    }
  }

  function addToCart(id) {
    const product =
      products.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (!product) {
      showToast(
        "المنتج غير موجود."
      );
      return;
    }

    const existing =
      cart.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (existing) {
      existing.qty =
        Number(existing.qty || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        old_price: Number(product.old_price || 0),
        image: imageOf(product),
        qty: 1
      });
    }

    saveCart();
    renderCart();

    showToast(
      "تمت إضافة المنتج إلى السلة."
    );
  }

  function cartTotal() {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.qty || 1),
      0
    );
  }

  function renderCart() {
    const box =
      $("cartItems");

    if (!box) return;

    if (!cart.length) {
      box.innerHTML =
        '<p style="text-align:center;padding:20px">السلة فارغة.</p>';

      $("total").textContent =
        "0";

      return;
    }

    box.innerHTML =
      cart
        .map(
          (item, index) => `
            <div class="cart-row">

              <div style="flex:1">

                <strong>
                  ${escapeHtml(item.name)}
                </strong>

                <br>

                <small>
                  ${formatNumber(item.price)} دج
                </small>

              </div>

              <div class="qty">

                <button
                  type="button"
                  data-minus="${index}">
                  −
                </button>

                <span style="padding:0 7px">
                  ${item.qty}
                </span>

                <button
                  type="button"
                  data-plus="${index}">
                  +
                </button>

                <button
                  type="button"
                  class="remove"
                  data-remove="${index}">
                  حذف
                </button>

              </div>

            </div>
          `
        )
        .join("");

    box
      .querySelectorAll("[data-minus]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const index =
              Number(
                button.dataset.minus
              );

            if (!cart[index]) return;

            cart[index].qty--;

            if (
              cart[index].qty <= 0
            ) {
              cart.splice(index, 1);
            }

            saveCart();
            renderCart();
          }
        );
      });

    box
      .querySelectorAll("[data-plus]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const index =
              Number(
                button.dataset.plus
              );

            if (!cart[index]) return;

            cart[index].qty++;

            saveCart();
            renderCart();
          }
        );
      });

    box
      .querySelectorAll("[data-remove]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const index =
              Number(
                button.dataset.remove
              );

            cart.splice(index, 1);

            saveCart();
            renderCart();
          }
        );
      });

    $("total").textContent =
      formatNumber(
        cartTotal()
      );
  }

  /* =========================
     النوافذ
  ========================= */

  function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove(
      "hidden"
    );

    modal.style.display =
      "flex";

    modal.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";

    modal.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function setupModals() {
    $("cartBtn")?.addEventListener(
      "click",
      () => {
        renderCart();
        openModal("cartModal");
      }
    );

    $("closeCart")?.addEventListener(
      "click",
      () => {
        closeModal("cartModal");
      }
    );

    $("closeCheckout")?.addEventListener(
      "click",
      () => {
        closeModal(
          "checkoutModal"
        );
      }
    );

    $("checkoutBtn")?.addEventListener(
      "click",
      () => {
        if (!cart.length) {
          showToast(
            "السلة فارغة."
          );
          return;
        }

        closeModal("cartModal");
        openModal("checkoutModal");
      }
    );

    $("cartModal")?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          $("cartModal")
        ) {
          closeModal(
            "cartModal"
          );
        }
      }
    );

    $("checkoutModal")?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          $("checkoutModal")
        ) {
          closeModal(
            "checkoutModal"
          );
        }
      }
    );
  }

  /* =========================
     إرسال الطلب
  ========================= */

  function setupOrderForm() {
    const form =
      $("orderForm");

    if (!form) return;

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const msg =
          $("orderMsg");

        if (!cart.length) {
          if (msg) {
            msg.textContent =
              "السلة فارغة.";
          }

          return;
        }

        if (!connectSupabase()) {
          if (msg) {
            msg.textContent =
              "تعذر الاتصال بقاعدة البيانات.";
          }

          return;
        }

        const formData =
          new FormData(form);

        const customerName =
          String(
            formData.get(
              "customer_name"
            ) || ""
          ).trim();

        const phone =
          String(
            formData.get(
              "phone"
            ) || ""
          ).trim();

        const wilaya =
          String(
            formData.get(
              "wilaya"
            ) || ""
          ).trim();

        const municipality =
          String(
            formData.get(
              "municipality"
            ) || ""
          ).trim();

        const pickupPoint =
          String(
            formData.get(
              "pickup_point"
            ) || ""
          ).trim();

        if (
          !customerName ||
          !phone ||
          !wilaya ||
          !municipality ||
          !pickupPoint
        ) {
          if (msg) {
            msg.textContent =
              "يرجى ملء جميع الخانات.";
          }

          return;
        }

        const submitButton =
          form.querySelector(
            'button[type="submit"]'
          );

        if (submitButton) {
          submitButton.disabled =
            true;

          submitButton.textContent =
            "جارٍ إرسال الطلب...";
        }

        if (msg) {
          msg.textContent =
            "جارٍ إرسال الطلب...";
        }

        const items =
          cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(
              item.price || 0
            ),
            old_price: Number(
              item.old_price || 0
            ),
            quantity: Number(
              item.qty || 1
            ),
            image:
              item.image || ""
          }));

        const total =
          cartTotal();

        try {
          const { error } =
            await supabaseClient
              .from("orders")
              .insert([
                {
                  customer_name:
                    customerName,
                  phone: phone,
                  wilaya: wilaya,
                  municipality:
                    municipality,
                  pickup_point:
                    pickupPoint,
                  items: items,
                  total: total,
                  status: "pending"
                }
              ]);

          if (error) {
            console.error(
              "Order insert error:",
              error
            );

            if (msg) {
              msg.textContent =
                "لم يتم إرسال الطلب. تحقق من اتصال قاعدة البيانات.";
            }

            return;
          }

          if (msg) {
            msg.textContent =
              "تم إرسال الطلب بنجاح ✅";
          }

          showToast(
            "تم إرسال طلبك بنجاح ❤️"
          );

          cart = [];
          saveCart();
          renderCart();

          form.reset();

          setupMunicipality();

          setTimeout(() => {
            closeModal(
              "checkoutModal"
            );

            if (msg) {
              msg.textContent =
                "";
            }
          }, 1200);

        } catch (error) {
          console.error(
            "Unexpected order error:",
            error
          );

          if (msg) {
            msg.textContent =
              "حدث خطأ أثناء إرسال الطلب.";
          }

        } finally {
          if (submitButton) {
            submitButton.disabled =
              false;

            submitButton.textContent =
              "تأكيد الطلب";
          }
        }
      }
    );
  }

  /* =========================
     تشغيل
  ========================= */

  async function init() {
    loadCart();

    setupWilayas();
    setupMunicipality();

    setupSearch();
    setupCategories();

    setupModals();
    setupOrderForm();

    await loadProducts();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
