
"use strict";

/*
 * NOIR E-COMMERCE FRONT-END DEMO
 * Storage: browser localStorage.
 *
 * NOT PRODUCTION SECURITY:
 * Real authentication, permissions, stock reservations, payment verification,
 * email notifications and multi-device synchronization must run on a server.
 */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE = {
  products: "noir_products_v1",
  cart: "noir_cart_v1",
  orders: "noir_orders_v1",
  messages: "noir_messages_v1",
  customers: "noir_customers_v1",
  settings: "noir_settings_v1",
  reviews: "noir_reviews_v1",
  newsletter: "noir_newsletter_v1"
};

const IMAGE = {
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
  bag: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
  speaker: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  bottle: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80",
  wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80"
};

const DEFAULT_PRODUCTS = [
  {
    id: "NR-1001", name: "Studio Wireless Headphones",
    category: "Electronics", price: 12500, discountPrice: 9990,
    stock: 12, featured: true, createdAt: "2026-10-20",
    image: IMAGE.headphones, images: [IMAGE.headphones],
    description: "A stylish everyday audio companion with a clean, minimal design. Check manufacturer specifications before purchasing.",
    specifications: ["Category: Audio", "Finish: Black", "Warranty: Confirm with supplier"]
  },
  {
    id: "NR-1002", name: "Classic Minimal Watch",
    category: "Accessories", price: 8500, discountPrice: 0,
    stock: 8, featured: true, createdAt: "2026-10-22",
    image: IMAGE.watch, images: [IMAGE.watch],
    description: "A versatile minimalist watch designed to complement casual and smart outfits.",
    specifications: ["Style: Minimal", "Colour: As pictured", "Warranty: Confirm with supplier"]
  },
  {
    id: "NR-1003", name: "Everyday Carry Bag",
    category: "Fashion", price: 6900, discountPrice: 5990,
    stock: 15, featured: true, createdAt: "2026-10-23",
    image: IMAGE.bag, images: [IMAGE.bag],
    description: "A contemporary bag for everyday essentials. Verify dimensions and materials with your supplier.",
    specifications: ["Style: Everyday", "Colour: As pictured", "Material: Confirm with supplier"]
  },
  {
    id: "NR-1004", name: "Ambient Table Lamp",
    category: "Home", price: 7800, discountPrice: 0,
    stock: 5, featured: false, createdAt: "2026-10-25",
    image: IMAGE.lamp, images: [IMAGE.lamp],
    description: "A modern decorative lamp to complement a desk, bedroom or living space.",
    specifications: ["Category: Lighting", "Bulb compatibility: Verify before sale"]
  },
  {
    id: "NR-1005", name: "Portable Bluetooth Speaker",
    category: "Electronics", price: 9500, discountPrice: 8490,
    stock: 2, featured: true, createdAt: "2026-10-27",
    image: IMAGE.speaker, images: [IMAGE.speaker],
    description: "A compact speaker for listening at home or on the go. Actual battery life and water resistance depend on the selected model.",
    specifications: ["Category: Audio", "Connectivity: Confirm with supplier"]
  },
  {
    id: "NR-1006", name: "Urban Everyday Sneakers",
    category: "Fashion", price: 11000, discountPrice: 0,
    stock: 9, featured: false, createdAt: "2026-10-28",
    image: IMAGE.shoes, images: [IMAGE.shoes],
    description: "A casual footwear style for everyday outfits. Add the actual sizes and materials supplied with your product.",
    specifications: ["Style: Casual", "Sizes: Configure with actual inventory"]
  },
  {
    id: "NR-1007", name: "Reusable Travel Bottle",
    category: "Home", price: 2400, discountPrice: 1990,
    stock: 20, featured: false, createdAt: "2026-10-29",
    image: IMAGE.bottle, images: [IMAGE.bottle],
    description: "A reusable bottle for daily routines and travel. Confirm its capacity and materials before publishing.",
    specifications: ["Category: Drinkware", "Capacity: Confirm with supplier"]
  },
  {
    id: "NR-1008", name: "Classic Everyday Wallet",
    category: "Accessories", price: 3500, discountPrice: 0,
    stock: 0, featured: false, createdAt: "2026-10-30",
    image: IMAGE.wallet, images: [IMAGE.wallet],
    description: "A compact wallet with a timeless everyday style.",
    specifications: ["Category: Accessories", "Material: Confirm with supplier"]
  }
];

const DEFAULT_SETTINGS = {
  storeName: "NOIR",
  deliveryFee: 350,
  freeDeliveryThreshold: 10000,
  whatsapp: ""
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? structuredCloneSafe(fallback) : JSON.parse(value);
  } catch (error) {
    console.warn("Could not read local data:", key, error);
    return structuredCloneSafe(fallback);
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save local data:", error);
    showToast("Could not save data. Browser storage may be full.");
    return false;
  }
}

let products = readStorage(STORAGE.products, DEFAULT_PRODUCTS);
let cart = readStorage(STORAGE.cart, []);
let orders = readStorage(STORAGE.orders, []);
let messages = readStorage(STORAGE.messages, []);
let customers = readStorage(STORAGE.customers, []);
let settings = readStorage(STORAGE.settings, DEFAULT_SETTINGS);
let reviews = readStorage(STORAGE.reviews, []);
let newsletterEmails = readStorage(STORAGE.newsletter, []);

let activeProductId = null;
let activeGalleryImages = [];
let toastTimeout = null;

function money(amount) {
  return "LKR " + Math.round(Number(amount) || 0).toLocaleString("en-LK");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[character]);
}

function safeImage(url, fallback = IMAGE.watch) {
  try {
    const parsed = new URL(url, location.href);
    if (parsed.protocol === "https:" || parsed.origin === location.origin) {
      return parsed.href;
    }
  } catch (_) {}
  return fallback;
}

function productPrice(product) {
  const discounted = Number(product.discountPrice);
  return discounted > 0 && discounted < Number(product.price)
    ? discounted : Number(product.price);
}

function categoryLabel(category) {
  return category === "Home" ? "Home & Living" : category;
}

function getProduct(id) {
  return products.find(product => product.id === id);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function createId(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase() +
    "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function persistProducts() { saveStorage(STORAGE.products, products); }
function persistCart() { saveStorage(STORAGE.cart, cart); }
function persistOrders() { saveStorage(STORAGE.orders, orders); }
function persistMessages() { saveStorage(STORAGE.messages, messages); }
function persistCustomers() { saveStorage(STORAGE.customers, customers); }
function persistSettings() { saveStorage(STORAGE.settings, settings); }
function persistReviews() { saveStorage(STORAGE.reviews, reviews); }

function getCartLines() {
  return cart.map(line => {
    const product = getProduct(line.id);
    if (!product) return null;
    return {
      product,
      quantity: Math.max(0, Number(line.quantity) || 0),
      unitPrice: productPrice(product)
    };
  }).filter(line => line && line.quantity > 0);
}

function cartQuantity() {
  return cart.reduce((sum, line) => sum + Math.max(0, Number(line.quantity) || 0), 0);
}

function cartSubtotal() {
  return getCartLines().reduce((sum, line) =>
    sum + line.unitPrice * line.quantity, 0);
}

function deliveryFor(subtotal) {
  if (subtotal <= 0) return 0;
  if (Number(settings.freeDeliveryThreshold) > 0 &&
      subtotal >= Number(settings.freeDeliveryThreshold)) return 0;
  return Math.max(0, Number(settings.deliveryFee) || 0);
}

function cartTotal() {
  return cartSubtotal() + deliveryFor(cartSubtotal());
}

function syncCartWithStock() {
  cart = cart.map(line => {
    const product = getProduct(line.id);
    if (!product || product.stock <= 0) return null;
    return {
      id: line.id,
      quantity: Math.min(
        Math.max(1, Number(line.quantity) || 1),
        Number(product.stock)
      )
    };
  }).filter(Boolean);
  persistCart();
}

// ---------- Product catalog ----------

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const search = ($("#productSearch").value || "").trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const sort = $("#sortProducts").value;

  let filtered = products.filter(product => {
    const matchesCategory = category === "All" || product.category === category;
    const searchable = [
      product.name, product.id, product.category,
      product.description, ...(product.specifications || [])
    ].join(" ").toLowerCase();
    return matchesCategory && searchable.includes(search);
  });

  if (sort === "price-low") filtered.sort((a, b) => productPrice(a) - productPrice(b));
  if (sort === "price-high") filtered.sort((a, b) => productPrice(b) - productPrice(a));
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "newest") filtered.sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  $("#productTotal").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
  $("#emptyProducts").hidden = filtered.length !== 0;

  grid.innerHTML = filtered.map(product => {
    const sold = Number(product.stock) <= 0;
    const discounted = Number(product.discountPrice) > 0 &&
      Number(product.discountPrice) < Number(product.price);
    const stockClass = sold ? "stock-sold" :
      product.stock <= 3 ? "stock-low" : "stock-available";
    const stockText = sold ? "SOLD OUT" :
      product.stock <= 3 ? `Only ${product.stock} left` : "AVAILABLE";

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${escapeHTML(safeImage(product.image))}"
               alt="${escapeHTML(product.name)}" loading="lazy">
          ${sold
            ? '<span class="product-badge sold">SOLD OUT</span>'
            : discounted ? '<span class="product-badge">SPECIAL OFFER</span>' : ""}
          <button class="quick-view" data-view-product="${escapeHTML(product.id)}">
            Quick view ↗
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(categoryLabel(product.category))}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <div class="product-price">
            <strong>${money(productPrice(product))}</strong>
            ${discounted ? `<span class="old-price">${money(product.price)}</span>` : ""}
          </div>
          <div class="stock-line">
            <span class="${stockClass}">${stockText}</span>
            ${!sold ? `<span class="muted">${Number(product.stock)} in stock</span>` : ""}
          </div>
          <button class="product-add" data-add-product="${escapeHTML(product.id)}"
            ${sold ? "disabled" : ""}>
            ${sold ? "Currently unavailable" : "Add to bag +"}
          </button>
        </div>
      </article>`;
  }).join("");

  updateCartBadge();
}

function setCategory(category) {
  $("#categoryFilter").value = category;
  $("#productSearch").value = "";
  renderProducts();
  $("#products").scrollIntoView({ behavior: "smooth" });
}

function openProductDetails(id) {
  const product = getProduct(id);
  if (!product) return;

  activeProductId = id;
  activeGalleryImages = [...new Set([
    safeImage(product.image),
    ...(product.images || []).map(image => safeImage(image))
  ])];

  $("#productDetails").innerHTML = `
    <div class="product-detail-layout">
      <div>
        <img class="product-detail-image" id="detailImage"
          src="${escapeHTML(activeGalleryImages[0])}"
          alt="${escapeHTML(product.name)}">
        <div class="product-gallery">
          ${activeGalleryImages.map((image, index) => `
            <button type="button" data-gallery-index="${index}"
              aria-label="View product image ${index + 1}">
              <img src="${escapeHTML(image)}" alt="">
            </button>`).join("")}
        </div>
      </div>
      <div class="product-detail-copy">
        <div class="eyebrow">${escapeHTML(categoryLabel(product.category))}</div>
        <h2 id="detailName">${escapeHTML(product.name)}</h2>
        <p class="muted">Product ID: ${escapeHTML(product.id)}</p>
        <div class="product-price">
          <strong>${money(productPrice(product))}</strong>
          ${productPrice(product) < Number(product.price)
            ? `<span class="old-price">${money(product.price)}</span>` : ""}
        </div>
        <p>${escapeHTML(product.description)}</p>
        <h3>Specifications</h3>
        <ul class="spec-list">
          ${(product.specifications || []).map(item =>
            `<li>${escapeHTML(item)}</li>`).join("")}
        </ul>
        <p class="${product.stock <= 0 ? "stock-sold" : "stock-available"}">
          ${product.stock <= 0 ? "SOLD OUT" : `AVAILABLE · ${product.stock} in stock`}
        </p>
        <button class="button button-primary full-width" data-detail-add="${escapeHTML(id)}"
          ${product.stock <= 0 ? "disabled" : ""}>
          ${product.stock <= 0 ? "Currently unavailable" : "Add to bag"}
        </button>
        <button class="button button-secondary full-width" style="margin-top:9px"
          data-detail-buy="${escapeHTML(id)}" ${product.stock <= 0 ? "disabled" : ""}>
          Buy now ↗
        </button>
      </div>
    </div>`;

  openModal("productModal");
}

// ---------- Shopping cart ----------

function addToCart(id, quantity = 1) {
  const product = getProduct(id);
  quantity = Math.floor(Number(quantity));

  if (!product || !Number.isFinite(quantity) || quantity < 1) {
    showToast("Invalid product or quantity.");
    return false;
  }

  const existing = cart.find(line => line.id === id);
  const current = existing ? Number(existing.quantity) : 0;

  if (product.stock <= 0) {
    showToast("This product is sold out.");
    return false;
  }

  if (current + quantity > product.stock) {
    showToast(`Only ${product.stock} item(s) are available.`);
    return false;
  }

  if (existing) existing.quantity += quantity;
  else cart.push({ id, quantity });

  persistCart();
  renderCart();
  showToast("Added to your bag.");
  return true;
}

function changeCartQuantity(id, delta) {
  const line = cart.find(item => item.id === id);
  const product = getProduct(id);
  if (!line || !product) return;

  const next = line.quantity + delta;

  if (next <= 0) {
    cart = cart.filter(item => item.id !== id);
  } else if (next > product.stock) {
    showToast(`Only ${product.stock} item(s) are available.`);
    return;
  } else {
    line.quantity = next;
  }

  persistCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(line => line.id !== id);
  persistCart();
  renderCart();
  showToast("Item removed.");
}

function updateCartBadge() {
  $("#cartCount").textContent = cartQuantity();
  $("#drawerCount").textContent = `(${cartQuantity()})`;
}

function renderCart() {
  const lines = getCartLines();
  const container = $("#cartItems");

  if (!lines.length) {
    container.innerHTML = '<div class="cart-empty"><p>Your bag is empty.</p><a class="text-link" href="#products" id="emptyCartShop">Discover products ↗</a></div>';
  } else {
    container.innerHTML = lines.map(({ product, quantity, unitPrice }) => `
      <div class="cart-row">
        <img src="${escapeHTML(safeImage(product.image))}" alt="${escapeHTML(product.name)}">
        <div>
          <h3>${escapeHTML(product.name)}</h3>
          <p>${money(unitPrice)}</p>
          <div class="quantity-control">
            <button data-cart-minus="${escapeHTML(product.id)}" aria-label="Decrease quantity">−</button>
            <span>${quantity}</span>
            <button data-cart-plus="${escapeHTML(product.id)}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-item" data-remove-cart="${escapeHTML(product.id)}">Remove</button>
        </div>
        <strong>${money(unitPrice * quantity)}</strong>
      </div>`).join("");
  }

  $("#cartSubtotal").textContent = money(cartSubtotal());
  updateCartBadge();
  renderCheckoutSummary();
}

function openCart() {
  $("#cartOverlay").hidden = false;
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#cartOverlay").hidden = true;
  if (!$$(".modal-backdrop").some(modal => !modal.hidden)) {
    document.body.classList.remove("no-scroll");
  }
}

function renderCheckoutSummary() {
  const container = $("#checkoutItems");
  if (!container) return;

  container.innerHTML = getCartLines().map(({ product, quantity, unitPrice }) => `
    <div class="summary-item">
      <span>${escapeHTML(product.name)} × ${quantity}</span>
      <strong>${money(unitPrice * quantity)}</strong>
    </div>`).join("");

  const subtotal = cartSubtotal();
  $("#checkoutSubtotal").textContent = money(subtotal);
  $("#deliveryCost").textContent = money(deliveryFor(subtotal));
  $("#checkoutTotal").textContent = money(subtotal + deliveryFor(subtotal));
}

function openCheckout() {
  if (!getCartLines().length) {
    showToast("Your bag is empty.");
    return;
  }

  closeCart();
  renderCheckoutSummary();
  openModal("checkoutModal");
}

// ---------- Dialog helpers ----------

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;

  if (!$$(".modal-backdrop").some(item => !item.hidden) &&
      !$("#cartDrawer").classList.contains("open")) {
    document.body.classList.remove("no-scroll");
  }
}

function closeAllModals() {
  $$(".modal-backdrop").forEach(modal => modal.hidden = true);
  closeCart();
  document.body.classList.remove("no-scroll");
}

// ---------- Demo checkout and orders ----------

function validSri LankanPhone(phone) {
  return /^[0-9+ ()-]{9,20}$/.test(phone.trim());
}

function placeOrder(event) {
  event.preventDefault();

  if (!getCartLines().length) {
    showToast("Your bag is empty.");
    closeModal("checkoutModal");
    return;
  }

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  // Recheck inventory at the moment the order is submitted.
  for (const line of cart) {
    const product = getProduct(line.id);
    if (!product || product.stock < line.quantity) {
      showToast("Stock changed. Please review your bag.");
      syncCartWithStock();
      renderProducts();
      renderCart();
      renderAdmin();
      return;
    }
  }

  const data = new FormData(form);
  const phone = String(data.get("phone") || "");

  if (!validSri LankanPhone(phone)) {
    showToast("Please check your phone number.");
    return;
  }

  const lines = getCartLines();
  const subtotal = cartSubtotal();
  const delivery = deliveryFor(subtotal);

  const order = {
    id: createId("NOIR"),
    createdAt: new Date().toISOString(),
    customer: {
      name: String(data.get("fullName")).trim(),
      phone: phone.trim(),
      email: String(data.get("email")).trim(),
      address: String(data.get("address")).trim(),
      city: String(data.get("city")).trim(),
      instructions: String(data.get("instructions") || "").trim()
    },
    items: lines.map(({ product, quantity, unitPrice }) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice
    })),
    subtotal,
    delivery,
    total: subtotal + delivery,
    payment: String(data.get("payment")),
    paymentStatus: "Unverified",
    status: "Pending",
    demo: true
  };

  /*
   * This simulates a locally saved order, not a verified payment.
   * In production, the server must validate prices and stock, atomically
   * reserve inventory, and verify the payment provider's signed callback.
   */
  for (const line of cart) {
    const product = getProduct(line.id);
    product.stock -= line.quantity;
  }

  orders.unshift(order);
  persistOrders();
  persistProducts();

  if (!customers.some(customer =>
    customer.email.toLowerCase() === order.customer.email.toLowerCase())) {
    customers.push({
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      createdAt: new Date().toISOString()
    });
    persistCustomers();
  }

  cart = [];
  persistCart();
  form.reset();

  closeModal("checkoutModal");
  renderProducts();
  renderCart();
  renderAdmin();

  showToast("Demo order saved: " + order.id);
  window.alert(
    "DEMO ORDER CONFIRMATION\n\n" +
    "Order ID: " + order.id + "\n" +
    "Total: " + money(order.total) + "\n" +
    "Status: Pending\n\n" +
    "This order was saved only in this browser. " +
    "No payment was processed and no store notification was sent."
  );
}

// ---------- Customer account demo ----------

function selectAccountTab(panelId) {
  $$(".account-panel").forEach(panel => panel.hidden = panel.id !== panelId);
  $$(".tab-button").forEach(button =>
    button.classList.toggle("active", button.dataset.accountTab === panelId));
}

function renderCustomerOrders(email) {
  const target = $("#customerOrders");
  const matching = orders.filter(order =>
    order.customer.email.toLowerCase() === email.toLowerCase());

  target.innerHTML = matching.length ? matching.map(order => `
    <article class="message-card">
      <h3>${escapeHTML(order.id)}</h3>
      <p>${new Date(order.createdAt).toLocaleString()} · ${escapeHTML(order.status)}</p>
      <p>${order.items.map(item =>
        `${escapeHTML(item.name)} × ${item.quantity}`).join("<br>")}</p>
      <strong>${money(order.total)}</strong>
    </article>`).join("") : "<p class='muted'>No demo orders found for this email.</p>";
}

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = String(new FormData(event.currentTarget).get("email")).trim();
  if (!email) return;
  closeModal("accountModal");
  openModal("accountModal");
  selectAccountTab("ordersPanel");
  renderCustomerOrders(email);
  showToast("Demo mode: no password was authenticated.");
});

$("#registerForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const email = String(data.get("email")).trim().toLowerCase();

  if (customers.some(customer => customer.email.toLowerCase() === email)) {
    showToast("A demo customer with this email already exists.");
    return;
  }

  customers.push({
    name: String(data.get("name")).trim(),
    email,
    createdAt: new Date().toISOString()
  });
  persistCustomers();
  event.currentTarget.reset();
  renderAdmin();
  showToast("Demo customer created. No secure account was established.");
});

// ---------- Customer messages and newsletter ----------

function saveMessage(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  messages.unshift({
    id: createId("MSG"),
    name: String(data.get("name")).trim(),
    email: String(data.get("email")).trim(),
    message: String(data.get("message")).trim(),
    reply: "",
    createdAt: new Date().toISOString(),
    status: "New"
  });

  persistMessages();
  event.currentTarget.reset();
  closeModal("contactModal");
  renderAdmin();
  showToast("Message saved locally in this browser.");
}

$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("#newsletterEmail").value.trim().toLowerCase();

  if (!newsletterEmails.includes(email)) {
    newsletterEmails.push(email);
    saveStorage(STORAGE.newsletter, newsletterEmails);
  }

  event.currentTarget.reset();
  showToast("Demo subscription saved in this browser.");
});

function configureWhatsApp() {
  const number = String(settings.whatsapp || "").replace(/\D/g, "");
  const url = number
    ? `https://wa.me/${number}`
    : "https://wa.me/";

  $("#whatsappLink").href = url;
  $("#supportWhatsapp").href = url;
}

// ---------- Admin navigation and analytics ----------

function showAdminView(view) {
  const views = {
    overview: "adminOverview",
    products: "adminProducts",
    orders: "adminOrders",
    messages: "adminMessages",
    reviews: "adminReviews",
    settings: "adminSettings"
  };

  Object.values(views).forEach(id => {
    $("#" + id).hidden = true;
  });

  if (views[view]) $("#" + views[view]).hidden = false;

  $$(".admin-nav").forEach(button =>
    button.classList.toggle("active", button.dataset.adminView === view));

  if (view === "products") renderAdminProducts();
  if (view === "orders") renderAdminOrders();
  if (view === "messages") renderAdminMessages();
  if (view === "reviews") renderAdminReviews();
  if (view === "overview") renderOverview();
}

function renderOverview() {
  $("#statProducts").textContent = products.length;
  $("#statOrders").textContent = orders.length;
  $("#statCustomers").textContent = customers.length;
  $("#statRevenue").textContent = money(orders
    .filter(order => order.status !== "Cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0));
  $("#statPending").textContent =
    orders.filter(order => order.status === "Pending").length;
  $("#statSoldOut").textContent =
    products.filter(product => product.stock <= 0).length;
  $("#statLowStock").textContent =
    products.filter(product => product.stock > 0 && product.stock <= 3).length;

  $("#recentOrdersBody").innerHTML = orders.slice(0, 6).map(order => `
    <tr>
      <td>${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.customer.name)}</td>
      <td>${money(order.total)}</td>
      <td>${escapeHTML(order.status)}</td>
    </tr>`).join("") || '<tr><td colspan="4">No demo orders yet.</td></tr>';

  renderSalesChart();
}

function renderSalesChart() {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString("en", { month: "short" });
    const revenue = orders
      .filter(order => {
        if (order.status === "Cancelled") return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth();
      })
      .reduce((sum, order) => sum + Number(order.total), 0);

    months.push({ label, revenue });
  }

  const max = Math.max(1, ...months.map(item => item.revenue));

  $("#salesChart").innerHTML = months.map(item => `
    <div class="chart-bar-item" title="${money(item.revenue)}">
      <div class="chart-bar" style="height:${Math.max(3, item.revenue / max * 100)}%"></div>
      <span>${item.label}</span>
    </div>`).join("");
}

function renderAdminProducts() {
  $("#adminProductsBody").innerHTML = products.map(product => `
    <tr>
      <td><strong>${escapeHTML(product.name)}</strong><br>
        <span class="muted">${escapeHTML(product.id)}</span></td>
      <td>${money(productPrice(product))}</td>
      <td>${product.stock}</td>
      <td>${product.stock <= 0 ? "SOLD OUT" : product.stock <= 3 ? "LOW STOCK" : "AVAILABLE"}</td>
      <td>
        <button class="table-action" data-edit-product="${escapeHTML(product.id)}">Edit</button>
        <button class="table-action" data-toggle-stock="${escapeHTML(product.id)}">
          ${product.stock <= 0 ? "Restock" : "Mark sold out"}
        </button>
        <button class="table-action danger" data-delete-product="${escapeHTML(product.id)}">Delete</button>
      </td>
    </tr>`).join("") || '<tr><td colspan="5">No products.</td></tr>';
}

function renderAdminOrders() {
  const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Completed", "Cancelled"];

  $("#adminOrdersBody").innerHTML = orders.map(order => `
    <tr>
      <td><strong>${escapeHTML(order.id)}</strong><br>
        <span class="muted">${new Date(order.createdAt).toLocaleDateString()}</span></td>
      <td>${escapeHTML(order.customer.name)}<br>
        <span class="muted">${escapeHTML(order.customer.phone)}</span></td>
      <td>${escapeHTML(order.payment)}<br>
        <span class="muted">${escapeHTML(order.paymentStatus || "Unverified")}</span></td>
      <td>${money(order.total)}</td>
      <td>${escapeHTML(order.status)}</td>
      <td><select data-order-status="${escapeHTML(order.id)}">
        ${statuses.map(status =>
          `<option ${status === order.status ? "selected" : ""}>${status}</option>`
        ).join("")}
      </select></td>
    </tr>`).join("") || '<tr><td colspan="6">No demo orders yet.</td></tr>';
}

function renderAdminMessages() {
  $("#adminMessagesList").innerHTML = messages.map(message => `
    <article class="message-card">
      <h3>${escapeHTML(message.name)} · ${escapeHTML(message.status)}</h3>
      <p>${escapeHTML(message.email)} · ${new Date(message.createdAt).toLocaleString()}</p>
      <p>${escapeHTML(message.message)}</p>
      <label>Demo reply<textarea data-message-reply="${escapeHTML(message.id)}" rows="2">${escapeHTML(message.reply || "")}</textarea></label>
      <button class="button button-secondary" data-save-reply="${escapeHTML(message.id)}">Save reply locally</button>
    </article>`).join("") || '<div class="admin-panel"><p>No customer messages yet.</p></div>';
}

function renderAdminReviews() {
  $("#adminReviewsList").innerHTML = reviews.map(review => `
    <article class="message-card">
      <h3>${escapeHTML(review.name)} · ${"★".repeat(review.rating)}</h3>
      <p>${escapeHTML(review.productName || "Product")}</p>
      <p>${escapeHTML(review.message)}</p>
      <button class="table-action" data-review-action="${escapeHTML(review.id)}">
        ${review.approved ? "Unpublish" : "Approve"}
      </button>
    </article>`).join("") || "<p class='muted'>No submitted reviews yet.</p>";
}

function renderAdmin() {
  renderOverview();
  renderAdminProducts();
  renderAdminOrders();
  renderAdminMessages();
  renderAdminReviews();
}

function openAdmin() {
  $("#adminLoginForm").reset();
  openModal("adminLoginModal");
}

function enterAdminDemo() {
  /*
   * Intentionally not real authentication. Any nonempty username and password
   * opens the demo dashboard. Replace with server-side auth before deployment.
   */
  $("#adminLoginModal").hidden = true;
  $("#adminScreen").hidden = false;
  $("#adminScreen").scrollIntoView({ behavior: "smooth" });
  document.body.classList.remove("no-scroll");
  renderAdmin();
  showAdminView("overview");
}

function exitAdmin() {
  $("#adminScreen").hidden = true;
  showToast("Exited the demo dashboard.");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Admin product editor ----------

function resetProductEditor() {
  const form = $("#productEditorForm");
  form.reset();
  form.elements.id.value = "";
  $("#productEditorTitle").textContent = "Add product";
  $("#productEditorPanel").hidden = true;
}

function editProduct(id = "") {
  const form = $("#productEditorForm");
  form.reset();
  form.elements.id.value = id;

  const product = id ? getProduct(id) : null;
  $("#productEditorTitle").textContent = product ? "Edit product" : "Add product";

  if (product) {
    form.elements.name.value = product.name;
    form.elements.category.value = product.category;
    form.elements.price.value = product.price;
    form.elements.discountPrice.value = product.discountPrice || "";
    form.elements.stock.value = product.stock;
    form.elements.image.value = product.image;
    form.elements.images.value = (product.images || []).join("\n");
    form.elements.description.value = product.description;
    form.elements.specifications.value = (product.specifications || []).join("\n");
    form.elements.featured.checked = Boolean(product.featured);
  }

  $("#productEditorPanel").hidden = false;
  $("#productEditorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const id = String(data.get("id") || "").trim();
  const price = Number(data.get("price"));
  const discountRaw = String(data.get("discountPrice") || "").trim();
  const discountPrice = discountRaw ? Number(discountRaw) : 0;
  const stock = Number(data.get("stock"));
  const image = String(data.get("image")).trim();

  if (!Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isFinite(discountPrice) || discountPrice < 0 ||
      (discountPrice > 0 && discountPrice >= price)) {
    showToast("Check the prices and stock quantity.");
    return;
  }

  if (!/^https:\/\//i.test(image)) {
    showToast("Use an HTTPS product image URL.");
    return;
  }

  const extraImages = String(data.get("images") || "")
    .split("\n").map(value => value.trim())
    .filter(value => /^https:\/\//i.test(value));

  const name = String(data.get("name")).trim();
  const existing = id ? getProduct(id) : null;

  const product = {
    id: existing ? existing.id : createId("NR"),
    name,
    category: String(data.get("category")),
    price,
    discountPrice,
    stock,
    image,
    images: [...new Set([image, ...extraImages])],
    description: String(data.get("description")).trim(),
    specifications: String(data.get("specifications") || "")
      .split("\n").map(value => value.trim()).filter(Boolean),
    featured: form.elements.featured.checked,
    createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10)
  };

  if (existing) {
    products = products.map(item => item.id === id ? product : item);
  } else {
    products.unshift(product);
  }

  persistProducts();
  syncCartWithStock();
  resetProductEditor();
  renderProducts();
  renderCart();
  renderAdmin();
  showToast(existing ? "Product updated." : "Product added.");
}

function deleteProduct(id) {
  const product = getProduct(id);
  if (!product) return;

  if (!window.confirm(`Delete "${product.name}" from the demo catalogue?`)) return;

  products = products.filter(item => item.id !== id);
  cart = cart.filter(item => item.id !== id);

  persistProducts();
  persistCart();
  renderProducts();
  renderCart();
  renderAdmin();
  showToast("Product deleted from this browser.");
}

function toggleSoldOut(id) {
  const product = getProduct(id);
  if (!product) return;

  if (product.stock > 0) {
    product.stock = 0;
    cart = cart.filter(item => item.id !== id);
    showToast("Product marked sold out.");
  } else {
    const input = window.prompt("Enter new stock quantity:", "10");
    if (input === null) return;
    const quantity = Number(input);
    if (!Number.isInteger(quantity) || quantity < 1) {
      showToast("Enter a whole number greater than zero.");
      return;
    }
    product.stock = quantity;
    showToast("Product restocked.");
  }

  persistProducts();
  persistCart();
  renderProducts();
  renderCart();
  renderAdmin();
}

// ---------- Admin order management ----------

function updateOrderStatus(id, nextStatus) {
  const allowed = ["Pending", "Confirmed", "Processing", "Shipped", "Completed", "Cancelled"];
  const order = orders.find(item => item.id === id);
  if (!order || !allowed.includes(nextStatus)) return;

  if (order.status === "Cancelled" && nextStatus !== "Cancelled") {
    showToast("Cancelled demo orders cannot be reopened in this version.");
    renderAdminOrders();
    return;
  }

  if (nextStatus === "Cancelled" && order.status !== "Cancelled") {
    if (!window.confirm("Cancel this demo order and restore its stock?")) {
      renderAdminOrders();
      return;
    }

    order.items.forEach(line => {
      const product = getProduct(line.id);
      if (product) product.stock += Number(line.quantity);
    });
  }

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  persistOrders();
  persistProducts();
  renderProducts();
  renderCart();
  renderAdmin();
  showToast("Demo order status updated.");
}

function saveMessageReply(id) {
  const message = messages.find(item => item.id === id);
  const textarea = $(`[data-message-reply="${CSS.escape(id)}"]`);
  if (!message || !textarea) return;

  message.reply = textarea.value.trim();
  message.status = message.reply ? "Replied in demo" : "New";
  persistMessages();
  renderAdminMessages();
  showToast("Reply saved locally. It was not sent to the customer.");
}

// ---------- Export and settings ----------

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportOrdersCSV() {
  const columns = ["Order ID", "Date", "Customer", "Email", "Phone",
    "Subtotal", "Delivery", "Total", "Payment", "Payment Status", "Status"];

  const rows = orders.map(order => [
    order.id, order.createdAt, order.customer.name, order.customer.email,
    order.customer.phone, order.subtotal, order.delivery, order.total,
    order.payment, order.paymentStatus, order.status
  ]);

  const csvCell = value =>
    '"' + String(value ?? "").replace(/"/g, '""') + '"';

  const csv = [columns, ...rows]
    .map(row => row.map(csvCell).join(",")).join("\r\n");

  downloadFile("noir-demo-orders.csv", "\uFEFF" + csv, "text/csv;charset=utf-8");
}

function exportBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    products, orders, customers, messages, settings, reviews, newsletterEmails
  };
  downloadFile("noir-demo-backup.json", JSON.stringify(backup, null, 2),
    "application/json");
}

function saveSettings(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const deliveryFee = Number(data.get("deliveryFee"));
  const threshold = Number(data.get("freeDeliveryThreshold"));

  if (!Number.isFinite(deliveryFee) || deliveryFee < 0 ||
      !Number.isFinite(threshold) || threshold < 0) {
    showToast("Check the delivery settings.");
    return;
  }

  settings = {
    storeName: String(data.get("storeName")).trim() || "NOIR",
    deliveryFee,
    freeDeliveryThreshold: threshold,
    whatsapp: String(data.get("whatsapp") || "").replace(/\D/g, "")
  };

  persistSettings();
  configureWhatsApp();
  renderCart();
  $("#adminLogo").innerHTML = `${escapeHTML(settings.storeName)} <small>ADMIN</small>`;
  document.title = `${settings.storeName} — Premium Online Shopping Sri Lanka`;
  showToast("Demo settings saved.");
}

function populateSettingsForm() {
  const form = $("#settingsForm");
  form.elements.storeName.value = settings.storeName;
  form.elements.deliveryFee.value = settings.deliveryFee;
  form.elements.freeDeliveryThreshold.value = settings.freeDeliveryThreshold;
  form.elements.whatsapp.value = settings.whatsapp;
}

// ---------- Event handlers ----------

$("#productSearch").addEventListener("input", renderProducts);
$("#categoryFilter").addEventListener("change", renderProducts);
$("#sortProducts").addEventListener("change", renderProducts);

$("#searchToggle").addEventListener("click", () => {
  $("#products").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#productSearch").focus(), 350);
});

$("#cartToggle").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#cartOverlay").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
$("#checkoutButton").addEventListener("click", openCheckout);
$("#checkoutForm").addEventListener("submit", placeOrder);

$("#accountButton").addEventListener("click", () => {
  openModal("accountModal");
  selectAccountTab("loginPanel");
});

$("#footerOrders").addEventListener("click", event => {
  event.preventDefault();
  openModal("accountModal");
  selectAccountTab("ordersPanel");
  $("#customerOrders").innerHTML =
    "<p class='muted'>Enter your email through the demo sign-in flow to view local demo orders.</p>";
});

$$("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.closeModal));
});

$$(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAllModals();
    $("#supportPanel").hidden = true;
    $("#supportToggle").setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", event => {
  const target = event.target.closest("button, a");
  if (!target) return;

  if (target.dataset.category) {
    setCategory(target.dataset.category);
  }

  if (target.dataset.addProduct) {
    addToCart(target.dataset.addProduct);
  }

  if (target.dataset.viewProduct) {
    openProductDetails(target.dataset.viewProduct);
  }

  if (target.dataset.detailAdd) {
    if (addToCart(target.dataset.detailAdd)) {
      closeModal("productModal");
    }
  }

  if (target.dataset.detailBuy) {
    const id = target.dataset.detailBuy;
    if (addToCart(id)) {
      closeModal("productModal");
      openCheckout();
    }
  }

  if (target.dataset.galleryIndex !== undefined) {
    const index = Number(target.dataset.galleryIndex);
    if (activeGalleryImages[index]) {
      $("#detailImage").src = activeGalleryImages[index];
    }
  }

  if (target.dataset.cartPlus) changeCartQuantity(target.dataset.cartPlus, 1);
  if (target.dataset.cartMinus) changeCartQuantity(target.dataset.cartMinus, -1);
  if (target.dataset.removeCart) removeFromCart(target.dataset.removeCart);

  if (target.dataset.accountTab) selectAccountTab(target.dataset.accountTab);

  if (target.dataset.adminView) showAdminView(target.dataset.adminView);

  if (target.dataset.adminJump) showAdminView(target.dataset.adminJump);

  if (target.dataset.editProduct) editProduct(target.dataset.editProduct);
  if (target.id === "addProductButton") editProduct();
  if (target.id === "cancelProductEdit") resetProductEditor();

  if (target.dataset.deleteProduct) deleteProduct(target.dataset.deleteProduct);
  if (target.dataset.toggleStock) toggleSoldOut(target.dataset.toggleStock);

  if (target.dataset.saveReply) saveMessageReply(target.dataset.saveReply);

  if (target.dataset.reviewAction) {
    const review = reviews.find(item => item.id === target.dataset.reviewAction);
    if (review) {
      review.approved = !review.approved;
      persistReviews();
      renderAdminReviews();
      showToast(review.approved ? "Review approved locally." : "Review unpublished.");
    }
  }
});

document.addEventListener("change", event => {
  const select = event.target.closest("[data-order-status]");
  if (select) updateOrderStatus(select.dataset.orderStatus, select.value);
});

$("#mobileMenuToggle").addEventListener("click", () => {
  const nav = $("#mobileNav");
  nav.hidden = !nav.hidden;
  $("#mobileMenuToggle").setAttribute("aria-expanded", String(!nav.hidden));
});

$("#mobileNav").addEventListener("click", event => {
  if (event.target.closest("a")) $("#mobileNav").hidden = true;
});

$("#supportToggle").addEventListener("click", () => {
  const panel = $("#supportPanel");
  panel.hidden = !panel.hidden;
  $("#supportToggle").setAttribute("aria-expanded", String(!panel.hidden));
});

$("#openContact").addEventListener("click", () => {
  $("#supportPanel").hidden = true;
  openModal("contactModal");
});

$("#contactForm").addEventListener("submit", saveMessage);
$("#adminShortcut").addEventListener("click", openAdmin);
$("#adminLoginForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (!String(data.get("username")).trim() ||
      !String(data.get("password")).trim()) return;
  enterAdminDemo();
});
$("#exitAdmin").addEventListener("click", exitAdmin);
$("#adminLogo").addEventListener("click", event => {
  event.preventDefault();
  showAdminView("overview");
});
$("#productEditorForm").addEventListener("submit", saveProduct);
$("#settingsForm").addEventListener("submit", saveSettings);
$("#exportOrders").addEventListener("click", exportOrdersCSV);
$("#exportData").addEventListener("click", exportBackup);

$("#resetDemo").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset all NOIR demo data in this browser? This cannot be undone."
  );
  if (!confirmed) return;

  Object.values(STORAGE).forEach(key => localStorage.removeItem(key));

  products = structuredCloneSafe(DEFAULT_PRODUCTS);
  cart = [];
  orders = [];
  messages = [];
  customers = [];
  settings = structuredCloneSafe(DEFAULT_SETTINGS);
  reviews = [];
  newsletterEmails = [];

  persistProducts();
  persistCart();
  persistOrders();
  persistMessages();
  persistCustomers();
  persistSettings();
  persistReviews();
  saveStorage(STORAGE.newsletter, newsletterEmails);

  populateSettingsForm();
  configureWhatsApp();
  renderProducts();
  renderCart();
  renderAdmin();
  showToast("Demo data reset.");
});

// ---------- Initial setup ----------

function init() {
  // Repair invalid/stale cart lines from previous visits.
  syncCartWithStock();

  $("#currentYear").textContent = new Date().getFullYear();
  document.title = `${settings.storeName} — Premium Online Shopping Sri Lanka`;
  $("#adminLogo").innerHTML = `${escapeHTML(settings.storeName)} <small>ADMIN</small>`;

  populateSettingsForm();
  configureWhatsApp();
  renderProducts();
  renderCart();
  renderAdmin();

  // Seed product data only when the browser has no saved catalogue.
  if (!localStorage.getItem(STORAGE.products)) persistProducts();
}

init();
