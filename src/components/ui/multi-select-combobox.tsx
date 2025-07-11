
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
        if (!selected.includes(inputValue) && !options.find(o => o.value === inputValue)) {
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
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-11 items-center">
            {selected.map((value) => (
              <Badge key={value} variant="secondary" className="pl-2 pr-1">
                {getLabel(value)}
                <button
                    onClick={() => handleRemove(value)}
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className="flex-1 justify-between p-0 h-auto hover:bg-transparent"
                  onClick={() => setOpen(!open)}
                >
                  <span className="text-muted-foreground font-normal">
                    {selected.length === 0 ? placeholder : ''}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
        </div>
      </div>
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
              {options.map((option) => (
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
