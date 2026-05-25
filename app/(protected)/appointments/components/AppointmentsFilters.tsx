"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { formatInputDate, parseInputDate } from "@/lib/utils";

import AppointmentsDialog from "./AppointmentsDialog";

type AppointmentsFiltersProps = {
  search: string;
  date: string;
  clinicId: string;
  canCreate: boolean;
};

export default function AppointmentsFilters({
  search,
  date,
  clinicId,
  canCreate,
}: AppointmentsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const [dateValue, setDateValue] = useState(date);

  function updateFilters(next: Partial<AppointmentsFiltersProps>) {
    const params = new URLSearchParams(searchParams.toString());
    const nextSearch = next.search ?? searchValue;
    const nextDate = next.date ?? dateValue;

    setSearchValue(nextSearch);
    setDateValue(nextDate);

    if (nextSearch.trim()) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    params.set("date", nextDate);

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function changeDay(direction: number) {
    const nextDate = parseInputDate(dateValue);
    if (!nextDate) return;

    nextDate.setDate(nextDate.getDate() + direction);
    updateFilters({ date: formatInputDate(nextDate) });
  }

  return (
    <div className="flex w-full items-center justify-between">
      {canCreate ? <AppointmentsDialog clinicId={clinicId} /> : <span />}

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Dia anterior"
          onClick={() => changeDay(-1)}
        >
          <ChevronLeft className="h-6 w-6 cursor-pointer" />
        </button>

        <Input
          type="date"
          value={dateValue}
          onChange={(event) => updateFilters({ date: event.target.value })}
          className="w-fit"
        />

        <button
          type="button"
          aria-label="Proximo dia"
          onClick={() => changeDay(1)}
        >
          <ChevronRight className="h-6 w-6 cursor-pointer" />
        </button>
      </div>

      <div className="relative w-fit items-center">
        <Input
          placeholder="Pesquisar"
          className="w-80 pr-10"
          value={searchValue}
          onChange={(event) => updateFilters({ search: event.target.value })}
        />
        <Search className="text-text2 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
      </div>
    </div>
  );
}
