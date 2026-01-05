import { getOwnedProperties } from './model';
import { ManagePropertiesHeader, PropertyList } from './view';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// export const dynamic = 'force-dynamic';

async function PropertiesContent() {
    const { data, error, status } = await getOwnedProperties();

    if (status === 401) {
        redirect('/sign-in'); // Or however auth redirect works
    }

    if (error || !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-600">{error || 'Something went wrong loading your properties.'}</p>
                </div>
            </div>
        );
    }

    const serializedProperties = data.map(property => ({
        ...property,
        pricePerMonth: Number(property.pricePerMonth)
    }));

    return <PropertyList properties={serializedProperties} />;
}

export default function ManagePropertiesPage() {
    return (
        <div className="container mx-auto py-10">
            <ManagePropertiesHeader />
            <Suspense fallback={
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500">Loading your properties...</p>
                    </div>
                </div>
            }>
                <PropertiesContent />
            </Suspense>
        </div>
    );
}
