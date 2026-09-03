/**
 * كتالوج المسارات الديناميكي
 * يبسط سجل apiRoutes الضخم إلى قائمة مسطحة قابلة للبحث والعرض الشجري
 */

import { apiRoutes } from "@/lib/api/routes";
import type { ApiEndpointNode } from "../_types/api-explorer";

/**
 * استخراج متغيرات المسار (placeholders) من نص المسار
 * مثال: /api/users/{id}/posts/{postId} -> ['id', 'postId']
 */
function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[{}]/g, ""));
}

/** واصف لمجموعة قابلة للتكرار */
interface GroupDescriptor {
  group: string;
  subgroup?: string;
  name: string;
  path: string;
  description?: string;
  isDynamic: boolean;
}

/**
 * تحويل قيمة إلى واصف مجموعة بشكل تكراري.
 * يتجاهل الدوال ويُسجّل المسارات النصية فقط.
 */
function walk(
  value: unknown,
  trail: string[],
  acc: GroupDescriptor[],
  group: string,
  subgroup: string | undefined
): void {
  if (typeof value === "string") {
    acc.push({
      group,
      subgroup,
      name: trail[trail.length - 1] ?? value,
      path: value,
      isDynamic: false,
    });
    return;
  }
  if (typeof value === "function") {
    acc.push({
      group,
      subgroup,
      name: trail[trail.length - 1] ?? "dynamic",
      path: `dynamic(${trail[trail.length - 1] ?? "params"})`,
      isDynamic: true,
    });
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      // لو المفتاح subgroup معروف (mfa, social, security) نعتبره subgroup
      const knownSubgroups = new Set([
        "mfa",
        "social",
        "password",
        "sessions",
        "tickets",
        "features",
        "payments",
        "metrics",
        "instructors",
        "scheduler",
        "upload",
        "categories",
        "tickets",
        "promotions",
      ]);
      const nextSubgroup =
        knownSubgroups.has(key) && trail.length > 0 ? key : subgroup;
      walk(child, [...trail, key], acc, group, nextSubgroup);
    }
  }
}

/** بناء الكتالوج بشكل كسول مرة واحدة */
let cachedCatalog: ApiEndpointNode[] | null = null;

export function buildEndpointCatalog(): ApiEndpointNode[] {
  if (cachedCatalog) return cachedCatalog;
  const descriptors: GroupDescriptor[] = [];
  for (const [groupName, groupValue] of Object.entries(apiRoutes)) {
    walk(groupValue, [groupName], descriptors, groupName, undefined);
  }
  const nodes: ApiEndpointNode[] = descriptors.map((d, idx) => {
    const pathParams = d.isDynamic ? ["id"] : extractPathParams(d.path);
    const id = `${d.group}:${d.subgroup ?? ""}:${d.name}:${idx}`;
    return {
      id,
      group: d.group,
      subgroup: d.subgroup,
      name: d.name,
      path: d.path,
      pathParams,
      isDynamic: d.isDynamic,
      tags: [d.group, d.subgroup, d.name].filter(Boolean) as string[],
      description: d.isDynamic
        ? "مسار ديناميكي يتطلب معاملات (id, slug, ...)"
        : undefined,
    };
  });
  cachedCatalog = nodes;
  return nodes;
}

/** بحث في الكتالوج بكلمة مفتاحية */
export function searchEndpoints(query: string): ApiEndpointNode[] {
  const catalog = buildEndpointCatalog();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return catalog;
  return catalog.filter((node) => {
    if (node.name.toLowerCase().includes(normalized)) return true;
    if (node.path.toLowerCase().includes(normalized)) return true;
    if (node.group.toLowerCase().includes(normalized)) return true;
    if (node.subgroup?.toLowerCase().includes(normalized)) return true;
    return node.tags.some((tag) => tag.toLowerCase().includes(normalized));
  });
}

/** تجميع الكتالوج في شكل شجري: { group -> { subgroup -> nodes[] } } */
export interface CatalogTree {
  group: string;
  totalCount: number;
  subgroups: Array<{
    name: string;
    count: number;
    nodes: ApiEndpointNode[];
  }>;
}

export function groupCatalog(nodes: ApiEndpointNode[]): CatalogTree[] {
  const map = new Map<string, Map<string | undefined, ApiEndpointNode[]>>();
  for (const node of nodes) {
    if (!map.has(node.group)) map.set(node.group, new Map());
    const groupMap = map.get(node.group)!;
    const key = node.subgroup;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(node);
  }
  return Array.from(map.entries())
    .map(([group, subgroups]) => {
      const subgroupList = Array.from(subgroups.entries()).map(([name, list]) => ({
        name: name ?? "__root__",
        count: list.length,
        nodes: list,
      }));
      subgroupList.sort((a, b) => a.name.localeCompare(b.name));
      return {
        group,
        totalCount: subgroupList.reduce((s, x) => s + x.count, 0),
        subgroups: subgroupList,
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group));
}
