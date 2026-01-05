
import {ProfileData, getProfileController } from './model';
import ProfileView from './view';

// export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const { data, error } = await getProfileController();

    if (error) {
         // In a real app, might want to redirect to login or show error page
         // For now, passing null to view so it can handle it or show loading/error
         console.error('Failed to load profile server-side:', error);
         return <div className="p-8 text-center text-red-500">Error loading profile: {error}</div>;
    }

    return <ProfileView initialData={data as ProfileData} />;
}
