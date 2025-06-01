# fontme

**Easiest way to add Google Fonts to your Next.js 15 + Tailwind CSS v4 project.**

Skip the boilerplate and let `fontme` handle:
- Importing fonts from `next/font/google`
- Adding CSS variables via the new `@theme` syntax in `globals.css`
- Updating `app/layout.tsx` to apply the font globally
- Allowing you to give each font a custom alias like `font-primary`, `font-heading`, etc.

---

## ✨ Features

-  One-command Google Fonts integration  
-  Intelligent nickname support (e.g. `font-body`, `font-brand`)  
-  Tailored for Tailwind CSS v4 with no `tailwind.config.js` required  
-  Works with Next.js 15 app directory structure  

---

## 📦 Installation

You can run it directly with `npx`:

```bash
npx fontme roboto
```

Or install it globally:

```bash
bun install -g fontme
# OR
npm install -g fontme
```

---

## 🛠 How It Works

1. Prompts you for a nickname (alias) for the font.
2. Updates `app/layout.tsx` to import the font from `next/font/google` and apply the variable + alias.
3. Adds a `@theme` variable in `globals.css`:
   ```css
   @theme {
     --font-roboto: 'Roboto', sans-serif;
   }
   ```

---

## 🧪 Example

```bash
npx fontme roboto
```

Then when prompted:

```
Give "roboto" a nickname (e.g. "primary"): body
```

Updates your layout:

```ts
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
});
```

Applies it in the body:

```tsx
<body className={`${roboto.variable} font-body`}>
```

---

## 💡 Tip

If you try to reuse a nickname that already exists in your layout, `fontme` will ask you to choose a different one.

---

## 📄 License

MIT © [Fahad-Dezloper](https://github.com/Fahad-Dezloper)