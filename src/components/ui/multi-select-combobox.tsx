
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
      <PopoverTrigger asChild>
        <div className={cn("w-full", className)}>
            <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-11 items-center bg-background cursor-pointer">
                <div className="flex flex-wrap gap-2 flex-grow">
                  {selected.map((value) => (
                    <Badge key={value} variant="secondary" className="pl-3 pr-1 text-base">
                      {getLabel(value)}
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(value)
                          }}
                          className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                  {selected.length === 0 && <span className="text-muted-foreground text-sm ml-1">{placeholder}</span>}
                </div>
                 <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
            </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command onKeyDown={handleKeyDown}>
            <CommandInput
                placeholder={inputPlaceholder}
                value={inputValue}
                onValueChange={setInputValue}
            />
            <CommandList>
                <CommandEmpty>No option found. Press Enter to add.</CommandEmpty>
                <CommandGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 p-1">
                    {options.map((option) => (
                      <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                      className="w-full"
                      >
                      <Check
                          className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value) ? "opacity-100" : "opacity-0"
                          )}
                      />
                      <span className="flex-1">{option.label}</span>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
            </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
