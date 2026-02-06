# API Module Structure

This directory contains a **modular, domain-driven API architecture** following senior developer best practices.

## 📁 Structure

```
api/
├── useApiCore.js      # Core authentication & token management
├── companies.js       # Company management APIs
├── admins.js          # Company admin management APIs
├── users.js           # User management APIs
├── documents.js       # Document operations APIs
├── roles.js           # Role management APIs
├── folders.js         # Folder management APIs
├── stats.js           # Statistics APIs
├── documentChat.js    # Document chat/AI APIs
├── auth.js            # Authentication APIs
└── index.js           # Barrel export (clean imports)
```

## 🎯 Why This Structure?

### ✅ **Benefits:**

1. **Single Responsibility Principle** - Each file has one clear purpose
2. **Separation of Concerns** - Authentication separate from business logic
3. **Maintainability** - Easy to find and update specific APIs
4. **Scalability** - Easy to add new domains without bloating files
5. **Testability** - Each module can be tested independently
6. **Code Organization** - Related APIs grouped together
7. **Tree Shaking** - Only import what you need

### ❌ **Problems with Single File Approach:**

- File becomes too large (800+ lines)
- Hard to navigate and find specific APIs
- Violates Single Responsibility Principle
- Difficult to maintain as codebase grows
- Harder to test individual domains
- Merge conflicts when multiple developers work on different domains

## 📖 Usage

### **Option 1: Individual Hooks (Recommended for New Code)**

```javascript
// Import only what you need
import { useCompanies, useUsers } from '@/lib/api';

function MyComponent() {
  const { getCompanies, createCompany } = useCompanies();
  const { getUsers } = useUsers();
  
  // Use the APIs...
}
```

### **Option 2: Combined Hook (Backward Compatible)**

```javascript
// Still works for existing code
import { useApi } from '@/lib/useApi';

function MyComponent() {
  const { getCompanies, getUsers, loading, error } = useApi();
  
  // Use the APIs...
}
```

## 🔧 Adding New APIs

### **Adding to Existing Domain:**

```javascript
// In api/users.js
export function useUsers() {
  // ... existing code ...
  
  const newUserFunction = useCallback(
    (param) =>
      withAuth((token) =>
        apiClient
          .post('/company-admin/users/new-endpoint', { param }, createAuthHeaders(token))
          .then((res) => res.data)
      ),
    [withAuth]
  );

  return {
    // ... existing returns ...
    newUserFunction,
  };
}
```

### **Creating New Domain:**

1. Create new file: `api/newDomain.js`
2. Follow the pattern from existing files
3. Export from `index.js`

```javascript
// api/newDomain.js
export function useNewDomain() {
  const { withAuth, apiClient, createAuthHeaders } = useApiCore();
  
  // Your APIs here...
  
  return {
    // Your exports...
  };
}

// api/index.js
export { useNewDomain } from './newDomain';
```

## 🎓 Best Practices

1. **Group by Domain** - Keep related APIs together
2. **Use Descriptive Names** - `useCompanies` not `useCompanyAPI`
3. **Consistent Patterns** - Follow the same structure across files
4. **Document Complex Logic** - Add comments for non-obvious code
5. **Error Handling** - Handle errors consistently within each domain
6. **Type Safety** - Consider adding TypeScript in the future

## 📊 Comparison

| Aspect | Single File | Modular (This) |
|--------|-------------|----------------|
| File Size | 800+ lines | ~100 lines each |
| Maintainability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scalability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Testability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Code Organization | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Developer Experience | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 Migration Path

Existing code using `useApi()` will continue to work. Gradually migrate to individual hooks:

```javascript
// Old (still works)
const { getCompanies, getUsers } = useApi();

// New (preferred)
const { getCompanies } = useCompanies();
const { getUsers } = useUsers();
```

## 📝 Notes

- All hooks share the same `loading` and `error` state from `useApiCore`
- Authentication is handled automatically via `withAuth`
- Each domain is independent and can be used separately
- The barrel export (`index.js`) provides clean imports

