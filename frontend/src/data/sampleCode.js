// Local frontend demo fixtures; the backend has no B34/B35 sample contract yet.
export const buggyCodeSample = `const cart = [];

function addToCart(item) {
  cart.push(item);
  return cart;
}

function checkout() {
  if (!cart.length) {
    return 'No items';
  }

  cart = [];
  return 'Order placed';
}`;

export const cleanCodeSample = `const cart = [];

function addToCart(item) {
  cart.push(item);
  return [...cart];
}

function checkout() {
  if (!cart.length) {
    return 'No items';
  }

  const order = [...cart];
  cart.length = 0;
  return order;
}`;
