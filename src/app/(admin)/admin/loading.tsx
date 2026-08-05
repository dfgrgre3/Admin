import { GenericPageSkeleton } from "@/components/admin/ui/page-skeletons";

/**
 * Fallback shown while any route under `/admin/**` is loading.
 * Since loading.tsx applies to nested routes too, this single file covers
 * every admin sub-page automatically. Individual page folders can override
 * it if they need a more specific skeleton.
 */
export default function AdminLoading() {
  return <GenericPageSkeleton />;
}