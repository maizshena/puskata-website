import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    const cookies = request.cookies;
    const sessionToken = cookies.get('next-auth.session-token') || cookies.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const users = await query(
      'SELECT id, name, email, profile_image, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { email, name, newEmail, profile_image, currentPassword, newPassword } = body;

    console.log('=== Update Profile Request ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('New Email:', newEmail);
    console.log('Profile Image:', profile_image);
    console.log('Has Password Change:', !!newPassword);

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // if changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required" }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      // hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await query(
        'UPDATE users SET name = ?, email = ?, password = ?, profile_image = ? WHERE id = ?',
        [name, newEmail || email, hashedPassword, profile_image || null, user.id]
      );
      
      console.log('Profile updated with new password');
    } else {
      // Update without password change
      await query(
        'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?',
        [name, newEmail || email, profile_image || null, user.id]
      );
      
      console.log('Profile updated without password change');
    }

    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ 
      error: "Failed to update profile: " + error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/profiles/${filename}`;

    return NextResponse.json(
      { 
        success: true,
        url,
        filename,
        size: file.size,
        type: file.type
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + error.message },
      { status: 500 }
    );
  }
}