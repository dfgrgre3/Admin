"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUS_TABS } from "./list-constants";

interface PageStatusTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PageStatusTabs({ value, onChange }: PageStatusTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
        {STATUS_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`rounded-xl px-5 text-sm font-black data-[state=active]:shadow-lg whitespace-nowrap ${
              tab.activeClass ||
              "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            }`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}