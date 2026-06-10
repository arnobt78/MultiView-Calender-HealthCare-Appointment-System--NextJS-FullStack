import type { ControlPanelChromeRegistry } from "@/components/control-panel/ControlPanelChromeContext";

/** Merge partial slot updates — returns null when unchanged. */
export function mergeControlPanelChromeRegistrySlice(
  prev: ControlPanelChromeRegistry,
  slice: Partial<ControlPanelChromeRegistry>
): ControlPanelChromeRegistry | null {
  const next: ControlPanelChromeRegistry = {
    actions: slice.actions !== undefined ? slice.actions : prev.actions,
    toolbar: slice.toolbar !== undefined ? slice.toolbar : prev.toolbar,
    description:
      slice.description !== undefined ? slice.description : prev.description,
    title: slice.title !== undefined ? slice.title : prev.title,
  };

  const changed =
    next.actions !== prev.actions ||
    next.toolbar !== prev.toolbar ||
    next.description !== prev.description ||
    next.title !== prev.title;

  return changed ? next : null;
}
