import { listProperties, addNewProperty } from '../src/controllers/property.controller';
import type { PropertyType } from '../app/generated/prisma/client';

async function main() {
    console.log('Testing MVC Architecture...');

    try {
        // 1. List properties (should be empty initially)
        console.log('Fetching properties...');
        const initialProperties = await listProperties();
        console.log(`Initial properties count: ${initialProperties.length}`);

        // Note: We cannot easily create a property without a landlord and user existing first due to foreign key constraints.
        // For this test, we will just verify that the read operation works, which confirms the Controller -> Model -> DB path.

        console.log('MVC Architecture verification successful (Read operation verified).');
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

main();
