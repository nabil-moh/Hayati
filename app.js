(() => {
  "use strict";

  /* =========================
     HAYATI STORE - APP.JS
     نسخة المتجر
  ========================= */

  const cfg = window.HAYATI_CONFIG || {};

  const $ = (id) => document.getElementById(id);

  let db = null;
  let products = [];
  let cart = [];
  let activeCategory = "";
  let toastTimer = null;

  /* =========================
     أدوات عامة
  ========================= */

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ");
  }

  function money(value) {
    return (
      Number(value || 0).toLocaleString("ar-DZ") +
      " دج"
    );
  }

  function imageOf(product) {
    return (
      product?.image_url ||
      product?.image ||
      product?.photo ||
      "https://via.placeholder.com/700x700?text=Hayati"
    );
  }

  function toast(text) {
    const el = $("toast");

    if (!el) {
      console.log(text);
      return;
    }

    el.textContent = text;
    el.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      el.classList.remove("show");
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

  /* =========================
     Supabase
  ========================= */

  function connectSupabase() {
    if (
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

    if (db) return true;

    db = window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );

    window.HAYATI_DB = db;

    return true;
  }

  /* =========================
     السلة
  ========================= */

  function loadCart() {
    try {
      const saved =
        localStorage.getItem("hayati_cart");

      const parsed =
        saved ? JSON.parse(saved) : [];

      cart =
        Array.isArray(parsed)
          ? parsed
          : [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(
      "hayati_cart",
      JSON.stringify(cart)
    );

    renderCart();
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

  function updateCartCount() {
    const count =
      cart.reduce(
        (sum, item) =>
          sum + Number(item.qty || 1),
        0
      );

    const el = $("cartCount");

    if (el) {
      el.textContent = count;
    }
  }

  function addToCart(id) {
    const product =
      products.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    if (!product) return;

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

    toast("تمت إضافة المنتج إلى السلة ✓");
  }

  function changeQuantity(id, amount) {
    const item =
      cart.find(
        (x) =>
          String(x.id) ===
          String(id)
      );

    if (!item) return;

    item.qty =
      Number(item.qty || 1) + amount;

    if (item.qty <= 0) {
      cart =
        cart.filter(
          (x) =>
            String(x.id) !==
            String(id)
        );
    }

    saveCart();
  }

  function removeFromCart(id) {
    cart =
      cart.filter(
        (item) =>
          String(item.id) !==
          String(id)
      );

    saveCart();
  }

  function renderCart() {
    updateCartCount();

    const box =
      $("cartItems");

    if (!box) return;

    if (!cart.length) {
      box.innerHTML =
        '<p class="status">السلة فارغة.</p>';
    } else {
      box.innerHTML =
        cart
          .map(
            (item) => `
              <div class="row">

                <div style="
                  display:flex;
                  align-items:center;
                  gap:10px;
                  flex:1;
                ">

                  ${
                    item.image
                      ? `
                        <img
                          src="${esc(item.image)}"
                          alt="${esc(item.name)}"
                          style="
                            width:55px;
                            height:55px;
                            object-fit:cover;
                            border-radius:10px;
                          "
                          onerror="this.style.display='none'"
                        >
                      `
                      : ""
                  }

                  <span>
                    <strong>
                      ${esc(item.name)}
                    </strong>

                    <br>

                    <small>
                      ${money(item.price)}
                    </small>
                  </span>

                </div>

                <span style="
                  display:flex;
                  align-items:center;
                  gap:5px;
                  flex-wrap:wrap;
                ">

                  <button
                    type="button"
                    data-minus="${esc(item.id)}">
                    −
                  </button>

                  <b>
                    ${Number(item.qty || 1)}
                  </b>

                  <button
                    type="button"
                    data-plus="${esc(item.id)}">
                    +
                  </button>

                  <button
                    type="button"
                    class="remove"
                    data-remove="${esc(item.id)}">
                    حذف
                  </button>

                </span>

              </div>
            `
          )
          .join("");
    }

    const total =
      $("total");

    if (total) {
      total.textContent =
        Number(
          cartTotal()
        ).toLocaleString("ar-DZ");
    }

    box
      .querySelectorAll("[data-minus]")
      .forEach((button) => {
        button.onclick = () => {
          changeQuantity(
            button.dataset.minus,
            -1
          );
        };
      });

    box
      .querySelectorAll("[data-plus]")
      .forEach((button) => {
        button.onclick = () => {
          changeQuantity(
            button.dataset.plus,
            1
          );
        };
      });

    box
      .querySelectorAll("[data-remove]")
      .forEach((button) => {
        button.onclick = () => {
          removeFromCart(
            button.dataset.remove
          );
        };
      });
  }

  /* =========================
     المنتجات
  ========================= */

  function renderProducts() {
    const container =
      $("list");

    if (!container) return;

    const query =
      normalize(
        $("search")?.value || ""
      );

    const visible =
      products.filter(
        (product) => {
          const name =
            normalize(product.name);

          const category =
            normalize(product.category);

          const categoryMatch =
            !activeCategory ||
            category ===
              normalize(activeCategory);

          const searchMatch =
            !query ||
            name.includes(query) ||
            category.includes(query);

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );

    if (!visible.length) {
      container.innerHTML =
        '<div class="status">لا توجد منتجات مطابقة.</div>';
      return;
    }

    container.innerHTML =
      visible
        .map(
          (product) => {
            const price =
              Number(product.price || 0);

            const oldPrice =
              Number(product.old_price || 0);

            const hasOldPrice =
              oldPrice > price;

            return `
              <article class="product">

                <div class="pic">

                  <img
                    src="${esc(imageOf(product))}"
                    alt="${esc(product.name || "منتج")}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:cover;
                    "
                    loading="lazy"
                    onerror="this.style.display='none';this.parentElement.textContent='🛍️'"
                  >

                </div>

                <div class="info">

                  <h3>
                    ${esc(product.name || "منتج")}
                  </h3>

                  <span>
                    ${esc(product.category || "")}
                  </span>

                  ${
                    hasOldPrice
                      ? `
                        <div style="
                          display:flex;
                          gap:8px;
                          align-items:center;
                          flex-wrap:wrap;
                          margin:8px 0;
                        ">

                          <span style="
                            color:#000 !important;
                            text-decoration-line:line-through !important;
                            text-decoration-style:solid !important;
                            text-decoration-thickness:2px !important;
                            font-size:13px;
                          ">
                            ${money(oldPrice)}
                          </span>

                          <strong class="price"
                            style="
                              color:#e00000 !important;
                            ">
                            ${money(price)}
                          </strong>

                        </div>
                      `
                      : `
                        <p
                          class="price"
                          style="
                            color:#e00000 !important;
                          ">
                          ${money(price)}
                        </p>
                      `
                  }

                  <button
                    class="buy"
                    type="button"
                    data-id="${esc(product.id)}">
                    أضيفي إلى السلة
                  </button>

                </div>

              </article>
            `;
          }
        )
        .join("");

    container
      .querySelectorAll(".buy")
      .forEach((button) => {
        button.onclick = () => {
          addToCart(
            button.dataset.id
          );
        };
      });
  }

  async function loadProducts() {
    if (!connectSupabase()) {
      return;
    }

    try {
      const result =
        await db
          .from("products")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (result.error) {
        console.error(
          "Products error:",
          result.error
        );
        return;
      }

      if (
        Array.isArray(result.data)
      ) {
        products =
          result.data.map(
            (product) => ({
              ...product,

              name:
                product.name ||
                product.title ||
                "منتج",

              price:
                Number(
                  product.price || 0
                ),

              old_price:
                Number(
                  product.old_price || 0
                )
            })
          );
      }

      renderProducts();

    } catch (error) {
      console.error(
        "Products loading error:",
        error
      );
    }
  }

  /* =========================
     الولايات
  ========================= */

  function setupWilayas() {
    const select =
      $("wilaya");

    if (!select) return;

    const names =
      Object.keys(
        municipalities
      );

    select.innerHTML =
      '<option value="">اختاري الولاية</option>' +
      names
        .map(
          (name) =>
            `<option value="${esc(name)}">${esc(name)}</option>`
        )
        .join("");
  }

  /* =========================
     البلديات
  ========================= */

  function setupMunicipality() {
    const wilaya =
      $("wilaya");

    if (!wilaya) return;

    let municipality =
      document.querySelector(
        'select[name="municipality"]'
      ) ||
      document.querySelector(
        'input[name="municipality"]'
      );

    if (!municipality) return;

    if (
      municipality.tagName !==
      "SELECT"
    ) {
      const select =
        document.createElement("select");

      select.name =
        "municipality";

      select.id =
        "municipality";

      select.required =
        true;

      municipality.replaceWith(
        select
      );

      municipality =
        select;
    }

    municipality.innerHTML =
      '<option value="">اختاري البلدية</option>';

    municipality.disabled =
      true;

    function update() {
      const selected =
        wilaya.value;

      municipality.innerHTML =
        '<option value="">اختاري البلدية</option>';

      if (!selected) {
        municipality.disabled =
          true;
        return;
      }

      const list =
        String(
          municipalities[selected] ||
          ""
        )
          .split(",")
          .map(
            (x) => x.trim()
          )
          .filter(Boolean);

      list.forEach(
        (name) => {
          const option =
            document.createElement(
              "option"
            );

          option.value =
            name;

          option.textContent =
            name;

          municipality.appendChild(
            option
          );
        }
      );

      municipality.disabled =
        false;
    }

    if (
      !wilaya.dataset.municipalityReady
    ) {
      wilaya.addEventListener(
        "change",
        update
      );

      wilaya.dataset.municipalityReady =
        "true";
    }

    update();
  }

  /* =========================
     النوافذ المنبثقة
  ========================= */

  function openModal(id) {
    const modal =
      typeof id === "string"
        ? $(id)
        : id;

    if (!modal) return;

    modal.style.display =
      "flex";

    modal.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  function closeModal(id) {
    const modal =
      typeof id === "string"
        ? $(id)
        : id;

    if (!modal) return;

    modal.style.display =
      "none";

    modal.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function setupModals() {
    const cartButton =
      $("cartBtn");

    if (cartButton) {
      cartButton.onclick =
        () => {
          renderCart();
          openModal(
            "cartModal"
          );
        };
    }

    const closeCart =
      $("closeCart");

    if (closeCart) {
      closeCart.onclick =
        () => {
          closeModal(
            "cartModal"
          );
        };
    }

    const closeCheckout =
      $("closeCheckout");

    if (closeCheckout) {
      closeCheckout.onclick =
        () => {
          closeModal(
            "checkoutModal"
          );
        };
    }

    const checkout =
      $("checkoutBtn");

    if (checkout) {
      checkout.onclick =
        () => {
          if (!cart.length) {
            toast(
              "السلة فارغة، أضيفي منتجًا أولًا."
            );
            return;
          }

          closeModal(
            "cartModal"
          );

          openModal(
            "checkoutModal"
          );

          const message =
            $("orderMsg");

          if (message) {
            message.textContent =
              "";
          }
        };
    }

    document
      .querySelectorAll(".modal")
      .forEach((modal) => {
        modal.addEventListener(
          "click",
          (event) => {
            if (
              event.target ===
              modal
            ) {
              closeModal(
                modal
              );
            }
          }
        );
      });
  }

  /* =========================
     الطلب
  ========================= */

  function setupOrderForm() {
    const form =
      $("orderForm");

    if (!form) return;

    if (
      form.dataset.ready ===
      "true"
    ) {
      return;
    }

    form.dataset.ready =
      "true";

    form.onsubmit =
      async (event) => {
        event.preventDefault();

        const message =
          $("orderMsg");

        if (message) {
          message.textContent =
            "جاري إرسال الطلب...";
        }

        if (!cart.length) {
          if (message) {
            message.textContent =
              "السلة فارغة.";
          }
          return;
        }

        if (!connectSupabase()) {
          if (message) {
            message.textContent =
              "Supabase غير متصل.";
          }
          return;
        }

        const data =
          new FormData(form);

        const customerName =
          String(
            data.get(
              "customer_name"
            ) || ""
          ).trim();

        const phone =
          String(
            data.get(
              "phone"
            ) || ""
          ).trim();

        const wilaya =
          String(
            data.get(
              "wilaya"
            ) || ""
          ).trim();

        const municipality =
          String(
            data.get(
              "municipality"
            ) || ""
          ).trim();

        const pickup =
          String(
            data.get(
              "pickup_point"
            ) || ""
          ).trim();

        if (
          !customerName ||
          !phone ||
          !wilaya ||
          !municipality ||
          !pickup
        ) {
          if (message) {
            message.textContent =
              "يرجى ملء جميع الخانات المطلوبة.";
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
            "جاري إرسال الطلب...";
        }

        const items =
          cart.map(
            (item) => ({
              id:
                item.id,
              name:
                item.name,
              price:
                Number(
                  item.price || 0
                ),
              old_price:
                Number(
                  item.old_price || 0
                ),
              quantity:
                Number(
                  item.qty || 1
                ),
              image:
                item.image || ""
            })
          );

        const total =
          cartTotal();

        const order = {
          customer_name:
            customerName,

          phone:
            phone,

          wilaya:
            wilaya,

          municipality:
            municipality,

          pickup_point:
            pickup,

          items:
            items,

          total:
            total,

          status:
            "pending"
        };

        console.log(
          "HAYATI ORDER:",
          order
        );

        try {
          const result =
            await db
              .from("orders")
              .insert([
                order
              ]);

          if (result.error) {
            console.error(
              "ORDER ERROR:",
              result.error
            );

            const error =
              result.error;

            if (message) {
              message.innerHTML = `
                <div style="
                  color:#b00000;
                  background:#fff0f0;
                  border:1px solid #ffbcbc;
                  border-radius:10px;
                  padding:12px;
                  line-height:1.8;
                  direction:rtl;
                  text-align:right;
                ">

                  <strong>
                    لم يتم إرسال الطلب ❌
                  </strong>

                  <br>

                  ${esc(
                    error.message ||
                    "خطأ غير معروف"
                  )}

                  ${
                    error.code
                      ? `
                        <br>
                        الكود:
                        ${esc(
                          error.code
                        )}
                      `
                      : ""
                  }

                  ${
                    error.details
                      ? `
                        <br>
                        التفاصيل:
                        ${esc(
                          error.details
                        )}
                      `
                      : ""
                  }

                  ${
                    error.hint
                      ? `
                        <br>
                        الحل:
                        ${esc(
                          error.hint
                        )}
                      `
                      : ""
                  }

                </div>
              `;
            }

            return;
          }

          cart = [];

          saveCart();

          form.reset();

          setupWilayas();

          setupMunicipality();

          if (message) {
            message.innerHTML = `
              <div style="
                color:#087f23;
                background:#effff2;
                border:1px solid #bce8c4;
                border-radius:10px;
                padding:12px;
                text-align:center;
              ">
                تم إرسال طلبك بنجاح ✓
              </div>
            `;
          }

          toast(
            "تم تأكيد طلبك بنجاح ✓"
          );

          setTimeout(() => {
            closeModal(
              "checkoutModal"
            );
          }, 1800);

        } catch (error) {
          console.error(
            "FINAL ORDER ERROR:",
            error
          );

          if (message) {
            message.innerHTML = `
              <div style="
                color:#b00000;
                background:#fff0f0;
                padding:12px;
                border-radius:10px;
                direction:rtl;
              ">
                حدث خطأ:
                ${esc(
                  error?.message ||
                  "تعذر إرسال الطلب"
                )}
              </div>
            `;
          }

        } finally {
          if (submitButton) {
            submitButton.disabled =
              false;

            submitButton.textContent =
              "تأكيد الطلب";
          }
        }
      };
  }

  /* =========================
     البحث والأقسام
  ========================= */

  function setupSearch() {
    const search =
      $("search");

    if (!search) return;

    search.oninput =
      renderProducts;
  }

  function setupCategories() {
    document
      .querySelectorAll(".cat")
      .forEach((button) => {
        button.onclick =
          () => {
            activeCategory =
              activeCategory ===
              button.dataset.cat
                ? ""
                : button.dataset.cat;

            document
              .querySelectorAll(".cat")
              .forEach((item) => {
                item.classList.toggle(
                  "active",
                  item === button &&
                    !!activeCategory
                );
              });

            renderProducts();

            const section =
              $("products");

            if (section) {
              section.scrollIntoView({
                behavior:
                  "smooth"
              });
            }
          };
      });
  }

  /* =========================
     البداية
  ========================= */

  async function init() {
    loadCart();

    setupWilayas();

    setupMunicipality();

    setupSearch();

    setupCategories();

    setupModals();

    setupOrderForm();

    renderCart();

    renderProducts();

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
