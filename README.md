# 🧢 fontme

**Add Google Fonts to your Next.js 15 + Tailwind CSS v4 project in seconds — with custom nicknames like `font-homie`.**

No more manual importing, copy-pasting, or setup.  
Just one command and `fontme` wires it all up for you.

---

## ✨ What It Does

`fontme` handles the boring stuff:
- Imports fonts from `next/font/google`
- Adds `@theme` CSS variables to `globals.css`
- Updates `app/layout.tsx` with your font + alias
- Lets you nickname fonts like `font-body`, `font-brand`, etc.

---

## 🔥 Features

-  One-command Google Fonts setup  
-  Custom alias support (e.g. `font-primary`, `font-logo`)  
-  Built for Tailwind CSS v4 (no config editing needed)  
-  Works with Next.js 15 App Router  

---

## ⚡️ Install & Run

Use it instantly via `npx`:

```bash
npx fontme
```

Or install it globally:

```bash
bun install -g fontme
# OR
npm install -g fontme
```

---

## ⚙️ How It Works

1. Asks you to give your font a nickname (like `body`, `display`, etc.)
2. Automatically updates `app/layout.tsx` with the font import and usage
3. Injects this into your `globals.css`:

```css
@theme {
  --font-roboto: 'Roboto', sans-serif;
}
```

And applies it to your layout:

```tsx
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
});
```

```tsx
<body className={`${roboto.variable} font-body`}>
```

---

## 🧪 Example

```bash
npx fontme
```

When prompted:

```
Give "roboto" a nickname (e.g. "primary"): body
```

You now have `font-body` ready to use in your Tailwind project!

---

## 💡 Pro Tip

Reusing an alias? `fontme` will warn you and ask for a new one — no accidental overwrites.

---

## 🪪 License

MIT © [Fahad-Dezloper](https://github.com/Fahad-Dezloper)