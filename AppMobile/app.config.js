import 'dotenv/config';

export default {
  expo: {
    name: "CutClub - Académie Précision",
    slug: "cutclub-academie",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/barber-client.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash/pexels-nickoloui-1319459.jpg",
      resizeMode: "contain",
      backgroundColor: "#FF6B35"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.academie-precision.cutclub",
      infoPlist: {
        NSFaceIDUsageDescription: "Utilisation de Face ID pour sécuriser votre compte",
        NSCameraUsageDescription: "Accès à la caméra pour scanner les codes QR de paiement"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/barber-clippers.png",
        backgroundColor: "#FF6B35"
      },
      package: "com.academie_precision.cutclub",
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "CAMERA"
      ]
    },
    web: {
      favicon: "./assets/barber-hands.png"
    },
    extra: {
      // Variables d'environnement sécurisées
      // Development
      STRIPE_PUBLISHABLE_KEY_DEV: process.env.STRIPE_PUBLISHABLE_KEY_DEV,
      API_BASE_URL_DEV: process.env.API_BASE_URL_DEV || "http://localhost:3000/api",
      SUPABASE_URL_DEV: process.env.SUPABASE_URL_DEV,
      SUPABASE_ANON_KEY_DEV: process.env.SUPABASE_ANON_KEY_DEV,
      
      // Staging
      STRIPE_PUBLISHABLE_KEY_STAGING: process.env.STRIPE_PUBLISHABLE_KEY_STAGING,
      API_BASE_URL_STAGING: process.env.API_BASE_URL_STAGING,
      SUPABASE_URL_STAGING: process.env.SUPABASE_URL_STAGING,
      SUPABASE_ANON_KEY_STAGING: process.env.SUPABASE_ANON_KEY_STAGING,
      
      // Production
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      API_BASE_URL: process.env.API_BASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      
      // Release channel pour déterminer l'environnement
      releaseChannel: process.env.RELEASE_CHANNEL || "default",
      
      // Configuration de sécurité
      ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS || "true",
      SESSION_SECRET: process.env.SESSION_SECRET,
      
      // Metadata
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    },
    plugins: [
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Permettre à CutClub d'utiliser Face ID pour sécuriser votre compte."
        }
      ]
    ]
  }
};