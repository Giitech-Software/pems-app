import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";

export default function Settings() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage profile, account preferences, and property system settings."
      />
    </DashboardLayout>
  );
}