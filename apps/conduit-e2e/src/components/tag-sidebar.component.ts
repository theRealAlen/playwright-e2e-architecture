import { type Locator } from '@playwright/test';

export class TagSidebar {
  constructor(readonly root: Locator) {}

  get heading(): Locator {
    return this.root.getByText('Popular Tags');
  }

  get tags(): Locator {
    return this.root.locator('.tag-list a, .tag-list .tag-pill');
  }

  get emptyState(): Locator {
    return this.root.getByText('No tags are here... yet.');
  }
}
