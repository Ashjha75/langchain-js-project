# Upload UI Quick Reference

## File Upload States

### 1. Uploading (In Progress)
```
┌─────────────────────────┐
│ 🔄 document.pdf         │  ← Spinning loader
│    [Can't delete yet]   │
└─────────────────────────┘
```

### 2. Upload Success
```
┌─────────────────────────┐
│ 📄 document.pdf     ❌  │  ← Hover shows "Remove file" tooltip
└─────────────────────────┘

OR (for images):

┌───────────┐
│ [IMAGE]   │  ← 20x20 preview
│  PREVIEW  │
│           │  ← Hover shows ❌ "Remove file"
└───────────┘
```

### 3. Upload Failed
```
┌─────────────────────────┐
│ ❌ document.pdf  !  ❌  │
│   └─ Error      └─ Delete
│      tooltip       tooltip
└─────────────────────────┘

PLUS: Modal appears immediately:
┌────────────────────────────────┐
│  ⚠️ Upload Error                │
│                                 │
│  Failed to upload "doc.pdf".   │
│  Network error. Try again.     │
│                                 │
│          [ OK ]                 │
└────────────────────────────────┘
```

## URL Handling

### Before Fix ❌
```
NEXT_PUBLIC_API_URL = "http://localhost:3002/api"
                      ↓
Code adds: "/api/documents/upload"
                      ↓
Result: "http://localhost:3002/api/api/documents/upload"
                                      ^^^^ DOUBLE!
                      ↓
404 Not Found ❌
```

### After Fix ✅
```
NEXT_PUBLIC_API_URL = "http://localhost:3002/api"
                      ↓
Strip trailing /api: "http://localhost:3002"
                      ↓
Add path: "/api/documents/upload"
                      ↓
Result: "http://localhost:3002/api/documents/upload"
                                    ^^^^ CORRECT!
                      ↓
200 Success ✅
```

## User Interactions

### Hover Behaviors

**Delete Button:**
```
Normal state:     Hover state:
    ×      →      [×] ← "Remove file"
```

**Error Indicator:**
```
Normal state:     Hover state:
    !      →      [!] ← "Failed to upload..."
```

### Modal Triggers

1. **Upload starts** → No modal
2. **Upload fails** → ⚠️ Modal immediately
3. **Try to send with errors** → ⚠️ Modal "Remove failed files"
4. **Try to send while uploading** → ⚠️ Modal "Wait for upload"

## Error Message Examples

### Network Error
```
Failed to upload "report.pdf". 
Failed to fetch
```

### 401 Unauthorized
```
Failed to upload "image.jpg". 
Unauthorized - Please login again
```

### 413 File Too Large
```
Failed to upload "video.mp4". 
File size exceeds 10MB limit
```

### 404 Not Found (Fixed!)
```
Failed to upload "doc.docx". 
Not Found
```

## Tooltip Positions

```
   [Remove file]  ← Top tooltip
       ↓
   ┌──────┐
   │  ×   │  ← Delete button
   └──────┘

   ┌──────┐
   │  !   │  ← Error indicator
   └──────┘
       ↓
   [Error message]  ← Top tooltip
```

## File Type Displays

### Images
```
┌─────────────┐
│             │
│   [IMAGE]   │  20x20 preview
│             │
└─────────────┘
    [×]  ← Hover delete button
```

### Documents (PDF, DOCX, TXT)
```
┌──────────────────────┐
│ 📄 filename.pdf  ×   │
└──────────────────────┘
```

### Code Files (JS, PY, etc)
```
┌──────────────────────┐
│ 💚 script.py      ×  │
└──────────────────────┘
```

## Complete Upload Flow

```
1. User clicks "Upload files"
         ↓
2. File picker opens
         ↓
3. User selects file(s)
         ↓
4. Files appear with 🔄 spinner
         ↓
   ┌─────────┴─────────┐
   │                   │
   ↓ SUCCESS          ↓ FAILURE
   │                   │
5a. Show preview     5b. Show modal ⚠️
   ✅ checkmark         Show red ❌
   Can delete           Can delete
   Can send             Can't send (blocked)
```

## Keyboard Shortcuts

- `Enter` → Send (if not uploading)
- `Enter` (while uploading) → Shows "Wait" modal
- `Shift+Enter` → New line
- `Escape` (in modal) → Close modal

## States Summary

| State | Spinner | Preview | Delete | Send | Error Modal |
|-------|---------|---------|--------|------|-------------|
| Uploading | ✅ | ❌ | ❌ | ❌ | ❌ |
| Success | ❌ | ✅ | ✅ | ✅ | ❌ |
| Failed | ❌ | ⚠️ | ✅ | ❌ | ✅ |

---

**All fixes are LIVE and READY TO TEST! 🚀**
