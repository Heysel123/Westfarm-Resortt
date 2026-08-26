/* ============================================================
   My Bookings — shared across home.html + accommodations.html
   Stores each booking request in localStorage so the guest can
   come back and see what they booked, and whether it's paid.
   ============================================================ */

const WF_BOOKINGS_KEY = "wf_bookings";

function wfGetBookings() {
  try {
    const raw = localStorage.getItem(WF_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Could not read bookings:", e);
    return [];
  }
}

function wfSaveBookings(list) {
  try {
    localStorage.setItem(WF_BOOKINGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Could not save bookings:", e);
  }
}

// Called from accommodations.js whenever a booking request is sent.
function wfAddBooking(booking) {
  const list = wfGetBookings();
  list.unshift({
    id: "bk-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    status: "Pending Payment",
    bookedAt: new Date().toISOString(),
    ...booking,
  });
  wfSaveBookings(list);
  wfUpdateBadge();
  return list[0];
}

function wfSetStatus(id, status) {
  const list = wfGetBookings();
  const b = list.find(x => x.id === id);
  if (b) b.status = status;
  wfSaveBookings(list);
  wfRenderBookings();
  wfUpdateBadge();
}

function wfCancelBooking(id) {
  const list = wfGetBookings().filter(x => x.id !== id);
  wfSaveBookings(list);
  wfRenderBookings();
  wfUpdateBadge();
}

function wfFmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function wfUpdateBadge() {
  const count = wfGetBookings().length;
  document.querySelectorAll(".my-bookings-badge").forEach(b => {
    b.textContent = count;
    b.hidden = count === 0;
  });
}

function wfRenderBookings() {
  const list = wfGetBookings();
  const el = document.getElementById("myBookingsList");
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="mb-empty">
        <div class="mb-empty-icon">🌿</div>
        <p>You haven't booked a stay with us yet.</p>
        <a href="${location.pathname.includes('accommodations.html') ? '#bookingWidget' : 'accommodations.html#bookingWidget'}" class="mb-empty-btn" id="mbEmptyCta">Browse Accommodations</a>
      </div>`;
    const cta = document.getElementById("mbEmptyCta");
    if (cta) cta.addEventListener("click", () => wfCloseModal());
    return;
  }

  el.innerHTML = list.map(b => `
    <article class="mb-card">
      <div class="mb-card-top">
        <div>
          <span class="mb-name">${b.name}</span>
          <span class="mb-type">${b.type || ""}</span>
        </div>
        <span class="mb-status ${b.status === 'Paid' ? 'paid' : 'pending'}">
          ${b.status === 'Paid' ? '✓ Paid' : 'Pending Payment'}
        </span>
      </div>
      <div class="mb-details">
        <div class="mb-detail"><i class="fa-regular fa-calendar"></i> ${wfFmtDate(b.checkIn)} → ${wfFmtDate(b.checkOut)}</div>
        <div class="mb-detail"><i class="fa-solid fa-moon"></i> ${b.nights} night${b.nights > 1 ? "s" : ""}</div>
        <div class="mb-detail"><i class="fa-solid fa-user-group"></i> ${b.guests} guest${b.guests !== 1 ? "s" : ""}</div>
      </div>
      <div class="mb-card-bottom">
        <span class="mb-total">PHP ${Number(b.total).toLocaleString()}</span>
        <div class="mb-actions">
          ${b.status !== 'Paid' ? `<button class="mb-pay-btn" data-pay="${b.id}">Pay Now</button>` : ""}
          <button class="mb-cancel-btn" data-cancel="${b.id}">${b.status === 'Paid' ? 'Remove' : 'Cancel'}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function wfOpenModal() {
  const overlay = document.getElementById("myBookingsOverlay");
  if (!overlay) return;
  wfRenderBookings();
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function wfCloseModal() {
  const overlay = document.getElementById("myBookingsOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  wfUpdateBadge();

  document.querySelectorAll("[data-open-my-bookings]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      wfOpenModal();
    });
  });

  const overlay = document.getElementById("myBookingsOverlay");
  if (overlay) {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) wfCloseModal();
    });
  }
  const closeBtn = document.getElementById("myBookingsClose");
  if (closeBtn) closeBtn.addEventListener("click", wfCloseModal);

  const list = document.getElementById("myBookingsList");
  if (list) {
    list.addEventListener("click", e => {
      const payBtn = e.target.closest("[data-pay]");
      const cancelBtn = e.target.closest("[data-cancel]");
      if (payBtn) wfSetStatus(payBtn.dataset.pay, "Paid");
      if (cancelBtn) wfCancelBooking(cancelBtn.dataset.cancel);
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") wfCloseModal();
  });
});