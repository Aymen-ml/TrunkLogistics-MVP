// server/src/migrations/20230830_add_images_to_trucks.js
export const up = async (query) => {
  await query(`
    ALTER TABLE trucks 
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
  `);
};

export const down = async (query) => {
  await query(`
    ALTER TABLE trucks
    DROP COLUMN IF EXISTS images;
  `);
};
