const fetchWithBaseUrl = async (endpoint, options = {}) => {
  const BASE_URL = "https://invoice-foodieshub-backend.vercel.app/api";
  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}, Endpoint: ${endpoint}`);
  }

  return response.json();
};


export const fetchCategories = async () => {
  return fetchWithBaseUrl("/categories");
};

export const addCategory = async (name) => {
  return fetchWithBaseUrl("/categories", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
};

// New function to fetch products
export const fetchProducts = async () => {
  return fetchWithBaseUrl("/products");

};

export const removeProduct = async (productName, productPrice) => {
  return fetchWithBaseUrl("/products", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: productName, price: productPrice }),
  });
};

export const addProduct = async (product) => {
  return fetchWithBaseUrl("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

};

export const sendorder = async (order) => {
  return fetchWithBaseUrl("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

};

export const fetchOrders = async () => {
  return fetchWithBaseUrl("/orders");

}

export const setdata = async (customerdata) => {
  return fetchWithBaseUrl("/customerdata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerdata),
  });

};

export const fetchcustomerdata = async () => {
  return fetchWithBaseUrl("/customerdata");

};

export const removeOrder = async (orderId) => {
  return fetchWithBaseUrl(`/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

};
