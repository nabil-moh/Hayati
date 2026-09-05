const cfg = window.HAYATI_CONFIG;

if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
  console.error("إعدادات Supabase غير موجودة");
  const msg = document.getElementById("loginMsg");
  if (msg) msg.textContent = "خطأ في إعدادات الموقع";
} else {

  const supabaseClient = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  const $ = (id) => document.getElementById(id);

  const login = $("login");
  const panel = $("panel");
  const loginForm = $("loginForm");
  const loginMsg = $("loginMsg");
  const logoutBtn = $("logoutBtn");

  // =========================
  // تسجيل الدخول
  // =========================

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginMsg.textContent = "جارٍ تسجيل الدخول...";

    const email = $("email")?.value.trim();
    const password = $("password")?.value || "";

    if (!email || !password) {
      loginMsg.textContent = "أدخل البريد الإلكتروني وكلمة المرور";
      return;
    }

    try {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) {
        console.error("Supabase Login Error:", error);
        loginMsg.textContent = "بيانات الدخول غير صحيحة";
        return;
      }

      if (!data?.session) {
        loginMsg.textContent = "لم يتم إنشاء جلسة الدخول";
        return;
      }

      loginMsg.textContent = "";

      showPanel();

    } catch (error) {

      console.error(error);

      loginMsg.textContent =
        "حدث خطأ أثناء تسجيل الدخول";
    }
  });


  // =========================
  // إظهار لوحة الإدارة
  // =========================

  function showPanel() {

    if (login) {
      login.style.display = "none";
    }

    if (panel) {
      panel.style.display = "block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "block";
    }

    loadOrders();
    loadProducts();
  }


  // =========================
  // تسجيل الخروج
  // =========================

  logoutBtn?.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    if (panel) {
      panel.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    if (login) {
      login.style.display = "block";
    }

    if (loginForm) {
      loginForm.reset();
    }

    if (loginMsg) {
      loginMsg.textContent = "";
    }
  });


  // =========================
  // التحقق من الجلسة
  // =========================

  async function checkSession() {

    try {

      const { data, error } =
        await supabaseClient.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (data?.session) {
        showPanel();
      }

    } catch (error) {
      console.error(error);
    }
  }

  checkSession();


  // =========================
  // التبويبات
  // =========================

  const ordersSection = $("orders");
  const productsSection = $("products");
  const siteSection = $("site");

  $("ordersTab")?.addEventListener("click", () => {

    if (ordersSection) ordersSection.style.display = "block";
    if (productsSection) productsSection.style.display = "none";
    if (siteSection) siteSection.style.display = "none";

    loadOrders();
  });


  $("productsTab")?.addEventListener("click", () => {

    if (ordersSection) ordersSection.style.display = "none";
    if (productsSection) productsSection.style.display = "block";
    if (siteSection) siteSection.style.display = "none";

    loadProducts();
  });


  $("siteTab")?.addEventListener("click", () => {

    if (ordersSection) ordersSection.style.display = "none";
    if (productsSection) productsSection.style.display = "none";
    if (siteSection) siteSection.style.display = "block";

    loadCurrentLogo();
  });


  // =========================
  // الطلبات
  // =========================

  async function loadOrders() {

    const box = $("ordersList") || $("orders");

    if (!box) return;

    box.innerHTML = "<p>جارٍ تحميل الطلبات...</p>";

    const { data, error } =
      await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

      console.error(error);

      box.innerHTML =
        "<p>حدث خطأ أثناء تحميل الطلبات.</p>";

      return;
    }

    if (!data || data.length === 0) {

      box.innerHTML =
        "<p>لا توجد طلبات حاليًا.</p>";

      return;
    }

    box.innerHTML = "";

    data.forEach((order) => {

      const div = document.createElement("div");

      div.className = "order-card";

      div.innerHTML = `
        <h3>🛒 طلب جديد</h3>

        <p><b>الاسم:</b>
        ${escapeHtml(order.customer_name || "")}</p>

        <p><b>الهاتف:</b>
        ${escapeHtml(order.phone || "")}</p>

        <p><b>الولاية والبلدية:</b>
        ${escapeHtml(order.notes || "")}</p>

        <p><b>العنوان:</b>
        ${escapeHtml(order.address || "")}</p>

        <p><b>التاريخ:</b>
        ${formatDate(order.created_at)}</p>

        <p><b>المجموع:</b>
        ${formatPrice(order.total)}</p>

        <p><b>المنتجات:</b></p>

        <div>
          ${formatItems(order.items)}
        </div>

        <label>
          <b>حالة الطلب:</b>

          <select
            class="status-select"
            data-id="${escapeHtml(order.id)}">

            <option value="pending"
              ${order.status === "pending" ? "selected" : ""}>
              🆕 جديد
            </option>

            <option value="preparing"
              ${order.status === "preparing" ? "selected" : ""}>
              📦 قيد التجهيز
            </option>

            <option value="shipped"
              ${order.status === "shipped" ? "selected" : ""}>
              🚚 تم الشحن
            </option>

            <option value="completed"
              ${order.status === "completed" ? "selected" : ""}>
              ✅ مكتمل
            </option>

            <option value="cancelled"
              ${order.status === "cancelled" ? "selected" : ""}>
              ❌ ملغى
            </option>

          </select>
        </label>
      `;

      box.appendChild(div);
    });


    document
      .querySelectorAll(".status-select")
      .forEach((select) => {

        select.addEventListener("change", async () => {

          await updateOrderStatus(
            select.dataset.id,
            select.value
          );

        });

      });
  }


  // =========================
  // تحديث حالة الطلب
  // =========================

  async function updateOrderStatus(id, status) {

    const { error } =
      await supabaseClient
        .from("orders")
        .update({ status })
        .eq("id", id);

    if (error) {

      console.error(error);

      alert("لم يتم تحديث حالة الطلب.");

      return;
    }

    alert("تم تحديث حالة الطلب بنجاح.");
  }


  // =========================
  // المنتجات
  // =========================

  async function loadProducts() {

    const list = $("productList");

    if (!list) return;

    list.innerHTML =
      "<p>جارٍ تحميل المنتجات...</p>";

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

      console.error(error);

      list.innerHTML =
        "<p>حدث خطأ أثناء تحميل المنتجات.</p>";

      return;
    }

    if (!data || data.length === 0) {

      list.innerHTML =
        "<p>لا توجد منتجات حاليًا.</p>";

      return;
    }

    list.innerHTML = "";

    data.forEach((product) => {

      const div = document.createElement("div");

      div.className = "product-card";

      const image =
        product.image_url ||
        product.image ||
        "";

      div.innerHTML = `

        ${
          image
            ? `
              <img
                src="${escapeAttribute(image)}"
                alt=""
                style="
                  width:100px;
                  height:100px;
                  object-fit:cover;
                  border-radius:12px;
                "
              >
            `
            : ""
        }

        <h3>
          ${escapeHtml(product.name || "")}
        </h3>

        <p>
          <b>الفئة:</b>
          ${escapeHtml(product.category || "")}
        </p>

        <p>
          <b>السعر:</b>
          ${formatPrice(product.price)}
        </p>

        ${
          product.old_price
            ? `
              <p>
                <b>السعر القديم:</b>
                ${formatPrice(product.old_price)}
              </p>
            `
            : ""
        }

        <p>
          <b>المخزون:</b>
          ${product.stock ?? 0}
        </p>

        ${
          product.description
            ? `
              <p>
                ${escapeHtml(product.description)}
              </p>
            `
            : ""
        }

        <button
          type="button"
          class="edit-product"
          data-id="${escapeHtml(product.id)}">
          ✏️ تعديل
        </button>

        <button
          type="button"
          class="delete-product"
          data-id="${escapeHtml(product.id)}">
          🗑️ حذف
        </button>
      `;

      list.appendChild(div);
    });


    document
      .querySelectorAll(".edit-product")
      .forEach((button) => {

        button.addEventListener("click", () => {

          editProduct(
            button.dataset.id,
            data
          );

        });

      });


    document
      .querySelectorAll(".delete-product")
      .forEach((button) => {

        button.addEventListener("click", () => {

          deleteProduct(
            button.dataset.id
          );

        });

      });
  }


  // =========================
  // صورة المنتج
  // =========================

  $("pimageFile")?.addEventListener("change", () => {

    const file =
      $("pimageFile").files?.[0];

    const preview =
      $("productPreview");

    if (!file || !preview) return;

    preview.src =
      URL.createObjectURL(file);

    preview.style.display = "block";
  });


  // =========================
  // حفظ المنتج
  // =========================

  $("productForm")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const pid =
      $("pid").value.trim();

    const name =
      $("pname").value.trim();

    const category =
      $("pcat").value.trim();

    const price =
      Number($("pprice").value);

    const oldValue =
      $("pold").value;

    const stockValue =
      $("pstock").value;

    const old_price =
      oldValue === ""
        ? null
        : Number(oldValue);

    const stock =
      stockValue === ""
        ? 0
        : Number(stockValue);

    const description =
      $("pdesc").value.trim();

    let image_url =
      $("pimage").value.trim();

    const file =
      $("pimageFile").files?.[0];


    if (file) {

      const fileName =
        "product-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2) +
        "." +
        getExtension(file.name);

      const path =
        "products/" + fileName;


      const { error } =
        await supabaseClient.storage
          .from("product-images")
          .upload(path, file, {
            upsert: true,
            contentType: file.type
          });


      if (error) {

        console.error(error);

        alert(
          "تعذر رفع صورة المنتج."
        );

        return;
      }


      const { data } =
        supabaseClient.storage
          .from("product-images")
          .getPublicUrl(path);

      image_url =
        data.publicUrl;
    }


    const productData = {
      name,
      category,
      price,
      old_price,
      stock,
      description,
      image_url
    };


    let result;


    if (pid) {

      result =
        await supabaseClient
          .from("products")
          .update(productData)
          .eq("id", pid);

    } else {

      result =
        await supabaseClient
          .from("products")
          .insert(productData);

    }


    if (result.error) {

      console.error(result.error);

      alert(
        "لم يتم حفظ المنتج."
      );

      return;
    }


    alert(
      pid
        ? "تم تعديل المنتج بنجاح."
        : "تمت إضافة المنتج بنجاح."
    );


    resetProductForm();

    loadProducts();

  });


  // =========================
  // تعديل المنتج
  // =========================

  function editProduct(id, products) {

    const product =
      products.find(
        (item) =>
          String(item.id) === String(id)
      );

    if (!product) return;

    $("pid").value =
      product.id;

    $("pname").value =
      product.name || "";

    $("pcat").value =
      product.category || "";

    $("pprice").value =
      product.price ?? "";

    $("pold").value =
      product.old_price ?? "";

    $("pstock").value =
      product.stock ?? "";

    $("pdesc").value =
      product.description || "";

    $("pimage").value =
      product.image_url || "";

    const preview =
      $("productPreview");

    if (preview && product.image_url) {

      preview.src =
        product.image_url;

      preview.style.display =
        "block";
    }

    $("cancelEdit").style.display =
      "block";

    window.scrollTo({
      top: $("productForm").offsetTop,
      behavior: "smooth"
    });
  }


  // =========================
  // حذف المنتج
  // =========================

  async function deleteProduct(id) {

    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      return;
    }

    const { error } =
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {

      console.error(error);

      alert("لم يتم حذف المنتج.");

      return;
    }

    alert("تم حذف المنتج.");

    loadProducts();
  }


  // =========================
  // إلغاء التعديل
  // =========================

  $("cancelEdit")?.addEventListener(
    "click",
    resetProductForm
  );


  function resetProductForm() {

    $("productForm")?.reset();

    $("pid").value = "";

    $("pimage").value = "";

    const preview =
      $("productPreview");

    if (preview) {

      preview.src = "";

      preview.style.display =
        "none";
    }

    $("cancelEdit").style.display =
      "none";
  }


  // =========================
  // شعار الموقع
  // =========================

  $("logoFile")?.addEventListener("change", () => {

    const file =
      $("logoFile").files?.[0];

    const preview =
      $("logoPreview");

    if (!file || !preview) return;

    preview.src =
      URL.createObjectURL(file);

    preview.style.display =
      "block";
  });


  $("logoForm")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file =
      $("logoFile").files?.[0];

    if (!file) {

      $("logoMsg").textContent =
        "اختر صورة الشعار أولًا.";

      return;
    }


    $("logoMsg").textContent =
      "جارٍ رفع الشعار...";


    const fileName =
      "logo-" +
      Date.now() +
      "." +
      getExtension(file.name);


    const path =
      "site/" + fileName;


    const { error: uploadError } =
      await supabaseClient.storage
        .from("site-images")
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });


    if (uploadError) {

      console.error(uploadError);

      $("logoMsg").textContent =
        "تعذر رفع الشعار.";

      return;
    }


    const { data } =
      supabaseClient.storage
        .from("site-images")
        .getPublicUrl(path);


    const logoUrl =
      data.publicUrl;


    const { error } =
      await supabaseClient
        .from("site_settings")
        .upsert(
          {
            key: "logo_url",
            value: logoUrl
          },
          {
            onConflict: "key"
          }
        );


    if (error) {

      console.error(error);

      $("logoMsg").textContent =
        "تعذر حفظ الشعار.";

      return;
    }


    $("logoMsg").textContent =
      "تم حفظ الشعار بنجاح ✅";

    $("logoPreview").src =
      logoUrl;

    $("logoPreview").style.display =
      "block";
  });


  // =========================
  // تحميل الشعار
  // =========================

  async function loadCurrentLogo() {

    const preview =
      $("logoPreview");

    if (!preview) return;


    const { data, error } =
      await supabaseClient
        .from("site_settings")
        .select("value")
        .eq("key", "logo_url")
        .maybeSingle();


    if (error) {

      console.error(error);

      return;
    }


    if (data?.value) {

      preview.src =
        data.value;

      preview.style.display =
        "block";
    }
  }


  // =========================
  // أدوات مساعدة
  // =========================

  function formatPrice(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0 دج";
    }

    return (
      Number(value)
        .toLocaleString("fr-DZ") +
      " دج"
    );
  }


  function formatDate(value) {

    if (!value) return "";

    try {

      return new Date(value)
        .toLocaleString("ar-DZ");

    } catch {

      return value;
    }
  }


  function formatItems(items) {

    if (!items) return "";

    if (typeof items === "string") {

      try {
        items = JSON.parse(items);
      } catch {
        return escapeHtml(items);
      }
    }


    if (!Array.isArray(items)) {

      return escapeHtml(
        JSON.stringify(items)
      );
    }


    return items.map((item) => {

      const name =
        item.name ||
        item.product_name ||
        "منتج";

      const quantity =
        item.quantity ||
        item.qty ||
        1;

      return `
        <div>
          🛍️ ${escapeHtml(String(name))}
          × ${escapeHtml(String(quantity))}
        </div>
      `;

    }).join("");
  }


  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function escapeAttribute(value) {
    return escapeHtml(value);
  }


  function getExtension(filename) {

    const parts =
      filename.split(".");

    if (parts.length < 2) {
      return "jpg";
    }

    return parts
      .pop()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  }

}
