const ACCOMMODATIONS = [
  { id:"Private Villa", name:"Private Villa 1", type:"Private Villa", capacity:"6-8", price:7500,
    image:"../uploads/privatevilla-1.jpg",
    desc:"This two-story villa with a loft and balcony has three queen beds, a sofa bed, and a daybed. It includes a 55 smart TV, A/C, two private bathrooms, a private dip pool, a kitchen with utensils, a refrigerator, a 6-seater dining table, and free access to public resort amenities.",
    perNightText: "per night" },
  { id:"Glamping", name:"Glamping 1", type:"Glamping", capacity:"2", price:1800,
    image:"../uploads/glamping-1.jpg",
    desc:"A cozy hideaway good for 2 guests, with a double size bed and aircon for restful nights. Comes with a coffee table and chair, plus access to the public toilet and bath.",
    perNightText: "per night" },
  { id:"Private Villa", name:"Private Villa 2", type:"Private Villa", capacity:"6-8", price:7500,
    image:"../uploads/privatevilla-2.jpg",
    desc:"Your barkada's nature hideaway — private balcony, cozy private baths, and spacious loft beds.",
    perNightText: "per night" },
  { id:"Private Villa", name:"Private Villa 3", type:"Private Villa", capacity:"6-8", price:7500,
    image:"../uploads/privatevilla-3.jpg",
    desc:"Tucked further into the greenery, this villa offers the same spacious loft, private dip pool, and full kitchen — perfect for family reunions.",
    perNightText: "per night" },
  { id:"Private Villa", name:"Private Villa 4", type:"Private Villa", capacity:"6-8", price:7500,
    image:"../uploads/privatevilla-4.jpg",
    desc:"A quiet corner villa with balcony views of the farm, complete with private bath, dip pool, and dining area for the whole barkada.",
    perNightText: "per night" },
  { id:"Glamping", name:"Glamping 2", type:"Glamping", capacity:"2", price:1800,
    image:"../uploads/glamping-2.jpg",
    desc:"Sophistication meets nature. Living space downstairs and sweeping views from the upstairs balcony.",
    perNightText: "per night" },
  { id:"Glamping", name:"Glamping 3", type:"Glamping", capacity:"2", price:1800,
    image:"../uploads/glamping-3.jpg",
    desc:"Rustic elegance and contemporary comfort within a serene landscape. Comfortably accommodates 4-6 guests.",
    perNightText: "per night" },
  { id:"Glamping", name:"Glamping 4", type:"Glamping", capacity:"2", price:1800,
    image:"../uploads/glamping-4.jpg",
    desc:"Elegant retreat with private balcony, cozy living room, 5 comfy beds upstairs.",
    perNightText: "per night" },
  { id:"Pavilion", name:"Pavilion (Events Place)", type:"Events Place", capacity:"120-150", price:25000,
    image:"../uploads/pavilion-2.jpg",
    desc:"A soaring, glass-walled pavilion overlooking the lake — the resort's main venue for weddings, reunions, and large celebrations.",
    perNightText: "per day" },
];
// Stable unique key so a selection always points to one exact row.
ACCOMMODATIONS.forEach((a, i) => { a.uid = `acc-${i}`; });

const ICONS = { Glamping: "🏕️", "Private Villa": "🏡", "Events Place": "🏛️" };

// Type-level pricing/inclusion details shown in the "More Info" modal
// (sourced from the printed rate cards: Glamping, Private Villa, Pavilion).
const TYPE_INFO = {
  "Glamping": {
    additionalPax: 400,
    inclusions: [
      "Double size bed",
      "Aircon",
      "Coffee table and chair",
      "Public toilet and bath",
      "Free use of public resort amenities",
    ],
  },
  "Private Villa": {
    additionalPax: 500,
    inclusions: [
      "Two-story villa with loft and balcony",
      "Three queen size beds",
      "One sofa bed",
      "55\" smart TV",
      "Airconditioned room",
      "Two private toilet and bath",
      "Clothes rack",
      "Coffee table and chairs",
      "Private dip pool",
      "Private kitchen with cooking utensils",
      "Refrigerator",
      "One daybed",
      "6-seater dining table",
      "Free use of public resort and amenities",
    ],
  },
  "Events Place": {
    additionalPax: null,
    inclusions: [
      "4 hours use of venue for the actual event",
      "4 hours ingress and 2 hours egress (for supplier set-up)",
      "1 hour use of holding room with private bathroom prior to event",
      "Basic lights and sound",
      "Round tables and chairs",
      "Complimentary parking for guests",
    ],
  },
};

// Guarded: won't crash the whole script if the footer's #year element
// is missing or was replaced with static text.
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── NAV: scroll shadow (ported from home.html) ──
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ── NAV: dropdowns ──
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

// ---------- Calendar ----------
const today = new Date(); today.setHours(0,0,0,0);
let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
let checkIn = null, checkOut = null;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function fmt(d) { return d ? `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}` : "Select date"; }

function renderCalendar() {
  document.getElementById("calTitle").textContent = `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const firstDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
  let html = DOW.map(d => `<div class="dow">${d}</div>`).join("");
  for (let i=0; i<firstDay; i++) html += `<div></div>`;
  for (let d=1; d<=daysInMonth; d++) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
    const past = date < today;
    let cls = "day";
    if (past) cls += " disabled";
    if (checkIn && +date === +checkIn) cls += " selected";
    if (checkOut && +date === +checkOut) cls += " selected";
    if (checkIn && checkOut && date > checkIn && date < checkOut) cls += " in-range";
    html += `<div class="${cls}" data-day="${d}">${d}</div>`;
  }
  document.getElementById("cal").innerHTML = html;
}

document.getElementById("prevMonth").onclick = () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderCalendar(); };
document.getElementById("nextMonth").onclick = () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderCalendar(); };

document.getElementById("cal").addEventListener("click", e => {
  const cell = e.target.closest(".day");
  if (!cell || cell.classList.contains("disabled")) return;
  const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), parseInt(cell.dataset.day, 10));
  if (!checkIn || (checkIn && checkOut)) { checkIn = date; checkOut = null; }
  else if (date < checkIn) { checkOut = checkIn; checkIn = date; }
  else if (+date === +checkIn) { checkIn = null; checkOut = null; }
  else { checkOut = date; }
  updateBookingUI();
});

function updateBookingUI() {
  document.getElementById("checkIn").textContent = fmt(checkIn);
  document.getElementById("checkOut").textContent = fmt(checkOut);
  let nights = 0;
  if (checkIn && checkOut) nights = Math.round((checkOut - checkIn) / 86400000);
  const pill = document.getElementById("nightsPill");
  if (nights > 0) {
    document.getElementById("nightsNum").textContent = nights;
    pill.hidden = false;
  } else {
    pill.hidden = true;
  }
  renderCalendar();
}

// ---------- Guests popover ----------
const counts = { adults: 1, kids: 0 };
const guestsField = document.getElementById("guestsField");
const guestsPop = document.getElementById("guestsPop");

function updateGuestsLabel() {
  const total = counts.adults + counts.kids;
  document.getElementById("guestsLabel").textContent = `${total} Guest${total !== 1 ? "s" : ""}`;
}

guestsField.addEventListener("click", e => {
  if (e.target.closest(".ctrl button")) return;
  e.stopPropagation();
  guestsField.classList.toggle("open");
});
document.addEventListener("click", () => guestsField.classList.remove("open"));

guestsPop.querySelectorAll(".ctrl button").forEach(b => {
  b.addEventListener("click", e => {
    e.stopPropagation();
    const c = b.dataset.c, d = parseInt(b.dataset.d, 10);
    const min = c === "adults" ? 1 : 0;
    counts[c] = Math.max(min, counts[c] + d);
    document.getElementById(c).textContent = counts[c];
    updateGuestsLabel();
  });
});

// ---------- Browse / booking options list ----------
let optCategory = "All", optQuery = "", selectedOption = null, sortAsc = null;

function setOptionsCategory(cat) {
  optCategory = cat;
  document.querySelectorAll("#optionsTabs button[data-cat]").forEach(b =>
    b.classList.toggle("active", b.dataset.cat === cat)
  );
}

document.getElementById("optionsTabs").addEventListener("click", e => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  setOptionsCategory(btn.dataset.cat);
  renderOptions();
});

document.getElementById("optionsSearch").addEventListener("input", e => {
  optQuery = e.target.value;
  renderOptions();
});

document.getElementById("sortBtn").addEventListener("click", () => {
  sortAsc = sortAsc === null ? true : (sortAsc ? false : null);
  document.getElementById("sortBtn").classList.toggle("active", sortAsc !== null);
  renderOptions();
});

function renderOptions() {
  let list = ACCOMMODATIONS.filter(a =>
    (optCategory === "All" || a.type === optCategory) &&
    a.name.toLowerCase().includes(optQuery.toLowerCase())
  );
  if (sortAsc !== null) list = [...list].sort((a,b) => sortAsc ? a.price - b.price : b.price - a.price);

  const el = document.getElementById("optionsList");
  if (!list.length) {
    el.innerHTML = `<div class="empty-row">No accommodations match your search.</div>`;
    return;
  }
  el.innerHTML = list.map(a => `
    <article class="browse-card ${a.uid === selectedOption ? "selected" : ""}" data-uid="${a.uid}">
      <div class="bc-img">
        ${a.image ? `<img src="${a.image}" alt="${a.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span>📷</span></div>'" />` : `<div class="image-placeholder"><span>📷</span></div>`}
      </div>
      <div class="bc-body">
        <div class="bc-top">
          <span class="bc-name">${a.name}</span>
          <span class="bc-guests">👥 ${a.capacity} guests</span>
        </div>
        <button class="bc-more" data-more="${a.uid}">More Info →</button>
      </div>
      <div class="bc-side">
        <div class="bc-price"><span class="amt">PHP ${a.price.toLocaleString()}</span><span class="per">${a.perNightText}</span></div>
        <button class="bc-btn" data-select="${a.uid}">Check Availability</button>
      </div>
    </article>
  `).join("");
}

// Confirms a stay and records it in My Bookings (localStorage) so the guest
// can come back later and see what they booked / whether it's paid.
function confirmBooking(acc) {
  const nights = Math.round((checkOut - checkIn) / 86400000);
  const total = acc.price * Math.max(nights, 1);
  const guests = counts.adults + counts.kids;

  wfAddBooking({
    accId: acc.uid,
    name: acc.name,
    type: acc.type,
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    nights,
    guests,
    total,
  });

  toast(`✨ Booking request sent for ${acc.name} — ${nights} night${nights>1?"s":""} (PHP ${total.toLocaleString()}). Track it under "My Bookings".`, "success");
}

// ---------- "More Info" modal ----------
const infoOverlay = document.getElementById("infoOverlay");

function openInfoModal(uid) {
  const acc = ACCOMMODATIONS.find(a => a.uid === uid);
  if (!acc) return;
  const info = TYPE_INFO[acc.type] || { inclusions: [] };

  document.getElementById("infoTitle").textContent = acc.name;

  const imgEl = document.getElementById("infoImg");
  imgEl.innerHTML = acc.image
    ? `<img src="${acc.image}" alt="${acc.name}" onerror="this.parentElement.innerHTML=''" />`
    : "";

  document.getElementById("infoCapacity").textContent = `Good for ${acc.capacity} pax`;
  document.getElementById("infoPrice").textContent = `PHP ${acc.price.toLocaleString()} ${acc.perNightText}`;

  const addPaxRow = document.getElementById("infoAddPaxRow");
  if (info.additionalPax) {
    addPaxRow.hidden = false;
    document.getElementById("infoAddPaxAmt").textContent = `PHP ${info.additionalPax.toLocaleString()}`;
  } else {
    addPaxRow.hidden = true;
  }

  document.getElementById("infoInclusions").innerHTML =
    (info.inclusions || []).map(i => `<li>${i}</li>`).join("");

  infoOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeInfoModal() {
  infoOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("infoClose").addEventListener("click", closeInfoModal);
infoOverlay.addEventListener("click", e => {
  if (e.target === infoOverlay) closeInfoModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeInfoModal();
});

document.getElementById("optionsList").addEventListener("click", e => {
  const selectBtn = e.target.closest("button[data-select]");
  const moreBtn = e.target.closest("button[data-more]");
  if (!selectBtn && !moreBtn) return;

  if (moreBtn) {
    openInfoModal(moreBtn.dataset.more);
    return;
  }

  const uid = selectBtn.dataset.select;
  selectedOption = uid;
  renderOptions();

  const acc = ACCOMMODATIONS.find(a => a.uid === uid);
  if (!checkIn || !checkOut) {
    toast("Pick your check-in and check-out dates above", "error");
    document.querySelector(".cal-panel").scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    confirmBooking(acc);
  }
});

// ---------- Toast ----------
function toast(msg, type="success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove("show"), 3200);
}

// ---------- Top "Check Availability" CTA ----------
document.getElementById("bookBtn").addEventListener("click", () => {
  if (!checkIn || !checkOut) return toast("Please select check-in and check-out dates", "error");
  const acc = ACCOMMODATIONS.find(a => a.uid === selectedOption);
  const nights = Math.round((checkOut - checkIn) / 86400000);
  if (!acc) {
    toast(`Great — ${nights} night${nights>1?"s":""} selected. Pick a stay below to finish booking.`, "success");
    document.querySelector(".browse-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  confirmBooking(acc);
});

// ---------- Init ----------
// Honor a ?filter= param so links from the homepage (e.g. Explore Glamping)
// land straight on the right category, showing ONLY that category.
const params = new URLSearchParams(window.location.search);
const requestedFilter = params.get("filter");
const validFilters = ["All", "Glamping", "Private Villa", "Events Place"];
setOptionsCategory(validFilters.includes(requestedFilter) ? requestedFilter : "All");

updateGuestsLabel();
renderOptions();
renderCalendar();
updateBookingUI();