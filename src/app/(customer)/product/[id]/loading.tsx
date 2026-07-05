export default function ProductLoading() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-12 md:py-20 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-24 bg-outline-variant/30 rounded-md mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-gutter">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="aspect-[4/5] w-full bg-outline-variant/20 rounded-2xl" />
          <div className="flex gap-4">
            <div className="h-20 w-20 bg-outline-variant/20 rounded-lg" />
            <div className="h-20 w-20 bg-outline-variant/20 rounded-lg" />
            <div className="h-20 w-20 bg-outline-variant/20 rounded-lg" />
          </div>
        </div>

        {/* Right Column: Info & Options */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div>
            <div className="h-3 w-20 bg-outline-variant/30 rounded-md mb-2" />
            <div className="h-8 w-3/4 bg-outline-variant/30 rounded-md mb-4" />
            <div className="h-5 w-40 bg-outline-variant/30 rounded-md" />
          </div>

          <hr className="border-outline-variant/20" />

          {/* Color Selector */}
          <div>
            <div className="h-3 w-16 bg-outline-variant/30 rounded-md mb-3" />
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-outline-variant/20" />
              <div className="h-8 w-8 rounded-full bg-outline-variant/20" />
              <div className="h-8 w-8 rounded-full bg-outline-variant/20" />
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="h-3 w-16 bg-outline-variant/30 rounded-md mb-3" />
            <div className="flex gap-3">
              <div className="h-10 w-20 bg-outline-variant/20 rounded-lg" />
              <div className="h-10 w-20 bg-outline-variant/20 rounded-lg" />
              <div className="h-10 w-20 bg-outline-variant/20 rounded-lg" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <div className="h-14 w-full bg-outline-variant/30 rounded-full" />
            <div className="h-14 w-full bg-outline-variant/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
