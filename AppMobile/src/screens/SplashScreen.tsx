import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ImageBackground, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const splashPhotos = [
  require('../../assets/splash/pexels-thgusstavo-2040189.jpg'),
  require('../../assets/splash/pexels-lumierestudiomx-897271.jpg'),
  require('../../assets/splash/pexels-nickoloui-1319459.jpg'),
  require('../../assets/splash/pexels-joshsorenson-995300.jpg'),
  require('../../assets/splash/pexels-zvolskiy-1570807.jpg'),
  require('../../assets/splash/pexels-lorentzworks-668196.jpg'), // Moved to last - most impactful
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSlogan, setShowSlogan] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Pré-charger les assets pour éviter les problèmes de tunnel
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        console.log('[SplashScreen] Preloading assets...');
        // Forcer le chargement des images avec Asset.fromModule
        const imagePromises = splashPhotos.map(async (photo) => {
          try {
            const asset = Asset.fromModule(photo);
            await asset.downloadAsync();
            return asset;
          } catch (error) {
            console.log('[SplashScreen] Error loading asset:', error);
            return null; // Continue même en cas d'erreur
          }
        });
        
        await Promise.all(imagePromises);
        console.log('[SplashScreen] Assets preloaded successfully');
        setAssetsLoaded(true);
      } catch (error) {
        console.log('[SplashScreen] Asset preload error, continuing...', error);
        setAssetsLoaded(true); // Continue quand même
      }
    };
    
    preloadAssets();
  }, []);

  useEffect(() => {
    if (!assetsLoaded) {
      console.log('[SplashScreen] Waiting for assets to load...');
      return;
    }
    
    console.log('[SplashScreen] Assets loaded, starting enhanced splash...');

    // Phase 1: Initial fade in (slower)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Phase 2: Photo sequence (slower transitions)
    const photoSequence = () => {
      const photoTimer = setInterval(() => {
        setCurrentPhotoIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= splashPhotos.length) {
            clearInterval(photoTimer);
            
            // Give more time to appreciate the last photo before slogan
            setTimeout(() => {
              // Phase 3: Show slogan
              setShowSlogan(true);
              
              // Animate overlay and text (smoother)
              Animated.parallel([
                Animated.timing(overlayOpacity, {
                  toValue: 1,
                  duration: 700,
                  useNativeDriver: true,
                }),
                Animated.parallel([
                  Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                  Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                ]),
              ]).start(() => {
                // Phase 4: Much longer slogan display
                setTimeout(() => {
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                  }).start(() => {
                    console.log('[SplashScreen] Enhanced splash complete');
                    onFinish();
                  });
                }, 2000); // 2 seconds for slogan (was 1s)
              });
            }, 800); // More time on last photo (was 200ms)
            return prev;
          }
          
          // Subtle Ken Burns effect (faster and simpler)
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          });
          
          return nextIndex;
        });
      }, 800); // 0.8s per photo (was 0.5s)
    };

    // Start photo sequence after initial fade (slightly longer)
    setTimeout(photoSequence, 800);

    // Cleanup
    return () => {
      // Cleanup is handled by the timers
    };
  }, [assetsLoaded, onFinish]);

  console.log('[SplashScreen] Rendering enhanced splash, photo:', currentPhotoIndex);

  // Afficher un loader simple pendant le chargement des assets
  if (!assetsLoaded) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#2C3E50',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          color: '#FF6B35',
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
        }}>
          CutClub
        </Text>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 16,
        }}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={{ 
        flex: 1,
        opacity: fadeAnim,
      }}
    >
      <ImageBackground
        source={splashPhotos[currentPhotoIndex]}
        style={{
          flex: 1,
          width: width,
          height: height,
        }}
        resizeMode="cover"
      >
        {/* Animated scale container */}
        <Animated.View
          style={{
            flex: 1,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Photo overlay for consistent branding */}
          <LinearGradient
            colors={['rgba(255,107,53,0.15)', 'rgba(44,62,80,0.25)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Slogan overlay */}
          {showSlogan && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: overlayOpacity,
              }}
            >
              {/* Background blur effect */}
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  padding: 24,
                  borderRadius: 16,
                  marginHorizontal: 32,
                }}
              >
                <Animated.Text
                  style={{
                    fontSize: 32,
                    fontWeight: '500',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: 0.5,
                    opacity: textOpacity,
                    transform: [{ translateY: textTranslateY }],
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}
                >
                  L'excellence se partage
                </Animated.Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
};