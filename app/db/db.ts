import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../../drizzle/migrations";
import { eq } from "drizzle-orm";

const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

export { migrations, eq };
export default db;
