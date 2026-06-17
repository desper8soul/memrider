/**
 * Minimal mustache-style {{var}} substitution (no logic, no deps).
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in variables)) {
      throw new Error(`Missing template variable: ${key}`);
    }
    return variables[key];
  });
}
