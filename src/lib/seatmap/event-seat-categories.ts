export type EventSeatCategoryKey = string;

export type EventSeatCategoryDefinition = {
  key: EventSeatCategoryKey;
  name: string;
  description: string | null;
  colorToken: string;
  sortOrder: number;
};

export type EventSeatCategoryAssignment = {
  seat_id: string;
  category: EventSeatCategoryKey;
};

export const DEFAULT_EVENT_SEAT_CATEGORY_DEFINITIONS: readonly Omit<
  EventSeatCategoryDefinition,
  "description"
>[] = [
  { key: "standard", name: "Стандарт", colorToken: "sky", sortOrder: 0 },
  { key: "vip", name: "VIP", colorToken: "amber", sortOrder: 1 },
  {
    key: "accessible",
    name: "Доступные места",
    colorToken: "emerald",
    sortOrder: 2,
  },
];

export const EVENT_SEAT_CATEGORY_COLOR_TOKENS = [
  "sky",
  "amber",
  "emerald",
  "violet",
  "rose",
  "cyan",
  "zinc",
] as const;

export type EventSeatCategoryColorToken =
  (typeof EVENT_SEAT_CATEGORY_COLOR_TOKENS)[number];

const categoryColorClasses: Record<EventSeatCategoryColorToken, string> = {
  sky: "border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-200",
  amber: "border-amber-400 bg-amber-200 text-amber-950 hover:bg-amber-300",
  emerald:
    "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200",
  violet:
    "border-violet-400 bg-violet-100 text-violet-950 hover:bg-violet-200",
  rose: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200",
  cyan: "border-cyan-400 bg-cyan-100 text-cyan-950 hover:bg-cyan-200",
  zinc: "border-zinc-400 bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
};

const fallbackCategoryClass =
  "border-zinc-400 bg-zinc-200 text-zinc-900 hover:bg-zinc-300";

export function getEventSeatCategoryClassName(
  colorToken: string,
): string {
  if (colorToken in categoryColorClasses) {
    return categoryColorClasses[colorToken as EventSeatCategoryColorToken];
  }

  return fallbackCategoryClass;
}

export function pickNextCategoryColorToken(
  definitions: Pick<EventSeatCategoryDefinition, "colorToken">[],
): EventSeatCategoryColorToken {
  const used = new Set(definitions.map((definition) => definition.colorToken));
  const available = EVENT_SEAT_CATEGORY_COLOR_TOKENS.find(
    (token) => !used.has(token),
  );

  if (available) {
    return available;
  }

  return EVENT_SEAT_CATEGORY_COLOR_TOKENS[
    definitions.length % EVENT_SEAT_CATEGORY_COLOR_TOKENS.length
  ];
}

export function getEventSeatCategoryLabel(
  category: EventSeatCategoryKey,
  definitions: EventSeatCategoryDefinition[],
): string {
  return (
    definitions.find((definition) => definition.key === category)?.name ??
    category
  );
}

export function toEventSeatCategoryMap(
  assignments: EventSeatCategoryAssignment[] | null | undefined,
): Record<string, EventSeatCategoryKey> {
  return Object.fromEntries(
    (assignments ?? []).map((assignment) => [
      assignment.seat_id,
      assignment.category,
    ]),
  );
}

export function toEventSeatCategoryDefinitions(
  rows:
    | {
        key: string;
        name: string;
        description: string | null;
        color_token: string;
        sort_order: number;
      }[]
    | null
    | undefined,
): EventSeatCategoryDefinition[] {
  return (rows ?? [])
    .map((row) => ({
      key: row.key,
      name: row.name,
      description: row.description,
      colorToken: row.color_token,
      sortOrder: row.sort_order,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function createCategoryKey(
  name: string,
  existingKeys: string[],
): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  const base = normalized.length > 0 ? normalized : "category";
  let candidate = base;
  let suffix = 2;

  while (existingKeys.includes(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function buildCategoryStyleMap(
  definitions: EventSeatCategoryDefinition[],
): Record<string, string> {
  return Object.fromEntries(
    definitions.map((definition) => [
      definition.key,
      getEventSeatCategoryClassName(definition.colorToken),
    ]),
  );
}

export function buildCategoryLabelMap(
  definitions: EventSeatCategoryDefinition[],
): Record<string, string> {
  return Object.fromEntries(
    definitions.map((definition) => [definition.key, definition.name]),
  );
}
