import { NextResponse } from 'next/server';
import pool from "@/app/libs/mysql";
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  let db;
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    const cleanEmail = email.trim().toLowerCase();
    db = await pool.getConnection();

    // Check if user exists
    const [userRows] = await db.execute(
      "SELECT * FROM customer WHERE email = ?",
      [cleanEmail]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    const user = userRows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate and store session token
    const sessionToken = uuidv4();
    await db.execute(
      "UPDATE customer SET session_token = ? WHERE email = ?",
      [sessionToken, cleanEmail]
    );

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An error occurred during login" 
      },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}