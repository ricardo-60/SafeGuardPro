// SafeGuard Pro - Storage setup script

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function setupStorage() {
    console.log("Setting up Supabase Storage Bucket 'company-assets'...");

    // Create bucket if it doesn't exist
    const { data: buckets, error: getError } = await supabase.storage.listBuckets();

    if (getError) {
        console.error("Error fetching buckets:", getError);
        return;
    }

    const bucketExists = buckets?.find(b => b.name === 'company-assets');

    if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket('company-assets', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
            console.error("Error creating bucket:", error);
        } else {
            console.log("Bucket 'company-assets' created successfully!", data);
        }
    } else {
        console.log("Bucket 'company-assets' already exists. Making sure it is public...");
        const { data, error } = await supabase.storage.updateBucket('company-assets', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
            console.error("Error updating bucket:", error);
        } else {
            console.log("Bucket updated to public.", data);
        }
    }
}

setupStorage();
