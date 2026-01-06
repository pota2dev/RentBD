'use client';

import { useState, useCallback } from 'react';
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
import FileUpload01 from "@/components/file-upload-01";

import { createClient } from '@/lib/supabase';

interface PropertyData {
    id?: string;
    title: string;
    description: string;
    type: 'APARTMENT' | 'HOUSE' | 'CONDO' | 'STUDIO' | 'ROOM';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    
    // New
    area?: number; // Sq ft
    pricePerMonth: number;
    balcony: number;
    floorNo: number;
    utilitiesIncluded: string;
    division: string;
    district: string;
    thana: string;
    subArea: string;
    shortAddress: string;
    latitude?: number;
    longitude?: number;
    
    images?: string[]; // Define images here
}

interface PropertyFormProps {
    initialData?: PropertyData;
    onSuccess?: () => void;
    mode?: 'create' | 'edit';
}

export default function PropertyForm({ initialData, onSuccess, mode = 'create' }: PropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>(initialData?.images || []);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PropertyData>({
        id: initialData?.id,
        title: initialData?.title || '',
        description: initialData?.description || '',
        type: initialData?.type || 'APARTMENT',
        address: initialData?.address || '', 
        city: initialData?.city || '', 
        state: initialData?.state || '', 
        zipCode: initialData?.zipCode || '',
        bedrooms: initialData?.bedrooms || 1,
        bathrooms: initialData?.bathrooms || 1,
        maxGuests: initialData?.maxGuests || 0, 
        
        area: initialData?.area || 0,
        pricePerMonth: initialData?.pricePerMonth || 0,
        balcony: initialData?.balcony || 0,
        floorNo: initialData?.floorNo || 1,
        utilitiesIncluded: initialData?.utilitiesIncluded || '',
        division: initialData?.division || '',
        district: initialData?.district || '',
        thana: initialData?.thana || '',
        subArea: initialData?.subArea || '',
        shortAddress: initialData?.shortAddress || '',
        latitude: initialData?.latitude || 0,
        longitude: initialData?.longitude || 0,
        images: initialData?.images || []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['pricePerMonth', 'bedrooms', 'bathrooms', 'balcony', 'floorNo', 'maxGuests', 'area', 'latitude', 'longitude'].includes(name)
                ? Number(value)
                : value
        }));
    };
    
    const handleFilesUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        
        setUploading(true);
        const supabase = createClient();
        const urls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('properties') // Assumes 'properties' bucket exists
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload Error:', uploadError);
                     // alert('Failed to upload image: ' + uploadError.message); // Optional
                    continue; 
                }
                
                const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
                if (data) {
                    urls.push(data.publicUrl);
                }
            }
            
            setUploadedImages(prev => [...prev, ...urls]);
        } catch (err) {
            console.error(err);
             setError('Failed to upload images');
        } finally {
            setUploading(false);
        }
    }, []);


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
            
            // Map legacy fields if needed or validation
            const payload = {
                ...formData,
                // Ensure legacy required fields have values if strictly required by Schema
                // address -> shorterAddress or composition?
                address: formData.address || formData.shortAddress || 'N/A',
                city: formData.city || formData.district || 'N/A',
                images: uploadedImages, // Include uploaded images
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
        <Card className="w-full max-w-2xl mx-auto border-0 shadow-none">
            {/* Header handled by Dialog usually */}
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-0">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="title">Property Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Spacious Apartment in Mirpur"
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
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Property Features</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="bedrooms">Bedroom</Label>
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
                                <Label htmlFor="bathrooms">Bathroom</Label>
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
                             <div className="space-y-2">
                                <Label htmlFor="balcony">Balcony</Label>
                                <Input
                                    id="balcony"
                                    name="balcony"
                                    type="number"
                                    min="0"
                                    value={formData.balcony}
                                    onChange={handleChange}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="floorNo">Floor No</Label>
                                <Input
                                    id="floorNo"
                                    name="floorNo"
                                    type="number"
                                    min="0"
                                    value={formData.floorNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Area (Sq Ft)</Label>
                                <Input
                                    id="area"
                                    name="area"
                                    type="number"
                                    min="0"
                                    value={formData.area || ''}
                                    onChange={handleChange}
                                    placeholder="1200"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Location Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Location Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="division">Division</Label>
                                <Input
                                    id="division"
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                    placeholder="Dhaka"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    placeholder="Dhaka"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="thana">Area / Thana</Label>
                                <Input
                                    id="thana"
                                    name="thana"
                                    value={formData.thana}
                                    onChange={handleChange}
                                    placeholder="Mirpur"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="subArea">Sub Area</Label>
                                <Input
                                    id="subArea"
                                    name="subArea"
                                    value={formData.subArea}
                                    onChange={handleChange}
                                    placeholder="Mirpur 1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortAddress">Short Address</Label>
                            <Input
                                id="shortAddress"
                                name="shortAddress"
                                value={formData.shortAddress}
                                onChange={handleChange}
                                placeholder="Demo information"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude (Optional)</Label>
                                <Input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="23.8103"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude (Optional)</Label>
                                <Input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="90.4125"
                                />
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground">
                                You can find coordinates from Google Maps (Right click {'>'} First option)
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Pricing (Monthly)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricePerMonth">Price (BDT)</Label>
                                <Input
                                    id="pricePerMonth"
                                    name="pricePerMonth"
                                    type="number"
                                    min="0"
                                    value={formData.pricePerMonth}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="utilitiesIncluded">Price included with</Label>
                            <Textarea
                                id="utilitiesIncluded"
                                name="utilitiesIncluded"
                                value={formData.utilitiesIncluded}
                                onChange={handleChange}
                                placeholder="e.g. Electricity Bill, Gas Bill"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Property Images</h3>
                        <div className="space-y-2">
                             <Label>Upload Images</Label>
                             <FileUpload01 
                                images={uploadedImages}
                                onUpload={handleFilesUpload}
                                onRemove={(url) => setUploadedImages(prev => prev.filter(u => u !== url))}
                                uploading={uploading}
                             />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Summary</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Demo Summary..."
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


