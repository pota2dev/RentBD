'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PropertyData {
    propertyId?: string;
    title: string;
    description: string;
    type: 'APARTMENT' | 'HOUSE' | 'CONDO' | 'STUDIO' | 'ROOM';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    pricePerNight: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
}

interface PropertyFormProps {
    initialData?: PropertyData;
    onSuccess?: () => void;
    mode?: 'create' | 'edit';
}

export default function PropertyForm({ initialData, onSuccess, mode = 'create' }: PropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PropertyData>(initialData || {
        title: '',
        description: '',
        type: 'APARTMENT',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        pricePerNight: 0,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'pricePerNight' || name === 'bedrooms' || name === 'bathrooms' || name === 'maxGuests'
                ? Number(value)
                : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value as any }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const method = mode === 'create' ? 'POST' : 'PUT';
            const url = '/api/properties'; 
            
            // For PUT, we might need to send propertyId in body or query.
            // Let's assume the API handles PUT with ID in body for now.
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save property');
            }

            router.refresh();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{mode === 'create' ? 'List New Property' : 'Edit Property'}</CardTitle>
                <CardDescription>
                    {mode === 'create' ? 'Fill in the details to list your new property.' : 'Update the details of your property.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Property Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Cozy Downtown Apartment"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Property Type</Label>
                        <Select value={formData.type} onValueChange={handleSelectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APARTMENT">Apartment</SelectItem>
                                <SelectItem value="HOUSE">House</SelectItem>
                                <SelectItem value="CONDO">Condo</SelectItem>
                                <SelectItem value="STUDIO">Studio</SelectItem>
                                <SelectItem value="ROOM">Room</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pricePerNight">Price per Night ($)</Label>
                            <Input
                                id="pricePerNight"
                                name="pricePerNight"
                                type="number"
                                min="0"
                                value={formData.pricePerNight}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxGuests">Max Guests</Label>
                            <Input
                                id="maxGuests"
                                name="maxGuests"
                                type="number"
                                min="1"
                                value={formData.maxGuests}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Input
                                id="bedrooms"
                                name="bedrooms"
                                type="number"
                                min="0"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input
                                id="bathrooms"
                                name="bathrooms"
                                type="number"
                                min="0"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe the property features, amenities, and location..."
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'create' ? 'List Property' : 'Update Property'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
