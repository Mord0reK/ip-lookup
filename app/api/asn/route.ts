import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asnParam = searchParams.get('asn');

  if (!asnParam) {
    return NextResponse.json(
      { error: 'asn parameter is required' },
      { status: 400 }
    );
  }

  // Extract numeric part from ASN (e.g., "AS15169" -> "15169")
  const asnNumber = asnParam.replace(/\D/g, '');

  if (!asnNumber) {
    return NextResponse.json(
      { error: 'Invalid ASN format' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.ipapi.is/?q=AS${asnNumber}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'ipapi.is API failed', status: response.status },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch ASN data', message: error.message },
      { status: 500 }
    );
  }
}
