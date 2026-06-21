// Types
export type Role = "super_admin" | "qc_officer" | "business_manager" | "citizen_seller" | "buyer" | "visitor";

export type ProductStatus = "pending" | "qc_approved" | "live" | "rejected" | "pending_platform";

export type Department = "Electronics" | "Fashion" | "Home Goods";

export type ProductSource = "market_square" | "citizen_listing";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: Department;
  bio?: string;
  location?: string;
  tagline?: string;
  joinedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  department?: Department;
  category?: string;
  status: ProductStatus;
  source: ProductSource;
  sellerId: string;
  sellerName: string;
  images: string[];
  submittedAt: string;
  updatedAt: string;
  qcComment?: string;
  qcOfficerId?: string;
  adminComment?: string;
  negotiable?: boolean;
  location?: string;
  views?: number;
}

export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  amount: number;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "countered";
  counterAmount?: number;
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  productId: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller";
  type: "offer" | "counter" | "accept" | "reject" | "message";
  amount?: number;
  message: string;
  createdAt: string;
}

export interface Negotiation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice?: number;
  status: "active" | "accepted" | "rejected";
  messages: NegotiationMessage[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: "processing" | "completed" | "failed";
  confirmationNumber: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "offer_received" | "offer_accepted" | "offer_rejected" | "product_approved" | "product_rejected" | "payment_confirmed" | "qc_approved" | "social_milestone";
  title: string;
  message: string;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface SocialShare {
  id: string;
  productId: string;
  sellerId: string;
  platform: string;
  clicks: number;
  views: number;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "submitted" | "approved" | "rejected" | "qc_approved" | "live";
  productId: string;
  productName: string;
  userId: string;
  createdAt: string;
}

// Seed Data
export const MOCK_USERS: User[] = [
  {
    id: "admin-1",
    name: "Sarah Chen",
    email: "sarah@trisonet.com",
    role: "super_admin",
    avatar: "/avatars/sarah.jpg",
    location: "Lagos, Nigeria",
    joinedAt: "2024-01-15",
  },
  {
    id: "qc-1",
    name: "James Okonkwo",
    email: "james@trisonet.com",
    role: "qc_officer",
    avatar: "/avatars/james.jpg",
    location: "Abuja, Nigeria",
    joinedAt: "2024-02-01",
  },
  {
    id: "manager-1",
    name: "Amara Diallo",
    email: "amara@trisonet.com",
    role: "business_manager",
    avatar: "/avatars/amara.jpg",
    department: "Electronics",
    location: "Lagos, Nigeria",
    joinedAt: "2024-01-20",
  },
  {
    id: "manager-2",
    name: "David Mensah",
    email: "david@trisonet.com",
    role: "business_manager",
    avatar: "/avatars/david.jpg",
    department: "Fashion",
    location: "Accra, Ghana",
    joinedAt: "2024-03-01",
  },
  {
    id: "citizen-1",
    name: "Fatima Al-Rashid",
    email: "fatima@trisonet.com",
    role: "citizen_seller",
    avatar: "/avatars/fatima.jpg",
    location: "Cairo, Egypt",
    bio: "Artisan crafts and handmade goods from across Africa.",
    tagline: "Authentic African craftsmanship",
    joinedAt: "2024-04-10",
  },
  {
    id: "citizen-2",
    name: "Kofi Asante",
    email: "kofi@trisonet.com",
    role: "citizen_seller",
    avatar: "/avatars/kofi.jpg",
    location: "Kumasi, Ghana",
    bio: "Electronics reseller and tech enthusiast.",
    tagline: "Your trusted tech marketplace",
    joinedAt: "2024-05-01",
  },
  {
    id: "buyer-1",
    name: "Ngozi Adeyemi",
    email: "ngozi@trisonet.com",
    role: "buyer",
    avatar: "/avatars/ngozi.jpg",
    location: "Port Harcourt, Nigeria",
    joinedAt: "2024-06-15",
  },
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation with 30-hour battery life. Premium wireless headphones for audiophiles.",
    price: 320,
    quantity: 15,
    department: "Electronics",
    category: "Audio",
    status: "live",
    source: "market_square",
    sellerId: "manager-1",
    sellerName: "Electronics Dept.",
    images: [PLACEHOLDER_IMAGES[5]],
    submittedAt: "2024-06-01",
    updatedAt: "2024-06-10",
    qcComment: "All specifications verified and approved.",
    negotiable: true,
    location: "Lagos, Nigeria",
    views: 142,
  },
  {
    id: "prod-2",
    name: "iPhone 15 Pro",
    description: "Latest Apple flagship with titanium design, A17 Pro chip, and advanced camera system.",
    price: 1099,
    quantity: 8,
    department: "Electronics",
    category: "Smartphones",
    status: "qc_approved",
    source: "market_square",
    sellerId: "manager-1",
    sellerName: "Electronics Dept.",
    images: [PLACEHOLDER_IMAGES[0]],
    submittedAt: "2024-06-05",
    updatedAt: "2024-06-08",
    qcComment: "Verified authentic product. Ready for admin approval.",
    negotiable: false,
    location: "Lagos, Nigeria",
    views: 0,
  },
  {
    id: "prod-3",
    name: 'Samsung 4K Smart TV 55"',
    description: "Crystal clear 4K display with built-in streaming apps and voice assistant.",
    price: 680,
    quantity: 5,
    department: "Electronics",
    category: "TVs",
    status: "pending",
    source: "market_square",
    sellerId: "manager-1",
    sellerName: "Electronics Dept.",
    images: [PLACEHOLDER_IMAGES[3]],
    submittedAt: "2024-06-10",
    updatedAt: "2024-06-10",
    negotiable: true,
    location: "Lagos, Nigeria",
    views: 0,
  },
  {
    id: "prod-4",
    name: "Ankara Print Dress Collection",
    description: "Handcrafted Ankara fabric dresses in vibrant African prints. Available in sizes S-XL.",
    price: 85,
    quantity: 30,
    department: "Fashion",
    category: "Dresses",
    status: "live",
    source: "market_square",
    sellerId: "manager-2",
    sellerName: "Fashion Dept.",
    images: [PLACEHOLDER_IMAGES[4]],
    submittedAt: "2024-05-20",
    updatedAt: "2024-05-28",
    qcComment: "Quality verified. Premium materials confirmed.",
    negotiable: true,
    location: "Accra, Ghana",
    views: 89,
  },
  {
    id: "prod-5",
    name: "Kente Cloth Fabric (5 yards)",
    description: "Authentic Kente cloth woven by skilled artisans. Perfect for special occasions.",
    price: 150,
    quantity: 12,
    department: "Fashion",
    category: "Fabrics",
    status: "rejected",
    source: "market_square",
    sellerId: "manager-2",
    sellerName: "Fashion Dept.",
    images: [PLACEHOLDER_IMAGES[4]],
    submittedAt: "2024-06-02",
    updatedAt: "2024-06-07",
    qcComment: "Images provided are not of the actual product. Please resubmit with accurate photos.",
    negotiable: false,
    location: "Accra, Ghana",
    views: 0,
  },
  {
    id: "prod-6",
    name: "Handmade Ceramic Bowl Set",
    description: "Set of 4 hand-painted ceramic bowls with traditional Moroccan patterns. Microwave and dishwasher safe.",
    price: 65,
    quantity: 20,
    category: "Kitchen",
    status: "live",
    source: "citizen_listing",
    sellerId: "citizen-1",
    sellerName: "Fatima Al-Rashid",
    images: [PLACEHOLDER_IMAGES[2]],
    submittedAt: "2024-06-08",
    updatedAt: "2024-06-10",
    negotiable: true,
    location: "Cairo, Egypt",
    views: 56,
  },
  {
    id: "prod-7",
    name: "Woven Basket Collection",
    description: "Handwoven storage baskets made from natural sisal fibers. Set of 3 nesting baskets.",
    price: 45,
    quantity: 25,
    category: "Home Decor",
    status: "live",
    source: "citizen_listing",
    sellerId: "citizen-1",
    sellerName: "Fatima Al-Rashid",
    images: [PLACEHOLDER_IMAGES[1]],
    submittedAt: "2024-06-01",
    updatedAt: "2024-06-03",
    negotiable: true,
    location: "Cairo, Egypt",
    views: 34,
  },
  {
    id: "prod-8",
    name: "Refurbished MacBook Air M2",
    description: "Certified refurbished MacBook Air with M2 chip, 8GB RAM, 256GB SSD. 6-month warranty included.",
    price: 850,
    quantity: 3,
    category: "Laptops",
    status: "pending_platform",
    source: "citizen_listing",
    sellerId: "citizen-2",
    sellerName: "Kofi Asante",
    images: [PLACEHOLDER_IMAGES[5]],
    submittedAt: "2024-06-12",
    updatedAt: "2024-06-12",
    negotiable: true,
    location: "Kumasi, Ghana",
    views: 0,
  },
];

export const MOCK_NEGOTIATIONS: Negotiation[] = [
  {
    id: "neg-1",
    productId: "prod-6",
    buyerId: "buyer-1",
    sellerId: "citizen-1",
    status: "active",
    messages: [
      {
        id: "msg-1",
        productId: "prod-6",
        negotiationId: "neg-1",
        senderId: "buyer-1",
        senderName: "Ngozi Adeyemi",
        senderRole: "buyer",
        type: "offer",
        amount: 50,
        message: "Hi! I love these bowls. Would you accept $50 for the set?",
        createdAt: "2024-06-15T10:00:00Z",
      },
      {
        id: "msg-2",
        productId: "prod-6",
        negotiationId: "neg-1",
        senderId: "citizen-1",
        senderName: "Fatima Al-Rashid",
        senderRole: "seller",
        type: "counter",
        amount: 58,
        message: "Thank you for your interest! These are hand-painted and took considerable time. How about $58?",
        createdAt: "2024-06-15T10:05:00Z",
      },
    ],
    createdAt: "2024-06-15T10:00:00Z",
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-1",
    productId: "prod-4",
    productName: "Ankara Print Dress Collection",
    buyerId: "buyer-1",
    sellerId: "manager-2",
    amount: 80,
    status: "completed",
    confirmationNumber: "TRN-2024-001",
    createdAt: "2024-06-10T14:30:00Z",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "citizen-1",
    type: "offer_received",
    title: "New Offer Received",
    message: "Ngozi Adeyemi made an offer of $50 on your Handmade Ceramic Bowl Set",
    read: false,
    linkTo: "/marketplace/prod-6/negotiate",
    createdAt: "2024-06-15T10:00:00Z",
  },
  {
    id: "notif-2",
    userId: "manager-1",
    type: "product_approved",
    title: "Product Approved",
    message: "Sony WH-1000XM5 Headphones has been approved and is now live on the marketplace",
    read: true,
    linkTo: "/marketplace/prod-1",
    createdAt: "2024-06-10T09:00:00Z",
  },
  {
    id: "notif-3",
    userId: "manager-2",
    type: "product_rejected",
    title: "Product Rejected",
    message: "Kente Cloth Fabric was rejected by QC. Please check the feedback and resubmit.",
    read: false,
    linkTo: "/manager/inventory",
    createdAt: "2024-06-07T11:00:00Z",
  },
  {
    id: "notif-4",
    userId: "buyer-1",
    type: "payment_confirmed",
    title: "Payment Confirmed",
    message: "Your payment of $80 for Ankara Print Dress Collection has been confirmed",
    read: true,
    linkTo: "/checkout/prod-4",
    createdAt: "2024-06-10T14:35:00Z",
  },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "act-1",
    type: "submitted",
    productId: "prod-3",
    productName: 'Samsung 4K Smart TV 55"',
    userId: "manager-1",
    createdAt: "2024-06-10T08:00:00Z",
  },
  {
    id: "act-2",
    type: "approved",
    productId: "prod-1",
    productName: "Sony WH-1000XM5 Headphones",
    userId: "admin-1",
    createdAt: "2024-06-10T09:00:00Z",
  },
  {
    id: "act-3",
    type: "rejected",
    productId: "prod-5",
    productName: "Kente Cloth Fabric",
    userId: "qc-1",
    createdAt: "2024-06-07T11:00:00Z",
  },
  {
    id: "act-4",
    type: "qc_approved",
    productId: "prod-2",
    productName: "iPhone 15 Pro",
    userId: "qc-1",
    createdAt: "2024-06-08T10:00:00Z",
  },
];
