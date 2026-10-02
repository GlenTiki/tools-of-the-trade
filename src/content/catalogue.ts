import roots from "./root-nodes.json";
import core from "./core-nodes.json";
import advanced from "./advanced-nodes.json";
import requirementData from "./requirements.json";
import journeyData from "./journeys.json";
import platformData from "./platforms.json";
export interface Concept {
  id: string;
  title: string;
  parent: string | null;
  type: string;
  summary: string;
  detail: string;
  inputs: string[];
  outputs: string[];
  failures: string[];
  requirements: string[];
  related: { id: string; relation: string }[];
  sources: { title: string; url: string }[];
  tags?: string[];
  formula?: string;
  code?: { language: string; text: string; status: string; source?: string }[];
}
export const concepts = [...roots, ...core, ...advanced] as Concept[];
export const conceptById = new Map(concepts.map((n) => [n.id, n]));
export const requirements = requirementData;
export const journeys = journeyData;
export const platforms = platformData;
