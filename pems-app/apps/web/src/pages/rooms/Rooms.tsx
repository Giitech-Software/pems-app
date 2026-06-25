import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Rooms() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Rooms"
        subtitle="Track vacant, occupied, reserved, and maintenance rooms."
        actionLabel="Add Room"
      />
    </DashboardLayout>
  );
}