import test from 'node:test';
import assert from 'node:assert/strict';

import {
  bindGiscusWidgetLifecycle,
  mountGiscusWidget,
  renderGiscusWidgets,
} from '../src/utils/giscusWidget.ts';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.innerHTML = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    if (selector.includes('data-giscus-script')) {
      const giscusScript =
        this.children.find(
          child => child.getAttribute('data-giscus-script') === 'true'
        ) ?? null;

      if (giscusScript) {
        return giscusScript;
      }
    }

    if (selector.includes('script[src=')) {
      return (
        this.children.find(
          child =>
            child.getAttribute('src') === 'https://giscus.app/client.js'
        ) ?? null
      );
    }

    if (selector.includes('giscus-frame')) {
      return (
        this.children.find(
          child =>
            child.getAttribute('class')?.includes('giscus-frame') ?? false
        ) ?? null
      );
    }

    return null;
  }
}

class FakeDocument {
  constructor() {
    this.created = [];
    this.roots = [];
  }

  createElement(tagName) {
    const element = new FakeElement(tagName);
    this.created.push(element);
    return element;
  }

  querySelectorAll(selector) {
    if (selector === '[data-giscus-root]') {
      return this.roots;
    }

    return [];
  }
}

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(name, listener) {
    const current = this.listeners.get(name) ?? [];
    current.push(listener);
    this.listeners.set(name, current);
  }

  dispatch(name) {
    for (const listener of this.listeners.get(name) ?? []) {
      listener();
    }
  }
}

function createConfig(overrides = {}) {
  return {
    repo: 'jtzcode/ai-blog',
    repoId: 'repo-id',
    category: 'General',
    categoryId: 'category-id',
    language: 'zh-CN',
    ...overrides,
  };
}

test('mountGiscusWidget replaces stale content and appends a configured script', () => {
  const document = new FakeDocument();
  const container = new FakeElement('div');
  container.innerHTML = '<iframe></iframe>';

  mountGiscusWidget({ container, document, config: createConfig() });

  assert.equal(container.innerHTML, '');
  assert.equal(container.children.length, 1);

  const script = container.children[0];
  assert.equal(script.tagName, 'SCRIPT');
  assert.equal(script.getAttribute('src'), 'https://giscus.app/client.js');
  assert.equal(script.getAttribute('data-repo'), 'jtzcode/ai-blog');
  assert.equal(script.getAttribute('data-repo-id'), 'repo-id');
  assert.equal(script.getAttribute('data-category'), 'General');
  assert.equal(script.getAttribute('data-category-id'), 'category-id');
  assert.equal(script.getAttribute('data-lang'), 'zh-CN');
});

test('mountGiscusWidget leaves an existing mount alone when already initialized', () => {
  const document = new FakeDocument();
  const container = new FakeElement('div');
  const existingScript = new FakeElement('script');
  existingScript.setAttribute('src', 'https://giscus.app/client.js');
  container.appendChild(existingScript);

  mountGiscusWidget({ container, document, config: createConfig() });

  assert.equal(container.children.length, 1);
  assert.equal(container.children[0], existingScript);
  assert.equal(document.created.length, 0);
});

test('renderGiscusWidgets mounts configured roots from data attributes', () => {
  const document = new FakeDocument();
  const root = new FakeElement('div');
  root.setAttribute('data-giscus-root', 'true');
  root.setAttribute('data-repo', 'jtzcode/ai-blog');
  root.setAttribute('data-repo-id', 'repo-id');
  root.setAttribute('data-category', 'General');
  root.setAttribute('data-category-id', 'category-id');
  root.setAttribute('data-lang', 'en');
  document.roots.push(root);

  renderGiscusWidgets(document);

  assert.equal(root.children.length, 1);
  assert.equal(root.children[0].getAttribute('data-giscus-script'), 'true');
  assert.equal(root.children[0].getAttribute('data-lang'), 'en');
});

test('bindGiscusWidgetLifecycle mounts on setup and on astro page loads', () => {
  const document = new FakeDocument();
  const events = new FakeEventTarget();
  const firstRoot = new FakeElement('div');
  firstRoot.setAttribute('data-giscus-root', 'true');
  firstRoot.setAttribute('data-repo', 'jtzcode/ai-blog');
  firstRoot.setAttribute('data-repo-id', 'repo-id');
  firstRoot.setAttribute('data-category', 'General');
  firstRoot.setAttribute('data-category-id', 'category-id');
  firstRoot.setAttribute('data-lang', 'en');
  document.roots = [firstRoot];

  bindGiscusWidgetLifecycle({ document, eventTarget: events });

  assert.equal(firstRoot.children.length, 1);
  assert.equal(firstRoot.children[0].getAttribute('data-lang'), 'en');

  const nextRoot = new FakeElement('div');
  nextRoot.setAttribute('data-giscus-root', 'true');
  nextRoot.setAttribute('data-repo', 'jtzcode/ai-blog');
  nextRoot.setAttribute('data-repo-id', 'repo-id');
  nextRoot.setAttribute('data-category', 'General');
  nextRoot.setAttribute('data-category-id', 'category-id');
  nextRoot.setAttribute('data-lang', 'zh-CN');
  document.roots = [nextRoot];

  events.dispatch('astro:page-load');

  assert.equal(nextRoot.children.length, 1);
  assert.equal(nextRoot.children[0].getAttribute('data-lang'), 'zh-CN');
});
