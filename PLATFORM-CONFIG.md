# Platform Configuration Notes

## File Upload Size Limits

Since Next.js 14 App Router no longer supports `api.bodyParser.sizeLimit` in route configs, you need to configure file upload limits at the platform level.

### For Vercel
Create or update `vercel.json` in the project root:

```json
{
  "functions": {
    "app/api/admin/upload/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "api": {
    "bodyParser": {
      "sizeLimit": "50mb"
    }
  }
}
```

### For Netlify
Create or update `netlify.toml` in the project root:

```toml
[[edge_functions]]
  path = "/api/admin/upload"
  function = "upload"

[functions]
  node_bundler = "esbuild"

[build]
  functions = "netlify/functions"
  
[functions."upload"]
  maxBodySize = "52428800"  # 50MB in bytes
```

### For Your Current Platform (Pxxl)
Check the platform documentation for how to configure:
- Request body size limits
- Request timeout limits
- Memory allocation for functions

Common configuration locations:
- Platform dashboard settings
- `pxxl.json` or similar config file
- Environment variables like `MAX_BODY_SIZE`

---

## Default Limits

Without custom configuration, most platforms have these defaults:
- **Vercel Free:** 4.5MB body size, 10s timeout
- **Vercel Pro:** 4.5MB body size, 60s timeout
- **Netlify Free:** 6MB body size, 10s timeout
- **Netlify Pro:** Configurable up to 50MB

---

## Workaround for Large Files

If your platform doesn't support large uploads, consider:

### Option 1: Client-Side Direct Upload
Upload directly from browser to Supabase Storage, bypassing your API:

```typescript
// In MediaUploader component
const handleDirectUpload = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file);
  
  // Then call your API to save metadata only
  await fetch('/api/admin/media', {
    method: 'POST',
    body: JSON.stringify({ storagePath: data.path, ... })
  });
};
```

### Option 2: Chunked Upload
Split large files into smaller chunks:

```typescript
const uploadInChunks = async (file: File) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
    await uploadChunk(chunk, i);
  }
};
```

---

## Recommended Solution

For best performance and reliability with large media files, use **Client-Side Direct Upload** (Option 1). This:
- Bypasses API body size limits
- Faster (direct to Supabase CDN)
- Less server load
- Better progress tracking
- Works on all platforms

---

## Current Implementation

The upload route (`app/api/admin/upload/route.ts`) is configured for:
- Runtime: `nodejs`
- Dynamic rendering: `force-dynamic`
- File size validation: 50MB max (enforced in code)

**Note:** The 50MB validation in code will prevent uploads larger than 50MB, but your platform must also allow request bodies up to 50MB.

---

## Testing Upload Limits

To test your platform's actual limit:

1. Try uploading files of different sizes:
   - 5MB (should work on all platforms)
   - 10MB (most platforms support)
   - 25MB (requires configuration on most platforms)
   - 50MB (requires explicit configuration)

2. Check error messages:
   - "413 Payload Too Large" = Platform limit exceeded
   - "400 File too large" = App validation (50MB limit in code)
   - "Network error" = Request timeout (file too slow to upload)

---

## Fix Applied

**Commit:** 31caa3d  
**Change:** Removed deprecated `export const config` from upload route  
**Reason:** Next.js 14 App Router doesn't support old Pages Router API config  
**Action Required:** Configure body size at platform level (see above)

---

**Status:** ✅ Build should now succeed  
**Next:** Configure platform-specific upload limits or implement client-side direct upload
