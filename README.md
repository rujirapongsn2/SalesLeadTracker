# Sales Lead Tracker

Sales Lead Tracker เป็นแอปพลิเคชันบริหารจัดการลูกค้าเป้าหมาย (Lead) แบบครบวงจรสำหรับทีมขาย ช่วยให้ทีมสามารถติดตามและจัดการลูกค้าเป้าหมายได้อย่างมีประสิทธิภาพ

## คุณสมบัติหลัก

- **แดชบอร์ดสรุปข้อมูล**: แสดงข้อมูลสำคัญเช่น จำนวนลูกค้าเป้าหมายทั้งหมด, มูลค่าโอกาสการขาย, และอัตราการปิดการขาย
- **การจัดการลูกค้าเป้าหมาย**: เพิ่ม, แก้ไข, และติดตามลูกค้าเป้าหมายพร้อมข้อมูลการติดต่อและสถานะ
- **การจัดการผู้ใช้งาน**: ระบบจัดการผู้ใช้งานพร้อมการกำหนดสิทธิ์ตามบทบาท (Administrator, Sales Manager, Sales Representative)
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

แอปพลิเคชันจะทำงานที่ http://localhost:5173 และ API จะทำงานที่ http://localhost:3000

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
