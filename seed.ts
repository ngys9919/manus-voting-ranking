import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { seedParks } from './server/db';
import type { InsertPark } from './drizzle/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // Read the parks data
    const parksData = JSON.parse(
      readFileSync(join(__dirname, '../national_parks_data.json'), 'utf-8')
    );

    // Format for database insertion
    const formattedParks: InsertPark[] = parksData.map((park: any) => ({
      name: park.name,
      location: park.location,
      imageUrl: park.image_url,
      eloRating: '1500',
      voteCount: 0,
    }));

    console.log(`Seeding ${formattedParks.length} parks...`);
    await seedParks(formattedParks);
    console.log('Parks seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed parks:', error);
    process.exit(1);
  }
}

main();
