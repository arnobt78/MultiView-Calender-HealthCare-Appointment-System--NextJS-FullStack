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
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <FiSearch className="w-5 h-5" />
      </span>
      <Input
        type="text"
        placeholder="Search... (eg. Name, Title, Notes)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-3 py-2 rounded-md shadow-xl w-full"
      />
    </div>
  );
}
