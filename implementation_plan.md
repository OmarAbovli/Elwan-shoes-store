# Elwan E-commerce Platform — Implementation Plan

Egyptian shoe/sneaker brand with embroidery customization, 3D product display, WhatsApp bot admin, Paymob payments, and bilingual support.

## User Review Required

> [!IMPORTANT]
> **WhatsApp Bot (Baileys)**: We'll use the `@whiskeysockets/baileys` library to connect WhatsApp via QR code scan. This is an **unofficial** WhatsApp API — it works well but Meta could block it. This is per your request to avoid official WhatsApp API.

> [!IMPORTANT]
> **Email Verification**: Since you don't want Nodemailer, we'll use **Resend** (free tier: 100 emails/day). You'll need to sign up at [resend.com](https://resend.com) and get an API key. Alternative: **EmailJS** (client-side, less secure).

> [!WARNING]
> **Paymob Integration**: You'll need to create a Paymob account and configure API keys in the admin panel. The integration will be ready but won't process real payments until you add your Paymob credentials.

> [!CAUTION]
> **Admin credentials** (`elwan` / `321321`) will be seeded in the database. You should change the password after first login in production.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Neon PostgreSQL + Prisma ORM |
| Styling | Vanilla CSS + CSS variables |
| 3D Viewer | Three.js / model-viewer for GLB files |
| Auth | NextAuth.js (credentials provider) |
| WhatsApp | @whiskeysockets/baileys |
| Payments | Paymob API |
| Email | Resend |
| i18n | next-intl |
| Deployment | Vercel |
| File Storage | Vercel Blob or Cloudinary |

---

## Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String?  @unique
  password     String   // bcrypt hashed
  phone        String?
  governorate  String?
  role         Role     @default(USER)
  verified     Boolean  @default(false)
  verifyToken  String?
  orders       Order[]
  createdAt    DateTime @default(now())
}

enum Role { USER  ADMIN }

model Product {
  id           String   @id @default(cuid())
  nameEn       String
  nameAr       String
  descEn       String
  descAr       String
  price        Float
  sizes        Int[]    // [38,39,...,45]
  colors       String[] // hex codes
  images       String[] // URLs
  modelUrl     String?  // 3D GLB file URL
  category     String   // "sneakers" | "shoes"
  isCustomizable Boolean @default(false)
  inStock      Boolean  @default(true)
  orderItems   OrderItem[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Order {
  id           String      @id @default(cuid())
  user         User?       @relation(fields: [userId], references: [id])
  userId       String?
  customerName String
  phone        String
  altPhone     String?
  address      String
  governorate  String
  shippingCost Float
  subtotal     Float
  discount     Float       @default(0)
  total        Float
  paymentMethod String     // "cod" | "paymob"
  paymentStatus String     @default("pending")
  orderStatus  String      @default("pending")
  discountCode String?
  items        OrderItem[]
  createdAt    DateTime    @default(now())
}

model OrderItem {
  id              String  @id @default(cuid())
  order           Order   @relation(fields: [orderId], references: [id])
  orderId         String
  product         Product @relation(fields: [productId], references: [id])
  productId       String
  quantity        Int
  size            Int
  color           String?
  customEmbroidery String? // custom text/design request
  price           Float
}

model ShippingRate {
  id          String @id @default(cuid())
  governorate String @unique
  cost        Float
}

model DiscountCode {
  id          String   @id @default(cuid())
  code        String   @unique
  percentage  Float    // e.g. 15 for 15%
  maxUses     Int      @default(100)
  usedCount   Int      @default(0)
  active      Boolean  @default(true)
  expiresAt   DateTime?
}

model SiteSettings {
  id              String  @id @default("main")
  paymobApiKey    String?
  paymobSecretKey String?
  paymobIframeId  String?
  whatsappLinked  Boolean @default(false)
}
```

---

## Proposed Changes

### 1. Project Foundation

#### [NEW] [package.json](file:///c:/Users/pc/Desktop/elwan/package.json)
Next.js 14 project with dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `next-intl`, `@whiskeysockets/baileys`, `three`, `@google/model-viewer`, `resend`, `qrcode`

#### [NEW] [.env](file:///c:/Users/pc/Desktop/elwan/.env)
Environment variables: DATABASE_URL (from neon outh.txt), NEXTAUTH_SECRET, RESEND_API_KEY

#### [NEW] [prisma/schema.prisma](file:///c:/Users/pc/Desktop/elwan/prisma/schema.prisma)
Full database schema as shown above

#### [NEW] [prisma/seed.ts](file:///c:/Users/pc/Desktop/elwan/prisma/seed.ts)
Seed admin user (elwan/321321), Egyptian governorates with default shipping rates

---

### 2. Design System & Layout

#### [NEW] [src/app/globals.css](file:///c:/Users/pc/Desktop/elwan/src/app/globals.css)
- Egyptian-inspired color palette: warm sand (#D4A574), deep navy (#1a1a2e), gold accent (#C9A96E), with dark mode
- Custom font: Cairo (Arabic) + Outfit (English) from Google Fonts
- 3D-depth effects: box-shadows, perspective transforms, glassmorphism
- Smooth animations & transitions

#### [NEW] [src/app/layout.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/layout.tsx)
Root layout with i18n provider, auth session, navbar, footer

#### [NEW] [src/components/Navbar.tsx](file:///c:/Users/pc/Desktop/elwan/src/components/Navbar.tsx)
- Elwan logo (generated)
- Navigation links, language switcher (EN/AR), cart icon with count
- User menu (login/profile)

#### [NEW] [src/components/Footer.tsx](file:///c:/Users/pc/Desktop/elwan/src/components/Footer.tsx)
Contact info (WhatsApp: +20 12 85986697), social links, quick links

---

### 3. Frontend Pages

#### [NEW] [src/app/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/page.tsx) — Home Page
- Hero section with 3D animated shoe
- **Product shelf**: CSS 3D perspective shelf effect displaying products as if in a store
- Featured/new products with hover depth effects
- "Custom Embroidery" CTA section
- Brand story section

#### [NEW] [src/app/products/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/products/page.tsx) — Product Listing
- Grid/shelf view toggle
- Filter by category, size, price range
- 3D card hover effects with parallax depth

#### [NEW] [src/app/products/[id]/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/products/%5Bid%5D/page.tsx) — Product Detail
- 3D model viewer (if GLB uploaded) or image gallery with depth effect
- Size selector, color picker
- "Request Custom Embroidery" button → modal with text input + preview
- Add to cart, Buy now
- Price display in EGP

#### [NEW] [src/app/cart/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/cart/page.tsx) — Shopping Cart
- Cart items with quantities
- Discount code input
- Shipping cost auto-calculated by governorate
- Order summary with total

#### [NEW] [src/app/checkout/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/checkout/page.tsx) — Checkout
- Customer info form (name, phone, alt phone, address, governorate)
- Payment method selection (COD / Paymob)
- Order confirmation → WhatsApp notification to admin

#### [NEW] [src/app/auth/login/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/auth/login/page.tsx) — Smart Login
- Username + password
- Detects role (admin → redirect to /admin, user → redirect to home)
- Link to register

#### [NEW] [src/app/auth/register/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/auth/register/page.tsx) — Register
- Email, username, password, phone, governorate (Egyptian dropdown)
- Sends verification code to email via Resend
- Verification page

---

### 4. Admin Dashboard

#### [NEW] [src/app/admin/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/page.tsx) — Dashboard Home
- Stats overview: total orders, revenue, products count, pending orders
- Recent orders list
- Quick actions

#### [NEW] [src/app/admin/products/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/products/page.tsx)
- Product list with edit/delete
- Add new product form (images, 3D model upload, details)

#### [NEW] [src/app/admin/orders/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/orders/page.tsx)
- Orders table with status filters
- Update order status

#### [NEW] [src/app/admin/shipping/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/shipping/page.tsx)
- Edit shipping cost per Egyptian governorate (27 governorates)

#### [NEW] [src/app/admin/discounts/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/discounts/page.tsx)
- Create/edit/delete discount codes
- Set percentage, max uses, expiry

#### [NEW] [src/app/admin/settings/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/settings/page.tsx)
- Paymob API keys configuration
- General site settings

#### [NEW] [src/app/admin/whatsapp/page.tsx](file:///c:/Users/pc/Desktop/elwan/src/app/admin/whatsapp/page.tsx)
- QR code display for WhatsApp linking
- Connection status
- Linked phone info

---

### 5. API Routes

#### [NEW] [src/app/api/auth/[...nextauth]/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/auth/%5B...nextauth%5D/route.ts)
NextAuth credentials provider with role-based redirect

#### [NEW] [src/app/api/products/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/products/route.ts)
GET (list), POST (create - admin only)

#### [NEW] [src/app/api/products/[id]/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/products/%5Bid%5D/route.ts)
GET (detail), PUT (update), DELETE (remove)

#### [NEW] [src/app/api/orders/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/orders/route.ts)
POST (create order + send WhatsApp notification), GET (admin: list all)

#### [NEW] [src/app/api/shipping/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/shipping/route.ts)
GET (list rates), PUT (update rates - admin)

#### [NEW] [src/app/api/discounts/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/discounts/route.ts)
CRUD for discount codes + validate endpoint

#### [NEW] [src/app/api/upload/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/upload/route.ts)
File upload handler for product images and 3D models

#### [NEW] [src/app/api/whatsapp/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/whatsapp/route.ts)
WhatsApp connection management, QR code generation

#### [NEW] [src/app/api/verify-email/route.ts](file:///c:/Users/pc/Desktop/elwan/src/app/api/verify-email/route.ts)
Email verification token handler

---

### 6. WhatsApp Bot

#### [NEW] [src/lib/whatsapp.ts](file:///c:/Users/pc/Desktop/elwan/src/lib/whatsapp.ts)
Baileys-based WhatsApp client with command system:

| Command | Description |
|---------|-------------|
| `/help` | List all commands |
| `/get all` | List all products |
| `/get orders` | List recent orders |
| `/get stats` | Sales statistics |
| `/add` | Start add product flow |
| `/edit <id>` | Edit product (shows options: 1.desc 2.images 3.price etc.) |
| `/delete <id>` | Delete product |
| `/order <id>` | Get order details |
| `/status <order_id> <status>` | Update order status |
| `/discount add <code> <percent>` | Create discount code |
| `/stock <id> <on/off>` | Toggle product stock |

---

### 7. Internationalization

#### [NEW] [src/messages/en.json](file:///c:/Users/pc/Desktop/elwan/src/messages/en.json)
English translations (default)

#### [NEW] [src/messages/ar.json](file:///c:/Users/pc/Desktop/elwan/src/messages/ar.json)
Arabic translations with RTL support

---

## Project Structure
```
elwan/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Home
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductShelf.tsx
│   │   ├── ModelViewer.tsx
│   │   ├── EmbroideryCustomizer.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── whatsapp.ts
│   │   └── utils.ts
│   └── messages/
│       ├── en.json
│       └── ar.json
├── .env
├── next.config.js
└── package.json
```

---

## Verification Plan

### Automated (Browser Testing)
1. **Home page loads** — Navigate to `localhost:3000`, verify shelf display and product cards render
2. **Product detail** — Click a product, verify 3D viewer/gallery loads, size selector works
3. **Auth flow** — Register a new user, verify email sent, login, verify redirect
4. **Admin login** — Login with `elwan`/`321321`, verify redirect to `/admin`
5. **Admin CRUD** — Add a product, edit it, verify it appears on storefront
6. **Cart & Checkout** — Add item to cart, apply discount code, select governorate, verify total calculation
7. **WhatsApp QR** — Navigate to admin WhatsApp page, verify QR code displays

### Manual Verification (User)
1. **Scan QR code** with your phone to link WhatsApp and test bot commands
2. **Test Paymob** by entering your API keys in admin settings
3. **Verify email delivery** by registering a new account (requires Resend API key)
4. **Deploy to Vercel** and test production build

---

## Implementation Order
1. Project setup + DB schema + seed
2. Design system + layout + logo
3. Auth (login/register/verification)
4. Products API + admin CRUD
5. Home page + product shelf + detail page
6. Cart + checkout + order flow + WhatsApp notification
7. Admin dashboard (stats, shipping, discounts, settings)
8. WhatsApp bot integration
9. i18n (Arabic translations + RTL)
10. Polish, animations, responsive, SEO
