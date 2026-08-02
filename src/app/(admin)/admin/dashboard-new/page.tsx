import { redirect } from "next/navigation";

/**
 * The dashboard-new route was a parallel implementation of the main admin
 * dashboard. It has been consolidated into `/admin` to eliminate the
 * architectural confusion of having two dashboards.
 *
 * This Server Component issues a permanent redirect so old links/bookmarks
 * continue to work without maintaining a second implementation.
 */
export default function DashboardNewRedirectPage() {
  redirect("/admin");
}