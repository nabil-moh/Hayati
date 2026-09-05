(() => {
  "use strict";

  const cfg = window.HAYATI_CONFIG;

  /* =========================
     أدوات عامة
  ========================= */

  const $ = (id) => document.getElementById(id);

  const normalize = (value) => {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ");
  };

  const money = (value) => {
    const n = Number(value || 0);
    return n.toLocaleString("fr-DZ") + " دج";
  };

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* =========================
     منتجات تجريبية
  ========================= */

  const demo = [
    {
      id: "demo-1",
      name: "فستان وردي ناعم",
      category: "ملابس",
      price: 2900,
      old_price: 3500,
      image:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "demo-2",
      name: "عطر نسائي فاخر",
      category: "عطور",
      price: 4500,
      old_price: 5200,
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "demo-3",
      name: "مجموعة مستحضرات تجميل",
      category: "مواد التجميل",
      price: 3200,
      old_price: 3900,
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "demo-4",
      name: "حذاء نسائي أنيق",
      category: "أحذية",
      price: 3900,
      old_price: 4600,
      image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80"
    }
  ];

  let products = [...demo];
  let currentCategory = "الكل";
  let cart = [];

  /* =========================
     الولايات والبلديات
  ========================= */

  const wilayas = {
    "أدرار": [
      "أدرار","تامست","شروين","رڨان","إن زغمير","تيت","تسابيت","فنوغيل",
      "زاوية كنتة","أولف","تيمقتن","تمنطيط","سالي","سبع","أقبلي","أولاد أحمد تيمي"
    ],

    "الشلف": [
      "الشلف","تنس","بني حواء","وادي قوسين","الظهرة","تاوقريت","بوقادير",
      "بني راشد","أولاد بن عبد القادر","الكريمية","حسينية","أولاد فارس",
      "سيدي عكاشة","أبو الحسن","الزبوجة","وادي سلي","الصبحة","مصدق",
      "الحجاج","سنجاس","الهرانفة","بوزغاية","عين مران","المرسى"
    ],

    "الأغواط": [
      "الأغواط","قصر الحيران","بن ناصر بن شهرة","الحاج المشري","العسافية",
      "عين ماضي","تاجموت","الخنق","تاجرونة","قلتة سيدي سعد","حاسي الدلاعة",
      "حاسي الرمل","وادي مرة","وادي مزي","الغيشة","سبقاق","سيدي مخلوف"
    ],

    "أم البواقي": [
      "أم البواقي","عين البيضاء","عين مليلة","عين فكرون","عين كرشة","الحرملية",
      "الزرق","العامرية","بريش","الفجوج بوغرارة سعودي","الرحية","سيقوس",
      "عين ببوش","الجازية","الضلعة","مسكيانة","البلالة","الزوية"
    ],

    "باتنة": [
      "باتنة","مروانة","نقاوس","سريانة","تازولت","عين التوتة","بريكة","أريس",
      "منعة","تكوت","ثنية العابد","بوزينة","المعذر","الحاسي","وادي الماء",
      "فسديس","وادي الشعبة","تيغانيمين","إشمول","إينوغيسن","شير","لمسان",
      "رحبات","عين ياقوت","الشمرة","القصبات","الجزار","أولاد سلام","تيمقاد"
    ],

    "بجاية": [
      "بجاية","أميزور","أوقاس","أدكار","خراطة","سوق الإثنين","تيشي","صدوق",
      "شميني","سيدي عيش","تازمالت","أقبو","إغيل علي","برباشة","بوخليفة",
      "توجة","درقينة","ملبو","تامريجت","لفلاي","القصر","بني معوش","بني جليل",
      "بوحمزة","بني مليكش","تيفرة","تيبان"
    ],

    "بسكرة": [
      "بسكرة","طولقة","أورلال","فوغالة","زريبة الوادي","سيدي عقبة","مشونش",
      "الحوش","ليوة","جمورة","برانيس","القنطرة","عين زعطوط","خنقة سيدي ناجي",
      "المزيرعة","الحاجب","أوماش","مليلي","الغروس","الفيض"
    ],

    "بشار": [
      "بشار","القنادسة","لحمر","العبادلة","بني ونيف","تاغيت","كرزاز",
      "تبلبالة","الواتة","بني عباس","إقلي","القصابي","عرق فراج"
    ],

    "البليدة": [
      "البليدة","بوعينان","بوفاريك","الشفة","الأربعاء","بوقرة","موزاية",
      "الصومعة","وادي العلايق","بني مراد","بني تامو","الشريعة","حمام ملوان",
      "الأوريسية","جبابرة","مفتاح","بن خليل","بني صالح"
    ],

    "البويرة": [
      "البويرة","سور الغزلان","الأخضرية","مشدالله","برج أخريص","عين بسام",
      "حيزر","الهاشمية","بشلول","العجيبة","الشرفة","ديرة","عين الترك",
      "الحاكمية","المقراني","الأسنام","قرومة","أهل القصر","أغبالو","رابطة"
    ],

    "تمنراست": [
      "تمنراست","عين أمقل","أبالسة","إدلس","تازروك","فقارة الزوى"
    ],

    "تبسة": [
      "تبسة","بئر العاتر","الشريعة","العقلة","الونزة","مرسط","الماء الأبيض",
      "نقرين","الكويف","بكارية","الحويجبات","الحمامات","المريج","صفصاف الوسرى",
      "العوينات","ثليجان","بجن","بولحاف الدير","المزرعة","أم علي"
    ],

    "تلمسان": [
      "تلمسان","المنصورة","شتوان","الرمشي","مغنية","سبدو","ندرومة","الغزوات",
      "باب العسة","مرسى بن مهيدي","بني بوسعيد","صبرة","الحناية","أولاد ميمون",
      "عين تالوت","بني سنوس","سيدي الجيلالي","العريشة","بني مستار","عين فزة",
      "عين يوسف","سيدي العبدلي","الفحول","زناتة","أولاد رياح","بوحلو","سوق الثلاثاء"
    ],

    "تيارت": [
      "تيارت","فرندة","مهدية","قصر الشلالة","السوقر","عين الذهب","حمادية",
      "مغيلة","رحوية","دحموني","مدريسة","ملاكو","وادي ليلي","سيدي حسني",
      "سبعين","توسنينة","عين بوشقيف","النعيمة","مشرع الصفا","قرطوفة",
      "تاقدمت","سيدي علي ملال","جيلالي بن عمار","زمالة الأمير عبد القادر"
    ],

    "تيزي وزو": [
      "تيزي وزو","ذراع بن خدة","عزازقة","بوغني","الأربعاء نايث إيراثن",
      "واقنون","ذراع الميزان","تيقزيرت","أزفون","بوزغن","عين الحمام",
      "مقلع","بني دوالة","سوق الإثنين","تادمايت","إفليسن","تيزي راشد",
      "معاتقة","أيت يحيى","أيت محمود","أيت بومهدي","أيت تودرت"
    ],

    "الجزائر": [
      "الجزائر الوسطى","سيدي امحمد","المدنية","المرادية","المرسى","برج الكيفان",
      "باب الزوار","الدار البيضاء","الحراش","بوروبة","باش جراح","براقي",
      "الكاليتوس","سيدي موسى","بئر توتة","تسالة المرجة","الدويرة","الدرارية",
      "العاشور","الرحمانية","زرالدة","سطاوالي","الشراقة","دالي إبراهيم",
      "الحمامات","باب الوادي","بولوغين","القصبة","وادي قريش","رايس حميدو"
    ],

    "الجلفة": [
      "الجلفة","حاسي بحبح","عين وسارة","مسعد","القديد","الإدريسية","فيض البطمة",
      "دار الشيوخ","حد الصحاري","سيدي لعجال","عين الإبل","البيرين","عمورة",
      "زعفران","عين الشهداء","عين معبد","مليليحة","سلمانة","الدويس",
      "تعظميت","بن يعقوب","قرنيني","عين فقه","سيدي بايزيد","الخميس","قطارة"
    ],

    "جيجل": [
      "جيجل","الطاهير","الميلية","العنصر","القنار نشفي","تاكسنة","العوانة",
      "سيدي معروف","الشحنة","غبالة","بودريعة بن ياجيس","وجانة","بوراوي بلهادف",
      "السطارة","جميلة","أولاد رابح","بوسيف أولاد عسكر"
    ],

    "سطيف": [
      "سطيف","العلمة","عين أرنات","عين ولمان","عين آزال","صالح باي","بوقاعة",
      "حمام قرقور","بابور","بني عزيز","عين عباسة","قجال","عين الكبيرة",
      "بئر العرش","الرصفة","مزلوق","الأوريسيا","تيزي نبشار","الدهامشة",
      "بني ورتيلان","بوعنداس","حمام السخنة","جميلة","عين الروى","عموشة",
      "ماوكلان","بني فودة"
    ],

    "سعيدة": [
      "سعيدة","عين الحجر","الحساسنة","يوب","سيدي بوبكر","مولاي العربي",
      "عين السلطان","سيدي أحمد","أولاد خالد","دوي ثابت","عين السخونة"
    ],

    "سكيكدة": [
      "سكيكدة","عزابة","الحروش","القل","تمالوس","رمضان جمال","فلفلة",
      "الحدائق","عين شرشار","بن عزوز","أم الطوب","زردازة","أولاد أحبابة",
      "الزيتونة","عين قشرة","السبت","بوشطاطة","صالح بوالشعور","جندل سعدي محمد",
      "كركرة","بني بشير"
    ],

    "سيدي بلعباس": [
      "سيدي بلعباس","تلاغ","سفيزف","رأس الماء","بن باديس","مرين","مولاي سليسن",
      "تنيرة","تسالة","سيدي علي بوسيدي","عين البرد","السهالة الثورة",
      "سيدي خالد","طابية","بوخنفيس","حاسي دحو","وادي السبع","مرحوم",
      "سيدي لحسن","زروالة","لمطار"
    ],

    "عنابة": [
      "عنابة","البوني","الحجار","برحال","سرايدي","شطايبي","التريعات",
      "وادي العنب","العلامة","الشط"
    ],

    "قالمة": [
      "قالمة","حمام دباغ","وادي الزناتي","هيليوبوليس","بوشقوف","بوحمدان",
      "عين مخلوف","حمام النبائل","قلعة بوصبع","نشماية","بلخير","لخزارة",
      "بن جراح","جبالة الخميسي","الركنية","الفجوج","عين صندل","مجاز عمار"
    ],

    "قسنطينة": [
      "قسنطينة","الخروب","حامة بوزيان","ديدوش مراد","عين سمارة","زيغود يوسف",
      "ابن زياد","مسعود بوجريو","عين عبيد","بن باديس"
    ],

    "المدية": [
      "المدية","البرواقية","قصر البخاري","تابلاط","العمارية","وزرة","سي المحجوب",
      "بن شكاو","الحمدانية","مغراوة","سيدي نعمان","الزبيرية","بعطة","العيساوية",
      "أولاد عنتر","سغوان","الشهبونية","بوسكن","خمس جوامع","عين بوسيف","شلالة العذاورة"
    ],

    "مستغانم": [
      "مستغانم","عين تادلس","حاسي ماماش","سيدي علي","ماسرة","مزغران","عشعاشة",
      "خير الدين","سيدي لخضر","فرناكة","بوقيراط","عين النويصي","الطواهرية",
      "نقمارية","منصورة","ستيدية","صيادة","سيدي بلعطار","أولاد بوغالم"
    ],

    "المسيلة": [
      "المسيلة","بوسعادة","مقرة","سيدي عيسى","حمام الضلعة","عين الحجل",
      "برهوم","أولاد دراج","شلال","جبل مساعد","خبانة","محمد بوضياف",
      "عين الخضراء","بلعايبة","بن سرور","زرزور","أمسيف","عين الملح",
      "سيدي عامر","الهامل","ولتام","المعاضيد","ونوغة","بني يلمان"
    ],

    "معسكر": [
      "معسكر","بوحنيفية","غريس","سيق","تيغنيف","محمدية","عين فارس","الحشم",
      "عوف","وادي الأبطال","البرج","القطنة","تيزي","المنور","المامونية",
      "عين فكان","عقاز","القرط","زهانة","البرج الأبيض","سيدي قادة"
    ],

    "ورقلة": [
      "ورقلة","الرويسات","عين البيضاء","حاسي مسعود","حاسي بن عبد الله",
      "أنقوسة","سيدي خويلد","البرمة","الطيبات","الحجيرة","العالية"
    ],

    "وهران": [
      "وهران","السانية","بئر الجير","قديل","بطيوة","أرزيو","مرسى الحجاج",
      "عين الترك","بوتليليس","بوسفر","الكرمة","سيدي الشحمي","البرية",
      "حاسي بن عقبة","حاسي بونيف","مسرغين","المنزه"
    ],

    "البيض": [
      "البيض","بوقطب","بريزينة","بوعلام","رقاصة","الأبيض سيدي الشيخ",
      "الخيثر","المحرة","كراكدة","اربوات","بنود","ستيتن","عين العراك",
      "الشلالة","سيدي طيفور"
    ],

    "إليزي": [
      "إليزي","جانت","برج عمر إدريس","دبداب","إن أمناس"
    ],

    "برج بوعريريج": [
      "برج بوعريريج","رأس الوادي","برج الغدير","المنصورة","مجانة","الحمادية",
      "عين تاغروت","بئر قاصد علي","برج زمورة","مجانة","غيلاسة","العناصر",
      "حسناوة","الماين","تفرق","أولاد إبراهيم","الجعافرة","تسامرت"
    ],

    "بومرداس": [
      "بومرداس","برج منايل","دلس","خميس الخشنة","الثنية","يسر","بودواو",
      "الرغاية","الناصرية","بغلية","سيدي داود","زموري","قورصو","تيجلابين",
      "بني عمران","عمال","سوق الحد","شعبة العامر","لقاطة","أولاد موسى",
      "حمادي","بودواو البحري","جنات","تاورقة"
    ],

    "الطارف": [
      "الطارف","القالة","البسباس","الذرعان","بن مهيدي","الشيحاني","العيون",
      "الشط","الزيتونة","بحيرة الطيور","رمل السوق","بوحجار","حمام بني صالح",
      "الشافية","عين الكرمة","الحمراية","الصفصاف"
    ],

    "تندوف": [
      "تندوف","أم العسل"
    ],

    "تيسمسيلت": [
      "تيسمسيلت","ثنية الحد","برج بونعامة","خميستي","لرجام","الأربعاء",
      "سيدي العنتري","عماري","بني لحسن","تملاحت","أولاد بسام","الملعب",
      "سيدي بوتوشنت","برج الأمير عبد القادر"
    ],

    "الوادي": [
      "الوادي","قمار","الرقيبة","الدبيلة","حساني عبد الكريم","الرباح",
      "كوينين","البياضة","النخلة","الطالب العربي","حاسي خليفة","المقرن",
      "ورماس","الحمراية","العقلة","بن قشة","المرارة","سيدي عون","العواسا"
    ],

    "خنشلة": [
      "خنشلة","قايس","الحامة","ششار","بابار","عين الطويلة","بوحمامة",
      "أولاد رشاش","يابوس","بغاي","المحمل","الرميلة","جلال","تاوزيانت",
      "الولجة","خيران","أنسيغة"
    ],

    "سوق أهراس": [
      "سوق أهراس","سدراتة","تاورة","مداوروش","الحنانشة","المشروحة",
      "أولاد إدريس","أولاد مومن","بئر بوحوش","الراقوبة","الزوابي",
      "خميسة","عين سلطان","ويلان","ترقالت"
    ],

    "تيبازة": [
      "تيبازة","شرشال","القليعة","حجوط","فوكة","الدواودة","بوسماعيل",
      "سيدي راشد","سيدي غيلاس","الناظور","أحمر العين","مراد","الحطاطبة",
      "عين تاقورايت","خميستي","لارهاط","سيدي عمر","قوراية","داموس",
      "بوهارون","مناصر","بورقيقة","الشعيبة"
    ],

    "ميلة": [
      "ميلة","فرجيوة","شلغوم العيد","وادي العثمانية","التلاغمة","القرارم قوقة",
      "عين البيضاء أحريش","بوحاتم","ترعي باينان","سيدي مروان","أحمد راشدي",
      "الرواشد","مينار زارزة","الشيقارة","عميرة أراس","دراحي بوصلاح",
      "تسالة لمطاعي","حمالة","يحيى بني قشة","عين الملوك","مشيرة","وادي النجاء"
    ],

    "عين الدفلى": [
      "عين الدفلى","خميس مليانة","مليانة","العطاف","العبادية","الروينة",
      "جندل","بومدفع","عين الأشياخ","عين السلطان","الحسينية","بطحية",
      "عين البنيان","الماين","واد الجمعة","بئر ولد خليفة","العامرة",
      "تاشتة زوقاغة","تبركانين","الحسينية","زدين"
    ],

    "النعامة": [
      "النعامة","المشرية","عين الصفراء","مغرار","عسلة","البيوض","جنين بورزق",
      "القصدير","تيوت","صفيصيفة","مكمن بن عمار"
    ],

    "عين تموشنت": [
      "عين تموشنت","بني صاف","المالح","حمام بوحجر","العامرية","السانية",
      "حاسي الغلة","أولاد بوجمعة","أغلال","عين الكيحل","أولاد كحيل",
      "سيدي بن عدة","وادي الصباح","شنتوف","سيدي صافي","بوزجار","تامزورة",
      "تيرف","عقبى"
    ],

    "غرداية": [
      "غرداية","بونورة","العطف","القرارة","متليلي","بريان","ضاية بن ضحوة",
      "سبسب","زلفانة","المنيعة","حاسي القارة","الڨرارة"
    ],

    "غليزان": [
      "غليزان","وادي رهيو","مازونة","عمي موسى","سيدي محمد بن علي","جديوية",
      "يلل","عين طارق","منداس","الرمكة","سيدي خطاب","بلعسل","زمورة",
      "مرجة سيدي عابد","واريزان","الحمادنة","القطار","بني درقن","سوق الحد",
      "دار بن عبد الله","عين الرحمة","سيدي لزرق","لحلاف","أولاد يعيش"
    ],

    "تيميمون": [
      "تيميمون","أوقروت","شروين","دلدول","المطارفة","تنركوك","طلمين",
      "أولاد سعيد","قصر قدور","المسيلة","السبع"
    ],

    "برج باجي مختار": [
      "برج باجي مختار","تيمياوين"
    ],

    "أولاد جلال": [
      "أولاد جلال","الدوسن","الشعيبة","البسباس","سيدي خالد","راس الميعاد"
    ],

    "بني عباس": [
      "بني عباس","إقلي","كرزاز","الواتة","تبلبالة","تامترت","أولاد خضير",
      "القصابي","بني يخلف"
    ],

    "إن صالح": [
      "إن صالح","فقارة الزوى","عين غار"
    ],

    "إن قزام": [
      "إن قزام","تين زواتين"
    ],

    "تقرت": [
      "تقرت","الزاوية العابدية","النقر","تماسين","الطيبات","الحجيرة",
      "العالية","بلدة عمر","المقارين","بن ناصر","سيدي سليمان","المنقر"
    ],

    "جانت": [
      "جانت","برج الحواس"
    ],

    "المغير": [
      "المغير","جامعة","سيدي خليل","أم الطيور","سطيل","مرارة","الحمراية",
      "سيدي عمران","المقرن"
    ],

    "المنيعة": [
      "المنيعة","حاسي القارة","حاسي لفحل"
    ]
  };

  /* =========================
     إنشاء/تعديل خانة البلدية
  ========================= */

  function setupMunicipality() {
    const wilayaEl = $("wilaya");
    if (!wilayaEl) return;

    let municipalityEl = $("municipality");

    if (!municipalityEl) {
      const old =
        $("commune") ||
        document.querySelector('[name="municipality"]') ||
        document.querySelector('[name="commune"]');

      if (old) municipalityEl = old;
    }

    if (!municipalityEl) return;

    if (municipalityEl.tagName !== "SELECT") {
      const select = document.createElement("select");

      for (const attr of municipalityEl.attributes) {
        if (attr.name !== "type" && attr.name !== "value") {
          select.setAttribute(attr.name, attr.value);
        }
      }

      select.id = "municipality";
      select.name = "municipality";
      select.required = true;

      municipalityEl.replaceWith(select);
      municipalityEl = select;
    }

    municipalityEl.innerHTML =
      '<option value="">اختر البلدية</option>';

    municipalityEl.disabled = true;

    wilayaEl.addEventListener("change", () => {
      const selectedWilaya = wilayaEl.value;
      const communes = wilayas[selectedWilaya] || [];

      municipalityEl.innerHTML =
        '<option value="">اختر البلدية</option>';

      communes.forEach((commune) => {
        const option = document.createElement("option");
        option.value = commune;
        option.textContent = commune;
        municipalityEl.appendChild(option);
      });

      municipalityEl.disabled = communes.length === 0;

      if (!communes.length) {
        municipalityEl.innerHTML =
          '<option value="">لا توجد بلديات مسجلة لهذه الولاية</option>';
      }
    });
  }

  /* =========================
     تعبئة الولايات
  ========================= */

  function setupWilayas() {
    const select = $("wilaya");
    if (!select) return;

    const current = select.value;

    select.innerHTML =
      '<option value="">اختر الولاية</option>';

    Object.keys(wilayas).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    if (current && wilayas[current]) {
      select.value = current;
    }
  }

  /* =========================
     تحميل السلة
  ========================= */

  function loadCart() {
    try {
      const saved = localStorage.getItem("hayati_cart");
      cart = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem("hayati_cart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const count = cart.reduce(
      (sum, item) => sum + Number(item.qty || 1),
      0
    );

    if ($("cartCount")) {
      $("cartCount").textContent = count;
    }
  }

  /* =========================
     عرض المنتجات
  ========================= */

  function getProductImage(product) {
    return (
      product.image_url ||
      product.image ||
      product.photo ||
      "https://via.placeholder.com/600x600?text=Hayati"
    );
  }

  function renderProducts(list = products) {
    const container = $("list");
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px">
          لا توجد منتجات مطابقة للبحث
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map((product) => {
        const price = Number(product.price || 0);
        const oldPrice = Number(product.old_price || 0);

        return `
          <article class="product-card">
            <img
              src="${escapeHtml(getProductImage(product))}"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/600x600?text=Hayati'"
            >

            <div class="product-info">
              <div class="product-category">
                ${escapeHtml(product.category || "")}
              </div>

              <h3>${escapeHtml(product.name || "منتج")}</h3>

              <div class="prices">
                ${
                  oldPrice > price
                    ? `<span class="old-price">${money(oldPrice)}</span>`
                    : ""
                }

                <span class="price">${money(price)}</span>
              </div>

              <button
                type="button"
                class="add-cart"
                data-id="${escapeHtml(product.id)}"
              >
                أضف إلى السلة
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll(".add-cart").forEach((button) => {
      button.addEventListener("click", () => {
        addToCart(button.dataset.id);
      });
    });
  }

  /* =========================
     البحث
  ========================= */

  function applyFilters() {
    const searchInput = $("search");
    const searchText = normalize(searchInput?.value || "");

    let filtered = [...products];

    if (currentCategory && currentCategory !== "الكل") {
      const category = normalize(currentCategory);

      filtered = filtered.filter(
        (product) =>
          normalize(product.category) === category
      );
    }

    if (searchText) {
      filtered = filtered.filter((product) => {
        const name = normalize(product.name);
        const category = normalize(product.category);

        return (
          name.includes(searchText) ||
          category.includes(searchText)
        );
      });
    }

    renderProducts(filtered);
  }

  function setupSearch() {
    const input = $("search");
    if (!input) return;

    input.addEventListener("input", applyFilters);

    input.addEventListener("search", applyFilters);
  }

  /* =========================
     الأقسام
  ========================= */

  function setupCategories() {
    document.querySelectorAll(".cat").forEach((button) => {
      button.addEventListener("click", () => {
        currentCategory =
          button.dataset.cat ||
          button.getAttribute("data-category") ||
          button.textContent.trim();

        applyFilters();
      });
    });
  }

  /* =========================
     السلة
  ========================= */

  function addToCart(id) {
    const product = products.find(
      (item) => String(item.id) === String(id)
    );

    if (!product) return;

    const existing = cart.find(
      (item) => String(item.id) === String(id)
    );

    if (existing) {
      existing.qty = Number(existing.qty || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image: getProductImage(product),
        qty: 1
      });
    }

    saveCart();
    renderCart();

    const cartBtn = $("cartBtn");
    if (cartBtn) cartBtn.click();
  }

  function renderCart() {
    const container =
      $("cartList") ||
      $("cartItems") ||
      document.querySelector(".cart-items");

    if (!container) return;

    if (!cart.length) {
      container.innerHTML = "<p>السلة فارغة.</p>";
      updateCartCount();
      return;
    }

    container.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">
            <img
              src="${escapeHtml(item.image || "")}"
              alt="${escapeHtml(item.name)}"
              onerror="this.src='https://via.placeholder.com/100x100?text=Hayati'"
            >

            <div class="cart-item-info">
              <strong>${escapeHtml(item.name)}</strong>
              <div>${money(item.price)}</div>

              <div class="cart-qty">
                <button type="button" data-cart-minus="${index}">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-plus="${index}">+</button>
                <button type="button" data-cart-remove="${index}">
                  حذف
                </button>
              </div>
            </div>
          </div>
        `
      )
      .join("");

    container
      .querySelectorAll("[data-cart-minus]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.cartMinus);

          if (cart[index]) {
            cart[index].qty--;

            if (cart[index].qty <= 0) {
              cart.splice(index, 1);
            }
          }

          saveCart();
          renderCart();
        });
      });

    container
      .querySelectorAll("[data-cart-plus]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.cartPlus);

          if (cart[index]) {
            cart[index].qty++;
          }

          saveCart();
          renderCart();
        });
      });

    container
      .querySelectorAll("[data-cart-remove]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.cartRemove);

          cart.splice(index, 1);

          saveCart();
          renderCart();
        });
      });

    updateCartTotal();
  }

  function getCartTotal() {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.qty || 1),
      0
    );
  }

  function updateCartTotal() {
    const total = getCartTotal();

    const elements = [
      $("cartTotal"),
      $("total"),
      document.querySelector(".cart-total")
    ].filter(Boolean);

    elements.forEach((element) => {
      element.textContent = money(total);
    });
  }

  /* =========================
     ربط Supabase
  ========================= */

  async function loadProductsFromSupabase() {
    if (
      !cfg ||
      !cfg.SUPABASE_URL ||
      !cfg.SUPABASE_ANON_KEY ||
      !window.supabase
    ) {
      console.warn("Supabase غير متوفر، سيتم استعمال المنتجات التجريبية.");
      renderProducts();
      return;
    }

    try {
      const client = window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      );

      const { data, error } = await client
        .from("products")
        .select("*");

      if (error) {
        console.error("خطأ في تحميل المنتجات:", error);
        renderProducts();
        return;
      }

      if (Array.isArray(data) && data.length) {
        products = data;
      } else {
        products = [...demo];
      }

      applyFilters();
    } catch (error) {
      console.error(error);
      renderProducts();
    }
  }

  /* =========================
     فتح/غلق النوافذ
  ========================= */

  function setupModals() {
    const cartBtn = $("cartBtn");

    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        renderCart();

        const modal =
          $("cartModal") ||
          document.querySelector(".cart-modal");

        if (modal) {
          modal.classList.add("show");
          modal.style.display = "flex";
        }
      });
    }

    document.querySelectorAll(
      "[data-close], .close, .modal-close"
    ).forEach((button) => {
      button.addEventListener("click", () => {
        const modal =
          button.closest(".modal") ||
          button.parentElement;

        if (modal) {
          modal.classList.remove("show");
          modal.style.display = "none";
        }
      });
    });
  }

  /* =========================
     الطلب
  ========================= */

  function setupOrderForm() {
    const form = $("orderForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!cart.length) {
        alert("السلة فارغة.");
        return;
      }

      const name =
        $("customerName")?.value.trim() ||
        $("name")?.value.trim() ||
        form.querySelector('[name="customer_name"]')?.value.trim() ||
        "";

      const phone =
        $("phone")?.value.trim() ||
        form.querySelector('[name="phone"]')?.value.trim() ||
        "";

      const wilaya =
        $("wilaya")?.value.trim() ||
        "";

      const municipality =
        $("municipality")?.value.trim() ||
        $("commune")?.value.trim() ||
        "";

      const pickupPoint =
        $("pickupPoint")?.value.trim() ||
        $("pickup_point")?.value.trim() ||
        form.querySelector('[name="pickup_point"]')?.value.trim() ||
        "";

      if (!name) {
        alert("يرجى إدخال الاسم.");
        return;
      }

      if (!phone) {
        alert("يرجى إدخال رقم الهاتف.");
        return;
      }

      if (!wilaya) {
        alert("يرجى اختيار الولاية.");
        return;
      }

      if (!municipality) {
        alert("يرجى اختيار البلدية.");
        return;
      }

      if (!pickupPoint) {
        alert("يرجى إدخال نقطة الاستلام أو العنوان.");
        return;
      }

      if (
        !cfg ||
        !cfg.SUPABASE_URL ||
        !cfg.SUPABASE_ANON_KEY ||
        !window.supabase
      ) {
        alert(
          "تعذر الاتصال بقاعدة البيانات. تحقق من إعدادات Supabase."
        );
        return;
      }

      const client = window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      );

      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        image: item.image || ""
      }));

      const total = getCartTotal();

      const { error } = await client
        .from("orders")
        .insert([
          {
            customer_name: name,
            phone: phone,
            wilaya: wilaya,
            municipality: municipality,
            pickup_point: pickupPoint,
            items: items,
            total: total,
            status: "pending"
          }
        ]);

      if (error) {
        console.error("خطأ في إرسال الطلب:", error);

        alert(
          "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى."
        );

        return;
      }

      alert(
        "تم إرسال طلبك بنجاح. شكرًا لاختيارك متجر حياتي ❤️"
      );

      cart = [];
      saveCart();
      renderCart();

      form.reset();

      const municipalityEl = $("municipality");

      if (municipalityEl) {
        municipalityEl.innerHTML =
          '<option value="">اختر البلدية</option>';

        municipalityEl.disabled = true;
      }

      const checkoutModal =
        $("checkoutModal") ||
        document.querySelector(".checkout-modal");

      if (checkoutModal) {
        checkoutModal.classList.remove("show");
        checkoutModal.style.display = "none";
      }
    });
  }

  /* =========================
     زر إتمام الطلب
  ========================= */

  function setupCheckoutButton() {
    const buttons = document.querySelectorAll(
      "#checkoutBtn, .checkout-btn, [data-checkout]"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!cart.length) {
          alert("السلة فارغة.");
          return;
        }

        const modal =
          $("checkoutModal") ||
          document.querySelector(".checkout-modal");

        if (modal) {
          modal.classList.add("show");
          modal.style.display = "flex";
        }
      });
    });
  }

  /* =========================
     تشغيل المتجر
  ========================= */

  async function init() {
    loadCart();

    setupWilayas();
    setupMunicipality();

    setupSearch();
    setupCategories();

    setupModals();
    setupOrderForm();
    setupCheckoutButton();

    renderProducts();
    renderCart();

    await loadProductsFromSupabase();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
