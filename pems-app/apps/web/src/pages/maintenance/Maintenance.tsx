import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Maintenance() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Maintenance"
        subtitle="Track tenant complaints, repairs, and maintenance progress."
        actionLabel="Add Request"
      />
    </DashboardLayout>
  );
}