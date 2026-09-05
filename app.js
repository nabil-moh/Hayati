(()=>{'use strict';

const demo=[
{id:'demo-1',name:'فستان وردي ناعم',category:'ملابس',price:2900,image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80'},
{id:'demo-2',name:'بلوزة أنيقة',category:'ملابس',price:1850,image:'https://images.unsplash.com/photo-1564257577054-0e5ab90e0f0f?auto=format&fit=crop&w=700&q=80'},
{id:'demo-3',name:'عباية مطرزة',category:'ملابس',price:3500,image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80'},
{id:'demo-4',name:'عطر نسائي أنيق',category:'عطور',price:2200,image:'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80'},
{id:'demo-5',name:'سيروم للبشرة',category:'مواد التجميل',price:1950,image:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80'},
{id:'demo-6',name:'أحمر شفاه مطفي',category:'مواد التجميل',price:1250,image:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80'},
{id:'demo-7',name:'حذاء نسائي أنيق',category:'أحذية',price:3200,image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80'},
{id:'demo-8',name:'حذاء بكعب أنيق',category:'أحذية',price:3900,image:'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80'}
];

const wilayas=[
'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار',
'البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو',
'الجزائر','الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس',
'عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر',
'ورقلة','وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف',
'تندوف','تيسمسيلت','الوادي','خنشلة','سوق أهراس','تيبازة','ميلة',
'عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان','تيميمون',
'برج باجي مختار','أولاد جلال','بني عباس','عين صالح','عين قزام',
'تقرت','جانت','المغير','المنيعة'
];

const $=s=>document.querySelector(s);

const money=n=>
new Intl.NumberFormat('ar-DZ').format(Number(n)||0)+' دج';

const esc=v=>
String(v??'').replace(/[&<>"']/g,m=>({
'&':'&amp;',
'<':'&lt;',
'>':'&gt;',
'"':'&quot;',
"'":'&#39;'
}[m]));

let products=[...demo];
let cart=loadCart();
let activeCat='';
let toastTimer;

function loadCart(){
try{
const x=JSON.parse(localStorage.getItem('hayati_cart')||'[]');
return Array.isArray(x)?x:[];
}catch{
return[];
}
}

function save(){
localStorage.setItem('hayati_cart',JSON.stringify(cart));
renderCart();
}

function toast(text){
const t=$('#toast');
if(!t)return;

t.textContent=text;
t.classList.add('show');

clearTimeout(toastTimer);

toastTimer=setTimeout(()=>{
t.classList.remove('show');
},2300);
}

function renderProducts(){

const search=$('#search');

const q=(search?.value||'')
.trim()
.toLowerCase();

const list=products.filter(p=>
(!activeCat||p.category===activeCat)&&
(!q||
String(p.name||'').toLowerCase().includes(q)||
String(p.category||'').toLowerCase().includes(q)
)
);

const container=$('#list');

if(!container)return;

container.innerHTML=list.length
?
list.map(p=>`
<article class="product">

<div class="pic">
<img
src="${esc(p.image||'')}"
alt="${esc(p.name)}"
style="width:100%;height:100%;object-fit:cover"
onerror="this.style.display='none';this.parentElement.textContent='🛍️'"
>
</div>

<div class="info">

<h3>${esc(p.name)}</h3>

<span>${esc(p.category)}</span>

<p class="price">${money(p.price)}</p>

<button class="buy" data-id="${esc(p.id)}">
أضيفي إلى السلة
</button>

</div>

</article>
`).join('')
:
'<div class="status">لا توجد منتجات حاليا.</div>';

document.querySelectorAll('.buy').forEach(button=>{
button.onclick=()=>{
add(button.dataset.id);
};
});

}

function renderCart(){

const count=cart.reduce(
(sum,item)=>sum+(Number(item.qty)||0),
0
);

const countEl=$('#cartCount');

if(countEl)
countEl.textContent=count;

const total=cart.reduce(
(sum,item)=>
sum+
(Number(item.price)||0)*
(Number(item.qty)||0),
0
);

const items=$('#cartItems');

if(items){

items.innerHTML=cart.length
?
cart.map(item=>`
<div class="row">

<span>
${esc(item.name)}
<br>
<small>
${money(item.price)} × ${item.qty}
</small>
</span>

<span>

<button data-minus="${esc(item.id)}">−</button>

${item.qty}

<button data-plus="${esc(item.id)}">+</button>

<button
class="remove"
data-remove="${esc(item.id)}"
>
حذف
</button>

</span>

</div>
`).join('')
:
'<p class="status">السلة فارغة.</p>';

}

const totalEl=$('#total');

if(totalEl)
totalEl.textContent=
new Intl.NumberFormat('ar-DZ').format(total);

document.querySelectorAll('[data-minus]').forEach(button=>{
button.onclick=()=>{
change(button.dataset.minus,-1);
};
});

document.querySelectorAll('[data-plus]').forEach(button=>{
button.onclick=()=>{
change(button.dataset.plus,1);
};
});

document.querySelectorAll('[data-remove]').forEach(button=>{
button.onclick=()=>{
cart=cart.filter(
item=>String(item.id)!==
String(button.dataset.remove)
);

save();
};
});

}

function add(id){

const product=products.find(
item=>String(item.id)===String(id)
);

if(!product)return;

const existing=cart.find(
item=>String(item.id)===String(id)
);

if(existing){
existing.qty++;
}else{
cart.push({
id:product.id,
name:product.name,
price:Number(product.price)||0,
qty:1
});
}

save();

toast('تمت إضافة طلبك إلى السلة ✓');
}

function change(id,difference){

const item=cart.find(
x=>String(x.id)===String(id)
);

if(!item)return;

item.qty=
(Number(item.qty)||0)+difference;

if(item.qty<1){

cart=cart.filter(
x=>String(x.id)!==String(id)
);

}

save();
}

function openModal(modal){

if(!modal)return;

modal.style.display='flex';
modal.setAttribute('aria-hidden','false');

}

function closeModal(modal){

if(!modal)return;

modal.style.display='none';
modal.setAttribute('aria-hidden','true');

}

async function connect(){

const config=window.HAYATI_CONFIG||{};

if(
!config.SUPABASE_URL||
!config.SUPABASE_ANON_KEY||
!window.supabase
){
console.error('Supabase configuration is missing.');
return;
}

try{

const db=window.supabase.createClient(
config.SUPABASE_URL,
config.SUPABASE_ANON_KEY
);

window.HAYATI_DB=db;

const result=
await db
.from('products')
.select('*');

if(result.error){

console.warn(
'Products error:',
result.error
);

return;
}

if(
Array.isArray(result.data)&&
result.data.length
){

products=result.data.map(product=>({

id:product.id,

name:
product.name||
product.title||
'منتج',

category:
product.category||
'',

price:
Number(product.price)||0,

image:
product.image_url||
product.image||
''

}));

}

}catch(error){

console.error(
'Supabase connection error:',
error
);

}

}

const wilayaSelect=$('#wilaya');

if(wilayaSelect){

wilayaSelect.innerHTML=
'<option value="">اختاري الولاية</option>'+
wilayas.map(w=>
`<option value="${esc(w)}">${esc(w)}</option>`
).join('');

}

document.querySelectorAll('.cat').forEach(button=>{

button.onclick=()=>{

activeCat=
activeCat===button.dataset.cat
?''
:button.dataset.cat;

document.querySelectorAll('.cat').forEach(item=>{

item.classList.toggle(
'active',
item===button&&!!activeCat
);

});

renderProducts();

const productsSection=$('#products');

if(productsSection){

productsSection.scrollIntoView({
behavior:'smooth'
});

}

};

});

const search=$('#search');

if(search)
search.oninput=renderProducts;

const cartButton=$('#cartBtn');

if(cartButton){

cartButton.onclick=()=>{
openModal($('#cartModal'));
};

}

const closeCart=$('#closeCart');

if(closeCart){

closeCart.onclick=()=>{
closeModal($('#cartModal'));
};

}

const closeCheckout=$('#closeCheckout');

if(closeCheckout){

closeCheckout.onclick=()=>{
closeModal($('#checkoutModal'));
};

}

const checkoutButton=$('#checkoutBtn');

if(checkoutButton){

checkoutButton.onclick=()=>{

if(!cart.length){

toast(
'السلة فارغة، أضيفي منتجا أولا'
);

return;

}

closeModal($('#cartModal'));

openModal($('#checkoutModal'));

const message=$('#orderMsg');

if(message)
message.textContent='';

};

}

document.querySelectorAll('.modal').forEach(modal=>{

modal.addEventListener('click',event=>{

if(event.target===modal)
closeModal(modal);

});

});

const orderForm=$('#orderForm');

if(orderForm){

orderForm.onsubmit=async event=>{

event.preventDefault();

const message=$('#orderMsg');

if(message)
message.textContent='جاري إرسال الطلب...';

const form=new FormData(orderForm);

const customer_name=
String(form.get('customer_name')||'').trim();

const phone=
String(form.get('phone')||'').trim();

const wilaya=
String(form.get('wilaya')||'').trim();

const municipality=
String(form.get('municipality')||'').trim();

const pickup=
String(form.get('pickup_point')||'').trim();

const total=cart.reduce(
(sum,item)=>
sum+
(Number(item.price)||0)*
(Number(item.qty)||0),
0
);

if(
!customer_name||
!phone||
!wilaya||
!municipality||
!pickup
){

if(message)
message.textContent=
'يرجى ملء جميع الخانات المطلوبة.';

return;

}

try{

if(!window.HAYATI_DB){

throw new Error('Supabase غير متصل');

}

const order={

customer_name:customer_name,

phone:phone,

wilaya:wilaya,

address:pickup,

notes:municipality,

items:cart,

total:total,

status:'pending'

};

const result=
await window.HAYATI_DB
.from('orders')
.insert(order);

if(result.error){

console.error(
'Hayati Supabase order error:',
result.error
);

const error=result.error;

if(message){

message.textContent=
'خطأ Supabase:'+
(error.code?
' | الكود: '+error.code:'')+
(error.message?
' | '+error.message:'')+
(error.details?
' | التفاصيل: '+error.details:'')+
(error.hint?
' | الحل: '+error.hint:'');

}

return;

}

cart=[];

save();

orderForm.reset();

if(message)
message.textContent=
'تم تأكيد طلبك بنجاح ✓';

toast(
'تم تأكيد طلبك بنجاح ✓'
);

}catch(error){

console.error(
'Hayati final order error:',
error
);

if(message){

message.textContent=
'خطأ:'+
(error.message||
'تعذر إرسال الطلب');

}

}

};

}

renderCart();

renderProducts();

connect().then(()=>{
renderProducts();
});

})();
