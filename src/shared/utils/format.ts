// Concept: display value helper.
// What it means: keep formatting rules in one shared utility instead of repeating code.
// Seen in app: PriorityBadge uses this to turn PENDING into Pending.
export function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

// Concept: nullish/falsy fallback.
// What it means: null, undefined, and empty strings become a safe display value.
// Seen in app: missing priority values show "Not available".
export function displayValue(value: string | null | undefined, fallback = "Not available") {
  return value?.trim() ? value : fallback;
}


