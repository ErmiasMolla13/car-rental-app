import pool from "@/app/libs/mysql";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

export async function GET(request) {
  let db;
  try {
    const searchParams = request.nextUrl.searchParams;
    const owner_name = searchParams.get("owner_name");
    const owner_id = searchParams.get("owner_id");
    const address = searchParams.get("address");

    db = await pool.getConnection();

    let query = "SELECT * FROM owner";
    let params = [];

    if (owner_id && owner_name && address) {
      query = "SELECT * FROM owner WHERE owner_id = ? AND owner_name = ? AND address=?";
      params = [owner_id, owner_name, address];
    } else if (owner_id && address) {
      query = "SELECT * FROM owner WHERE owner_id = ? AND address=?";
      params = [owner_id, address];
    } else if (owner_name && address) {
      query = "SELECT * FROM owner WHERE owner_name = ? AND address=?";
      params = [owner_name, address];
    }else if (owner_name) {
      query = "SELECT * FROM owner WHERE owner_name = ? ";
      params = [owner_name];
    }
    else if (address) {
      query = "SELECT * FROM owner WHERE address = ? ";
      params = [address];
    }
    else if (owner_id) {
      query = "SELECT * FROM owner WHERE owner_id = ? ";
      params = [owner_id];
    }else{
     query = "SELECT * FROM owner";
    }

    const [rows] = await db.execute(query, params);
    
    return NextResponse.json({ 
      rows: rows, 

    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}


//post

export async function POST(request) {
  let db;
  try {
    const incoming_data = await request.json();
     console.log("Incoming data:", incoming_data); 

    // Validate required fields
    if (!incoming_data.owner_name || !incoming_data.email || !incoming_data.password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(incoming_data.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    db = await pool.getConnection();
    console.log("Database connection established");

    // Check if email exists (case insensitive)
    const [existingUser] = await db.execute(
      "SELECT * FROM owner WHERE LOWER(email) = LOWER(?)", 
      [incoming_data.email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
       { success: false,
         message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(incoming_data.password, 10);

    // Insert new customer
    const [result] = await db.execute(
      "INSERT INTO owner (owner_name, address, contact, email, password) VALUES (?, ?, ?, ?, ?)",
      [
        incoming_data.owner_name,
        incoming_data.address || null, // Handle optional fields
        incoming_data.contact || null,
        incoming_data.email,
        hashedPassword
      ]
    );

    return NextResponse.json(
      { 
        success: true,
        customerId: result.insertId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}


export async function DELETE(request) {
  let db;
  try {
    const { owner_id, email } = await request.json();
    
    if (!owner_id && !email) {
      return NextResponse.json(
        { success: false, message: "Owner ID or email is required" },
        { status: 400 }
      );
    }

    db = await pool.getConnection();

    // Build the query based on provided identifier
    let query = "DELETE FROM owner WHERE ";
    let params = [];
    
    if (owner_id) {
      query += "owner_id = ?";
      params = [owner_id];
    } else {
      query += "email = ?";
      params = [email];
    }

    // Execute deletion
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Owner deleted successfully",
        affectedRows: result.affectedRows
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete owner error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}