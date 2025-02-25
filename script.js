document.addEventListener("DOMContentLoaded", function() {
    displayCartItems();
    updateTotalPrice();
    displayOrders(); // Display orders on DOMContentLoaded
});

function toggleMenu() {
    var navItems = document.querySelector('.nav-items');
    navItems.classList.toggle('show');
}

const cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productName, price, imageUrl) {
    const existingItemIndex = cart.findIndex(item => item.name === productName);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ name: productName, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart');
    displayCartItems();
    updateTotalPrice();
}

function displayCartItems() {
    const cartList = document.getElementById('cart-list');
    if (!cartList) return;

    cartList.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Price: ₹${item.price.toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <button  onclick="removeFromCart(${index})">Remove</button>
        `;
        cartList.appendChild(cartItem);
    });
}

function updateTotalPrice() {
    const totalPriceElement = document.getElementById('total-price');
    if (!totalPriceElement) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceElement.textContent = `₹${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateTotalPrice();
}

function displayBuyNowForm(productName, price) {
    const formContainer = document.getElementById(`buy-now-form-${productName.replace(/\s/g, '-').toLowerCase()}`);
    if (!formContainer) return;

    formContainer.innerHTML = `
        <div class="buy-now-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
            <label for="phone">Phone No:</label>
            <input type="number" id="phone" name="phone">
            <label for="address">Address:</label>
            <input type="text" id="address" name="address">
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" name="quantity" value="1">
            <button onclick="confirmPurchase('${productName}', ${price})">Confirm</button>
            <button onclick="closeBuyNowForm('${productName}')">Cancel</button>
        </div>
    `;
    formContainer.style.display = 'flex';
}

function closeBuyNowForm(productName) {
    const formContainer = document.getElementById(`buy-now-form-${productName.replace(/\s/g, '-').toLowerCase()}`);
    if (formContainer) {
        formContainer.innerHTML = '';
        formContainer.style.display = 'none';
    }
}

function confirmPurchase(productName, price) {
    const formContainer = document.getElementById(`buy-now-form-${productName.replace(/\s/g, '-').toLowerCase()}`);
    if (!formContainer) return;

    const name = formContainer.querySelector('#name').value;
    const address = formContainer.querySelector('#address').value;
    const phone = formContainer.querySelector('#phone').value; // Add phone number field
    const quantity = parseInt(formContainer.querySelector('#quantity').value);

    if (!name || !address || !phone || quantity <= 0) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Create an order object
    const order = {
        name,
        phone,
        address,
        items: [{ name: productName, price, quantity }],
        total: price * quantity
    };
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Add new order to the list
    orders.push(order);

    // Store updated orders list back to local storage
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`Purchase confirmed for ${productName}. \n\nQuantity: ${quantity}. \n\nTotal: ₹${(price * quantity).toFixed(2)}. \n\nThank you, ${name}. \n\nYour order will be delivered to ${address} as soon as possible.`);
    closeBuyNowForm(productName);

    displayOrders();
}

function displayCheckoutForm() {
    const formContainer = document.getElementById('checkout-form-container');
    if (!formContainer) return;

    formContainer.innerHTML = `
        <div class="checkout-form">
            <label for="checkout-name">Name:</label>
            <input type="text" id="checkout-name" name="name">
            <label for="phone">Phone No:</label>
            <input type="number" id="phone" name="phone">
            <label for="checkout-address">Address:</label>
            <input type="text" id="checkout-address" name="address">
            <button onclick="confirmCheckout()">Confirm</button>
            <button onclick="closeCheckoutForm()">Cancel</button>
        </div>
    `;
    formContainer.style.display = 'flex';
}

function closeCheckoutForm() {
    const formContainer = document.getElementById('checkout-form-container');
    if (formContainer) {
        formContainer.innerHTML = '';
        formContainer.style.display = 'none';
    }
}

function confirmCheckout() {
    const formContainer = document.getElementById('checkout-form-container');
    if (!formContainer) return;

    const name = formContainer.querySelector('#checkout-name').value;
    const phone = formContainer.querySelector('#phone').value; // Add phone number field
    const address = formContainer.querySelector('#checkout-address').value;

    if (!name || !address || !phone) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Create an order object
    const order = {
        name,
        phone,
        address,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    // Retrieve existing orders from local storage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Add new order to the list
    orders.push(order);

    // Store updated orders list back to local storage
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`Thank you, ${name}. \nYour order will be delivered to ${address} as soon as possible.`);
    closeCheckoutForm();
    
    // Clear cart after checkout
    localStorage.removeItem('cart');
    cart.length = 0;
    displayCartItems();
    updateTotalPrice();
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    displayCheckoutForm();
}

// Function to display orders on the orders.html page
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
        return;
    }

    ordersList.innerHTML = ''; // Clear existing content

    orders.forEach((order, orderIndex) => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');
        orderDiv.innerHTML = `
            <h3>Order ${orderIndex + 1}</h3>
            <p><strong>Name:</strong> ${order.name}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
            <p><strong>Address:</strong> ${order.address}</p>
            <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
            <h4>Items:</h4>
            <ul>
                ${order.items.map(item => `
                    <li>
                        ${item.name} - ${item.quantity} x ₹${item.price.toFixed(2)}
                    </li>
                `).join('')}
            </ul>
            <button onclick="cancelOrder(${orderIndex})">Cancel Order</button>
        `;
        ordersList.appendChild(orderDiv);
    });
}

function cancelOrder(orderIndex) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orderIndex < 0 || orderIndex >= orders.length) {
        alert('Invalid order index.');
        return;
    }

    // Remove the order from the orders array
    orders.splice(orderIndex, 1);

    // Update local storage with the modified orders array
    localStorage.setItem('orders', JSON.stringify(orders));

    // Refresh the displayed orders
    displayOrders();
}
