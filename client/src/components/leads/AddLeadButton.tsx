import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddLeadForm from './AddLeadForm';

const AddLeadButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="gradient"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 z-20 p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the lead information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <AddLeadForm 
            onSuccess={() => setOpen(false)} 
            onCancel={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddLeadButton;