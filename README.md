# Sales Lead Tracker

Sales Lead Tracker เป็นแอปพลิเคชันบริหารจัดการลูกค้าเป้าหมาย (Lead) แบบครบวงจรสำหรับทีมขาย ช่วยให้ทีมสามารถติดตามและจัดการลูกค้าเป้าหมายได้อย่างมีประสิทธิภาพ

## คุณสมบัติหลัก

- **แดชบอร์ดสรุปข้อมูล**: แสดงข้อมูลสำคัญเช่น จำนวนลูกค้าเป้าหมายทั้งหมด, มูลค่าโอกาสการขาย, และอัตราการปิดการขาย
- **การจัดการลูกค้าเป้าหมาย**: เพิ่ม, แก้ไข, และติดตามลูกค้าเป้าหมายพร้อมข้อมูลการติดต่อและสถานะ
- **การจัดการผู้ใช้งาน**: ระบบจัดการผู้ใช้งานพร้อมการกำหนดสิทธิ์ตามบทบาท (Administrator, Sales Manager, Sales Representative)
- **ความปลอดภัย**: ไม่มี fallback login, ไม่มีข้อความ admin default ในหน้า Login, การเปลี่ยนรหัสผ่านมีผลทันที, และสามารถลบผู้ใช้งาน (เฉพาะ Administrator เท่านั้น)
- **การกรองข้อมูลตามช่วงวันที่**: กรองข้อมูลลูกค้าเป้าหมายและแดชบอร์ดตามช่วงเวลาที่ต้องการ
- **ระบบติดตามสถานะ**: ติดตามสถานะของลูกค้าเป้าหมายแต่ละราย (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost)

## เทคโนโลยีที่ใช้

### Frontend
- React
- TypeScript
- TanStack Query (React Query)
- Tailwind CSS
- Shadcn UI
- Chart.js
- React Hook Form + Zod
- React Day Picker + date-fns

### Backend
- Express.js
- TypeScript
- SQLite (better-sqlite3)
- Drizzle ORM
- Zod

## หมายเหตุความปลอดภัย

- หน้า Login ไม่มีการแสดงข้อความ admin default อีกต่อไป
- ระบบไม่มี fallback login ด้วย hardcoded users เพื่อความปลอดภัย
- เมื่อเปลี่ยนรหัสผ่าน จะมีผลทันทีและไม่สามารถใช้รหัสผ่านเก่าได้อีก
- เฉพาะ Administrator เท่านั้นที่สามารถลบผู้ใช้งานได้ และไม่สามารถลบ Administrator คนสุดท้าย

## การติดตั้ง

### ข้อกำหนดเบื้องต้น
- Node.js (v18 หรือใหม่กว่า)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. โคลนโปรเจค
```bash
git clone https://github.com/rujirapongsn2/SalesLeadTracker.git
cd SalesLeadTracker
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. เริ่มต้นใช้งานในโหมดพัฒนา
```bash
npm run dev
```

แอปพลิเคชันจะทำงานที่ https://saletrack.softnix.co.th และ API จะทำงานที่ https://saletrack.softnix.co.th/api

## โครงสร้างโปรเจค

```
SalesLeadTracker/
├── client/               # โค้ดส่วน Frontend (React)
│   ├── public/           # ไฟล์สาธารณะ
│   └── src/
│       ├── components/   # React Components
│       ├── hooks/        # Custom React Hooks
│       ├── lib/          # Utility functions
│       └── pages/        # หน้าต่างๆ ของแอปพลิเคชัน
├── server/               # โค้ดส่วน Backend (Express)
│   ├── index.ts          # Entry point
│   ├── routes.ts         # API Routes
│   └── storage.ts        # Database operations
└── shared/               # โค้ดที่ใช้ร่วมกันระหว่าง Frontend และ Backend
    └── schema.ts         # Zod schemas และ TypeScript types
```

## การใช้งานฐานข้อมูล

โปรเจคนี้ใช้ SQLite เป็นฐานข้อมูล โดยไฟล์ฐานข้อมูลจะถูกสร้างที่ `sqlite.db` ในโฟลเดอร์หลักของโปรเจค เมื่อเริ่มต้นแอปพลิเคชัน ระบบจะทำการสร้างข้อมูลตัวอย่างโดยอัตโนมัติ

## บทบาทผู้ใช้งาน

ระบบมีการกำหนดบทบาทผู้ใช้งาน 3 ระดับ:

1. **Administrator**: สามารถจัดการผู้ใช้งานและข้อมูลทั้งหมดในระบบ
2. **Sales Manager**: สามารถดูภาพรวมและจัดการข้อมูลการขาย
3. **Sales Representative**: สามารถจัดการลูกค้าเป้าหมายที่ได้รับมอบหมาย

## การพัฒนาต่อยอด

### การเพิ่มฟีเจอร์ใหม่
1. สร้าง branch ใหม่จาก main
2. พัฒนาฟีเจอร์
3. ส่ง Pull Request

### การปรับแต่งฐานข้อมูล
หากต้องการปรับแต่งโครงสร้างฐานข้อมูล สามารถแก้ไขได้ที่ `shared/schema.ts` และใช้ Drizzle ORM เพื่อทำการ migration

## License

MIT

## ผู้พัฒนา

ผู้พัฒนา: Rujirapong R

## API Documentation

### Authentication
ระบบใช้ Header-based authentication โดยต้องส่ง header ดังนี้:
- `x-user-id`: ID ของผู้ใช้งาน
- `x-user-role`: บทบาทของผู้ใช้งาน (Administrator, Sales Manager, Sales Representative)
- `x-user-name`: ชื่อผู้ใช้งาน

### Endpoints

#### Users
- `DELETE /api/users/:id`
  - ลบผู้ใช้งานตามรหัสไอดี (เฉพาะ Administrator เท่านั้น)
  - ไม่สามารถลบ Administrator คนสุดท้ายได้
  - Response:
    - 204 No Content (สำเร็จ)
    - 404 Not Found (ไม่พบผู้ใช้)
    - 400 Bad Request (พยายามลบ admin คนสุดท้าย)

#### Authentication
- `POST /api/login`
  - Request Body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "user": {
        "id": number,
        "name": "string",
        "role": "string"
      },
      "message": "Login successful"
    }
    ```

#### Leads
- `GET /api/leads`
  - Query Parameters:
    - `fromDate`: วันที่เริ่มต้น (optional)
    - `toDate`: วันที่สิ้นสุด (optional)
  - Response:
    ```json
    {
      "leads": [
        {
          "id": number,
          "name": "string",
          "email": "string",
          "phone": "string",
          "company": "string",
          "status": "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost",
          "source": "Website" | "Referral" | "Social Media" | "Other",
          "createdAt": number,
          "updatedAt": number,
          "createdBy": "string",
          "createdById": number
        }
      ]
    }
    ```

- `GET /api/leads/:id`
  - Response:
    ```json
    {
      "lead": {
        "id": number,
        "name": "string",
        "email": "string",
        "phone": "string",
        "company": "string",
        "status": "string",
        "source": "string",
        "createdAt": number,
        "updatedAt": number,
        "createdBy": "string",
        "createdById": number
      }
    }
    ```

- `POST /api/leads`
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "company": "string",
      "status": "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost",
      "source": "Website" | "Referral" | "Social Media" | "Other"
    }
    ```
  - Response:
    ```json
    {
      "lead": {
        "id": number,
        "name": "string",
        "email": "string",
        "phone": "string",
        "company": "string",
        "status": "string",
        "source": "string",
        "createdAt": number,
        "updatedAt": number,
        "createdBy": "string",
        "createdById": number
      }
    }
    ```

- `PATCH /api/leads/:id`
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "company": "string",
      "status": "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost",
      "source": "Website" | "Referral" | "Social Media" | "Other"
    }
    ```
  - Response:
    ```json
    {
      "lead": {
        "id": number,
        "name": "string",
        "email": "string",
        "phone": "string",
        "company": "string",
        "status": "string",
        "source": "string",
        "createdAt": number,
        "updatedAt": number,
        "createdBy": "string",
        "createdById": number
      }
    }
    ```

### Error Responses
- `400 Bad Request`: ข้อมูลที่ส่งมาไม่ถูกต้อง
- `401 Unauthorized`: ไม่ได้ทำการ authentication
- `403 Forbidden`: ไม่มีสิทธิ์ในการเข้าถึง
- `404 Not Found`: ไม่พบข้อมูลที่ต้องการ
- `500 Internal Server Error`: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์

## API Keys Management

### การสร้าง API Key
1. เข้าสู่ระบบด้วยบัญชี Administrator
2. ไปที่หน้า API Management
3. คลิกปุ่ม "สร้าง API Key ใหม่"
4. ระบุชื่อ API Key และเลือกผู้ใช้งาน
5. คลิก "สร้าง API Key"
6. คัดลอก API Key ที่สร้างขึ้นและเก็บไว้อย่างปลอดภัย (จะแสดงเพียงครั้งเดียว)

### การใช้งาน API Key
ส่ง API Key ในรูปแบบของ HTTP header ดังนี้:
```
X-API-Key: your_api_key_here
```

### การจัดการ API Keys
- **ดูรายการ API Keys**: สามารถดูรายการ API Keys ทั้งหมดได้ที่หน้า API Management
- **ลบ API Key**: สามารถลบ API Key ที่ไม่ต้องการใช้งานได้
- **ตรวจสอบสถานะ**: ดูสถานะการใช้งานของ API Key (ใช้งานได้/ปิดใช้งาน)

### ข้อควรระวัง
- เก็บรักษา API Key ไว้อย่างปลอดภัย
- อย่าแชร์ API Key กับบุคคลที่ไม่เกี่ยวข้อง
- หากสงสัยว่า API Key รั่วไหล ให้ลบและสร้างใหม่ทันที
- API Key จะแสดงเพียงครั้งเดียวตอนสร้างเท่านั้น
