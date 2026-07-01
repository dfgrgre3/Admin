"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsIconButton({ icon: Icon, onClick, title, variant = "default" }: { icon: React.ElementType; onClick?: () => void; title?: string; variant?: "default" | "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2.5 rounded-xl border transition-all active:scale-90",
        variant === "danger"
          ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-400"
          : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/20"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function SectionHeader({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
      <div className={cn("p-3 rounded-2xl", `bg-${color}-500/10 text-${color}-500`)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">{description}</p>
      </div>
    </div>
  );
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer"
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-white/10 bg-white/5 px-4 font-mono text-sm"
      />
    </div>
  );
}

export function ArrayInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [inputValue, setInputValue] = React.useState("");

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-xl border-white/10 bg-white/5 px-4"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
        />
        <Button type="button" onClick={addItem} size="sm" className="rounded-xl">
          إضافة
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((item, index) => (
          <Badge key={index} variant="secondary" className="gap-2 px-3 py-1.5 rounded-xl">
            {item}
            <button onClick={() => removeItem(index)} className="hover:text-red-400 transition-colors">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}