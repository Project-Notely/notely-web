import Heading from "@tiptap/extension-heading";

export const TailwindHeading = Heading.extend({
  addAttributes() {
    return {
      class: {
        default: null,
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level || 1;
    const base = [
      "mt-6 mb-2 font-bold text-slate-900 dark:text-slate-100",
      level === 1 && "text-3xl",
      level === 2 && "text-2xl",
      level === 3 && "text-xl",
      level === 4 && "text-lg",
      level >= 5 && "text-base",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        class: [HTMLAttributes.class, base].filter(Boolean).join(" "),
      },
      0,
    ];
  },
});

export default TailwindHeading;
