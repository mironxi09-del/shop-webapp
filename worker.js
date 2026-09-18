// The catalogue is inserted during packaging. No bot token belongs in this file.
const CATALOG = {
  "Свитер оверсайз": {
    "price": 2500,
    "limit": 99
  },
  "Худи с капюшоном": {
    "price": 3200,
    "limit": 99
  },
  "Кардиган": {
    "price": 4100,
    "limit": 99
  },
  "Водолазка": {
    "price": 2800,
    "limit": 99
  },
  "Белая классика": {
    "price": 1200,
    "limit": 99
  },
  "Поло": {
    "price": 1800,
    "limit": 99
  },
  "С принтом": {
    "price": 1500,
    "limit": 99
  },
  "Лонгслив": {
    "price": 1900,
    "limit": 99
  },
  "Джинсы": {
    "price": 3500,
    "limit": 99
  },
  "Карго": {
    "price": 4200,
    "limit": 99
  },
  "Спортивные": {
    "price": 2800,
    "limit": 99
  },
  "Чинос": {
    "price": 3900,
    "limit": 99
  },
  "Кеды": {
    "price": 3900,
    "limit": 99
  },
  "Ботинки": {
    "price": 6200,
    "limit": 99
  },
  "Кроссовки": {
    "price": 5500,
    "limit": 99
  },
  "Сандалии": {
    "price": 2300,
    "limit": 99
  },
  "Сумка": {
    "price": 2500,
    "limit": 99
  },
  "Ремень": {
    "price": 1200,
    "limit": 99
  },
  "Шарф": {
    "price": 900,
    "limit": 99
  },
  "Перчатки": {
    "price": 700,
    "limit": 99
  },
  "Эксклюзивный свитер": {
    "price": 8900,
    "limit": 5
  },
  "Люкс худи": {
    "price": 12000,
    "limit": 3
  },
  "Кардиган из кашемира": {
    "price": 15000,
    "limit": 2
  },
  "Водолазка премиум": {
    "price": 9500,
    "limit": 4
  },
  "Футболка ограниченной серии": {
    "price": 5500,
    "limit": 6
  },
  "Поло от кутюр": {
    "price": 7200,
    "limit": 4
  },
  "Футболка с авторским принтом": {
    "price": 6800,
    "limit": 3
  },
  "Лонгслив премиум": {
    "price": 6200,
    "limit": 5
  },
  "Джинсы ручной работы": {
    "price": 12500,
    "limit": 2
  },
  "Карго из итальянской ткани": {
    "price": 15000,
    "limit": 3
  },
  "Спортивные штаны люкс": {
    "price": 9800,
    "limit": 4
  },
  "Чинос премиум": {
    "price": 11200,
    "limit": 2
  },
  "Кеды от известного бренда": {
    "price": 14900,
    "limit": 3
  },
  "Ботинки ручной работы": {
    "price": 22000,
    "limit": 2
  },
  "Кроссовки лимитированной серии": {
    "price": 18500,
    "limit": 4
  },
  "Сандалии из натуральной кожи": {
    "price": 8300,
    "limit": 5
  },
  "Сумка из крокодиловой кожи": {
    "price": 25000,
    "limit": 1
  },
  "Ремень с золотой пряжкой": {
    "price": 6500,
    "limit": 6
  },
  "Шарф из кашемира": {
    "price": 4900,
    "limit": 8
  },
  "Перчатки из натуральной кожи": {
    "price": 3700,
    "limit": 10
  }
};
const WEBAPP_URL = 'https://mironxi09-del.github.io/shop-webapp/index.html';
const keyboard = {keyboard: [[{text:'🛍 Открыть магазин',web_app:{url:WEBAPP_URL}}],[{text:'📍 Мой адрес'}]],resize_keyboard:true};

export function validateOrder(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 4096) throw Error('payload');
  const d = JSON.parse(raw);
  if (!d || Array.isArray(d) || d.version !== 1 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.order_id)) throw Error('format');
  for (const [key,min,max] of [['name',1,100],['address',5,500],['email',3,120]]) {
    if (typeof d[key] !== 'string') throw Error('field');
    d[key] = d[key].trim();
    if (d[key].length < min || d[key].length > max) throw Error('length');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !Array.isArray(d.items) || !d.items.length || d.items.length > 40) throw Error('items');
  let total=0; const totals=new Map(); const lines=[];
  for (const row of d.items) {
    const p = row && Object.hasOwn(CATALOG,row.name) ? CATALOG[row.name] : null;
    if (!p || !Number.isInteger(row.qty) || row.qty < 1 || row.qty > 99 || !['S','M','L','XL'].includes(row.size)) throw Error('item');
    const qty=(totals.get(row.name)||0)+row.qty;
    if (qty>p.limit) throw Error('quantity');
    totals.set(row.name,qty);
    total+=p.price*row.qty;
    lines.push(`• ${row.name}, размер ${row.size} × ${row.qty}: ${p.price*row.qty} ₽`);
  }
  return {...d,order_id:d.order_id.toLowerCase(),total,lines:lines.join('\n')};
}

async function telegram(env, method, body) {
  const response=await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)
  });
  const result=await response.json();
  if (!result.ok) throw Error('telegram_'+(result.error_code||response.status));
  return result.result;
}
const send=(env,chat_id,text,extra={})=>telegram(env,'sendMessage',{chat_id,text,...extra});

async function processUpdate(update,env) {
  const m=update?.message;
  if (!m || m.chat?.type!=='private' || !Number.isSafeInteger(m.from?.id)) return;
  const user=m.from;
  if (/^\/start(?:@\w+)?(?:\s|$)/.test(m.text||'')) {
    await send(env,m.chat.id,'Откройте магазин кнопкой под полем ввода. Подтверждение заказа придёт в этот чат.',{reply_markup:keyboard});
    return;
  }
  if (m.text==='📍 Мой адрес' || /^\/address(?:@\w+)?$/.test(m.text||'')) {
    const row=await env.DB.prepare('SELECT address FROM orders WHERE user_id=? AND state=? ORDER BY created_at DESC LIMIT 1').bind(user.id,'sent').first();
    await send(env,m.chat.id,row?'Ваш адрес:\n'+row.address:'Вы ещё не оформляли заказ.');
    return;
  }
  if (!m.web_app_data) return;
  let d;
  try { d=validateOrder(m.web_app_data.data); }
  catch { await send(env,m.chat.id,'Не удалось принять заказ: проверьте поля и количество товаров.',{reply_markup:keyboard});return; }
  const adminText=`НОВЫЙ ЗАКАЗ № ${d.order_id}\nПокупатель: ${d.name}\nTelegram: ${user.username?'@'+user.username:'username не указан'}; ID: ${user.id}\nАдрес: ${d.address}\nEmail: ${d.email}\n\n${d.lines}\n\nИтого: ${d.total} ₽\nНаличие и доставку подтвердите покупателю.`;
  if (adminText.length>4000) {await send(env,m.chat.id,'Заказ слишком длинный. Разделите его на несколько заказов.');return;}
  // Unique ID prevents duplicate delivery for already acknowledged orders.
  await env.DB.prepare('INSERT OR IGNORE INTO orders (user_id,order_id,address,state,created_at,locked_at,notified) VALUES (?,?,?,\'pending\',?,0,0)').bind(user.id,d.order_id,d.address,Date.now()).run();
  const row=await env.DB.prepare('SELECT state,notified FROM orders WHERE user_id=? AND order_id=?').bind(user.id,d.order_id).first();
  if (row.state!=='sent') {
    const now=Date.now();
    const claim=await env.DB.prepare("UPDATE orders SET state='sending',locked_at=? WHERE user_id=? AND order_id=? AND (state='pending' OR (state='sending' AND locked_at<?))").bind(now,user.id,d.order_id,now-90000).run();
    if (!claim.meta.changes) throw Error('order_busy');
    try {await send(env,env.ADMIN_CHAT_ID,adminText);}
    catch (e) {
      await env.DB.prepare("UPDATE orders SET state='pending' WHERE user_id=? AND order_id=?").bind(user.id,d.order_id).run();
      throw e;
    }
    await env.DB.prepare("UPDATE orders SET state='sent' WHERE user_id=? AND order_id=?").bind(user.id,d.order_id).run();
  }
  if (!row.notified) {
    await send(env,m.chat.id,`✅ Заказ № ${d.order_id} передан администратору.\nСумма: ${d.total} ₽\nАдрес: ${d.address}\nОжидайте подтверждения наличия и доставки. Корзину можно очистить в настройках магазина.`,{reply_markup:keyboard});
    await env.DB.prepare('UPDATE orders SET notified=1 WHERE user_id=? AND order_id=?').bind(user.id,d.order_id).run();
  }
}

export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    if (request.method==='GET' && path==='/') return new Response('Telegram shop webhook.');
    if (request.method!=='POST' || path!=='/telegram') return new Response('Not found',{status:404});
    if (!env.WEBHOOK_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==env.WEBHOOK_SECRET) return new Response('Forbidden',{status:403});
    if (!env.BOT_TOKEN || !/^-?\d+$/.test(env.ADMIN_CHAT_ID||'') || !env.DB) return new Response('Not configured',{status:503});
    let update;
    try {
      const raw=await request.text();
      if (new TextEncoder().encode(raw).length>65536) return new Response('Too large',{status:413});
      update=JSON.parse(raw);
    } catch {return new Response('Bad request',{status:400});}
    try {await processUpdate(update,env);return new Response('OK');}
    catch {
      // Telegram retries a failed webhook. Never log tokens, payloads or addresses.
      console.error('Telegram update processing failed');
      return new Response('Retry later',{status:503});
    }
  }
};

