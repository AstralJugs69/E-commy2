import { Router, Request, Response } from 'express';

const router = Router();

// List of districts/neighborhoods in Shahsemen (Shashemene), Ethiopia
const districts = [
  'Arada',
  'Alelu',
  'Kebele 01',
  'Kebele 02',
  'Kebele 03',
  'Kebele 04',
  'Kebele 05',
  'Kebele 06',
  'Kebele 07',
  'Kebele 08',
  'Kebele 09',
  'Kebele 10',
  'Abosto',
  'Kuyera',
  'Melka Oda',
  'Bulchana',
  'Wondo Genet Road',
  'Alaba Road',
  'Kofele Road',
  'Rift Valley',
  'Malge',
  'Awasho',
  'Dida Boke',
  'Jamaica Sefer',
  'Lugo',
  'Melka',
  'Ilili',
  'Gode',
  'New City'
];

// GET /api/districts - Get all districts
router.get('/', (req: Request, res: Response) => {
  try {
    res.status(200).json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Failed to fetch districts' });
  }
});

export default router; 