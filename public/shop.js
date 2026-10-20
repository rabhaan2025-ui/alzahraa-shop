(function () {
  'use strict';

  var T = {
    en: {
      skip: 'Skip to the collection', cart: 'Cart', close: 'Close', all: 'All',
      eyebrow: 'Fine silver jewelry',
      heroTitle: 'Silver rings, made to be worn every day.',
      heroSub: "Order online and we'll call you to confirm and arrange delivery.",
      heroCta: 'Browse the collection', howLink: 'How ordering works',
      marquee: 'Made to be worn every day',
      collectionEyebrow: 'The collection', collectionTitle: 'Pieces in silver',
      howEyebrow: 'Ordering', howTitle: 'Three quiet steps',
      step1t: 'Choose', step1: 'Pick your piece and, for rings, your size.',
      step2t: 'Order', step2: 'Leave your name, phone and address. No payment now.',
      step3t: 'We call you', step3: 'We confirm by phone and arrange delivery.',
      cat_rings: 'Rings', cat_necklaces: 'Necklaces', cat_bracelets: 'Bracelets', cat_earrings: 'Earrings', cat_sets: 'Sets',
      empty: 'Nothing in this category yet.',
      addToCart: 'Add to cart', size: 'Size', chooseSize: 'Choose a size first.',
      soldOut: 'Sold out', lowStock: 'Only {n} left', added: 'Added to cart',
      yourCart: 'Your cart', cartEmpty: 'Your cart is empty.', keepShopping: 'Keep shopping',
      total: 'Total', checkout: 'Checkout', remove: 'Remove',
      name: 'Full name', phone: 'Phone number', city: 'City', address: 'Address', notes: 'Notes (optional)',
      placeOrder: 'Place order', back: 'Back to cart', sending: 'Sending…',
      payNote: "No payment now. We'll call you to confirm the order and delivery.",
      doneTitle: 'Order received', doneText: "We'll call you on {phone} to confirm.", orderNo: 'Your order number',
      whatsapp: 'Chat on WhatsApp', footer: 'Ordered online, confirmed by phone.',
      qtyUp: 'Increase quantity', qtyDown: 'Decrease quantity',
      err_invalid_name: 'Enter your full name.', err_invalid_phone: 'Enter a valid phone number.',
      err_invalid_city: 'Enter your city.', err_invalid_address: 'Enter your address.',
      err_out_of_stock: '{name}: only {n} left. We updated your cart.',
      err_unavailable: 'An item in your cart is no longer available. We updated your cart.',
      err_choose_size: 'Choose a size for every ring.',
      err_rate_limited: 'Too many orders from this device. Try again later.',
      err_network: "Couldn't reach the shop. Check your connection and try again.",
      err_generic: 'Something went wrong. Please try again.'
    },
    ar: {
      skip: 'انتقل إلى المجموعة', cart: 'السلة', close: 'إغلاق', all: 'الكل',
      eyebrow: 'مجوهرات فضة راقية',
      heroTitle: 'خواتم فضة، صُنعت لتُلبس كل يوم.',
      heroSub: 'اطلب أونلاين وسنتصل بك لتأكيد الطلب وترتيب التوصيل.',
      heroCta: 'تصفح المجموعة', howLink: 'كيف تطلب',
      marquee: 'صُنعت لتُلبس كل يوم',
      collectionEyebrow: 'المجموعة', collectionTitle: 'قطع من الفضة',
      howEyebrow: 'الطلب', howTitle: 'ثلاث خطوات بسيطة',
      step1t: 'اختر', step1: 'اختر قطعتك، ومقاسك إن كانت خاتماً.',
      step2t: 'اطلب', step2: 'اترك اسمك وهاتفك وعنوانك. لا دفع الآن.',
      step3t: 'نتصل بك', step3: 'نؤكد الطلب بالهاتف ونرتب التوصيل.',
      cat_rings: 'خواتم', cat_necklaces: 'قلائد', cat_bracelets: 'أساور', cat_earrings: 'أقراط', cat_sets: 'أطقم',
      empty: 'لا توجد منتجات في هذا القسم بعد.',
      addToCart: 'أضف إلى السلة', size: 'المقاس', chooseSize: 'اختر المقاس أولاً.',
      soldOut: 'نفدت الكمية', lowStock: 'متبقي {n} فقط', added: 'أضيف إلى السلة',
      yourCart: 'سلتك', cartEmpty: 'السلة فارغة.', keepShopping: 'تابع التسوق',
      total: 'المجموع', checkout: 'إتمام الطلب', remove: 'إزالة',
      name: 'الاسم الكامل', phone: 'رقم الهاتف', city: 'المدينة', address: 'العنوان', notes: 'ملاحظات (اختياري)',
      placeOrder: 'تأكيد الطلب', back: 'العودة إلى السلة', sending: 'جارٍ الإرسال…',
      payNote: 'لا دفع الآن. سنتصل بك لتأكيد الطلب والتوصيل.',
      doneTitle: 'تم استلام طلبك', doneText: 'سنتصل بك على {phone} لتأكيده.', orderNo: 'رقم طلبك',
      whatsapp: 'راسلنا على واتساب', footer: 'الطلب أونلاين والتأكيد بالهاتف.',
      qtyUp: 'زيادة الكمية', qtyDown: 'تقليل الكمية',
      err_invalid_name: 'أدخل اسمك الكامل.', err_invalid_phone: 'أدخل رقم هاتف صحيحاً.',
      err_invalid_city: 'أدخل اسم المدينة.', err_invalid_address: 'أدخل عنوانك.',
      err_out_of_stock: '{name}: متبقي {n} فقط. حدّثنا سلتك.',
      err_unavailable: 'منتج في سلتك لم يعد متوفراً. حدّثنا سلتك.',
      err_choose_size: 'اختر المقاس لكل خاتم.',
      err_rate_limited: 'عدد الطلبات من هذا الجهاز كبير. حاول لاحقاً.',
      err_network: 'تعذر الاتصال بالمتجر. تحقق من الإنترنت وحاول مرة أخرى.',
      err_generic: 'حدث خطأ. حاول مرة أخرى.'
    }
  };
  var CATS = ['rings', 'necklaces', 'bracelets', 'earrings', 'sets'];

  var gid = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var lang = pickLang();
  var shop = { settings: {}, products: [] };
  var loaded = false;
  var cart = loadCart();
  var activeCat = 'all';
  var view = 'cart';
  var draft = { name: '', phone: '', city: '', address: '', notes: '' };
  var doneInfo = null;
  var banner = '';
  var openProductId = null;
  var toastTimer = 0;

  function pickLang() {
    try { var s = localStorage.getItem('az_lang'); if (s === 'ar' || s === 'en') return s; } catch (e) { /* storage blocked */ }
    return (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  }
  function t(k, vars) {
    var s = T[lang][k];
    if (s == null) s = T.en[k];
    if (s == null) s = k;
    if (vars) for (var v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  }
  function esc(s) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return map[c]; });
  }
  function money(cents) {
    var cur = shop.settings.currency || 'USD';
    try {
      return new Intl.NumberFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', {
        style: 'currency', currency: cur, minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2
      }).format(cents / 100);
    } catch (e) { return (cents / 100).toLocaleString() + ' ' + cur; }
  }
  function api(method, url, body) {
    return fetch(url, {
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || 'generic'); e.data = j; e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function toast(msg) {
    var el = gid('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ----- motion helpers ----- */
  var revealer = null;
  if (!reduced && 'IntersectionObserver' in window) {
    revealer = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        var el = en.target;
        if (el.classList.contains('tile')) el.style.transitionDelay = (i * 70) + 'ms';
        el.classList.add('in');
        revealer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  function reveal(el) {
    if (revealer) revealer.observe(el); else el.classList.add('in');
  }

  function splitTitle() {
    var h = gid('heroTitle');
    var words = t('heroTitle').split(' ');
    h.setAttribute('aria-label', t('heroTitle'));
    h.innerHTML = words.map(function (w) {
      return '<span class="w" aria-hidden="true"><span>' + esc(w) + '</span></span>';
    }).join(' ');
    Array.prototype.forEach.call(h.querySelectorAll('.w > span'), function (s, i) {
      s.style.animationDelay = (280 + i * 90) + 'ms';
    });
  }

  function buildMarquee() {
    var items = CATS.map(function (c) { return t('cat_' + c); }).concat([t('marquee')]);
    var one = items.map(function (s) { return esc(s) + '<i></i>'; }).join('');
    gid('marquee').innerHTML = '<span>' + one + '</span><span>' + one + '</span>';
  }

  function moveInk() {
    var on = gid('tabs').querySelector('.tab.on');
    var ink = gid('tabInk');
    if (!on) return;
    var wrap = gid('tabs').parentNode.getBoundingClientRect();
    var r = on.getBoundingClientRect();
    ink.style.transform = 'translateX(' + (r.left - wrap.left) + 'px) translateY(' + (r.bottom - wrap.top - 1) + 'px) scaleX(' + r.width + ')';
  }

  function flyToCart(fromEl) {
    var target = gid('cartCount');
    function bump() { target.classList.remove('bump'); void target.offsetWidth; target.classList.add('bump'); }
    if (reduced || !fromEl || !fromEl.animate) { bump(); return; }
    var a = fromEl.getBoundingClientRect(); var b = target.getBoundingClientRect();
    var x0 = a.left + a.width / 2; var y0 = a.top + a.height / 2;
    var x1 = b.left + b.width / 2; var y1 = b.top + b.height / 2;
    var dot = document.createElement('span');
    dot.className = 'fly';
    document.body.appendChild(dot);
    var mx = (x0 + x1) / 2; var my = Math.min(y0, y1) - 120;
    dot.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 },
      { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1.25)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.4)', opacity: 0.2 }
    ], { duration: 720, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = function () { dot.remove(); bump(); };
  }

  /* ----- products ----- */
  function byId(id) {
    for (var i = 0; i < shop.products.length; i++) if (shop.products[i].id === id) return shop.products[i];
    return null;
  }
  function pname(p) { return lang === 'ar' && p.name_ar ? p.name_ar : p.name; }
  function pdesc(p) { return lang === 'ar' && p.description_ar ? p.description_ar : p.description; }
  function art(cat) {
    var s = '<svg viewBox="0 0 200 250" aria-hidden="true"><ellipse cx="100" cy="226" rx="46" ry="5" fill="#000" fill-opacity=".45"/>';
    if (cat === 'necklaces') {
      s += '<path d="M40 60 C 60 182, 140 182, 160 60" fill="none" stroke="url(#silver)" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M100 154 L100 160" stroke="url(#silver)" stroke-width="3"/>' +
        '<path d="M100 160 C 86 170, 88 190, 100 198 C 112 190, 114 170, 100 160 Z" fill="url(#silver)"/><circle cx="100" cy="182" r="6" fill="url(#lapis)"/>';
    } else if (cat === 'bracelets') {
      s += '<ellipse cx="100" cy="146" rx="64" ry="34" fill="none" stroke="#3A414B" stroke-width="14" transform="translate(0 4)"/>' +
        '<ellipse cx="100" cy="142" rx="64" ry="34" fill="none" stroke="url(#silver)" stroke-width="12"/>' +
        '<ellipse cx="100" cy="134" rx="62" ry="31" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>';
    } else if (cat === 'earrings') {
      var drop = '<circle cx="72" cy="80" r="6" fill="url(#silver)"/><path d="M72 86 L72 112" stroke="url(#silver)" stroke-width="2.5"/>' +
        '<path d="M72 112 C 52 142, 60 176, 72 184 C 84 176, 92 142, 72 112 Z" fill="url(#silver)"/>';
      s += drop + '<g transform="translate(56 0)">' + drop + '</g>';
    } else if (cat === 'sets') {
      s += '<circle cx="100" cy="156" r="34" fill="none" stroke="url(#silver)" stroke-width="9"/>' +
        '<ellipse cx="100" cy="114" rx="17" ry="13" fill="url(#silver)"/><ellipse cx="100" cy="113" rx="11" ry="8" fill="url(#lapis)"/>' +
        '<circle cx="46" cy="74" r="8" fill="url(#silver)"/><circle cx="154" cy="74" r="8" fill="url(#silver)"/>';
    } else {
      s += '<circle cx="100" cy="156" r="48" fill="none" stroke="#3A414B" stroke-width="14" transform="translate(0 3)"/>' +
        '<circle cx="100" cy="153" r="48" fill="none" stroke="url(#silver)" stroke-width="12"/>' +
        '<ellipse cx="100" cy="100" rx="25" ry="19" fill="url(#silver)"/><ellipse cx="100" cy="99" rx="17" ry="12" fill="url(#lapis)"/>' +
        '<ellipse cx="94" cy="95" rx="5" ry="2.5" fill="#fff" fill-opacity=".45"/>';
    }
    return s + '</svg>';
  }
  function img(p) { return p.image ? '<img src="/uploads/' + esc(p.image) + '" alt="" loading="lazy" decoding="async">' : art(p.category); }

  function renderTabs() {
    var present = {};
    shop.products.forEach(function (p) { present[p.category] = 1; });
    var cats = ['all'].concat(CATS.filter(function (c) { return present[c]; }));
    if (cats.indexOf(activeCat) < 0) activeCat = 'all';
    gid('tabs').innerHTML = cats.map(function (c) {
      return '<button type="button" role="tab" class="tab' + (c === activeCat ? ' on' : '') + '" aria-selected="' + (c === activeCat) + '" data-cat="' + c + '">' +
        esc(c === 'all' ? t('all') : t('cat_' + c)) + '</button>';
    }).join('');
    requestAnimationFrame(moveInk);
  }
  function renderSkeleton() {
    var one = '<div class="skel" aria-hidden="true"><span class="arch"></span><span class="bar"></span><span class="bar sm"></span></div>';
    gid('grid').innerHTML = new Array(9).join(one);
  }
  function renderGrid() {
    if (!loaded) { renderSkeleton(); return; }
    var list = shop.products.filter(function (p) { return activeCat === 'all' || p.category === activeCat; });
    gid('empty').hidden = list.length > 0;
    gid('grid').innerHTML = list.map(function (p) {
      var out = p.stock <= 0;
      return '<button type="button" class="tile enter' + (out ? ' out' : '') + '" data-id="' + p.id + '">' +
        '<span class="arch">' + img(p) + '</span>' +
        '<span class="tile-name">' + esc(pname(p)) + '</span>' +
        '<span class="tile-price">' + esc(money(p.price_cents)) + '</span>' +
        (out ? '<span class="tile-flag">' + esc(t('soldOut')) + '</span>' : '') + '</button>';
    }).join('');
    Array.prototype.forEach.call(gid('grid').children, reveal);
  }

  /* ----- product dialog ----- */
  var pdSize = '';
  function renderProduct() {
    var p = byId(openProductId);
    if (!p) return;
    gid('pdImg').innerHTML = img(p);
    gid('pdCat').textContent = t('cat_' + p.category);
    gid('pdName').textContent = pname(p);
    gid('pdPrice').textContent = money(p.price_cents);
    gid('pdDesc').textContent = pdesc(p);
    gid('pdSizeWrap').hidden = !p.sizes.length;
    gid('pdSizes').innerHTML = p.sizes.map(function (s) {
      return '<label class="size"><input type="radio" name="size" value="' + esc(s) + '"' + (s === pdSize ? ' checked' : '') + '><span>' + esc(s) + '</span></label>';
    }).join('');
    var st = gid('pdStock');
    st.className = 'stock';
    st.textContent = p.stock <= 0 ? t('soldOut') : (p.stock <= 3 ? t('lowStock', { n: p.stock }) : '');
    gid('pdAdd').disabled = p.stock <= 0;
  }
  function openProduct(id) {
    openProductId = id; pdSize = '';
    renderProduct();
    gid('pd').showModal();
  }

  /* ----- cart ----- */
  function loadCart() {
    try { var c = JSON.parse(localStorage.getItem('az_cart') || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem('az_cart', JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
    var n = cart.reduce(function (a, i) { return a + i.qty; }, 0);
    gid('cartCount').textContent = n;
    gid('cartCount').classList.toggle('has', n > 0);
  }
  function cartQty(id) { return cart.reduce(function (a, i) { return a + (i.id === id ? i.qty : 0); }, 0); }
  function reconcile() {
    cart = cart.filter(function (i) {
      var p = byId(i.id);
      if (!p || p.stock <= 0) return false;
      if (p.sizes.length && p.sizes.indexOf(i.size) < 0) return false;
      return Number.isInteger(i.qty) && i.qty > 0;
    });
    cart.forEach(function (i) {
      var p = byId(i.id);
      var others = cartQty(i.id) - i.qty;
      i.qty = Math.max(1, Math.min(i.qty, p.stock - others));
    });
    saveCart();
  }
  function addToCart(p, size) {
    var st = gid('pdStock');
    if (p.sizes.length && !size) {
      st.className = 'stock err'; st.textContent = t('chooseSize');
      if (!reduced) { void st.offsetWidth; st.classList.add('shake'); }
      return false;
    }
    if (cartQty(p.id) + 1 > p.stock) { toast(t('lowStock', { n: p.stock })); return false; }
    var found = null;
    cart.forEach(function (i) { if (i.id === p.id && i.size === (size || '')) found = i; });
    if (found) found.qty += 1; else cart.push({ id: p.id, size: size || '', qty: 1 });
    saveCart(); toast(t('added'));
    return true;
  }
  function cartTotal() {
    return cart.reduce(function (a, i) { var p = byId(i.id); return a + (p ? p.price_cents * i.qty : 0); }, 0);
  }
  function bannerHtml() { return banner ? '<p class="banner" role="alert">' + esc(banner) + '</p>' : ''; }

  function renderCart() {
    var box = gid('cartView');
    if (view === 'done' && doneInfo) {
      box.innerHTML = '<div class="done"><svg class="done-mark" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34"/><path d="M23 37 L32 46 L50 27"/></svg>' +
        '<h3>' + esc(t('doneTitle')) + '</h3><p>' + esc(t('orderNo')) + '</p>' +
        '<span class="code">' + esc(doneInfo.code) + '</span><p>' + esc(t('doneText', { phone: doneInfo.phone })) + '</p></div>' +
        '<div class="stack"><button type="button" class="btn block" data-act="close">' + esc(t('keepShopping')) + '</button></div>';
      return;
    }
    if (!cart.length) {
      view = 'cart';
      box.innerHTML = bannerHtml() + '<p class="cart-empty">' + esc(t('cartEmpty')) + '</p>' +
        '<button type="button" class="btn block" data-act="close">' + esc(t('keepShopping')) + '</button>';
      return;
    }
    if (view === 'checkout') {
      box.innerHTML = bannerHtml() +
        '<form class="form" id="orderForm" novalidate>' +
        field('name', 'text', 'name', 'name') + field('phone', 'tel', 'phone', 'tel') +
        field('city', 'text', 'city', 'address-level2') + field('address', 'text', 'address', 'street-address') +
        '<label>' + esc(t('notes')) + '<textarea name="notes" maxlength="500">' + esc(draft.notes) + '</textarea></label>' +
        '<div class="total"><span>' + esc(t('total')) + '</span><strong>' + esc(money(cartTotal())) + '</strong></div>' +
        '<p class="note">' + esc(t('payNote')) + '</p>' +
        '<button type="submit" class="btn block">' + esc(t('placeOrder')) + '</button>' +
        '<button type="button" class="btn ghost block" data-act="back">' + esc(t('back')) + '</button></form>';
      return;
    }
    box.innerHTML = bannerHtml() + '<div>' + cart.map(function (i, idx) {
      var p = byId(i.id);
      return '<div class="line"><span class="arch">' + img(p) + '</span>' +
        '<div><div class="line-name">' + esc(pname(p)) + '</div>' +
        '<div class="line-meta">' + (i.size ? esc(t('size')) + ' ' + esc(i.size) + ' · ' : '') + esc(money(p.price_cents)) + '</div>' +
        '<button type="button" class="linkish" data-act="rm" data-i="' + idx + '">' + esc(t('remove')) + '</button></div>' +
        '<div class="line-end"><div class="stepper"><button type="button" data-act="dec" data-i="' + idx + '" aria-label="' + esc(t('qtyDown')) + '">&minus;</button>' +
        '<span>' + i.qty + '</span><button type="button" data-act="inc" data-i="' + idx + '" aria-label="' + esc(t('qtyUp')) + '">+</button></div></div></div>';
    }).join('') + '</div>' +
      '<div class="total"><span>' + esc(t('total')) + '</span><strong>' + esc(money(cartTotal())) + '</strong></div>' +
      '<div class="stack"><button type="button" class="btn block" data-act="checkout">' + esc(t('checkout')) + '</button>' +
      '<button type="button" class="btn ghost block" data-act="close">' + esc(t('keepShopping')) + '</button></div>';
  }
  function field(key, type, labelKey, autocomplete) {
    return '<label>' + esc(t(labelKey)) + '<input name="' + key + '" type="' + type + '" value="' + esc(draft[key]) + '" autocomplete="' + autocomplete + '"' +
      (key === 'phone' ? ' dir="ltr" inputmode="tel"' : '') + ' required maxlength="' + (key === 'address' ? 300 : 80) + '"></label>';
  }
  function readDraft(form) {
    ['name', 'phone', 'city', 'address', 'notes'].forEach(function (k) { draft[k] = form.elements[k].value.trim(); });
  }
  function openCart() { banner = ''; if (view === 'done') view = 'cart'; renderCart(); gid('cart').showModal(); }

  function failMsg(e) {
    var d = e.data || {};
    var code = e.status ? (d.error || 'generic') : 'network';
    var p = d.productId ? byId(d.productId) : null;
    var key = 'err_' + code;
    if (!T.en[key]) key = 'err_generic';
    return { code: code, text: t(key, { name: p ? pname(p) : '', n: d.left != null ? d.left : 0 }) };
  }
  function submitOrder(form) {
    readDraft(form);
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = t('sending');
    api('POST', '/api/orders', {
      name: draft.name, phone: draft.phone, city: draft.city, address: draft.address, notes: draft.notes,
      items: cart.map(function (i) { return { id: i.id, qty: i.qty, size: i.size }; })
    }).then(function (r) {
      doneInfo = { code: r.code, phone: draft.phone };
      cart = []; saveCart(); banner = ''; view = 'done';
      draft = { name: '', phone: '', city: '', address: '', notes: '' };
      renderCart(); loadShop();
    }).catch(function (e) {
      var m = failMsg(e);
      if (m.code === 'unavailable' || m.code === 'out_of_stock') {
        loadShop().then(function () { reconcile(); banner = m.text; view = 'cart'; renderCart(); });
      } else { banner = m.text; renderCart(); }
    });
  }

  /* ----- language, data ----- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-label]'), function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label'))); });
    gid('langBtn').textContent = lang === 'ar' ? 'English' : 'عربي';
    var s = shop.settings;
    var name = (lang === 'ar' && s.shop_name_ar) ? s.shop_name_ar : (s.shop_name || 'Alzahraa');
    gid('brand').textContent = name; gid('footMark').textContent = name;
    gid('footBrand').textContent = '© ' + name; document.title = name;
    var wa = gid('wa');
    if (s.whatsapp) { wa.hidden = false; wa.href = 'https://wa.me/' + encodeURIComponent(s.whatsapp); wa.textContent = t('whatsapp'); } else { wa.hidden = true; }
    splitTitle(); buildMarquee();
    renderTabs(); renderGrid();
    if (gid('cart').open) renderCart();
    if (gid('pd').open) renderProduct();
  }
  function loadShop() {
    return api('GET', '/api/shop').then(function (r) {
      shop = r; loaded = true; reconcile(); applyLang();
    }).catch(function () { toast(t('err_network')); });
  }

  /* ----- ambient motion: header state, hero parallax ----- */
  var stageInner = gid('stageInner');
  var px = 0; var py = 0; var sy = 0; var ticking = false;
  function paint() {
    ticking = false;
    gid('top').classList.toggle('scrolled', window.scrollY > 24);
    if (reduced) return;
    var lift = Math.min(sy, 900) * 0.12;
    stageInner.style.transform = 'translate3d(0,' + lift.toFixed(1) + 'px,0) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 8).toFixed(2) + 'deg)';
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', function () { sy = window.scrollY; schedule(); }, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(moveInk); }, { passive: true });
  if (finePointer && !reduced) {
    window.addEventListener('pointermove', function (e) {
      px = (e.clientX / window.innerWidth - 0.5); py = (e.clientY / window.innerHeight - 0.5); schedule();
    }, { passive: true });
  }
  if (reduced) {
    var svg = document.querySelector('.ring-art');
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.rv'), reveal);

  /* ----- events ----- */
  gid('langBtn').addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('az_lang', lang); } catch (e) { /* storage blocked */ }
    applyLang();
  });
  gid('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (b) { activeCat = b.getAttribute('data-cat'); renderTabs(); renderGrid(); }
  });
  gid('tabs').addEventListener('scroll', function () { requestAnimationFrame(moveInk); }, { passive: true });
  gid('grid').addEventListener('click', function (e) {
    var b = e.target.closest('.tile[data-id]');
    if (b) openProduct(Number(b.getAttribute('data-id')));
  });
  gid('pdSizes').addEventListener('change', function (e) { pdSize = e.target.value; gid('pdStock').textContent = ''; gid('pdStock').className = 'stock'; });
  gid('pdAdd').addEventListener('click', function () {
    var p = byId(openProductId);
    if (p && addToCart(p, pdSize)) {
      var btn = gid('pdAdd');
      var r = btn.getBoundingClientRect();
      gid('pd').close();
      flyToCart({ getBoundingClientRect: function () { return r; }, animate: true });
    }
  });
  gid('pdClose').addEventListener('click', function () { gid('pd').close(); });
  gid('cartBtn').addEventListener('click', openCart);
  gid('cartClose').addEventListener('click', function () { gid('cart').close(); });
  ['pd', 'cart'].forEach(function (id) {
    var d = gid(id);
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { document.body.classList.remove('lock'); });
    d.addEventListener('cancel', function () { document.body.classList.remove('lock'); });
  });
  new MutationObserver(function () {
    document.body.classList.toggle('lock', gid('pd').open || gid('cart').open);
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

  gid('cartView').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act'); var i = Number(b.getAttribute('data-i'));
    banner = '';
    if (act === 'close') { gid('cart').close(); return; }
    if (act === 'checkout') { view = 'checkout'; renderCart(); return; }
    if (act === 'back') { var f = gid('orderForm'); if (f) readDraft(f); view = 'cart'; renderCart(); return; }
    if (act === 'rm') cart.splice(i, 1);
    if (act === 'dec') { cart[i].qty -= 1; if (cart[i].qty < 1) cart.splice(i, 1); }
    if (act === 'inc') {
      var p = byId(cart[i].id);
      if (cartQty(p.id) + 1 > p.stock) toast(t('lowStock', { n: p.stock })); else cart[i].qty += 1;
    }
    saveCart(); renderCart();
  });
  gid('cartView').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    readDraft(form);
    var check = [['name', 2, 'invalid_name'], ['city', 2, 'invalid_city'], ['address', 5, 'invalid_address']];
    for (var k = 0; k < check.length; k++) {
      if (draft[check[k][0]].length < check[k][1]) { banner = t('err_' + check[k][2]); renderCart(); return; }
    }
    if (!/^\+?[0-9٠-٩۰-۹][0-9٠-٩۰-۹ \-]{6,18}(?![\s\S])/.test(draft.phone)) { banner = t('err_invalid_phone'); renderCart(); return; }
    banner = '';
    submitOrder(form);
  });

  saveCart();
  applyLang();
  loadShop();
  paint();
})();
