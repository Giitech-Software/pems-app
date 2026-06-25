import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Reports() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        subtitle="View occupancy, rent collection, overdue payments, and portfolio reports."
      />
    </DashboardLayout>
  );
}