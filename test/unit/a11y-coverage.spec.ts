/**
 * A11y coverage meta-test
 *
 * Scans app/components/ for all .vue files and cross-references against
 * the a11y test file. Fails if any component is missing and not in the skip list.
 */
import { describe, it } from "vite-plus/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const COMPONENTS_DIR = join(__dirname, "../../app/components");
const A11Y_TEST_FILE = join(__dirname, "../nuxt/a11y.spec.ts");

// Components that can't be axe-tested in isolation
const SKIP_LIST = [
  // D3/SVG canvas components
  "BaseGraph.client.vue",
  "KnowledgeGraph.vue",
  "NoteGraph.vue",
  "StatsBarChart.client.vue",
  "StatsLineChart.client.vue",
  // External library rendering
  "content/Mermaid.vue",
  // Complex async + injection dependencies
  "ChatPanel.vue",
  "ChatMessage.vue",
  "ToolCallItem.vue",
  // Require Teleport/portal context
  "AppSearchModal.vue",
  "AppShortcutsModal.vue",
  "AuthorPickerModal.vue",
  // Require graph context
  "GraphNodePanel.vue",
  "GraphFilters.vue",
  // Complex table state
  "content/ContentTable.vue",
  "content/ContentTableFiltersBar.vue",
  // Content component, minimal
  "content/ProseA.vue",
  "content/ProseTh.vue",
];

function getAllComponents(dir: string, prefix = ""): string[] {
  const components: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      components.push(...getAllComponents(join(dir, entry.name), `${prefix}${entry.name}/`));
      continue;
    }
    if (entry.name.endsWith(".vue")) {
      components.push(`${prefix}${entry.name}`);
    }
  }

  return components;
}

function getTestedComponents(): string[] {
  const content = readFileSync(A11Y_TEST_FILE, "utf-8");
  // Match component imports: import Foo from '~/components/Foo.vue'
  const importRegex = /import\s+\w+\s+from\s+'~\/components\/(.+\.vue)'/g;
  const tested: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    tested.push(match[1]);
  }

  return tested;
}

describe("A11y Test Coverage", () => {
  const allComponents = getAllComponents(COMPONENTS_DIR);
  const testedComponents = getTestedComponents();

  it("every component has an a11y test or is in the skip list", () => {
    const missing = allComponents.filter(
      (c) => !testedComponents.includes(c) && !SKIP_LIST.includes(c),
    );

    if (missing.length > 0) {
      throw new Error(
        `Components missing a11y tests (add to test/nuxt/a11y.spec.ts or skip list):\n${missing.map((c) => `  - ${c}`).join("\n")}`,
      );
    }
  });

  it("skip list contains no obsolete entries", () => {
    const obsolete = SKIP_LIST.filter((s) => !allComponents.includes(s));

    if (obsolete.length > 0) {
      throw new Error(
        `Skipped components no longer exist (remove from skip list):\n${obsolete.map((c) => `  - ${c}`).join("\n")}`,
      );
    }
  });

  it("skip list contains no unnecessarily skipped components", () => {
    const unnecessary = SKIP_LIST.filter((s) => testedComponents.includes(s));

    if (unnecessary.length > 0) {
      throw new Error(
        `Skipped components actually have a11y tests (remove from skip list):\n${unnecessary.map((c) => `  - ${c}`).join("\n")}`,
      );
    }
  });
});
