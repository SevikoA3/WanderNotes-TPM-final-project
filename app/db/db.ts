import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

export { migrations };
export default db;
