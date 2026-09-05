(() => {
  "use strict";

  /* =========================================================
     HAYATI STORE - APP.JS
     النسخة المصححة
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
    "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار",
    "البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر",
    "الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة",
    "قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض",
    "إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي",
    "خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت",
    "غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس",
    "إن صالح","إن قزام","تقرت","جانت","المغير","المنيعة"
  ];

  const municipalities = {
    "أدرار":["أدرار","تامست","شروين","رقان","إن زغمير","تيت","تمنطيط","فنوغيل","تسابيت","سالي","أولاد أحمد تيمي","بودة","أسبع"],
    "الشلف":["الشلف","تنس","بوقادير","وادي الفضة","الكريمية","الزبوجة","أولاد فارس","أبو الحسن","تاوقريت","بني حواء","المرسى","سيدي عكاشة","عين مران","بنايرية","الصبحة","حرشون","الهرانفة"],
    "الأغواط":["الأغواط","قصر الحيران","عين ماضي","الحويطة","تاجموت","الخنق","قلتة سيدي سعد","البيضاء","سيدي مخلوف","حاسي الرمل"],
    "أم البواقي":["أم البواقي","عين البيضاء","عين مليلة","عين فكرون","عين كرشة","الضلعة","مسكيانة","الحرملية","الزرق","سوق نعمان","العامرية"],
    "باتنة":["باتنة","عين التوتة","مروانة","نقاوس","آريس","بريكة","منعة","تكوت","ثنية العابد","إشمول","المعذر","تازولت"],
    "بجاية":["بجاية","أميزور","أقبو","خراطة","صدوق","تيشي","أوقاس","سيدي عيش","تازمالت","شميني","القصر","ملبو","دراق"],
    "بسكرة":["بسكرة","طولقة","سيدي عقبة","زريبة الوادي","أورلال","فوغالة","ليوة","جمورة","القنطرة","الحوش","عين الناقة"],
    "بشار":["بشار","القنادسة","العبادلة","تاغيت","بني ونيف","كرزاز","تبلبالة","إقلي","عرق فراج"],
    "البليدة":["البليدة","بوعرفة","بوفاريك","الأربعاء","موزاية","العفرون","الشفة","وادي العلايق","بني مراد","بوقرة","الصومعة","الشريعة","حمام ملوان"],
    "البويرة":["البويرة","سور الغزلان","الأخضرية","عين بسام","برج أخريص","مشدا الله","بشلول","حيزر","ديرة","الهاشمية","الجباحية"],
    "تمنراست":["تمنراست","عين أمقل","إدلس","أبلسة","تاظروك","إنغر"],
    "تبسة":["تبسة","الشريعة","العوينات","بئر العاتر","الونزة","مرسط","الماء الأبيض","نقرين","العقلة","الكويف","صفصاف الوسرى"],
    "تلمسان":["تلمسان","المنصورة","شتوان","مغنية","ندرومة","الغزوات","سبدو","بني سنوس","هنين","سوق الثلاثاء","الحناية","الرمشي","أولاد ميمون"],
    "تيارت":["تيارت","فرندة","مهدية","السوقر","قصر الشلالة","رحوية","حمادية","عين الذهب","مدروسة","مغيلة","دحموني"],
    "تيزي وزو":["تيزي وزو","ذراع بن خدة","تيقزيرت","عزازقة","بوغني","عين الحمام","واقنون","ذراع الميزان","مقلع","بوزغن"],
    "الجزائر":["الجزائر الوسطى","المدنية","المرادية","الأبيار","بئر مراد رايس","حيدرة","بن عكنون","الشراقة","دالي إبراهيم","باب الوادي","القصبة","الحمامات","الدار البيضاء","باب الزوار","برج الكيفان","الحراش","براقي","الكاليتوس","الرويبة","الرغاية"],
    "الجلفة":["الجلفة","عين وسارة","حاسي بحبح","مسعد","الإدريسية","دار الشيوخ","حد الصحاري","الشارف","فيض البطمة","البيرين","سيدي لعجال","عين الإبل","زعفران","قطارة","سد رحال","بويرة الأحداب"],
    "جيجل":["جيجل","الطاهير","الميلية","العوانة","القنار نشفي","الشقفة","تاكسنة","زيامة منصورية","سيدي معروف","وجانة"],
    "سطيف":["سطيف","العلمة","عين أرنات","عين ولمان","بوقاعة","عين الكبيرة","صالح باي","حمام قرقور","بئر العرش","جميلة","قجال"],
    "سعيدة":["سعيدة","عين الحجر","الحساسنة","يوب","سيدي بوبكر","مولاي العربي"],
    "سكيكدة":["سكيكدة","عزابة","الحروش","القل","رمضان جمال","الحدائق","تمالوس","الزيتونة","عين قشرة","المرسى"],
    "سيدي بلعباس":["سيدي بلعباس","تسالة","سفيزف","تلاغ","رأس الماء","بن باديس","عين البرد","مرحوم","سيدي علي بوسيدي","مصطفى بن إبراهيم"],
    "عنابة":["عنابة","البوني","الحجار","برحال","سيدي عمار","الشطايبي"],
    "قالمة":["قالمة","هيليوبوليس","حمام دباغ","وادي الزناتي","بوشقوف","قلعة بوصبع","عين مخلوف","خزارة"],
    "قسنطينة":["قسنطينة","الخروب","عين سمارة","حامة بوزيان","ديدوش مراد","ابن زياد","زيغود يوسف","مسعود بوجريو"],
    "المدية":["المدية","البرواقية","قصر البخاري","شلالة العذاورة","تابلاط","العمارية","وزرة","بن شكاو","سيدي نعمان","عين بوسيف"],
    "مستغانم":["مستغانم","مزغران","عين تادلس","حاسي مماش","سيدي علي","عشعاشة","خير الدين","بوقيراط","سيرات","فرناكة"],
    "المسيلة":["المسيلة","بوسعادة","سيدي عيسى","مقرة","برهوم","حمام الضلعة","عين الملح","جبل مساعد","خبانة","أولاد دراج"],
    "معسكر":["معسكر","تيغنيف","المحمدية","سيق","غريس","بوحنيفية","وادي الأبطال","عين فكان","حسين","عوف"],
    "ورقلة":["ورقلة","حاسي مسعود","الرويسات","تقرت","سيدي خويلد","البرمة","حاسي بن عبد الله","الطيبات"],
    "وهران":["وهران","السانية","بئر الجير","قديل","أرزيو","بطيوة","عين الترك","مرسى الحجاج","الكرمة","المرسى الكبير","العامرية"],
    "البيض":["البيض","بوقطب","الأبيض سيدي الشيخ","بريزينة","الرقاصة","بوعلام","كراكدة","الشلالة"],
    "إليزي":["إليزي","جانت","برج الحواس","دبداب","إن أميناس"],
    "برج بوعريريج":["برج بوعريريج","رأس الوادي","المنصورة","برج الغدير","مجانة","الحمادية","بليمور","عين تاغروت"],
    "بومرداس":["بومرداس","دلس","برج منايل","خميس الخشنة","بودواو","الرغاية","يسر","الثنية","بغلية","زموري"],
    "الطارف":["الطارف","القالة","البسباس","الذرعان","الشيحاني","العيون","الزيتونة","الحمامات"],
    "تندوف":["تندوف","أم العسل"],
    "تيسمسيلت":["تيسمسيلت","ثنية الحد","برج بونعامة","لرجام","خميستي","عماري","الأربعاء","سيدي العنتري"],
    "الوادي":["الوادي","الرباح","قمار","الدبيلة","الرقيبة","البياضة","حساني عبد الكريم","الطالب العربي","كوينين","النخلة"],
    "خنشلة":["خنشلة","قايس","ششار","الحامة","بابار","بوحمامة","عين الطويلة","يابوس","أولاد رشاش"],
    "سوق أهراس":["سوق أهراس","سدراتة","تاورة","مداوروش","المشروحة","الحنانشة","الزعرورية","ترقالت"],
    "تيبازة":["تيبازة","القليعة","شرشال","حجوط","فوكة","بواسماعيل","الدواودة","أحمر العين","سيدي راشد","الناظور"],
    "ميلة":["ميلة","فرجيوة","شلغوم العيد","التلاغمة","القرارم قوقة","وادي النجاء","عين الملوك","سيدي مروان","بوحاتم"],
    "عين الدفلى":["عين الدفلى","خميس مليانة","العطاف","مليانة","العبادية","جليدة","الروينة","بومدفع","عين الأشياخ"],
    "النعامة":["النعامة","المشرية","عين الصفراء","مغرار","البيوض","عسلة","صفيصيفة"],
    "عين تموشنت":["عين تموشنت","بني صاف","العامرية","حمام بوحجر","المالح","حاسي الغلة","ولهاصة","عين الكيحل"],
    "غرداية":["غرداية","بونورة","العطف","بريان","متليلي","القرارة","ضاية بن ضحوة","زلفانة"],
    "غليزان":["غليزان","وادي رهيو","مازونة","عمي موسى","جديوية","سيدي أمحمد بن علي","يلل","منداس","عين طارق","زمورة"],
    "تيميمون":["تيميمون","أوقروت","تنركوك","شروين","دلدول","المطارفة"],
    "برج باجي مختار":["برج باجي مختار","تيمياوين"],
    "أولاد جلال":["أولاد جلال","رأس الميعاد","البسباس","الدوسن","سيدي خالد"],
    "بني عباس":["بني عباس","الواتة","إقلي","كرزاز","القصابي","تبلبالة"],
    "إن صالح":["إن صالح","فقارة الزوى","عين صالح"],
    "إن قزام":["إن قزام","تين زواتين"],
    "تقرت":["تقرت","الزاوية العابدية","النزلة","تبسبست","تماسين","الطيبات","المقارين","الحجيرة","العالية"],
    "جانت":["جانت","برج الحواس"],
    "المغير":["المغير","جامعة","المرارة","سيدي خليل","أم الطيور","سطيل","الحمراية"],
    "المنيعة":["المنيعة","حاسي القارة","المنصورة"]
  };

  /* =========================================================
     أدوات
     ========================================================= */

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[أإآ]/g,"ا")
      .replace(/ة/g,"ه")
      .trim();
  }

  function money(value) {
    return `${Number(value || 0).toLocaleString("ar-DZ")} دج`;
  }

  function imageOf(product) {
    return product?.image_url ||
           product?.image ||
           product?.imageUrl ||
           "https://via.placeholder.com/500x500?text=Hayati";
  }

  /* =========================================================
     الرسالة المنبثقة
     ========================================================= */

  function toast(message) {
    const box = $("toast");
    if (!box) return;

    box.textContent = message;

    /* مهم: CSS الحالي يعتمد على show */
    box.hidden = false;
    box.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      box.classList.remove("show");
      box.hidden = true;
    }, 2500);
  }

  /* =========================================================
     Supabase
     ========================================================= */

  function connectSupabase() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      console.error("HAYATI_CONFIG غير موجود");
      toast("تعذر الاتصال بقاعدة البيانات.");
      return false;
    }

    if (!window.supabase?.createClient) {
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
      const parsed = raw ? JSON.parse(raw) : [];
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
      localStorage.setItem("hayati_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Cart save error:", error);
    }

    updateCartCount();
  }

  function cartTotal() {
    return cart.reduce(
      (sum,item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 1),
      0
    );
  }

  function updateCartCount() {
    const count = cart.reduce(
      (sum,item) => sum + Number(item.quantity || 0),
      0
    );

    /* لا نغيّر محتوى زر السلة بالكامل */
    const countEl = $("cartCount") || $("cart-count");

    if (countEl) {
      countEl.textContent = count;
    }
  }

  function addToCart(product) {
    if (!product?.id) return;

    const existing = cart.find(
      item => String(item.id) === String(product.id)
    );

    if (existing) {
      existing.quantity = Number(existing.quantity || 0) + 1;
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
      Number(item.quantity || 1) +
      Number(amount || 0);

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

      if (total) total.textContent = "0 دج";
      return;
    }

    box.innerHTML = cart.map(item => `
      <div class="cart-row">
        <img
          src="${esc(item.image)}"
          alt="${esc(item.name)}"
          onerror="this.src='https://via.placeholder.com/100?text=Hayati'"
        >

        <div class="cart-row-info">
          <strong>${esc(item.name)}</strong>
          <div>${money(item.price)}</div>

          <div class="qty">
            <button type="button"
              data-action="minus"
              data-id="${esc(item.id)}">−</button>

            <strong>${Number(item.quantity || 1)}</strong>

            <button type="button"
              data-action="plus"
              data-id="${esc(item.id)}">+</button>

            <button type="button"
              class="remove"
              data-action="delete"
              data-id="${esc(item.id)}">حذف</button>
          </div>
        </div>
      </div>
    `).join("");

    box.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "minus") changeQuantity(id,-1);
        if (action === "plus") changeQuantity(id,1);
        if (action === "delete") removeFromCart(id);
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
        <div class="status">
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

      return `
        <article class="card" data-id="${esc(product.id)}">

          <div class="card-img">
            <img
              src="${esc(imageOf(product))}"
              alt="${esc(product.name || "منتج")}"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/500x500?text=Hayati'"
            >
          </div>

          <div class="card-body">

            <h3>${esc(product.name || "منتج")}</h3>

            <p>
              ${esc(product.category || "")}
            </p>

            ${
              product.description
                ? `<p>${esc(product.description)}</p>`
                : ""
            }

            <div class="price">

              ${
                oldPrice && oldPrice > price
                  ? `<span class="old-price">${money(oldPrice)}</span>`
                  : ""
              }

              <strong>${money(price)}</strong>

            </div>

            <button
              type="button"
              class="add"
              data-id="${esc(product.id)}"
            >
              أضيفي إلى السلة
            </button>

          </div>

        </article>
      `;
    }).join("");

    box.querySelectorAll(".add").forEach(button => {
      button.addEventListener("click", () => {
        const product = products.find(
          p => String(p.id) === String(button.dataset.id)
        );

        if (product) addToCart(product);
      });
    });
  }

  function filterProducts() {
    let result = [...products];

    if (activeCategory) {
      const category = normalize(activeCategory);

      result = result.filter(
        product =>
          normalize(product.category) === category
      );
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
      box.innerHTML =
        '<div class="status">جارٍ تحميل المنتجات...</div>';
    }

    if (!db) return;

    try {
      const result = await db
        .from("products")
        .select("*")
        .order("created_at", { ascending:false });

      if (result.error) {
        console.error(result.error);

        if (box) {
          box.innerHTML = `
            <div class="status">
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

      filterProducts();

    } catch (error) {
      console.error(error);

      if (box) {
        box.innerHTML =
          '<div class="status">حدث خطأ أثناء تحميل المنتجات.</div>';
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

    /*
      إذا كان municipality في index.html عبارة عن input
      نحافظ عليه بدل أن نحاول إضافة options إليه.
    */
    if (select.tagName !== "SELECT") {
      return;
    }

    select.innerHTML =
      '<option value="">اختاري البلدية</option>';

    if (!wilaya) {
      select.disabled = true;
      return;
    }

    select.disabled = false;

    (municipalities[wilaya] || []).forEach(name => {
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

    /* إصلاح أساسي مع CSS الحالي */
    modal.setAttribute("aria-hidden","false");
    modal.classList.add("show");

    document.body.classList.add("modal-open");
  }

  function closeModal(id) {
    const modal = $(id);
    if (!modal) return;

    modal.hidden = true;

    /* إصلاح أساسي مع CSS الحالي */
    modal.setAttribute("aria-hidden","true");
    modal.classList.remove("show");

    if (
      $("cartModal")?.hidden !== false &&
      $("checkoutModal")?.hidden !== false
    ) {
      document.body.classList.remove("modal-open");
    }
  }

  function setupModals() {
    $("cartBtn")?.addEventListener("click", () => {
      renderCart();
      openModal("cartModal");
    });

    $("closeCart")?.addEventListener("click", () => {
      closeModal("cartModal");
    });

    $("closeCheckout")?.addEventListener("click", () => {
      closeModal("checkoutModal");
    });

    $("checkoutBtn")?.addEventListener("click", () => {
      if (!cart.length) {
        toast("السلة فارغة.");
        return;
      }

      closeModal("cartModal");
      openModal("checkoutModal");
    });

    ["cartModal","checkoutModal"].forEach(id => {
      const modal = $(id);
      if (!modal) return;

      /* ضمان أن النوافذ مغلقة عند بداية الصفحة */
      modal.setAttribute("aria-hidden","true");
      modal.hidden = true;

      modal.addEventListener("click", event => {
        if (event.target === modal) {
          closeModal(id);
        }
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeModal("cartModal");
        closeModal("checkoutModal");
      }
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
      const submitButton =
        form.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;
      }

      if (msg) {
        msg.textContent = "جارٍ إرسال الطلب...";
      }

      if (!cart.length) {
        if (msg) msg.textContent = "السلة فارغة ❌";
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!db) {
        if (msg) {
          msg.textContent =
            "تعذر الاتصال بقاعدة البيانات ❌";
        }

        if (submitButton) submitButton.disabled = false;
        return;
      }

      const getValue = name => {
        const field = form.elements[name];
        return field
          ? String(field.value || "").trim()
          : "";
      };

      const customerName = getValue("customer_name");
      const phone = getValue("phone");
      const wilaya = getValue("wilaya");
      const municipality = getValue("municipality");
      const pickup = getValue("pickup_point");

      if (!customerName) {
        if (msg) msg.textContent = "أدخلي الاسم واللقب ❌";
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!phone) {
        if (msg) msg.textContent = "أدخلي رقم الهاتف ❌";
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!wilaya) {
        if (msg) msg.textContent = "اختاري الولاية ❌";
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!municipality) {
        if (msg) msg.textContent = "اختاري البلدية ❌";
        if (submitButton) submitButton.disabled = false;
        return;
      }

      if (!pickup) {
        if (msg) {
          msg.textContent =
            "أدخلي نقطة الاستلام أو العنوان ❌";
        }

        if (submitButton) submitButton.disabled = false;
        return;
      }

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

      const order = {
        customer_name: customerName,
        phone,
        wilaya,
        municipality,
        pickup_point: pickup,
        items,
        total: cartTotal(),
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

          const errorText =
            result.error.message ||
            result.error.details ||
            result.error.hint ||
            result.error.code ||
            "خطأ غير معروف";

          if (msg) {
            msg.innerHTML = `
              <strong>لم يتم إرسال الطلب ❌</strong>
              <br>${esc(errorText)}
            `;
          }

          if (submitButton) submitButton.disabled = false;
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
          if (submitButton) submitButton.disabled = false;
        },2500);

      } catch (error) {
        console.error(error);

        if (msg) {
          msg.textContent =
            "حدث خطأ غير متوقع أثناء إرسال الطلب ❌";
        }

        if (submitButton) submitButton.disabled = false;
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
     التصنيفات
     ========================================================= */

  function setupCategories() {

    /*
      يدعم الاثنين:
      data-cat
      data-category
    */

    const buttons =
      document.querySelectorAll(
        "[data-cat], [data-category]"
      );

    buttons.forEach(button => {

      button.addEventListener("click", () => {

        const category =
          button.dataset.category ||
          button.dataset.cat ||
          "";

        activeCategory = category;

        filterProducts();

        document
          .querySelectorAll("[data-cat], [data-category]")
          .forEach(item => {
            item.classList.remove("active");
          });

        button.classList.add("active");

        $("products")?.scrollIntoView({
          behavior:"smooth"
        });
      });

    });
  }

  /* =========================================================
     توافق إضافي مع أزرار الأقسام
     ========================================================= */

  function setupCategoryTextButtons() {
    const buttons =
      document.querySelectorAll(
        ".category-btn,.category-card,.category-item"
      );

    buttons.forEach(button => {

      if (
        button.dataset.category ||
        button.dataset.cat
      ) {
        return;
      }

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
      } else if (
        text.includes("احذيه") ||
        text.includes("أحذيه")
      ) {
        category = "أحذية";
      }

      if (!category) return;

      button.addEventListener("click", () => {
        activeCategory = category;
        filterProducts();

        $("products")?.scrollIntoView({
          behavior:"smooth"
        });
      });
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

    const connected = connectSupabase();

    if (!connected) return;

    await loadProducts();

    console.log("Hayati Store ready.");
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
