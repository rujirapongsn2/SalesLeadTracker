import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'th',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Define translations
const translations: Record<Language, Record<string, string>> = {
  th: {
    // Common
    'app.name': 'ระบบจัดการลูกค้า',
    'app.language': 'ภาษา',
    'app.language.thai': 'ไทย',
    'app.language.english': 'อังกฤษ',
    
    // Navigation
    'nav.dashboard': 'แดชบอร์ด',
    'nav.leads': 'ลูกค้า',
    'nav.users': 'ผู้ใช้งาน',
    'nav.api': 'API',
    'nav.api.management': 'จัดการ API Keys',
    'nav.api.docs': 'เอกสาร API',
    'nav.logout': 'ออกจากระบบ',
    
    // Dashboard
    'dashboard.title': 'แดชบอร์ด',
    'dashboard.subtitle': 'ภาพรวมและตัวชี้วัดของคุณ',
    'dashboard.metrics.total': 'ลูกค้าทั้งหมด',
    'dashboard.metrics.new': 'ลูกค้าใหม่',
    'dashboard.metrics.qualified': 'ลูกค้าที่มีคุณภาพ',
    'dashboard.metrics.inprogress': 'อยู่ระหว่างดำเนินการ',
    'dashboard.metrics.converted': 'เปลี่ยนเป็นลูกค้า',
    'dashboard.metrics.budget': 'งบประมาณรวม',
    'dashboard.metrics.rate': 'อัตราการเปลี่ยน',
    'dashboard.chart.status': 'การกระจายตามสถานะ',
    'dashboard.chart.source': 'การกระจายตามแหล่งที่มา',
    'dashboard.leads.recent': 'ลูกค้าล่าสุด',
    
    // Leads
    'leads.title': 'จัดการลูกค้า',
    'leads.subtitle': 'ค้นหา แก้ไข และติดตามลูกค้าเป้าหมาย',
    'leads.add': 'เพิ่มลูกค้าใหม่',
    'leads.search': 'ค้นหาลูกค้า...',
    'leads.filter': 'ตัวกรอง',
    'leads.sort': 'เรียงลำดับ',
    'leads.name': 'ชื่อ',
    'leads.company': 'บริษัท',
    'leads.status': 'สถานะ',
    'leads.budget': 'งบประมาณ',
    'leads.created': 'สร้างเมื่อ',
    'leads.actions': 'การจัดการ',
    'leads.view': 'ดู',
    'leads.edit': 'แก้ไข',
    'leads.delete': 'ลบ',
    'leads.confirm.delete': 'คุณแน่ใจหรือไม่ที่จะลบลูกค้านี้?',
    
    // Form labels
    'form.name': 'ชื่อ',
    'form.email': 'อีเมล',
    'form.phone': 'เบอร์โทรศัพท์',
    'form.company': 'บริษัท',
    'form.position': 'ตำแหน่ง',
    'form.source': 'แหล่งที่มา',
    'form.status': 'สถานะ',
    'form.budget': 'งบประมาณ',
    'form.description': 'รายละเอียด',
    'form.save': 'บันทึก',
    'form.cancel': 'ยกเลิก',
    
    // Users
    'users.title': 'จัดการผู้ใช้งาน',
    'users.subtitle': 'จัดการผู้ใช้งานที่สามารถเข้าถึงระบบ',
    'users.add': 'เพิ่มผู้ใช้งานใหม่',
    'users.name': 'ชื่อ',
    'users.username': 'ชื่อผู้ใช้',
    'users.role': 'บทบาท',
    'users.actions': 'การจัดการ',
    
    // API
    'api.title': 'จัดการ API',
    'api.subtitle': 'จัดการ API Keys สำหรับการเข้าถึง API ภายนอก',
    'api.docs.title': 'เอกสาร API',
    'api.docs.subtitle': 'เอกสารอ้างอิงสำหรับการใช้งาน API',
    'api.key.create': 'สร้าง API Key ใหม่',
    'api.key.name': 'ชื่อ API Key',
    'api.key.value': 'Key',
    'api.key.user': 'ผู้ใช้งาน',
    'api.key.created': 'วันที่สร้าง',
    'api.key.lastused': 'ใช้งานล่าสุด',
    'api.key.status': 'สถานะ',
    'api.key.active': 'ใช้งานได้',
    'api.key.inactive': 'ปิดใช้งาน',
    
    // Messages
    'message.success': 'สำเร็จ',
    'message.error': 'เกิดข้อผิดพลาด',
    'message.saving': 'กำลังบันทึก...',
    'message.deleting': 'กำลังลบ...',
    'message.loading': 'กำลังโหลด...',
  },
  en: {
    // Common
    'app.name': 'Sales Lead Management',
    'app.language': 'Language',
    'app.language.thai': 'Thai',
    'app.language.english': 'English',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.users': 'Users',
    'nav.api': 'API',
    'nav.api.management': 'API Keys',
    'nav.api.docs': 'API Docs',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Your overview and metrics',
    'dashboard.metrics.total': 'Total Leads',
    'dashboard.metrics.new': 'New Leads',
    'dashboard.metrics.qualified': 'Qualified Leads',
    'dashboard.metrics.inprogress': 'In Progress',
    'dashboard.metrics.converted': 'Converted',
    'dashboard.metrics.budget': 'Total Budget',
    'dashboard.metrics.rate': 'Conversion Rate',
    'dashboard.chart.status': 'Status Distribution',
    'dashboard.chart.source': 'Source Distribution',
    'dashboard.leads.recent': 'Recent Leads',
    
    // Leads
    'leads.title': 'Lead Management',
    'leads.subtitle': 'Search, edit and track your sales leads',
    'leads.add': 'Add New Lead',
    'leads.search': 'Search leads...',
    'leads.filter': 'Filter',
    'leads.sort': 'Sort',
    'leads.name': 'Name',
    'leads.company': 'Company',
    'leads.status': 'Status',
    'leads.budget': 'Budget',
    'leads.created': 'Created',
    'leads.actions': 'Actions',
    'leads.view': 'View',
    'leads.edit': 'Edit',
    'leads.delete': 'Delete',
    'leads.confirm.delete': 'Are you sure you want to delete this lead?',
    
    // Form labels
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.company': 'Company',
    'form.position': 'Position',
    'form.source': 'Source',
    'form.status': 'Status',
    'form.budget': 'Budget',
    'form.description': 'Description',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    
    // Users
    'users.title': 'Users Management',
    'users.subtitle': 'Manage users who can access the system',
    'users.add': 'Add New User',
    'users.name': 'Name',
    'users.username': 'Username',
    'users.role': 'Role',
    'users.actions': 'Actions',
    
    // API
    'api.title': 'API Management',
    'api.subtitle': 'Manage API keys for external API access',
    'api.docs.title': 'API Documentation',
    'api.docs.subtitle': 'Reference documentation for using the API',
    'api.key.create': 'Create New API Key',
    'api.key.name': 'Key Name',
    'api.key.value': 'Key',
    'api.key.user': 'User',
    'api.key.created': 'Created Date',
    'api.key.lastused': 'Last Used',
    'api.key.status': 'Status',
    'api.key.active': 'Active',
    'api.key.inactive': 'Inactive',
    
    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.saving': 'Saving...',
    'message.deleting': 'Deleting...',
    'message.loading': 'Loading...',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get from localStorage or use default
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'th';
  });

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Update html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);