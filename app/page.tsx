import { listProperties } from '@/src/controllers/property.controller';
import Image from "next/image";

export default async function Home() {
  const properties = await listProperties();

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Available Properties</h1>

        {properties.length === 0 ? (
          <div className="text-center text-zinc-500">
            <p>No properties found.</p>
            <p className="text-sm mt-2">Add some properties to the database to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.propertyId} className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                    No Image
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 dark:text-white">{property.title}</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2 truncate">{property.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg dark:text-white">${Number(property.pricePerNight)}/night</span>
                    <span className="text-sm text-zinc-500">{property.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
