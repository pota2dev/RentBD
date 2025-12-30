'use client';

import { useState } from 'react';
import PropertyForm from '@/components/PropertyForm'; // Assumes I created this earlier
import { Plus, Pencil, Trash2, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface Property {
    propertyId: string;
    title: string;
    description: string | null;
    type: any;
    address: string;
    city: string;
    state: string | null;
    zipCode: string | null;
    pricePerNight: any; // Decimal needs handling
    bedrooms: number | null;
    bathrooms: number | null;
    maxGuests: number | null;
}

interface ViewProps {
    properties: Property[];
}

export default function ManagePropertiesView({ properties }: ViewProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        router.refresh();
    };

    const handleUpdateSuccess = () => {
        setEditingProperty(null);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/properties?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete property');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting property');
        }
    };

    return (
        <div className="container mx-auto py-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Properties</h1>
                    <p className="text-gray-500 mt-2">Manage your listings and view their status.</p>
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add New Property
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>List New Property</DialogTitle>
                            <DialogDescription className="sr-only">Fill in the details to list your new property.</DialogDescription>
                        </DialogHeader>
                        {/* Form's header is hidden conditionally or we just accept double header? 
                            Let's keep form header for now as it's a Card. 
                            Actually, to be clean, let's just make the DialogTitle accessible but perhaps hidden if the form has one.
                            But standard accessible pattern: Dialog has visible title.
                            If I use sr-only for DialogTitle, readers get it.
                        */}
                        <PropertyForm onSuccess={handleCreateSuccess} mode="create" />
                    </DialogContent>
                </Dialog>
            </div>

            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-gray-50 text-center h-[50vh]">
                    <Home className="h-10 w-10 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No properties listed yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Get started by listing your first property.</p>
                    <Button onClick={() => setIsCreateOpen(true)}>List Your Property</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <Card key={property.propertyId} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="truncate" title={property.title}>{property.title}</CardTitle>
                                <CardDescription className="truncate">{property.city}, {property.state}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="text-sm space-y-2 text-gray-600">
                                    <p><span className="font-semibold">Type:</span> {property.type}</p>
                                    <p><span className="font-semibold">Price:</span> ${Number(property.pricePerNight)} / night</p>
                                    <p><span className="font-semibold">Details:</span> {property.bedrooms} Bed, {property.bathrooms} Bath, {property.maxGuests} Guests</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Dialog open={!!editingProperty && editingProperty.propertyId === property.propertyId} onOpenChange={(open) => !open && setEditingProperty(null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setEditingProperty(property)}>
                                            <Pencil className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Edit Property</DialogTitle>
                                             <DialogDescription className="sr-only">Update the details of your property.</DialogDescription>
                                        </DialogHeader>
                                        <PropertyForm 
                                            initialData={{
                                                ...property,
                                                description: property.description || '',
                                                type: property.type, // Enum cast might be needed if TS complains
                                                state: property.state || '',
                                                zipCode: property.zipCode || '',
                                                pricePerNight: Number(property.pricePerNight),
                                                bedrooms: property.bedrooms || 1,
                                                bathrooms: property.bathrooms || 1,
                                                maxGuests: property.maxGuests || 1,
                                            }} 
                                            onSuccess={handleUpdateSuccess} 
                                            mode="edit" 
                                        />
                                    </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently remove your property listing.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(property.propertyId)} className="bg-red-600 hover:bg-red-700">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
