import { getPropertyReviews } from "./model";
import ReviewsView from "./view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
  const propertyId = resolvedSearchParams.id as string;

  if (!propertyId) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Property Not Found</h1>
                <p className="text-muted-foreground">Please provide a valid property ID.</p>
            </div>
        </div>
    );
  }

  // Fetch initial reviews on the server
  const reviews = await getPropertyReviews(propertyId);
  const serializedReviews = JSON.parse(JSON.stringify(reviews));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 px-6">Property Reviews</h1>
      <ReviewsView 
        propertyId={propertyId} 
        initialReviews={serializedReviews} 
      />
    </div>
  );
}
