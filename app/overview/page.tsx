import { AdminOverview } from "@/app/admin/admin-overview";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function OverviewPage() {
  await requireAdminUser();

  return (
    <div className="pb-24">
      <AdminOverview />
    </div>
  );
}
