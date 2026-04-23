"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  value: string;
  setValue: (val: string) => void;
}

export default function SearchBar({ value, setValue }: SearchBarProps) {
  return (
    <div className="relative max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <FiSearch className="w-4 h-4" />
      </span>
      <Input
        type="text"
        placeholder="Search... (eg. Name, Title, Notes)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 pl-10 pr-3 rounded-2xl shadow-sm w-full bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-slate-400 focus:ring-slate-200 text-sm"
      />
    </div>
  );
}
