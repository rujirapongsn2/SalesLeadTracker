import StatCards from "@/components/dashboard/StatCards";
import LeadTable from "@/components/dashboard/LeadTable";
import LeadStatusDistribution from "@/components/dashboard/LeadStatusDistribution";
import AddLeadForm from "@/components/dashboard/AddLeadForm";

export const Dashboard = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold mb-2">Sales Lead Dashboard</h1>
        <p className="text-gray-500">Analyze and manage your customer leads</p>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <LeadTable />
        </div>

        <div className="space-y-6">
          <AddLeadForm />
          <LeadStatusDistribution />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
