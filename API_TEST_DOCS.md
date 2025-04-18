# เอกสารการทดสอบระบบ Authentication

## 1. การลงทะเบียน (Register)
**Endpoint:** POST http://localhost:4001/auth/register
**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
    "username": "testuser",
    "password": "Test1234!",
    "firstName": "ทดสอบ",
    "lastName": "ระบบ"
}
```

**Expected Success Response (201):**
```json
{
    "status": "success",
    "message": "ลงทะเบียนสำเร็จ",
    "data": {
        "user": {
            "_id": "<user_id>",
            "username": "testuser",
            "firstName": "ทดสอบ",
            "lastName": "ระบบ",
            "role": "user"
        }
    }
}
```

**Expected Error Cases:**
- ข้อมูลไม่ครบ (400):
```json
{
    "status": "error",
    "message": "กรุณากรอกข้อมูลให้ครบถ้วน"
}
```
- Username ซ้ำ (400):
```json
{
    "status": "error",
    "message": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
}
```

## 2. การเข้าสู่ระบบ (Login)
**Endpoint:** POST http://localhost:4001/auth/login
**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
    "username": "testuser",
    "password": "Test1234!"
}
```

**Expected Success Response (200):**
```json
{
    "status": "success",
    "message": "เข้าสู่ระบบสำเร็จ",
    "data": {
        "token": "<jwt_token>",
        "user": {
            "id": "<user_id>",
            "username": "testuser",
            "firstName": "ทดสอบ",
            "lastName": "ระบบ",
            "role": "user"
        }
    }
}
```

**Expected Error Cases:**
- ข้อมูลไม่ครบ (401):
```json
{
    "status": "error",
    "message": "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
}
```
- ข้อมูลไม่ถูกต้อง (401):
```json
{
    "status": "error",
    "message": "ไม่พบชื่อผู้ใช้นี้ในระบบ"
}
```

## 3. การตรวจสอบ Token (Verify)
**Endpoint:** GET http://localhost:4001/auth/verify
**Headers:**
- Authorization: Bearer <token_จาก_login>

**Expected Success Response (200):**
```json
{
    "message": "Token is valid",
    "user": {
        "id": "<user_id>",
        "username": "testuser",
        "firstName": "ทดสอบ",
        "lastName": "ระบบ",
        "role": "user"
    }
}
```

**Expected Error Cases:**
- ไม่มี Token (401):
```json
{
    "message": "No token provided"
}
```
- Token ไม่ถูกต้อง (401):
```json
{
    "message": "Invalid token"
}
```

## 4. การทดสอบ Token หมดอายุ
**Endpoint:** POST http://localhost:4001/auth/test-expired

**Expected Success Response (200):**
```json
{
    "message": "Test token created",
    "token": "<token_ที่จะหมดอายุใน_1_วินาที>"
}
```

**ขั้นตอนการทดสอบ:**
1. เรียก `/auth/test-expired` เพื่อรับ token
2. รอ 1 วินาที
3. ใช้ token นี้เรียก `/auth/verify`
4. ควรได้ error token หมดอายุ

## 5. การทดสอบ Rate Limiting

### การ Login
- ทำการ login ด้วยข้อมูลผิดติดต่อกัน 5 ครั้ง
- ครั้งที่ 6 ควรได้ error:
```json
{
    "message": "Too many login attempts, please try again later"
}
```

### การลงทะเบียน
- ทำการลงทะเบียนติดต่อกัน 3 ครั้ง
- ครั้งที่ 4 ควรได้ error:
```json
{
    "message": "Too many accounts created, please try again later"
}
```

## หมายเหตุ
- Rate Limiting สำหรับ Login: 5 ครั้ง/15 นาที/IP
- Rate Limiting สำหรับ Register: 3 ครั้ง/1 ชั่วโมง/IP
- Token จะหมดอายุตามค่า JWT_EXPIRES_IN ใน .env (default: 1 วัน) 