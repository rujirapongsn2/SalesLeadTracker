import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertLeadSchema, leadSourceEnum, leadStatusEnum } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

const products = [
  { value: "softnix-logger", label: "Softnix Logger" },
  { value: "softnix-gen-ai", label: "Softnix Gen AI" },
  { value: "softnix-data-platform", label: "Softnix Data Platform" },
  { value: "softnix-pdpa", label: "Softnix PDPA" },
  { value: "zabbix", label: "ZABBIX" },
  { value: "other", label: "Other" },
] as const;

const organizations = [
  { value: "pttgc", label: "PTT Global Chemical" },
  { value: "scg", label: "Siam Cement Group" },
  { value: "cp", label: "Charoen Pokphand Group" },
  { value: "true", label: "True Corporation" },
  { value: "ais", label: "Advanced Info Service" },
  { value: "other", label: "Other" },
] as const;

const companies = [
  { value: "softnix", label: "Softnix Technology" },
  { value: "cdg", label: "CDG Group" },
  { value: "mfec", label: "MFEC" },
  { value: "nri", label: "NRI" },
  { value: "accenture", label: "Accenture" },
  { value: "other", label: "Other" },
] as const;

// Create a form schema that extends the base schema
const formSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number is required"),
  source: leadSourceEnum,
  status: leadStatusEnum,
});

export type AddLeadFormValues = z.infer<typeof formSchema>;

interface AddLeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddLeadForm = ({ onSuccess, onCancel }: AddLeadFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<AddLeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "Website",
      status: "New",
      product: "",
      endUserContact: "",
      endUserOrganization: "",
      projectName: "",
      budget: "",
      partnerContact: "",
      productRegister: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AddLeadFormValues) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Lead added successfully",
        description: "The new lead has been added to the system",
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add lead",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AddLeadFormValues) {
    // Set current timestamp
    const now = new Date().getTime();
    mutate({
      ...values,
      createdAt: now,
      updatedAt: now,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productRegister"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Product Register</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? products.find(
                                (product) => product.value === field.value
                              )?.label || field.value
                            : "Select product..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>
                          <div className="px-4 py-2">
                            <Input
                              placeholder="Enter custom product"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              value={product.label}
                              key={product.value}
                              onSelect={() => {
                                field.onChange(product.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === product.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endUserContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End User Contact Point</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter end user contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="endUserOrganization"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End User Organization</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? organizations.find(
                                (org) => org.value === field.value
                              )?.label || field.value
                            : "Select organization..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search organization..." />
                        <CommandEmpty>
                          <div className="px-4 py-2">
                            <Input
                              placeholder="Enter custom organization"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {organizations.map((org) => (
                            <CommandItem
                              value={org.label}
                              key={org.value}
                              onSelect={() => {
                                field.onChange(org.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === org.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {org.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Partner Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Partner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact partner name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Partner Company</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? companies.find(
                                (company) => company.value === field.value
                              )?.label || field.value
                            : "Select company..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search company..." />
                        <CommandEmpty>
                          <div className="px-4 py-2">
                            <Input
                              placeholder="Enter custom company"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              value={company.label}
                              key={company.value}
                              onSelect={() => {
                                field.onChange(company.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === company.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {company.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Youtube">Youtube</SelectItem>
                      <SelectItem value="Search">Search</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddLeadForm;