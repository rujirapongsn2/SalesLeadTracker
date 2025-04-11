import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
};

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  allowCreate?: boolean;
  createMessage?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No options found.",
  className,
  allowCreate = false,
  createMessage = "Create new option",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = () => {
    if (searchQuery.trim() !== "") {
      onChange(searchQuery.trim());
      setOpen(false);
    }
  };

  const displayValue = React.useMemo(() => {
    const selected = options.find((option) => option.value === value);
    return selected ? selected.label : value;
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? displayValue : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            onValueChange={setSearchQuery}
            value={searchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {emptyMessage}
              {allowCreate && searchQuery.trim() !== "" && (
                <Button
                  variant="ghost"
                  className="mt-2 w-full flex items-center justify-start"
                  onClick={handleCreate}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {createMessage}: "{searchQuery}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && searchQuery.trim() !== "" && !options.some(
              (option) => option.label.toLowerCase() === searchQuery.toLowerCase()
            ) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {createMessage}: "{searchQuery}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
