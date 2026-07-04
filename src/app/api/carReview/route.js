import pool from "@/app/libs/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
    let db;

    try {
        
       const searchParams = request.nextUrl.searchParams;
       const review_id =  searchParams.get("review_id");
       const review_score = searchParams.get("review_score");

       db=await pool.getConnection();

       let query = "SELECT * FROM car_review";
       let params =[];

       if(review_id && review_score){
        query = "SELECT * FROM car_review WHERE review_id=? AND review_score=?";
        params = [review_id, review_score];
       }
       else if(review_id){
        query = "SELECT * FROM car_review WHERE review_id=?";
        params = [review_id];
       }
       else if(review_score){
        query = "SELECT * FROM car_review WHERE review_score=?";
        params = [review_score];
       }
       else{
        query = "SELECT * FROM car_review"
       }
       const [rows] = await db.execute(query, params);

       return NextResponse.json(rows);
    } catch (error) {
        error:error;
    }finally{
        if (db) db.release();
    } 
}


//Post

export async function POST(request){
    let db;

    try {
        const incoming_data = await request.json();
         db = await pool.getConnection();

        const query = `INSERT INTO car_review (review, review_score, review_date, custm_id, CAR_ID) VALUES (?,?,?,?,?)`
        const params = [
           incoming_data.review,
           incoming_data.review_score,
           incoming_data.review_date,
           incoming_data.custm_id,
           incoming_data.car_id

        ];

        const [rows] = await db.execute(query, params);
        return NextResponse.json(rows)


    } catch (error) {
        return NextResponse.json({
            error:error
        },
    {status:500})
    }finally{
        if (db) db.release();
    }
}