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
  console.log("SelectLocationScreen mounted");
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialLat = params.latitude ? Number(params.latitude) : -6.2;
  const initialLng = params.longitude ? Number(params.longitude) : 106.816666;
  const [location, setLocation] = useState<LatLng>({
    latitude: initialLat,
    longitude: initialLng,
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("expo-location permission status:", status);
      setPermissionGranted(status === "granted");
    })();
  }, []);

  const handleMapClick = (event: { coordinates: { latitude?: number; longitude?: number } }) => {
    setLocation({
      latitude: event.coordinates.latitude ?? 0,
      longitude: event.coordinates.longitude ?? 0,
    });
    if (mapRef.current && mapRef.current.setCameraPosition) {
      mapRef.current.setCameraPosition({
        coordinates: {
          latitude: event.coordinates.latitude ?? 0,
          longitude: event.coordinates.longitude ?? 0,
        },
        zoom: 15,
        duration: 300,
      });
    }
  };

  const handleMarkerDragEnd = (event: any) => {
    if (event && event.coordinates) {
      setLocation({
        latitude: event.coordinates.latitude ?? 0,
        longitude: event.coordinates.longitude ?? 0,
      });
    }
  };

  const handleSave = () => {
    router.back();
    setTimeout(() => {
      router.replace({
        pathname: "/pages/addNew",
        params: {
          selectedLatitude: location.latitude,
          selectedLongitude: location.longitude,
        },
      });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1">
        {Platform.OS === "android" ? (
          permissionGranted ? (
            <GoogleMaps.View
              ref={mapRef}
              style={{ flex: 1 }}
              cameraPosition={{ coordinates: location, zoom: 15 }}
              markers={[
                {
                  coordinates: location,
                  draggable: true,
                  id: "selected-location",
                  title: "Selected Location",
                },
              ]}
              onMapClick={handleMapClick as any}
              onMarkerClick={handleMarkerDragEnd}
              onCameraMove={(e: any) =>
                setLocation({
                  latitude: e.coordinates.latitude ?? 0,
                  longitude: e.coordinates.longitude ?? 0,
                })
              }
              uiSettings={{ myLocationButtonEnabled: true, compassEnabled: true }}
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
            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
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
