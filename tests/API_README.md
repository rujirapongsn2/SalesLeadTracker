# Sales Lead Tracker API

## 📋 ภาพรวม

API สำหรับระบบจัดการลูกค้าเป้าหมาย (Sales Lead Tracker) ให้บริการเข้าถึงข้อมูลและฟังก์ชันการทำงานผ่าน REST API

## 🔗 Base URL

```
http://localhost:5001
```

## 🔐 การยืนยันตัวตน

API ใช้ API Key สำหรับการยืนยันตัวตน โดยส่งใน HTTP Header:

```
X-API-Key: your_api_key_here
```

## 📚 API Endpoints

### 1. ค้นหาข้อมูลลูกค้าเป้าหมาย

**GET** `/api/v1/leads/search`

ค้นหาข้อมูลลูกค้าเป้าหมายตามเงื่อนไขต่างๆ

**Query Parameters:**
- `keyword` (string, optional): ค้นหาจากทุกฟิลด์
- `name` (string, optional): ชื่อลูกค้าเป้าหมาย
- `company` (string, optional): ชื่อบริษัท
- `email` (string, optional): อีเมล
- `phone` (string, optional): เบอร์โทร
- `status` (string, optional): สถานะ
- `source` (string, optional): แหล่งที่มา
- `product` (string, optional): สินค้าที่สนใจ
- `endUserOrganization` (string, optional): องค์กรลูกค้า
- `projectName` (string, optional): ชื่อโปรเจค

**ตัวอย่าง:**
```bash
curl -X GET "http://localhost:5001/api/v1/leads/search?keyword=Softnix" \
  -H "X-API-Key: your_api_key_here"
```

### 2. เพิ่มข้อมูลลูกค้าเป้าหมาย

**POST** `/api/v1/leads`

เพิ่มข้อมูลลูกค้าเป้าหมายใหม่

**Required Fields:**
- `name` (string): ชื่อลูกค้าเป้าหมาย
- `company` (string): ชื่อบริษัทคู่ค้า
- `email` (string): อีเมลติดต่อ
- `phone` (string): เบอร์โทรศัพท์
- `source` (string): แหล่งที่มา

**Optional Fields:**
- `status` (string): สถานะ (default: "New")
- `product` (string): สินค้าที่สนใจ
- `productRegister` (string): สินค้าที่ลงทะเบียน
- `endUserContact` (string): ผู้ติดต่อฝั่งลูกค้า
- `endUserOrganization` (string): องค์กรของลูกค้า
- `projectName` (string): ชื่อโปรเจค
- `budget` (string): งบประมาณ
- `partnerContact` (string): ผู้ติดต่อพาร์ทเนอร์

**ตัวอย่าง:**```bash
curl -X POST "http://localhost:5001/api/v1/leads" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "company": "Tech Solutions Inc.",
    "email": "john@example.com",
    "phone": "0812345678",
    "source": "Website",
    "status": "New",
    "product": "Data Analytics",
    "endUserOrganization": "ABC Corp",
    "projectName": "Digital Transformation",
    "budget": "2,000,000"
  }'
```

### 3. แก้ไขข้อมูลลูกค้าเป้าหมาย

**PATCH** `/api/v1/leads/:id`

แก้ไขข้อมูลลูกค้าเป้าหมายที่มีอยู่

**ตัวอย่าง:**
```bash
curl -X PATCH "http://localhost:5001/api/v1/leads/123" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Qualified",
    "budget": "2,500,000"
  }'
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔒 User Attribution

เมื่อใช้ API Key เพิ่มข้อมูล Lead ระบบจะบันทึกว่าใครเป็นผู้เพิ่มข้อมูลโดยอัตโนมัติ:
- `createdBy`: ชื่อของผู้ใช้ที่เป็นเจ้าของ API Key
- `createdById`: ID ของผู้ใช้ที่เป็นเจ้าของ API Key

## 🚨 HTTP Status Codes

- `200`: สำเร็จ
- `201`: สร้างข้อมูลสำเร็จ
- `400`: ข้อมูลไม่ถูกต้อง
- `401`: API Key ไม่ถูกต้องหรือไม่มีสิทธิ์
- `404`: ไม่พบข้อมูล
- `500`: ข้อผิดพลาดของเซิร์ฟเวอร์

## 🧪 การทดสอบ API

ใช้ไฟล์ `api_test.js` เพื่อทดสอบ API:

```bash
# ใน Node.js
node tests/api_test.js

# หรือใน Browser Console
runAPITests()
```

**หมายเหตุ:** ก่อนทดสอบให้แก้ไข API_KEY ในไฟล์ `api_test.js`