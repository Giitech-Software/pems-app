import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Tenants() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Tenants"
        subtitle="Manage tenant records, rent status, and room assignments."
        actionLabel="Add Tenant"
      />
    </DashboardLayout>
  );
}