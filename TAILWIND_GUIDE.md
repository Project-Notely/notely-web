# Tailwind CSS Guide for Notely Web

This guide covers how to use Tailwind CSS effectively in your Notely Web project.

## 🎨 What's Included

### Core Setup

- **Tailwind CSS v4.1.11** - Latest version with Vite plugin integration
- **@tailwindcss/vite** - Official Vite plugin for optimal performance
- **No PostCSS Configuration** - Simplified setup with direct Vite integration
- **VS Code Integration** - IntelliSense and auto-completion

### Custom Design System

#### Colors

```css
/* Primary Colors (Blue) */
primary-50  to primary-950

/* Secondary Colors (Gray) */
secondary-50 to secondary-950
```

#### Custom Components

```css
.btn          /* Base button styles */
.btn-primary  /* Primary button */
.btn-secondary /* Secondary button */
.btn-ghost    /* Ghost button */
.card         /* Card container */
.input        /* Form input */
```

#### Custom Animations

```css
animate-fade-in   /* Fade in animation */
animate-slide-in  /* Slide in animation */
```

## 🚀 Usage Examples

### Basic Styling

```tsx
// Responsive layout with dark mode support
<div className='min-h-screen bg-white dark:bg-gray-900'>
  <div className='container mx-auto px-4 py-8'>
    <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
      Hello World
    </h1>
  </div>
</div>
```

### Custom Buttons

```tsx
// Using predefined button components
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-ghost">Ghost Action</button>

// Custom button with Tailwind utilities
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
  Custom Button
</button>
```

### Card Layout

```tsx
// Using the custom card component
<div className="card">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p className="text-secondary-600 dark:text-secondary-400">
    Card content goes here.
  </p>
</div>

// Grid of cards
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
  <div className="card">Card 3</div>
</div>
```

### Form Elements

```tsx
// Using the custom input component
<input
  type="text"
  placeholder="Enter your name"
  className="input"
/>

// Form layout
<form className="space-y-4 max-w-md">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Email
    </label>
    <input type="email" className="input" placeholder="you@example.com" />
  </div>
  <button type="submit" className="btn-primary w-full">
    Submit
  </button>
</form>
```

### Responsive Design

```tsx
// Mobile-first responsive design
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
  <div className='p-4 bg-white rounded-lg shadow'>
    <h3 className='text-lg md:text-xl font-semibold'>Responsive Card</h3>
    <p className='text-sm md:text-base text-gray-600'>
      This card adapts to different screen sizes.
    </p>
  </div>
</div>
```

### Dark Mode

```tsx
// Automatic dark mode support
<div className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white'>
  <h1 className='text-primary-600 dark:text-primary-400'>
    Adapts to system preference
  </h1>
</div>
```

## 🛠️ Development Workflow

### VS Code Integration

- **Auto-completion** - Tailwind classes with IntelliSense
- **Class sorting** - Automatic ordering of Tailwind classes
- **Linting** - CSS validation with Tailwind-aware rules

### Class Organization

Follow this order for Tailwind classes:

1. Layout (display, position, etc.)
2. Box model (margin, padding, etc.)
3. Typography (font, text, etc.)
4. Visual (color, background, etc.)
5. Interactivity (hover, focus, etc.)

```tsx
// Good: Organized class order
<div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow hover:shadow-lg transition-shadow">

// Avoid: Random class order
<div className="hover:shadow-lg bg-white flex transition-shadow border p-4 rounded-lg items-center shadow justify-between">
```

### Performance Tips

#### Use JIT Mode (Enabled by default)

Tailwind generates only the CSS you use, keeping bundle sizes small.

#### Prefer Composition

```tsx
// Good: Reusable component classes
const buttonStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
const primaryButton = `${buttonStyles} bg-primary-600 text-white hover:bg-primary-700`;

// Better: Custom component classes (defined in CSS)
<button className='btn-primary'>Click me</button>;
```

## 🎯 Best Practices

### 1. Use Semantic Color Names

```tsx
// Good: Semantic colors
<div className="bg-primary-600 text-white">Primary content</div>
<div className="text-secondary-600">Secondary content</div>

// Avoid: Raw color values
<div className="bg-blue-600 text-white">Content</div>
```

### 2. Leverage Custom Components

```tsx
// Good: Use predefined components
<div className="card">
  <button className="btn-primary">Action</button>
</div>

// Avoid: Repeating utility classes
<div className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm">
  <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700">
    Action
  </button>
</div>
```

### 3. Mobile-First Responsive Design

```tsx
// Good: Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Avoid: Desktop-first
<div className="text-lg md:text-base sm:text-sm">
  Hard to maintain
</div>
```

### 4. Consistent Spacing Scale

```tsx
// Good: Use consistent spacing
<div className="space-y-4">      {/* 1rem */}
<div className="space-y-6">      {/* 1.5rem */}
<div className="space-y-8">      {/* 2rem */}

// Avoid: Arbitrary spacing
<div className="space-y-[13px]">
<div className="space-y-[22px]">
```

## 🔧 Customization

### Adding Custom Colors

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0f9ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```

### Custom Components

```css
/* src/index.css */
@layer components {
  .btn-outline {
    @apply border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white;
  }
}
```

### Custom Utilities

```css
/* src/index.css */
@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/) - Unstyled, accessible UI components
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground

## 🎨 Design Tokens

### Spacing Scale

- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)

### Typography Scale

- `text-sm` = 14px
- `text-base` = 16px
- `text-lg` = 18px
- `text-xl` = 20px
- `text-2xl` = 24px

### Breakpoints

- `sm` = 640px
- `md` = 768px
- `lg` = 1024px
- `xl` = 1280px
- `2xl` = 1536px

## 🔄 Tailwind CSS v4 Migration

This project uses Tailwind CSS v4 with the new Vite plugin architecture for improved performance and simplified setup.

### Installation (v4)

```bash
# Install Tailwind CSS v4 with Vite plugin
bun add -d tailwindcss @tailwindcss/vite
```

### Configuration

**vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**src/index.css**

```css
@import "tailwindcss";

@layer base {
  /* Your base styles */
}

@layer components {
  /* Your component styles */
}

@layer utilities {
  /* Your utility styles */
}
```

### Key Changes from v3 to v4

1. **Simplified Installation**: No need for PostCSS or autoprefixer
2. **Vite Plugin**: Direct integration with Vite for better performance
3. **CSS Import**: Use `@import "tailwindcss"` instead of three separate directives
4. **Optional Config**: No `tailwind.config.js` required for basic setups
5. **Faster Builds**: Improved performance with native Vite integration

### Migration Steps

1. Remove old dependencies:

   ```bash
   bun remove postcss autoprefixer
   ```

2. Install v4 dependencies:

   ```bash
   bun add -d @tailwindcss/vite
   ```

3. Update Vite config to use the plugin
4. Replace CSS directives with single import
5. Remove `tailwind.config.js` and `postcss.config.js` (if not needed)

### Benefits of v4

- **Performance**: Faster builds and hot reload
- **Simplicity**: Fewer configuration files
- **Modern**: Built for modern bundlers like Vite
- **Reliability**: Better error handling and debugging
