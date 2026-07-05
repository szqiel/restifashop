export default function ShopLoading() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-6 w-24 bg-outline-variant/30 rounded-md mb-3" />
      <div className="h-10 w-64 bg-outline-variant/30 rounded-lg mb-10" />

      {/* Filter Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-16 pb-8 border-b border-outline-variant/20">
        <div className="h-12 w-full md:max-w-md bg-outline-variant/30 rounded-lg" />
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-outline-variant/30 rounded-lg" />
          <div className="h-12 w-44 bg-outline-variant/30 rounded-lg" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-gutter gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            {/* Image Placeholder */}
            <div className="aspect-[4/5] w-full bg-outline-variant/20 rounded-xl" />
            
            {/* Info Placeholders */}
            <div className="h-3 w-1/3 bg-outline-variant/30 rounded-md" />
            <div className="h-4 w-3/4 bg-outline-variant/30 rounded-md" />
            
            {/* Price Placeholder */}
            <div className="flex gap-2 items-center mt-1">
              <div className="h-4 w-20 bg-outline-variant/30 rounded-md" />
              <div className="h-3 w-10 bg-outline-variant/30 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
