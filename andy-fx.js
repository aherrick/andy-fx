/*! AndyFX — seasonal effects for any website. MIT. https://github.com/aherrick/andy-fx */
(function (global) {
  'use strict';

  // ───────────── Themes: everything visual lives here ─────────────
  // motion: down | rise | cross | pop.  every: ms between sprites at "normal" intensity.
  // Optional: color, size [min,max] px, duration [min,max] ms, extra (a rare bonus sprite).
  const THEMES = {
    halloween:    { chars: ['🦇', '🦇', '👻', '🎃'], motion: 'cross', every: 1700 },
    christmas:    { chars: ['❄', '❅', '❆'], motion: 'down', every: 450, color: '#d8edff',
                    extra: { chars: ['🎅🛷'], motion: 'cross', chance: 0.012, size: [36, 36] } },
    fireworks:    { chars: ['🎆', '🎇', '✨'], motion: 'pop', every: 700, size: [40, 90], duration: [1200, 1800] },
    valentines:   { chars: ['♥', '💕', '💗'], motion: 'rise', every: 700, color: '#ff75aa' },
    stpatricks:   { chars: ['☘', '🍀'], motion: 'down', every: 850, color: '#5bdfa3' },
    easter:       { chars: ['🥚', '🐰', '🌷'], motion: 'rise', every: 1400 },
    thanksgiving: { chars: ['🍁', '🍂', '🦃'], motion: 'down', every: 1050 },
    lunarnewyear: { chars: ['🏮', '🧧', '✨'], motion: 'rise', every: 1100 },
    spring:       { chars: ['🌸', '🌼', '🦋'], motion: 'down', every: 1250 },
    summer:       { chars: ['🫧', '✨', '🦋'], motion: 'rise', every: 1700 },
    autumn:       { chars: ['🍁', '🍂', '🍃'], motion: 'down', every: 900 },
    winter:       { chars: ['❄', '❅', '❆'], motion: 'down', every: 570, color: '#d8edff' }
  };

  const REGIONS = {
    western:  ['US', 'CA', 'GB', 'IE', 'AU', 'NZ'],
    lunar:    ['CN', 'TW', 'HK', 'SG'],
    southern: ['AU', 'NZ', 'ZA', 'AR', 'CL', 'UY', 'BR']
  };

  // First match wins. Omit `countries` for holidays shown everywhere.
  const HOLIDAYS = [
    { theme: 'fireworks',    when: between('12-31', '01-01') },
    { theme: 'fireworks',    when: between('07-03', '07-04'), countries: ['US'] },
    { theme: 'fireworks',    when: between('07-01', '07-01'), countries: ['CA'] },
    { theme: 'fireworks',    when: between('11-05', '11-05'), countries: ['GB'] },
    { theme: 'halloween',    when: between('10-24', '10-31'), countries: REGIONS.western },
    { theme: 'christmas',    when: between('12-01', '12-30') },
    { theme: 'valentines',   when: between('02-10', '02-14') },
    { theme: 'stpatricks',   when: between('03-13', '03-17'), countries: REGIONS.western },
    { theme: 'lunarnewyear', when: lunarNewYear(0, 4), countries: REGIONS.lunar },
    { theme: 'thanksgiving', when: nthWeekday(11, 4, 4, 1, 1), countries: ['US'] },
    { theme: 'thanksgiving', when: nthWeekday(10, 1, 2, 2, 0), countries: ['CA'] },
    { theme: 'easter',       when: aroundEaster(5, 1) }
  ];

  // Meteorological seasons: Dec–Feb, Mar–May, Jun–Aug, Sep–Nov.
  const SEASONS = {
    north: ['winter', 'spring', 'summer', 'autumn'],
    south: ['summer', 'autumn', 'winter', 'spring']
  };

  // Multiplier applied to each theme's `every`.
  const INTENSITY = { subtle: 1.8, normal: 1, party: 0.55 };

  const CSS = `
    :host { all: initial; position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; overflow: hidden; }
    .fx { position: absolute; top: 0; left: 0; font: var(--size)/1 system-ui, sans-serif; color: var(--color, inherit);
          user-select: none; will-change: transform, opacity; animation: var(--dur) linear both; }
    .down  { animation-name: down; }
    .rise  { animation-name: rise; }
    .cross { animation-name: cross; }
    .pop   { animation-name: pop; animation-timing-function: ease-out; }
    @keyframes down  { 0%   { transform: translate(var(--x0), -10vh) rotate(-20deg); opacity: 0 }
                       10%, 85% { opacity: .9 }
                       100% { transform: translate(var(--x1), 110vh) rotate(30deg); opacity: 0 } }
    @keyframes rise  { 0%   { transform: translate(var(--x0), 110vh); opacity: 0 }
                       10%, 85% { opacity: .9 }
                       100% { transform: translate(var(--x1), -10vh); opacity: 0 } }
    @keyframes cross { 0%   { transform: translate(var(--x0), var(--y0)) scaleX(var(--flip)); opacity: 0 }
                       10%, 85% { opacity: .9 }
                       100% { transform: translate(var(--x1), var(--y1)) scaleX(var(--flip)); opacity: 0 } }
    @keyframes pop   { 0%   { transform: translate(var(--x0), var(--y0)) scale(.2); opacity: 0 }
                       30%  { opacity: 1 }
                       100% { transform: translate(var(--x0), var(--y0)) scale(1.6); opacity: 0 } }
  `;

  // ───────────── Date rules ─────────────
  function mmdd(date) {
    return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function between(from, to) {
    return date => {
      const day = mmdd(date);
      return from <= to ? day >= from && day <= to : day >= from || day <= to;
    };
  }

  function nthWeekday(month, weekday, n, daysBefore = 0, daysAfter = 0) {
    return around(year => {
      const first = new Date(year, month - 1, 1).getDay();
      return new Date(year, month - 1, 1 + (weekday - first + 7) % 7 + (n - 1) * 7);
    }, daysBefore, daysAfter);
  }

  function aroundEaster(daysBefore, daysAfter) {
    return around(easter, daysBefore, daysAfter);
  }

  // True within daysBefore/daysAfter of the date target(year) returns.
  function around(target, daysBefore, daysAfter) {
    return date => {
      const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diff = Math.round((day - target(date.getFullYear())) / 864e5);
      return diff >= -daysBefore && diff <= daysAfter;
    };
  }

  // First day of Lunar New Year (MMDD) for 2024–2060. A table, because browsers' Chinese
  // calendars are a day off in some years (2027, 2030).
  const LUNAR_NEW_YEARS = ('0210 0129 0217 0206 0126 0213 0203 0123 0211 0131 0219 0208 0128 0215 0204 0124 0212 ' +
    '0201 0122 0210 0130 0217 0206 0126 0214 0202 0123 0211 0201 0219 0208 0128 0215 0204 0124 0212 0202').split(' ');

  function lunarNewYear(daysBefore, daysAfter) {
    return around(year => {
      const mmdd = LUNAR_NEW_YEARS[year - 2024];
      return mmdd ? new Date(year, mmdd.slice(0, 2) - 1, +mmdd.slice(2)) : new Date(NaN);
    }, daysBefore, daysAfter);
  }

  // Anonymous Gregorian algorithm.
  function easter(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    return new Date(year, Math.floor(n / 31) - 1, (n % 31) + 1);
  }

  // ───────────── Detection ─────────────
  // Region from the browser locale (en-GB → GB). A hint, not geolocation.
  function detectCountry() {
    const nav = global.navigator;
    for (const locale of [...(nav?.languages || []), nav?.language]) {
      try {
        const region = new Intl.Locale(locale).region;
        if (/^[A-Z]{2}$/.test(region)) return region;
      } catch {}
    }
    return null;
  }

  const resolveCountry = country => country === 'auto' ? detectCountry() : (country ?? '').toUpperCase();

  function detectTheme(date = new Date(), { country = 'auto', fallback = 'none' } = {}) {
    const c = resolveCountry(country);
    const holiday = HOLIDAYS.find(h => (!h.countries || h.countries.includes(c)) && h.when(date));
    if (holiday) return holiday.theme;
    if (fallback !== 'seasonal') return 'off';
    const hemisphere = REGIONS.southern.includes(c) ? 'south' : 'north';
    return SEASONS[hemisphere][Math.floor(((date.getMonth() + 1) % 12) / 3)];
  }

  // Next holidays as date ranges; one already underway keeps its real start date.
  function upcoming({ country = 'auto', limit = 6 } = {}) {
    const c = resolveCountry(country);
    const today = new Date();
    const ranges = [];
    for (let i = -31; i < 366; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const theme = detectTheme(date, { country: c });
      const last = ranges.at(-1);
      if (last && last.theme === theme && last.day === i - 1) Object.assign(last, { end: date, day: i });
      else if (theme !== 'off') ranges.push({ theme, start: date, end: date, day: i, first: i });
    }
    return ranges.filter(r => r.day >= 0).slice(0, limit)
      .map(({ theme, start, end, first }) => ({ theme, start, end, now: first <= 0 }));
  }

  function validate(options) {
    const { theme, intensity, fallback, country } = options;
    if (theme !== 'auto' && theme !== 'off' && !THEMES[theme]) throw new Error(`AndyFX: unknown theme "${theme}"`);
    if (!INTENSITY[intensity]) throw new Error('AndyFX: intensity must be subtle, normal, or party');
    if (fallback !== 'none' && fallback !== 'seasonal') throw new Error('AndyFX: fallback must be none or seasonal');
    return { ...options, country: country === 'auto' ? 'auto' : String(country).toUpperCase() };
  }

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = list => list[Math.floor(Math.random() * list.length)];

  // ───────────── Engine ─────────────
  class AndyFX {
    static themes = Object.keys(THEMES);
    static detectCountry = detectCountry;
    static detectTheme = detectTheme;
    static upcoming = upcoming;

    constructor(options = {}) {
      this.options = validate({ theme: 'auto', country: 'auto', fallback: 'none', intensity: 'normal', ...options });
      this._theme = 'off';
    }

    get theme()   { return this._theme; }
    get country() { return resolveCountry(this.options.country); }
    get running() { return Boolean(this._clock); }

    start() {
      if (this.running || !global.document || global.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return this;
      this._clock = setInterval(() => this._sync(), 60000);
      this._sync();
      return this;
    }

    stop() {
      clearInterval(this._clock);
      clearInterval(this._spawner);
      this._clock = this._spawner = null;
      this._theme = 'off';
      this._stage?.replaceChildren();
      return this;
    }

    destroy() {
      this.stop();
      this._host?.remove();
      this._host = this._stage = null;
      return this;
    }

    setTheme(theme)         { return this._set({ theme }); }
    setIntensity(intensity) { return this._set({ intensity }); }
    setFallback(fallback)   { return this._set({ fallback }); }
    setCountry(country)     { return this._set({ country }); }

    _set(changes) {
      this.options = validate({ ...this.options, ...changes });
      if (this.running) this._sync();
      return this;
    }

    _sync() {
      const next = this.options.theme === 'auto' ? detectTheme(new Date(), this.options) : this.options.theme;
      if (next !== this._theme) this._stage?.replaceChildren();
      this._theme = next;
      clearInterval(this._spawner);
      const theme = THEMES[next];
      if (theme) this._spawner = setInterval(() => document.hidden || this._spawn(theme), theme.every * INTENSITY[this.options.intensity]);
    }

    _spawn(theme) {
      this._sprite(theme);
      if (theme.extra && Math.random() < theme.extra.chance) this._sprite(theme.extra);
    }

    _sprite({ chars, motion, color, size = [20, 34], duration = [6500, 11500] }) {
      const el = document.createElement('span');
      const cross = motion === 'cross', ltr = Math.random() < 0.5, x = rand(4, 96), y = rand(10, 80);
      const vars = {
        '--dur':  rand(...duration) + 'ms',
        '--size': rand(...size) + 'px',
        '--x0':   (cross ? (ltr ? -12 : 112) : x) + 'vw',
        '--x1':   (cross ? (ltr ? 112 : -12) : x + rand(-15, 15)) + 'vw',
        '--y0':   y + 'vh',
        '--y1':   (cross ? rand(10, 80) : y) + 'vh',
        '--flip': ltr ? 1 : -1
      };
      if (color) vars['--color'] = color;
      for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, value);
      el.className = 'fx ' + motion;
      el.textContent = pick(chars);
      el.addEventListener('animationend', () => el.remove());
      this._mount().append(el);
    }

    _mount() {
      if (!this._stage) {
        this._host = document.createElement('div');
        this._host.setAttribute('aria-hidden', 'true');
        const root = this._host.attachShadow({ mode: 'open' });
        root.innerHTML = `<style>${CSS}</style><div></div>`;
        this._stage = root.lastChild;
        document.body.append(this._host);
      }
      return this._stage;
    }
  }

  global.AndyFX = AndyFX;
  if (typeof module === 'object' && module.exports) module.exports = AndyFX;
})(globalThis);
