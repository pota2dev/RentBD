'use client';

import { useState } from 'react';
import PropertyForm from '@/components/PropertyForm';
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

export interface Property {
    id: string;
    title: string;
    description: string | null;
    type: any;
    address: string;
    city: string;
    state: string | null;
    zipCode: string | null;
    
    // Legacy/Short-term
    maxGuests: number | null; 
    
    // New
    pricePerMonth: any;
    balcony: number | null;
    floorNo: number | null;
    utilitiesIncluded: string | null;
    division: string | null;
    district: string | null;
    thana: string | null;
    subArea: string | null;
    shortAddress: string | null;
    
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    // Images
    PropertyImage?: { imageUrl: string }[];
}

export function ManagePropertiesHeader() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const router = useRouter();

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        router.refresh();
    };

    return (
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
                    <PropertyForm onSuccess={handleCreateSuccess} mode="create" />
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface PropertyListProps {
    properties: Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    // We need a way to trigger create dialog from empty state? 
    // The empty state has a button "List Your Property" which opens the create dialog.
    // The create dialog is in the Header. 
    // This is a small issue. 
    // Options:
    // 1. Pass a prop to PropertyList to openCreateDialog.
    // 2. Duplicate the create dialog or move the open state up (but that defeats the purpose of splitting if state is lifted to Page? No, Page is Server).
    // 3. Move the create dialog to a shared context? Overkill.
    // 4. Just have a separate Create Dialog in the empty state? 
    // 5. Change the flow so Empty state button does something else?
    
    // The user's request is to split them so the header loads first.
    // The empty state is shown ONLY after data is loaded.
    // So the empty state creates a dependency on the Create Dialog.
    
    // Let's use a simpler approach. 
    // I can export a trigger or just duplicate the "List Property" button's action to route to a create page? 
    // Or just duplicate the Dialog for now in the empty state. It calls the same `PropertyForm`.
    
    const [isCreateOpen, setIsCreateOpen] = useState(false); // Local state for empty state dialog
    const router = useRouter();

    const handleUpdateSuccess = () => {
        setEditingProperty(null);
        router.refresh();
    };

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
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

    if (properties.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-gray-50 text-center h-[50vh]">
                <Home className="h-10 w-10 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No properties listed yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Get started by listing your first property.</p>
                {/* 
                   We duplicate the dialog here for the empty state case. 
                   Alternatively, we could have passed a setter, but Header is sibling.
                   Actually, Header renders immediately. List renders later.
                   They are siblings in Page. They can't share state easily without Context or URL state.
                   Duplicating the Dialog wrapper is the easiest solution for "List Your Property" button in Empty State.
                */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>List Your Property</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>List New Property</DialogTitle>
                             <DialogDescription className="sr-only">Fill in the details to list your new property.</DialogDescription>
                        </DialogHeader>
                        <PropertyForm onSuccess={handleCreateSuccess} mode="create" />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
                <Card key={property.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="truncate" title={property.title}>{property.title}</CardTitle>
                        <CardDescription className="truncate">
                            {property.thana ? `${property.thana}, ${property.district}` : `${property.city}, ${property.state}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-sm space-y-2 text-gray-600">
                            <p><span className="font-semibold">Type:</span> {property.type}</p>
                            <p><span className="font-semibold">Price:</span> {property.pricePerMonth ? `${Number(property.pricePerMonth).toLocaleString()} BDT / month` : `N/A`}</p>
                            <p><span className="font-semibold">Details:</span> {property.bedrooms} Bed, {property.bathrooms} Bath</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/property?id=${property.id}`)}>
                                View
                        </Button>
                        <Dialog open={!!editingProperty && editingProperty.id === property.id} onOpenChange={(open) => !open && setEditingProperty(null)}>
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
                                        type: property.type,
                                        state: property.state || '',
                                        zipCode: property.zipCode || '',
                                        bedrooms: property.bedrooms || 1,
                                        bathrooms: property.bathrooms || 1,
                                        area: property.area || 0,
                                        maxGuests: property.maxGuests || 0,
                                        // New Mappings
                                        pricePerMonth: Number(property.pricePerMonth || 0),
                                        balcony: property.balcony || 0,
                                        floorNo: property.floorNo || 1,
                                        utilitiesIncluded: property.utilitiesIncluded || '',
                                        division: property.division || '',
                                        district: property.district || '',
                                        thana: property.thana || '',
                                        subArea: property.subArea || '',
                                        shortAddress: property.shortAddress || '',
                                        images: property.PropertyImage?.map(img => img.imageUrl) || [],
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
                                    <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-red-600 hover:bg-red-700">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
