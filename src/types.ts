export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  badge?: string;
  additionalImages?: string[];
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Sakura Horizon Print",
    price: 45.00,
    description: "A cinematic capture of the spring horizon where petals meet the blue sky. Printed on archival 310gsm museum cotton rag.",
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=1000",
    category: "Prints",
    badge: "Bestseller",
    additionalImages: [
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "2",
    name: "Zenith Blue Hoodie",
    price: 85.00,
    description: "Heavyweight 480gsm French terry cotton hoodie in the exact shade of a clear afternoon sky. Features custom steel drawstrings.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000",
    category: "Apparel",
    badge: "New",
    additionalImages: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "3",
    name: "Survey Tactical Pack",
    price: 120.00,
    description: "Durable tactical-inspired backpack in a deep reconnaissance forest green wash with quick-release aluminum cobra buckles.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=1000",
    category: "Gear",
    badge: "Limited",
    additionalImages: [
      "https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "4",
    name: "Petal Ceramic Set",
    price: 65.00,
    description: "Handcrafted Kyoto ceramics with subtle cherry blossom engravings and matte cel-shaded glaze finish.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000",
    category: "Home",
    additionalImages: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1517814624413-ad355860006a?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "5",
    name: "Skyway Grid Journal",
    price: 18.00,
    description: "Minimalist dot-grid engineering notebook with weatherproof synthetic leather cover and pink ribbon bookmark.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=1000",
    category: "Gear",
    badge: "Sale",
    additionalImages: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "6",
    name: "Blossom Sencha Tin",
    price: 24.00,
    description: "First-harvest organic Uji green tea infused with dried Shizuoka cherry petals. Packaged in an airtight UV-safe steel canister.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000",
    category: "Home",
    additionalImages: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1000"
    ]
  }
];
