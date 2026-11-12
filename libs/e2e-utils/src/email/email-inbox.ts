import type { APIRequestContext } from '@playwright/test';
import { pollUntil } from '../helpers/poll';

export interface EmailMessage {
  id: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

/**
 * One interface for every environment: Mailpit on a local stack, a hosted inbox API on a deployed one.
 * Specs ask the `inbox` fixture for mail and never learn which backend answered.
 */
export interface EmailInbox {
  waitForMessage(query: { to: string; subject?: string | RegExp }, timeoutMs?: number): Promise<EmailMessage>;
}

interface MailpitSummary {
  ID: string;
  To: { Address: string }[];
  Subject: string;
}

export class MailpitInbox implements EmailInbox {
  constructor(
    private readonly request: APIRequestContext,
    private readonly mailpitUrl: string
  ) {}

  async waitForMessage(query: { to: string; subject?: string | RegExp }, timeoutMs = 30_000): Promise<EmailMessage> {
    const search = await pollUntil(
      async () => {
        const response = await this.request.get(`${this.mailpitUrl}/api/v1/search`, { params: { query: `to:"${query.to}"` } });
        const { messages } = (await response.json()) as { messages: MailpitSummary[] };
        return messages.filter((m) => !query.subject || new RegExp(query.subject).test(m.Subject));
      },
      (found) => found.length > 0,
      timeoutMs
    );

    const summary = search[0];
    if (!summary) throw new Error(`No email to ${query.to}${query.subject ? ` matching ${query.subject}` : ''} within ${timeoutMs}ms`);

    const full = (await (await this.request.get(`${this.mailpitUrl}/api/v1/message/${summary.ID}`)).json()) as {
      HTML: string;
      Text: string;
    };
    return { id: summary.ID, to: summary.To.map((t) => t.Address), subject: summary.Subject, html: full.HTML, text: full.Text };
  }
}

export function linksIn(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, '&'));
}
