"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";

interface ShopFiltersProps {
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  focusSearch: boolean;
}

export default function ShopFilters({
  currentCategory,
  currentSearch,
  currentSort,
  focusSearch,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusSearch]);

  const categories = [
    { name: "All Collections", id: "all" },
    { name: "Sprei", id: "sprei" },
    { name: "Bedcover", id: "bedcover" },
    { name: "Selimut", id: "selimut" },
    { name: "Aksesoris", id: "aksesoris" },
  ];

  const sortOptions = [
    { name: "Newest", id: "newest" },
    { name: "Best Selling", id: "popular" },
    { name: "Price: Low to High", id: "price-asc" },
    { name: "Price: High to Low", id: "price-desc" },
  ];

  const updateFilters = (newCategory: string, newSearch: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== "all") params.set("category", newCategory);
    if (newSearch.trim()) params.set("search", newSearch);
    if (newSort && newSort !== "newest") params.set("sort", newSort);

    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(currentCategory, searchValue, currentSort);
  };

  const activeCategoryName = categories.find((c) => c.id === currentCategory)?.name || "Category";
  const activeSortName = sortOptions.find((o) => o.id === currentSort)?.name || "Sort By";

  return (
    <div className="flex flex-col gap-6 mb-16 pb-8 border-b border-outline-variant/30">
      {/* Search, Category, and Sort Row */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search collections..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-background focus:border-primary focus:outline-none transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-secondary" />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center justify-start md:justify-end">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center space-x-2 border border-outline-variant bg-surface px-4 py-3 rounded-lg font-label-caps text-label-caps text-on-background hover:border-primary transition-colors cursor-pointer"
            >
              <span>{activeCategoryName}</span>
              <ChevronDown className="h-4 w-4 text-secondary" />
            </button>

            {isCategoryOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/50 rounded-lg shadow-lg py-2 z-40 animate-scale-up">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateFilters(cat.id, searchValue, currentSort);
                      setIsCategoryOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 font-sans text-xs text-text-secondary hover:bg-surface-dim hover:text-primary flex items-center justify-between cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    {currentCategory === cat.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCategoryOpen(false);
              }}
              className="flex items-center space-x-2 border border-outline-variant bg-surface px-4 py-3 rounded-lg font-label-caps text-label-caps text-on-background hover:border-primary transition-colors cursor-pointer"
            >
              <span>Sort By: {activeSortName}</span>
              <ChevronDown className="h-4 w-4 text-secondary" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/50 rounded-lg shadow-lg py-2 z-40 animate-scale-up">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      updateFilters(currentCategory, searchValue, opt.id);
                      setIsSortOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 font-sans text-xs text-text-secondary hover:bg-surface-dim hover:text-primary flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt.name}</span>
                    {currentSort === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
