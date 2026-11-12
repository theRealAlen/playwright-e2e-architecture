import { expect, type Locator, type Page } from '@playwright/test';
import { AppHeader } from '../components/app-header.component';

export abstract class BasePage {
  readonly header: AppHeader;

  constructor(readonly page: Page) {
    this.header = new AppHeader(page.locator('nav.navbar'));
  }

  /** Resolve only once the page is usable: assert on content that appears last, never on networkidle. */
  abstract waitForLoad(): Promise<void>;

  async expectPath(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL((url) => pattern.test(url.pathname));
  }

  protected button(name: string, exact = true): Locator {
    return this.page.getByRole('button', { name, exact });
  }

  protected textbox(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder, { exact: true });
  }
}
