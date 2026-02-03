export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | Category;
  image?: string;
  status: 'ENABLED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  sku?: string;
  rating?: number;
  size?: string;
  barcode?: string;
  quantity?: number;
  weight?: number;
  category: string | Category;
  status: 'ACTIVE' | 'OUT_OF_STOCK';
  tags: string[];
  images: string[];
  imageUrls?: string[];
  options: Record<string, any>;
  variants: string[];
  reviews: string[];
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  barcode?: string;
  quantity: number;
  weight?: number;
  size: string;
  color: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'; // Updated to match backend
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingFee: number;
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  status:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'PAID';
  trackingNumber?: string;
  notes?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  razorpayOrderId?: string;
  orderTimeline?: OrderTimeline;
  isViewed: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface OrderItem {
  product: string | Product;
  variant?: string | ProductVariant;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  _id: string;
  user: string;
  type: string;
  houseNo: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface OrderTimeline {
  orderPlaced: TimelineEvent;
  orderConfirmed: TimelineEvent;
  processing: TimelineEvent;
  shipped: TimelineEvent;
  outForDelivery: TimelineEvent;
}

export interface TimelineEvent {
  date: string | null;
  message: string;
  status: string;
  flag: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  image?: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  status: 'ENABLED' | 'DISABLED' | 'DELETED';
  isActive: boolean;
  gender?: string;
  addresses?: any[];
  paymentMethods?: any[];
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: Product[];
}
