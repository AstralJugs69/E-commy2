import { Router, Request, Response } from 'express';

const router = Router();

// This is a list of common districts in India (as an example - you might want to customize this)
const districts = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Coimbatore',
  'Kochi',
  'Agra',
  'Madurai',
  'Nashik',
  'Varanasi',
  'Srinagar',
  'Aurangabad',
  'Dhanbad',
  'Amritsar',
  'Chandigarh',
  'Guwahati'
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