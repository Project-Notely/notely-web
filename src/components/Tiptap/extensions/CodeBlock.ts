import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const TailwindCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      class: {
        default:
          "rounded-md bg-slate-900 text-slate-100 p-4 text-sm overflow-auto",
      },
    };
  },
}).configure({ lowlight });

export default TailwindCodeBlock;
