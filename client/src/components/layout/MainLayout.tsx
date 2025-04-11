import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddLeadForm from "../dashboard/AddLeadForm";

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="gradient"
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:translate-y-[-5px] transition-transform duration-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the new lead to add them to your system.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1">
            <AddLeadForm inDialog={true} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;
