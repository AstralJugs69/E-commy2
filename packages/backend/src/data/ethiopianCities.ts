/**
 * Ethiopian cities data with coordinates
 * This file contains major cities in Ethiopia with their coordinates for use in service zone creation
 */

export interface City {
  id: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  population?: number; // Optional population for display/sorting
}

const ethiopianCities: City[] = [
  {
    id: 1,
    name: "Addis Ababa",
    region: "Addis Ababa",
    lat: 9.0302,
    lng: 38.7469,
    population: 3400000
  },
  {
    id: 2,
    name: "Dire Dawa",
    region: "Dire Dawa",
    lat: 9.5931,
    lng: 41.8661,
    population: 440000
  },
  {
    id: 3,
    name: "Mekelle",
    region: "Tigray",
    lat: 13.4967,
    lng: 39.4697,
    population: 310000
  },
  {
    id: 4,
    name: "Gondar",
    region: "Amhara",
    lat: 12.6030,
    lng: 37.4521,
    population: 324000
  },
  {
    id: 5,
    name: "Bahir Dar",
    region: "Amhara",
    lat: 11.5842,
    lng: 37.3900,
    population: 318000
  },
  {
    id: 6,
    name: "Hawassa",
    region: "Sidama",
    lat: 7.0622,
    lng: 38.4777,
    population: 315000
  },
  {
    id: 7,
    name: "Dessie",
    region: "Amhara",
    lat: 11.1330,
    lng: 39.6352,
    population: 200000
  },
  {
    id: 8,
    name: "Jimma",
    region: "Oromia",
    lat: 7.6782,
    lng: 36.8344,
    population: 195000
  },
  {
    id: 9,
    name: "Jijiga",
    region: "Somali",
    lat: 9.3500,
    lng: 42.8000,
    population: 125000
  },
  {
    id: 10,
    name: "Shashamane",
    region: "Oromia",
    lat: 7.2003,
    lng: 38.5902,
    population: 140000
  },
  {
    id: 11,
    name: "Bishoftu (Debre Zeit)",
    region: "Oromia",
    lat: 8.7525,
    lng: 38.9785,
    population: 150000
  },
  {
    id: 12,
    name: "Sodo",
    region: "Southern Nations",
    lat: 6.8667,
    lng: 37.7667,
    population: 130000
  },
  {
    id: 13,
    name: "Arba Minch",
    region: "Southern Nations",
    lat: 6.0333,
    lng: 37.5500,
    population: 135000
  },
  {
    id: 14,
    name: "Hosaena",
    region: "Southern Nations",
    lat: 7.5500,
    lng: 37.8500,
    population: 100000
  },
  {
    id: 15,
    name: "Harar",
    region: "Harari",
    lat: 9.3114,
    lng: 42.1194,
    population: 120000
  },
  {
    id: 16,
    name: "Dilla",
    region: "Southern Nations",
    lat: 6.4107,
    lng: 38.3096,
    population: 110000
  },
  {
    id: 17,
    name: "Nekemte",
    region: "Oromia",
    lat: 9.0893,
    lng: 36.5321,
    population: 110000
  },
  {
    id: 18,
    name: "Debre Birhan",
    region: "Amhara",
    lat: 9.6793,
    lng: 39.5325,
    population: 95000
  },
  {
    id: 19,
    name: "Asella",
    region: "Oromia",
    lat: 7.9500,
    lng: 39.1333,
    population: 90000
  },
  {
    id: 20,
    name: "Debre Markos",
    region: "Amhara",
    lat: 10.3333,
    lng: 37.7167,
    population: 85000
  },
  {
    id: 21,
    name: "Kombolcha",
    region: "Amhara",
    lat: 11.0829,
    lng: 39.7454,
    population: 80000
  },
  {
    id: 22,
    name: "Aksum",
    region: "Tigray",
    lat: 14.1289,
    lng: 38.7217,
    population: 70000
  },
  {
    id: 23,
    name: "Gambela",
    region: "Gambela",
    lat: 8.2500,
    lng: 34.5833,
    population: 50000
  },
  {
    id: 24,
    name: "Adama (Nazret)",
    region: "Oromia",
    lat: 8.5411,
    lng: 39.2705,
    population: 270000
  },
  {
    id: 25,
    name: "Assosa",
    region: "Benishangul-Gumuz",
    lat: 10.0675,
    lng: 34.5333,
    population: 45000
  }
];

export default ethiopianCities; 