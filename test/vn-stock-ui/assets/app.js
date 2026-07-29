/* ============================================================================
   VNAlpha — shared runtime
     1. theme + language
     2. Vietnamese number / price formatting and exchange rules
     3. mock market data (deterministic — same numbers on every reload)
     4. hand-rolled charts (canvas + SVG, no external chart library)
     5. shared renderers and shell behaviour
   ========================================================================== */
(function () {
  'use strict';

  /* =========================================================== 1. THEME  */

  const THEME_KEY = 'vnalpha.theme';
  const LANG_KEY = 'vnalpha.lang';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    document.querySelectorAll('[data-theme-value]').forEach((el) => {
      el.setAttribute('aria-checked', String(el.dataset.themeValue === theme));
      el.setAttribute('aria-selected', String(el.dataset.themeValue === theme));
    });
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
    window.applyI18n(lang);
    document.querySelectorAll('[data-lang-value]').forEach((el) => {
      /* these render as radios in Settings and as tabs elsewhere */
      const on = String(el.dataset.langValue === lang);
      el.setAttribute('aria-selected', on);
      el.setAttribute('aria-checked', on);
    });
    document.querySelectorAll('[data-lang-label]').forEach((el) => {
      el.textContent = lang === 'vi' ? 'VI' : 'EN';
    });
  }

  /* ============================================ 2. NUMBERS & EXCHANGES  */

  const L = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en-US' : 'vi-VN');

  function fmt(n, dec) {
    dec = dec == null ? 2 : dec;
    return new Intl.NumberFormat(L(), {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(n);
  }

  function fmtSigned(n, dec) {
    return (n > 0 ? '+' : n < 0 ? '-' : '') + fmt(Math.abs(n), dec);
  }

  /** Compact VND. Input in VND. Vietnamese scales at tỷ / nghìn tỷ. */
  function money(vnd) {
    const a = Math.abs(vnd);
    if (a >= 1e12) return fmt(vnd / 1e12, 2) + ' ' + window.t('x.tril');
    if (a >= 1e9) return fmt(vnd / 1e9, a >= 1e11 ? 0 : 1) + ' ' + window.t('x.bil');
    if (a >= 1e6) return fmt(vnd / 1e6, 1) + ' ' + window.t('x.mil');
    return fmt(vnd, 0);
  }

  /** Compact share volume. */
  function vol(shares) {
    const a = Math.abs(shares);
    if (a >= 1e6) return fmt(shares / 1e6, 2) + ' ' + window.t('x.mil');
    if (a >= 1e3) return fmt(shares / 1e3, 1) + 'K';
    return fmt(shares, 0);
  }

  /* Daily price limits, by exchange. */
  const LIMIT = { HOSE: 0.07, HNX: 0.10, UPCOM: 0.15 };

  /** Tick size in thousand VND. HOSE is tiered; HNX/UPCOM are flat 100đ. */
  function tick(priceK, exch) {
    if (exch !== 'HOSE') return 0.1;
    if (priceK < 10) return 0.01;
    if (priceK < 50) return 0.05;
    return 0.1;
  }

  /** Ceiling price: ref × (1+limit) rounded DOWN to a valid tick, min one tick up. */
  function ceilPrice(refK, exch) {
    const raw = refK * (1 + LIMIT[exch]);
    const s = tick(raw, exch);
    let p = Math.floor((raw + 1e-9) / s) * s;
    if (p <= refK) p = refK + s;
    return round2(p);
  }

  /** Floor price: ref × (1−limit) rounded UP to a valid tick, min one tick down. */
  function floorPrice(refK, exch) {
    const raw = refK * (1 - LIMIT[exch]);
    const s = tick(raw, exch);
    let p = Math.ceil((raw - 1e-9) / s) * s;
    if (p >= refK) p = refK - s;
    return round2(Math.max(p, s));
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function snapTick(priceK, exch) {
    const s = tick(priceK, exch);
    return round2(Math.round(priceK / s) * s);
  }

  /**
   * Vietnamese price-board colour class.
   * purple = ceiling, cyan = floor, green = up, red = down, yellow = reference.
   * Ceiling/floor are checked first — they outrank plain up/down, as on the
   * official HOSE board.
   */
  function pxClass(last, ref, ceil, floor) {
    if (!last) return 'px-ref';
    if (Math.abs(last - ceil) < 0.005) return 'px-ceil';
    if (Math.abs(last - floor) < 0.005) return 'px-floor';
    if (last > ref) return 'px-up';
    if (last < ref) return 'px-down';
    return 'px-ref';
  }

  /** Colour for a plain change value (no ceiling/floor semantics). */
  function chgClass(v) {
    return v > 0 ? 'px-up' : v < 0 ? 'px-down' : 'px-ref';
  }

  /* ==================================================== 3. MOCK MARKET  */

  /* Deterministic PRNG so the prototype renders identically on every reload. */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const SECTORS = {
    bank:       { vi: 'Ngân hàng',        en: 'Banks' },
    realestate: { vi: 'Bất động sản',     en: 'Real estate' },
    steel:      { vi: 'Thép',             en: 'Steel' },
    broker:     { vi: 'Chứng khoán',      en: 'Securities' },
    tech:       { vi: 'Công nghệ',        en: 'Technology' },
    retail:     { vi: 'Bán lẻ',           en: 'Retail' },
    fnb:        { vi: 'Thực phẩm & đồ uống', en: 'Food & beverage' },
    energy:     { vi: 'Dầu khí',          en: 'Oil & gas' },
    utility:    { vi: 'Tiện ích',         en: 'Utilities' },
    aviation:   { vi: 'Hàng không',       en: 'Aviation' },
    chem:       { vi: 'Hoá chất',         en: 'Chemicals' },
    material:   { vi: 'Vật liệu',         en: 'Materials' },
    telecom:    { vi: 'Viễn thông',       en: 'Telecom' },
  };

  /* [sym, viName, enName, exchange, sector, refPriceK, pct, volMillions, capBnVND, pe, pb, foreignRoomPct] */
  const RAW = [
    ['VCB', 'NHTM CP Ngoại thương Việt Nam', 'Vietcombank', 'HOSE', 'bank', 92.5, 0.65, 3.2, 516000, 15.8, 2.9, 6.1],
    ['BID', 'NHTM CP Đầu tư và Phát triển VN', 'BIDV', 'HOSE', 'bank', 47.8, 1.15, 4.1, 272000, 13.2, 2.1, 12.4],
    ['CTG', 'NHTM CP Công Thương Việt Nam', 'VietinBank', 'HOSE', 'bank', 36.9, 1.90, 8.7, 198000, 10.4, 1.5, 27.3],
    ['TCB', 'NHTM CP Kỹ thương Việt Nam', 'Techcombank', 'HOSE', 'bank', 24.6, 2.28, 22.4, 173000, 8.9, 1.2, 0.0],
    ['MBB', 'NHTM CP Quân đội', 'MB Bank', 'HOSE', 'bank', 23.1, 1.73, 31.2, 131000, 7.1, 1.3, 0.0],
    ['VPB', 'NHTM CP Việt Nam Thịnh Vượng', 'VPBank', 'HOSE', 'bank', 19.4, 0.52, 28.9, 154000, 9.8, 1.1, 4.2],
    ['ACB', 'NHTM CP Á Châu', 'Asia Commercial Bank', 'HOSE', 'bank', 25.3, 1.20, 14.6, 113000, 7.6, 1.4, 0.0],
    ['STB', 'NHTM CP Sài Gòn Thương Tín', 'Sacombank', 'HOSE', 'bank', 34.2, 2.70, 18.3, 64400, 9.1, 1.2, 9.8],
    ['SHB', 'NHTM CP Sài Gòn – Hà Nội', 'SHB', 'HOSE', 'bank', 11.8, -0.42, 25.1, 43200, 6.4, 0.9, 6.5],
    ['TPB', 'NHTM CP Tiên Phong', 'TPBank', 'HOSE', 'bank', 16.9, 0.60, 9.4, 44600, 7.9, 1.1, 22.0],

    ['VIC', 'Tập đoàn Vingroup', 'Vingroup', 'HOSE', 'realestate', 42.3, -1.42, 6.8, 161000, 26.4, 1.8, 25.6],
    ['VHM', 'CTCP Vinhomes', 'Vinhomes', 'HOSE', 'realestate', 38.9, -0.90, 9.2, 169000, 6.2, 0.9, 18.3],
    /* VRE seeded past the −7% limit so it prints at the floor (sàn, cyan). */
    ['VRE', 'CTCP Vincom Retail', 'Vincom Retail', 'HOSE', 'realestate', 18.2, -7.40, 7.4, 41400, 11.7, 1.0, 32.1],
    ['BCM', 'Tổng CT Đầu tư và Phát triển CN', 'Becamex IDC', 'HOSE', 'realestate', 62.4, -0.64, 0.9, 64600, 34.2, 3.1, 44.8],
    /* KDH unchanged on the day — prints at the reference colour (TC, yellow). */
    ['KDH', 'CTCP ĐT và KD nhà Khang Điền', 'Khang Dien House', 'HOSE', 'realestate', 33.1, 0.00, 3.6, 29800, 21.4, 1.6, 12.7],
    ['NLG', 'CTCP Đầu tư Nam Long', 'Nam Long Group', 'HOSE', 'realestate', 37.6, -7.20, 2.8, 14500, 18.9, 1.3, 28.4],

    ['HPG', 'CTCP Tập đoàn Hoà Phát', 'Hoa Phat Group', 'HOSE', 'steel', 27.5, 2.55, 42.6, 176000, 12.6, 1.4, 22.4],
    ['HSG', 'CTCP Tập đoàn Hoa Sen', 'Hoa Sen Group', 'HOSE', 'steel', 19.8, 3.03, 15.2, 12200, 9.8, 1.0, 31.5],
    /* NKG seeded past the +7% limit so it prints at the ceiling (trần, purple). */
    ['NKG', 'CTCP Thép Nam Kim', 'Nam Kim Steel', 'HOSE', 'steel', 17.4, 7.30, 8.9, 4580, 10.3, 0.9, 26.8],

    ['SSI', 'CTCP Chứng khoán SSI', 'SSI Securities', 'HOSE', 'broker', 31.2, 3.85, 24.8, 55700, 16.4, 2.0, 41.2],
    ['VND', 'CTCP Chứng khoán VNDIRECT', 'VNDIRECT', 'HOSE', 'broker', 14.6, 2.81, 31.5, 22300, 14.1, 1.2, 36.7],
    ['HCM', 'CTCP Chứng khoán TP. Hồ Chí Minh', 'HSC Securities', 'HOSE', 'broker', 25.7, 2.39, 9.6, 18900, 15.8, 1.7, 33.9],

    ['FPT', 'CTCP FPT', 'FPT Corporation', 'HOSE', 'tech', 138.5, 1.61, 4.2, 203000, 24.8, 5.8, 0.0],
    ['CMG', 'CTCP Tập đoàn Công nghệ CMC', 'CMC Corporation', 'HOSE', 'tech', 42.8, 0.70, 0.8, 6900, 22.4, 2.3, 41.5],

    ['MWG', 'CTCP Đầu tư Thế Giới Di Động', 'Mobile World', 'HOSE', 'retail', 61.4, -0.81, 6.4, 89700, 19.2, 3.1, 0.0],
    ['PNJ', 'CTCP Vàng bạc Đá quý Phú Nhuận', 'Phu Nhuan Jewelry', 'HOSE', 'retail', 96.2, 0.42, 1.1, 32500, 15.6, 3.2, 12.8],

    ['VNM', 'CTCP Sữa Việt Nam', 'Vinamilk', 'HOSE', 'fnb', 64.8, -0.31, 3.9, 135000, 16.9, 4.1, 48.9],
    ['SAB', 'Tổng CTCP Bia Rượu NGK Sài Gòn', 'Sabeco', 'HOSE', 'fnb', 52.6, 0.00, 0.6, 67500, 18.4, 3.4, 36.2],
    ['MSN', 'CTCP Tập đoàn Masan', 'Masan Group', 'HOSE', 'fnb', 72.9, 1.11, 3.1, 104000, 41.2, 2.7, 22.1],

    ['GAS', 'Tổng CT Khí Việt Nam', 'PV Gas', 'HOSE', 'energy', 68.4, -0.44, 1.4, 130000, 15.1, 2.4, 45.7],
    ['PLX', 'Tập đoàn Xăng dầu Việt Nam', 'Petrolimex', 'HOSE', 'energy', 38.2, 0.52, 2.2, 48500, 17.8, 2.2, 40.3],
    ['POW', 'Tổng CT Điện lực Dầu khí VN', 'PV Power', 'HOSE', 'utility', 12.4, 1.22, 12.7, 29000, 19.6, 0.9, 41.8],

    ['VJC', 'CTCP Hàng không VietJet', 'Vietjet Air', 'HOSE', 'aviation', 98.7, -0.71, 0.7, 53400, 32.8, 3.9, 22.6],
    ['DGC', 'CTCP Tập đoàn Hoá chất Đức Giang', 'Duc Giang Chemicals', 'HOSE', 'chem', 104.5, 1.85, 2.1, 39700, 13.4, 2.8, 34.2],
    ['GVR', 'Tập đoàn Công nghiệp Cao su VN', 'Vietnam Rubber Group', 'HOSE', 'material', 33.8, 2.11, 5.3, 135000, 28.6, 2.1, 46.9],

    ['SHS', 'CTCP Chứng khoán Sài Gòn – Hà Nội', 'SHS Securities', 'HNX', 'broker', 14.2, 3.65, 18.4, 11600, 12.8, 1.1, 38.4],
    ['PVS', 'Tổng CTCP DV Kỹ thuật Dầu khí VN', 'PTSC', 'HNX', 'energy', 38.6, 1.31, 6.2, 18400, 16.2, 1.4, 24.7],
    ['IDC', 'Tổng công ty IDICO', 'IDICO Corporation', 'HNX', 'realestate', 54.3, -0.92, 1.8, 17900, 13.9, 2.9, 31.2],
    /* CEO at the HNX +10% ceiling — a wider band than HOSE, which the board shows. */
    ['CEO', 'CTCP Tập đoàn C.E.O', 'CEO Group', 'HNX', 'realestate', 15.7, 10.40, 9.1, 8080, 45.2, 1.3, 43.6],

    ['BSR', 'CTCP Lọc hoá dầu Bình Sơn', 'Binh Son Refining', 'UPCOM', 'energy', 21.4, 1.87, 7.8, 66300, 11.2, 1.2, 42.1],
    ['VGI', 'Tổng CTCP ĐT Quốc tế Viettel', 'Viettel Global', 'UPCOM', 'telecom', 78.5, 5.23, 1.3, 239000, 38.4, 6.2, 48.7],
    ['MCH', 'CTCP Hàng tiêu dùng Masan', 'Masan Consumer', 'UPCOM', 'fnb', 128.0, 0.63, 0.4, 92200, 21.6, 5.4, 33.8],
  ];

  /** Build a full quote from the compact seed row. */
  function buildStock(r) {
    const [sym, vi, en, exch, sector, ref, pct, volM, capBn, pe, pb, room] = r;
    const rnd = mulberry32(hash(sym));

    const ceil = ceilPrice(ref, exch);
    const flr = floorPrice(ref, exch);
    const last = Math.min(ceil, Math.max(flr, snapTick(ref * (1 + pct / 100), exch)));
    const chg = round2(last - ref);
    /* Derive the displayed % from the snapped price so the two always agree. */
    const pctShown = round2((chg / ref) * 100);

    const spread = Math.abs(pct) / 100 + 0.006;
    const high = Math.min(ceil, snapTick(Math.max(last, ref) * (1 + spread * rnd() * 0.9), exch));
    const low = Math.max(flr, snapTick(Math.min(last, ref) * (1 - spread * rnd() * 0.9), exch));
    const avg = round2((high + low + last) / 3);

    const volume = Math.round(volM * 1e6);
    const value = Math.round(volume * avg * 1000);

    const s = tick(last, exch);
    const bids = [0, 1, 2].map((i) => [
      round2(Math.max(flr, last - s * (i + 1))),
      Math.round((0.4 + rnd() * 1.4) * volM * 12000),
    ]);
    const asks = [0, 1, 2].map((i) => [
      round2(Math.min(ceil, last + s * (i + 1))),
      Math.round((0.4 + rnd() * 1.4) * volM * 12000),
    ]);

    const fBuy = Math.round(volume * (0.04 + rnd() * 0.16));
    const fSell = Math.round(volume * (0.03 + rnd() * 0.15));

    const beta = round2(0.72 + rnd() * 0.78);
    const divYield = round2(rnd() * 5.4);

    /* 30-session close series ending at `last`, used for sparklines. */
    const spark = [];
    let p = last * (1 - (rnd() - 0.35) * 0.16);
    for (let i = 0; i < 29; i++) {
      p *= 1 + (rnd() - 0.5) * 0.028;
      spark.push(p);
    }
    spark.push(last);

    return {
      sym, exch, sector, ref, ceil, floor: flr, last, chg, pct: pctShown,
      high, low, avg, volume, value, bids, asks,
      fBuy, fSell, fNet: fBuy - fSell,
      cap: capBn * 1e9, pe, pb, room, spark, beta, divYield,
      name: { vi, en },
    };
  }

  const STOCKS = RAW.map(buildStock);
  const BY_SYM = Object.fromEntries(STOCKS.map((s) => [s.sym, s]));

  /* Aggregate sector performance for the heatmap. */
  const SECTOR_ROWS = Object.keys(SECTORS).map((key) => {
    const members = STOCKS.filter((s) => s.sector === key);
    const cap = members.reduce((a, s) => a + s.cap, 0);
    const pct = members.reduce((a, s) => a + s.pct * s.cap, 0) / cap;
    return { key, cap, pct: round2(pct), count: members.length, label: SECTORS[key] };
  }).sort((a, b) => b.cap - a.cap);

  const INDICES = [
    { code: 'VN-Index', value: 1284.56, chg: 12.42, pct: 0.98, vol: 842.3e6, val: 21460e9, exch: 'HOSE' },
    { code: 'VN30', value: 1342.18, chg: 16.85, pct: 1.27, vol: 341.7e6, val: 12180e9, exch: 'HOSE' },
    { code: 'HNX-Index', value: 236.41, chg: 2.18, pct: 0.93, vol: 84.6e6, val: 1740e9, exch: 'HNX' },
    { code: 'UPCOM-Index', value: 98.74, chg: -0.32, pct: -0.32, vol: 46.2e6, val: 682e9, exch: 'UPCOM' },
  ];

  const BREADTH = { up: 246, ceil: 18, ref: 61, down: 158, floor: 7 };

  const NEWS = [
    { time: '14:36', src: 'HOSE', vi: 'Khối ngoại mua ròng 412 tỷ đồng phiên thứ ba liên tiếp, tập trung HPG và FPT', en: 'Foreign investors net buy VND 412bn for a third session, focused on HPG and FPT', tag: 'HPG' },
    { time: '14:12', src: 'CafeF', vi: 'Nhóm ngân hàng đóng góp 6,8 điểm cho VN-Index, STB dẫn đầu đà tăng', en: 'Banks add 6.8 points to VN-Index, with STB leading the advance', tag: 'STB' },
    { time: '13:35', src: 'Vietstock', vi: 'Hoà Phát công bố sản lượng thép thô tháng 7 tăng 14% so với cùng kỳ', en: 'Hoa Phat reports July crude steel output up 14% year on year', tag: 'HPG' },
    { time: '11:22', src: 'VnEconomy', vi: 'Giải ngân đầu tư công 7 tháng đạt 48% kế hoạch năm', en: 'Public investment disbursement reaches 48% of the annual plan after seven months', tag: null },
    { time: '10:05', src: 'HNX', vi: 'CEO Group tăng trần phiên thứ hai, thanh khoản gấp 3 lần trung bình 20 phiên', en: 'CEO Group hits the ceiling for a second session on 3x its 20-session average volume', tag: 'CEO' },
    { time: '09:30', src: 'SSI Research', vi: 'Báo cáo chiến lược tháng 8: nâng dự báo tăng trưởng lợi nhuận toàn thị trường lên 17%', en: 'August strategy note: market-wide earnings growth forecast raised to 17%', tag: null },
  ];

  const HOLDINGS = [
    { sym: 'HPG', qty: 5000, cost: 24.85, status: 'avail' },
    { sym: 'FPT', qty: 400, cost: 121.30, status: 'avail' },
    { sym: 'TCB', qty: 8000, cost: 23.10, status: 't2' },
    { sym: 'MWG', qty: 1200, cost: 64.90, status: 'avail' },
    { sym: 'SSI', qty: 3000, cost: 28.40, status: 't1' },
    { sym: 'VNM', qty: 900, cost: 68.20, status: 'avail' },
    { sym: 'DGC', qty: 300, cost: 98.60, status: 'avail' },
  ];

  const WATCHLIST = ['VCB', 'CTG', 'VHM', 'HSG', 'VND', 'GAS', 'VGI', 'CEO', 'PNJ', 'BSR'];

  const ALERTS = [
    { sym: 'HPG', op: '>=', price: 29.00, channel: ['push', 'zalo'], created: '24/07/2026', state: 'active' },
    { sym: 'FPT', op: '<=', price: 132.00, channel: ['email'], created: '21/07/2026', state: 'active' },
    { sym: 'SSI', op: '>=', price: 33.50, channel: ['push'], created: '19/07/2026', state: 'triggered' },
    { sym: 'VHM', op: '<=', price: 36.00, channel: ['email', 'zalo'], created: '15/07/2026', state: 'paused' },
  ];

  /* -------- generated series ------------------------------------------- */

  /** Intraday minute series for an index, honouring the 11:30–13:00 break. */
  function intraday(seed, open, close, points) {
    const rnd = mulberry32(seed);
    const out = [];
    let v = open;
    for (let i = 0; i < points; i++) {
      const drift = (close - v) / Math.max(1, points - i);
      v += drift + (rnd() - 0.5) * (Math.abs(close - open) / points) * 6;
      const min = i < 150 ? 540 + i : 780 + (i - 150); // 09:00 then 13:00
      out.push({ m: min, v });
    }
    out[out.length - 1].v = close;
    return out;
  }

  /** Daily OHLC candles ending at `last`. */
  function candles(sym, n, last) {
    const rnd = mulberry32(hash(sym + ':ohlc'));
    const out = [];
    let c = last * (1 - (rnd() - 0.3) * 0.3);
    for (let i = 0; i < n; i++) {
      const o = c;
      const drift = (last - c) / Math.max(1, n - i) * 0.6;
      c = o + drift + (rnd() - 0.5) * o * 0.035;
      const h = Math.max(o, c) * (1 + rnd() * 0.014);
      const l = Math.min(o, c) * (1 - rnd() * 0.014);
      out.push({ i, o, h, l, c, v: (0.5 + rnd() * 1.6) });
    }
    const lastC = out[out.length - 1];
    lastC.c = last;
    lastC.h = Math.max(lastC.h, last);
    lastC.l = Math.min(lastC.l, last);
    return out;
  }

  /* ======================================================== 4. CHARTS   */

  /** Read a theme token as a canvas-safe colour string. */
  function cvar(name, alpha) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parts = raw.split(/\s+/).join(',');
    return alpha == null || alpha === 1 ? `rgb(${parts})` : `rgba(${parts},${alpha})`;
  }

  const redraws = new Set();

  /** Size a canvas for the device pixel ratio and return its 2d context. */
  function prep(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return null;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  /** Register a draw function: runs now, on resize, and on theme change. */
  function autoDraw(canvas, draw) {
    const run = () => { const s = prep(canvas); if (s) draw(s.ctx, s.w, s.h); };
    redraws.add(run);
    if (window.ResizeObserver) new ResizeObserver(run).observe(canvas);
    run();
    return run;
  }

  function niceTicks(min, max, count) {
    const span = (max - min) || 1;
    const step = Math.pow(10, Math.floor(Math.log10(span / count)));
    const err = (span / count) / step;
    const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    const s = step * mult;
    const out = [];
    for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) out.push(v);
    return out;
  }

  function hhmm(minOfDay) {
    const h = Math.floor(minOfDay / 60);
    const m = minOfDay % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /**
   * Intraday area chart with a dashed reference line at the previous close.
   * Fill and stroke follow the up/down colour of the final value.
   */
  function areaChart(canvas, series, refValue) {
    autoDraw(canvas, (ctx, w, h) => {
      const padL = 8, padR = 54, padT = 12, padB = 22;
      const iw = w - padL - padR;
      const ih = h - padT - padB;

      const vals = series.map((d) => d.v).concat([refValue]);
      let lo = Math.min.apply(null, vals);
      let hi = Math.max.apply(null, vals);
      const pad = (hi - lo) * 0.18 || 1;
      lo -= pad; hi += pad;

      const X = (i) => padL + (i / (series.length - 1)) * iw;
      const Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * ih;

      // horizontal grid + right-hand price scale
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      niceTicks(lo, hi, 5).forEach((v) => {
        const y = Y(v);
        ctx.strokeStyle = cvar('--c-line', 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, Math.round(y) + 0.5);
        ctx.lineTo(padL + iw, Math.round(y) + 0.5);
        ctx.stroke();
        ctx.fillStyle = cvar('--c-muted');
        ctx.fillText(fmt(v, 0), padL + iw + 8, y);
      });

      const up = series[series.length - 1].v >= refValue;
      const col = up ? cvar('--c-up') : cvar('--c-down');
      const colA = up ? cvar('--c-up', 0.22) : cvar('--c-down', 0.22);

      // reference (previous close)
      const ry = Y(refValue);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = cvar('--c-ref', 0.9);
      ctx.beginPath();
      ctx.moveTo(padL, ry);
      ctx.lineTo(padL + iw, ry);
      ctx.stroke();
      ctx.restore();

      // area fill
      const grad = ctx.createLinearGradient(0, padT, 0, padT + ih);
      grad.addColorStop(0, colA);
      grad.addColorStop(1, up ? cvar('--c-up', 0) : cvar('--c-down', 0));
      ctx.beginPath();
      ctx.moveTo(X(0), Y(series[0].v));
      series.forEach((d, i) => ctx.lineTo(X(i), Y(d.v)));
      ctx.lineTo(X(series.length - 1), padT + ih);
      ctx.lineTo(X(0), padT + ih);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // line
      ctx.beginPath();
      series.forEach((d, i) => (i ? ctx.lineTo(X(i), Y(d.v)) : ctx.moveTo(X(i), Y(d.v))));
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.75;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // last-value marker
      const lx = X(series.length - 1), ly = Y(series[series.length - 1].v);
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      // time axis — session boundaries only
      ctx.fillStyle = cvar('--c-muted');
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      [0, Math.floor(series.length * 0.3), 149, Math.floor(series.length * 0.78), series.length - 1]
        .forEach((i, k) => {
          if (i < 0 || i >= series.length) return;
          ctx.textAlign = k === 0 ? 'left' : k === 4 ? 'right' : 'center';
          ctx.fillText(hhmm(series[i].m), X(i), padT + ih + 7);
        });
    });
  }

  /**
   * Candlestick chart with a volume sub-pane and an optional moving average.
   * Hovering shows a crosshair and an OHLC readout in `tipEl`.
   */
  function candleChart(canvas, data, opts) {
    opts = opts || {};
    const tipEl = opts.tooltip ? document.querySelector(opts.tooltip) : null;
    let hover = -1;

    const draw = autoDraw(canvas, (ctx, w, h) => {
      const padL = 6, padR = 56, padT = 10, padB = 20;
      const volH = Math.round((h - padT - padB) * 0.2);
      const gap = 10;
      const iw = w - padL - padR;
      const ph = h - padT - padB - volH - gap;

      let lo = Math.min.apply(null, data.map((d) => d.l));
      let hi = Math.max.apply(null, data.map((d) => d.h));
      const pad = (hi - lo) * 0.08 || 1;
      lo -= pad; hi += pad;
      const maxV = Math.max.apply(null, data.map((d) => d.v));

      const step = iw / data.length;
      const bw = Math.max(1.5, Math.min(9, step * 0.66));
      const X = (i) => padL + step * (i + 0.5);
      const Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * ph;
      const VY = (v) => padT + ph + gap + volH - (v / maxV) * volH;

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      niceTicks(lo, hi, 5).forEach((v) => {
        const y = Math.round(Y(v)) + 0.5;
        ctx.strokeStyle = cvar('--c-line', 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + iw, y);
        ctx.stroke();
        ctx.fillStyle = cvar('--c-muted');
        ctx.fillText(fmt(v, 1), padL + iw + 8, y);
      });

      const cUp = cvar('--c-up');
      const cDown = cvar('--c-down');

      data.forEach((d, i) => {
        const rising = d.c >= d.o;
        const col = rising ? cUp : cDown;
        const x = X(i);

        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, Y(d.h));
        ctx.lineTo(Math.round(x) + 0.5, Y(d.l));
        ctx.stroke();

        const yo = Y(d.o), yc = Y(d.c);
        const top = Math.min(yo, yc);
        const bh = Math.max(1, Math.abs(yc - yo));
        ctx.fillStyle = rising ? col : col;
        ctx.globalAlpha = rising ? 1 : 1;
        ctx.fillRect(x - bw / 2, top, bw, bh);
        ctx.globalAlpha = 1;

        ctx.fillStyle = rising ? cvar('--c-up', 0.4) : cvar('--c-down', 0.4);
        const vy = VY(d.v);
        ctx.fillRect(x - bw / 2, vy, bw, padT + ph + gap + volH - vy);
      });

      // 20-session moving average
      if (opts.ma !== false) {
        const period = 20;
        ctx.beginPath();
        let started = false;
        for (let i = period - 1; i < data.length; i++) {
          let sum = 0;
          for (let k = 0; k < period; k++) sum += data[i - k].c;
          const y = Y(sum / period);
          started ? ctx.lineTo(X(i), y) : (ctx.moveTo(X(i), y), (started = true));
        }
        ctx.strokeStyle = cvar('--c-accent', 0.9);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // crosshair
      if (hover >= 0 && hover < data.length) {
        const x = Math.round(X(hover)) + 0.5;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = cvar('--c-muted', 0.7);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + ph + gap + volH);
        ctx.stroke();
        ctx.restore();
      }
    });

    if (tipEl) {
      canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        const iw = r.width - 62;
        const i = Math.round(((e.clientX - r.left - 6) / iw) * data.length - 0.5);
        if (i === hover) return;
        hover = Math.max(0, Math.min(data.length - 1, i));
        const d = data[hover];
        const cls = d.c >= d.o ? 'px-up' : 'px-down';
        tipEl.innerHTML =
          `<span class="text-muted">O</span> <span class="${cls}">${fmt(d.o, 2)}</span>` +
          `<span class="text-muted ml-2">H</span> <span class="${cls}">${fmt(d.h, 2)}</span>` +
          `<span class="text-muted ml-2">L</span> <span class="${cls}">${fmt(d.l, 2)}</span>` +
          `<span class="text-muted ml-2">C</span> <span class="${cls}">${fmt(d.c, 2)}</span>` +
          `<span class="text-muted ml-2">V</span> <span class="text-fg">${fmt(d.v * 10, 1)}M</span>`;
        draw();
      });
      canvas.addEventListener('mouseleave', () => { hover = -1; tipEl.innerHTML = ''; draw(); });
    }
    return draw;
  }

  /** Grouped column chart — quarterly revenue vs. net profit. */
  function barsChart(canvas, labels, seriesA, seriesB) {
    autoDraw(canvas, (ctx, w, h) => {
      const padL = 6, padR = 52, padT = 12, padB = 26;
      const iw = w - padL - padR;
      const ih = h - padT - padB;
      const maxV = Math.max.apply(null, seriesA.concat(seriesB)) * 1.12;
      const step = iw / labels.length;
      const bw = Math.min(16, step * 0.3);

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      niceTicks(0, maxV, 4).forEach((v) => {
        const y = Math.round(padT + (1 - v / maxV) * ih) + 0.5;
        ctx.strokeStyle = cvar('--c-line', 0.5);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + iw, y);
        ctx.stroke();
        ctx.fillStyle = cvar('--c-muted');
        ctx.fillText(fmt(v / 1000, 0) + 'K', padL + iw + 8, y);
      });

      labels.forEach((lb, i) => {
        const cx = padL + step * (i + 0.5);
        const hA = (seriesA[i] / maxV) * ih;
        const hB = (seriesB[i] / maxV) * ih;
        ctx.fillStyle = cvar('--c-primary');
        ctx.fillRect(cx - bw - 2, padT + ih - hA, bw, hA);
        ctx.fillStyle = cvar('--c-accent');
        ctx.fillRect(cx + 2, padT + ih - hB, bw, hB);

        ctx.fillStyle = cvar('--c-muted');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(lb, cx, padT + ih + 8);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
      });
    });
  }

  /** Inline SVG sparkline. Returns markup — cheap enough for table cells. */
  function sparkline(series, w, h, color) {
    const lo = Math.min.apply(null, series);
    const hi = Math.max.apply(null, series);
    const span = hi - lo || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * (w - 2) + 1;
      const y = h - 2 - ((v - lo) / span) * (h - 4);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    const id = 'sg' + Math.abs(hash(pts)).toString(36);
    return (
      `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" aria-hidden="true" class="overflow-visible">` +
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="${color}" stop-opacity=".28"/>` +
      `<stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
      `<polygon points="${pts} ${w - 1},${h} 1,${h}" fill="url(#${id})"/>` +
      `<polyline points="${pts}" stroke="${color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>` +
      `</svg>`
    );
  }

  /** SVG donut with a centred label. */
  function donut(el, segments) {
    const size = 168, r = 62, sw = 22, c = size / 2;
    const total = segments.reduce((a, s) => a + s.value, 0);
    const circ = 2 * Math.PI * r;
    let off = 0;
    const arcs = segments.map((s) => {
      const frac = s.value / total;
      const dash = `${(frac * circ).toFixed(2)} ${(circ - frac * circ).toFixed(2)}`;
      const rot = `rotate(${-90 + (off / total) * 360} ${c} ${c})`;
      off += s.value;
      return `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}" stroke-dasharray="${dash}" transform="${rot}"><title>${s.label} — ${fmt(frac * 100, 1)}%</title></circle>`;
    }).join('');
    el.innerHTML =
      `<svg viewBox="0 0 ${size} ${size}" class="w-full max-w-[168px] mx-auto" role="img" aria-label="${el.dataset.alt || ''}">${arcs}</svg>`;
  }

  /** Squarified treemap — used for the sector heatmap. */
  function treemap(items, W, H) {
    const total = items.reduce((a, d) => a + d.value, 0);
    const scaled = items.map((d) => Object.assign({}, d, { area: (d.value / total) * W * H }));
    const out = [];
    let x = 0, y = 0, w = W, h = H;

    const worst = (row, len) => {
      const s = row.reduce((a, d) => a + d.area, 0);
      const mx = Math.max.apply(null, row.map((d) => d.area));
      const mn = Math.min.apply(null, row.map((d) => d.area));
      return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
    };

    const layout = (row, len, horizontal) => {
      const s = row.reduce((a, d) => a + d.area, 0);
      const thick = s / len;
      let pos = horizontal ? x : y;
      row.forEach((d) => {
        const side = d.area / thick;
        out.push(horizontal
          ? Object.assign({}, d, { x: pos, y, w: side, h: thick })
          : Object.assign({}, d, { x, y: pos, w: thick, h: side }));
        pos += side;
      });
      if (horizontal) { y += thick; h -= thick; } else { x += thick; w -= thick; }
    };

    let row = [];
    const queue = scaled.slice().sort((a, b) => b.area - a.area);
    while (queue.length) {
      const horizontal = w >= h;
      const len = horizontal ? w : h;
      const next = queue[0];
      if (!row.length || worst(row.concat([next]), len) <= worst(row, len)) {
        row.push(queue.shift());
      } else {
        layout(row, len, horizontal);
        row = [];
      }
    }
    if (row.length) layout(row, w >= h ? w : h, w >= h);
    return out;
  }

  /* Discrete colour ramp for the heatmap — five steps each way, like a board. */
  function heatColor(pct) {
    const a = Math.min(1, Math.abs(pct) / 3);
    if (Math.abs(pct) < 0.05) return cvar('--c-ref', 0.28);
    return pct > 0 ? cvar('--c-up', 0.18 + a * 0.62) : cvar('--c-down', 0.18 + a * 0.62);
  }

  /* ============================================== 5. SHARED RENDERERS   */

  const ICONS = {
    check: '<path d="m5 13 4 4L19 7"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowUp: '<path d="M12 19V5m0 0-7 7m7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14m0 0 7-7m-7 7-7-7"/>',
  };

  function icon(name, cls) {
    return `<svg class="${cls || 'w-4 h-4'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  /**
   * Renders the Vietnamese price board (bảng giá).
   * Column order matches the official HOSE board so the layout is familiar:
   * ticker | ceiling | floor | ref | 3 bid levels | matched | 3 ask levels |
   * total volume | high | low | foreign buy | foreign sell
   */
  function renderBoard(tbody, rows) {
    tbody.innerHTML = rows.map((s) => {
      const c = pxClass(s.last, s.ref, s.ceil, s.floor);
      const cell = (p, v) => {
        if (p == null) return '<td class="num text-muted">—</td><td class="num text-muted">—</td>';
        const k = pxClass(p, s.ref, s.ceil, s.floor);
        return `<td class="num ${k}">${fmt(p, 2)}</td><td class="num text-muted">${fmt(v / 10, 1)}</td>`;
      };
      return (
        `<tr data-sym="${s.sym}">` +
        `<td><a href="stock.html?sym=${s.sym}" class="font-bold ${c} hover:underline">${s.sym}</a>` +
        `<span class="ml-1.5 text-[10px] font-semibold text-muted">${s.exch}</span></td>` +
        `<td class="num px-ceil">${fmt(s.ceil, 2)}</td>` +
        `<td class="num px-floor">${fmt(s.floor, 2)}</td>` +
        `<td class="num px-ref">${fmt(s.ref, 2)}</td>` +
        cell(s.bids[2][0], s.bids[2][1]) + cell(s.bids[1][0], s.bids[1][1]) + cell(s.bids[0][0], s.bids[0][1]) +
        `<td class="num font-semibold ${c}">${fmt(s.last, 2)}</td>` +
        `<td class="num ${c}">${fmt(s.volume / 10 / 1000, 1)}</td>` +
        `<td class="num ${c}">${fmtSigned(s.chg, 2)}</td>` +
        cell(s.asks[0][0], s.asks[0][1]) + cell(s.asks[1][0], s.asks[1][1]) + cell(s.asks[2][0], s.asks[2][1]) +
        `<td class="num font-medium">${fmt(s.volume / 10 / 1000, 1)}</td>` +
        `<td class="num ${pxClass(s.high, s.ref, s.ceil, s.floor)}">${fmt(s.high, 2)}</td>` +
        `<td class="num ${pxClass(s.low, s.ref, s.ceil, s.floor)}">${fmt(s.low, 2)}</td>` +
        `<td class="num text-muted">${fmt(s.fBuy / 1000, 0)}</td>` +
        `<td class="num text-muted">${fmt(s.fSell / 1000, 0)}</td>` +
        `</tr>`
      );
    }).join('');
  }

  /* ------------------------------------------------------ shell wiring */

  function initTabs(root) {
    (root || document).querySelectorAll('[data-tab]').forEach((btn) => {
      if (btn.dataset.tabBound) return;
      btn.dataset.tabBound = '1';
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        const group = id.split(':')[0];
        document.querySelectorAll(`[data-tab^="${group}:"]`).forEach((b) => {
          b.setAttribute('aria-selected', String(b.dataset.tab === id));
        });
        document.querySelectorAll(`[data-tabpanel^="${group}:"]`).forEach((p) => {
          p.hidden = p.dataset.tabpanel !== id;
        });
        document.dispatchEvent(new CustomEvent('tabchange', { detail: { group, id } }));
      });
    });
  }

  /* Radio groups with no bespoke handler (density, price unit …) still need to
     show their selection. Groups that do have one set the same attribute, so
     running both is harmless. */
  function initRadioGroups() {
    document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
      if (group.dataset.rgBound) return;
      group.dataset.rgBound = '1';
      const radios = Array.from(group.querySelectorAll('[role="radio"]'));
      radios.forEach((r) => r.addEventListener('click', () => {
        radios.forEach((x) => x.setAttribute('aria-checked', String(x === r)));
      }));
    });
  }

  /* Same for display-only tab strips such as the chart timeframes, which change
     no panel but must still look selected. */
  function initPlainTabs() {
    document.querySelectorAll('[role="tablist"]').forEach((list) => {
      if (list.dataset.tlBound) return;
      list.dataset.tlBound = '1';
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      if (tabs.some((t) => t.dataset.tab)) return; // initTabs owns these
      tabs.forEach((t) => t.addEventListener('click', () => {
        tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      }));
    });
  }

  function initSwitches() {
    document.querySelectorAll('[role="switch"]').forEach((sw) => {
      if (sw.dataset.swBound) return;
      sw.dataset.swBound = '1';
      sw.addEventListener('click', () => {
        sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      });
    });
  }

  function initDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach((btn) => {
      if (btn.dataset.ddBound) return;
      btn.dataset.ddBound = '1';
      const menu = document.getElementById(btn.dataset.dropdown);
      if (!menu) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !menu.hidden;
        document.querySelectorAll('[data-dropdown-menu]').forEach((m) => { m.hidden = true; });
        menu.hidden = open;
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('[data-dropdown-menu]').forEach((m) => { m.hidden = true; });
      document.querySelectorAll('[data-dropdown]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    });
  }

  function initSidebar() {
    const toggle = document.querySelector('[data-sidebar-toggle]');
    const sidebar = document.querySelector('[data-sidebar]');
    const scrim = document.querySelector('[data-sidebar-scrim]');
    if (!toggle || !sidebar) return;
    const close = () => {
      sidebar.classList.add('-translate-x-full');
      if (scrim) scrim.hidden = true;
    };
    toggle.addEventListener('click', () => {
      const hidden = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full', !hidden);
      if (scrim) scrim.hidden = !hidden;
    });
    if (scrim) scrim.addEventListener('click', close);
  }

  function initToggles() {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    });
    document.querySelectorAll('[data-theme-value]').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(btn.dataset.themeValue));
    });
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(window.getLang() === 'vi' ? 'en' : 'vi'));
    });
    document.querySelectorAll('[data-lang-value]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.langValue));
    });
  }

  /* Elements marked data-render are re-run when locale or theme changes. */
  const renderers = new Set();
  function onRender(fn) { renderers.add(fn); fn(); }
  function rerender() { renderers.forEach((f) => f()); }

  document.addEventListener('themechange', () => {
    redraws.forEach((f) => f());
    rerender();
  });
  document.addEventListener('langchange', () => rerender());

  /* A canvas inside a hidden tab panel has zero size and skips its first draw.
     Redraw once the panel becomes visible. */
  document.addEventListener('tabchange', () => {
    requestAnimationFrame(() => redraws.forEach((f) => f()));
  });

  /* --------------------------------------------------------------- boot */

  function boot() {
    let lang = 'vi';
    try { lang = localStorage.getItem(LANG_KEY) || 'vi'; } catch (e) { /* ignore */ }
    setLang(lang);
    setTheme(currentTheme());
    initToggles();
    initTabs();
    initPlainTabs();
    initRadioGroups();
    initSwitches();
    initDropdowns();
    initSidebar();
    document.dispatchEvent(new CustomEvent('appready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ------------------------------------------------------------ exports */
  window.VN = {
    setTheme, setLang, currentTheme,
    fmt, fmtSigned, money, vol,
    pxClass, chgClass, ceilPrice, floorPrice, snapTick, tick, LIMIT,
    STOCKS, BY_SYM, SECTORS, SECTOR_ROWS, INDICES, BREADTH, NEWS,
    HOLDINGS, WATCHLIST, ALERTS,
    intraday, candles, mulberry32, hash,
    cvar, autoDraw, areaChart, candleChart, barsChart, sparkline, donut, treemap, heatColor,
    renderBoard, icon, initTabs, initSwitches, onRender, rerender,
  };
})();
