(() => {
  "use strict";

  /* =========================================================
     HAYATI STORE - APP.JS
     نسخة إعادة البناء
     ========================================================= */

  const cfg = window.HAYATI_CONFIG || {};

  const $ = (id) => document.getElementById(id);

  let db = null;
  let products = [];
  let cart = [];
  let activeCategory = "";
  let searchText = "";
  let toastTimer = null;

  /* =========================================================
     الولايات والبلديات
     ========================================================= */

  const wilayas = [
    "أدرار",
    "الشلف",
    "الأغواط",
    "أم البواقي",
    "باتنة",
    "بجاية",
    "بسكرة",
    "بشار",
    "البليدة",
    "البويرة",
    "تمنراست",
    "تبسة",
    "تلمسان",
    "تيارت",
    "تيزي وزو",
    "الجزائر",
    "الجلفة",
    "جيجل",
    "سطيف",
    "سعيدة",
    "سكيكدة",
    "سيدي بلعباس",
    "عنابة",
    "قالمة",
    "قسنطينة",
    "المدية",
    "مستغانم",
    "المسيلة",
    "معسكر",
    "ورقلة",
    "وهران",
    "البيض",
    "إليزي",
    "برج بوعريريج",
    "بومرداس",
    "الطارف",
    "تندوف",
    "تيسمسيلت",
    "الوادي",
    "خنشلة",
    "سوق أهراس",
    "تيبازة",
    "ميلة",
    "عين الدفلى",
    "النعامة",
    "عين تموشنت",
    "غرداية",
    "غليزان",
    "تيميمون",
    "برج باجي مختار",
    "أولاد جلال",
    "بني عباس",
    "إن صالح",
    "إن قزام",
    "تقرت",
    "جانت",
    "المغير",
    "المنيعة"
  ];

  const municipalities = {
    "أدرار": [
      "أدرار","تامست","شروين","رقان","إن زغمير","تيت","تمنطيط",
      "فنوغيل","تسابيت","سالي","أولاد أحمد تيمي","بودة","أسبع"
    ],

    "الشلف": [
      "الشلف","تنس","بوقادير","وادي الفضة","الكريمية","الزبوجة",
      "أولاد فارس","أبو الحسن","تاوقريت","بني حواء","المرسى",
      "سيدي عكاشة","عين مران","بنايرية","الصبحة","حرشون","الهرانفة"
    ],

    "الأغواط": [
      "الأغواط","قصر الحيران","عين ماضي","الحويطة","تاجموت",
      "الخنق","قلتة سيدي سعد","البيضاء","سيدي مخلوف","حاسي الرمل"
    ],

    "أم البواقي": [
      "أم البواقي","عين البيضاء","عين مليلة","عين فكرون","عين كرشة",
      "الضلعة","مسكيانة","الحرملية","الزرق","سوق نعمان","العامرية"
    ],

    "باتنة": [
      "باتنة","عين التوتة","مروانة","نقاوس","آريس","بريكة",
      "منعة","تكوت","ثنية العابد","إشمول","المعذر","تازولت"
    ],

    "بجاية": [
      "بجاية","أميزور","أقبو","خراطة","صدوق","تيشي","أوقاس",
      "سيدي عيش","تازمالت","شميني","القصر","ملبو","دراق"
    ],

    "بسكرة": [
      "بسكرة","طولقة","سيدي عقبة","زريبة الوادي","أورلال",
      "فوغالة","ليوة","جمورة","القنطرة","الحوش","عين الناقة"
    ],

    "بشار": [
      "بشار","القنادسة","العبادلة","تاغيت","بني ونيف","كرزاز",
      "تبلبالة","إقلي","عرق فراج"
    ],

    "البليدة": [
      "البليدة","بوعرفة","بوفاريك","الأربعاء","موزاية","العفرون",
      "الشفة","وادي العلايق","بني مراد","بوقرة","الصومعة",
      "الشريعة","حمام ملوان"
    ],

    "البويرة": [
      "البويرة","سور الغزلان","الأخضرية","عين بسام","برج أخريص",
      "مشدا الله","بشلول","حيزر","ديرة","الهاشمية","الجباحية"
    ],

    "تمنراست": [
      "تمنراست","عين أمقل","إدلس","أبلسة","تاظروك","إنغر"
    ],

    "تبسة": [
      "تبسة","الشريعة","العوينات","بئر العاتر","الونزة","مرسط",
      "الماء الأبيض","نقرين","العقلة","الكويف","صفصاف الوسرى"
    ],

    "تلمسان": [
      "تلمسان","المنصورة","شتوان","مغنية","ندرومة","الغزوات",
      "سبدو","بني سنوس","هنين","سوق الثلاثاء","الحناية",
      "الرمشي","أولاد ميمون"
    ],

    "تيارت": [
      "تيارت","فرندة","مهدية","السوقر","قصر الشلالة","رحوية",
      "حمادية","عين الذهب","مدروسة","مغيلة","دحموني"
    ],

    "تيزي وزو": [
      "تيزي وزو","ذراع بن خدة","تيقزيرت","عزازقة","بوغني",
      "عين الحمام","واقنون","ذراع الميزان","مقلع","بوزغن"
    ],

    "الجزائر": [
      "الجزائر الوسطى","المدنية","المرادية","الأبيار","بئر مراد رايس",
      "حيدرة","بن عكنون","الشراقة","دالي إبراهيم","باب الوادي",
      "القصبة","الحمامات","الدار البيضاء","باب الزوار","برج الكيفان",
      "الحراش","براقي","الكاليتوس","الرويبة","الرغاية"
    ],

    "الجلفة": [
      "الجلفة","عين وسارة","حاسي بحبح","مسعد","الإدريسية","دار الشيوخ",
      "حد الصحاري","الشارف","فيض البطمة","البيرين","سيدي لعجال",
      "عين الإبل","زعفران","قطارة","سد رحال","بويرة الأحداب"
    ],

    "جيجل": [
      "جيجل","الطاهير","الميلية","العوانة","القنار نشفي","الشقفة",
      "تاكسنة","زيامة منصورية","سيدي معروف","وجانة"
    ],

    "سطيف": [
      "سطيف","العلمة","عين أرنات","عين ولمان","بوقاعة","عين الكبيرة",
      "صالح باي","حمام قرقور","بئر العرش","جميلة","قجال"
    ],

    "سعيدة": [
      "سعيدة","عين الحجر","الحساسنة","يوب","سيدي بوبكر","مولاي العربي"
    ],

    "سكيكدة": [
      "سكيكدة","عزابة","الحروش","القل","رمضان جمال","الحدائق",
      "تمالوس","الزيتونة","عين قشرة","المرسى"
    ],

    "سيدي بلعباس": [
      "سيدي بلعباس","تسالة","سفيزف","تلاغ","رأس الماء","بن باديس",
      "عين البرد","مرحوم","سيدي علي بوسيدي","مصطفى بن إبراهيم"
    ],

    "عنابة": [
      "عنابة","البوني","الحجار","برحال","سيدي عمار","الشطايبي"
    ],

    "قالمة": [
      "قالمة","هيليوبوليس","حمام دباغ","وادي الزناتي","بوشقوف",
      "قلعة بوصبع","عين مخلوف","خزارة"
    ],

    "قسنطينة": [
      "قسنطينة","الخروب","عين سمارة","حامة بوزيان","ديدوش مراد",
      "ابن زياد","زيغود يوسف","مسعود بوجريو"
    ],

    "المدية": [
      "المدية","البرواقية","قصر البخاري","شلالة العذاورة","تابلاط",
      "العمارية","وزرة","بن شكاو","سيدي نعمان","عين بوسيف"
    ],

    "مستغانم": [
      "مستغانم","مزغران","عين تادلس","حاسي مماش","سيدي علي",
      "عشعاشة","خير الدين","بوقيراط","سيرات","فرناكة"
    ],

    "المسيلة": [
      "المسيلة","بوسعادة","سيدي عيسى","مقرة","برهوم","حمام الضلعة",
      "عين الملح","جبل مساعد","خبانة","أولاد دراج"
    ],

    "معسكر": [
      "معسكر","تيغنيف","المحمدية","سيق","غريس","بوحنيفية",
      "وادي الأبطال","عين فكان","حسين","عوف"
    ],

    "ورقلة": [
      "ورقلة","حاسي مسعود","الرويسات","تقرت","سيدي خويلد",
      "البرمة","حاسي بن عبد الله","الطيبات"
    ],

    "وهران": [
      "وهران","السانية","بئر الجير","قديل","أرزيو","بطيوة",
      "عين الترك","مرسى الحجاج","الكرمة","المرسى الكبير","العامرية"
    ],

    "البيض": [
      "البيض","بوقطب","الأبيض سيدي الشيخ","بريزينة","الرقاصة",
      "بوعلام","كراكدة","الشلالة"
    ],

    "إليزي": [
      "إليزي","جانت","برج الحواس","دبداب","إن أميناس"
    ],

    "برج بوعريريج": [
      "برج بوعريريج","رأس الوادي","المنصورة","برج الغدير",
      "مجانة","الحمادية","بليمور","عين تاغروت"
    ],

    "بومرداس": [
      "بومرداس","دلس","برج منايل","خميس الخشنة","بودواو",
      "الرغاية","يسر","الثنية","بغلية","زموري"
    ],

    "الطارف": [
      "الطارف","القالة","البسباس","الذرعان","الشيحاني",
      "العيون","الزيتونة","الحمامات"
    ],

    "تندوف": [
      "تندوف","أم العسل"
    ],

    "تيسمسيلت": [
      "تيسمسيلت","ثنية الحد","برج بونعامة","لرجام","خميستي",
      "عماري","الأربعاء","سيدي العنتري"
    ],

    "الوادي": [
      "الوادي","الرباح","قمار","الدبيلة","الرقيبة","البياضة",
      "حساني عبد الكريم","الطالب العربي","كوينين","النخلة"
    ],

    "خنشلة": [
      "خنشلة","قايس","ششار","الحامة","بابار","بوحمامة",
      "عين الطويلة","يابوس","أولاد رشاش"
    ],

    "سوق أهراس": [
      "سوق أهراس","سدراتة","تاورة","مداوروش","المشروحة",
      "الحنانشة","الزعرورية","ترقالت"
    ],

    "تيبازة": [
      "تيبازة","القليعة","شرشال","حجوط","فوكة","بواسماعيل",
      "الدواودة","أحمر العين","سيدي راشد","الناظور"
    ],

    "ميلة": [
      "ميلة","فرجيوة","شلغوم العيد","التلاغمة","القرارم قوقة",
      "وادي النجاء","عين الملوك","سيدي مروان","بوحاتم"
    ],

    "عين الدفلى": [
      "عين الدفلى","خميس مليانة","العطاف","مليانة","العبادية",
      "جليدة","الروينة","بومدفع","عين الأشياخ"
    ],

    "النعامة": [
      "النعامة","المشرية","عين الصفراء","مغرار","البيوض",
      "عسلة","صفيصيفة"
    ],

    "عين تموشنت": [
      "عين تموشنت","بني صاف","العامرية","حمام بوحجر","المالح",
      "حاسي الغلة","ولهاصة","عين الكيحل"
    ],

    "غرداية": [
      "غرداية","بونورة","العطف","بريان","متليلي","القرارة",
      "ضاية بن ضحوة","زلفانة"
    ],

    "غليزان": [
      "غليزان","وادي رهيو","مازونة","عمي موسى","جديوية","سيدي أمحمد بن علي",
      "يلل","منداس","عين طارق","زمورة"
    ],

    "تيميمون": [
      "تيميمون","أوقروت","تنركوك","شروين","دلدول","المطارفة"
    ],

    "برج باجي مختار": [
      "برج باجي مختار","تيمياوين"
    ],

    "أولاد جلال": [
      "أولاد جلال","رأس الميعاد","البسباس","الدوسن","سيدي خالد"
    ],

    "بني عباس": [
      "بني عباس","الواتة","إقلي","كرزاز","القصابي","تبلبالة"
    ],

    "إن صالح": [
      "إن صالح","فقارة الزوى","عين صالح"
    ],

    "إن قزام": [
      "إن قزام","تين زواتين"
    ],

    "تقرت": [
      "تقرت","الزاوية العابدية","النزلة","تبسبست","تماسين",
      "الطيبات","المقارين","الحجيرة","العالية"
    ],

    "جانت": [
      "جانت","برج الحواس"
    ],

    "المغير": [
      "المغير","جامعة","المرارة","سيدي خليل","أم الطيور",
      "سطيل","الحمراية"
    ],

    "المنيعة": [
      "المنيعة","حاسي القارة","المنصورة"
    ]
  };

  /* =========================================================
     أدوات عامة
     ========================================================= */

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .trim();
  }

  function money(value) {
    const n = Number(value || 0);

    return `${n.toLocaleString("ar-DZ")} دج`;
  }

  function imageOf(product) {
    return (
      product?.image_url ||
      product?.image ||
      product?.imageUrl ||
      "https://via.placeholder.com/500x500?text=Hayati"
    );
  }

  function toast(message) {
    let box = $("toast");

    if (!box) {
      box = document.createElement("div");
      box.id = "toast";

      Object.assign(box.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "99999",
        background: "#222",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "15px",
        maxWidth: "90%",
        textAlign: "center"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;
    box.hidden = false;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      box.hidden = true;
    }, 2500);
  }

  /* =========================================================
     Supabase
     ========================================================= */

  function connectSupabase() {
    if (
      !cfg.SUPABASE_URL ||
      !cfg.SUPABASE_ANON_KEY
    ) {
      console.error("HAYATI_CONFIG غير موجود");

      toast("تعذر الاتصال بقاعدة البيانات.");

      return false;
    }

    if (!window.supabase || !window.supabase.createClient) {
      console.error("Supabase library غير موجودة");

      toast("خطأ في تحميل Supabase.");

      return false;
    }

    try {
      db = window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      );

      return true;
    } catch (error) {
      console.error(error);
      toast("تعذر إنشاء اتصال قاعدة البيانات.");
      return false;
    }
  }

  /* =========================================================
     السلة
     ========================================================= */

  function loadCart() {
    try {
      const raw = localStorage.getItem("hayati_cart");

      if (!raw) {
        cart = [];
        return;
      }

      const parsed = JSON.parse(raw);

      cart = Array.isArray(parsed)
        ? parsed.filter(item => item && item.id)
        : [];
    } catch (error) {
      console.error("Cart load error:", error);
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(
        "hayati_cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Cart save error:", error);
    }

    updateCartCount();
  }

  function cartTotal() {
    return cart.reduce((sum, item) => {
      return sum + (
        Number(item.price || 0) *
        Number(item.quantity || 1)
      );
    }, 0);
  }

  function updateCartCount() {
    const count = cart.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const btn = $("cartBtn");

    if (btn) {
      const number = btn.querySelector(".cart-count");

      if (number) {
        number.textContent = count;
      } else {
        btn.textContent = `🛍️ السلة ${count}`;
      }
    }

    const possible = [
      $("cartCount"),
      $("cart-count")
    ];

    possible.forEach(el => {
      if (el) el.textContent = count;
    });
  }

  function addToCart(product) {
    if (!product || !product.id) return;

    const existing = cart.find(
      item => String(item.id) === String(product.id)
    );

    if (existing) {
      existing.quantity =
        Number(existing.quantity || 0) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name || "منتج",
        category: product.category || "",
        price: Number(product.price || 0),
        old_price:
          product.old_price == null
            ? null
            : Number(product.old_price),
        image: imageOf(product),
        quantity: 1
      });
    }

    saveCart();
    renderCart();

    toast("تمت إضافة المنتج إلى السلة 🛍️");

    openModal("cartModal");
  }

  function changeQuantity(id, amount) {
    const item = cart.find(
      x => String(x.id) === String(id)
    );

    if (!item) return;

    item.quantity =
      Number(item.quantity || 1) + Number(amount || 0);

    if (item.quantity <= 0) {
      cart = cart.filter(
        x => String(x.id) !== String(id)
      );
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(
      x => String(x.id) !== String(id)
    );

    saveCart();
    renderCart();

    toast("تم حذف المنتج من السلة");
  }

  function renderCart() {
    const box = $("cartItems");
    const total = $("total");

    if (!box) return;

    if (!cart.length) {
      box.innerHTML =
        '<p style="text-align:center;padding:20px">السلة فارغة 🛍️</p>';

      if (total) {
        total.textContent = "0 دج";
      }

      return;
    }

    box.innerHTML = cart.map(item => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);

      return `
        <div class="cart-item"
             style="
               display:flex;
               align-items:center;
               gap:10px;
               padding:10px 0;
               border-bottom:1px solid #eee;
             ">

          <img
            src="${esc(item.image)}"
            alt="${esc(item.name)}"
            style="
              width:65px;
              height:65px;
              object-fit:cover;
              border-radius:10px;
            "
            onerror="this.src='https://via.placeholder.com/100?text=Hayati'"
          >

          <div style="flex:1">

            <strong>${esc(item.name)}</strong>

            <div style="margin-top:4px">
              ${money(price)}
            </div>

            <div
              style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-top:8px;
              "
            >

              <button
                type="button"
                data-action="minus"
                data-id="${esc(item.id)}"
              >−</button>

              <strong>${qty}</strong>

              <button
                type="button"
                data-action="plus"
                data-id="${esc(item.id)}"
              >+</button>

              <button
                type="button"
                data-action="delete"
                data-id="${esc(item.id)}"
              >
                حذف
              </button>

            </div>

          </div>

        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "minus") {
          changeQuantity(id, -1);
        }

        if (action === "plus") {
          changeQuantity(id, 1);
        }

        if (action === "delete") {
          removeFromCart(id);
        }
      });
    });

    if (total) {
      total.textContent = money(cartTotal());
    }
  }

  /* =========================================================
     المنتجات
     ========================================================= */

  function renderProducts(list) {
    const box = $("list");

    if (!box) return;

    if (!list.length) {
      box.innerHTML = `
        <div style="
          text-align:center;
          padding:40px 15px;
        ">
          <h3>لا توجد منتجات</h3>
          <p>لم نجد منتجات مطابقة للبحث.</p>
        </div>
      `;

      return;
    }

    box.innerHTML = list.map(product => {
      const price = Number(product.price || 0);

      const oldPrice =
        product.old_price == null
          ? null
          : Number(product.old_price);

      const image = imageOf(product);

      return `
        <article
          class="product-card"
          data-id="${esc(product.id)}"
        >

          <div class="product-image">
            <img
              src="${esc(image)}"
              alt="${esc(product.name || "منتج")}"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/500x500?text=Hayati'"
            >
          </div>

          <div class="product-info">

            <h3>${esc(product.name || "منتج")}</h3>

            <p class="product-category">
              ${esc(product.category || "")}
            </p>

            ${
              product.description
                ? `<p class="product-description">${esc(product.description)}</p>`
                : ""
            }

            <div class="prices">

              ${
                oldPrice &&
                oldPrice > price
                  ? `
                    <span
                      class="old-price"
                      style="
                        text-decoration:line-through;
                        color:#777;
                        margin-left:8px;
                      "
                    >
                      ${money(oldPrice)}
                    </span>
                  `
                  : ""
              }

              <strong
                class="current-price"
                style="color:#d6336c"
              >
                ${money(price)}
              </strong>

            </div>

            <button
              type="button"
              class="add-to-cart"
              data-id="${esc(product.id)}"
            >
              أضيفي إلى السلة
            </button>

          </div>

        </article>
      `;
    }).join("");

    box.querySelectorAll(".add-to-cart").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;

        const product = products.find(
          p => String(p.id) === String(id)
        );

        if (product) {
          addToCart(product);
        }
      });
    });
  }

  function filterProducts() {
    let result = [...products];

    if (activeCategory) {
      const category = normalize(activeCategory);

      result = result.filter(product => {
        return normalize(product.category) === category;
      });
    }

    if (searchText) {
      const query = normalize(searchText);

      result = result.filter(product => {
        const text = [
          product.name,
          product.category,
          product.description
        ]
          .map(normalize)
          .join(" ");

        return text.includes(query);
      });
    }

    renderProducts(result);
  }

  async function loadProducts() {
    const box = $("list");

    if (box) {
      box.innerHTML = `
        <div style="text-align:center;padding:30px">
          جارٍ تحميل المنتجات...
        </div>
      `;
    }

    if (!db) {
      if (box) {
        box.innerHTML = `
          <div style="text-align:center;padding:30px">
            تعذر الاتصال بقاعدة البيانات.
          </div>
        `;
      }

      return;
    }

    try {
      const result = await db
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false
        });

      if (result.error) {
        console.error(
          "Products loading error:",
          result.error
        );

        if (box) {
          box.innerHTML = `
            <div style="
              text-align:center;
              padding:30px;
            ">
              <h3>تعذر تحميل المنتجات</h3>
              <p>${esc(result.error.message)}</p>
            </div>
          `;
        }

        return;
      }

      products = Array.isArray(result.data)
        ? result.data
        : [];

      /*
        مهم:
        لا نضع منتجات تجريبية إذا كانت قاعدة البيانات فارغة.
      */

      filterProducts();

    } catch (error) {
      console.error(error);

      if (box) {
        box.innerHTML = `
          <div style="text-align:center;padding:30px">
            حدث خطأ أثناء تحميل المنتجات.
          </div>
        `;
      }
    }
  }

  /* =========================================================
     الولايات والبلديات
     ========================================================= */

  function setupWilayas() {
    const select = $("wilaya");

    if (!select) return;

    select.innerHTML =
      '<option value="">اختاري الولاية</option>';

    wilayas.forEach(name => {
      const option = document.createElement("option");

      option.value = name;
      option.textContent = name;

      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      setupMunicipality(select.value);
    });

    setupMunicipality("");
  }

  function setupMunicipality(wilaya) {
    const select = $("municipality");

    if (!select) return;

    select.innerHTML =
      '<option value="">اختاري البلدية</option>';

    if (!wilaya) {
      select.disabled = true;
      return;
    }

    select.disabled = false;

    const list = municipalities[wilaya] || [];

    list.forEach(name => {
      const option = document.createElement("option");

      option.value = name;
      option.textContent = name;

      select.appendChild(option);
    });
  }

  /* =========================================================
     النوافذ المنبثقة
     ========================================================= */

  function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.hidden = false;

    modal.classList.add("show");

    document.body.classList.add("modal-open");
  }

  function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.hidden = true;

    modal.classList.remove("show");

    document.body.classList.remove("modal-open");
  }

  function setupModals() {
    const cartBtn = $("cartBtn");

    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        renderCart();
        openModal("cartModal");
      });
    }

    const closeCart = $("closeCart");

    if (closeCart) {
      closeCart.addEventListener("click", () => {
        closeModal("cartModal");
      });
    }

    const closeCheckout = $("closeCheckout");

    if (closeCheckout) {
      closeCheckout.addEventListener("click", () => {
        closeModal("checkoutModal");
      });
    }

    const checkoutBtn = $("checkoutBtn");

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {

        if (!cart.length) {
          toast("السلة فارغة.");
          return;
        }

        closeModal("cartModal");
        openModal("checkoutModal");
      });
    }

    ["cartModal", "checkoutModal"].forEach(id => {
      const modal = $(id);

      if (!modal) return;

      modal.addEventListener("click", event => {
        if (event.target === modal) {
          closeModal(id);
        }
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;

      closeModal("cartModal");
      closeModal("checkoutModal");
    });
  }

  /* =========================================================
     الطلب
     ========================================================= */

  function setupOrderForm() {
    const form = $("orderForm");

    if (!form) return;

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const msg = $("orderMsg");

      if (msg) {
        msg.textContent = "جارٍ إرسال الطلب...";
      }

      if (!cart.length) {
        if (msg) {
          msg.textContent = "السلة فارغة ❌";
        }

        return;
      }

      if (!db) {
        if (msg) {
          msg.textContent =
            "تعذر الاتصال بقاعدة البيانات ❌";
        }

        return;
      }

      const customerName =
        form.elements["customer_name"]?.value.trim() ||
        $("customer_name")?.value.trim() ||
        "";

      const phone =
        form.elements["phone"]?.value.trim() ||
        $("phone")?.value.trim() ||
        "";

      const wilaya =
        form.elements["wilaya"]?.value.trim() ||
        $("wilaya")?.value.trim() ||
        "";

      const municipality =
        form.elements["municipality"]?.value.trim() ||
        $("municipality")?.value.trim() ||
        "";

      const pickup =
        form.elements["pickup_point"]?.value.trim() ||
        $("pickup_point")?.value.trim() ||
        "";

      if (!customerName) {
        if (msg) msg.textContent = "أدخلي الاسم واللقب ❌";
        return;
      }

      if (!phone) {
        if (msg) msg.textContent = "أدخلي رقم الهاتف ❌";
        return;
      }

      if (!wilaya) {
        if (msg) msg.textContent = "اختاري الولاية ❌";
        return;
      }

      if (!municipality) {
        if (msg) msg.textContent = "اختاري البلدية ❌";
        return;
      }

      if (!pickup) {
        if (msg) {
          msg.textContent =
            "أدخلي نقطة الاستلام أو العنوان ❌";
        }

        return;
      }

      /*
        نخزن داخل الطلب نسخة من المنتجات
        حتى تبقى تفاصيل الطلب موجودة.
      */

      const items = cart.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || "",
        price: Number(item.price || 0),
        old_price:
          item.old_price == null
            ? null
            : Number(item.old_price),
        quantity: Number(item.quantity || 1),
        image: item.image || ""
      }));

      const total = cartTotal();

      const order = {
        customer_name: customerName,
        phone: phone,
        wilaya: wilaya,
        municipality: municipality,
        pickup_point: pickup,
        items: items,
        total: total,
        status: "pending"
      };

      try {
        const result = await db
          .from("orders")
          .insert([order]);

        if (result.error) {
          console.error(
            "Order insert error:",
            result.error
          );

          const realError =
            result.error.message ||
            result.error.details ||
            result.error.hint ||
            result.error.code ||
            "خطأ غير معروف";

          if (msg) {
            msg.innerHTML = `
              <strong>لم يتم إرسال الطلب ❌</strong>
              <br>
              ${esc(realError)}
            `;
          }

          return;
        }

        if (msg) {
          msg.innerHTML =
            "تم إرسال طلبك بنجاح ✅<br>شكرًا لتسوقك من حياتي ❤️";
        }

        cart = [];
        saveCart();
        renderCart();

        form.reset();

        setupMunicipality("");

        setTimeout(() => {
          closeModal("checkoutModal");
        }, 2500);

      } catch (error) {
        console.error(
          "Unexpected order error:",
          error
        );

        if (msg) {
          msg.textContent =
            "حدث خطأ غير متوقع أثناء إرسال الطلب ❌";
        }
      }
    });
  }

  /* =========================================================
     البحث
     ========================================================= */

  function setupSearch() {
    const input = $("search");

    if (!input) return;

    input.addEventListener("input", () => {
      searchText = input.value || "";
      filterProducts();
    });
  }

  /* =========================================================
     الأقسام
     ========================================================= */

  function setupCategories() {
    const possibleButtons = document.querySelectorAll(
      "[data-category]"
    );

    possibleButtons.forEach(button => {
      button.addEventListener("click", () => {

        const category =
          button.dataset.category || "";

        activeCategory = category;

        filterProducts();

        document
          .querySelectorAll("[data-category]")
          .forEach(item => {
            item.classList.remove("active");
          });

        button.classList.add("active");

        const productsSection = $("products");

        if (productsSection) {
          productsSection.scrollIntoView({
            behavior: "smooth"
          });
        }
      });
    });
  }

  /* =========================================================
     أزرار القسم بطريقة إضافية للتوافق
     ========================================================= */

  function setupCategoryTextButtons() {
    const buttons = document.querySelectorAll(
      ".category-btn, .category-card, .category-item"
    );

    buttons.forEach(button => {
      if (button.dataset.category) return;

      const text = normalize(button.textContent);

      let category = "";

      if (text.includes("ملابس")) {
        category = "ملابس";
      } else if (text.includes("عطور")) {
        category = "عطور";
      } else if (
        text.includes("تجميل") ||
        text.includes("مكياج")
      ) {
        category = "مواد التجميل";
      } else if (text.includes("احذيه")) {
        category = "أحذية";
      }

      if (!category) return;

      button.addEventListener("click", () => {
        activeCategory = category;
        filterProducts();

        const productsSection = $("products");

        if (productsSection) {
          productsSection.scrollIntoView({
            behavior: "smooth"
          });
        }
      });
    });
  }

  /* =========================================================
     حماية بسيطة من ضغط زر الطلب بسرعة
     ========================================================= */

  function preventDoubleSubmit() {
    const form = $("orderForm");

    if (!form) return;

    form.addEventListener("submit", () => {
      const button =
        form.querySelector(
          'button[type="submit"], button:not([type])'
        );

      if (!button) return;

      setTimeout(() => {
        button.disabled = false;
      }, 3000);
    });
  }

  /* =========================================================
     تشغيل المتجر
     ========================================================= */

  async function init() {
    console.log("Hayati Store starting...");

    loadCart();
    updateCartCount();
    renderCart();

    setupModals();
    setupOrderForm();
    setupSearch();
    setupCategories();
    setupCategoryTextButtons();
    setupWilayas();
    preventDoubleSubmit();

    const connected = connectSupabase();

    if (!connected) {
      return;
    }

    await loadProducts();

    console.log(
      "Hayati Store ready."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
