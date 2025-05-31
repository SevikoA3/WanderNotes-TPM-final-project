import * as Location from "expo-location";
import { GoogleMaps } from "expo-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper type for coordinates with fallback defaults
interface LatLng {
  latitude: number;
  longitude: number;
}

export default function SelectLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialLat = params.latitude ? Number(params.latitude) : -6.2;
  const initialLng = params.longitude ? Number(params.longitude) : 106.816666;
  const returnTo = params.returnTo as string | undefined; // 'addNew' or 'editNote'

  // State for the marker's location
  const [selectedMarkerLocation, setSelectedMarkerLocation] = useState<LatLng>({
    latitude: initialLat,
    longitude: initialLng,
  });

  // Constant for the initial camera position. This will not change on map clicks.
  const initialCamera = {
    coordinates: {
      latitude: initialLat,
      longitude: initialLng,
    },
    zoom: 15, // Default initial zoom
  };

  const [permissionGranted, setPermissionGranted] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === "granted");
    })();
  }, []);

  // Update location on map press
  const handleMapClick = (event: {
    latitude?: number;
    longitude?: number;
  }) => {
    const newLatitude = event.latitude ?? 0;
    const newLongitude = event.longitude ?? 0;

    // Check if we actually received valid numbers, though nullish coalescing handles undefined
    if (typeof newLatitude === "number" && typeof newLongitude === "number") {
      setSelectedMarkerLocation({
        // Update only the marker's location
        latitude: newLatitude,
        longitude: newLongitude,
      });
      // The camera position is now controlled by the initialCamera prop and user interaction,
      // so no need to call mapRef.current.setCameraPosition here.
    } else {
      // Log a warning if latitude or longitude are not what we expect
      console.warn("Map click event provided invalid coordinate data:", event);
    }
  };

  const handleSave = () => {
    if (returnTo === "editNote") {
      router.replace({
        pathname: "/pages/editNote",
        params: {
          selectedLatitude: selectedMarkerLocation.latitude,
          selectedLongitude: selectedMarkerLocation.longitude,
          id: params.id,
        },
      });
    } else {
      router.replace({
        pathname: "/pages/addNew",
        params: {
          selectedLatitude: selectedMarkerLocation.latitude,
          selectedLongitude: selectedMarkerLocation.longitude,
        },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={["bottom"]}>
      <View className="flex-1">
        {Platform.OS === "android" ? (
          permissionGranted ? (
            <GoogleMaps.View
              ref={mapRef}
              style={{ flex: 1 }}
              cameraPosition={initialCamera} // Use the constant initial camera config
              markers={[
                {
                  coordinates: selectedMarkerLocation, // Marker uses the dynamic selected location
                  id: "selected-location",
                  title: "Selected Location",
                  // Not draggable
                },
              ]}
              onMapClick={handleMapClick as any}
              uiSettings={{
                myLocationButtonEnabled: true,
                compassEnabled: true,
              }}
              properties={{ isMyLocationEnabled: true, selectionEnabled: true }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text>Waiting for location permission...</Text>
            </View>
          )
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text>Maps are only available on Android</Text>
          </View>
        )}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background-light">
          <Text className="text-primary text-base mb-2 text-center">
            Lat: {selectedMarkerLocation.latitude.toFixed(6)}, Lng:{" "}
            {/* Use selectedMarkerLocation */}
            {selectedMarkerLocation.longitude.toFixed(6)}
          </Text>
          <TouchableOpacity
            className="w-full h-14 rounded-2xl bg-orange-dark items-center justify-center"
            onPress={handleSave}
          >
            <Text className="text-white text-lg font-bold">Save Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
