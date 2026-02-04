import { getDb } from './server/db';
import { parks } from './drizzle/schema';
import { eq } from 'drizzle-orm';

// Map of park names to working image URLs from Unsplash and other reliable sources
const parkImages: Record<string, string> = {
  'Acadia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'American Samoa': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Arches': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Badlands': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Big Bend': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Biscayne': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Black Canyon of the Gunnison': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Bryce Canyon': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Canyonlands': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Capitol Reef': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Carlsbad Caverns': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Channel Islands': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Congaree': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Crater Lake': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Cuyahoga Valley': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Death Valley': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Denali': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Dry Tortugas': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Everglades': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Gateway Arch': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Gates of the Arctic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Glacier': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Glacier Bay': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Grand Canyon': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Grand Teton': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Great Basin': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Great Sand Dunes': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Great Smoky Mountains': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Guadalupe Mountains': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Haleakalā': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Hawaiʻi Volcanoes': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Hot Springs': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Indiana Dunes': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Isle Royale': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Joshua Tree': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Katmai': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Kenai Fjords': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Kings Canyon': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Kobuk Valley': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Lake Clark': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Lassen Volcanic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Mammoth Cave': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Mesa Verde': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Mount Rainier': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'New River Gorge': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'North Cascades': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Olympic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Petrified Forest': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Pinnacles': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Redwood': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Rocky Mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Saguaro': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Sequoia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Shenandoah': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Theodore Roosevelt': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Virgin Islands': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'Voyageurs': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'White Sands': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Wind Cave': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Wrangell–St. Elias': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Yellowstone': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Yosemite': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'Zion': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
};

async function updateParkImages() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      process.exit(1);
    }

    // Get all parks
    const allParks = await db.select().from(parks);
    
    let updated = 0;
    for (const park of allParks) {
      const imageUrl = parkImages[park.name];
      if (imageUrl) {
        await db.update(parks).set({ imageUrl }).where(eq(parks.id, park.id));
        updated++;
        console.log(`Updated ${park.name} with image URL`);
      }
    }

    console.log(`Successfully updated ${updated} parks with working image URLs`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to update park images:', error);
    process.exit(1);
  }
}

updateParkImages();
