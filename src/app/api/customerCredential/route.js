import pool from "@/app/libs/mysql";
import { NextResponse } from "next/server";

export async function GET(request) {
    let db;

    try {
        
       const searchParams = request.nextUrl.searchParams;
       const credential_id =  searchParams.get("credential_id");
       const credential_name = searchParams.get("credential_name");

       db=await pool.getConnection();

       let query = "SELECT * FROM car_review";
       let params =[];

       if(credential_id && credential_name){
        query = "SELECT * FROM car_review WHERE credential_id=? AND credential_name=?";
        params = [credential_id, credential_name];
       }
       else if(credential_id){
        query = "SELECT * FROM car_review WHERE credential_id=?";
        params = [credential_id];
       }
       else if(credential_name){
        query = "SELECT * FROM car_review WHERE credential_name=?";
        params = [credential_name];
       }
       else{
        query = "SELECT * FROM customer_credential"
       }
       const [rows] = await db.execute(query, params);

       return NextResponse.json(rows);
    } catch (error) {
        error:error;
    }finally{
        if (db) db.release();
    }

    
}

//post

export async function POST(request) {
    let db;

    try {

        const incoming_data = await request.json();
        db = await pool.getConnection();

        const query = `INSERT INTO customer_credential(credential_name, file_upload_path, custm_id) VALUES (?,?,?)`;

        const params = [
            incoming_data.credential_name,
            incoming_data.file_upload_path,
            incoming_data.custm_id
        ]

        const [rows] = await db.execute(query, params);
        return NextResponse.json(rows);


    } catch (error) {
        return NextResponse.json("DataBase Error");
    }finally{
        if (db) db.release();
    }
}