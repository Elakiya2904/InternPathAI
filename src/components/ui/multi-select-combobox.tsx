
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiSelectComboboxProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  className?: string;
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  inputPlaceholder = "Search options...",
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (currentValue: string) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue];
    onChange(newSelected);
    setInputValue("");
    setOpen(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && inputValue) {
        if (!selected.includes(inputValue) && !options.find(o => o.value.toLowerCase() === inputValue.toLowerCase())) {
             const newOption = { label: inputValue, value: inputValue };
             // Since options is a prop, we can't directly modify it here.
             // Instead, we just add the value to the selected list.
             onChange([...selected, inputValue]);
        }
        setInputValue('');
    }
  };
  
  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  const getLabel = (value: string) => {
    return options.find(option => option.value === value)?.label || value;
  }
  
  const filteredOptions = options.filter(option => 
    !selected.includes(option.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <div className={cn("w-full", className)}>
            <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-11 items-center bg-background">
                {selected.map((value) => (
                  <Badge key={value} variant="secondary" className="pl-3 pr-1 text-base">
                    {getLabel(value)}
                    <button
                        onClick={() => handleRemove(value)}
                        className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
                 <PopoverTrigger asChild>
                    <div className="flex-1">
                        <Command onKeyDown={handleKeyDown} className="bg-transparent">
                            <CommandInput
                                placeholder={selected.length > 0 ? "" : placeholder}
                                value={inputValue}
                                onValueChange={setInputValue}
                                onFocus={() => setOpen(true)}
                                className="h-full bg-transparent border-none focus:ring-0 p-0 text-base"
                            />
                        </Command>
                    </div>
                </PopoverTrigger>
                 <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
            </div>
        </div>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <CommandList>
            <CommandEmpty>No option found. Press Enter to add.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
        </CommandList>
      </PopoverContent>
    </Popover>
  );
}

    