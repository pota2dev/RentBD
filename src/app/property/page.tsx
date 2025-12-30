
import { getPropertyById } from './controller';
import PropertyView from './view';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PropertyPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;

  if (!id || Array.isArray(id)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-xl font-semibold text-gray-500">Property ID is required.</h1>
      </div>
    );
  }

  const property = await getPropertyById(id);

  if (!property) {
    return (
       <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
             <h1 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
             <p className="text-gray-500">We couldn't find the property you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <PropertyView property={property} />
  );
}
