import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import path from 'path';
import prisma from '@/lib/prisma';

// Global WhatsApp state
let sock: WASocket | null = null;
let qrCodeDataUrl: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
const pendingLogins = new Set<string>();

const AUTH_DIR = path.join(process.cwd(), 'whatsapp_auth');

export function getStatus() {
  return { connected: connectionStatus === 'connected', status: connectionStatus };
}

export function getQRCode() {
  return qrCodeDataUrl;
}

/**
 * Start WhatsApp connection in the background (non-blocking).
 * Returns immediately. Frontend should poll /api/whatsapp/status for QR code.
 */
export function startWhatsAppConnection(): { status: string } {
  // Already connected
  if (connectionStatus === 'connected' && sock) {
    return { status: 'connected' };
  }

  // Already connecting
  if (connectionStatus === 'connecting') {
    return { status: 'connecting' };
  }

  connectionStatus = 'connecting';
  qrCodeDataUrl = null;

  // Start connection in background — don't await
  initConnection().catch((err) => {
    console.error('WhatsApp init error:', err);
    connectionStatus = 'disconnected';
  });

  return { status: 'connecting' };
}

async function initConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: true,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
          color: { dark: '#1a1a2e', light: '#ffffff' },
        });
        console.log('📱 QR code generated, ready for scan');
      } catch (err) {
        console.error('QR generation error:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log('WhatsApp connection closed, reason:', statusCode);
      connectionStatus = 'disconnected';
      qrCodeDataUrl = null;
      
      if (shouldReconnect) {
        setTimeout(() => {
          startWhatsAppConnection();
        }, 3000);
      } else {
        sock = null;
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connected successfully!');
      connectionStatus = 'connected';
      qrCodeDataUrl = null;
    }
  });

  // Handle incoming messages (bot commands)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return; // Only process new incoming messages

    for (const msg of messages) {
      if (!msg.message) continue;
      
      const text = msg.message.conversation || 
        msg.message.extendedTextMessage?.text || '';
        
      const from = msg.key.remoteJid!;
      const isFromMe = msg.key.fromMe;

      console.log(`[WhatsApp] MSG from ${from} (me: ${isFromMe}): ${text}`);

      // Handle simple text messages if the user is in the login process
      if (pendingLogins.has(from) && !text.startsWith('/')) {
        await handleLoginAttempt(text, from);
        continue;
      }

      // If it's a command or a number choice (1-9), handle it
      if (text.startsWith('/') || /^[1-9]$/.test(text.trim())) {
        await handleBotCommand(text, from);
      }
    }
  });
}

export async function disconnectWhatsApp() {
  if (sock) {
    await sock.logout().catch(() => {});
    sock = null;
  }
  connectionStatus = 'disconnected';
  qrCodeDataUrl = null;
  
  const fs = await import('fs/promises');
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
  } catch {}
}

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!sock || connectionStatus !== 'connected') {
    console.log('WhatsApp not connected, message not sent');
    return false;
  }

  try {
    let jid = to;
    if (!jid.includes('@')) {
      jid = `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    }
    
    await sock.sendMessage(jid, { text: message });
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

// ─── Bot Commands & Auth ────────────────────────────────────────

import bcrypt from 'bcryptjs';

async function handleLoginAttempt(text: string, from: string) {
  pendingLogins.delete(from); // Remove from pending state

  const [username, password] = text.split(':');
  if (!username || !password) {
    await sendWhatsAppMessage(from, '❌ صيغة غير صحيحة. من فضلك ابعت الأمر /login مرة تانية واكتب البيانات صح: `username:password`');
    return;
  }

  try {
    // Check if user exists in DB
    const user = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!user || user.role !== 'ADMIN') {
      await sendWhatsAppMessage(from, '❌ بيانات تسجيل الدخول غير صحيحة أو الحساب ليس آدمن.');
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      await sendWhatsAppMessage(from, '❌ بيانات تسجيل الدخول غير صحيحة أو الحساب ليس آدمن.');
      return;
    }

    // Success! Update DB to bind this WhatsApp number to the Admin account
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: from },
    });

    await sendWhatsAppMessage(from, `✅ تم التوصيل بنجاح، أهلاً بيك يا ${user.username}!\nأنا حفظت رقمك عندي كآدمن للمتجر ومش هتحتاج تعمل تسجيل دخول تاني.\n\nاكتب /help عشان تشوف قائمة الأوامر المتاحة.`);

  } catch (err) {
    console.error('Login verify error:', err);
    await sendWhatsAppMessage(from, '❌ حصل مشكلة أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.');
  }
}

async function handleBotCommand(text: string, from: string) {
  const parts = text.trim().split(/\s+/);
  let command = parts[0].toLowerCase();

  // 1. Check if user is trying to login
  if (command === '/login') {
    pendingLogins.add(from);
    await sendWhatsAppMessage(from, '🔐 من فضلك ابعت يوزرنيم وباسورد الآدمن بالشكل الآتي:\n\n`username:password`\n\n*(مثلاً: omar:123456)*');
    return;
  }

  try {
    // 2. Authenticate all other commands
    const adminUser = await prisma.user.findFirst({
      where: {
        phone: from,
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      await sendWhatsAppMessage(from, '⛔ غير مصرح لك! من فضلك ابعت الأمر `/login` لتسجيل الدخول كآدمن الأول.');
      return;
    }

    // Map numbers to commands
    if (command === '1') command = '/help';
    if (command === '2') command = '/orders';
    if (command === '3') command = '/products';
    if (command === '4') command = '/stats';
    if (command === '5') command = '/report';

    // 3. Process authorized commands
    switch (command) {
      case '/help':
      case '/menu':
        await sendWhatsAppMessage(from, 
          `🤖 *مرحباً بك في لوحة تحكم Elwan!*\nمن فضلك أرسل رقم الأمر أو اكتبه:\n\n` +
          `1️⃣ القائمة الرئيسية (/help)\n` +
          `2️⃣ أحدث الطلبات (/orders)\n` +
          `3️⃣ عرض المنتجات (/products)\n` +
          `4️⃣ إحصائيات سريعة (/stats)\n` +
          `5️⃣ استخراج تقرير سريع (/report)\n\n` +
          `*أوامر إضافية:*\n` +
          `✏️ تعديل منتج: \`/edit <id>\`\n` +
          `❌ حذف منتج: \`/delete <id>\`\n` +
          `🔍 عرض طلب: \`/order <id>\`\n` +
          `🔄 تغيير حالة الطلب: \`/status <id> confirmed|shipped|delivered\`\n` +
          `🏷️ كود خصم: \`/discount add <code> <percent>\``
        );
        break;
      case '/products':
      case '/get': // Keep backwards compatibility
        await handleProductsCommand(from);
        break;
      case '/orders':
        await handleOrdersCommand(from);
        break;
      case '/stats':
        await handleStatsCommand(from);
        break;
      case '/report':
        await handleReportCommand(from);
        break;
      case '/edit':
        await handleEditCommand(parts.slice(1), from);
        break;
      case '/delete':
        await handleDeleteCommand(parts[1], from);
        break;
      case '/order':
        await handleOrderCommand(parts[1], from);
        break;
      case '/status':
        await handleStatusCommand(parts[1], parts[2], from);
        break;
      case '/discount':
        await handleDiscountCommand(parts.slice(1), from);
        break;
      case '/stock':
        await handleStockCommand(parts[1], parts[2], from);
        break;
      default:
        await sendWhatsAppMessage(from, '❓ أمر غير معروف. ابعت رقم 1 لفتح القائمة.');
    }
  } catch (error) {
    console.error('Bot command error:', error);
    await sendWhatsAppMessage(from, '❌ حدث خطأ أثناء تنفيذ الأمر. جرب تاني.');
  }
}

async function handleProductsCommand(from: string) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 15 });
  if (products.length === 0) { await sendWhatsAppMessage(from, '📦 لا يوجد منتجات مسجلة.'); return; }
  
  const list = products.map((p: any, i: number) => 
    `*${i + 1}. ${p.nameAr}*\n💰 ${p.price} ج.م | ${p.inStock ? '✅ متاح' : '❌ نافذ'}\n🔢 ID: \`${p.id.slice(-8)}\``
  ).join('\n\n');
  
  await sendWhatsAppMessage(from, `👟 *أحدث المنتجات (${products.length}):*\n\n${list}`);
}

async function handleOrdersCommand(from: string) {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  if (orders.length === 0) { await sendWhatsAppMessage(from, '📦 مفيش طلبات لسه.'); return; }
  
  const list = orders.map((o: any, i: number) => {
    let emoji = '⏳';
    if (o.orderStatus === 'confirmed') emoji = '👍';
    if (o.orderStatus === 'shipped') emoji = '🚚';
    if (o.orderStatus === 'delivered') emoji = '✅';
    if (o.orderStatus === 'cancelled') emoji = '❌';

    return `*${i + 1}. طلب #${o.id.slice(-6)}* ${emoji}\n👤 ${o.customerName}\n💰 ${o.total} ج.م | ${o.orderStatus}`;
  }).join('\n\n');
  
  await sendWhatsAppMessage(from, `📦 *أحدث 10 طلبات:*\n\n${list}\n\n*لمشاهدة التفاصيل ابعت /order <ID>*`);
}

async function handleStatsCommand(from: string) {
  const orders = await prisma.order.findMany();
  const productCount = await prisma.product.count();
  const revenue = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'confirmed').reduce((s: number, o: any) => s + o.total, 0);
  
  await sendWhatsAppMessage(from,
    `📊 *إحصائيات متجر Elwan:*\n\n` +
    `📦 إجمالي الطلبات: *${orders.length}*\n` +
    `💰 المبيعات المؤكدة (Revenue): *${revenue.toLocaleString()} ج.م*\n` +
    `👟 إجمالي عدد المنتجات: *${productCount}*`
  );
}

async function handleReportCommand(from: string) {
  await sendWhatsAppMessage(from, '⏳ جاري إنشاء التقرير المالي...');
  
  const orders = await prisma.order.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } }
  });

  const header = 'Order ID,Date,Customer,Phone,Governorate,Status,Total EGP,Items\n';
  const csvData = orders.map(o => {
    const items = o.items.map(i => `${i.product.nameEn} (x${i.quantity})`).join('|');
    return `${o.id.slice(-6)},${o.createdAt.toISOString().split('T')[0]},"${o.customerName}",="${o.phone}","${o.governorate}",${o.orderStatus},${o.total},"${items}"`;
  }).join('\n');

  const csvContent = header + csvData;

  try {
    let jid = from;
    if (!jid.includes('@')) jid = `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    
    await sock?.sendMessage(jid, {
      document: Buffer.from(csvContent, 'utf-8'),
      mimetype: 'text/csv',
      fileName: `Elwan_Orders_${new Date().toISOString().split('T')[0]}.csv`,
      caption: '📊 تقرير مبيعات متجر علوان (Excel/CSV)'
    });
  } catch (error) {
    console.error('Failed to send report doc:', error);
    await sendWhatsAppMessage(from, '❌ فشل إرسال ملف التقرير.');
  }
}

async function handleEditCommand(args: string[], from: string) {
  if (!args[0]) { await sendWhatsAppMessage(from, '❓ الاستخدام: /edit <ID>'); return; }
  const product = await prisma.product.findFirst({ where: { id: { endsWith: args[0] } } });
  if (!product) { await sendWhatsAppMessage(from, '❌ المنتج غير موجود.'); return; }
  await sendWhatsAppMessage(from,
    `✏️ *${product.nameAr}*\n💰 ${product.price} ج.م\n📂 ${product.category}\n${product.inStock ? '✅ متاح' : '❌ نافذ'}\n\nيُرجى التعديل من الـ Dashboard`
  );
}

async function handleDeleteCommand(id: string | undefined, from: string) {
  if (!id) { await sendWhatsAppMessage(from, '❓ الاستخدام: /delete <ID>'); return; }
  const product = await prisma.product.findFirst({ where: { id: { endsWith: id } } });
  if (!product) { await sendWhatsAppMessage(from, '❌ غير موجود.'); return; }
  await prisma.product.delete({ where: { id: product.id } });
  await sendWhatsAppMessage(from, `✅ تم مسح المنتج نهائياً: *${product.nameAr}*`);
}

async function handleOrderCommand(id: string | undefined, from: string) {
  if (!id) { await sendWhatsAppMessage(from, '❓ الاستخدام: /order <ID>'); return; }
  const order = await prisma.order.findFirst({
    where: { id: { endsWith: id } },
    include: { items: { include: { product: true } } },
  });
  if (!order) { await sendWhatsAppMessage(from, '❌ الطلب غير موجود.'); return; }
  const items = order.items.map((i: any) => `• ${i.product.nameAr} x${i.quantity}`).join('\n');
  await sendWhatsAppMessage(from,
    `📦 *أوردر #${order.id.slice(-6)}*\n\n` +
    `👤 العميل: ${order.customerName}\n` +
    `📱 رقم الموبايل: ${order.phone}\n` +
    `📍 المحافظة: ${order.governorate}\n` +
    `🏠 العنوان: ${order.address}\n\n` +
    `🛒 *الـمُشـتـريـات:*\n${items}\n\n` +
    `💰 *الإجمالي:* ${order.total} ج.م\n` +
    `الحالة الحالية: *${order.orderStatus}*`
  );
}

async function handleStatusCommand(orderId: string | undefined, status: string | undefined, from: string) {
  if (!orderId || !status) { await sendWhatsAppMessage(from, '❓ /status <id> pending|confirmed|shipped|delivered|cancelled'); return; }
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) { await sendWhatsAppMessage(from, `❌ استخدم الحالات الآتية فقط:\n${valid.join('\n')}`); return; }
  const order = await prisma.order.findFirst({ where: { id: { endsWith: orderId } } });
  if (!order) { await sendWhatsAppMessage(from, '❌ غير موجود.'); return; }
  await prisma.order.update({ where: { id: order.id }, data: { orderStatus: status } });
  await sendWhatsAppMessage(from, `✅ أوردر #${order.id.slice(-6)} بقت حالته: *${status}*`);
}

async function handleDiscountCommand(args: string[], from: string) {
  if (args[0] === 'add' && args[1] && args[2]) {
    await prisma.discountCode.create({ data: { code: args[1].toUpperCase(), percentage: parseFloat(args[2]) } });
    await sendWhatsAppMessage(from, `✅ تم إضافة كود *\`${args[1].toUpperCase()}\`* بخصم ${args[2]}%`);
  } else {
    await sendWhatsAppMessage(from, '❓ /discount add <CODE> <percent>');
  }
}

async function handleStockCommand(id: string | undefined, toggle: string | undefined, from: string) {
  if (!id || !toggle) { await sendWhatsAppMessage(from, '❓ /stock <id> on/off'); return; }
  const product = await prisma.product.findFirst({ where: { id: { endsWith: id } } });
  if (!product) { await sendWhatsAppMessage(from, '❌ غير موجود.'); return; }
  const inStock = toggle.toLowerCase() === 'on';
  await prisma.product.update({ where: { id: product.id }, data: { inStock } });
  await sendWhatsAppMessage(from, `✅ *${product.nameAr}* ${inStock ? 'متاح الآن ✅' : 'نفذ الكمية ❌'}`);
}

export async function notifyAdminsNewOrder(orderId: string) {
  if (!sock || connectionStatus !== 'connected') return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });
    if (!order) return;

    const admins = await prisma.user.findMany({ 
      where: { role: 'ADMIN', phone: { not: null } } 
    });
    
    if (admins.length === 0) return;

    const itemsText = order.items.map(i => `• ${i.product.nameAr} x${i.quantity}`).join('\n');
    const msg = `🔔 *في طلب جـديـد!* 🚀\n\n` +
      `📦 *الكود:* #${order.id.slice(-6)}\n` +
      `👤 *العميل:* ${order.customerName}\n` +
      `📞 *تليفون:* ${order.phone}\n` +
      `📍 *العنوان:* ${order.governorate}\n\n` +
      `🛒 *المنتجات:*\n${itemsText}\n\n` +
      `💰 *الإجمالي:* ${order.total} ج.م\n\n` +
      `*لتأكيد الطلب بسرعة ابعت:*\n\`/status ${order.id.slice(-6)} confirmed\``;

    for (const admin of admins) {
      if (admin.phone) {
        await sendWhatsAppMessage(admin.phone, msg);
      }
    }
  } catch (error) {
    console.error('Error auto-notifying admins:', error);
  }
}
