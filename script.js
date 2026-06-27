// script.js
// тут всі функції для сайту ресторану


// зберігаємо кошик в cookie на 7 днів
function saveCart(cart) {
  let d = new Date();
  d.setDate(d.getDate() + 7); // змінити кількість днів якщо треба
  document.cookie = "cart=" + encodeURIComponent(JSON.stringify(cart)) + "; expires=" + d.toUTCString() + "; path=/";
}

// читаємо кошик з cookie
function loadCart() {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.startsWith("cart=")) {
      return JSON.parse(decodeURIComponent(c.substring(5)));
    }
  }
  return [];
}

// очищуємо кошик
function clearCart() {
  document.cookie = "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

// оновлюємо число на кнопці кошика в хедері
function updateCartBadge() {
  let cart = loadCart();
  let total = 0;
  for (let i = 0; i < cart.length; i++) total += cart[i].quantity;
  let badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}


// завантажуємо страви з products.json
function loadProducts() {
  fetch("products.json")
    .then(r => r.json())
    .then(products => renderProducts(products));
}

// малюємо картки страв на сторінці каталогу
function renderProducts(products) {
  let box = document.getElementById("products-container");
  if (!box) return;
  box.innerHTML = "";
  for (let i = 0; i < products.length; i++) {
    let p = products[i];
    // змінити col-md-4 на col-md-6 якщо хочеш 2 картки в ряд
    box.innerHTML += `
      <div class="col-sm-6 col-md-4">
        <div class="card h-100 shadow-sm product-card">
          <img src="${p.image}" class="card-img-top product-img" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold">${p.name}</h5>
            <p class="text-muted small flex-grow-1">${p.description}</p>
            <small class="text-secondary mb-2">${p.grams} г · ${p.serving}</small>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold text-danger">${p.price} грн</span>
              <button class="btn btn-outline-danger btn-sm"
                onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">
                + До кошика
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
}


// додаємо страву в кошик, або збільшуємо кількість якщо вже є
function addToCart(id, name, price, image) {
  let cart = loadCart();
  let found = false;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) { cart[i].quantity++; found = true; break; }
  }
  if (!found) cart.push({ id, name, price, image, quantity: 1 });
  saveCart(cart);
  updateCartBadge();
  // змінити текст повідомлення якщо хочеш
  alert(name + " додано до кошика!");
}


// малюємо вміст кошика
function renderCart() {
  let cart = loadCart();
  let box = document.getElementById("cart-items");
  let totalEl = document.getElementById("total-price");
  if (!box) return;

  if (cart.length === 0) {
    box.innerHTML = `<div class="text-center py-5">
      <p class="fs-5">Кошик порожній</p>
      <a href="catalog.html" class="btn btn-danger">До меню</a>
    </div>`;
    if (totalEl) totalEl.textContent = "0 грн";
    return;
  }

  box.innerHTML = "";
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    let item = cart[i];
    let sum = item.price * item.quantity;
    total += sum;
    box.innerHTML += `
      <div class="cart-item d-flex align-items-center gap-3 mb-3 p-3 border rounded">
        <img src="${item.image}" class="cart-img">
        <div class="flex-grow-1">
          <div class="fw-bold">${item.name}</div>
          <small class="text-muted">${item.price} x ${item.quantity} = ${sum} грн</small>
        </div>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${item.id}, -1)">-</button>
        <span class="fw-bold">${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${item.id}, 1)">+</button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">x</button>
      </div>`;
  }
  if (totalEl) totalEl.textContent = total + " грн";
}

// змінюємо кількість страви
function changeQuantity(id, delta) {
  let cart = loadCart();
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].quantity += delta;
      if (cart[i].quantity <= 0) cart.splice(i, 1);
      break;
    }
  }
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

// видаляємо страву з кошика
function removeFromCart(id) {
  saveCart(loadCart().filter(item => item.id !== id));
  renderCart();
  updateCartBadge();
}


// натиснули кнопку "Замовити"
function placeOrder() {
  let name = document.getElementById("customer-name").value.trim();
  let phone = document.getElementById("customer-phone").value.trim();
  let cart = loadCart();
  if (cart.length === 0) { alert("Кошик порожній!"); return; }
  if (!name) { alert("Введи своє ім'я!"); return; }
  if (!phone) { alert("Введи номер телефону!"); return; }
  let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // змінити текст якщо хочеш інше повідомлення
  alert("Дякуємо, " + name + "! Замовлення на " + total + " грн прийнято. Чекай дзвінка на " + phone + " :)");
  clearCart();
  window.location.href = "index.html";
}