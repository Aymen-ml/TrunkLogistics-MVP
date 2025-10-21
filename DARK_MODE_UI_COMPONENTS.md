# Dark Mode UI Components Reference

## Overview
Your application uses **Tailwind CSS dark mode** with the `class` strategy. When a user selects dark theme, the `dark` class is added to `<html>`, and all components with `dark:` prefixed classes automatically switch to dark mode styles.

---

## How Dark Mode Works

### Activation Method
```javascript
// Light mode
document.documentElement.classList.remove('dark');

// Dark mode
document.documentElement.classList.add('dark');
```

### Tailwind CSS Usage
```jsx
// Component automatically switches based on dark class
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

---

## Current Dark Mode Support

### ✅ Components with Dark Mode

#### 1. **App Layout** (`App.jsx`)
**Light Mode:**
- Background: Light gray (`bg-gray-50`)

**Dark Mode:**
- Background: Dark gray (`dark:bg-gray-900`)

```jsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
```

---

#### 2. **Navbar** (`Navbar.jsx`)
**Light Mode:**
- Background: White (`bg-white`)
- Border: Light gray (`border-gray-200`)
- Text: Dark gray (`text-gray-900`)
- Links: Gray (`text-gray-700`)

**Dark Mode:**
- Background: Dark gray (`dark:bg-gray-800`)
- Border: Dark gray (`dark:border-gray-700`)
- Text: Light gray (`dark:text-gray-100`)
- Links: Light gray (`dark:text-gray-200`)
- Hover background: Darker gray (`dark:hover:bg-gray-700`)

```jsx
<nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
    TruckLogistics
  </span>
  <NavLink className="text-gray-700 dark:text-gray-200 hover:text-blue-600">
    Dashboard
  </NavLink>
</nav>
```

**What Changes:**
- ✅ Navigation bar background
- ✅ Logo text color
- ✅ All navigation links
- ✅ Border colors
- ✅ Hover states
- ✅ Mobile menu (same classes)

---

#### 3. **Settings Page** (`Settings.jsx`)
**Light Mode:**
- Theme indicator icons and text
- Selected theme shows blue

**Dark Mode:**
- Theme indicator shows blue highlight
- Text adjusts accordingly

```jsx
<Moon className={`h-8 w-8 mb-2 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
<span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-900' : 'text-gray-700'}`}>
  Dark Mode
</span>
```

**What Changes:**
- ✅ Theme selection indicators
- ✅ Active theme highlighting

---

## ❌ Components WITHOUT Dark Mode (Need Enhancement)

### Major Components Missing Dark Mode Support:

#### 1. **All Pages**
Most page components use light-only colors:
- Booking pages
- Dashboard pages
- Admin pages
- Profile pages
- Document pages

**Current Style (Light Only):**
```jsx
<div className="min-h-screen bg-gray-50 py-8">
  <div className="bg-white shadow rounded-lg p-6">
    <h1 className="text-2xl font-bold text-gray-900">Title</h1>
    <p className="text-gray-600">Description</p>
  </div>
</div>
```

**Should Be (Light + Dark):**
```jsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Title</h1>
    <p className="text-gray-600 dark:text-gray-400">Description</p>
  </div>
</div>
```

---

#### 2. **Cards & Panels**
**Need Dark Mode:**
```jsx
// Booking cards, info panels, stat cards, etc.
<div className="bg-white shadow rounded-lg p-4">
  <!-- Content -->
</div>
```

**Should Be:**
```jsx
<div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 rounded-lg p-4">
  <!-- Content -->
</div>
```

---

#### 3. **Buttons**
**Current (Light Only):**
```jsx
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Submit
</button>
```

**Should Add (if needed):**
```jsx
<button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
  Submit
</button>
```

Note: Blue buttons usually look fine in both modes!

---

#### 4. **Forms & Inputs**
**Current:**
```jsx
<input 
  type="text"
  className="border-gray-300 rounded-md"
/>
```

**Should Be:**
```jsx
<input 
  type="text"
  className="border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
/>
```

---

#### 5. **Tables**
**Current:**
```jsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="text-gray-500">Header</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr>
      <td className="text-gray-900">Data</td>
    </tr>
  </tbody>
</table>
```

**Should Be:**
```jsx
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="text-gray-500 dark:text-gray-400">Header</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    <tr>
      <td className="text-gray-900 dark:text-gray-100">Data</td>
    </tr>
  </tbody>
</table>
```

---

#### 6. **Modals & Dialogs**
**Current:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="bg-white rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900">Title</h3>
    <p className="text-gray-600">Content</p>
  </div>
</div>
```

**Should Be:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70">
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Title</h3>
    <p className="text-gray-600 dark:text-gray-400">Content</p>
  </div>
</div>
```

---

#### 7. **Notification Center**
**Current:** Uses fixed light colors  
**Should Add:** Dark mode support for the notification panel

---

#### 8. **Status Badges**
**Current:**
```jsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Active
</span>
```

**Should Be:**
```jsx
<span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
  Active
</span>
```

---

## Dark Mode Color Palette

### Background Colors
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | `bg-gray-50` | `dark:bg-gray-900` |
| Card/Panel | `bg-white` | `dark:bg-gray-800` |
| Secondary bg | `bg-gray-100` | `dark:bg-gray-700` |
| Hover bg | `hover:bg-gray-50` | `dark:hover:bg-gray-700` |

### Text Colors
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Heading | `text-gray-900` | `dark:text-gray-100` |
| Body text | `text-gray-700` | `dark:text-gray-200` |
| Muted text | `text-gray-600` | `dark:text-gray-400` |
| Very muted | `text-gray-500` | `dark:text-gray-500` |

### Border Colors
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Default border | `border-gray-200` | `dark:border-gray-700` |
| Light border | `border-gray-300` | `dark:border-gray-600` |
| Divider | `divide-gray-200` | `dark:divide-gray-700` |

### Status Colors (Remain Same)
| Status | Light & Dark |
|--------|--------------|
| Primary | `bg-blue-600` |
| Success | `bg-green-600` |
| Warning | `bg-yellow-600` |
| Danger | `bg-red-600` |
| Info | `bg-indigo-600` |

---

## Components That Should Change

### Currently Working ✅
1. **App layout background** - Gray to dark gray
2. **Navbar** - White to dark gray
3. **Navbar text** - Dark to light
4. **Navigation links** - Gray to light gray
5. **Settings theme selector** - Shows active theme

### Need Dark Mode Support ⏳
1. **Dashboard pages** - All stat cards, charts
2. **Booking pages** - Booking list, booking details, create booking
3. **Admin pages** - User management, booking management
4. **Profile pages** - User profile, settings
5. **Document pages** - Document upload, document list
6. **Forms** - All input fields, selects, textareas
7. **Tables** - All data tables
8. **Modals** - Confirmation dialogs, detail modals
9. **Notification Center** - Notification panel
10. **Status badges** - All colored badges
11. **Cards** - All card components
12. **Buttons** - Secondary and tertiary buttons
13. **Loading states** - Spinners and skeletons
14. **Empty states** - No data messages
15. **Error messages** - Error displays
16. **Toast notifications** - Success/error toasts

---

## Recommended Implementation Plan

### Phase 1: Critical Components (High Visibility)
1. **Dashboard page** - First thing users see
2. **Booking pages** - Main functionality
3. **Form inputs** - User interactions
4. **Buttons** - All interactive elements

### Phase 2: Secondary Components
5. **Tables** - Data display
6. **Modals** - Popup dialogs
7. **Cards** - Content containers
8. **Status badges** - Visual indicators

### Phase 3: Polish
9. **Notification Center** - Notification panel
10. **Loading states** - Spinners, skeletons
11. **Empty states** - No data views
12. **Toast notifications** - Feedback messages

---

## Quick Implementation Template

### For Pages
```jsx
// Wrap page in:
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  {/* Content */}
</div>
```

### For Cards
```jsx
// Replace bg-white with:
<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
  {/* Content */}
</div>
```

### For Headings
```jsx
// Replace text-gray-900 with:
<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
  {title}
</h1>
```

### For Body Text
```jsx
// Replace text-gray-600 with:
<p className="text-gray-600 dark:text-gray-400">
  {description}
</p>
```

### For Inputs
```jsx
// Add dark mode classes:
<input
  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md"
/>
```

### For Borders
```jsx
// Replace border-gray-200 with:
<div className="border-b border-gray-200 dark:border-gray-700">
```

---

## Testing Dark Mode

### Visual Testing Checklist
- [ ] Page backgrounds change
- [ ] Card backgrounds change
- [ ] All text is readable (good contrast)
- [ ] Borders are visible but subtle
- [ ] Buttons maintain visual hierarchy
- [ ] Forms are usable
- [ ] Tables are readable
- [ ] Status badges are clear
- [ ] Modals stand out from background
- [ ] No white flashes when switching

### Accessibility
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Focus indicators are visible in both modes
- [ ] Color is not the only indicator of status
- [ ] All interactive elements are distinguishable

---

## Summary

**Current State:**
- ✅ Infrastructure ready (Tailwind dark mode configured)
- ✅ Basic components working (App layout, Navbar, Settings)
- ❌ Most pages need dark mode classes added

**What Changes When Theme Switches:**
Currently, only:
1. Main app background (gray → dark gray)
2. Navbar (white → dark gray)
3. Navbar text and links (dark → light)
4. Settings theme indicator

**What SHOULD Change:**
Everything! All pages, cards, forms, tables, modals, etc.

**Next Step:**
Add `dark:` prefixed classes to all components following the color palette above.

---

*Would you like me to implement dark mode for specific components? Just let me know which ones!*
