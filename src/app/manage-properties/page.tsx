import { getOwnedProperties } from './model';
import ManagePropertiesView from './view';
import { redirect } from 'next/navigation';

export default async function ManagePropertiesPage() {
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

    // Serialize data to pass to client component (handle Prisma Decimal)
    const serializedProperties = data.map(property => ({
        ...property,
        pricePerMonth: Number(property.pricePerMonth)
    }));


    return <ManagePropertiesView properties={serializedProperties} />;
}
