import {
  bindGiscusWidgetLifecycle,
  renderGiscusWidgets,
} from "@/utils/giscusWidget";

declare global {
  interface Window {
    __giscusLifecycleBound?: boolean;
  }
}

if (typeof document !== "undefined") {
  if (!window.__giscusLifecycleBound) {
    bindGiscusWidgetLifecycle({ document, eventTarget: document });
    window.__giscusLifecycleBound = true;
  } else {
    renderGiscusWidgets(document);
  }
}
