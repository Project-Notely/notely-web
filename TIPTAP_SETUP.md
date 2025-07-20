# 📝 Tiptap Editor Setup Documentation

## Overview

This project now includes a fully-featured rich text editor powered by [Tiptap](https://tiptap.dev/), a headless wrapper around ProseMirror. The editor provides a modern, extensible, and accessible editing experience.

## 🚀 What's Included

### Core Components

- **SimpleEditor**: Full-featured editor with toolbar and formatting options
- **TextEditor**: Wrapper component for easy integration
- **TextEditorPage**: Page component showcasing the editor

### Features

- ✅ **Rich Text Formatting**: Bold, italic, underline, strikethrough
- ✅ **Headings**: H1-H6 with dropdown selection
- ✅ **Lists**: Ordered, unordered, and task lists
- ✅ **Text Alignment**: Left, center, right, justify
- ✅ **Code Blocks**: Syntax highlighting with lowlight
- ✅ **Links**: Link insertion and editing
- ✅ **Images**: Image upload and insertion
- ✅ **Blockquotes**: Quote formatting
- ✅ **Highlighting**: Text highlighting with color options
- ✅ **Subscript/Superscript**: Advanced text formatting
- ✅ **Undo/Redo**: Full history management
- ✅ **Typography**: Smart typography enhancements
- ✅ **Theme Toggle**: Dark/light mode support

## 📁 File Structure

```
src/
├── components/
│   ├── TextEditor.tsx                    # Main wrapper component
│   └── tiptap-templates/
│       └── simple/
│           ├── simple-editor.tsx         # Core editor component
│           ├── simple-editor.scss        # Editor styles
│           └── theme-toggle.tsx          # Theme toggle component
├── pages/
│   └── TextEditorPage/
│       └── index.tsx                     # Editor page component
├── utils/
│   └── editorConfig.ts                   # Editor configuration
└── styles/
    ├── _variables.scss                   # Tiptap SCSS variables
    └── _keyframe-animations.scss         # Editor animations
```

## 🛠 Installation Details

### Dependencies Installed

```json
{
  "@tiptap/react": "^3.0.7",
  "@tiptap/starter-kit": "^3.0.7",
  "@tiptap/pm": "^3.0.7",
  "@tiptap/extension-*": "^3.0.7",
  "@floating-ui/react": "^0.27.13",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "@radix-ui/react-popover": "^1.1.14",
  "react-hotkeys-hook": "^5.1.0",
  "lowlight": "^3.3.0",
  "sass": "^1.89.2"
}
```

### CLI Command Used

```bash
bunx @tiptap/cli@latest add simple-editor
```

## 🎯 Usage

### Basic Usage

```tsx
import TextEditor from "@/components/TextEditor";

function MyPage() {
  return (
    <div>
      <TextEditor className='min-h-[400px]' />
    </div>
  );
}
```

### Advanced Usage with Configuration

```tsx
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { EDITOR_CONFIG } from "@/utils/editorConfig";

function AdvancedEditor() {
  return (
    <div className='editor-container'>
      <SimpleEditor />
    </div>
  );
}
```

## 🎨 Styling

### SCSS Integration

The editor uses SCSS files that are imported into the global CSS:

```scss
/* In src/styles/global.css */
@import "./_variables.scss";
@import "./_keyframe-animations.scss";
```

### Customizing Styles

To customize the editor appearance:

1. **Modify SCSS variables** in `src/styles/_variables.scss`
2. **Override component styles** in your custom CSS
3. **Use Tailwind classes** for wrapper styling

### Theme Support

The editor includes automatic dark/light theme detection and can be toggled using the ThemeToggle component.

## 🔧 Configuration

### Editor Configuration

Located in `src/utils/editorConfig.ts`:

```typescript
export const EDITOR_CONFIG = {
  placeholder: "Start writing your document...",
  autoSave: {
    enabled: true,
    delay: 2000,
  },
  characterLimit: {
    enabled: false,
    max: 10000,
  },
  // ... more options
};
```

## 🚦 Navigation

The editor is accessible via:

- **URL**: `/editor`
- **Navigation**: "Text Editor" in the header menu

## 🔍 Available Extensions

The editor includes these Tiptap extensions:

- `StarterKit` - Basic functionality
- `Image` - Image handling
- `TaskList` & `TaskItem` - Task lists
- `TextAlign` - Text alignment
- `Typography` - Smart typography
- `Highlight` - Text highlighting
- `Subscript` & `Superscript` - Advanced formatting
- `HorizontalRule` - Dividers
- `ImageUploadNode` - Custom image upload

## 📊 Performance

### Optimizations

- **Code splitting**: Editor components are loaded on demand
- **SCSS compilation**: Styles are optimized during build
- **Tree shaking**: Unused Tiptap extensions are excluded

## 🔮 Future Enhancements

Potential additions:

- [ ] Real-time collaboration
- [ ] Document auto-save to backend
- [ ] Export to multiple formats
- [ ] Advanced table support
- [ ] Math equation support
- [ ] Custom slash commands
- [ ] Commenting system

## 🐛 Troubleshooting

### Common Issues

1. **Styles not loading**: Ensure SCSS imports are in global.css
2. **Missing dependencies**: Run `bun install` to install all packages
3. **Type errors**: Make sure all Tiptap packages are the same version

### Debug Mode

To enable debug logging, add to your environment:

```env
VITE_DEBUG_TIPTAP=true
```

## 📚 Resources

- [Tiptap Documentation](https://tiptap.dev/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [React Integration](https://tiptap.dev/docs/installation/react)

---

The Tiptap editor is now fully integrated and ready for use! 🎉
