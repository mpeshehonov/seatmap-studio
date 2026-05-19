export const EVENT_SEAT_CATEGORY_OPTIONS = [
  {
    value: "standard",
    label: "Стандарт",
    description: "Базовая категория места",
  },
  {
    value: "vip",
    label: "VIP",
    description: "Лучшие места или повышенная категория",
  },
  {
    value: "accessible",
    label: "Доступные места",
    description: "Места для гостей с особыми требованиями",
  },
] as const;

export type EventSeatCategory =
  (typeof EVENT_SEAT_CATEGORY_OPTIONS)[number]["value"];

export type EventSeatCategoryAssignment = {
  seat_id: string;
  category: EventSeatCategory;
};

export function getEventSeatCategoryLabel(category: EventSeatCategory): string {
  return EVENT_SEAT_CATEGORY_OPTIONS.find((option) => option.value === category)
    ?.label ?? category;
}

export function toEventSeatCategoryMap(
  assignments: EventSeatCategoryAssignment[] | null | undefined,
): Record<string, EventSeatCategory> {
  return Object.fromEntries(
    (assignments ?? []).map((assignment) => [
      assignment.seat_id,
      assignment.category,
    ]),
  );
}
