/** Streamed in immediately on navigation to a product page, while getProductByHandle() resolves. */
export default function ProductDetailsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-5 w-32 animate-pulse rounded-md bg-muted" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
            <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col gap-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-9 w-full animate-pulse rounded-lg bg-muted sm:w-40" />
        </div>
      </div>
    </div>
  );
}
