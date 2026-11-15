import { NextResponse } from 'next/server';

const SW_SCRIPT = `self.options = {
    "domain": "3nbf4.com",
    "zoneId": 12266192
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`;

export async function GET() {
  return new NextResponse(SW_SCRIPT, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
