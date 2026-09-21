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
const keyboard = {keyboard: [[{text:'🛍 Открыть магазин',web_app:{url:WEBAPP_URL}}],[{text:'📦 Мои заказы'},{text:'❓ Помощь'}],[{text:'📍 Мой адрес'},{text:'⚙️ Админ-панель'}]],resize_keyboard:true};
const statuses={sent:'🆕 Новый',processing:'🟡 В работе',shipped:'🚚 В доставке',done:'✅ Завершён',cancelled:'❌ Отменён'};
const statusButtons=id=>({inline_keyboard:[[{text:'🟡 В работе',callback_data:`status:${id}:processing`},{text:'🚚 Доставка',callback_data:`status:${id}:shipped`}],[{text:'✅ Завершён',callback_data:`status:${id}:done`},{text:'❌ Отменить',callback_data:`status:${id}:cancelled`}]]});
const isAdmin=(env,id)=>String(id)===String(env.ADMIN_CHAT_ID);
const INVENTORY_PRODUCTS=Object.entries(CATALOG).map(([name,product])=>({name,initial:product.limit,limited:product.limit<99}));
const corsHeaders={'Access-Control-Allow-Origin':'https://mironxi09-del.github.io','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'};
async function ensureInventory(env) { await env.DB.prepare('CREATE TABLE IF NOT EXISTS inventory (name TEXT PRIMARY KEY, stock INTEGER NOT NULL CHECK(stock>=0), updated_at INTEGER NOT NULL)').run(); const now=Date.now(); await env.DB.batch(INVENTORY_PRODUCTS.map(item=>env.DB.prepare('INSERT OR IGNORE INTO inventory (name,stock,updated_at) VALUES (?,?,?)').bind(item.name,item.initial,now))); }
async function inventory(env) { await ensureInventory(env); const rows=(await env.DB.prepare('SELECT name,stock FROM inventory').all()).results||[]; return Object.fromEntries(rows.map(row=>[row.name,row.stock])); }
async function ensureCommerce(env) {
  await ensureInventory(env);
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS balances (user_id INTEGER PRIMARY KEY, balance INTEGER NOT NULL DEFAULT 0 CHECK(balance>=0), updated_at INTEGER NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS promo_codes (code TEXT PRIMARY KEY, discount_type TEXT NOT NULL CHECK(discount_type IN (\'percent\',\'fixed\')), discount_value INTEGER NOT NULL CHECK(discount_value>0), max_activations INTEGER NOT NULL CHECK(max_activations>0), used_count INTEGER NOT NULL DEFAULT 0 CHECK(used_count>=0), valid_until INTEGER NOT NULL DEFAULT 0, min_order_total INTEGER NOT NULL DEFAULT 0 CHECK(min_order_total>=0), active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL)')
  ]);
}
async function balanceFor(env,userId) { await ensureCommerce(env); await env.DB.prepare('INSERT OR IGNORE INTO balances (user_id,balance,updated_at) VALUES (?,?,?)').bind(userId,0,Date.now()).run(); return (await env.DB.prepare('SELECT balance FROM balances WHERE user_id=?').bind(userId).first())?.balance||0; }
async function creditBalance(env,userId,amount) { await ensureCommerce(env); await env.DB.prepare('INSERT OR IGNORE INTO balances (user_id,balance,updated_at) VALUES (?,?,?)').bind(userId,0,Date.now()).run(); await env.DB.prepare('UPDATE balances SET balance=balance+?,updated_at=? WHERE user_id=?').bind(amount,Date.now(),userId).run(); return balanceFor(env,userId); }
async function debitBalance(env,userId,amount) { await ensureCommerce(env); await env.DB.prepare('INSERT OR IGNORE INTO balances (user_id,balance,updated_at) VALUES (?,?,?)').bind(userId,0,Date.now()).run(); const result=await env.DB.prepare('UPDATE balances SET balance=balance-?,updated_at=? WHERE user_id=? AND balance>=?').bind(amount,Date.now(),userId,amount).run(); return Boolean(result.meta.changes); }
async function redeemPromo(env,code,total) {
  if (!code) return {code:'',discount:0};
  await ensureCommerce(env); const now=Date.now(); const promo=await env.DB.prepare('SELECT * FROM promo_codes WHERE code=?').bind(code).first();
  if (!promo || !promo.active || promo.used_count>=promo.max_activations || (promo.valid_until && promo.valid_until<now)) throw Error('promo_invalid');
  if (total<promo.min_order_total) throw Error('promo_min');
  const discount=Math.min(total,promo.discount_type==='percent'?Math.floor(total*promo.discount_value/100):promo.discount_value);
  const claim=await env.DB.prepare('UPDATE promo_codes SET used_count=used_count+1 WHERE code=? AND active=1 AND used_count<max_activations AND (valid_until=0 OR valid_until>=?)').bind(code,now).run();
  if (!claim.meta.changes) throw Error('promo_invalid');
  return {code,discount};
}
const releasePromo=(env,code)=>code?env.DB.prepare('UPDATE promo_codes SET used_count=MAX(0,used_count-1) WHERE code=?').bind(code).run():Promise.resolve();
function promoErrorText(error) { return error==='promo_min'?'Промокод действует только при большей сумме заказа.':'Промокод недействителен, закончился или уже использован.'; }
async function webAppUser(initData,env) {
  if (typeof initData!=='string' || initData.length<20 || initData.length>8192) throw Error('init_data');
  const params=new URLSearchParams(initData), hash=params.get('hash'), authDate=Number(params.get('auth_date'));
  if (!hash || !Number.isSafeInteger(authDate) || Math.abs(Date.now()/1000-authDate)>7*24*60*60) throw Error('init_data');
  params.delete('hash'); const check=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n'); const bytes=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',bytes.encode('WebAppData'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const secret=await crypto.subtle.sign('HMAC',key,bytes.encode(env.BOT_TOKEN));
  const verifyKey=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=[...new Uint8Array(await crypto.subtle.sign('HMAC',verifyKey,bytes.encode(check)))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if (signature!==hash) throw Error('init_data');
  const user=JSON.parse(params.get('user')||'{}'); if (!Number.isSafeInteger(user?.id)) throw Error('init_data'); return user;
}
async function reserveStock(env,d) { const totals=new Map(); for (const item of d.items) totals.set(item.name,(totals.get(item.name)||0)+item.qty); if (!totals.size) return []; await ensureInventory(env); const reserved=[]; try { for (const [name,qty] of totals) { const result=await env.DB.prepare('UPDATE inventory SET stock=stock-?,updated_at=? WHERE name=? AND stock>=?').bind(qty,Date.now(),name,qty).run(); if (!result.meta.changes) throw Error('out_of_stock'); reserved.push([name,qty]); } return reserved; } catch (error) { await env.DB.batch(reserved.map(([name,qty])=>env.DB.prepare('UPDATE inventory SET stock=stock+?,updated_at=? WHERE name=?').bind(qty,Date.now(),name))); throw error; } }
async function changeStock(env,index,delta) { const item=INVENTORY_PRODUCTS[index]; if (!item || !Number.isInteger(delta) || ![-1,1].includes(delta)) throw Error('stock_action'); await ensureInventory(env); const sql=delta>0?'UPDATE inventory SET stock=stock+1,updated_at=? WHERE name=?':'UPDATE inventory SET stock=stock-1,updated_at=? WHERE name=? AND stock>0'; const result=await env.DB.prepare(sql).bind(Date.now(),item.name).run(); if (!result.meta.changes && delta<0) throw Error('stock_empty'); }
async function stockPanel(env,page=0) {
  const stock=await inventory(env); const pageSize=8; const totalPages=Math.ceil(INVENTORY_PRODUCTS.length/pageSize); page=Math.max(0,Math.min(Number(page)||0,totalPages-1)); const offset=page*pageSize; const items=INVENTORY_PRODUCTS.slice(offset,offset+pageSize);
  const text='<b>⚙️ Управление остатками</b>\nСтраница '+(page+1)+' из '+totalPages+'\n\n'+items.map((item,index)=>{const number=offset+index+1; return number+'. '+item.name+' — <b>'+String(stock[item.name]??0)+' шт.</b>'+(item.limited?'  • лимитированный':'');}).join('\n')+'\n\nКнопки меняют остаток на 1 штуку.';
  const rows=items.map((item,index)=>{const number=offset+index; return [{text:'− 1',callback_data:'stock:'+number+':-1:'+page},{text:'+ 1',callback_data:'stock:'+number+':1:'+page}];});
  rows.push([{text:'◀️',callback_data:'stockpage:'+(page-1)},{text:(page+1)+' / '+totalPages,callback_data:'stockpage:'+page},{text:'▶️',callback_data:'stockpage:'+(page+1)}]);
  return {text,reply_markup:{inline_keyboard:rows}};
}
async function showStockPanel(env,chat) { const panel=await stockPanel(env,0); await send(env,chat,panel.text,{parse_mode:'HTML',reply_markup:panel.reply_markup}); }

export function validateOrder(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 4096) throw Error('payload');
  const d = JSON.parse(raw);
  if (!d || Array.isArray(d) || ![1,2].includes(d.version) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.order_id)) throw Error('format');
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
  const promo_code=typeof d.promo_code==='string'?d.promo_code.trim().toUpperCase():'';
  if (promo_code && !/^[A-Z0-9_-]{3,24}$/.test(promo_code)) throw Error('promo');
  return {...d,order_id:d.order_id.toLowerCase(),promo_code,total,lines:lines.join('\n')};
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

async function showOrders(env,chat) {
  const rows=(await env.DB.prepare('SELECT order_id,state,address,created_at FROM orders ORDER BY created_at DESC LIMIT 20').all()).results||[];
  const text=rows.length?'<b>Последние 20 заказов</b>\n\n'+rows.map((x,i)=>`${i+1}. <b>#${x.order_id.slice(0,8)}</b> — ${statuses[x.state]||x.state}\n📍 ${x.address}`).join('\n\n'):'Заказов пока нет.';
  await send(env,chat,text,{parse_mode:'HTML'});
}
async function showPromos(env,chat) {
  await ensureCommerce(env); const rows=(await env.DB.prepare('SELECT code,discount_type,discount_value,max_activations,used_count,valid_until,min_order_total,active FROM promo_codes ORDER BY created_at DESC LIMIT 20').all()).results||[];
  const text=rows.length?'<b>🎟 Промокоды</b>\n\n'+rows.map(x=>`<b>${x.code}</b> — ${x.discount_type==='percent'?x.discount_value+'%':x.discount_value+' ₽'}\nАктивации: ${x.used_count}/${x.max_activations} · ${x.active?'активен':'выключен'}\n${x.valid_until?'До: '+new Date(x.valid_until).toLocaleDateString('ru-RU'):'Без срока'}${x.min_order_total?' · от '+x.min_order_total+' ₽':''}`).join('\n\n'):'Промокодов пока нет.';
  await send(env,chat,text,{parse_mode:'HTML'});
}
async function createPromo(env,parts) {
  const [command,rawCode,type,rawValue,rawUses,rawDays,rawMin]=parts;
  if (command!=='add' || !/^[A-Z0-9_-]{3,24}$/.test(rawCode||'') || !['percent','fixed'].includes(type)) throw Error('promo_command');
  const value=Number(rawValue), uses=Number(rawUses), days=Number(rawDays), min=Number(rawMin||0);
  if (!Number.isInteger(value) || value<1 || (type==='percent'&&value>100) || !Number.isInteger(uses) || uses<1 || uses>100000 || !Number.isInteger(days) || days<0 || days>3650 || !Number.isInteger(min) || min<0 || min>100000000) throw Error('promo_command');
  await ensureCommerce(env); const now=Date.now(); const validUntil=days?now+days*86400000:0;
  await env.DB.prepare('INSERT INTO promo_codes (code,discount_type,discount_value,max_activations,used_count,valid_until,min_order_total,active,created_at) VALUES (?,?,?,?,0,?,?,1,?)').bind(rawCode,type,value,uses,validUntil,min,now).run();
  return {code:rawCode,type,value,uses,validUntil,min};
}
async function processCallback(q,env) {
  const callbackId=q?.id; if (!callbackId) return;
  if (!isAdmin(env,q?.from?.id) || !isAdmin(env,q?.message?.chat?.id)) return telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Доступ только для администратора',show_alert:true});
  const [kind,id,value,page]=(q.data||'').split(':');
  try {
    if (kind==='stockpage') { const panel=await stockPanel(env,Number(id)); await telegram(env,'editMessageText',{chat_id:q.message.chat.id,message_id:q.message.message_id,text:panel.text,parse_mode:'HTML',reply_markup:panel.reply_markup}); return telegram(env,'answerCallbackQuery',{callback_query_id:callbackId}); }
    if (kind==='stock') { await changeStock(env,Number(id),Number(value)); const panel=await stockPanel(env,Number(page)); await telegram(env,'editMessageText',{chat_id:q.message.chat.id,message_id:q.message.message_id,text:panel.text,parse_mode:'HTML',reply_markup:panel.reply_markup}); return telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Остаток обновлён'}); }
    if (kind!=='status' || !statuses[value] || !/^[0-9a-f-]{36}$/i.test(id)) return telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Некорректная кнопка',show_alert:true});
    const row=await env.DB.prepare('SELECT user_id FROM orders WHERE order_id=?').bind(id).first(); if (!row) return telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Заказ не найден',show_alert:true});
    await env.DB.prepare('UPDATE orders SET state=? WHERE order_id=?').bind(value,id).run(); await telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:'Статус: '+statuses[value]}); await send(env,q.message.chat.id,'Заказ #'+id.slice(0,8)+': '+statuses[value]); await send(env,row.user_id,'📦 Статус заказа № '+id.slice(0,8)+' изменён: <b>'+statuses[value]+'</b>',{parse_mode:'HTML',reply_markup:keyboard});
  } catch (error) { console.error('Admin callback failed'); await telegram(env,'answerCallbackQuery',{callback_query_id:callbackId,text:value==='-1'?'Товар уже закончился':'Не удалось выполнить действие',show_alert:true}).catch(()=>{}); }
}
async function processUpdate(update,env) {
  if (update?.callback_query) return processCallback(update.callback_query,env);
  const m=update?.message;
  if (!m || m.chat?.type!=='private' || !Number.isSafeInteger(m.from?.id)) return;
  // An administrator can send /start to repair a webhook created by an older version.
  if (/^\/start(?:@\w+)?(?:\s|$)/.test(m.text||'')) try {
    await telegram(env,'setWebhook',{
      url:'https://shop-telegram-bot.mironxi09.workers.dev/telegram',
      secret_token:env.WEBHOOK_SECRET,
      allowed_updates:['message','callback_query'],
      drop_pending_updates:false
    });
  } catch (error) {
    console.error('Webhook refresh failed');
  }
  const user=m.from;
  if (m.text==='📦 Мои заказы' || /^\/myorders(?:@\w+)?$/.test(m.text||'')) {
    const rows=(await env.DB.prepare('SELECT order_id,state,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 10').bind(user.id).all()).results||[];
    const text=rows.length?'📦 Ваши последние заказы\n\n'+rows.map(row=>'№ '+row.order_id.slice(0,8)+' · '+new Date(row.created_at).toLocaleDateString('ru-RU')+'\n'+(statuses[row.state]||'⏳ Обрабатывается')).join('\n\n'):'У вас пока нет заказов. Откройте магазин кнопкой ниже.';
    await send(env,m.chat.id,text,{reply_markup:keyboard}); return;
  }
  if (/^\/start(?:@\w+)?(?:\s|$)/.test(m.text||'')) {
    await send(env,m.chat.id,'Добро пожаловать! Откройте магазин кнопкой ниже. Я пришлю подтверждение и изменения статуса заказа.',{reply_markup:keyboard});
    return;
  }
  if (m.text==='❓ Помощь' || /^\/help(?:@\w+)?$/.test(m.text||'')) {
    await send(env,m.chat.id,'🛍 Как заказать\nОткройте магазин, выберите размер и товары, затем укажите адрес и промокод при оформлении. Заказ оплачивается с баланса.\n\n💳 /balance — ваш баланс.\n🪪 /id — ваш Telegram ID для первого пополнения.\n📦 /myorders — ваши последние заказы и статусы.\n📍 /address — адрес последнего заказа.\n\nСтатусы: Новый → В работе → В доставке → Завершён. Изменения статуса приходят сюда автоматически.'+(isAdmin(env,user.id)?'\n\n⚙️ Администратору\n/admin — остатки\n/orders — все последние заказы\n/stats — статистика\n/promos — промокоды\n/promo add CODE percent 10 50 30 1000 — создать: код, тип скидки, размер, активации, дни, минимум заказа\n/promo disable CODE — выключить\n/balance ID СУММА — зачислить баланс пользователю':''),{reply_markup:keyboard});
    return;
  }
  if (/^\/(stock|admin)(?:@\w+)?$/.test(m.text||'') || m.text==='⚙️ Админ-панель') { if (isAdmin(env,user.id)) await showStockPanel(env,m.chat.id); else await send(env,m.chat.id,'Эта команда доступна администратору.'); return; }
  if (/^\/orders(?:@\w+)?$/.test(m.text||'')) { if (isAdmin(env,user.id)) await showOrders(env,m.chat.id); else await send(env,m.chat.id,'Эта команда доступна администратору.'); return; }
  if (/^\/stats(?:@\w+)?$/.test(m.text||'')) { if (!isAdmin(env,user.id)) return; const rows=(await env.DB.prepare('SELECT state,COUNT(*) AS n FROM orders GROUP BY state').all()).results||[]; await send(env,m.chat.id,'<b>Статистика заказов</b>\n'+Object.entries(statuses).map(([k,v])=>`${v}: ${rows.find(x=>x.state===k)?.n||0}`).join('\n'),{parse_mode:'HTML'}); return; }
  if (/^\/id(?:@\w+)?$/.test(m.text||'')) { await send(env,m.chat.id,`🪪 Ваш Telegram ID: <code>${user.id}</code>\nПередайте его администратору, если нужно первое зачисление баланса.`,{parse_mode:'HTML',reply_markup:keyboard}); return; }
  if (/^\/balance(?:@\w+)?(?:\s|$)/.test(m.text||'')) {
    const args=(m.text||'').replace(/^\/balance(?:@\w+)?\s*/,'').trim().split(/\s+/).filter(Boolean);
    if (isAdmin(env,user.id) && args.length===2 && /^\d+$/.test(args[0]) && /^\d+$/.test(args[1])) {
      const target=Number(args[0]), amount=Number(args[1]); if (!Number.isSafeInteger(target) || !Number.isSafeInteger(amount) || amount<1 || amount>100000000) { await send(env,m.chat.id,'Сумма должна быть целым числом от 1 до 100 000 000 ₽.'); return; }
      const balance=await creditBalance(env,target,amount); await send(env,m.chat.id,`💳 Пользователю ${target} зачислено ${amount.toLocaleString('ru-RU')} ₽. Новый баланс: ${balance.toLocaleString('ru-RU')} ₽.`); return;
    }
    const balance=await balanceFor(env,user.id); await send(env,m.chat.id,`💳 Ваш баланс: <b>${balance.toLocaleString('ru-RU')} ₽</b>\n\nПополнение появится после подключения защищённой оплаты. Сейчас администратор может зачислить средства вручную.`,{parse_mode:'HTML',reply_markup:keyboard}); return;
  }
  if (/^\/promos(?:@\w+)?$/.test(m.text||'')) { if (!isAdmin(env,user.id)) { await send(env,m.chat.id,'Эта команда доступна администратору.'); return; } await showPromos(env,m.chat.id); return; }
  if (/^\/promo(?:@\w+)?(?:\s|$)/.test(m.text||'')) {
    if (!isAdmin(env,user.id)) { await send(env,m.chat.id,'Эта команда доступна администратору.'); return; }
    const parts=(m.text||'').replace(/^\/promo(?:@\w+)?\s*/,'').trim().toUpperCase().split(/\s+/); const command=(parts[0]||'').toLowerCase();
    try {
      if (command==='add') { parts[0]='add'; parts[2]=(parts[2]||'').toLowerCase(); const p=await createPromo(env,parts); await send(env,m.chat.id,`✅ Промокод ${p.code} создан: ${p.type==='percent'?p.value+'%':p.value+' ₽'}, активаций: ${p.uses}${p.validUntil?', до '+new Date(p.validUntil).toLocaleDateString('ru-RU'):''}${p.min?', от '+p.min+' ₽':''}.`); return; }
      if (command==='disable' && /^[A-Z0-9_-]{3,24}$/.test(parts[1]||'')) { await ensureCommerce(env); const result=await env.DB.prepare('UPDATE promo_codes SET active=0 WHERE code=?').bind(parts[1]).run(); await send(env,m.chat.id,result.meta.changes?`Промокод ${parts[1]} выключен.`:'Промокод не найден.'); return; }
    } catch { await send(env,m.chat.id,'Не удалось создать промокод. Проверьте формат: /promo add CODE percent 10 50 30 1000'); return; }
    await send(env,m.chat.id,'Промокоды:\n/promo add CODE percent 10 50 30 1000\nТип скидки: percent или fixed. Затем: размер скидки, число активаций, срок в днях (0 — без срока), минимальная сумма (0 — без минимума).\n/promo disable CODE'); return;
  }
  if (m.text==='📍 Мой адрес' || /^\/address(?:@\w+)?$/.test(m.text||'')) {
    const row=await env.DB.prepare("SELECT address FROM orders WHERE user_id=? AND state IN ('sent','processing','shipped','done') ORDER BY created_at DESC LIMIT 1").bind(user.id).first();
    await send(env,m.chat.id,row?'Ваш адрес:\n'+row.address:'Вы ещё не оформляли заказ.');
    return;
  }
  if (!m.web_app_data) return;
  let d;
  try { d=validateOrder(m.web_app_data.data); }
  catch { await send(env,m.chat.id,'Не удалось принять заказ: проверьте поля и количество товаров.',{reply_markup:keyboard});return; }
  await ensureCommerce(env);
  // Unique ID prevents duplicate delivery for already acknowledged orders.
  await env.DB.prepare('INSERT OR IGNORE INTO orders (user_id,order_id,address,state,created_at,locked_at,notified) VALUES (?,?,?,\'pending\',?,0,0)').bind(user.id,d.order_id,d.address,Date.now()).run();
  const row=await env.DB.prepare('SELECT state,notified FROM orders WHERE user_id=? AND order_id=?').bind(user.id,d.order_id).first();
  if (row.state!=='sent') {
    const now=Date.now();
    const claim=await env.DB.prepare("UPDATE orders SET state='sending',locked_at=? WHERE user_id=? AND order_id=? AND (state='pending' OR (state='sending' AND locked_at<?))").bind(now,user.id,d.order_id,now-90000).run();
    if (!claim.meta.changes) throw Error('order_busy');
    let reserved=[], promo={code:'',discount:0}, paidTotal=0, debited=false;
    try {
      promo=await redeemPromo(env,d.promo_code,d.total); paidTotal=d.total-promo.discount;
      if (!await debitBalance(env,user.id,paidTotal)) throw Error('insufficient_balance'); debited=true;
      reserved=await reserveStock(env,d);
      const adminText=`НОВЫЙ ЗАКАЗ № ${d.order_id}\nПокупатель: ${d.name}\nTelegram: ${user.username?'@'+user.username:'username не указан'}; ID: ${user.id}\nАдрес: ${d.address}\nEmail: ${d.email}\n\n${d.lines}\n\nТовары: ${d.total} ₽${promo.discount?`\nПромокод ${promo.code}: −${promo.discount} ₽`:''}\nСписано с баланса: ${paidTotal} ₽\nНаличие и доставку подтвердите покупателю.`;
      if (adminText.length>4000) throw Error('order_long');
      await send(env,env.ADMIN_CHAT_ID,adminText,{reply_markup:statusButtons(d.order_id)});
    } catch (e) { if (reserved.length) await env.DB.batch(reserved.map(([name,qty])=>env.DB.prepare('UPDATE inventory SET stock=stock+?,updated_at=? WHERE name=?').bind(qty,Date.now(),name))); if (debited) await creditBalance(env,user.id,paidTotal); await releasePromo(env,promo.code);
      if (['promo_invalid','promo_min','insufficient_balance','out_of_stock','order_long'].includes(e?.message)) {
        await env.DB.prepare("UPDATE orders SET state='cancelled' WHERE user_id=? AND order_id=?").bind(user.id,d.order_id).run();
        const message=e.message==='insufficient_balance'?'Недостаточно средств на балансе. Заказ не оформлен. Обратитесь к администратору для пополнения.':e.message==='out_of_stock'?'Один из товаров уже закончился. Заказ не оформлен — обновите магазин и выберите другой товар.':e.message==='order_long'?'Заказ слишком длинный. Разделите его на несколько заказов.':promoErrorText(e.message);
        await send(env,m.chat.id,`❌ ${message}`,{reply_markup:keyboard}); return;
      }
      await env.DB.prepare("UPDATE orders SET state='pending' WHERE user_id=? AND order_id=?").bind(user.id,d.order_id).run(); throw e;
    }
    await env.DB.prepare("UPDATE orders SET state='sent' WHERE user_id=? AND order_id=?").bind(user.id,d.order_id).run();
    row.notified=0; row.paidTotal=paidTotal; row.promo=promo;
  }
  if (!row.notified) {
    const remaining=await balanceFor(env,user.id); const promoLine=row.promo?.discount?`\nПромокод ${row.promo.code}: −${row.promo.discount} ₽`:'';
    await send(env,m.chat.id,`✅ Заказ № ${d.order_id} передан администратору.\nСписано с баланса: ${(row.paidTotal??d.total).toLocaleString('ru-RU')} ₽${promoLine}\nОстаток: ${remaining.toLocaleString('ru-RU')} ₽\nАдрес: ${d.address}\nОжидайте подтверждения наличия и доставки.`,{reply_markup:keyboard});
    await env.DB.prepare('UPDATE orders SET notified=1 WHERE user_id=? AND order_id=?').bind(user.id,d.order_id).run();
  }
}

export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    if (request.method==='GET' && path==='/repair-webhook') {
      try {
        await telegram(env,'setWebhook',{url:new URL('/telegram',request.url).toString(),secret_token:env.WEBHOOK_SECRET,allowed_updates:['message','callback_query'],drop_pending_updates:false});
        return new Response('Webhook repaired: message and callback_query enabled.');
      } catch { return new Response('Webhook repair failed.',{status:503}); }
    }
    if (request.method==='OPTIONS' && (path==='/inventory' || path==='/account')) return new Response(null,{headers:corsHeaders});
    if (request.method==='GET' && path==='/inventory') { if (!env.DB) return new Response('Not configured',{status:503,headers:corsHeaders}); return Response.json(await inventory(env),{headers:corsHeaders}); }
    if (request.method==='POST' && path==='/account') {
      if (!env.DB || !env.BOT_TOKEN) return new Response('Not configured',{status:503,headers:corsHeaders});
      try { const raw=await request.text(); if (new TextEncoder().encode(raw).length>10000) throw Error('payload'); const user=await webAppUser(JSON.parse(raw).init_data,env); return Response.json({balance:await balanceFor(env,user.id)},{headers:corsHeaders}); }
      catch { return new Response('Forbidden',{status:403,headers:corsHeaders}); }
    }
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

