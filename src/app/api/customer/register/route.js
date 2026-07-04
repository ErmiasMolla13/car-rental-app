import pool from "@/app/libs/mysql";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

export async function GET(request) {
  let db;
  try {
    const searchParams = request.nextUrl.searchParams;
    const customer_name = searchParams.get("customer_name");
    const custm_id = searchParams.get("custm_id");
    const address = searchParams.get("address");

    db = await pool.getConnection();

    let query = "SELECT * FROM customer";
    let params = [];

    if (custm_id && customer_name && address) {
      query = "SELECT * FROM customer WHERE custm_id = ? AND customer_name = ? AND address=?";
      params = [custm_id, customer_name, address];
    } else if (custm_id && address) {
      query = "SELECT * FROM customer WHERE custm_id = ? AND address=?";
      params = [custm_id, address];
    } else if (customer_name && address) {
      query = "SELECT * FROM customer WHERE customer_name = ? AND address=?";
      params = [customer_name, address];
    }else if (customer_name) {
      query = "SELECT * FROM customer WHERE customer_name = ? ";
      params = [customer_name];
    }
    else if (address) {
      query = "SELECT * FROM customer WHERE address = ? ";
      params = [address];
    }
    else if (custm_id) {
      query = "SELECT * FROM customer WHERE custm_id = ? ";
      params = [custm_id];
    }else{
     query = "SELECT * FROM customer";
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
     console.log("Incoming data:", incoming_data); 

    // Validate required fields
    if (!incoming_data.customer_name || !incoming_data.email || !incoming_data.password) {
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
      "SELECT * FROM customer WHERE LOWER(email) = LOWER(?)", 
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
      "INSERT INTO customer (customer_name, contact, address, email, password) VALUES (?, ?, ?, ?, ?)",
      [
        incoming_data.customer_name,
        incoming_data.contact || null, // Handle optional fields
        incoming_data.address || null,
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
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    db = await pool.getConnection();

    // Case-insensitive search and exact match
    const [existingCustomer] = await db.execute(
      'SELECT * FROM customer WHERE BINARY email = ?',
      [email.trim()] // Trim whitespace
    );

    if (existingCustomer.length === 0) {
      // Return the exact email we searched for in the error
      return NextResponse.json(
        { 
          success: false, 
          message: `Customer with email "${email}" not found`,
          searchedEmail: email,
          existingEmails: (await db.execute('SELECT email FROM customer LIMIT 10'))[0]
        },
        { status: 404 }
      );
    }

    const [result] = await db.execute(
      'DELETE FROM customer WHERE BINARY email = ?',
      [email.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
      deletedEmail: email,
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Database operation failed",
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}