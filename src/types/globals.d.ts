// Global type augmentations

declare global {
  interface Window {
    /** Set by PosthogProvider once initialized. Used to guard analytics calls. */
    __ph_initialized?: boolean
  }
}

export {}
