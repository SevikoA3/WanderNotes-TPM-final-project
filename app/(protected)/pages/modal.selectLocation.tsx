import * as Location from "expo-location";
import { GoogleMaps } from "expo-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { locationEventEmitter } from "../../services/locationEvents";

interface LatLng {
  latitude: number;
  longitude: number;
}

export default function SelectLocationModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialLat = params.latitude ? Number(params.latitude) : -6.2;
  const initialLng = params.longitude ? Number(params.longitude) : 106.816666;

  const [selectedMarkerLocation, setSelectedMarkerLocation] = useState<LatLng>({
    latitude: initialLat,
    longitude: initialLng,
  });

  const initialCamera = {
    coordinates: {
      latitude: initialLat,
      longitude: initialLng,
    },
    zoom: 15,
  };

  const [permissionGranted, setPermissionGranted] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === "granted");
    })();
  }, []);

  const handleMapClick = (event: { latitude?: number; longitude?: number }) => {
    const newLatitude = event.latitude ?? 0;
    const newLongitude = event.longitude ?? 0;
    if (typeof newLatitude === "number" && typeof newLongitude === "number") {
      setSelectedMarkerLocation({
        latitude: newLatitude,
        longitude: newLongitude,
      });
    }
  };

  const handleSave = () => {
    // @ts-ignore
    locationEventEmitter.emit("locationSelected", {
      latitude: selectedMarkerLocation.latitude,
      longitude: selectedMarkerLocation.longitude,
    });
    router.dismiss();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={["bottom", "top"]}>
      <View className="flex-1">
        {Platform.OS === "android" ? (
          permissionGranted ? (
            <GoogleMaps.View
              ref={mapRef}
              style={{ flex: 1 }}
              cameraPosition={initialCamera}
              markers={[
                {
                  coordinates: selectedMarkerLocation,
                  id: "selected-location",
                  title: "Selected Location",
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
            Lat: {selectedMarkerLocation.latitude.toFixed(6)}, Lng: {selectedMarkerLocation.longitude.toFixed(6)}
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
