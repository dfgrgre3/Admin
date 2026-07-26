"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Check, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayItems?: number;
  size?: "sm" | "default" | "lg";
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "اختر من القائمة...",
  searchPlaceholder = "بحث...",
  emptyMessage = "لا توجد نتائج",
  className,
  disabled = false,
  maxDisplayItems = 3,
  size = "default",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelect = React.useCallback(
    (value: string) => {
      const isSelected = selected.includes(value);
      if (isSelected) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, onChange]
  );

  const handleRemove = React.useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selected.filter((v) => v !== value));
    },
    [selected, onChange]
  );

  const handleClearAll = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  const selectedOptions = React.useMemo(
    () => options.filter((opt) => selected.includes(opt.value)),
    [options, selected]
  );

  const displayItems = selectedOptions.slice(0, maxDisplayItems);
  const remainingCount = selectedOptions.length - maxDisplayItems;

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-input bg-background text-right",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-primary/50",
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayItems.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="gap-1 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    +{remainingCount}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 mr-2 shrink-0">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-[200px] p-0 rounded-xl"
        align="start"
        sideOffset={4}
      >
        <Command className="rounded-xl">
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-10"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                const Icon = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border-2",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1 text-sm font-medium">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}