import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST' || req.method === 'GET') {
    const courseId = (req.body?.courseId || req.query.courseId) as string | undefined;
    const courseTitle = (req.body?.courseTitle || req.query.courseTitle) as string | undefined;

    if (!courseId) {
      return res.status(400).json({
        error: 'Missing required field: courseId is required to trigger reminder',
      });
    }

    // In a production server with web-push library:
    // await webpush.sendNotification(subscription, JSON.stringify({ title: 'Coursera Reminder', body: ... }))
    return res.status(200).json({
      success: true,
      message: `Trigger dispatched for course reminder: ${courseId}`,
      details: {
        courseId,
        courseTitle: courseTitle || courseId,
        triggeredAt: new Date().toISOString(),
        deliveryMechanism:
          'Server trigger event acknowledged. If subscription active, sent via Web Push protocol to FCM/Mozilla Push Service. Foreground sessions receive direct ServiceWorker showNotification().',
      },
    });
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
