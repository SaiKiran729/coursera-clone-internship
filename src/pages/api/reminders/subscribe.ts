import type { NextApiRequest, NextApiResponse } from 'next';

export interface PushSubscriptionRecord {
  courseId: string;
  courseTitle?: string;
  reminderAt: number;
  subscription: any;
  createdAt: string;
}

// In-memory registry of scheduled server-side reminders
declare global {
  // eslint-disable-next-line no-var
  var __pushSubscriptions: PushSubscriptionRecord[] | undefined;
}

if (!global.__pushSubscriptions) {
  global.__pushSubscriptions = [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { subscription, courseId, courseTitle, reminderAt } = req.body;

      if (!courseId || !reminderAt) {
        return res.status(400).json({
          error: 'Missing required fields: courseId and reminderAt are required',
        });
      }

      const record: PushSubscriptionRecord = {
        courseId,
        courseTitle: courseTitle || courseId,
        reminderAt: Number(reminderAt),
        subscription: subscription || null,
        createdAt: new Date().toISOString(),
      };

      // Filter out existing reminder for same course and add updated record
      global.__pushSubscriptions = (global.__pushSubscriptions || []).filter(
        (sub) => sub.courseId !== courseId
      );
      global.__pushSubscriptions.push(record);

      return res.status(200).json({
        success: true,
        message: 'Push subscription registered successfully for course reminder',
        record: {
          courseId: record.courseId,
          courseTitle: record.courseTitle,
          reminderAt: record.reminderAt,
          createdAt: record.createdAt,
          hasPushSubscription: Boolean(subscription),
        },
        deliveryNotice:
          'Server-side Web Push record saved. Notifications are dispatched via Web Push when browser is closed, or via client Service Worker showNotification() when tab is open.',
      });
    } catch (err: any) {
      console.error('[/api/reminders/subscribe] Error processing subscription:', err);
      return res.status(500).json({ error: 'Internal server error processing push subscription' });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      subscriptionsCount: (global.__pushSubscriptions || []).length,
      subscriptions: (global.__pushSubscriptions || []).map((s) => ({
        courseId: s.courseId,
        courseTitle: s.courseTitle,
        reminderAt: s.reminderAt,
        createdAt: s.createdAt,
        hasPushSubscription: Boolean(s.subscription),
      })),
      timestamp: Date.now(),
    });
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
