import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule";
import { mergeAttributes } from "@tiptap/react";

export const HorizontalRule = TiptapHorizontalRule.extend({
  renderHTML({ HTMLAttributes }) {
    return ["hr", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
});

export default HorizontalRule;
