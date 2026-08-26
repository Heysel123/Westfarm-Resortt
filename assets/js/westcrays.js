const products = [
  { id:1, name:'West Farm Crayfish', desc:'Farm-raised Procambarus clarkii, handpicked fresh from our ponds.', img:'../uploads/westcrays.png' },
];

// Uniform per-kilogram price for all crayfish.
const PRICE_PER_KG = 2500;
// Extra prep fee (per kg) applied when a guest wants the crayfish cooked.
const COOKED_SURCHARGE_PER_KG = 50;
const MIN_KG  = 0.5;
const KG_STEP = 0.5;

// Cooking styles available once a guest picks "Cooked".
const dishOptions = [
  { value:'buttered',  label:'Buttered Garlic' },
  { value:'chili',     label:'Chili Garlic' },
  { value:'saltedegg', label:'Salted Egg' },
  { value:'sinigang',  label:'Sinigang (Sour Broth)' },
  { value:'grilled',   label:'Grilled' },
  { value:'steamed',   label:'Steamed' },
];

// cart keys look like "1|live" or "1|cooked|buttered" so the same crayfish can
// appear multiple times in the cart under different preparations.
let cart = {};       // key -> kg (number)
let cardState = {};  // id -> { prep:'live'|'cooked', dish:'buttered', kg:1 }

// ── Edit modal state ──
let editingKey    = null; // the cart key currently being edited, e.g. "3|live"
let editingId     = null;
let editingPrep   = 'live';
let editingDish   = 'buttered';
let editingKg     = 1;

// ── Delete modal state ──
let pendingDeleteKey     = null;
let deleteCalledFromEdit = false;

// ── Helpers ──
function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}
function roundKg(kg) { return Math.round(kg * 100) / 100; }
function fmtKg(kg) {
  const r = roundKg(kg);
  return (Number.isInteger(r) ? r.toString() : r.toFixed(2).replace(/0$/,'').replace(/\.$/,''));
}
function dishLabel(value) {
  const d = dishOptions.find(x => x.value === value);
  return d ? d.label : '';
}
function unitPricePerKg(prep) {
  return PRICE_PER_KG + (prep === 'cooked' ? COOKED_SURCHARGE_PER_KG : 0);
}
function priceFor(prep, kg) {
  return Math.round(unitPricePerKg(prep) * kg);
}
function makeKey(id, prep, dish) {
  return prep === 'cooked' ? `${id}|cooked|${dish}` : `${id}|live`;
}
function parseKey(key) {
  const parts = key.split('|');
  return { id: parseInt(parts[0]), prep: parts[1], dish: parts[2] || null };
}

function createPlaceholder() {
  const div = document.createElement('div');
  div.className = 'img-placeholder';
  div.innerHTML = `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 36 L16 22 L24 30 L30 22 L42 36 Z" fill="#c8c2b5"/>
      <circle cx="34" cy="16" r="6" fill="#c8c2b5"/>
    </svg>
    <span>crayfish</span>`;
  return div;
}

// ── Render product cards ──
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  products.forEach(p => {
    if (!cardState[p.id]) cardState[p.id] = { prep: 'live', dish: 'buttered', kg: 1 };
    const state = cardState[p.id];

    const card = document.createElement('div');
    card.className = 'card';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'card-img';

    if (p.img) {
      const img = document.createElement('img');
      img.src = p.img;
      img.alt = p.name;
      img.onerror = function () { this.remove(); imgDiv.appendChild(createPlaceholder()); };
      imgDiv.appendChild(img);
    } else {
      imgDiv.appendChild(createPlaceholder());
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    const unitPrice  = unitPricePerKg(state.prep);
    const totalPrice = priceFor(state.prep, state.kg);

    body.innerHTML = `
      <div class="card-name">${escapeHtml(p.name)}</div>
      <div class="card-desc">${escapeHtml(p.desc)}</div>
      <div class="card-prep" data-id="${p.id}">
        <button type="button" class="${state.prep === 'live' ? 'active' : ''}" data-prep="live"><i class="fas fa-water"></i> Live</button>
        <button type="button" class="${state.prep === 'cooked' ? 'active' : ''}" data-prep="cooked"><i class="fas fa-fire"></i> Cooked <span class="prep-fee">+&#8369;${COOKED_SURCHARGE_PER_KG}/kg</span></button>
      </div>
      ${state.prep === 'cooked' ? `
      <div class="card-dish" data-id="${p.id}">
        <label>Cooking style</label>
        <select class="dish-select">
          ${dishOptions.map(d => `<option value="${d.value}" ${d.value === state.dish ? 'selected' : ''}>${escapeHtml(d.label)}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="card-kg" data-id="${p.id}">
        <label>Kilograms</label>
        <div class="kg-ctrl">
          <button type="button" class="kg-btn kg-minus" aria-label="Decrease">&minus;</button>
          <span class="kg-num">${fmtKg(state.kg)} kg</span>
          <button type="button" class="kg-btn kg-plus" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-price-block">
          <span class="card-price">&#8369;${totalPrice.toLocaleString()}</span>
          <span class="card-price-sub">&#8369;${unitPrice.toLocaleString()}/kg</span>
        </div>
        <button class="add-btn" data-id="${p.id}">+ Add</button>
      </div>`;

    card.appendChild(imgDiv);
    card.appendChild(body);
    grid.appendChild(card);
  });

  // Live/Cooked toggle on each card
  document.querySelectorAll('.card-prep').forEach(wrap => {
    const id = parseInt(wrap.dataset.id);
    wrap.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        cardState[id].prep = btn.dataset.prep;
        renderProducts();
      });
    });
  });

  // Cooking-style dropdown on each card
  document.querySelectorAll('.card-dish').forEach(wrap => {
    const id = parseInt(wrap.dataset.id);
    const select = wrap.querySelector('.dish-select');
    select.addEventListener('change', () => {
      cardState[id].dish = select.value;
      renderProducts();
    });
  });

  // Kilogram +/- controls on each card
  document.querySelectorAll('.card-kg').forEach(wrap => {
    const id = parseInt(wrap.dataset.id);
    wrap.querySelector('.kg-minus').addEventListener('click', () => {
      cardState[id].kg = Math.max(MIN_KG, roundKg(cardState[id].kg - KG_STEP));
      renderProducts();
    });
    wrap.querySelector('.kg-plus').addEventListener('click', () => {
      cardState[id].kg = roundKg(cardState[id].kg + KG_STEP);
      renderProducts();
    });
  });

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const state = cardState[id];
      addToCart(id, state.prep, state.dish, state.kg);
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = '+ Add'; btn.classList.remove('added'); }, 800);
    });
  });
}

// ── Cart ──
function addToCart(id, prep, dish, kg) {
  const key = makeKey(id, prep, dish);
  cart[key] = roundKg((cart[key] || 0) + kg);
  renderCart();
}

function renderCart() {
  const keys      = Object.keys(cart);
  const emptyEl   = document.getElementById('cartEmpty');
  const itemsEl   = document.getElementById('cartItems');
  const totalDiv  = document.getElementById('cartTotal');
  const totalSpan = document.getElementById('totalAmt');
  const checkBtn  = document.getElementById('checkoutBtn');

  if (!keys.length) {
    if (emptyEl)  emptyEl.style.display  = 'block';
    if (itemsEl)  itemsEl.innerHTML      = '';
    if (totalDiv) totalDiv.style.display = 'none';
    if (checkBtn) checkBtn.disabled      = true;
    return;
  }

  if (emptyEl)  emptyEl.style.display  = 'none';
  if (totalDiv) totalDiv.style.display = 'flex';
  if (checkBtn) checkBtn.disabled      = false;

  let total = 0;

  if (itemsEl) {
    itemsEl.innerHTML = keys.map(key => {
      const { id, prep, dish } = parseKey(key);
      const p  = products.find(x => x.id === id);
      const kg = cart[key];
      if (!p) return '';
      const lineTotal = priceFor(prep, kg);
      total += lineTotal;
      const prepLabel = prep === 'live' ? 'Live' : `Cooked · ${dishLabel(dish)}`;
      return `
        <div class="cart-item" id="cart-item-${key.replace(/\|/g,'-')}">
          <div class="cart-thumb"><span class="thumb-icon">🦞</span></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(p.name)}<span class="cart-item-prep ${prep}">${prepLabel}</span></div>
            <div class="cart-item-price">${fmtKg(kg)} kg &nbsp;·&nbsp; &#8369;${unitPricePerKg(prep).toLocaleString()}/kg</div>
          </div>
          <div class="cart-item-total">&#8369;${lineTotal.toLocaleString()}</div>
          <div class="cart-actions">
            <button class="edit-btn"   onclick="openModal('${key}')">✏️ Edit</button>
            <button class="delete-btn" onclick="openDeleteModal('${key}', false)">🗑️ Delete</button>
          </div>
        </div>`;
    }).join('');
  }

  if (totalSpan) totalSpan.textContent = '₱' + total.toLocaleString();
}

// ── Delete Confirmation Modal ──
function openDeleteModal(key, fromEdit) {
  const { id, prep, dish } = parseKey(key);
  const p = products.find(x => x.id === id);
  if (!p) return;

  pendingDeleteKey     = key;
  deleteCalledFromEdit = fromEdit;

  const label = prep === 'live' ? 'Live' : `Cooked, ${dishLabel(dish)}`;
  document.getElementById('deleteItemName').textContent = `${p.name} (${label})`;
  document.getElementById('deleteBackdrop').classList.add('open');
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteBackdrop').classList.remove('open');
  document.getElementById('deleteModal').classList.remove('open');
  pendingDeleteKey      = null;
  deleteCalledFromEdit = false;
}

function confirmDelete() {
  if (pendingDeleteKey === null) return;
  delete cart[pendingDeleteKey];
  closeDeleteModal();
  if (deleteCalledFromEdit) closeModal();
  renderCart();
}

// ── Edit Modal ──
function openModal(key) {
  const { id, prep, dish } = parseKey(key);
  const p = products.find(x => x.id === id);
  if (!p) return;

  editingKey    = key;
  editingId     = id;
  editingPrep   = prep;
  editingDish   = dish || 'buttered';
  editingKg     = cart[key] || MIN_KG;

  refreshEditModalContent(p);
  updatePrepButtons();
  renderDishSelect();

  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('editModal').classList.add('open');
}

function refreshEditModalContent(p) {
  document.getElementById('editProductName').textContent  = p.name;
  document.getElementById('editProductPrice').textContent =
    `₱${PRICE_PER_KG.toLocaleString()}/kg (live) · +₱${COOKED_SURCHARGE_PER_KG}/kg cooked`;

  const thumbEl = document.getElementById('editThumb');
  if (p.img) {
    thumbEl.innerHTML = `<img src="${p.img}" alt="${escapeHtml(p.name)}" onerror="this.parentElement.textContent='🦞'">`;
  } else {
    thumbEl.textContent = '🦞';
  }

  updateModalQty();
}

function setEditPrep(prep) {
  editingPrep = prep;
  updatePrepButtons();
  renderDishSelect();
  updateModalQty();
}

function updatePrepButtons() {
  document.querySelectorAll('#editPrepToggle .prep-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.prep === editingPrep);
  });
}

// Shows/hides the cooking-style dropdown in the edit modal depending on prep.
function renderDishSelect() {
  const existing = document.getElementById('editDishSection');
  if (existing) existing.remove();
  if (editingPrep !== 'cooked') return;

  const prepSection = document.querySelector('.edit-prep-section');
  if (!prepSection) return;

  const section = document.createElement('div');
  section.id = 'editDishSection';
  section.className = 'edit-dish-section';
  section.innerHTML = `
    <label class="edit-qty-label">Cooking style</label>
    <select class="edit-dish-select" id="editDishSelect">
      ${dishOptions.map(d => `<option value="${d.value}" ${d.value === editingDish ? 'selected' : ''}>${escapeHtml(d.label)}</option>`).join('')}
    </select>`;
  prepSection.after(section);

  document.getElementById('editDishSelect').addEventListener('change', (e) => {
    editingDish = e.target.value;
    updateModalQty();
  });
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.getElementById('editModal').classList.remove('open');
  const dishSection = document.getElementById('editDishSection');
  if (dishSection) dishSection.remove();
  editingKey    = null;
  editingId     = null;
  editingPrep   = 'live';
  editingDish   = 'buttered';
  editingKg     = 1;
}

function adjustEditKg(delta) {
  editingKg = Math.max(MIN_KG, roundKg(editingKg + delta));
  updateModalQty();
}

function updateModalQty() {
  document.getElementById('editQtyNum').textContent   = fmtKg(editingKg) + ' kg';
  document.getElementById('editSubtotal').textContent = '₱' + priceFor(editingPrep, editingKg).toLocaleString();
}

function saveEdit() {
  if (editingId === null || editingKey === null) return;

  const targetKey = makeKey(editingId, editingPrep, editingDish);

  // Remove the original cart entry first
  delete cart[editingKey];
  // Then add/merge into the (possibly new) key
  cart[targetKey] = roundKg((cart[targetKey] || 0) + editingKg);

  renderCart();
  closeModal();
}

function openDeleteFromEdit() {
  openDeleteModal(editingKey, true);
}

// ── Place Order ──
function placeOrder() {
  const name  = document.getElementById('guestName')?.value.trim()  || '';
  const phone = document.getElementById('guestPhone')?.value.trim() || '';
  const time  = document.getElementById('guestTime')?.value         || '';

  if (!name || !phone || !time) {
    alert('Please fill in your name, contact number, and preferred delivery time.');
    return;
  }

  const orderItems = Object.keys(cart).map(key => {
    const { id, prep, dish } = parseKey(key);
    const p = products.find(x => x.id === id);
    if (!p) return '';
    const label = prep === 'live' ? 'Live' : `Cooked, ${dishLabel(dish)}`;
    return `${p.name} (${label}) — ${fmtKg(cart[key])}kg`;
  }).filter(Boolean).join(', ');

  const successMsg = document.getElementById('successMsg');
  if (successMsg) {
    successMsg.innerHTML = `Thank you, ${escapeHtml(name)}! Your order (${escapeHtml(orderItems)}) will be delivered around your chosen time. We'll text you at ${escapeHtml(phone)}.`;
  }

  const box = document.getElementById('successBox');
  if (box) { box.style.display = 'block'; box.scrollIntoView({ behavior: 'smooth' }); }

  cart = {};
  renderCart();
  ['guestName','guestPhone','guestNotes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const sel = document.getElementById('guestTime'); if (sel) sel.value = '';

  setTimeout(() => { if (box) box.style.display = 'none'; }, 5000);
}

// ── Nav dropdown + scroll shadow (site-standard) ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  const link = item.querySelector('a');
  if (link) {
    link.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const isOpen = item.classList.contains('open');
      navItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});
document.addEventListener('click', () => navItems.forEach(i => i.classList.remove('open')));

// ── Expose globals for inline onclick ──
window.openModal          = openModal;
window.closeModal         = closeModal;
window.adjustEditKg       = adjustEditKg;
window.setEditPrep        = setEditPrep;
window.saveEdit           = saveEdit;
window.openDeleteModal    = openDeleteModal;
window.closeDeleteModal   = closeDeleteModal;
window.confirmDelete      = confirmDelete;
window.openDeleteFromEdit = openDeleteFromEdit;
window.placeOrder         = placeOrder;

// ── Init ──
renderProducts();
renderCart();