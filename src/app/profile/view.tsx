'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProfileData } from './model';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Building, UserCircle, Camera, Upload } from "lucide-react";

interface ProfileViewProps {
    initialData?: ProfileData | null;
}

export default function ProfileView({ initialData }: ProfileViewProps) {
    const { user } = useUser();
    const [profile, setProfile] = useState<ProfileData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Derived state for the active role tab
    const [activeRole, setActiveRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        bio: '',
        occupation: '',
        businessName: '',
    });

    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/profile/api');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    initializeForm(data);
                    setActiveRole(data.role === 'ADMIN' ? 'TENANT' : data.role);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (initialData) {
            setProfile(initialData);
            initializeForm(initialData);
            setActiveRole(initialData.role === 'ADMIN' ? 'TENANT' : initialData.role);
            setLoading(false);
        } else {
            fetchProfile();
        }
    }, [initialData]);

    const initializeForm = (data: ProfileData) => {
        setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phoneNumber: data.phoneNumber || '',
            // Populate bio/occupation/business based on CURRENT role in DB
            bio: data.role === 'TENANT' ? data.Tenant?.bio || '' : data.Landlord?.bio || '',
            occupation: data.Tenant?.occupation || '',
            businessName: data.Landlord?.businessName || '',
        });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = async (newRole: string) => {
        const role = newRole as 'TENANT' | 'LANDLORD';
        setActiveRole(role);
        
        // When switching tabs, we update the bio/other fields in local state to match what we have in cache for that role
        // Ideally we should keep separate state for tenant vs landlord fields, but for simplicity we can just
        // rely on what's in 'profile' object if we haven't dirtied the form yet? 
        // Or better: keep the common fields, and swap the role-specific ones.
        
        if (profile) {
            setFormData(prev => ({
                ...prev,
                bio: role === 'TENANT' ? profile.Tenant?.bio || '' : profile.Landlord?.bio || '',
                // occupation/businessName are specific, keep them as is or reset?
                // we keep them in state to allow editing.
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/profile/api', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: activeRole, // Send the tab's role
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    // Send specific fields
                    bio: formData.bio,
                    occupation: activeRole === 'TENANT' ? formData.occupation : undefined,
                    businessName: activeRole === 'LANDLORD' ? formData.businessName : undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const updated = await res.json();
            setProfile(updated);
            initializeForm(updated); // Sync form with validated data
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            alert("User not authenticated with Clerk");
            return;
        }

        setUploadingImage(true);
        try {
            await user.setProfileImage({ file });
            router.refresh(); // Refresh to update server-side data if needed, though useUser updates automatically
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!profile) return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;

    const userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="container max-w-4xl py-10 mx-auto">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
            
            <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Account</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-border">
                                <AvatarImage src={user?.imageUrl || profile.imageUrl || ""} className="object-cover" />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary">{userInitials}</AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                        </div>
                        <div>
                            <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                {activeRole}
                            </div>
                            <div className="mt-2 ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                                {profile.subscriptionPlan?.toUpperCase() || 'FREE'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeRole} onValueChange={handleRoleChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="TENANT" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Tenant Profile
                            </TabsTrigger>
                            <TabsTrigger value="LANDLORD" className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Landlord Profile
                            </TabsTrigger>
                        </TabsList>

                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Manage your personal details and contact information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-6">
                            <TabsContent value="TENANT">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tenant Details</CardTitle>
                                        <CardDescription>
                                            Information shared with landlords when you book properties.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="occupation">Occupation</Label>
                                            <Input
                                                id="occupation"
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleChange}
                                                placeholder="e.g. Software Engineer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Tell landlords a bit about yourself..."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                         <Button type="submit" disabled={saving}>
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Tenant Profile
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="LANDLORD">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Landlord Details</CardTitle>
                                        <CardDescription>
                                            Information shown to potential tenants on your property listings.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName">Business Name (Optional)</Label>
                                            <Input
                                                id="businessName"
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                placeholder="e.g. Dream Stays LLC"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio" // Same ID/name as tenant bio, but handled by conditional rendering
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Describe your hosting style or business..."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Landlord Profile
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </form>
            </div>
        </div>
    );
}
