import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const egyptianGovernorates = [
  { governorate: 'Cairo', nameAr: 'القاهرة', cost: 50 },
  { governorate: 'Giza', nameAr: 'الجيزة', cost: 50 },
  { governorate: 'Alexandria', nameAr: 'الإسكندرية', cost: 70 },
  { governorate: 'Dakahlia', nameAr: 'الدقهلية', cost: 65 },
  { governorate: 'Sharqia', nameAr: 'الشرقية', cost: 65 },
  { governorate: 'Monufia', nameAr: 'المنوفية', cost: 65 },
  { governorate: 'Qalyubia', nameAr: 'القليوبية', cost: 55 },
  { governorate: 'Beheira', nameAr: 'البحيرة', cost: 70 },
  { governorate: 'Gharbia', nameAr: 'الغربية', cost: 65 },
  { governorate: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', cost: 70 },
  { governorate: 'Damietta', nameAr: 'دمياط', cost: 70 },
  { governorate: 'Port Said', nameAr: 'بورسعيد', cost: 75 },
  { governorate: 'Ismailia', nameAr: 'الإسماعيلية', cost: 70 },
  { governorate: 'Suez', nameAr: 'السويس', cost: 70 },
  { governorate: 'Fayoum', nameAr: 'الفيوم', cost: 65 },
  { governorate: 'Beni Suef', nameAr: 'بني سويف', cost: 70 },
  { governorate: 'Minya', nameAr: 'المنيا', cost: 75 },
  { governorate: 'Assiut', nameAr: 'أسيوط', cost: 80 },
  { governorate: 'Sohag', nameAr: 'سوهاج', cost: 80 },
  { governorate: 'Qena', nameAr: 'قنا', cost: 85 },
  { governorate: 'Luxor', nameAr: 'الأقصر', cost: 85 },
  { governorate: 'Aswan', nameAr: 'أسوان', cost: 90 },
  { governorate: 'Red Sea', nameAr: 'البحر الأحمر', cost: 90 },
  { governorate: 'New Valley', nameAr: 'الوادي الجديد', cost: 95 },
  { governorate: 'Matrouh', nameAr: 'مطروح', cost: 90 },
  { governorate: 'North Sinai', nameAr: 'شمال سيناء', cost: 95 },
  { governorate: 'South Sinai', nameAr: 'جنوب سيناء', cost: 95 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('321321', 12);
  await prisma.user.upsert({
    where: { username: 'elwan' },
    update: {},
    create: {
      username: 'elwan',
      email: 'admin@elwan.com',
      password: hashedPassword,
      role: Role.ADMIN,
      verified: true,
    },
  });
  console.log('✅ Admin user created (elwan/321321)');

  // Create shipping rates
  for (const gov of egyptianGovernorates) {
    await prisma.shippingRate.upsert({
      where: { governorate: gov.governorate },
      update: { cost: gov.cost, nameAr: gov.nameAr },
      create: gov,
    });
  }
  console.log('✅ Shipping rates created for 27 governorates');

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });
  console.log('✅ Site settings initialized');

  // Create sample products
  const sampleProducts = [
    {
      nameEn: 'Classic Embroidered Sneaker',
      nameAr: 'كوتشي كلاسيك مطرز',
      descriptionEn: 'Handcrafted Egyptian sneaker with traditional embroidery patterns. Premium leather with custom stitching.',
      descriptionAr: 'كوتشي مصري مصنوع يدوياً بأنماط تطريز تقليدية. جلد فاخر مع خياطة مخصصة.',
      price: 850,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
      colors: ['#1a1a2e', '#e8d5b7', '#8B4513'],
      images: [],
      category: 'sneakers',
      isCustomizable: true,
      featured: true,
    },
    {
      nameEn: 'Heritage Line Shoe',
      nameAr: 'حذاء خط التراث',
      descriptionEn: 'Elegant shoe inspired by Egyptian heritage. Features hand-embroidered hieroglyphic motifs.',
      descriptionAr: 'حذاء أنيق مستوحى من التراث المصري. يتميز بزخارف هيروغليفية مطرزة يدوياً.',
      price: 1200,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
      colors: ['#2d2d2d', '#C9A96E', '#4a0e0e'],
      images: [],
      category: 'shoes',
      isCustomizable: true,
      featured: true,
    },
    {
      nameEn: 'Street Art Sneaker',
      nameAr: 'كوتشي ستريت آرت',
      descriptionEn: 'Bold street-style sneaker with contemporary Egyptian art embroidery. Limited edition design.',
      descriptionAr: 'كوتشي ستريت ستايل جريء مع تطريز فن مصري معاصر. تصميم إصدار محدود.',
      price: 950,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
      colors: ['#FFFFFF', '#1a1a2e', '#C9A96E'],
      images: [],
      category: 'sneakers',
      isCustomizable: true,
      featured: true,
    },
    {
      nameEn: 'Royal Embroidered Boot',
      nameAr: 'بوت ملكي مطرز',
      descriptionEn: 'Premium ankle boot with royal Egyptian embroidery. Handmade with genuine leather.',
      descriptionAr: 'بوت كاحل فاخر بتطريز ملكي مصري. مصنوع يدوياً من جلد طبيعي.',
      price: 1500,
      sizes: [39, 40, 41, 42, 43, 44, 45],
      colors: ['#2d1810', '#1a1a2e', '#C9A96E'],
      images: [],
      category: 'shoes',
      isCustomizable: false,
      featured: true,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({ data: product });
  }
  console.log('✅ Sample products created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
