(() => {
  'use strict';

  /*
   * =========================================================
   * HAYATI - ADMIN.JS
   * لوحة المدير الجديدة
   * مع جرس إشعارات الطلبات
   * =========================================================
   */

  const $ = (selector) => document.querySelector(selector);

  const config = window.HAYATI_CONFIG || {};

  let db = null;
  let editingProductId = null;
  let ordersChannel = null;

  const money = (value) =>
    new Intl.NumberFormat('ar-DZ').format(Number(value) || 0) + ' دج';

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  /*
   * =========================================================
   * الرسائل
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
   * جرس الإشعارات
   * =========================================================
   */

  function updateNotificationCount(count) {

    const box = $('#notificationBox');
    const badge = $('#notificationCount');

    if (!badge) return;

    const number = Math.max(0, Number(count) || 0);

    if (box) {
      box.style.display = 'block';
    }

    if (number > 0) {

      badge.textContent =
        number > 99 ? '99+' : String(number);

      badge.style.display = 'flex';

    } else {

      badge.textContent = '0';
      badge.style.display = 'none';

    }
  }


  function closeNotificationMenu() {

    const menu = $('#notificationMenu');

    if (menu) {
      menu.style.display = 'none';
    }

  }


  function toggleNotificationMenu() {

    const menu = $('#notificationMenu');

    if (!menu) return;

    const isHidden =
      menu.style.display === 'none' ||
      menu.style.display === '';

    menu.style.display =
      isHidden ? 'block' : 'none';

  }


  function renderNotifications(orders) {

    const list = $('#notificationList');

    if (!list) return;

    if (!orders.length) {

      list.innerHTML = `
        <div class="notification-empty">
          لا توجد طلبات حاليًا.
        </div>
      `;

      return;
    }

    list.innerHTML = orders.map(order => {

      const name =
        order.customer_name ||
        'زبون';

      const total =
        money(order.total);

      const date =
        order.created_at
          ? new Date(order.created_at)
              .toLocaleString('ar-DZ')
          : '';

      return `
        <button
          type="button"
          class="notification-item"
          data-order-id="${esc(order.id || '')}"
        >

          <span class="notification-item-icon">
            📦
          </span>

          <span class="notification-item-content">

            <strong>
              طلب جديد من ${esc(name)}
            </strong>

            <small>
              ${esc(total)}
              ${date ? ` • ${esc(date)}` : ''}
            </small>

          </span>

        </button>
      `;

    }).join('');

  }


  /*
   * تحميل عدد الطلبات وقائمة الإشعارات
   *
   * مهم:
   * لا نستخدم localStorage للعداد.
   * العدد يأتي مباشرة من جدول orders.
   */

  async function updateNotifications() {

    if (!db) return;

    try {

      const result = await db
        .from('orders')
        .select('*')
        .order('created_at', {
          ascending: false
        });

      if (result.error) {

        console.error(
          'Notification orders error:',
          result.error
        );

        return;
      }

      const orders =
        Array.isArray(result.data)
          ? result.data
          : [];

      /*
       * عدد الطلبات الموجودة فعليًا.
       * عند حذف طلب ينقص تلقائيًا.
       */

      updateNotificationCount(
        orders.length
      );

      renderNotifications(orders);

    } catch (error) {

      console.error(
        'Notification error:',
        error
      );

    }

  }


  /*
   * الضغط على جرس الإشعارات
   */

  const notificationBtn =
    $('#notificationBtn');

  if (notificationBtn) {

    notificationBtn.addEventListener(
      'click',
      (event) => {

        event.stopPropagation();

        toggleNotificationMenu();

      }
    );

  }


  /*
   * الضغط على إشعار
   *
   * لا نحذف الإشعار ولا ننقص العداد.
   * فقط ننتقل إلى قسم الطلبات.
   */

  document.addEventListener(
    'click',
    (event) => {

      const item =
        event.target.closest(
          '.notification-item'
        );

      if (!item) return;

      const ordersTab =
        $('#ordersTab');

      if (ordersTab) {
        ordersTab.click();
      }

      closeNotificationMenu();

    }
  );


  /*
   * إغلاق قائمة الإشعارات عند الضغط خارجها
   */

  document.addEventListener(
    'click',
    (event) => {

      const box =
        $('#notificationBox');

      const menu =
        $('#notificationMenu');

      if (!box || !menu) return;

      if (!box.contains(event.target)) {
        closeNotificationMenu();
      }

    }
  );


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
   * الاشتراك الحقيقي في الطلبات
   * =========================================================
   */

  function startOrdersRealtime() {

    if (!db) return;

    /*
     * إذا كان هناك اشتراك سابق، نلغيه.
     */

    if (ordersChannel) {

      try {
        db.removeChannel(ordersChannel);
      } catch (error) {
        console.error(error);
      }

      ordersChannel = null;
    }


    ordersChannel =
      db.channel(
        'hayati-orders-notifications'
      );


    ordersChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {

          console.log(
            'Order realtime event:',
            payload.eventType
          );

          /*
           * أي إضافة أو حذف أو تغيير
           * نعيد حساب العدد من قاعدة البيانات.
           */

          await updateNotifications();

          /*
           * إذا كان هناك طلب جديد:
           * نفتح القائمة ونحدثها.
           */

          if (payload.eventType === 'INSERT') {

            const menu =
              $('#notificationMenu');

            if (menu) {
              menu.style.display = 'block';
            }

          }

        }
      )
      .subscribe((status) => {

        console.log(
          'Orders realtime status:',
          status
        );

      });

  }


  /*
   * =========================================================
   * عرض اللوحة
   * =========================================================
   */

  function showPanel() {

    const login = $('#login');
    const panel = $('#panel');
    const logoutBtn = $('#logoutBtn');
    const notificationBox =
      $('#notificationBox');

    if (login) {
      login.style.display = 'none';
    }

    if (panel) {
      panel.style.display = 'block';
    }

    if (logoutBtn) {
      logoutBtn.style.display = 'block';
    }

    if (notificationBox) {
      notificationBox.style.display = 'block';
    }

    loadOrders();
    loadProducts();

    updateNotifications();

    startOrdersRealtime();

  }


  function showLogin() {

    const login = $('#login');
    const panel = $('#panel');
    const logoutBtn = $('#logoutBtn');
    const notificationBox =
      $('#notificationBox');

    if (login) {
      login.style.display = 'block';
    }

    if (panel) {
      panel.style.display = 'none';
    }

    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }

    if (notificationBox) {
      notificationBox.style.display = 'none';
    }

    closeNotificationMenu();

    updateNotificationCount(0);

    /*
     * إيقاف الاشتراك عند تسجيل الخروج.
     */

    if (ordersChannel && db) {

      try {
        db.removeChannel(ordersChannel);
      } catch (error) {
        console.error(error);
      }

      ordersChannel = null;
    }

  }


  /*
   * =========================================================
   * الجلسة
   * =========================================================
   */

  async function checkSession() {

    if (!db) return;

    try {

      const result =
        await db.auth.getSession();

      if (result.error) {

        console.error(result.error);

        showLogin();

        return;
      }

      if (result.data?.session) {

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

  const loginForm =
    $('#loginForm');

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
          String(
            $('#email')?.value || ''
          ).trim();

        const password =
          String(
            $('#password')?.value || ''
          );

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

  const logoutBtn =
    $('#logoutBtn');

  if (logoutBtn) {

    logoutBtn.addEventListener(
      'click',
      async () => {

        if (!db) return;

        try {

          await db.auth.signOut();

          showLogin();

          const password =
            $('#password');

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


    const buttons =
      document.querySelectorAll(
        '.tab-btn'
      );

    buttons.forEach(button => {

      button.classList.remove(
        'active'
      );

    });


    const activeButton =
      tabName === 'orders'
        ? $('#ordersTab')
        : tabName === 'products'
          ? $('#productsTab')
          : $('#siteTab');


    if (activeButton) {
      activeButton.classList.add(
        'active'
      );
    }

  }


  const ordersTab =
    $('#ordersTab');

  const productsTab =
    $('#productsTab');

  const siteTab =
    $('#siteTab');


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
      '<div class="loading-card">جاري تحميل الطلبات...</div>';


    try {

      const result =
        await db
          .from('orders')
          .select('*')
          .order('created_at', {
            ascending: false
          });


      if (result.error) {

        console.error(
          'Orders error:',
          result.error
        );

        container.innerHTML =
          `
          <p style="color:crimson;">
            تعذر تحميل الطلبات.<br>
            ${esc(result.error.message)}
          </p>
          `;

        return;
      }


      const orders =
        Array.isArray(result.data)
          ? result.data
          : [];


      /*
       * تحديث العداد دائمًا من نفس البيانات.
       */

      updateNotificationCount(
        orders.length
      );

      renderNotifications(
        orders
      );


      if (!orders.length) {

        container.innerHTML =
          `
          <div class="empty-card">
            📦<br>
            لا توجد طلبات حاليا.
          </div>
          `;

        return;
      }


      container.innerHTML =
        orders
          .map(renderOrder)
          .join('');


    } catch (error) {

      console.error(error);

      container.innerHTML =
        `
        <p style="color:crimson;">
          حدث خطأ أثناء تحميل الطلبات.
        </p>
        `;

    }

  }


  function renderOrder(order) {

    let items = [];

    try {

      if (Array.isArray(order.items)) {

        items = order.items;

      } else if (
        typeof order.items === 'string'
      ) {

        items =
          JSON.parse(order.items);

      }

    } catch {

      items = [];

    }


    const itemsHtml =
      items.length

        ? items
            .map(
              item => `
                <div class="order-item">

                  <b>
                    ${esc(
                      item.name ||
                      'منتج'
                    )}
                  </b>

                  <small>
                    الكمية:
                    ${Number(item.qty) || 0}
                    ×
                    ${money(item.price)}
                  </small>

                </div>
              `
            )
            .join('')

        : '<span>لا توجد تفاصيل المنتجات</span>';


    const date =
      order.created_at
        ? new Date(
            order.created_at
          ).toLocaleString('ar-DZ')
        : '';


    return `
      <article
        class="admin-order order-card"
        data-order-id="${esc(
          order.id || ''
        )}"
      >

        <div class="order-card-header">

          <div>

            <span class="order-label">
              طلب جديد
            </span>

            <h3>
              طلب رقم:
              ${esc(order.id || '')}
            </h3>

          </div>

          <span class="order-icon">
            📦
          </span>

        </div>


        <div class="order-info">

          <p>
            <b>الزبون:</b>
            ${esc(
              order.customer_name || ''
            )}
          </p>

          <p>
            <b>الهاتف:</b>
            ${esc(
              order.phone || ''
            )}
          </p>

          <p>
            <b>الولاية:</b>
            ${esc(
              order.wilaya || ''
            )}
          </p>

          <p>
            <b>البلدية:</b>
            ${esc(
              order.municipality || ''
            )}
          </p>

          <p>
            <b>نقطة الاستلام:</b>
            ${esc(
              order.pickup_point || ''
            )}
          </p>

          <p>
            <b>المجموع:</b>
            <strong>
              ${money(order.total)}
            </strong>
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

        </div>


        <div class="order-products">

          <b>
            المنتجات:
          </b>

          ${itemsHtml}

        </div>


        <button
          type="button"
          class="delete-order danger-action"
          data-id="${esc(
            order.id || ''
          )}"
        >
          🗑️ حذف الطلب
        </button>

      </article>
    `;

  }


  /*
   * =========================================================
   * حذف الطلب
   * =========================================================
   */

  async function deleteOrder(
    id,
    button
  ) {

    if (!id || !db) {

      alert(
        'رقم الطلب غير موجود.'
      );

      return;
    }


    const confirmed =
      confirm(
        'هل أنت متأكدة من حذف هذا الطلب نهائيًا؟'
      );


    if (!confirmed) return;


    const originalText =
      button
        ? button.textContent
        : 'حذف الطلب';


    if (button) {

      button.disabled = true;

      button.textContent =
        'جاري الحذف...';

    }


    try {

      const result =
        await db
          .from('orders')
          .delete()
          .eq('id', id)
          .select('id');


      if (result.error) {

        console.error(
          'Delete order error:',
          result.error
        );

        alert(
          'لم يتم حذف الطلب.\n\n' +
          result.error.message
        );

        return;
      }


      const deletedRows =
        Array.isArray(result.data)
          ? result.data
          : [];


      if (
        deletedRows.length === 0
      ) {

        alert(
          'لم يتم حذف الطلب.\n\n' +
          'غالبًا صلاحيات Supabase (RLS) تمنع حذف الطلبات.'
        );

        return;
      }


      /*
       * مهم:
       * بعد الحذف نعيد الحساب من قاعدة البيانات.
       * لذلك ينقص العداد فقط بعد الحذف الحقيقي.
       */

      await updateNotifications();

      await loadOrders();


      alert(
        'تم حذف الطلب بنجاح ✓'
      );


    } catch (error) {

      console.error(
        'Delete order exception:',
        error
      );

      alert(
        'حدث خطأ أثناء حذف الطلب:\n' +
        (error?.message || error)
      );


    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          originalText;

      }

    }

  }


  document.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '.delete-order'
        );

      if (!button) return;

      deleteOrder(
        button.dataset.id,
        button
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
      '<div class="loading-card">جاري تحميل المنتجات...</div>';


    try {

      const result =
        await db
          .from('products')
          .select('*')
          .order('created_at', {
            ascending: false
          });


      if (result.error) {

        console.error(
          'Products error:',
          result.error
        );

        container.innerHTML =
          `
          <p style="color:crimson;">
            تعذر تحميل المنتجات.<br>
            ${esc(result.error.message)}
          </p>
          `;

        return;
      }


      const products =
        Array.isArray(result.data)
          ? result.data
          : [];


      if (!products.length) {

        container.innerHTML =
          `
          <div class="empty-card">
            🛍️<br>
            لا توجد منتجات حاليا.
          </div>
          `;

        return;
      }


      container.innerHTML =
        products
          .map(renderProduct)
          .join('');


    } catch (error) {

      console.error(error);

      container.innerHTML =
        `
        <p style="color:crimson;">
          حدث خطأ أثناء تحميل المنتجات.
        </p>
        `;

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
          <div class="old-price">
            <del>
              ${money(product.old_price)}
            </del>
          </div>
        `

        : '';


    return `
      <article
        class="admin-product product-card"
      >

        ${
          image

            ? `
              <img
                src="${esc(image)}"
                alt="${esc(
                  product.name || ''
                )}"
              >
            `

            : `
              <div class="no-image">
                🛍️
              </div>
            `
        }


        <h3>
          ${esc(
            product.name ||
            'منتج'
          )}
        </h3>


        <p>
          القسم:
          <b>
            ${esc(
              product.category || ''
            )}
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
                ${esc(
                  product.description
                )}
              </p>
            `
            : ''
        }


        <div class="product-actions">

          <button
            type="button"
            class="edit-product"
            data-id="${esc(
              product.id
            )}"
          >
            ✏️ تعديل
          </button>


          <button
            type="button"
            class="delete-product"
            data-id="${esc(
              product.id
            )}"
          >
            🗑️ حذف
          </button>

        </div>

      </article>
    `;

  }


  /*
   * =========================================================
   * تعديل المنتج
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

        alert(
          'المنتج غير موجود.'
        );

        return;
      }


      editingProductId =
        product.id;


      if ($('#pid'))
        $('#pid').value =
          product.id || '';


      if ($('#pname'))
        $('#pname').value =
          product.name || '';


      if ($('#pcat'))
        $('#pcat').value =
          product.category || '';


      if ($('#pprice'))
        $('#pprice').value =
          product.price ?? '';


      if ($('#pold'))
        $('#pold').value =
          product.old_price ?? '';


      if ($('#pstock'))
        $('#pstock').value =
          product.stock ?? 0;


      if ($('#pdesc'))
        $('#pdesc').value =
          product.description || '';


      const image =
        product.image_url ||
        product.image ||
        '';


      if ($('#pimage')) {

        $('#pimage').value =
          image;

      }


      const preview =
        $('#productPreview');


      if (preview && image) {

        preview.src =
          image;

        preview.style.display =
          'block';

      }


      const cancel =
        $('#cancelEdit');


      if (cancel) {

        cancel.style.display =
          'block';

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

  async function deleteProduct(
    id,
    button
  ) {

    if (!id || !db) {

      alert(
        'رقم المنتج غير موجود.'
      );

      return;
    }


    const confirmed =
      confirm(
        'هل أنت متأكد من حذف هذا المنتج نهائيًا؟'
      );


    if (!confirmed) return;


    const originalText =
      button
        ? button.textContent
        : 'حذف';


    if (button) {

      button.disabled = true;

      button.textContent =
        'جاري الحذف...';

    }


    try {

      const result =
        await db
          .from('products')
          .delete()
          .eq('id', id)
          .select('id');


      if (result.error) {

        console.error(
          'Delete product error:',
          result.error
        );

        alert(
          'لم يتم حذف المنتج.\n\n' +
          result.error.message
        );

        return;
      }


      const deletedRows =
        Array.isArray(result.data)
          ? result.data
          : [];


      if (
        deletedRows.length === 0
      ) {

        alert(
          'لم يتم حذف المنتج.\n\n' +
          'غالبًا صلاحيات Supabase (RLS) تمنع الحذف.'
        );

        return;
      }


      alert(
        'تم حذف المنتج بنجاح ✓'
      );


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
        'حدث خطأ أثناء حذف المنتج:\n' +
        (error?.message || error)
      );


    } finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          originalText;

      }

    }

  }


  document.addEventListener(
    'click',
    event => {

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
          deleteButton.dataset.id,
          deleteButton
        );

      }

    }
  );


  /*
   * =========================================================
   * رفع الصور
   * =========================================================
   */

  async function uploadImage(
    file,
    folder
  ) {

    if (!file || !db)
      return null;


    const extension =
      (
        file.name
          .split('.')
          .pop() ||
        'jpg'
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ''
        );


    const random =
      Math.random()
        .toString(36)
        .substring(2, 10);


    const path =
      `${folder}/${Date.now()}-${random}.${extension}`;


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
          .getPublicUrl(
            path
          );


      return (
        publicUrl
          .data
          ?.publicUrl ||
        null
      );


    } catch (error) {

      console.error(
        'Image upload error:',
        error
      );

      return null;

    }

  }


  /*
   * =========================================================
   * معاينة صورة المنتج
   * =========================================================
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


        if (!file || !preview)
          return;


        const reader =
          new FileReader();


        reader.onload =
          () => {

            preview.src =
              reader.result;

            preview.style.display =
              'block';

          };


        reader.readAsDataURL(
          file
        );

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
      async event => {

        event.preventDefault();


        if (!db) {

          alert(
            'Supabase غير متصل.'
          );

          return;

        }


        const name =
          String(
            $('#pname')?.value ||
            ''
          ).trim();


        const category =
          String(
            $('#pcat')?.value ||
            ''
          ).trim();


        const price =
          Number(
            $('#pprice')?.value ||
            0
          );


        const oldPriceRaw =
          String(
            $('#pold')?.value ||
            ''
          ).trim();


        const stock =
          Number(
            $('#pstock')?.value ||
            0
          );


        const description =
          String(
            $('#pdesc')?.value ||
            ''
          ).trim();


        let image =
          String(
            $('#pimage')?.value ||
            ''
          ).trim();


        if (!name) {

          alert(
            'أدخلي اسم المنتج.'
          );

          return;
        }


        if (!category) {

          alert(
            'اختاري القسم.'
          );

          return;
        }


        if (price < 0) {

          alert(
            'السعر غير صحيح.'
          );

          return;
        }


        if (
          oldPriceRaw !== '' &&
          Number(oldPriceRaw) < 0
        ) {

          alert(
            'السعر القديم غير صحيح.'
          );

          return;
        }


        if (stock < 0) {

          alert(
            'المخزون غير صحيح.'
          );

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


            image =
              uploaded;

          }


          const productData = {

            name,

            category,

            price,

            old_price:
              oldPriceRaw === ''
                ? null
                : Number(
                    oldPriceRaw
                  ),

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
                .update(
                  productData
                )
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
            'حدث خطأ أثناء حفظ المنتج:\n' +
            (error?.message || error)
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
   * إعادة نموذج المنتج
   * =========================================================
   */

  function resetProductForm() {

    editingProductId =
      null;


    const form =
      $('#productForm');


    if (form)
      form.reset();


    const pid =
      $('#pid');


    if (pid)
      pid.value = '';


    const pimage =
      $('#pimage');


    if (pimage)
      pimage.value = '';


    if (pimageFile)
      pimageFile.value = '';


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


        if (!file || !preview)
          return;


        const reader =
          new FileReader();


        reader.onload =
          () => {

            preview.src =
              reader.result;

            preview.style.display =
              'block';

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  const logoForm =
    $('#logoForm');


  if (logoForm) {

    logoForm.addEventListener(
      'submit',
      async event => {

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

    db =
      createDatabase();


    if (!db) return;


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


  start();

})();
