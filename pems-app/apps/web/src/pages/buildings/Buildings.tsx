import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Buildings() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Buildings"
        subtitle="Manage property blocks, floors, and building structures."
        actionLabel="Add Building"
      />
    </DashboardLayout>
  );
}