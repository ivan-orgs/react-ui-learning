import { Surface } from "../../shared/ui/Surface";
import { Text } from "../../components/wabi";
import { useTicker } from "../../shared/hooks/useTicker";
import { EventDelegationPlayground } from "./EventDelegationPlayground";
import { EventPlayground } from "./EventPlayground";
import { NavigationExamples } from "./NavigationExamples";
import {
  conceptConfig,
  getData,
  selectedActionLabel,
  selectedStatusOption,
  selectedVariant
} from "./typescriptExamples";
import styles from "./ConceptsPage.module.css";

// Concept: as const.
// What it means: TypeScript keeps these titles/items as exact literal values instead of widening them to string.
// Seen in app: this array renders the cards on /concepts, and each item becomes a stable list key.
const concepts = [
  {
    title: "HTML, CSS, DOM",
    items: [
      "semantic header/nav/main/section/footer",
      "CSS modules, specificity, cascade, inheritance",
      "box model, flex, gap, alignment, responsive media queries",
      "DOM tree, event bubbling, event delegation, React DOM updates"
    ]
  },
  {
    title: "JavaScript essentials",
    items: [
      "const/let scope",
      "function declarations and arrow functions",
      "map/filter/reduce, spread, object updates",
      "destructuring, async/await, try/catch",
      "optional chaining, nullish and truthy checks"
    ]
  },
  {
    title: "TypeScript fundamentals",
    items: [
      "annotations and inference",
      "interface vs type",
      "unions and string literal unions",
      "template literal types",
      "generics, narrowing, type guards",
      "as const and satisfies"
    ]
  },
  {
    title: "React fundamentals",
    items: [
      "JSX and function components, JSX boolean props",
      "props and composition",
      "conditional rendering",
      "lists and keys",
      "useState, events, useEffect, useMemo, useCallback, useContext",
      "createRoot and StrictMode"
    ]
  },
  {
    title: "Enterprise app patterns",
    items: [
      "feature folders, shared components, shared utilities",
      "React Router v7 nested routes, Outlet, params, navigate",
      "Navigation with Link, NavLink, and useNavigate",
      "route-level lazy loading and chunks",
      "React Query caching, staleTime, background refetching",
      "ensureQueryData derived fetch",
      "axios create/get/post/interceptors/auth headers/loader coordination",
      "context providers and consumers",
      "real AG Grid ColDef, grid options, cell renderers, API autosize"
    ]
  },
  {
    title: "UI patterns and resilience",
    items: [
      "widgets and domain blocks",
      "current/confidence/suggested display values",
      "fallback rendering and empty states",
      "ShowMore progressive disclosure",
      "side panel tabs and reset flows",
      "route errors, component ErrorBoundary, skeletons, aria-busy, aria-live, NotFound"
    ]
  },
  {
    title: "Tooling and tests",
    items: [
      "Vite dev server and bundling",
      "tsc -b and tsconfig files",
      "ESLint flat config and react-hooks rules",
      "Vitest, Testing Library, jest-dom",
      "mocking HTTP clients and hooks, DOM assertions, integration tests"
    ]
  }
] as const;

export default function ConceptsPage() {
  // Concept: useEffect hidden inside a custom hook.
  // What it means: useTicker sets up and cleans up a timer.
  // Hook rule: hooks are functions that start with "use", and you call them inside your component.
  // Rules: only call hooks at the top of the component; never inside if blocks, loops, or nested functions.
  // Seen in app: the time changes every second on /concepts.
  const now = useTicker();

  // Concept: generic function getData<T>().
  // What it means: TypeScript remembers the input type and returns that same type.
  // Seen in app: the generic helper text is printed in the live examples card.
  const genericValue = getData("generic getData<T>() result");

  return (
    <section className={styles.page}>
      <div>
        <h2>Concept map</h2>
        <p>Every roadmap concept is represented in this project with a small working example.</p>
      </div>
      <Surface title="Live hook examples">
        {/* Concept: readable live examples.
            What it means: each value is separated so the timer/generic/satisfies/as const examples are easy to inspect.
            Seen in app: the timer updates every second without the other examples changing. */}
        <dl className={styles.liveExamples}>
          <div>
            <dt>Timer from useEffect</dt>
            <dd>{now.toLocaleTimeString()}</dd>
          </div>
          <div>
            <dt>Generic helper</dt>
            <dd>{genericValue}</dd>
          </div>
          <div>
            <dt>satisfies apiName</dt>
            <dd>{conceptConfig.apiName}</dd>
          </div>
          <div>
            <dt>satisfies defaultAction</dt>
            <dd>{conceptConfig.defaultAction}</dd>
          </div>
          <div>
            <dt>as const status</dt>
            <dd>{selectedStatusOption}</dd>
          </div>
          <div>
            <dt>as const derived union</dt>
            <dd>{selectedActionLabel}</dd>
          </div>
          <div>
            <dt>Template literal union</dt>
            <dd>{selectedVariant}</dd>
          </div>
        </dl>
        <Text tone="muted">
          Hooks are functions that start with "use"; call them at the top of your component, never
          inside if blocks, loops, or nested functions. Only the timer changes; the TypeScript
          examples are stable values.
        </Text>
      </Surface>
      <Surface title="JSX note">
        {/* Concept: JSX compilation.
            What it means: React does not send JSX directly to the browser; Vite/Babel turns JSX into JavaScript function calls.
            Seen in app: this note is written as JSX, then the build converts it into normal JavaScript. */}
        <p className={styles.noteText}>
          JSX looks like HTML inside JavaScript, but React tooling converts it into JavaScript
          function calls before it runs in the browser. In JSX, prop={true} passes a boolean;
          prop="true" passes a string.
        </p>
      </Surface>
      <Surface title="State update note">
        {/* Concept: React state update flow.
            What it means: when state changes, React re-renders the component, updates its virtual DOM tree, compares it with the previous render, and commits only the changed real DOM parts.
            Seen in app: the timer, event log, filters, side panel tabs, and show-more controls update without replacing the whole page. */}
        <ol className={styles.noteList}>
          <li>Component re-renders.</li>
          <li>Virtual DOM updates.</li>
          <li>React updates only changed DOM parts.</li>
        </ol>
      </Surface>
      <Surface title="Layout route note">
        {/* Concept: layout route.
            What it means: a layout route is a parent route that renders shared UI, then uses Outlet to choose which child page appears inside it.
            Seen in app: App renders the shared header and footer, while Queue, Task detail, Concepts, and NotFound render inside Outlet. */}
        <p className={styles.noteText}>
          A layout route is a parent route used when multiple pages share the same UI, such as a
          navbar, main content shell, and footer. In this project, App is the layout route component:
          it keeps the header and footer visible, and the child page changes inside Outlet.
        </p>
      </Surface>
      <NavigationExamples />
      <EventPlayground />
      {/* Concept: event delegation.
          What it means: one parent handler listens for clicks from many child buttons.
          Seen in app: the Event delegation card updates whichever task action button you click. */}
      <EventDelegationPlayground />
      <div className={styles.grid}>
        {/* Concept: lists and keys.
            What it means: map() turns an array into UI, and key helps React track each item.
            Seen in app: each concept group becomes one card. */}
        {concepts.map((group) => (
          <Surface key={group.title} title={group.title}>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Surface>
        ))}
      </div>
    </section>
  );
}

