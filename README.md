# ✨ AndyFX

[![Release](https://img.shields.io/github/v/release/aherrick/andy-fx)](https://github.com/aherrick/andy-fx/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Seasonal effects for any website. One script tag — AndyFX reads the visitor's date and browser locale, picks the right holiday, and quietly animates. Fully client-side: no APIs, no tracking, no setup.

**[Live demo & playground →](https://aherrick.github.io/andy-fx/)**

## Usage

```html
<script src="https://cdn.jsdelivr.net/gh/aherrick/andy-fx@1/andy-fx.min.js"></script>
<script>
  new AndyFX().start();
</script>
```

## Options

| Option      | Default    | Values                                                     |
| ----------- | ---------- | ---------------------------------------------------------- |
| `theme`     | `'auto'`   | `'auto'`, `'off'`, or any name in `AndyFX.themes`          |
| `country`   | `'auto'`   | ISO code like `'US'`, or `'auto'` to read the browser locale |
| `intensity` | `'normal'` | `'subtle'`, `'normal'`, `'party'`                          |
| `fallback`  | `'none'`   | `'seasonal'` shows the season when there's no holiday      |

Respects `prefers-reduced-motion`, even if it changes mid-visit. Give visitors an off switch with `fx.optOut()` / `fx.optIn()`, which is remembered per site. See the [demo page](https://aherrick.github.io/andy-fx/#api) for the full API.

## License

[MIT](LICENSE)
