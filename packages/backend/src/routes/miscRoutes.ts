import { Router, Request, Response } from 'express';

const router = Router();

// Predefined list of Shashemene districts/kebeles
const shashemeneDistricts: string[] = [
  "Arada",
  "Awasho",
  "Bekelcha",
  "Bulchana",
  "Burka Gudina",
  "Kuyera",
  "Mehal Ketema",
  "Kebele 01",
  "Kebele 02",
  "Kebele 03",
  "Kebele 04",
  "Kebele 05",
  "Kebele 06",
  "Kebele 07",
  "Kebele 08",
  "Kebele 09",
  "Kebele 10"
];

// Sort districts alphabetically
shashemeneDistricts.sort();

/**
 * @route   GET /api/districts
 * @desc    Get list of Shashemene districts/kebeles
 * @access  Public
 */
router.get('/districts', (req: Request, res: Response) => {
  try {
    // Return the predefined list
    res.status(200).json(shashemeneDistricts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ message: "Failed to retrieve district list." });
  }
});

export default router; 