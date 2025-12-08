# 🌍 Internationalization (i18n) Guide for movelinker

## Overview

The movelinker app uses **react-i18next** for internationalization, supporting **English (en)** and **French (fr)** languages.

## How It Works

### 1. Configuration
- **Location:** `client/src/i18n/config.js`
- **Translations:** `client/src/i18n/locales/en.json` and `client/src/i18n/locales/fr.json`
- **Language Detection:** Automatic via browser language, with localStorage persistence

### 2. Using Translations in Components

#### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

#### With Variables/Interpolation

```jsx
const { t } = useTranslation();

// In translation file: "welcome": "Welcome, {{name}}!"
return <h1>{t('welcome', { name: user.name })}</h1>;
```

#### Accessing Nested Translations

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account"
    }
  }
}
```

```jsx
const { t } = useTranslation();
return <h1>{t('auth.login.title')}</h1>;
```

## Adding French Support to a New Component

### Step 1: Import useTranslation

```jsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Use the Hook

```jsx
function MyNewComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Step 3: Add Translations to Both Language Files

**`client/src/i18n/locales/en.json`:**
```json
{
  "mySection": {
    "title": "My New Feature",
    "description": "This is a description of my new feature"
  }
}
```

**`client/src/i18n/locales/fr.json`:**
```json
{
  "mySection": {
    "title": "Ma Nouvelle Fonctionnalité",
    "description": "Ceci est une description de ma nouvelle fonctionnalité"
  }
}
```

## Translation File Structure

The translation files follow a hierarchical structure based on feature/section:

```
{
  "nav": {},              // Navigation items
  "hero": {},             // Landing page hero section
  "services": {},         // Services section
  "auth": {               // Authentication
    "login": {},
    "register": {},
    "forgotPassword": {},
    "resetPassword": {}
  },
  "dashboard": {},        // Dashboard pages
  "bookings": {},         // Booking management
  "trucks": {},           // Truck management
  "profile": {},          // User profile
  "notifications": {},    // Notifications
  "settings": {},         // Settings
  "admin": {},            // Admin pages
  "common": {},           // Common/shared text
  "footer": {}            // Footer
}
```

## Best Practices

### 1. **Organize by Feature**
Group related translations together under a common namespace:

```json
{
  "bookings": {
    "list": {
      "title": "My Bookings",
      "empty": "No bookings found"
    },
    "create": {
      "title": "Create New Booking",
      "submit": "Create Booking"
    }
  }
}
```

### 2. **Use Common Keys for Repeated Text**
For buttons and actions used across multiple components:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "loading": "Loading..."
  }
}
```

### 3. **Avoid Hardcoded Text**
❌ Bad:
```jsx
<button>Save Changes</button>
```

✅ Good:
```jsx
<button>{t('common.save')}</button>
```

### 4. **Add Placeholders for Forms**
```json
{
  "auth": {
    "login": {
      "emailPlaceholder": "Enter your email",
      "passwordPlaceholder": "Enter your password"
    }
  }
}
```

### 5. **Use Descriptive Keys**
❌ Bad: `"text1": "Welcome"`
✅ Good: `"welcomeMessage": "Welcome to movelinker"`

### 6. **Keep Translations Synchronized**
Always add the same key to both `en.json` and `fr.json` files.

## Language Switcher Component

The `LanguageSwitcher` component is already implemented and available in the navbar:

```jsx
import LanguageSwitcher from './components/common/LanguageSwitcher';

// It automatically switches between English and French
<LanguageSwitcher />
```

## Testing Translations

### 1. **Switch Language**
Use the language switcher in the navbar to toggle between English and French.

### 2. **Check Browser Console**
Enable debug mode in `client/src/i18n/config.js`:
```javascript
debug: true
```

### 3. **Test All Pages**
Navigate through all pages to ensure translations are applied everywhere.

## Quick Reference: Common Translations

### Buttons & Actions
```
t('common.save')       → "Save" / "Enregistrer"
t('common.cancel')     → "Cancel" / "Annuler"
t('common.delete')     → "Delete" / "Supprimer"
t('common.edit')       → "Edit" / "Modifier"
t('common.view')       → "View" / "Voir"
t('common.submit')     → "Submit" / "Soumettre"
t('common.confirm')    → "Confirm" / "Confirmer"
```

### Status Messages
```
t('common.loading')    → "Loading..." / "Chargement..."
t('common.error')      → "Error" / "Erreur"
t('common.success')    → "Success" / "Succès"
t('common.warning')    → "Warning" / "Avertissement"
```

### Navigation
```
t('nav.dashboard')     → "Dashboard" / "Tableau de Bord"
t('nav.services')      → "Services" / "Services"
t('nav.contact')       → "Contact" / "Contact"
```

## Checklist for Adding New Page

- [ ] Import `useTranslation` hook
- [ ] Use `const { t } = useTranslation()` in component
- [ ] Replace all hardcoded text with `t('key')`
- [ ] Add English translations to `en.json`
- [ ] Add French translations to `fr.json`
- [ ] Test both languages
- [ ] Verify text fits UI in both languages

## Translation Tools & Resources

### French Translation Guidelines

1. **Use formal "vous" form** for professional context
2. **Technical terms** can remain in English if commonly used (e.g., "Dashboard")
3. **Action verbs** should be in infinitive form in French:
   - "Save" → "Enregistrer" (not "Enregistrez")
   - "View" → "Voir" (not "Voyez")

### Need Help with Translations?

**Online Tools:**
- Google Translate: https://translate.google.com
- DeepL: https://www.deepl.com (more accurate for French)
- Reverso Context: https://context.reverso.net (for context-based translations)

**For Professional Translations:**
- Always have a native French speaker review translations
- Consider industry-specific terminology for logistics

## Examples from the App

### Login Page
```jsx
const { t } = useTranslation();

<h2>{t('auth.login.title')}</h2>
<input placeholder={t('auth.login.emailPlaceholder')} />
<button>{t('auth.login.signInButton')}</button>
<a href="/forgot-password">{t('auth.login.forgotPassword')}</a>
```

### Dashboard
```jsx
const { t } = useTranslation();

<h1>{t('dashboard.quickActions')}</h1>
<section>{t('dashboard.recentActivity')}</section>
<button>{t('dashboard.viewAll')}</button>
```

### Bookings
```jsx
const { t } = useTranslation();

<h1>{t('bookings.list.title')}</h1>
<p>{t('bookings.list.empty')}</p>
<button>{t('bookings.create.button')}</button>
```

## Common Mistakes to Avoid

1. **Forgetting to add translation to both files**
   - Always update both `en.json` AND `fr.json`

2. **Using concatenation instead of interpolation**
   ❌ `t('welcome') + ' ' + user.name`
   ✅ `t('welcome', { name: user.name })`

3. **Hardcoding text in JSX**
   ❌ `<button>Click Me</button>`
   ✅ `<button>{t('common.click')}</button>`

4. **Not testing in both languages**
   - Always switch to French and verify the UI

5. **Using wrong key paths**
   ❌ `t('auth.login.Title')` (case-sensitive!)
   ✅ `t('auth.login.title')`

## Maintenance

### Updating Existing Translations
1. Find the key in `en.json` and `fr.json`
2. Update both files
3. Test the change in the UI

### Adding New Features
1. Create new section in translation files
2. Add all necessary keys in English
3. Translate all keys to French
4. Use translations in component

### Auditing Translations
Run this command to find components without i18n:
```bash
cd client/src/components
find . -name "*.jsx" -type f | while read file; do
  if ! grep -q "useTranslation" "$file"; then
    echo "$file needs i18n support"
  fi
done
```

## Support

For questions or issues with translations:
1. Check this guide first
2. Review existing components for examples
3. Consult react-i18next documentation: https://react.i18next.com
4. Ask the development team

---

**Remember:** Good internationalization makes your app accessible to more users! Always add translations when creating new features.

