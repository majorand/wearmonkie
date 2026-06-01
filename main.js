// Product gallery image switcher
function setMainImg(btn, src) {
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// Product page color selector
function selectColor(btn, name) {
  document.querySelectorAll('.swatch--lg').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('selectedColor').textContent = name;
}

// Product page size selector
function selectSize(btn) {
  if (btn.disabled) return;
  document.querySelectorAll('.size-group .size-btn').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('selectedSize').textContent = btn.textContent.trim();
}

// Product page quantity
function changeQty(delta) {
  const el = document.getElementById('qty');
  if (!el) return;
  const val = Math.max(1, parseInt(el.textContent) + delta);
  el.textContent = val;
}

// Cart quantity buttons
function changeCartQty(btn, delta) {
  const display = btn.parentElement.querySelector('.qty-value');
  const newVal = Math.max(1, parseInt(display.textContent) + delta);
  display.textContent = newVal;
}

// Add to cart feedback
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn--add-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const original = this.textContent;
      this.textContent = 'Added!';
      this.style.background = '#1a1a1a';
      this.style.color = '#fff';
      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
        this.style.color = '';
      }, 1400);
    });
  });

  // Filter group toggles default open state
  document.querySelectorAll('.filter-group__toggle').forEach(btn => {
    btn.classList.add('open');
  });
});
