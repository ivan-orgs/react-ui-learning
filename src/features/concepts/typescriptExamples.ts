// Concept: template literal type.
// What it means: ApiName must look like word_word.
// Seen in app: conceptConfig.apiName is printed on /concepts.
type ApiName = `${string}_${string}`;

// Concept: template literal type with unions.
// What it means: TypeScript combines every Color with every Size to create red-sm, red-lg, blue-sm, and blue-lg.
// Seen in app: /concepts prints the selectedVariant value, which can only be one of those combined strings.
type Color = "red" | "blue";
type Size = "sm" | "lg";
type Variant = `${Color}-${Size}`;

export const selectedVariant: Variant = "red-sm";

// Concept: interface vs type.
// What it means: interface describes object shape; type can compose aliases like Pick.
// Seen in app: this file is a small TypeScript reference for the concepts page.
interface Person {
  id: number;
  name: string;
}

type PersonSummary = Pick<Person, "id" | "name">;

// Concept: as const.
// What it means: TypeScript keeps each array item as an exact value and makes the array readonly.
// Seen in app: /concepts prints selectedStatusOption and selectedActionLabel from these readonly lists.
export const statusOptions = ["APPROVED", "PENDING", "REJECTED"] as const;
export const actionLabels = ["Start", "Pause", "Finish"] as const;

// Concept: deriving a union from as const.
// What it means: ActionLabel becomes "Start" | "Pause" | "Finish" from the readonly array above.
// Seen in app: selectedActionLabel can only be one of the actionLabels values.
type ActionLabel = (typeof actionLabels)[number];

export const selectedStatusOption = statusOptions[0];
export const selectedActionLabel: ActionLabel = "Pause";

// Concept: satisfies.
// What it means: validate an object shape while keeping specific inferred values like "priority_task".
// Seen in app: /concepts prints apiName, pageSize, and defaultAction from this checked config.
type ConceptConfig = {
  apiName: ApiName;
  pageSize: number;
  defaultAction: ActionLabel;
};

export const conceptConfig = {
  apiName: "priority_task",
  pageSize: 25,
  defaultAction: "Start"
} satisfies ConceptConfig;

// Concept: generic function.
// What it means: T is chosen by whatever value you pass in.
// Seen in app: ConceptsPage passes a string and gets a string back.
export function getData<T>(value: T): T {
  return value;
}

export function summarizePerson(person: Person): PersonSummary {
  return { id: person.id, name: person.name };
}


