import Blockquote from "@tiptap/extension-blockquote";

export const TailwindBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      class: {
        default:
          "border-l-4 border-slate-300 pl-4 italic text-slate-700 dark:text-slate-300",
      },
    };
  },
});

export default TailwindBlockquote;
