const cfg = window.HAYATI_CONFIG;

if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
  console.error("إعدادات Supabase غير موجودة في config.js");
}

const supabase = window.supabase.createClient(
  cfg.SUPABASE_URL,
  cfg.SUPABASE_ANON_KEY
);

const $ = (id) => document.getElementById(id);

const login = $("login");
const panel = $("panel");
const loginForm = $("loginForm");
const loginMsg = $("loginMsg");
const logout = $("logout");

const ordersBox = $("orders");
const productList = $("productList");
const productForm = $("productForm");
const cancelEdit = $("cancelEdit");

const productImageFile = $("pimageFile");
const productPreview = $("productPreview");

const logoForm = $("logoForm");
const logoFile = $("logoFile");
const logoPreview = $("logoPreview");
const logoMsg = $("logoMsg");


// =========================
// تسجيل الدخول
// =========================

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  loginMsg.textContent = "جارٍ تسجيل الدخول...";

  const email = $("email").value.trim();
  const password = $("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMsg.textContent = "بيانات الدخول غير صحيحة";
    return;
  }

  loginMsg.textContent = "";
  showPanel();
});


// =========================
// إظهار لوحة الإدارة
// =========================

async function showPanel() {
  login.hidden = true;
  panel.hidden = false;
  logout.hidden = false;

  await loadOrders();
  await loadProducts();
}


// =========================
// تسجيل الخروج
// =========================

logout?.addEventListener("click", async () => {
  await supabase.auth.signOut();

  panel.hidden = true;
  logout.hidden = true;
  login.hidden = false;

  if (loginForm) loginForm.reset();
});


// =========================
// التحقق من الجلسة
// =========================

async function checkSession() {
  const { data } = await supabase.auth.getSession();

  if (data?.session) {
    showPanel();
  }
}

checkSession();


// =========================
// التبويبات
// =========================

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    $("ordersTab").hidden = tab !== "orders";
    $("productsTab").hidden = tab !== "products";
    $("siteTab").hidden = tab !== "site";

    if (tab === "orders") {
      loadOrders();
    }

    if (tab === "products") {
      loadProducts();
    }

    if (tab === "site") {
      loadCurrentLogo();
    }
  });
});


// =========================
// الطلبات
// =========================

async function loadOrders() {
  if (!ordersBox) return;

  ordersBox.innerHTML = "<p>جارٍ تحميل الطلبات...</p>";

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    ordersBox.innerHTML =
      "<p>حدث خطأ أثناء تحميل الطلبات.</p>";
    return;
  }

  if (!data || data.length === 0) {
    ordersBox.innerHTML =
      "<p>لا توجد طلبات حاليًا.</p>";
    return;
  }

  ordersBox.innerHTML = "";

  data.forEach((order) => {
    const div = document.createElement("div");

    div.className = "order-card";

    const notes = order.notes || "";

    div.innerHTML = `
      <h3>🛒 طلب جديد</h3>

      <p><b>الاسم:</b> ${escapeHtml(order.customer_name || "")}</p>

      <p><b>الهاتف:</b> ${escapeHtml(order.phone || "")}</p>

      <p><b>الولاية والبلدية:</b> ${escapeHtml(notes)}</p>

      <p><b>العنوان:</b> ${escapeHtml(order.address || "")}</p>

      <p><b>التاريخ:</b> ${formatDate(order.created_at)}</p>

      <p><b>المجموع:</b> ${formatPrice(order.total)}</p>

      <div class="order-items">
        <b>المنتجات:</b>
        <div>${formatItems(order.items)}</div>
      </div>

      <label>
        <b>حالة الطلب:</b>

        <select class="status-select" data-id="${order.id}">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>
            🆕 جديد
          </option>

          <option value="preparing" ${order.status === "preparing" ? "selected" : ""}>
            📦 قيد التجهيز
          </option>

          <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>
            🚚 تم الشحن
          </option>

          <option value="completed" ${order.status === "completed" ? "selected" : ""}>
            ✅ مكتمل
          </option>

          <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>
            ❌ ملغى
          </option>
        </select>
      </label>
    `;

    ordersBox.appendChild(div);
  });

  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      await updateOrderStatus(
        select.dataset.id,
        select.value
      );
    });
  });
}


// =========================
// تغيير حالة الطلب
// =========================

async function updateOrderStatus(id, status) {
  const { error } = await supabase
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
  if (!productList) return;

  productList.innerHTML =
    "<p>جارٍ تحميل المنتجات...</p>";

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    productList.innerHTML =
      "<p>حدث خطأ أثناء تحميل المنتجات.</p>";

    return;
  }

  if (!data || data.length === 0) {
    productList.innerHTML =
      "<p>لا توجد منتجات حاليًا.</p>";

    return;
  }

  productList.innerHTML = "";

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
          ? `<img src="${escapeAttribute(image)}"
                  alt=""
                  style="width:100px;height:100px;object-fit:cover;border-radius:12px;">`
          : ""
      }

      <h3>${escapeHtml(product.name || "")}</h3>

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
          ? `<p><b>السعر القديم:</b> ${formatPrice(product.old_price)}</p>`
          : ""
      }

      ${
        product.stock !== null && product.stock !== undefined
          ? `<p><b>المخزون:</b> ${product.stock}</p>`
          : ""
      }

      ${
        product.description
          ? `<p>${escapeHtml(product.description)}</p>`
          : ""
      }

      <button
        type="button"
        class="edit-product"
        data-id="${product.id}">
        ✏️ تعديل
      </button>

      <button
        type="button"
        class="delete-product"
        data-id="${product.id}">
        🗑️ حذف
      </button>
    `;

    productList.appendChild(div);
  });

  document.querySelectorAll(".edit-product").forEach((button) => {
    button.addEventListener("click", () => {
      editProduct(button.dataset.id, data);
    });
  });

  document.querySelectorAll(".delete-product").forEach((button) => {
    button.addEventListener("click", () => {
      deleteProduct(button.dataset.id);
    });
  });
}


// =========================
// اختيار صورة المنتج
// =========================

productImageFile?.addEventListener("change", () => {
  const file = productImageFile.files?.[0];

  if (!file) {
    productPreview.hidden = true;
    return;
  }

  const url = URL.createObjectURL(file);

  productPreview.src = url;
  productPreview.hidden = false;
});


// =========================
// حفظ المنتج
// =========================

productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pid = $("pid").value.trim();

  const name = $("pname").value.trim();
  const category = $("pcat").value.trim();
  const price = Number($("pprice").value);
  const oldPriceValue = $("pold").value;
  const stockValue = $("pstock").value;

  const old_price =
    oldPriceValue === ""
      ? null
      : Number(oldPriceValue);

  const stock =
    stockValue === ""
      ? 0
      : Number(stockValue);

  const description = $("pdesc").value.trim();

  let image_url = $("pimage").value.trim();

  const file = productImageFile?.files?.[0];

  // رفع الصورة إذا اختار المستخدم صورة من الهاتف
  if (file) {
    const fileName =
      "product-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2) +
      "." +
      getExtension(file.name);

    const filePath = `products/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

    if (uploadError) {
      console.error(uploadError);

      alert(
        "تعذر رفع الصورة. تأكد أن Storage مضبوط في Supabase."
      );

      return;
    }

    const { data: publicData } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

    image_url = publicData.publicUrl;
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
    result = await supabase
      .from("products")
      .update(productData)
      .eq("id", pid);
  } else {
    result = await supabase
      .from("products")
      .insert(productData);
  }

  if (result.error) {
    console.error(result.error);

    alert(
      "لم يتم حفظ المنتج. تأكد من أسماء أعمدة جدول products وصلاحيات Supabase."
    );

    return;
  }

  alert(
    pid
      ? "تم تعديل المنتج بنجاح."
      : "تمت إضافة المنتج بنجاح."
  );

  resetProductForm();
  await loadProducts();
});


// =========================
// تعديل منتج
// =========================

function editProduct(id, products) {
  const product =
    products.find((item) => String(item.id) === String(id));

  if (!product) return;

  $("pid").value = product.id;
  $("pname").value = product.name || "";
  $("pcat").value = product.category || "";
  $("pprice").value = product.price ?? "";
  $("pold").value = product.old_price ?? "";
  $("pstock").value = product.stock ?? "";
  $("pdesc").value = product.description || "";
  $("pimage").value = product.image_url || "";

  if (product.image_url) {
    productPreview.src = product.image_url;
    productPreview.hidden = false;
  } else {
    productPreview.hidden = true;
  }

  window.scrollTo({
    top: productForm.offsetTop,
    behavior: "smooth"
  });
}


// =========================
// حذف المنتج
// =========================

async function deleteProduct(id) {
  const ok = confirm(
    "هل أنت متأكد من حذف هذا المنتج؟"
  );

  if (!ok) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);

    alert(
      "لم يتم حذف المنتج."
    );

    return;
  }

  alert("تم حذف المنتج.");

  await loadProducts();
}


// =========================
// إلغاء التعديل
// =========================

cancelEdit?.addEventListener("click", () => {
  resetProductForm();
});

function resetProductForm() {
  productForm?.reset();

  $("pid").value = "";

  if (productPreview) {
    productPreview.src = "";
    productPreview.hidden = true;
  }
}


// =========================
// شعار الموقع
// =========================

logoFile?.addEventListener("change", () => {
  const file = logoFile.files?.[0];

  if (!file) {
    logoPreview.hidden = true;
    return;
  }

  const url = URL.createObjectURL(file);

  logoPreview.src = url;
  logoPreview.hidden = false;
});


logoForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = logoFile?.files?.[0];

  if (!file) {
    logoMsg.textContent =
      "اختاري صورة الشعار أولًا.";
    return;
  }

  logoMsg.textContent =
    "جارٍ رفع الشعار...";

  const fileName =
    "logo-" +
    Date.now() +
    "." +
    getExtension(file.name);

  const filePath =
    `site/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("site-images")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

  if (uploadError) {
    console.error(uploadError);

    logoMsg.textContent =
      "تعذر رفع الشعار. تأكد من إعداد Storage.";

    return;
  }

  const { data: publicData } =
    supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

  const logoUrl =
    publicData.publicUrl;

  // حفظ رابط الشعار في جدول site_settings
  const { error } =
    await supabase
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

    logoMsg.textContent =
      "تم رفع الصورة لكن تعذر حفظ إعداد الشعار.";

    return;
  }

  logoMsg.textContent =
    "تم حفظ الشعار بنجاح ✅";

  logoPreview.src = logoUrl;
  logoPreview.hidden = false;
});


// =========================
// تحميل الشعار الحالي
// =========================

async function loadCurrentLogo() {
  if (!logoPreview) return;

  const { data, error } =
    await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "logo_url")
      .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }

  if (data?.value) {
    logoPreview.src = data.value;
    logoPreview.hidden = false;
  }
}


// =========================
// أدوات مساعدة
// =========================

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "0 دج";
  }

  return (
    Number(value).toLocaleString("fr-DZ") +
    " دج"
  );
}


function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString("ar-DZ");
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
    return escapeHtml(JSON.stringify(items));
  }

  return items
    .map((item) => {
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
    })
    .join("");
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
  const parts = filename.split(".");

  if (parts.length < 2) {
    return "jpg";
  }

  return parts.pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "jpg";
}
