const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  
  const token = localStorage.getItem("token");
  if (!token) {
    return {};
  }
  
  return { Authorization: `Bearer ${token}` };
}

export interface Product {
  readonly id: number;
  name: string;
  description: string;
  price: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
}

export interface OrderItem {
  readonly id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  readonly id: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: OrderStatusType;
  totalAmount: number;
  items: OrderItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItemDto[];
}

export interface UpdateOrderDto {
  status?: OrderStatusType;
}

export interface Customer {
  readonly id: number;
  name: string;
  email: string;
  orders?: Order[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  customer: Customer;
  access_token: string;
}

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },

  async getOne(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  },

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update product");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
  },
};

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  async getOne(id: number): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },

  async create(data: CreateOrderDto): Promise<Order> {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create order");
    }
    return res.json();
  },

  async updateStatus(
    id: number,
    status: UpdateOrderDto["status"]
  ): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete order");
  },
};

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const res = await fetch(`${API_URL}/customers`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch customers");
    return res.json();
  },

  async getOne(id: number): Promise<Customer> {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch customer");
    return res.json();
  },

  async create(data: CreateCustomerDto): Promise<Customer> {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create customer");
    }
    return res.json();
  },

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update customer");
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete customer");
  },
};

export const authApi = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Login failed");
    }
    return res.json();
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed");
    }
    return res.json();
  },
};
