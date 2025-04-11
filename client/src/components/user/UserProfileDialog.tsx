import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfileForm } from "./UserProfileForm";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <UserProfileForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
