# Translation Management System

This directory contains tools for managing translations in the movelinker application.

## Structure

- `en.json` - English translations (source language)
- `fr.json` - French translations (target language)

## Scripts

### 1. Compare Translations
**File:** `compare-translations.js`

Compares English and French translation files to identify missing keys.

```bash
node compare-translations.js
```

### 2. Sync Translations
**File:** `sync-translations.js`

Synchronizes translation files by adding missing keys from French to English with placeholder values.

```bash
node sync-translations.js
```

### 3. Translate to English
**File:** `translate-to-english.js`

Translates French placeholder values to proper English.

```bash
node translate-to-english.js
```

### 4. Validate Translations (NEW)
**File:** `validate-translations.js`

Validates that both language files have the same structure and no missing keys.

```bash
node validate-translations.js
```

## Workflow for Adding New Translations

### Option 1: Add to French First (Recommended)
This is the current workflow since French is more complete:

1. Add new translation keys to `fr.json`
2. Run `node sync-translations.js` to sync structure to English
3. Run `node translate-to-english.js` to translate placeholders
4. Manually review and refine translations in both files

### Option 2: Add to English First
If you prefer to start with English:

1. Add new translation keys to `en.json`
2. Manually add corresponding French translations to `fr.json`
3. Run `node validate-translations.js` to ensure consistency

## Best Practices

### 1. Key Naming Convention
Use dot notation for nested keys:
```json
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

Access in code: `t('section.subsection.key')`

### 2. Organize by Feature
Group related translations together:
- `nav.*` - Navigation items
- `auth.*` - Authentication pages
- `bookings.*` - Booking-related content
- `common.*` - Reusable UI elements
- `dashboard.*` - Dashboard content
- etc.

### 3. Use Descriptive Keys
Bad: `text1`, `label2`, `btn3`
Good: `submitButton`, `emailLabel`, `welcomeMessage`

### 4. Interpolation
For dynamic values, use double curly braces:

```json
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

Usage in code:
```javascript
t('welcome', { name: 'John' })
t('itemCount', { count: 5 })
```

### 5. Pluralization
Use `_one`, `_other` suffixes for plural forms:

```json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

Usage:
```javascript
t('item', { count: 1 })  // "1 item"
t('item', { count: 5 })  // "5 items"
```

## Adding Translations to Components

### 1. Import the hook
```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Use in component
```javascript
function MyComponent() {
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

### 3. With interpolation
```javascript
<p>{t('welcome', { name: user.name })}</p>
```

## Maintenance

### Regular Checks
Run validation regularly to ensure translation consistency:

```bash
# Check for missing keys
node compare-translations.js

# Validate structure
node validate-translations.js
```

### When to Sync
- After adding multiple new features
- Before major releases
- When translation drift is suspected

## Language Switcher

The application has a language switcher in the header that allows users to toggle between English and French. The selected language is persisted in localStorage.

## Common Patterns

### Buttons
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "submit": "Submit"
  }
}
```

### Status Labels
```json
{
  "status": {
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "completed": "Completed"
  }
}
```

### Forms
```json
{
  "form": {
    "email": "Email Address",
    "emailPlaceholder": "Enter your email",
    "emailRequired": "Email is required",
    "emailInvalid": "Invalid email format"
  }
}
```

## Troubleshooting

### Missing Translations
If you see a translation key displayed instead of text:
1. Check if the key exists in both language files
2. Verify the key path is correct
3. Run validation script to identify the issue

### Inconsistent Translations
If translations are out of sync:
1. Run `node compare-translations.js` to identify differences
2. Run `node sync-translations.js` to sync structure
3. Manually update any incorrect translations

## Future Enhancements

- Automatic translation using AI/APIs
- Translation memory/glossary
- Context-aware suggestions
- Automated testing for translation coverage
- Integration with translation management platforms (e.g., Crowdin, Lokalise)
