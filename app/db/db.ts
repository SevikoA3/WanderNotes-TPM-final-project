import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

// Run migrations on app start
(async () => {
  try {
    await migrate(db, migrations);
  } catch (e) {
    console.error("Migration failed:", e);
  }
})();

export { eq, migrations };
export default db;
