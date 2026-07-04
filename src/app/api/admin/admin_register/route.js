import pool from "@/app/libs/mysql";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';


export async function GET(request) {
  let db;
  try {
    const searchParams = request.nextUrl.searchParams;
    const admin_name = searchParams.get("admin_name");
    const admin_id = searchParams.get("admin_id");
    const address = searchParams.get("address");

    db = await pool.getConnection();

    let query = "SELECT * FROM admin";
    let params = [];

    if (admin_id && admin_name && address) {
      query = "SELECT * FROM admin WHERE admin_id = ? AND admin_name = ? AND address=?";
      params = [admin_id, admin_name, address];
    } else if (admin_id && address) {
      query = "SELECT * FROM admin WHERE admin_id = ? AND address=?";
      params = [admin_id, address];
    } else if (admin_name && address) {
      query = "SELECT * FROM admin WHERE admin_name = ? AND address=?";
      params = [admin_name, address];
    }else if (admin_name) {
      query = "SELECT * FROM admin WHERE admin_name = ? ";
      params = [admin_name];
    }
    else if (address) {
      query = "SELECT * FROM admin WHERE address = ? ";
      params = [address];
    }
    else if (admin_id) {
      query = "SELECT * FROM admin WHERE admin_id = ? ";
      params = [admin_id];
    }else{
     query = "SELECT * FROM admin";
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

//Post

export async function POST(request) {
  let db;
  try {
    const incoming_data = await request.json();
    
    // Validate required fields
    if (!incoming_data.admin_name || !incoming_data.email || !incoming_data.password) {
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

    // Check if email exists (case insensitive)
    const [existingUser] = await db.execute(
      "SELECT * FROM admin WHERE LOWER(email) = LOWER(?)", 
      [incoming_data.email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(incoming_data.password, 10);

    // Insert new admin
    const [result] = await db.execute(
      "INSERT INTO admin (admin_name, address, contact, email, password) VALUES (?, ?, ?, ?, ?)",
      [
        incoming_data.admin_name,
        incoming_data.address || null, // Handle optional fields
        incoming_data.contact || null,
        incoming_data.email,
        hashedPassword
      ]
    );

    return NextResponse.json(
      { 
        success: true,
        adminId: result.insertId 
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
   const incoming_data = await request.json();
   db = await pool.getConnection();

   const checkQuery = `SELECT * FROM admin WHERE email=?`;

const [existingUser] = await db.execute(checkQuery,[incoming_data.email]);

   if(existingUser.length === 0){
       return NextResponse.json (
       {error:"User With This Email Does Not Exist"},
           {status: 404}
       )
   }

   const deleteQuery = `DELETE FROM admin WHERE email=?`;

   const [rows] = await db.execute(deleteQuery,[incoming_data.email]);

   return NextResponse.json({message: "User  deleted succusfully",
   affectedRows: rows.affectedRows   
   } );

  } catch (error) {
    return NextResponse.json({
       error:"Error",
       details: error.message
    })
  }finally {
   if (db) db.release();
  }
}