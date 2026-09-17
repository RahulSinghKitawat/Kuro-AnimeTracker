import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out.' });
  response.cookies.delete('kuro_session');
  return response;
}
