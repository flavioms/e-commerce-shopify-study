import Link from 'next/link';
import { PackageSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
            <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                Product not found
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
                We couldn&apos;t find the product you&apos;re looking for. It may have been removed or the link is incorrect.
            </p>
            <Button render={<Link href="/products" />}>Back to products</Button>
        </div>
    );
}
