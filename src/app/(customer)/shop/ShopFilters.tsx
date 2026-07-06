"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";

interface ShopFiltersProps {
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  focusSearch: boolean;
  categoriesList: string[];
}

export default function ShopFilters({
  currentCategory,
  currentSearch,
  currentSort,
  focusSearch,
  categoriesList,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusSearch]);

  const categories = [
    { name: "Semua Koleksi", id: "all" },
    ...categoriesList.map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      id: cat,
    })),
  ];

  const sortOptions = [
    { name: "Terbaru", id: "newest" },
    { name: "Terlaris", id: "popular" },
    { name: "Harga: Terendah ke Tertinggi", id: "price-asc" },
    { name: "Harga: Tertinggi ke Terendah", id: "price-desc" },
  ];

  const updateFilters = (newCategory: string, newSearch: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== "all") params.set("category", newCategory);
    if (newSearch.trim()) params.set("search", newSearch);
    if (newSort && newSort !== "newest") params.set("sort", newSort);

    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters(currentCategory, String(formData.get("search") || ""), currentSort);
  };

  const activeCategoryName = categories.find((c) => c.id === currentCategory)?.name || "Kategori";
  const activeSortName = sortOptions.find((o) => o.id === currentSort)?.name || "Urutkan";

  return (
    <div className="mb-14 flex flex-col gap-6 border-b border-outline-variant/30 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            ref={searchInputRef}
            key={currentSearch}
            name="search"
            type="text"
            placeholder="Cari koleksi..."
            defaultValue={currentSearch}
            className="w-full rounded-xl border border-outline-variant bg-surface px-10 py-3 text-sm text-on-background transition-colors focus:border-primary focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-secondary" />
        </form>

        <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsSortOpen(false);
              }}
              className="gold-button flex items-center space-x-2 rounded-full border border-outline-variant bg-surface px-4 py-3 font-label-caps text-label-caps text-on-background hover:border-primary cursor-pointer"
            >
              <span>{activeCategoryName}</span>
              <ChevronDown className="h-4 w-4 text-secondary" />
            </button>

            {isCategoryOpen && (
              <div className="surface-panel absolute right-0 z-40 mt-2 w-48 rounded-xl py-2 animate-scale-up">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateFilters(cat.id, String(searchInputRef.current?.value || ""), currentSort);
                      setIsCategoryOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left font-sans text-xs text-on-surface-variant hover:bg-surface-dim hover:text-primary"
                  >
                    <span>{cat.name}</span>
                    {currentCategory === cat.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCategoryOpen(false);
              }}
              className="gold-button flex items-center space-x-2 rounded-full border border-outline-variant bg-surface px-4 py-3 font-label-caps text-label-caps text-on-background hover:border-primary cursor-pointer"
            >
              <span>Urutkan: {activeSortName}</span>
              <ChevronDown className="h-4 w-4 text-secondary" />
            </button>

            {isSortOpen && (
              <div className="surface-panel absolute right-0 z-40 mt-2 w-56 rounded-xl py-2 animate-scale-up">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      updateFilters(currentCategory, String(searchInputRef.current?.value || ""), opt.id);
                      setIsSortOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left font-sans text-xs text-on-surface-variant hover:bg-surface-dim hover:text-primary"
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
