import type { Editor as TldrawEditor } from "@tldraw/tldraw";
import * as React from "react";

type LazyTldrawCanvasProps = {
  onMount: (editor: TldrawEditor) => void;
  isDrawingMode: boolean;
  isTextMode: boolean;
};

export const LazyTldrawCanvas: React.FC<LazyTldrawCanvasProps> = ({
  onMount,
  isDrawingMode,
  isTextMode,
}) => {
  type TLDrawModule = typeof import("@tldraw/tldraw");
  const [mod, setMod] = React.useState<null | TLDrawModule>(null);
  type TLStore = ReturnType<NonNullable<TLDrawModule>["createTLStore"]>;
  const [store, setStore] = React.useState<null | TLStore>(null);

  React.useEffect(() => {
    let isActive = true;
    (async () => {
      const m = await import("@tldraw/tldraw");
      if (!isActive) return;
      setMod(m);
      const s = m.createTLStore({ shapeUtils: m.defaultShapeUtils });
      setStore(s);
    })();
    return () => {
      isActive = false;
    };
  }, []);

  if (!mod || !store) {
    return <div className='w-full h-full min-h-full' />;
  }

  type TldrawProps = {
    store: NonNullable<typeof store>;
    onMount: (editor: TldrawEditor) => void;
    autoFocus?: boolean;
    components?: Record<string, unknown>;
    className?: string;
  };
  const Tldraw = mod.Tldraw as React.ComponentType<TldrawProps>;

  return (
    <Tldraw
      store={store}
      onMount={onMount}
      autoFocus={false}
      components={{
        MainMenu: null,
        QuickActions: null,
        HelpMenu: null,
        DebugMenu: null,
        SharePanel: null,
        MenuPanel: null,
        TopPanel: null,
        NavigationPanel: null,
      }}
      className={[
        "w-full h-full min-h-full",
        isTextMode ? "tldraw-disabled" : "",
        isDrawingMode ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    />
  );
};

export default LazyTldrawCanvas;
