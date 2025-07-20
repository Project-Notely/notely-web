// Text Editor Configuration
export const EDITOR_CONFIG = {
  // Default placeholder text
  placeholder: "Start writing your document...",

  // Auto-save configuration
  autoSave: {
    enabled: true,
    delay: 2000, // 2 seconds
  },

  // Character limit (optional)
  characterLimit: {
    enabled: false,
    max: 10000,
  },

  // Collaboration settings
  collaboration: {
    enabled: false,
  },

  // Export formats
  exportFormats: ["html", "json", "markdown"] as const,
} as const;

export type EditorConfig = typeof EDITOR_CONFIG;
export type ExportFormat = (typeof EDITOR_CONFIG.exportFormats)[number];
