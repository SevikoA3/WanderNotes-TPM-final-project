import * as Location from "expo-location";

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
