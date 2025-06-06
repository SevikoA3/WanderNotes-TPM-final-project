import "dotenv/config";

export default ({ config }) => ({
  expo: {
    name: "WanderNotes",
    slug: "WanderNotes",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/myIcon.png",
    scheme: "wandernotes",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        foregroundImage: "./assets/images/myIcon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      package: "com.sevikoa3.WanderNotes",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/myIcon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/myIcon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "expo-maps",
        {
          requestLocationPermission: true,
          locationPermission: "Allow $(PRODUCT_NAME) to use your location",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/myIcon.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        "expo-sensors",
        {
          motionPermission:
            "Allow $(PRODUCT_NAME) to access your device motion",
        },
      ],
      "expo-sqlite",
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID.",
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "6d48aedb-71f6-4d04-ab5e-482344e00620",
      },
    },
  },
});
