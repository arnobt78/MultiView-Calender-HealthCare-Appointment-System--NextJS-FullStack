/**
 * SSR chrome fragments for CP merged header — icon tile + title (no hooks).
 * Subtitle defaults via `defaultDescription` on `ControlPanelSectionPageClient`.
 */

import { getControlPanelPageChromeConfig } from "@/lib/control-panel-page-chrome-config";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import {
  PAGE_CHROME_TONE_CLASSES,
  pageChromeTitleStackClass,
  pageHeaderTitleClass,
} from "@/lib/page-chrome-classes";

/** Tone icon tile only — pairs with client `ControlPanelChromeDescriptionSlot`. */
export function ControlPanelChromeIconServer({
  tab,
}: {
  tab: ControlPanelSidebarTabValue;
}) {
  const config = getControlPanelPageChromeConfig(tab);
  const toneClasses = PAGE_CHROME_TONE_CLASSES[config.tone];
  const Icon = config.icon;

  return (
    <span className={toneClasses.tile} aria-hidden>
      <Icon className={toneClasses.icon} />
    </span>
  );
}

/** SSR title node — sits in client title stack above description slot. */
export function ControlPanelChromeTitleServer({
  tab,
}: {
  tab: ControlPanelSidebarTabValue;
}) {
  const config = getControlPanelPageChromeConfig(tab);
  return (
    <div role="heading" aria-level={1} className={pageHeaderTitleClass}>
      {config.title}
    </div>
  );
}

/** @deprecated Use icon + title fragments in merged shell. */
export function ControlPanelChromeStaticServer({
  tab,
}: {
  tab: ControlPanelSidebarTabValue;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-2">
      <ControlPanelChromeIconServer tab={tab} />
      <div className={pageChromeTitleStackClass}>
        <ControlPanelChromeTitleServer tab={tab} />
      </div>
    </div>
  );
}
