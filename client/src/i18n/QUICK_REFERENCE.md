# 🌐 Translation Quick Reference

## 📦 One-Line Commands

```bash
# From /client directory

# Add new translations interactively
npm run i18n:manage

# Check if translations are in sync
npm run i18n:validate

# Find differences between EN and FR
npm run i18n:compare

# Sync missing keys from FR to EN
npm run i18n:sync

# Translate [EN] placeholders to English
npm run i18n:translate
```

## 🔨 Common Use Cases

### 1. Add a New Translation

**Using Interactive Tool:**
```bash
npm run i18n:manage
# Choose option 1
# Enter: bookings.success
# EN: Booking created successfully!
# FR: Réservation créée avec succès !
```

**Manual:**
1. Edit `src/i18n/locales/en.json` and `fr.json`
2. Add the same key to both files
3. Run `npm run i18n:validate`

### 2. Use Translation in Component

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('bookings.title')}</h1>
      <p>{t('bookings.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 3. Translation with Variables

**JSON:**
```json
{
  "welcome": "Welcome, {{name}}!",
  "items": "You have {{count}} items"
}
```

**Component:**
```jsx
{t('welcome', { name: user.name })}
{t('items', { count: cartItems.length })}
```

### 4. Check What Translations Exist

```bash
# Search for a term
npm run i18n:manage
# Choose option 3
# Enter search term: "booking"
```

Or grep the files:
```bash
cd src/i18n/locales
grep -i "booking" en.json
```

## 📁 File Structure

```
client/src/i18n/
├── locales/
│   ├── en.json          # English translations
│   └── fr.json          # French translations
├── config.js            # i18n configuration
├── GUIDE.md             # Component usage guide
├── README.md            # Full documentation
├── compare-translations.js
├── sync-translations.js
├── translate-to-english.js
├── validate-translations.js
└── translation-manager.js
```

## 🎯 Translation Key Patterns

```javascript
// Navigation
t('nav.dashboard')
t('nav.bookings')
t('nav.signout')

// Common UI
t('common.save')
t('common.cancel')
t('common.loading')

// Auth
t('auth.login.title')
t('auth.register.email')

// Bookings
t('bookings.form.title')
t('bookings.list.empty')

// Status
t('status.pending')
t('status.completed')

// Errors
t('errors.required')
t('errors.invalid')
```

## ⚠️ Common Mistakes

❌ **Don't hardcode text:**
```jsx
<button>Save</button>  // Wrong
```

✅ **Use translations:**
```jsx
<button>{t('common.save')}</button>  // Correct
```

❌ **Don't forget to import:**
```jsx
function MyComponent() {
  return <h1>{t('title')}</h1>  // Error! t is undefined
}
```

✅ **Import the hook:**
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('title')}</h1>  // Works!
}
```

## 🔍 Debugging Translation Issues

### Text shows as key instead of translation
**Symptoms:** You see `"auth.login.title"` instead of "Sign in"

**Solutions:**
1. Check if key exists in both `en.json` and `fr.json`
2. Verify key path is correct (check for typos)
3. Run `npm run i18n:validate`

### Translation doesn't change when switching language
**Symptoms:** Language switcher doesn't work

**Solutions:**
1. Check browser console for errors
2. Verify `useTranslation()` hook is used
3. Clear browser cache/localStorage
4. Check i18n config is properly loaded

### Missing translations in one language
**Symptoms:** Works in English, broken in French (or vice versa)

**Solutions:**
```bash
npm run i18n:compare  # Find what's missing
npm run i18n:sync     # Sync the files
```

## 🚀 Pro Tips

1. **Group related translations** under the same key prefix
2. **Use descriptive key names** (not `text1`, `text2`)
3. **Keep translations short** for button labels
4. **Add context comments** for ambiguous terms
5. **Validate before committing** changes
6. **Commit both language files together**

## 📞 Quick Help

- 📖 Full docs: `client/src/i18n/README.md`
- 🎓 Component guide: `client/src/i18n/GUIDE.md`
- 📊 System summary: `TRANSLATION_SYSTEM_SUMMARY.md`
- 🔧 Interactive tool: `npm run i18n:manage`

## 🌍 Current Status

- ✅ 748 keys in English
- ✅ 748 keys in French
- ✅ 100% translation coverage
- ✅ Validation passing
- ✅ Ready for production

---

**Remember:** Always run `npm run i18n:validate` before pushing changes!
