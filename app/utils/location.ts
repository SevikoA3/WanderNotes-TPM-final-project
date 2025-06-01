import * as Location from "expo-location";
import moment from "moment-timezone";
import tzlookup from "tz-lookup";

// Mendapatkan list lengkap timezone IANA
export function getAllTimezones(): string[] {
  return moment.tz.names();
}

// Mendapatkan timezone dari koordinat
export function getTimezoneFromCoords(lat: number, lon: number): string {
  return tzlookup(lat, lon);
}

export async function reverseGeocode({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<string> {
  try {
    const res = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (res && res.length > 0) {
      const a = res[0];
      return [a.name, a.street, a.city, a.region, a.country]
        .filter(Boolean)
        .join(", ");
    }
    return "";
  } catch {
    return "";
  }
}

export default {};
