import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'book' or 'profile'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-');
    const filename = `${timestamp}-${originalName}`;

    // Determine upload directory
    const uploadDir = type === 'profile' ? 'profiles' : 'books';
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', uploadDir);

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadsPath, { recursive: true });
    } catch (error) {
      console.log("Directory already exists or created");
    }

    // Write file
    const filepath = path.join(uploadsPath, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${uploadDir}/${filename}`;

    return NextResponse.json({ 
      message: "File uploaded successfully",
      url: publicUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}