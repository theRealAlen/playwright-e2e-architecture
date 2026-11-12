let counter = 0;

/** Short, sortable, collision-safe across parallel workers and shards. */
export function uniqueSuffix(): string {
  counter += 1;
  return `${Date.now().toString(36)}${process.pid.toString(36)}${counter}`;
}

export function uniqueName(prefix: string): string {
  return `${prefix} ${uniqueSuffix()}`;
}
