import { NextResponse } from 'next/server';
import pool from "@/app/libs/mysql";
import bcrypt from 'bcrypt';

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
      "SELECT * FROM owner WHERE email = ?",
      [cleanEmail]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    const user = userRows[0];
    
    // Debug logging
    console.log('Stored hash:', user.password);
    console.log('Input password:', password);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password match:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

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