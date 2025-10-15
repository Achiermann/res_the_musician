// app/api/calendar/route.js
export const runtime = 'nodejs';

import { createEvents } from 'ics';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: gigs, error: dbError } = await supabase
      .from('concerts')
      .select('id,act,date,venue,location,comments,status,start,end,url')
      .order('date', { ascending: true });

    if (dbError) {
      return new Response('Failed to fetch gigs', { status: 500 });
    }

    const events = gigs.map((gig) => {
      const gigDate = new Date(gig.date);
      const startTime = gig.start ? gig.start.split(':') : ['00', '00'];
      const endTime = gig.end ? gig.end.split(':') : null;

      const eventStart = [
        gigDate.getUTCFullYear(),
        gigDate.getUTCMonth() + 1,
        gigDate.getUTCDate(),
        parseInt(startTime[0], 10),
        parseInt(startTime[1], 10),
      ];

      const event = {
        title: `Gig: ${gig.act}${gig.location ? `, ${gig.location}` : ''}`.trim(),
        description: gig.comments || '',
        location: [gig.venue, gig.location].filter(Boolean).join(', '),
        start: eventStart,
        productId: '//res//Calendar 1.0//EN',
      };

      if (gig.url) {
        event.url = gig.url;
      }

      if (endTime) {
        const startHours = parseInt(startTime[0], 10);
        const startMinutes = parseInt(startTime[1], 10);
        const endHours = parseInt(endTime[0], 10);
        const endMinutes = parseInt(endTime[1], 10);

        let durationHours = endHours - startHours;
        let durationMinutes = endMinutes - startMinutes;

        if (durationMinutes < 0) {
          durationHours -= 1;
          durationMinutes += 60;
        }

        event.duration = { hours: durationHours, minutes: durationMinutes };
      } else {
        event.duration = { hours: 2 };
      }

      return event;
    });

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
  } catch (e) {
    console.error(e);
    return new Response('Internal server error', { status: 500 });
  }
}
