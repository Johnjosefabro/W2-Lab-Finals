(function () {
    'use strict';

    var STORAGE_KEY = 'street-stitch-cart';
    var cart = loadCart();

    var peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    // Map catalog items from HTML DOM
    var catalog = {};
    document.querySelectorAll('article[data-id]').forEach(function (el) {
        catalog[el.dataset.id] = {
            name: el.dataset.name,
            price: Number(el.dataset.price)
        };
    });

    // DOM Elements
    var cartList = document.getElementById('cart-items');
    var cartEmpty = document.getElementById('cart-empty');
    var cartCount = document.getElementById('cart-count');
    var subtotalEl = document.getElementById('subtotal');
    var totalEl = document.getElementById('total');
    var placeOrder = document.getElementById('place-order');
    var checkoutForm = document.getElementById('checkout-form');
    var layout = document.getElementById('checkout-layout');
    var confirmation = document.getElementById('order-confirmation');
    var orderMessage = document.getElementById('order-message');

    // Load & Save Cart state
    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {}
    }

    // Render cart UI & update totals
    function render() {
        var subtotal = cart.reduce(function (sum, item) {
            return sum + catalog[item.id].price * item.qty;
        }, 0);

        var totalQty = cart.reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);

        cartCount.textContent = totalQty;
        cartEmpty.hidden = cart.length > 0;
        cartList.innerHTML = '';

        cart.forEach(function (item, index) {
            var product = catalog[item.id];
            var li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = 
                '<div>' +
                    '<strong>' + product.name + '</strong> (' + item.size + ')<br>' +
                    '<small>' + item.qty + ' × ' + peso.format(product.price) + '</small>' +
                '</div>' +
                '<button type="button" data-index="' + index + '" class="remove-btn">✕</button>';
            cartList.appendChild(li);
        });

        subtotalEl.textContent = peso.format(subtotal);
        totalEl.textContent = peso.format(subtotal);
        placeOrder.disabled = cart.length === 0;
    }

    // Add product to cart
    function addToCart(article) {
        var id = article.dataset.id;
        var select = article.querySelector('select');
        var msg = article.querySelector('.product-msg');
        var size = select.value;

        if (!size) {
            if (msg) msg.textContent = 'Please choose a size.';
            select.focus();
            return;
        }

        var existing = cart.find(function (item) {
            return item.id === id && item.size === size;
        });

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: id, size: size, qty: 1 });
        }

        if (msg) msg.textContent = 'Added to cart!';
        saveCart();
        render();
    }

    // Event Listeners for Add to Cart Buttons
    document.querySelectorAll('article[data-id]').forEach(function (article) {
        var btn = article.querySelector('.add-to-cart');
        if (btn) {
            btn.addEventListener('click', function () {
                addToCart(article);
            });
        }
    });

    // Remove item from cart
    cartList.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-btn')) {
            var index = Number(e.target.dataset.index);
            cart.splice(index, 1);
            saveCart();
            render();
        }
    });

    // Handle Checkout Submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (cart.length === 0) return;

            var name = document.getElementById('full-name').value.trim();
            var email = document.getElementById('checkout-email').value.trim();
            var ref = 'SS-' + Date.now().toString(36).toUpperCase();

            orderMessage.textContent = 
                'Thank you, ' + name + '! Order ' + ref + ' has been placed. A confirmation email was sent to ' + email + '.';

            cart = [];
            saveCart();
            checkoutForm.reset();
            render();

            layout.hidden = true;
            confirmation.hidden = false;
        });
    }

    // Initial render call on page load
    render();
})();