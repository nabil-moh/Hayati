/* =========================================================
   HAYATI STORE - ADMIN CSS
   لوحة قويتا زعوفتي المديرة
   النسخة الجديدة - تصميم تطبيق الهاتف
   ========================================================= */

*{
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  margin:0;
  font-family:Arial,"Noto Naskh Arabic",Tahoma,sans-serif;
  background:#fff5f8;
  color:#333;
  direction:rtl;
}

button,
input,
textarea,
select{
  font-family:inherit;
}

button{
  cursor:pointer;
}

img{
  max-width:100%;
  display:block;
}

/* =========================================================
   التطبيق
   ========================================================= */

.app{
  width:100%;
  min-height:100vh;
}

.app-header{
  position:sticky;
  top:0;
  z-index:1000;

  width:100%;
  min-height:70px;

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:12px 16px;

  background:#fff;
  border-bottom:1px solid #f0dce4;
  box-shadow:0 3px 15px rgba(0,0,0,.07);
}

.brand{
  display:flex;
  align-items:center;
  gap:10px;
}

.brand-icon{
  width:42px;
  height:42px;

  display:flex;
  align-items:center;
  justify-content:center;

  background:#c85a82;
  color:#fff;

  border-radius:13px;
  font-size:21px;

  box-shadow:0 4px 10px rgba(200,90,130,.25);
}

.brand b{
  display:block;
  font-size:19px;
  color:#333;
}

.brand small{
  display:block;
  margin-top:2px;
  color:#888;
  font-size:12px;
}

/* =========================================================
   الإشعارات
   ========================================================= */

.notification-box{
  position:relative;
}

.notification-btn{
  position:relative;

  width:46px;
  height:46px;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:0;

  border:1px solid #ead5dd;
  border-radius:14px;

  background:#fff;
  color:#333;

  font-size:22px;

  box-shadow:0 2px 8px rgba(0,0,0,.05);
}

.notification-btn:hover{
  background:#fff5f8;
}

/* العداد الأسود */

.notification-count{
  position:absolute;

  top:-6px;
  left:-6px;

  min-width:22px;
  height:22px;

  padding:0 6px;

  display:flex;
  align-items:center;
  justify-content:center;

  background:#000;
  color:#fff;

  border-radius:50px;

  font-size:11px;
  font-weight:bold;

  border:2px solid #fff;
}

.notification-menu{
  position:absolute;

  top:56px;
  left:0;

  width:300px;
  max-width:calc(100vw - 20px);

  background:#fff;

  border:1px solid #eadbe1;
  border-radius:16px;

  overflow:hidden;

  box-shadow:0 8px 30px rgba(0,0,0,.14);

  z-index:2000;
}

.notification-title{
  padding:14px;

  font-weight:bold;
  font-size:16px;

  background:#fff8fa;

  border-bottom:1px solid #f0e1e6;
}

#notificationList{
  max-height:380px;
  overflow-y:auto;
}

.notification-item{
  display:block;

  width:100%;

  padding:13px;

  text-align:right;

  background:#fff;

  color:#333;

  border:0;
  border-bottom:1px solid #f1e5e9;

  border-radius:0;

  font-size:14px;

  line-height:1.6;
}

.notification-item:hover{
  background:#fff5f8;
}

.notification-item:last-child{
  border-bottom:0;
}

.notification-item strong{
  display:block;
  margin-bottom:3px;
}

.notification-item small{
  color:#888;
}

/* =========================================================
   تسجيل الدخول
   ========================================================= */

.login-screen{
  width:100%;
  min-height:calc(100vh - 70px);

  display:flex;
  align-items:center;
  justify-content:center;

  padding:25px 15px;
}

.login-card{
  width:100%;
  max-width:430px;

  background:#fff;

  padding:28px 22px;

  border-radius:24px;

  box-shadow:0 8px 30px rgba(0,0,0,.08);

  text-align:center;
}

.login-logo{
  width:72px;
  height:72px;

  margin:0 auto 15px;

  display:flex;
  align-items:center;
  justify-content:center;

  background:#c85a82;
  color:#fff;

  border-radius:22px;

  font-size:31px;

  box-shadow:0 7px 18px rgba(200,90,130,.25);
}

.login-card h1{
  margin:8px 0 3px;

  font-size:25px;
  color:#333;
}

.login-role{
  margin:0 0 24px;

  color:#c85a82;
  font-size:17px;
  font-weight:bold;
}

.login-card form{
  text-align:right;
}

.login-card label{
  display:block;

  margin-top:13px;
  margin-bottom:5px;

  font-weight:bold;
  font-size:14px;
}

.login-card input{
  width:100%;
}

#loginForm button[type="submit"]{
  width:100%;

  margin-top:16px;

  padding:13px;

  border:0;
  border-radius:12px;

  background:#c85a82;
  color:#fff;

  font-size:16px;
  font-weight:bold;
}

#loginForm button[type="submit"]:hover{
  opacity:.92;
}

#loginMsg{
  min-height:20px;

  margin:12px 0 0;

  color:#c0395f;

  font-size:14px;
  font-weight:bold;

  text-align:center;
}

/* =========================================================
   كلمة المرور
   ========================================================= */

.password-wrap{
  position:relative;
  width:100%;
}

.password-wrap input{
  width:100%;

  padding-left:52px;
  padding-right:12px;
}

.password-toggle{
  position:absolute !important;

  left:7px !important;
  top:50% !important;

  transform:translateY(-50%) !important;

  width:40px !important;
  height:40px !important;

  padding:0 !important;
  margin:0 !important;

  display:flex !important;
  align-items:center !important;
  justify-content:center !important;

  background:transparent !important;

  color:#555 !important;

  border:0 !important;
  box-shadow:none !important;

  font-size:19px !important;
}

/* =========================================================
   لوحة المدير
   ========================================================= */

.admin-panel{
  width:100%;
  max-width:1000px;

  margin:auto;

  padding:18px 15px 40px;
}

.welcome-card{
  display:flex;
  align-items:center;
  gap:13px;

  padding:17px;

  margin-bottom:17px;

  background:#fff;

  border-radius:18px;

  box-shadow:0 4px 16px rgba(0,0,0,.06);
}

.welcome-icon{
  width:50px;
  height:50px;

  flex:none;

  display:flex;
  align-items:center;
  justify-content:center;

  background:#fff0f5;

  border-radius:15px;

  font-size:24px;
}

.welcome-card h2{
  margin:0 0 4px;

  font-size:20px;
}

.welcome-card p{
  margin:0;

  color:#888;

  font-size:13px;
}

/* =========================================================
   التبويبات
   ========================================================= */

.tabs{
  display:grid;

  grid-template-columns:repeat(3,1fr);

  gap:9px;

  margin-bottom:18px;
}

.tab-btn{
  min-height:48px;

  padding:10px;

  background:#fff;

  color:#666;

  border:1px solid #ead5dd;

  border-radius:13px;

  font-size:14px;
  font-weight:bold;

  box-shadow:0 2px 7px rgba(0,0,0,.04);
}

.tab-btn:hover{
  background:#fff5f8;
}

.tab-btn.active{
  background:#c85a82;
  color:#fff;

  border-color:#c85a82;

  box-shadow:0 4px 12px rgba(200,90,130,.2);
}

/* =========================================================
   أقسام المحتوى
   ========================================================= */

.content-section{
  width:100%;
}

.section-header{
  display:flex;
  align-items:center;

  gap:10px;

  margin-bottom:12px;
}

.section-icon{
  width:40px;
  height:40px;

  display:flex;
  align-items:center;
  justify-content:center;

  background:#fff;

  border-radius:12px;

  font-size:20px;

  box-shadow:0 3px 10px rgba(0,0,0,.05);
}

.section-header h2{
  margin:0;

  font-size:20px;
}

/* =========================================================
   البطاقات العامة
   ========================================================= */

.loading-card,
.empty-card{
  padding:25px 18px;

  background:#fff;

  border-radius:17px;

  text-align:center;

  color:#888;

  box-shadow:0 4px 15px rgba(0,0,0,.05);
}

.empty-card{
  color:#777;
}

/* =========================================================
   الطلبات
   ========================================================= */

.order-card{
  position:relative;

  background:#fff;

  padding:17px;

  margin:12px 0;

  border-radius:18px;

  box-shadow:0 4px 15px rgba(0,0,0,.06);

  border:1px solid #f1e2e7;
}

.order-card h3{
  margin:0 0 12px;

  font-size:18px;
}

.order-card p{
  margin:7px 0;

  line-height:1.65;

  font-size:14px;
}

.order-card strong{
  color:#444;
}

.order-card button{
  margin-top:10px;
}

/* =========================================================
   قائمة المنتجات
   ========================================================= */

.product-card{
  background:#fff;

  padding:16px;

  margin:12px 0;

  border-radius:18px;

  box-shadow:0 4px 15px rgba(0,0,0,.06);

  border:1px solid #f1e2e7;
}

.product-card h3{
  margin:0 0 10px;

  font-size:18px;
}

.product-card p{
  margin:7px 0;

  line-height:1.6;

  font-size:14px;
}

.product-card img{
  width:110px;
  height:110px;

  object-fit:cover;

  margin-bottom:12px;

  border-radius:14px;

  border:1px solid #eee;
}

/* =========================================================
   أزرار المنتجات
   ========================================================= */

.edit-product{
  background:#777 !important;
}

.delete-product{
  background:#b33a3a !important;
}

.product-card button{
  margin:6px 4px 0 0;
}

/* =========================================================
   النماذج
   ========================================================= */

.admin-form{
  background:#fff;

  padding:19px;

  margin-bottom:20px;

  border-radius:19px;

  box-shadow:0 4px 16px rgba(0,0,0,.06);
}

.form-title{
  margin:0 0 15px;

  font-size:18px;

  font-weight:bold;
}

.admin-form label{
  display:block;

  margin-top:12px;
  margin-bottom:5px;

  font-size:14px;
  font-weight:bold;
}

input,
textarea,
select{
  width:100%;

  padding:12px 13px;

  margin:5px 0;

  background:#fff;

  color:#333;

  border:1px solid #ddd;

  border-radius:11px;

  outline:none;

  font-size:15px;
}

input:focus,
textarea:focus,
select:focus{
  border-color:#c85a82;

  box-shadow:0 0 0 3px rgba(200,90,130,.09);
}

textarea{
  min-height:105px;

  resize:vertical;
}

.admin-form button[type="submit"]{
  width:100%;

  margin-top:15px;

  padding:13px;

  background:#c85a82;

  color:#fff;

  border:0;

  border-radius:12px;

  font-weight:bold;

  font-size:15px;
}

.secondary-action{
  width:100%;

  margin-top:9px;

  padding:12px;

  background:#eee !important;

  color:#555 !important;

  border:0;

  border-radius:11px;
}

/* =========================================================
   الأسعار
   ========================================================= */

.price-input{
  position:relative;
}

.price-input input{
  padding-left:55px;
}

.price-input::before{
  content:"دج";

  position:absolute;

  left:12px;
  top:50%;

  transform:translateY(-50%);

  color:#888;

  font-size:13px;

  z-index:2;
}

/* =========================================================
   رفع الصور
   ========================================================= */

.image-upload{
  background:#fff7fa !important;

  border:1px dashed #d9aabb !important;

  padding:11px !important;
}

.preview{
  width:120px;
  height:120px;

  object-fit:cover;

  margin:10px auto;

  border-radius:15px;

  border:1px solid #eee;
}

.logo-preview{
  width:130px;
  height:130px;

  object-fit:contain;

  margin:12px auto;

  padding:8px;

  background:#fff;

  border:1px solid #eee;

  border-radius:18px;
}

/* =========================================================
   قائمة عناصر الطلب
   ========================================================= */

.items-list{
  margin-top:10px;

  padding:12px;

  background:#fff8fa;

  border-radius:12px;

  border:1px solid #f0dfe5;

  line-height:1.7;

  font-size:13px;
}

/* =========================================================
   الشعار
   ========================================================= */

#logoForm{
  background:#fff;

  padding:19px;

  border-radius:19px;

  box-shadow:0 4px 16px rgba(0,0,0,.06);
}

#logoForm label{
  display:block;

  margin-bottom:6px;

  font-weight:bold;
}

#logoForm button{
  width:100%;

  margin-top:10px;
}

#logoMsg{
  min-height:20px;

  margin:10px 0 0;

  text-align:center;

  font-weight:bold;
}

/* =========================================================
   زر الخروج
   ========================================================= */

.logout-action{
  background:#fff !important;

  color:#b33a3a !important;

  border:1px solid #e5c8ce !important;

  border-radius:11px !important;

  padding:9px 13px !important;

  font-size:13px !important;
}

.logout-action:hover{
  background:#fff4f4 !important;
}

/* =========================================================
   شريط التمرير
   ========================================================= */

#notificationList::-webkit-scrollbar{
  width:5px;
}

#notificationList::-webkit-scrollbar-thumb{
  background:#d7b7c3;
  border-radius:10px;
}

/* =========================================================
   الشاشات المتوسطة
   ========================================================= */

@media(min-width:700px){

  .admin-panel{
    padding-left:20px;
    padding-right:20px;
  }

  .product-card{
    display:block;
  }

}

/* =========================================================
   الهاتف
   ========================================================= */

@media(max-width:600px){

  .app-header{
    padding:10px 12px;
  }

  .brand b{
    font-size:17px;
  }

  .brand small{
    font-size:11px;
  }

  .brand-icon{
    width:39px;
    height:39px;

    border-radius:12px;

    font-size:19px;
  }

  .notification-btn{
    width:43px;
    height:43px;

    border-radius:13px;
  }

  .notification-menu{
    position:fixed;

    top:65px;
    left:10px;
    right:10px;

    width:auto;
    max-width:none;
  }

  .admin-panel{
    padding:12px 10px 35px;
  }

  .welcome-card{
    padding:14px;
  }

  .welcome-card h2{
    font-size:18px;
  }

  .section-header h2{
    font-size:18px;
  }

  .tabs{
    grid-template-columns:1fr;

    gap:7px;
  }

  .tab-btn{
    min-height:46px;
  }

  .login-screen{
    padding:18px 12px;
  }

  .login-card{
    padding:23px 17px;

    border-radius:20px;
  }

  .login-logo{
    width:65px;
    height:65px;

    border-radius:19px;
  }

  .login-card h1{
    font-size:22px;
  }

  button{
    -webkit-tap-highlight-color:transparent;
  }

  .product-card button{
    width:100%;

    margin:7px 0 0;
  }

  .order-card{
    padding:14px;
  }

  .admin-form{
    padding:15px;
  }

}

/* =========================================================
   الشاشات الصغيرة جدًا
   ========================================================= */

@media(max-width:380px){

  .brand small{
    display:none;
  }

  .welcome-card{
    align-items:flex-start;
  }

  .welcome-icon{
    width:44px;
    height:44px;
  }

  .notification-menu{
    left:7px;
    right:7px;
  }

}
