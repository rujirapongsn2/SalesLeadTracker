import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  onClose: () => void;
}

export function UserProfileForm({ onClose }: UserProfileFormProps) {
  const { currentUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form setup with default values from current user
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      username: currentUser?.username || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      // If password is empty, remove it from the data
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.confirmPassword;
      
      // Call the updateProfile function from AuthContext
      const success = await updateProfile(updateData);
      
      if (success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
        onClose();
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password (optional)</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Leave blank to keep current password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
