import { NextResponse } from 'next/server';
import pool from "@/app/libs/mysql";
import bcrypt from 'bcrypt';

export async function POST(request) {
  let db;
  try {
    const { email, password } = await request.json();
    
    // Debug: Log incoming credentials
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    db = await pool.getConnection();

    // Check if user exists
    const [userRows] = await db.execute(
      "SELECT * FROM admin WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      console.log('No user found for email:', email);
      return NextResponse.json(
        { error: "Invalid credentials" }, // Generic message for security
        { status: 401 }
      );
    }

    const user = userRows[0];
    
    // Debug: Log comparison details
    console.log('Stored hash:', user.password);
    console.log('Comparing with input password...');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}