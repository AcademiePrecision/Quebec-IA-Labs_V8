# 🎨 ACADÉMIE PRÉCISION - Guide de Style "PRECISION LUXE"
## Design System Officiel

---

## 🌟 NOM DU DESIGN SYSTEM: "PRECISION LUXE"
Un système de design qui allie sophistication, contraste élevé et accessibilité optimale.

---

## 📐 1. TYPOGRAPHIE

### Hiérarchie des Titres

#### Welcome Title (H1)
```typescript
{
  fontSize: 34,
  fontWeight: 'bold',
  // Couleurs
  color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
  // Ombres fortes pour lisibilité
  textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
}
```

#### Subtitle Descriptif (H2)
```typescript
{
  fontSize: 16,
  fontWeight: '600',
  // Couleurs signature
  color: theme === 'dark' ? '#FF6B35' : '#E53E3E',
  textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
}
```

#### Section Headers (H3)
```typescript
{
  fontSize: 18,
  fontWeight: '600',
  color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
  marginBottom: 16,
}
```

#### Card Titles (H4)
```typescript
{
  fontSize: 16,
  fontWeight: '600',
  color: theme === 'dark' ? '#F3F4F6' : '#2C3E50',
}
```

### Body Text

#### Texte Descriptif Entre Badges
```typescript
{
  fontSize: 14,
  fontStyle: 'italic',
  color: theme === 'dark' ? '#E0E0E0' : '#2D3748',
  textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
}
```

#### Caption Text
```typescript
{
  fontSize: 12,
  color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
}
```

---

## 🎨 2. SYSTÈME DE COULEURS

### Couleurs Primaires

#### Orange Signature - "Precision Orange"
- **Valeur**: `#FF6B35`
- **Usage**: CTAs principaux, badges "NOUVEAU", éléments interactifs
- **Accessible**: Contraste AA sur fond noir et blanc

#### Vert Académie - "Success Green"
- **Valeur**: `#1ABC9C`
- **Usage**: Actions secondaires, badges promotionnels, indicateurs de succès
- **Accessible**: Contraste AA sur fond noir et blanc

#### Rouge Professionnel - "Expert Red"
- **Mode clair uniquement**: `#E53E3E`
- **Usage**: Sous-titres en mode clair, alertes importantes

### Couleurs de Fond

#### Mode Sombre
```typescript
{
  background: '#121212',
  card: '#1E1E1E',
  elevated: '#2A2A2A',
}
```

#### Mode Clair
```typescript
{
  background: '#FFFFFF',
  card: '#FFFFFF',
  elevated: '#F3F4F6',
  // Film overlay pour images: rgba(255,255,255,0.45)
}
```

### États et Indicateurs

#### Croissance Positive
```typescript
{
  background: theme === 'dark' ? '#1B4A3B' : '#DCFCE7',
  text: theme === 'dark' ? '#86EFAC' : '#16A34A',
}
```

#### Croissance Négative
```typescript
{
  background: theme === 'dark' ? '#4A1A1A' : '#FEE2E2',
  text: theme === 'dark' ? '#FCA5A5' : '#DC2626',
}
```

#### En Attente
```typescript
{
  background: theme === 'dark' ? '#4A3B1B' : '#FEF3C7',
  text: theme === 'dark' ? '#FDE047' : '#D97706',
}
```

---

## 🏷️ 3. COMPOSANTS BADGES SIGNATURE

### Badge Orange "NOUVEAU" (Style Plus Populaire)
```typescript
{
  backgroundColor: '#FF6B35',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 12,
  // Texte
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
}
```

### Badge Vert "ACADÉMIE" (Style Promotionnel)
```typescript
{
  backgroundColor: '#1ABC9C',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 12,
  // Texte
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
}
```

### Badges de Statut
```typescript
// Actif/Approuvé
{
  backgroundColor: theme === 'dark' ? '#1B4A3B' : '#DCFCE7',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 20,
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: theme === 'dark' ? '#86EFAC' : '#16A34A',
  }
}

// En attente
{
  backgroundColor: theme === 'dark' ? '#4A3B1B' : '#FEF3C7',
  text: {
    color: theme === 'dark' ? '#FDE047' : '#D97706',
  }
}

// Révision requise
{
  backgroundColor: theme === 'dark' ? '#4A2F1B' : '#FFEDD5',
  text: {
    color: theme === 'dark' ? '#FB923C' : '#EA580C',
  }
}
```

---

## 📦 4. COMPOSANTS CARDS

### Card Standard
```typescript
{
  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  // Ombres
  shadowColor: theme === 'dark' ? '#000' : '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

### Stats Card
```typescript
{
  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  flex: 1,
  marginRight: 12,
  // Icon container
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${color}20`, // 20% opacity de la couleur
  }
}
```

---

## 📏 5. ESPACEMENT ET LAYOUT

### Grille d'Espacement (Base 4px)
```typescript
const spacing = {
  xs: 4,    // Micro espaces
  sm: 8,    // Petits éléments
  md: 12,   // Espacement standard
  lg: 16,   // Entre sections
  xl: 24,   // Padding principal
  xxl: 32,  // Grandes séparations
}
```

### Padding des Écrans
```typescript
{
  paddingHorizontal: 24,
  paddingVertical: 16,
}
```

### Marges Entre Sections
```typescript
{
  marginBottom: 24, // Standard
  marginBottom: 32, // Dernière section
}
```

---

## 🎭 6. OMBRES ET ÉLÉVATION

### Système d'Ombres
```typescript
// Niveau 1 - Cards standard
{
  shadowColor: theme === 'dark' ? '#000' : '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
  shadowRadius: 4,
  elevation: 3,
}

// Niveau 2 - Éléments sélectionnés
{
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: theme === 'dark' ? 0.4 : 0.15,
  shadowRadius: 6,
  elevation: 5,
}

// Ombres de texte pour lisibilité
{
  textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
}
```

---

## 🎯 7. DASHBOARDS À UNIFORMISER

### ✅ Dashboards Perfectionnés
1. **SalonDashboard** - Style de référence
2. **FormateurDashboard** - Aligné sur SalonDashboard

### 🔧 Dashboards à Uniformiser
3. **StudentDashboard** - Utilise encore des classes Tailwind natives
4. **AdminDashboard** - Partiellement stylisé, manque les éléments signature

---

## 🚀 8. PLAN D'UNIFORMISATION

### Phase 1: StudentDashboard
1. **Welcome Section**
   - Implémenter fontSize 34px pour le titre
   - Ajouter les couleurs orange/rouge pour le sous-titre
   - Intégrer les ombres de texte

2. **Badges Cliquables**
   - Ajouter badge orange "NOUVEAU" pour nouvelles formations
   - Badge vert "ACADÉMIE" pour contenus exclusifs

3. **Cards**
   - Remplacer les classes Tailwind par styles inline
   - Appliquer le système de couleurs Precision Luxe
   - Ajouter les ombres standardisées

### Phase 2: AdminDashboard
1. **Welcome Section**
   - Agrandir le titre à 34px
   - Forcer les couleurs blanc/noir selon le thème
   - Ajouter sous-titre orange/rouge

2. **Revenue Cards**
   - Standardiser avec le style SalonDashboard
   - Implémenter les badges de croissance

3. **Metrics Display**
   - Aligner sur le système de StatCards
   - Couleurs cohérentes pour les icônes

---

## 💡 9. GUIDELINES POUR DÉVELOPPEURS

### Règles d'Or
1. **JAMAIS** utiliser `styles.title` ou `styles.caption` directement dans Welcome Section
2. **TOUJOURS** forcer les couleurs avec conditions ternaires explicites
3. **PRIVILÉGIER** les styles inline pour les éléments critiques

### Checklist de Conformité
- [ ] Titre principal: 34px, bold, blanc/noir
- [ ] Sous-titre: 16px, 600, orange/rouge
- [ ] Badges cliquables implémentés
- [ ] Texte descriptif en italic entre badges
- [ ] Ombres de texte pour lisibilité
- [ ] Cards avec ombres standardisées
- [ ] Couleurs d'état cohérentes

### Import Requis
```typescript
import { useTheme } from '../contexts/ThemeContext';
import { getScreenStyles } from '../utils/screenTheming';
import { SubtleBackground, ReadableText } from '../components/SubtleBackground';
```

### Structure Welcome Section Type
```tsx
<View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
  <ReadableText style={{ 
    fontSize: 34,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
    textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }}>
    Bonjour, {userName}!
  </ReadableText>
  
  <ReadableText style={{
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? '#FF6B35' : '#E53E3E',
    // ... ombres
  }}>
    Description du rôle
  </ReadableText>
  
  {/* Badge Orange */}
  <TouchableOpacity style={{
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  }}>
    {/* Contenu */}
  </TouchableOpacity>
  
  {/* Texte descriptif */}
  <ReadableText style={{
    fontSize: 14,
    fontStyle: 'italic',
    color: theme === 'dark' ? '#E0E0E0' : '#2D3748',
    // ... ombres
  }}>
    Description
  </ReadableText>
  
  {/* Badge Vert */}
  <TouchableOpacity style={{
    backgroundColor: '#1ABC9C',
    // ... même structure
  }}>
</View>
```

---

## 🎯 10. MÉTRIQUES DE SUCCÈS

### Indicateurs de Conformité
- Cohérence visuelle: 100% des dashboards
- Accessibilité WCAG AA: Tous les contrastes
- Performance: <100ms rendu initial
- Satisfaction utilisateur: >90%

### Points de Contrôle
1. Tous les titres principaux à 34px
2. Badges signature présents sur tous les dashboards
3. Système de couleurs unifié
4. Ombres cohérentes
5. Espacement standardisé

---

## 📝 NOTES FINALES

Ce guide établit le standard "Precision Luxe" pour l'Académie Précision. Chaque élément a été conçu pour maximiser:
- La lisibilité sur tous les écrans
- L'accessibilité pour tous les utilisateurs
- L'engagement visuel
- La cohérence de marque

**Version**: 1.0
**Date**: Décembre 2024
**Auteur**: UX/UI Design Team - Académie Précision

---