<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=Elwan+Logo" alt="Elwan Store Logo" width="150"/>
  <h1>Elwan E-Commerce Platform 🛒👟</h1>
  <p>A next-generation e-commerce platform built for the Egyptian market, featuring a 3D product viewer, custom embroidery, and an AI-powered WhatsApp Admin Bot.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)](https://tailwindcss.com/)
  [![Baileys](https://img.shields.io/badge/WhatsApp_Bot-Baileys-25D366)](https://github.com/WhiskeySockets/Baileys)
</div>

---

## 🌟 Overview

**Elwan** is a cutting-edge shoe and apparel e-commerce website specifically tailored for modern retail. It seamlessly blends an extraordinary shopping experience with powerful, automated administrative tools. 

Customers can interact with products in real-time 3D, customize items with personal embroidery, and check out seamlessly using multiple payment gateways (including PayMob and Cash on Delivery). 

For the store owners (Admins), Elwan provides a state-of-the-art **WhatsApp Bot integration** that allows full store management directly from their phones without ever needing to open the web dashboard.

---

## ✨ Core Features

### 🛍️ Client-Facing (Shopping Experience)
- **Interactive 3D Viewer:** Powered by `react-three-fiber`, allowing customers to rotate, zoom, and inspect shoes in 3D space before buying.
- **Custom Embroidery Engine:** Customers can directly input their name or text, pick a font/color, and preview how it will be embroidered onto the shoes.
- **Full Localization (i18n):** Native Arabic and English support using `next-intl` with optimized RTL/LTR layout transitions.
- **Intelligent Cart & Checkout:** Frictionless checkout process with live shipping-cost calculation based on Egyptian governorates.
- **Secure Authentication:** `next-auth` integration for seamless user signups and order tracking.

### 🛡️ Admin & Store Management
- **Comprehensive Admin Dashboard:** Visual metrics, sales charts, inventory management, and user control.
- **WhatsApp Management Bot (Revolutionary):** Built using `@whiskeysockets/baileys`. Admins can scan a QR code from the dashboard to link the store to their WhatsApp.
  - **Auto-Notifications:** Automatically sends an instant WhatsApp message to all Admins the moment a customer places a new order.
  - **Text-Menu Commands:** Send `1` or `/help` to view the interactive menu.
  - **Order Operations:** Update status (`/status <id> confirmed`), view order details (`/order <id>`), or export a CSV report (`/report`) directly via WhatsApp.
  - **Product Operations:** Quick stock toggles (`/stock off`), delete products (`/delete`), and generate discount codes (`/discount add CODE 15`).

---

## 🛠️ Technology Stack

| Category         | Technology                 | Notes                                                    |
|------------------|----------------------------|----------------------------------------------------------|
| **Core**         | Next.js (App Router 14)    | React 18, Server Components, Server Actions              |
| **Language**     | TypeScript                 | End-to-end type safety                                   |
| **Database**     | PostgreSQL + Prisma ORM    | Hosted on Neon / Vercel Postgres                         |
| **Styling**      | Tailwind CSS               | Responsive UI with Custom Animations & Framer Motion     |
| **3D Rendering** | Three.js + R3F             | WebGL 3D Model viewer (`@react-three/fiber`)             |
| **WhatsApp Bot** | Baileys (WhiskeySockets)   | Headless WebSockets WhatsApp Client                      |
| **Auth**         | NextAuth v4                | JWT Strategy & Session Management                        |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18.x or newer)
- PostgreSQL database
- Git

### 2. Installation
Clone the repository and install the dependencies.

```bash
git clone https://github.com/yourusername/elwan-store.git
cd elwan-store
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on the following template:

```env
# Database (PostgreSQL via Neon / Local)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_strong_secret_key_here"

# External APIs
PAYMOB_API_KEY="your_paymob_api_key_here"
RESEND_API_KEY="your_email_api_here"
```

### 4. Database Setup
Push the Prisma schema to your database and generate the client.

```bash
npx prisma generate
npx prisma db push

# Optional: Seed the database with initial categories and admin account
npm run seed
```

### 5. Running the Application
Start the development server:

```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 📱 WhatsApp Bot Setup Guide

The WhatsApp Bot allows store owners to control the website purely from WhatsApp.

1. Create an **Admin Account** on the website (`role: 'ADMIN'` in DB).
2. Go to the Admin Dashboard and navigate to the **WhatsApp Integration** tab.
3. Wait for the QR code to load on the screen.
4. Open your WhatsApp App > Linked Devices > Link a Device, and scan the QR code.
5. In your WhatsApp (Message Yourself or from another number), send:
   ```text
   /login
   ```
6. The bot will ask for your login details. Reply with:
   ```text
   your_username:your_password
   ```
7. Once verified, you will receive a Welcome Message. Type `1` or `/help` to see the Admin Control Menu!

---

## 📂 Project Structure

```text
elwan/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets, fonts, and 3D models (.glb/.gltf)
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── (client)/       # Customer-facing shopping pages
│   │   ├── admin/          # Admin Dashboard pages
│   │   └── api/            # Backend API routes (Auth, Checkout, WhatsApp)
│   ├── components/         # Reusable React components (UI, 3D Canvas)
│   ├── lib/                # Utility functions, Prisma Client, and Baileys Bot Logic
│   └── messages/           # next-intl translation dictionaries (ar.json, en.json)
├── next.config.js          # Next.js bundler config
├── tailwind.config.ts      # Tailwind styling variables
└── package.json            # Dependencies
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is proprietary and built specifically for the Elwan brand. All rights reserved.
