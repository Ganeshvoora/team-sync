# Dark/Light Theme System - Team Sync

## 🎨 Overview
This document describes the comprehensive dark/light theme system implemented for the Team Sync application.

## 🚀 Features Implemented

### 1. Theme Context System
- **Location**: `/src/contexts/ThemeContext.tsx`
- **Features**:
  - Automatic system preference detection
  - Local storage persistence
  - Smooth theme transitions
  - Global theme state management

### 2. Theme Toggle Component
- **Location**: `/src/components/ThemeToggle.tsx`
- **Features**:
  - Clean moon/sun icon toggle
  - Hover effects
  - Accessible design
  - Consistent styling across themes

### 3. Color Palette System
- **Location**: `/src/styles/theme.css`
- **Features**:
  - CSS custom properties for consistent theming
  - Utility classes for common patterns
  - Status color variants (success, warning, info, danger)
  - Chart color coordination

## 🎯 Color Scheme

### Light Theme
- **Primary**: Indigo (#6366f1)
- **Background**: White (#ffffff) / Gray-50 (#f9fafb)
- **Text**: Gray-900 (#111827) / Gray-600 (#4b5563)
- **Borders**: Gray-200 (#e5e7eb)
- **Cards**: White with subtle shadows

### Dark Theme
- **Primary**: Indigo (#6366f1) - consistent across themes
- **Background**: Gray-900 (#111827) / Gray-800 (#1f2937)
- **Text**: White (#ffffff) / Gray-300 (#d1d5db)
- **Borders**: Gray-700 (#374151)
- **Cards**: Gray-800 with enhanced shadows

### Status Colors (Both Themes)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Info**: Blue (#3b82f6)
- **Danger**: Red (#ef4444)

## 📱 Components Updated

### Core Components
1. **ThemeProvider** - Root theme management
2. **ThemeToggle** - Theme switching button
3. **AdminLayout** - Main navigation and layout
4. **StatsClient** - Complete statistics dashboard
5. **DashboardClient** - User dashboard interface

### Pages Updated
1. **Stats Page** (`/stats`) - Complete theme integration
2. **Dashboard Page** (`/dashboard`) - Header and welcome section
3. **Root Layout** - Theme provider wrapper

## 🔧 Implementation Details

### Theme Provider Setup
```tsx
// In app/layout.tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

### Using Theme in Components
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  // Component logic
}
```

### CSS Classes for Theming
```css
/* Automatic theme-aware classes */
.bg-white dark:bg-gray-800
.text-gray-900 dark:text-white
.border-gray-200 dark:border-gray-700

/* Custom utility classes */
.theme-card /* Automatic theming */
.btn-primary /* Themed buttons */
.status-success /* Status indicators */
```

## 🎨 Design Principles

### 1. Accessibility
- High contrast ratios in both themes
- Clear visual hierarchy
- Consistent interactive states

### 2. Consistency
- Unified color palette across all components
- Smooth transitions (200ms duration)
- Predictable component behavior

### 3. Performance
- CSS custom properties for efficient updates
- Minimal re-renders with context optimization
- Lazy loading for theme-specific resources

## 📋 Usage Guidelines

### For New Components
1. Always use Tailwind's dark: prefix for dark mode styles
2. Prefer semantic color names (primary, success, etc.)
3. Test both themes during development
4. Use transition classes for smooth theme switching

### For Existing Components
1. Replace gradient backgrounds with solid colors
2. Update glassmorphism effects to solid designs
3. Use theme-aware text and border colors
4. Add transition classes for smooth switching

## 🔄 Theme Toggle Integration

The theme toggle button should be placed in:
- Navigation headers
- Settings pages
- User profile sections
- Main dashboard areas

Example placement:
```tsx
<div className="flex items-center space-x-4">
  <ThemeToggle />
  <UserMenu />
</div>
```

## 🚦 Status Implementation

### Completed ✅
- Theme context and provider system
- Theme toggle component
- Stats page complete theme integration
- Dashboard page header theming
- AdminLayout component theming
- CSS custom properties system

### In Progress 🔄
- Remaining page components
- Chart component theming
- Form component theming

### Planned 📋
- User preference syncing
- System theme change detection
- Component-specific theme variants
- Advanced customization options

## 🎯 Next Steps

1. **Complete Component Updates**: Update remaining components systematically
2. **Chart Theming**: Ensure all Recharts components use theme-aware colors
3. **Form Components**: Update form elements for both themes
4. **Testing**: Comprehensive testing across all pages
5. **Documentation**: Update component documentation with theme examples

## 🔍 Testing Checklist

- [ ] Theme toggle works on all pages
- [ ] Theme preference persists across sessions
- [ ] All text is readable in both themes
- [ ] Interactive elements have proper hover states
- [ ] Charts and graphs display correctly
- [ ] Form elements are styled consistently
- [ ] Loading states work in both themes
- [ ] Mobile responsive design maintained
