
export interface ProfileData {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    Tenant?: {
        bio: string | null;
        occupation: string | null;
    };
    Landlord?: {
        bio: string | null;
        businessName: string | null;
    };
}
