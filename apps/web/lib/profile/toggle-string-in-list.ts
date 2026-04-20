/** Toggle a string in an immutable list (used for chip multi-select UIs). */
export function toggleStringInList(value: string, list: string[]): string[] {
  if (list.includes(value)) {
    return list.filter((v) => v !== value);
  }
  return [...list, value];
}
