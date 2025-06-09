
import { NextResponse } from 'next/server'; 

export async function GET() {
  try {
    const data = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ status: 'unhealthy', error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
}

export async function PUT() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
}

export async function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
}
