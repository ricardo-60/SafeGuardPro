// Script to test asset upload
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testUpload() {
    console.log("Testing upload to company-assets...");

    // Create a dummy text file to test upload
    const dummyContent = "Test watermark file content";
    const fileName = `test-company/test-watermark-${Date.now()}.txt`;

    const { data, error } = await supabase.storage
        .from('company-assets')
        .upload(fileName, dummyContent, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error("❌ Upload failed:", error);
    } else {
        console.log("✅ Upload successful:", data);

        const { data: publicUrlData } = supabase.storage
            .from('company-assets')
            .getPublicUrl(fileName);

        console.log("Public URL:", publicUrlData.publicUrl);
    }
}

testUpload();
