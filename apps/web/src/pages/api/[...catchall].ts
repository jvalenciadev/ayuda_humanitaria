import { NextApiRequest, NextApiResponse } from 'next';
import app from 'ayuda-humanitaria-api/src/app';

// Tell Next.js to let Express handle body parsing and not warning about unhandled promises
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req, res);
}
