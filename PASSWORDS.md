# 🔐 Access Passwords - Quick Reference

## Passwords

### Simi's Password
```
simi1234
```
**Usage:** Enter after birthday intro to unlock dashboard

### Admin Password
```
emmjay1234
```
**Usage:** Enter after 5-click gesture to access admin panel

---

## How to Use

### For Simi (Regular Access):
1. Visit website
2. Watch birthday intro (gift box)
3. Password gate appears
4. Enter: **simi1234**
5. Dashboard unlocks

### For Admin:
1. In birthday intro, click "Happy Birthday My Baby" **5 times**
2. Admin prompt appears
3. Enter: **emmjay1234**
4. Redirected to admin dashboard at `/admin`

---

## Important Notes

✅ **Always shows intro** - Every refresh starts from Act 1  
✅ **Passwords in .env.local** - Not committed to Git  
✅ **Deploy passwords as environment variables** - Set in hosting platform  
✅ **Session persists** - No need to re-enter after each page navigation  
✅ **Refresh resets** - Full intro experience every time  

---

## For Deployment

Set these in your hosting platform:
```env
SIMI_ACCESS_PASSWORD=simi1234
ADMIN_ACCESS_PASSWORD=emmjay1234
SESSION_SECRET=<generate-with-openssl>
```
