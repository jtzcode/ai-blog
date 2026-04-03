export type GiscusWidgetConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  language: string;
};

type GiscusContainer = {
  innerHTML: string;
  appendChild(child: GiscusScript): unknown;
  querySelector(selector: string): unknown;
  getAttribute(name: string): string | null;
};

type GiscusScript = {
  async?: boolean;
  setAttribute(name: string, value: string): void;
};

type GiscusDocument = {
  createElement(tagName: string): GiscusScript;
  querySelectorAll(selector: string): Iterable<GiscusContainer>;
};

type GiscusEventTarget = {
  addEventListener(eventName: string, listener: () => void): void;
};

const GISCUS_ROOT_SELECTOR = "[data-giscus-root]";
const GISCUS_MOUNT_SELECTOR =
  "script[data-giscus-script='true'], script[src='https://giscus.app/client.js'], .giscus-frame, iframe.giscus-frame";

function isCompleteConfig(config: GiscusWidgetConfig) {
  return Boolean(
    config.repo &&
    config.repoId &&
    config.category &&
    config.categoryId &&
    config.language
  );
}

function readGiscusConfig(element: GiscusContainer): GiscusWidgetConfig | null {
  const repo = element.getAttribute("data-repo");
  const repoId = element.getAttribute("data-repo-id");
  const category = element.getAttribute("data-category");
  const categoryId = element.getAttribute("data-category-id");
  const language = element.getAttribute("data-lang");

  if (!(repo && repoId && category && categoryId && language)) {
    return null;
  }

  return {
    repo,
    repoId,
    category,
    categoryId,
    language,
  };
}

export function mountGiscusWidget({
  container,
  document,
  config,
}: {
  container: GiscusContainer;
  document: Pick<GiscusDocument, "createElement">;
  config: GiscusWidgetConfig;
}) {
  if (
    !isCompleteConfig(config) ||
    container.querySelector(GISCUS_MOUNT_SELECTOR)
  ) {
    return;
  }

  container.innerHTML = "";

  const script = document.createElement("script");
  script.setAttribute("src", "https://giscus.app/client.js");
  script.setAttribute("data-giscus-script", "true");
  script.setAttribute("data-repo", config.repo);
  script.setAttribute("data-repo-id", config.repoId);
  script.setAttribute("data-category", config.category);
  script.setAttribute("data-category-id", config.categoryId);
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", config.language);
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  container.appendChild(script);
}

export function renderGiscusWidgets(document: GiscusDocument) {
  for (const root of document.querySelectorAll(GISCUS_ROOT_SELECTOR)) {
    const config = readGiscusConfig(root);

    if (!config) {
      continue;
    }

    mountGiscusWidget({ container: root, document, config });
  }
}

export function bindGiscusWidgetLifecycle({
  document,
  eventTarget,
}: {
  document: GiscusDocument;
  eventTarget: GiscusEventTarget;
}) {
  const render = () => renderGiscusWidgets(document);

  render();
  eventTarget.addEventListener("astro:page-load", render);
}
