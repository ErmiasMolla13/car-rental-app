import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/admin');
  
  try {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file to public/uploads directory
    fs.writeFileSync(
      path.join(uploadDir, filename),
      Buffer.from(buffer)
    );

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/admin/${filename}` 
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file upload
  },
};