// app/api/calendar/route.js
import { createEvents } from 'ics';

export async function GET(req) {
  const now = new Date();

  const events = [
    {
      title: 'Demo Event',
      description: 'This came from your Next.js ICS feed.',
      location: 'Online',
      start: [
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        now.getUTCDate(),
        now.getUTCHours() + 1,
        now.getUTCMinutes(),
      ],
      duration: { hours: 1 },
      url: 'https://yourapp.example',
      productId: '//MyApp//Calendar 1.0//EN',
    },
  ];

  const { error, value } = createEvents(events);
  if (error) {
    return new Response('Failed to generate ICS', { status: 500 });
  }

  return new Response(value, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendar.ics"',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
