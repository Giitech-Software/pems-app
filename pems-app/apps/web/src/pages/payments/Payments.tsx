import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Payments() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Payments"
        subtitle="Record rent, deposits, utility bills, and payment history."
        actionLabel="Record Payment"
      />
    </DashboardLayout>
  );
}