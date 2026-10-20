(function () {
  'use strict';

  var gid = function (id) { return document.getElementById(id); };
  var LABEL = { new: 'New', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
  var STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  var CATS = {};
  function setCats(list) { CATS = {}; (list || []).forEach(function (c) { CATS[c.slug] = c.name; }); }
  var settings = {};
  var view = 'orders';
  var filter = 'all';
  var counts = {};
  var lastNew = null;
  var knownIds = {};
  var toastTimer = 0;

  function esc(s) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return map[c]; });
  }
  function money(cents) {
    return (cents / 100).toLocaleString(undefined, { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + (settings.currency || '');
  }
  function when(s) { return new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString(); }
  function toast(msg) {
    var el = gid('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }
  function api(method, url, body, raw) {
    var headers = {};
    if (body && !raw) headers['Content-Type'] = 'application/json';
    if (raw) { headers['Content-Type'] = raw; headers['X-Requested-With'] = 'fetch'; }
    return fetch(url, { method: method, headers: headers, body: raw ? body : (body ? JSON.stringify(body) : undefined) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && url !== '/api/admin/login') { showLogin(); }
        if (!r.ok) { var e = new Error(j.message || j.error || 'Request failed'); e.data = j; throw e; }
        return j;
      });
    });
  }

  /* ----- auth ----- */
  function showLogin() { gid('app').hidden = true; gid('login').hidden = false; gid('pw').focus(); }
  function boot() {
    api('GET', '/api/admin/me').then(function (r) {
      settings = r.settings; setCats(r.categories);
      gid('login').hidden = true; gid('app').hidden = false;
      gid('shopTitle').textContent = (settings.shop_name || 'Shop') + ' admin';
      go(view); poll();
    }).catch(function () { showLogin(); });
  }
  gid('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    gid('loginErr').textContent = '';
    api('POST', '/api/admin/login', { password: gid('pw').value }).then(function () {
      gid('pw').value = ''; boot();
    }).catch(function (err) { gid('loginErr').textContent = err.message; });
  });
  gid('logout').addEventListener('click', function () {
    api('POST', '/api/admin/logout', {}).then(function () { lastNew = null; showLogin(); });
  });

  /* ----- navigation ----- */
  gid('nav').addEventListener('click', function (e) {
    var b = e.target.closest('[data-view]');
    if (b) go(b.getAttribute('data-view'));
  });
  function go(v) {
    view = v;
    Array.prototype.forEach.call(gid('nav').children, function (b) { b.classList.toggle('on', b.getAttribute('data-view') === v); });
    if (v === 'orders') loadOrders(); else if (v === 'products') loadProducts();
    else if (v === 'categories') loadCategories(); else if (v === 'shipping') loadCountries(); else renderSettings();
  }

  /* ----- orders ----- */
  function setBadge() {
    var n = counts.new || 0;
    gid('newBadge').hidden = !n; gid('newBadge').textContent = n;
    document.title = (n ? '(' + n + ') ' : '') + 'Admin';
  }
  function poll() {
    if (poll.t) return;
    var tick = function () {
      if (gid('app').hidden) return;
      api('GET', '/api/admin/stats').then(function (r) {
        counts = r.counts; setBadge();
        if (lastNew !== null && (counts.new || 0) > lastNew) {
          toast('New order received');
          if (view === 'orders') loadOrders(true);
        }
        lastNew = counts.new || 0;
      }).catch(function () { /* ignore transient errors */ });
    };
    poll.t = setInterval(tick, 20000);
    tick();
  }
  function loadOrders(quiet) {
    var q = filter === 'all' ? '' : '?status=' + filter;
    Promise.all([api('GET', '/api/admin/orders' + q), api('GET', '/api/admin/stats')]).then(function (res) {
      counts = res[1].counts; setBadge(); lastNew = counts.new || 0;
      var orders = res[0].orders;
      var chips = ['all'].concat(STATUSES).map(function (s) {
        var n = s === 'all' ? STATUSES.reduce(function (a, k) { return a + (counts[k] || 0); }, 0) : (counts[s] || 0);
        return '<button type="button" class="chip' + (s === filter ? ' on' : '') + '" data-f="' + s + '">' + (s === 'all' ? 'All' : LABEL[s]) + ' (' + n + ')</button>';
      }).join('');
      var rows = orders.map(function (o) {
        var fresh = !quiet ? '' : (knownIds[o.id] ? '' : ' fresh');
        return '<tr class="click' + fresh + '" data-id="' + o.id + '"><td><b>' + esc(o.code) + '</b></td><td class="mute">' + esc(when(o.created_at)) + '</td>' +
          '<td>' + esc(o.name) + '<br><span class="mute">' + esc(o.phone) + '</span></td><td>' + esc(o.city) + '</td><td>' + o.item_count + '</td>' +
          '<td>' + esc(money(o.total_cents)) + '</td><td><span class="status ' + o.status + '">' + LABEL[o.status] + '</span></td></tr>';
      }).join('');
      orders.forEach(function (o) { knownIds[o.id] = 1; });
      gid('main').innerHTML = '<div class="head"><h2>Orders</h2><div class="chips" id="chips">' + chips + '</div></div>' +
        (orders.length ? '<div class="wrap"><table><thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>City</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody id="orows">' + rows + '</tbody></table></div>'
          : '<div class="wrap"><p class="empty">No orders here yet.</p></div>');
    }).catch(function (e) { toast(e.message); });
  }
  gid('main').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-f]');
    if (chip) { filter = chip.getAttribute('data-f'); loadOrders(); return; }
    var row = e.target.closest('tr[data-id]');
    if (row) openOrder(Number(row.getAttribute('data-id')));
    var pr = e.target.closest('[data-edit]');
    if (pr) openProduct(pr.getAttribute('data-edit'));
    if (e.target.closest('#addProduct')) openProduct('new');
    var ce = e.target.closest('[data-cat-edit]');
    if (ce) openCategory(ce.getAttribute('data-cat-edit'));
    if (e.target.closest('#addCat')) openCategory('new');
    var ke = e.target.closest('[data-country-edit]');
    if (ke) openCountry(ke.getAttribute('data-country-edit'));
    if (e.target.closest('#addCountry')) openCountry('new');
  });

  var dlg = gid('dlg');
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  function closeRow(extra) {
    return '<div class="row">' + (extra || '') + '<button type="button" class="btn sec" data-close>Close</button></div>';
  }
  dlg.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) dlg.close(); });

  function openOrder(id) {
    api('GET', '/api/admin/orders/' + id).then(function (r) {
      var o = r.order;
      var digits = String(o.phone).replace(/\D/g, '');
      var items = r.items.map(function (i) {
        return '<tr><td>' + esc(i.name) + (i.size ? ' <span class="mute">(size ' + esc(i.size) + ')</span>' : '') + '</td><td>' + i.qty + '</td><td>' + esc(money(i.price_cents)) + '</td><td>' + esc(money(i.price_cents * i.qty)) + '</td></tr>';
      }).join('');
      dlg.innerHTML = '<div class="dlg"><h3>Order ' + esc(o.code) + '</h3><div class="mute">' + esc(when(o.created_at)) + '</div>' +
        '<label>Status<select id="stSel">' + STATUSES.map(function (s) { return '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + LABEL[s] + '</option>'; }).join('') + '</select></label>' +
        '<div class="cols"><div class="kv"><b>Customer</b>' + esc(o.name) + '</div>' +
        '<div class="kv"><b>Phone</b><span><a href="tel:' + esc(o.phone) + '">' + esc(o.phone) + '</a> · <a href="https://wa.me/' + esc(digits) + '" target="_blank" rel="noopener">WhatsApp</a></span></div>' +
        '<div class="kv"><b>Country</b>' + esc(o.country || '\u2014') + '</div><div class="kv"><b>City</b>' + esc(o.city) + '</div>' +
        '<div class="kv"><b>Address</b>' + esc(o.address) + '</div>' +
        '<div class="kv"><b>Customer viewed prices in</b>' + esc(o.display_currency ? o.display_currency + ' (' + Number(o.display_total).toLocaleString() + ' ' + o.display_currency + ')' : '\u2014') + '</div></div>' +
        (o.notes ? '<div class="kv"><b>Customer notes</b>' + esc(o.notes) + '</div>' : '') +
        '<div class="wrap"><table class="slim"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>' + items + '</tbody></table></div>' +
        (o.shipping_cents ? '<div class="row mute">Shipping: ' + esc(money(o.shipping_cents)) + '</div>' : '') +
        '<div class="row"><b>Total: ' + esc(money(o.total_cents)) + '</b></div>' + closeRow() + '</div>';
      dlg.showModal();
      gid('stSel').addEventListener('change', function () {
        api('PATCH', '/api/admin/orders/' + id, { status: this.value }).then(function () { toast('Status updated'); loadOrders(); })
          .catch(function (err) { toast(err.message); openOrder(id); });
      });
    }).catch(function (e) { toast(e.message); });
  }

  /* ----- products ----- */
  var products = [];
  function loadProducts() {
    api('GET', '/api/admin/products').then(function (r) {
      products = r.products;
      var rows = products.map(function (p) {
        return '<tr class="click" data-edit="' + p.id + '"><td>' + (p.image ? '<img class="thumb" src="/uploads/' + esc(p.image) + '" alt="">' : '<span class="thumb"></span>') + '</td>' +
          '<td><b>' + esc(p.name) + '</b>' + (p.name_ar ? '<br><span class="mute">' + esc(p.name_ar) + '</span>' : '') + '</td><td>' + esc(CATS[p.category]) + '</td>' +
          '<td>' + esc(money(p.price_cents)) + '</td><td>' + p.stock + '</td><td>' + (p.active ? '<span class="status delivered">Visible</span>' : '<span class="status">Hidden</span>') + '</td></tr>';
      }).join('');
      gid('main').innerHTML = '<div class="head"><h2>Products</h2><button type="button" class="btn" id="addProduct">Add product</button></div>' +
        (products.length ? '<div class="wrap"><table><thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Shop</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
          : '<div class="wrap"><p class="empty">No products yet. Add your first one.</p></div>');
    }).catch(function (e) { toast(e.message); });
  }

  function prepImage(file) {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bmp) {
      var sc = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas');
      c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.86); });
    });
  }

  function openProduct(id) {
    var p = id === 'new' ? { name: '', name_ar: '', description: '', description_ar: '', category: Object.keys(CATS)[0] || '', price_cents: 0, stock: 1, sizes: [], image: '', active: 1 }
      : products.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!p) return;
    var image = p.image;
    dlg.innerHTML = '<form class="dlg" id="pf"><h3>' + (id === 'new' ? 'Add product' : 'Edit product') + '</h3>' +
      '<div class="cols"><label>Name (English)<input name="name" required maxlength="120" value="' + esc(p.name) + '"></label>' +
      '<label>Name (Arabic)<input name="name_ar" dir="rtl" maxlength="120" value="' + esc(p.name_ar) + '"></label></div>' +
      '<div class="cols"><label>Description (English)<textarea name="description" maxlength="1000">' + esc(p.description) + '</textarea></label>' +
      '<label>Description (Arabic)<textarea name="description_ar" dir="rtl" maxlength="1000">' + esc(p.description_ar) + '</textarea></label></div>' +
      '<div class="cols"><label>Category<select name="category">' + Object.keys(CATS).map(function (k) { return '<option value="' + k + '"' + (k === p.category ? ' selected' : '') + '>' + CATS[k] + '</option>'; }).join('') + '</select></label>' +
      '<label>Price (' + esc(settings.currency) + ')<input name="price" type="number" min="0" step="0.01" required value="' + (p.price_cents / 100) + '"></label></div>' +
      '<div class="cols"><label>Stock<input name="stock" type="number" min="0" step="1" required value="' + p.stock + '"></label>' +
      '<label>Sizes (comma separated, leave empty if none)<input name="sizes" placeholder="6, 7, 8, 9" value="' + esc(p.sizes.join(', ')) + '"></label></div>' +
      '<div class="imgbox"><div id="imgPrev"></div><div><label>Photo<input type="file" id="imgIn" accept="image/*"></label><button type="button" class="link" id="imgRm">Remove photo</button></div></div>' +
      '<label class="inline"><input type="checkbox" name="active"' + (p.active ? ' checked' : '') + '> Show in shop</label>' +
      '<p class="err" id="pErr" role="alert"></p>' +
      '<div class="row">' + (id === 'new' ? '' : '<button type="button" class="btn danger" id="pDel">Delete</button>') +
      '<button type="button" class="btn sec" data-close>Cancel</button><button type="submit" class="btn">Save</button></div></form>';
    var showImg = function () { gid('imgPrev').innerHTML = image ? '<img class="thumb" src="/uploads/' + esc(image) + '" alt="">' : '<span class="thumb"></span>'; };
    showImg();
    dlg.showModal();
    gid('imgIn').addEventListener('change', function () {
      var f = this.files[0];
      if (!f) return;
      gid('pErr').textContent = 'Uploading…';
      prepImage(f).then(function (blob) { return api('POST', '/api/admin/upload', blob, 'image/jpeg'); })
        .then(function (r) { image = r.file; showImg(); gid('pErr').textContent = ''; })
        .catch(function () { gid('pErr').textContent = 'Could not use that image. Try a JPG or PNG.'; });
    });
    gid('imgRm').addEventListener('click', function () { image = ''; showImg(); });
    if (id !== 'new') {
      gid('pDel').addEventListener('click', function () {
        if (!confirm('Delete "' + p.name + '"? Past orders keep their item names. To just hide it from the shop, untick "Show in shop" instead.')) return;
        api('DELETE', '/api/admin/products/' + p.id).then(function () { dlg.close(); toast('Deleted'); loadProducts(); }).catch(function (e) { gid('pErr').textContent = e.message; });
      });
    }
    gid('pf').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var body = {
        name: f.name.value, name_ar: f.name_ar.value, description: f.description.value, description_ar: f.description_ar.value,
        category: f.category.value, price: f.price.value, stock: f.stock.value, sizes: f.sizes.value, image: image, active: f.active.checked
      };
      (id === 'new' ? api('POST', '/api/admin/products', body) : api('PUT', '/api/admin/products/' + p.id, body))
        .then(function () { dlg.close(); toast('Saved'); loadProducts(); })
        .catch(function (err) { gid('pErr').textContent = err.message; });
    });
  }

  /* ----- categories ----- */
  var categories = [];
  function loadCategories() {
    api('GET', '/api/admin/categories').then(function (r) {
      categories = r.categories;
      setCats(categories);
      var rows = categories.map(function (c) {
        return '<tr class="click" data-cat-edit="' + c.id + '"><td><b>' + esc(c.name) + '</b>' + (c.name_ar ? '<br><span class="mute">' + esc(c.name_ar) + '</span>' : '') + '</td>' +
          '<td>' + c.products + '</td><td>' + c.sort + '</td></tr>';
      }).join('');
      gid('main').innerHTML = '<div class="head"><h2>Categories</h2><button type="button" class="btn" id="addCat">Add category</button></div>' +
        '<p class="mute">These are the category tabs in the shop. Empty categories are hidden from customers.</p>' +
        (categories.length ? '<div class="wrap"><table class="slim"><thead><tr><th>Name</th><th>Products</th><th>Order</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
          : '<div class="wrap"><p class="empty">No categories yet. Add one before adding products.</p></div>');
    }).catch(function (e) { toast(e.message); });
  }
  function openCategory(id) {
    var c = id === 'new' ? { name: '', name_ar: '', sort: '' } : categories.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!c) return;
    dlg.innerHTML = '<form class="dlg" id="cf"><h3>' + (id === 'new' ? 'Add category' : 'Edit category') + '</h3>' +
      '<div class="cols"><label>Name (English)<input name="name" required maxlength="60" value="' + esc(c.name) + '"></label>' +
      '<label>Name (Arabic)<input name="name_ar" dir="rtl" maxlength="60" value="' + esc(c.name_ar) + '"></label></div>' +
      (id === 'new' ? '' : '<label>Order in the shop (lower shows first)<input name="sort" type="number" step="1" value="' + esc(c.sort) + '"></label>') +
      '<p class="err" id="cErr" role="alert"></p><div class="row">' +
      (id === 'new' ? '' : '<button type="button" class="btn danger" id="cDel">Delete</button>') +
      '<button type="button" class="btn sec" data-close>Cancel</button><button type="submit" class="btn">Save</button></div></form>';
    dlg.showModal();
    if (id !== 'new') {
      gid('cDel').addEventListener('click', function () {
        if (!confirm('Delete the category "' + c.name + '"?')) return;
        api('DELETE', '/api/admin/categories/' + c.id).then(function () { dlg.close(); toast('Category deleted'); loadCategories(); })
          .catch(function (e) { gid('cErr').textContent = e.message; });
      });
    }
    gid('cf').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var body = { name: f.name.value, name_ar: f.name_ar.value };
      if (f.sort) body.sort = f.sort.value;
      (id === 'new' ? api('POST', '/api/admin/categories', body) : api('PUT', '/api/admin/categories/' + c.id, body))
        .then(function () { dlg.close(); toast('Saved'); loadCategories(); })
        .catch(function (err) { gid('cErr').textContent = err.message; });
    });
  }

  /* ----- shipping countries ----- */
  var countries = [];
  function loadCountries() {
    api('GET', '/api/admin/countries').then(function (r) {
      countries = r.countries;
      var rows = countries.map(function (c) {
        return '<tr class="click" data-country-edit="' + c.id + '"><td><b>' + esc(c.name) + '</b>' + (c.name_ar ? '<br><span class="mute">' + esc(c.name_ar) + '</span>' : '') + '</td>' +
          '<td>' + (c.fee_cents ? esc(money(c.fee_cents)) : 'Free') + '</td></tr>';
      }).join('');
      gid('main').innerHTML = '<div class="head"><h2>Shipping countries</h2><button type="button" class="btn" id="addCountry">Add country</button></div>' +
        '<p class="mute">Customers choose one of these at checkout, and its shipping fee is added to the order. With no countries, checkout does not ask for one.</p>' +
        (countries.length ? '<div class="wrap"><table class="slim"><thead><tr><th>Country</th><th>Shipping fee</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
          : '<div class="wrap"><p class="empty">No shipping countries.</p></div>');
    }).catch(function (e) { toast(e.message); });
  }
  function openCountry(id) {
    var c = id === 'new' ? { name: '', name_ar: '', fee_cents: 0 } : countries.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!c) return;
    dlg.innerHTML = '<form class="dlg" id="kf"><h3>' + (id === 'new' ? 'Add shipping country' : 'Edit shipping country') + '</h3>' +
      '<div class="cols"><label>Country (English)<input name="name" required maxlength="60" value="' + esc(c.name) + '"></label>' +
      '<label>Country (Arabic)<input name="name_ar" dir="rtl" maxlength="60" value="' + esc(c.name_ar) + '"></label></div>' +
      '<label>Shipping fee in ' + esc(settings.currency) + ' (0 for free)<input name="fee" type="number" min="0" step="0.01" required value="' + (c.fee_cents / 100) + '"></label>' +
      '<p class="err" id="kErr" role="alert"></p><div class="row">' +
      (id === 'new' ? '' : '<button type="button" class="btn danger" id="kDel">Delete</button>') +
      '<button type="button" class="btn sec" data-close>Cancel</button><button type="submit" class="btn">Save</button></div></form>';
    dlg.showModal();
    if (id !== 'new') {
      gid('kDel').addEventListener('click', function () {
        if (!confirm('Stop shipping to ' + c.name + '? Past orders keep their country.')) return;
        api('DELETE', '/api/admin/countries/' + c.id).then(function () { dlg.close(); toast('Country removed'); loadCountries(); })
          .catch(function (e) { gid('kErr').textContent = e.message; });
      });
    }
    gid('kf').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var body = { name: f.name.value, name_ar: f.name_ar.value, fee: f.fee.value };
      (id === 'new' ? api('POST', '/api/admin/countries', body) : api('PUT', '/api/admin/countries/' + c.id, body))
        .then(function () { dlg.close(); toast('Saved'); loadCountries(); })
        .catch(function (err) { gid('kErr').textContent = err.message; });
    });
  }

  /* ----- currencies and page content (settings) ----- */
  function currencyRows() {
    var extra = (settings.currencies || []).slice(1);
    return extra.map(function (c, i) { return curRow(c, i); }).join('');
  }
  function curRow(c, i) {
    return '<div class="cur-row" data-i="' + i + '"><input name="code" maxlength="3" placeholder="IQD" value="' + esc(c.code) + '" aria-label="Currency code">' +
      '<input name="rate" type="number" min="0" step="any" placeholder="1310" value="' + esc(c.rate) + '" aria-label="Rate">' +
      '<input name="round" type="number" min="0" step="any" placeholder="250" value="' + esc(c.round || '') + '" aria-label="Round to">' +
      '<button type="button" class="link" data-cur-rm>Remove</button></div>';
  }
  function settingsExtra() {
    var s = settings;
    return '<form class="card" id="curf"><h3>Currencies customers can choose</h3>' +
      '<p class="mute">Prices are entered in ' + esc(s.currency) + '. For each extra currency, enter how much 1 ' + esc(s.currency) +
      ' is worth in it, and optionally a step to round prices to (for example 250 for IQD). Customers pick a currency at the top of the shop. You still confirm the final price by phone.</p>' +
      '<div class="cur-head"><span>Code</span><span>1 ' + esc(s.currency) + ' =</span><span>Round to</span><span></span></div>' +
      '<div id="curRows">' + currencyRows() + '</div>' +
      '<div class="row slim-row"><button type="button" class="btn sec sm" id="curAdd">Add currency</button></div>' +
      '<p class="err" id="curErr" role="alert"></p><div class="row"><button class="btn" type="submit">Save currencies</button></div></form>' +
      '<form class="card" id="cof"><h3>About us and Contact us</h3>' +
      '<label>About us (English)<textarea name="about_en" maxlength="2000">' + esc(s.about_en) + '</textarea></label>' +
      '<label>About us (Arabic)<textarea name="about_ar" dir="rtl" maxlength="2000">' + esc(s.about_ar) + '</textarea></label>' +
      '<label>Phone number shown on the site<input name="contact_phone" inputmode="tel" value="' + esc(s.contact_phone) + '"></label>' +
      '<div class="cols"><label>Address (English)<input name="contact_address" maxlength="200" value="' + esc(s.contact_address) + '"></label>' +
      '<label>Address (Arabic)<input name="contact_address_ar" dir="rtl" maxlength="200" value="' + esc(s.contact_address_ar) + '"></label></div>' +
      '<div class="cols"><label>Opening hours (English)<input name="contact_hours" maxlength="120" placeholder="Sat to Thu, 10am to 10pm" value="' + esc(s.contact_hours) + '"></label>' +
      '<label>Opening hours (Arabic)<input name="contact_hours_ar" dir="rtl" maxlength="120" value="' + esc(s.contact_hours_ar) + '"></label></div>' +
      '<div class="cols"><label>Instagram username<input name="instagram" maxlength="31" value="' + esc(s.instagram) + '"></label>' +
      '<label>Google Maps link<input name="map_url" maxlength="400" placeholder="https://maps.app.goo.gl/..." value="' + esc(s.map_url) + '"></label></div>' +
      '<p class="err" id="coErr" role="alert"></p><div class="row"><button class="btn" type="submit">Save page content</button></div></form>';
  }
  function bindSettingsExtra() {
    var rowsBox = gid('curRows');
    gid('curAdd').addEventListener('click', function () {
      rowsBox.insertAdjacentHTML('beforeend', curRow({ code: '', rate: '', round: '' }, rowsBox.children.length));
    });
    rowsBox.addEventListener('click', function (e) { var b = e.target.closest('[data-cur-rm]'); if (b) b.parentNode.remove(); });
    gid('curf').addEventListener('submit', function (e) {
      e.preventDefault();
      var list = Array.prototype.map.call(rowsBox.querySelectorAll('.cur-row'), function (r) {
        return { code: r.querySelector('[name=code]').value, rate: r.querySelector('[name=rate]').value, round: r.querySelector('[name=round]').value || 0 };
      }).filter(function (c) { return c.code.trim(); });
      api('PUT', '/api/admin/currencies', { currencies: list })
        .then(function (r) { settings = r.settings; gid('curErr').textContent = ''; toast('Currencies saved'); })
        .catch(function (err) { gid('curErr').textContent = err.message; });
    });
    gid('cof').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements; var body = {};
      ['about_en', 'about_ar', 'contact_phone', 'contact_address', 'contact_address_ar', 'contact_hours', 'contact_hours_ar', 'instagram', 'map_url']
        .forEach(function (k) { body[k] = f[k].value; });
      api('PUT', '/api/admin/content', body)
        .then(function (r) { settings = r.settings; gid('coErr').textContent = ''; toast('Page content saved'); })
        .catch(function (err) { gid('coErr').textContent = err.message; });
    });
  }

  /* ----- settings ----- */
  function renderSettings() {
    gid('main').innerHTML = '<div class="head"><h2>Settings</h2></div><div class="settings">' +
      '<form class="card" id="sf"><h3>Shop</h3>' +
      '<label>Shop name (English)<input name="shop_name" required maxlength="60" value="' + esc(settings.shop_name) + '"></label>' +
      '<label>Shop name (Arabic)<input name="shop_name_ar" dir="rtl" maxlength="60" value="' + esc(settings.shop_name_ar) + '"></label>' +
      '<label>Main currency, the one you enter prices in (e.g. USD, IQD). Changing it does not convert existing prices.<input name="currency" required maxlength="3" value="' + esc(settings.currency) + '"></label>' +
      '<label>WhatsApp number with country code, digits only (optional)<input name="whatsapp" inputmode="tel" placeholder="9647701234567" value="' + esc(settings.whatsapp) + '"></label>' +
      '<p class="err" id="sErr" role="alert"></p><div class="row"><button class="btn" type="submit">Save settings</button></div></form>' +
      settingsExtra() +
      '<form class="card" id="pwf"><h3>Change admin password</h3>' +
      '<label>Current password<input type="password" name="current" autocomplete="current-password" required></label>' +
      '<label>New password (10+ characters)<input type="password" name="next" autocomplete="new-password" minlength="10" required></label>' +
      '<p class="err" id="wErr" role="alert"></p><div class="row"><button class="btn" type="submit">Change password</button></div></form></div>';
    gid('sf').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      api('PUT', '/api/admin/settings', { shop_name: f.shop_name.value, shop_name_ar: f.shop_name_ar.value, currency: f.currency.value, whatsapp: f.whatsapp.value })
        .then(function (r) { settings = r.settings; gid('shopTitle').textContent = settings.shop_name + ' admin'; toast('Settings saved'); gid('sErr').textContent = ''; renderSettings(); })
        .catch(function (err) { gid('sErr').textContent = err.message; });
    });
    bindSettingsExtra();
    gid('pwf').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      api('POST', '/api/admin/password', { current: f.current.value, next: f.next.value })
        .then(function () { toast('Password changed'); e.target.reset(); gid('wErr').textContent = ''; })
        .catch(function (err) { gid('wErr').textContent = err.message; });
    });
  }

  boot();
})();
