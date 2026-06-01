/* WearMonkie — Theme JS */

// ── Gallery image switcher ──────────────────────────────────────────────────
document.querySelectorAll('.thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const src = thumb.dataset.src;
    const mainImg = document.getElementById('mainImg');
    if (mainImg && src) {
      mainImg.src = src;
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    }
  });
});

// ── Variant selector (size/color buttons) ──────────────────────────────────
document.querySelectorAll('[data-option-value]').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.size-group, .swatch-group');
    if (!group) return;
    group.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    const labelId = 'selected-' + btn.closest('.product-option').querySelector('.product-option__label strong')?.parentElement?.textContent.trim().split(':')[0].toLowerCase().replace(/\s+/g, '-');
    const labelEl = document.getElementById(labelId);
    if (labelEl) labelEl.textContent = btn.dataset.optionValue;

    updateSelectedVariant();
  });
});

function updateSelectedVariant() {
  const form = document.getElementById('product-form');
  if (!form) return;
  // Collect all selected option values
  const options = [];
  document.querySelectorAll('.product-option').forEach(opt => {
    const active = opt.querySelector('[data-option-value].active, [data-option-value][aria-pressed="true"]');
    if (active) options.push(active.dataset.optionValue);
  });
  // Find matching variant via ShopifyAnalytics or theme's product JSON
  const variantInput = document.getElementById('variant-id');
  if (window.__productVariants && variantInput) {
    const match = window.__productVariants.find(v =>
      v.options.every((o, i) => o === options[i])
    );
    if (match) {
      variantInput.value = match.id;
      // Update price display
      const priceEls = document.querySelectorAll('.price--lg');
      priceEls.forEach(el => {
        el.textContent = formatMoney(match.price);
      });
      // Update add to cart button availability
      const addBtn = form.querySelector('[name="add"]');
      if (addBtn) {
        addBtn.disabled = !match.available;
        addBtn.textContent = match.available ? 'Add to Cart' : 'Sold Out';
      }
    }
  }
}

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

// ── Add-to-cart feedback ────────────────────────────────────────────────────
document.querySelectorAll('.product-card__form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn--add-cart');
    const originalText = btn.textContent;
    btn.disabled = true;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          id: form.querySelector('[name="id"]').value,
          quantity: parseInt(form.querySelector('[name="quantity"]')?.value || '1')
        })
      });

      if (!response.ok) throw new Error('Add to cart failed');

      btn.textContent = 'Added!';
      btn.style.background = '#1a1a1a';
      btn.style.color = '#fff';
      updateCartCount();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 1400);
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 2000);
    }
  });
});

// ── Cart count badge ────────────────────────────────────────────────────────
async function updateCartCount() {
  try {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = cart.item_count;
      badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
    }
  } catch { /* ignore */ }
}

// ── Cart page: remove item ──────────────────────────────────────────────────
async function removeCartItem(line) {
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity: 0 })
    });
    location.reload();
  } catch { location.reload(); }
}

// ── Cart page: update quantity ──────────────────────────────────────────────
async function updateCartQty(line, quantity) {
  if (quantity < 1) { removeCartItem(line); return; }
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity })
    });
    location.reload();
  } catch { location.reload(); }
}

// ── Filter group toggles ────────────────────────────────────────────────────
document.querySelectorAll('.filter-group__toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) panel.style.display = expanded ? 'none' : '';
  });
});

// ── Filter form auto-submit on change ──────────────────────────────────────
document.querySelectorAll('.filter-option input').forEach(input => {
  input.addEventListener('change', () => {
    const url = new URL(window.location.href);
    const checked = [...document.querySelectorAll('.filter-option input:checked')].map(i => ({
      name: i.name, value: i.value
    }));
    // Clear existing filter params and rebuild
    [...url.searchParams.keys()].filter(k => k.startsWith('filter.')).forEach(k => url.searchParams.delete(k));
    checked.forEach(({ name, value }) => url.searchParams.append(name, value));
    window.location = url.toString();
  });
});

// ── Newsletter success message ──────────────────────────────────────────────
const successMsg = document.querySelector('.newsletter__success');
if (successMsg) {
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
