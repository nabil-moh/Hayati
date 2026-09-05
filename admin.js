(() => {
  'use strict';

  /*
   * =========================================================
   * HAYATI - ADMIN.JS
   * لوحة المدير
   * =========================================================
   */

  const $ = (selector) => document.querySelector(selector);

  const config = window.HAYATI_CONFIG || {};

  let db = null;
  let editingProductId = null;

  const money = (value) => {
    return new Intl.NumberFormat('ar-DZ').format(
      Number(value) || 0
    ) + ' دج';
  };

  const esc = (value) => {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  };

  /*
   * =========================================================
   * رسائل
   * =========================================================
   */

  function showLoginMessage(message, success = false) {
    const el = $('#loginMsg');

    if (!el) return;

    el.textContent = message;
    el.style.color = success ? 'green' : 'crimson';
  }

  function showLogoMessage(message, success = false) {
    const el = $('#logoMsg');

    if (!el) return;

    el.textContent = message;
    el.style.color = success ? 'green' : 'crimson';
  }

  /*
   * =========================================================
   * إظهار لوحة المدير
   * =========================================================
   */

  function showPanel() {
    const login = $('#login');
    const panel = $('#panel');
    const logoutBtn = $('#logoutBtn');

    if (login) {
      login.style.display = 'none';
    }

    if (panel) {
      panel.style.display = 'block';
    }

    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
    }

    loadOrders();
    loadProducts();
  }

  function showLogin() {
    const login = $('#login');
    const panel = $('#panel');
    const logoutBtn = $('#logoutBtn');

    if (login) {
      login.style.display = 'block';
    }

    if (panel) {
      panel.style.display = 'none';
    }

    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }
  }

  /*
   * =========================================================
   * الاتصال بـ Supabase
   * =========================================================
   */

  function createDatabase() {
    if (
      !config.SUPABASE_URL ||
      !config.SUPABASE_ANON_KEY
    ) {
      showLoginMessage(
        'إعدادات Supabase غير موجودة في config.js'
      );

      console.error(
        'HAYATI_CONFIG غير موجود أو ناقص.'
      );

      return null;
    }

    if (!window.supabase) {
      showLoginMessage(
        'تعذر تحميل مكتبة Supabase.'
      );

      console.error(
        'Supabase JS library غير موجودة.'
      );

      return null;
    }

    try {
      return window.supabase.createClient(
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY
      );
    } catch (error) {
      console.error(error);

      showLoginMessage(
        'تعذر إنشاء اتصال Supabase.'
      );

      return null;
    }
  }

  /*
   * =========================================================
   * التحقق من الجلسة
   * =========================================================
   */

  async function checkSession() {
    if (!db) return;

    try {
      const result = await db.auth.getSession();

      if (result.error) {
        console.error(result.error);
        showLogin();
        return;
      }

      if (result.data && result.data.session) {
        showPanel();
      } else {
        showLogin();
      }
    } catch (error) {
      console.error(
        'Session error:',
        error
      );

      showLogin();
    }
  }

  /*
   * =========================================================
   * تسجيل الدخول
   * =========================================================
   */

  const loginForm = $('#loginForm');

  if (loginForm) {
    loginForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        if (!db) {
          showLoginMessage(
            'Supabase غير متصل.'
          );
          return;
        }

        const email =
          String($('#email')?.value || '')
            .trim();

        const password =
          String($('#password')?.value || '');

        if (!email || !password) {
          showLoginMessage(
            'أدخلي البريد الإلكتروني وكلمة المرور.'
          );
          return;
        }

        const submitButton =
          loginForm.querySelector(
            'button[type="submit"]'
          );

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent =
            'جاري الدخول...';
        }

        showLoginMessage('');

        try {

          const result =
            await db.auth.signInWithPassword({
              email,
              password
            });

          if (result.error) {

            console.error(
              'Login error:',
              result.error
            );

            showLoginMessage(
              'بيانات الدخول غير صحيحة.'
            );

            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent =
                'دخول';
            }

            return;
          }

          showLoginMessage(
            'تم تسجيل الدخول بنجاح ✓',
            true
          );

          showPanel();

        } catch (error) {

          console.error(error);

          showLoginMessage(
            'حدث خطأ أثناء تسجيل الدخول.'
          );

        } finally {

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
              'دخول';
          }
        }
      }
    );
  }

  /*
   * =========================================================
   * تسجيل الخروج
   * =========================================================
   */

  const logoutBtn = $('#logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener(
      'click',
      async () => {

        if (!db) return;

        try {

          await db.auth.signOut();

          showLogin();

          const password = $('#password');

          if (password) {
            password.value = '';
          }

          showLoginMessage(
            'تم تسجيل الخروج.'
          );

        } catch (error) {

          console.error(
            'Logout error:',
            error
          );

        }
      }
    );
  }

  /*
   * =========================================================
   * التبويبات
   * =========================================================
   */

  function showTab(tabName) {

    const orders =
      $('#orders');

    const products =
      $('#products');

    const site =
      $('#site');

    if (orders) {
      orders.style.display =
        tabName === 'orders'
          ? 'block'
          : 'none';
    }

    if (products) {
      products.style.display =
        tabName === 'products'
          ? 'block'
          : 'none';
    }

    if (site) {
      site.style.display =
        tabName === 'site'
          ? 'block'
          : 'none';
    }
  }

  const ordersTab = $('#ordersTab');
  const productsTab = $('#productsTab');
  const siteTab = $('#siteTab');

  if (ordersTab) {
    ordersTab.addEventListener(
      'click',
      () => {
        showTab('orders');
        loadOrders();
      }
    );
  }

  if (productsTab) {
    productsTab.addEventListener(
      'click',
      () => {
        showTab('products');
        loadProducts();
      }
    );
  }

  if (siteTab) {
    siteTab.addEventListener(
      'click',
      () => {
        showTab('site');
      }
    );
  }

  /*
   * =========================================================
   * الطلبات
   * =========================================================
   */

  async function loadOrders() {

    const container =
      $('#ordersList');

    if (!container || !db) return;

    container.innerHTML =
      '<p>جاري تحميل الطلبات...</p>';

    try {

      const result =
        await db
          .from('orders')
          .select('*')
          .order(
            'created_at',
            { ascending: false }
          );

      if (result.error) {

        console.error(
          'Orders error:',
          result.error
        );

        container.innerHTML =
          '<p style="color:crimson;">' +
          'تعذر تحميل الطلبات.<br>' +
          esc(result.error.message) +
          '</p>';

        return;
      }

      const orders =
        Array.isArray(result.data)
          ? result.data
          : [];

      if (!orders.length) {

        container.innerHTML =
          '<p>لا توجد طلبات حاليا.</p>';

        return;
      }

      container.innerHTML =
        orders.map(renderOrder).join('');

    } catch (error) {

      console.error(error);

      container.innerHTML =
        '<p style="color:crimson;">' +
        'حدث خطأ أثناء تحميل الطلبات.' +
        '</p>';
    }
  }

  function renderOrder(order) {

    let items = [];

    try {

      if (Array.isArray(order.items)) {
        items = order.items;
      } else if (typeof order.items === 'string') {
        items = JSON.parse(order.items);
      }

    } catch {
      items = [];
    }

    const itemsHtml =
      items.length
        ? items.map(item => `
            <div style="
              padding:6px 0;
              border-bottom:1px solid #eee;
            ">
              <b>${esc(item.name || 'منتج')}</b>
              <br>
              <small>
                الكمية:
                ${Number(item.qty) || 0}
                ×
                ${money(item.price)}
              </small>
            </div>
          `).join('')
        : '<span>لا توجد تفاصيل المنتجات</span>';

    const date =
      order.created_at
        ? new Date(order.created_at)
            .toLocaleString('ar-DZ')
        : '';

    return `
      <article
        class="admin-order"
        style="
          border:1px solid #ddd;
          border-radius:12px;
          padding:15px;
          margin:12px 0;
          background:#fff;
        "
      >

        <h3>
          طلب رقم:
          ${esc(order.id || '')}
        </h3>

        <p>
          <b>الزبون:</b>
          ${esc(order.customer_name || '')}
        </p>

        <p>
          <b>الهاتف:</b>
          ${esc(order.phone || '')}
        </p>

        <p>
          <b>الولاية:</b>
          ${esc(order.wilaya || '')}
        </p>

        <p>
          <b>البلدية:</b>
          ${esc(order.municipality || '')}
        </p>

        <p>
          <b>نقطة الاستلام:</b>
          ${esc(order.pickup_point || '')}
        </p>

        <p>
          <b>المجموع:</b>
          ${money(order.total)}
        </p>

        ${
          date
            ? `
              <p>
                <b>التاريخ:</b>
                ${esc(date)}
              </p>
            `
            : ''
        }

        <div style="
          margin-top:12px;
          padding:10px;
          background:#f8f8f8;
          border-radius:8px;
        ">
          <b>المنتجات:</b>
          ${itemsHtml}
        </div>

        <button
          type="button"
          class="delete-order"
          data-id="${esc(order.id || '')}"
          style="
            margin-top:12px;
            background:#c62828;
            color:#fff;
            border:0;
            padding:9px 14px;
            border-radius:7px;
            cursor:pointer;
          "
        >
          حذف الطلب
        </button>

      </article>
    `;
  }

  /*
   * حذف الطلب
   */

  async function deleteOrder(id) {

    if (!id || !db) return;

    const confirmed =
      confirm(
        'هل أنت متأكدة من حذف هذا الطلب؟'
      );

    if (!confirmed) return;

    try {

      const result =
        await db
          .from('orders')
          .delete()
          .eq('id', id);

      if (result.error) {

        console.error(
          'Delete order error:',
          result.error
        );

        alert(
          'تعذر حذف الطلب:\n' +
          result.error.message
        );

        return;
      }

      await loadOrders();

    } catch (error) {

      console.error(error);

      alert(
        'حدث خطأ أثناء حذف الطلب.'
      );
    }
  }

  document.addEventListener(
    'click',
    (event) => {

      const button =
        event.target.closest(
          '.delete-order'
        );

      if (!button) return;

      deleteOrder(
        button.dataset.id
      );
    }
  );

  /*
   * =========================================================
   * المنتجات
   * =========================================================
   */

  async function loadProducts() {

    const container =
      $('#productList');

    if (!container || !db) return;

    container.innerHTML =
      '<p>جاري تحميل المنتجات...</p>';

    try {

      const result =
        await db
          .from('products')
          .select('*')
          .order(
            'created_at',
            { ascending: false }
          );

      if (result.error) {

        console.error(
          'Products error:',
          result.error
        );

        container.innerHTML =
          '<p style="color:crimson;">' +
          'تعذر تحميل المنتجات.<br>' +
          esc(result.error.message) +
          '</p>';

        return;
      }

      const products =
        Array.isArray(result.data)
          ? result.data
          : [];

      if (!products.length) {

        container.innerHTML =
          '<p>لا توجد منتجات حاليا.</p>';

        return;
      }

      container.innerHTML =
        products
          .map(renderProduct)
          .join('');

    } catch (error) {

      console.error(error);

      container.innerHTML =
        '<p style="color:crimson;">' +
        'حدث خطأ أثناء تحميل المنتجات.' +
        '</p>';
    }
  }

  function renderProduct(product) {

    const image =
      product.image_url ||
      product.image ||
      '';

    const oldPrice =
      product.old_price !== null &&
      product.old_price !== undefined &&
      product.old_price !== ''
        ? `
          <div>
            <del>
              ${money(product.old_price)}
            </del>
          </div>
        `
        : '';

    return `
      <article
        class="admin-product"
        style="
          border:1px solid #ddd;
          border-radius:12px;
          padding:12px;
          margin:12px 0;
          background:#fff;
        "
      >

        ${
          image
            ? `
              <img
                src="${esc(image)}"
                alt="${esc(product.name || '')}"
                style="
                  width:100%;
                  max-width:180px;
                  height:180px;
                  object-fit:cover;
                  border-radius:10px;
                  margin-bottom:10px;
                "
              >
            `
            : `
              <div style="
                width:180px;
                height:180px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f3f3f3;
                border-radius:10px;
                margin-bottom:10px;
              ">
                🛍️
              </div>
            `
        }

        <h3>
          ${esc(product.name || 'منتج')}
        </h3>

        <p>
          القسم:
          <b>
            ${esc(product.category || '')}
          </b>
        </p>

        ${oldPrice}

        <p>
          السعر:
          <b>
            ${money(product.price)}
          </b>
        </p>

        <p>
          المخزون:
          <b>
            ${Number(product.stock) || 0}
          </b>
        </p>

        ${
          product.description
            ? `
              <p>
                ${esc(product.description)}
              </p>
            `
            : ''
        }

        <div style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-top:10px;
        ">

          <button
            type="button"
            class="edit-product"
            data-id="${esc(product.id)}"
          >
            تعديل
          </button>

          <button
            type="button"
            class="delete-product"
            data-id="${esc(product.id)}"
            style="
              background:#c62828;
              color:#fff;
            "
          >
            حذف
          </button>

        </div>

      </article>
    `;
  }

  /*
   * =========================================================
   * تعبئة نموذج التعديل
   * =========================================================
   */

  async function editProduct(id) {

    if (!id || !db) return;

    try {

      const result =
        await db
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

      if (result.error) {

        console.error(
          result.error
        );

        alert(
          'تعذر تحميل المنتج:\n' +
          result.error.message
        );

        return;
      }

      const product =
        result.data;

      if (!product) {
        alert('المنتج غير موجود.');
        return;
      }

      editingProductId =
        product.id;

      $('#pid').value =
        product.id || '';

      $('#pname').value =
        product.name || '';

      $('#pcat').value =
        product.category || '';

      $('#pprice').value =
        product.price ?? '';

      $('#pold').value =
        product.old_price ?? '';

      $('#pstock').value =
        product.stock ?? 0;

      $('#pdesc').value =
        product.description || '';

      $('#pimage').value =
        product.image_url ||
        product.image ||
        '';

      const preview =
        $('#productPreview');

      const image =
        product.image_url ||
        product.image ||
        '';

      if (preview && image) {

        preview.src = image;
        preview.style.display =
          'block';
      }

      const cancel =
        $('#cancelEdit');

      if (cancel) {
        cancel.style.display =
          'inline-block';
      }

      const form =
        $('#productForm');

      if (form) {
        form.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

    } catch (error) {

      console.error(error);

      alert(
        'حدث خطأ أثناء تعديل المنتج.'
      );
    }
  }

  /*
   * =========================================================
   * حذف المنتج
   * =========================================================
   */

  async function deleteProduct(id) {

    if (!id || !db) return;

    const confirmed =
      confirm(
        'هل أنت متأكد من حذف هذا المنتج؟'
      );

    if (!confirmed) return;

    try {

      const result =
        await db
          .from('products')
          .delete()
          .eq('id', id);

      if (result.error) {

        console.error(
          'Delete product error:',
          result.error
        );

        alert(
          'تعذر حذف المنتج:\n' +
          result.error.message
        );

        return;
      }

      if (
        String(editingProductId) ===
        String(id)
      ) {
        resetProductForm();
      }

      await loadProducts();

    } catch (error) {

      console.error(error);

      alert(
        'حدث خطأ أثناء حذف المنتج.'
      );
    }
  }

  document.addEventListener(
    'click',
    (event) => {

      const editButton =
        event.target.closest(
          '.edit-product'
        );

      if (editButton) {
        editProduct(
          editButton.dataset.id
        );
        return;
      }

      const deleteButton =
        event.target.closest(
          '.delete-product'
        );

      if (deleteButton) {
        deleteProduct(
          deleteButton.dataset.id
        );
      }
    }
  );

  /*
   * =========================================================
   * رفع صورة
   * =========================================================
   */

  async function uploadImage(file, folder) {

    if (!file || !db) {
      return null;
    }

    /*
     * اسم آمن وفريد للصورة
     */

    const extension =
      (
        file.name.split('.').pop() ||
        'jpg'
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const random =
      Math.random()
        .toString(36)
        .substring(2, 10);

    const path =
      `${folder}/${Date.now()}-${random}.${extension}`;

    /*
     * اسم الـ bucket المتوقع
     */

    const bucket =
      'hayati';

    try {

      const upload =
        await db.storage
          .from(bucket)
          .upload(
            path,
            file,
            {
              upsert: true,
              contentType:
                file.type ||
                'image/jpeg'
            }
          );

      if (upload.error) {

        console.error(
          'Storage upload error:',
          upload.error
        );

        return null;
      }

      const publicUrl =
        db.storage
          .from(bucket)
          .getPublicUrl(path);

      return (
        publicUrl.data &&
        publicUrl.data.publicUrl
      )
        ? publicUrl.data.publicUrl
        : null;

    } catch (error) {

      console.error(
        'Image upload error:',
        error
      );

      return null;
    }
  }

  /*
   * معاينة صورة المنتج
   */

  const pimageFile =
    $('#pimageFile');

  if (pimageFile) {

    pimageFile.addEventListener(
      'change',
      () => {

        const file =
          pimageFile.files &&
          pimageFile.files[0];

        const preview =
          $('#productPreview');

        if (!file || !preview) {
          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {

          preview.src =
            reader.result;

          preview.style.display =
            'block';
        };

        reader.readAsDataURL(file);
      }
    );
  }

  /*
   * =========================================================
   * حفظ المنتج
   * =========================================================
   */

  const productForm =
    $('#productForm');

  if (productForm) {

    productForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        if (!db) {
          alert(
            'Supabase غير متصل.'
          );
          return;
        }

        const name =
          String(
            $('#pname')?.value || ''
          ).trim();

        const category =
          String(
            $('#pcat')?.value || ''
          ).trim();

        const price =
          Number(
            $('#pprice')?.value || 0
          );

        const oldPriceRaw =
          String(
            $('#pold')?.value || ''
          ).trim();

        const stock =
          Number(
            $('#pstock')?.value || 0
          );

        const description =
          String(
            $('#pdesc')?.value || ''
          ).trim();

        let image =
          String(
            $('#pimage')?.value || ''
          ).trim();

        if (!name) {
          alert('أدخلي اسم المنتج.');
          return;
        }

        if (!category) {
          alert('اختاري القسم.');
          return;
        }

        if (price < 0) {
          alert('السعر غير صحيح.');
          return;
        }

        if (stock < 0) {
          alert('المخزون غير صحيح.');
          return;
        }

        const submit =
          productForm.querySelector(
            'button[type="submit"]'
          );

        if (submit) {
          submit.disabled = true;
          submit.textContent =
            'جاري الحفظ...';
        }

        try {

          /*
           * إذا اختار المدير صورة جديدة
           */

          const file =
            pimageFile &&
            pimageFile.files &&
            pimageFile.files[0];

          if (file) {

            const uploaded =
              await uploadImage(
                file,
                'products'
              );

            if (!uploaded) {

              alert(
                'تعذر رفع الصورة.\n' +
                'تأكدي من وجود Storage bucket باسم hayati وصلاحياته.'
              );

              return;
            }

            image = uploaded;
          }

          const productData = {

            name,

            category,

            price,

            old_price:
              oldPriceRaw === ''
                ? null
                : Number(oldPriceRaw),

            stock,

            description,

            image_url:
              image || null
          };

          let result;

          if (editingProductId) {

            result =
              await db
                .from('products')
                .update(productData)
                .eq(
                  'id',
                  editingProductId
                );

          } else {

            result =
              await db
                .from('products')
                .insert(
                  productData
                );
          }

          if (result.error) {

            console.error(
              'Save product error:',
              result.error
            );

            alert(
              'تعذر حفظ المنتج:\n' +
              result.error.message
            );

            return;
          }

          alert(
            editingProductId
              ? 'تم تعديل المنتج بنجاح ✓'
              : 'تمت إضافة المنتج بنجاح ✓'
          );

          resetProductForm();

          await loadProducts();

        } catch (error) {

          console.error(error);

          alert(
            'حدث خطأ أثناء حفظ المنتج.'
          );

        } finally {

          if (submit) {
            submit.disabled = false;
            submit.textContent =
              'حفظ المنتج';
          }
        }
      }
    );
  }

  /*
   * =========================================================
   * إلغاء تعديل المنتج
   * =========================================================
   */

  function resetProductForm() {

    editingProductId = null;

    const form =
      $('#productForm');

    if (form) {
      form.reset();
    }

    const pid =
      $('#pid');

    if (pid) {
      pid.value = '';
    }

    const pimage =
      $('#pimage');

    if (pimage) {
      pimage.value = '';
    }

    const preview =
      $('#productPreview');

    if (preview) {
      preview.src = '';
      preview.style.display =
        'none';
    }

    const cancel =
      $('#cancelEdit');

    if (cancel) {
      cancel.style.display =
        'none';
    }
  }

  const cancelEdit =
    $('#cancelEdit');

  if (cancelEdit) {

    cancelEdit.addEventListener(
      'click',
      resetProductForm
    );
  }

  /*
   * =========================================================
   * الشعار
   * =========================================================
   */

  const logoFile =
    $('#logoFile');

  if (logoFile) {

    logoFile.addEventListener(
      'change',
      () => {

        const file =
          logoFile.files &&
          logoFile.files[0];

        const preview =
          $('#logoPreview');

        if (!file || !preview) {
          return;
        }

        const reader =
          new FileReader();

        reader.onload = () => {

          preview.src =
            reader.result;

          preview.style.display =
            'block';
        };

        reader.readAsDataURL(file);
      }
    );
  }

  const logoForm =
    $('#logoForm');

  if (logoForm) {

    logoForm.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        if (!db) {
          showLogoMessage(
            'Supabase غير متصل.'
          );
          return;
        }

        const file =
          logoFile &&
          logoFile.files &&
          logoFile.files[0];

        if (!file) {

          showLogoMessage(
            'اختاري صورة الشعار أولا.'
          );

          return;
        }

        const button =
          logoForm.querySelector(
            'button[type="submit"]'
          );

        if (button) {
          button.disabled = true;
          button.textContent =
            'جاري الحفظ...';
        }

        showLogoMessage('');

        try {

          const url =
            await uploadImage(
              file,
              'site'
            );

          if (!url) {

            showLogoMessage(
              'تعذر رفع الشعار. تأكدي من Storage bucket باسم hayati.'
            );

            return;
          }

          /*
           * نخزن رابط الشعار في localStorage
           * حتى تستطيع صفحات المتجر قراءته.
           */

          localStorage.setItem(
            'hayati_logo',
            url
          );

          showLogoMessage(
            'تم حفظ الشعار بنجاح ✓',
            true
          );

        } catch (error) {

          console.error(error);

          showLogoMessage(
            'حدث خطأ أثناء حفظ الشعار.'
          );

        } finally {

          if (button) {
            button.disabled = false;
            button.textContent =
              'حفظ الشعار';
          }
        }
      }
    );
  }

  /*
   * =========================================================
   * بدء لوحة المدير
   * =========================================================
   */

  async function start() {

    db = createDatabase();

    if (!db) {
      return;
    }

    window.HAYATI_DB =
      db;

    try {

      db.auth.onAuthStateChange(
        (event, session) => {

          if (session) {
            showPanel();
          } else {
            showLogin();
          }
        }
      );

    } catch (error) {

      console.error(
        'Auth listener error:',
        error
      );
    }

    await checkSession();
  }

  /*
   * البداية
   */

  start();

})();
