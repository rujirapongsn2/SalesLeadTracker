import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiDocumentation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "คัดลอกโค้ดสำเร็จ",
        description: "คัดลอกโค้ดไปยังคลิปบอร์ดแล้ว",
      });
    } catch (error) {
      toast({
        title: "การคัดลอกโค้ดล้มเหลว",
        description: "ไม่สามารถคัดลอกโค้ดได้ กรุณาคัดลอกด้วยตนเอง",
        variant: "destructive",
      });
    }
  };

  const apiEndpoints = [
    {
      id: "search-leads",
      name: "ค้นหาข้อมูลลูกค้าเป้าหมาย",
      method: "GET",
      endpoint: "/api/v1/leads/search",
      description: "ค้นหาข้อมูลลูกค้าเป้าหมายตามเงื่อนไขต่างๆ สามารถค้นหาได้ทั้งแบบระบุฟิลด์ที่ต้องการหรือค้นหาด้วยคีย์เวิร์ดในทุกฟิลด์",
      parameters: [
        { name: "keyword", type: "string", required: false, description: "ค้นหาจากทุกฟิลด์ (ชื่อ, บริษัท, โปรเจค, องค์กร, สินค้า, อีเมล, เบอร์โทร, ผู้ติดต่อ)" },
        { name: "name", type: "string", required: false, description: "ค้นหาจากชื่อลูกค้าเป้าหมาย (ไม่จำเป็นต้องกรอกทั้งหมด)" },
        { name: "projectName", type: "string", required: false, description: "ค้นหาจากชื่อโปรเจค (ไม่จำเป็นต้องกรอกทั้งหมด)" },
        { name: "company", type: "string", required: false, description: "ค้นหาจากชื่อบริษัทคู่ค้า (ไม่จำเป็นต้องกรอกทั้งหมด)" },
        { name: "endUserOrganization", type: "string", required: false, description: "ค้นหาจากชื่อองค์กรของลูกค้า (ไม่จำเป็นต้องกรอกทั้งหมด)" },
        { name: "product", type: "string", required: false, description: "ค้นหาจากสินค้าหรือบริการที่สนใจ (ไม่จำเป็นต้องกรอกทั้งหมด)" }
      ],
      responseExample: JSON.stringify({
        data: [
          {
            id: 1,
            name: "John Doe",
            company: "Softnix Technology",
            email: "john@example.com",
            phone: "0812345678",
            source: "Website",
            status: "New",
            product: "Data Analytics",
            product_register: "Softnix Data Platform",
            endUserContact: "Jane Smith",
            endUserOrganization: "PTT Global Chemical",
            projectName: "Data Analytics Platform",
            budget: "5,000,000",
            created_at: "2024-03-20T08:00:00Z",
            updated_at: "2024-03-20T08:00:00Z"
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }, null, 2),
      curlExample: `# ค้นหาด้วยคีย์เวิร์ด (ค้นหาทุกฟิลด์)
curl -X GET "http://localhost:5001/api/v1/leads/search?keyword=John" \\
  -H "X-API-Key: your_api_key_here"

# ค้นหาด้วยฟิลด์ที่ระบุ
curl -X GET "http://localhost:5001/api/v1/leads/search?name=John&company=Acme" \\
  -H "X-API-Key: your_api_key_here"

# ค้นหาทั้งหมด (ไม่ระบุพารามิเตอร์ใดๆ)
curl -X GET "http://localhost:5001/api/v1/leads/search" \\
  -H "X-API-Key: your_api_key_here"`,
      jsExample: `// ตัวอย่างการค้นหาด้วยคีย์เวิร์ด
const searchByKeyword = async (keyword) => {
  const apiKey = "your_api_key_here";
  const url = new URL("http://localhost:5001/api/v1/leads/search");
  url.searchParams.append("keyword", keyword);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-API-Key": apiKey }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};

// ตัวอย่างการค้นหาด้วยฟิลด์ที่ระบุ
const searchByFields = async (name, company) => {
  const apiKey = "your_api_key_here";
  const url = new URL("http://localhost:5001/api/v1/leads/search");
  
  if (name) url.searchParams.append("name", name);
  if (company) url.searchParams.append("company", company);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-API-Key": apiKey }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};

// ตัวอย่างการดึงข้อมูลทั้งหมด
const getAllLeads = async () => {
  const apiKey = "your_api_key_here";
  const url = "http://localhost:5001/api/v1/leads/search";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-API-Key": apiKey }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};`
    },
    {
      id: "create-lead",
      name: "เพิ่มข้อมูลลูกค้าเป้าหมาย",
      method: "POST",
      endpoint: "/api/v1/leads",
      description: "เพิ่มข้อมูลลูกค้าเป้าหมายใหม่เข้าระบบ",
      parameters: [
        { name: "name", type: "string", required: true, description: "ชื่อลูกค้าเป้าหมาย" },
        { name: "company", type: "string", required: true, description: "ชื่อบริษัทคู่ค้า" },
        { name: "email", type: "string", required: true, description: "อีเมลติดต่อ" },
        { name: "phone", type: "string", required: true, description: "เบอร์โทรศัพท์" },
        { name: "source", type: "string", required: true, description: "แหล่งที่มา (Website, Youtube, Search, Referral, Social Media, Event, Other)" },
        { name: "status", type: "string", required: false, description: "สถานะ (New, Qualified, In Progress, Converted, Lost) - ค่าเริ่มต้น: New" },
        { name: "product", type: "string", required: false, description: "สินค้าหรือบริการที่สนใจ" },
        { name: "productRegister", type: "string", required: false, description: "สินค้าหรือบริการที่ลงทะเบียน (Softnix Logger, Softnix Gen AI, Softnix Data Platform, Softnix PDPA, ZABBIX, Other)" },
        { name: "endUserContact", type: "string", required: false, description: "ผู้ติดต่อฝั่งลูกค้า" },
        { name: "endUserOrganization", type: "string", required: false, description: "องค์กรของลูกค้า" },
        { name: "projectName", type: "string", required: false, description: "ชื่อโปรเจค" },
        { name: "budget", type: "string", required: false, description: "งบประมาณ" },
        { name: "partnerContact", type: "string", required: false, description: "ผู้ติดต่อพาร์ทเนอร์" },
      ],
      requestExample: JSON.stringify({
        name: "John Doe",
        company: "Softnix Technology",
        email: "john@example.com",
        phone: "0812345678",
        source: "Website",
        status: "New",
        product: "Data Analytics",
        productRegister: "Softnix Data Platform",
        endUserContact: "Jane Smith",
        endUserOrganization: "PTT Global Chemical",
        projectName: "Data Analytics Platform",
        budget: "5,000,000",
        partnerContact: "คุณพาร์ทเนอร์"
      }, null, 2),
      responseExample: JSON.stringify({
        lead: {
          id: 12,
          name: "John Doe",
          company: "Softnix Technology",
          email: "john@example.com",
          phone: "0812345678",
          source: "Website",
          status: "New",
          product: "Data Analytics",
          productRegister: "Softnix Data Platform",
          endUserContact: "Jane Smith",
          endUserOrganization: "PTT Global Chemical",
          projectName: "Data Analytics Platform",
          budget: "5,000,000",
          createdAt: 1748316094940,
          updatedAt: 1748316094940,
          createdBy: "API User",
          createdById: 2,
          partnerContact: "คุณพาร์ทเนอร์"
        }
      }, null, 2),
      curlExample: `curl -X POST "http://localhost:5001/api/v1/leads" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "company": "Tech Solutions Inc.",
    "email": "jane.smith@example.com",
    "phone": "+1 (555) 987-6543",
    "source": "Referral",
    "status": "New",
    "product": "Cloud Storage Platform",
    "productRegister": "Softnix Data Platform",
    "endUserContact": "Robert Johnson",
    "endUserOrganization": "Global Retail Inc.",
    "projectName": "Data Storage Expansion",
    "budget": "฿4,500,000",
    "partnerContact": "คุณพาร์ทเนอร์"
  }'`,
      jsExample: `// Using fetch
const apiKey = "your_api_key_here";
const url = "http://localhost:5001/api/v1/leads";
const data = {
  name: "Jane Smith",
  company: "Tech Solutions Inc.",
  email: "jane.smith@example.com",
  phone: "+1 (555) 987-6543",
  source: "Referral",
  status: "New",
  product: "Cloud Storage Platform",
  productRegister: "Softnix Data Platform",
  endUserContact: "Robert Johnson",
  endUserOrganization: "Global Retail Inc.",
  projectName: "Data Storage Expansion",
  budget: "฿4,500,000",
  partnerContact: "คุณพาร์ทเนอร์"
};

fetch(url, {
  method: "POST",
  headers: {
    "X-API-Key": apiKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`
    },
    {
      id: "update-lead",
      name: "แก้ไขข้อมูลลูกค้าเป้าหมาย",
      method: "PATCH",
      endpoint: "/api/v1/leads/:id",
      description: "แก้ไขข้อมูลลูกค้าเป้าหมายที่มีอยู่ในระบบ",
      parameters: [
        { name: "id", type: "number", required: true, description: "ID ของลูกค้าเป้าหมายที่ต้องการแก้ไข (ส่งในพาธของ URL)" },
        { name: "name", type: "string", required: false, description: "ชื่อลูกค้าเป้าหมาย" },
        { name: "company", type: "string", required: false, description: "ชื่อบริษัทคู่ค้า" },
        { name: "email", type: "string", required: false, description: "อีเมลติดต่อ" },
        { name: "phone", type: "string", required: false, description: "เบอร์โทรศัพท์" },
        { name: "source", type: "string", required: false, description: "แหล่งที่มา (Website, Youtube, Search, Referral, Social Media, Event, Other)" },
        { name: "status", type: "string", required: false, description: "สถานะ (New, Qualified, In Progress, Converted, Lost)" },
        { name: "product", type: "string", required: false, description: "สินค้าหรือบริการที่สนใจ" },
        { name: "productRegister", type: "string", required: false, description: "สินค้าหรือบริการที่ลงทะเบียน" },
        { name: "endUserContact", type: "string", required: false, description: "ผู้ติดต่อฝั่งลูกค้า" },
        { name: "endUserOrganization", type: "string", required: false, description: "องค์กรของลูกค้า" },
        { name: "projectName", type: "string", required: false, description: "ชื่อโปรเจค" },
        { name: "budget", type: "string", required: false, description: "งบประมาณ" },
        { name: "partnerContact", type: "string", required: false, description: "ผู้ติดต่อพาร์ทเนอร์" },
      ],
      requestExample: JSON.stringify({
        status: "Qualified",
        budget: "฿5,200,000",
        phone: "+1 (555) 987-6544"
      }, null, 2),
      responseExample: JSON.stringify({
        lead: {
          id: 12,
          name: "Jane Smith",
          company: "Tech Solutions Inc.",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6544",
          source: "Referral",
          status: "Qualified",
          product: "Cloud Storage Platform",
          endUserContact: "Robert Johnson",
          endUserOrganization: "Global Retail Inc.",
          projectName: "Data Storage Expansion",
          budget: "฿5,200,000",
          createdAt: "2025-04-11T14:30:00Z",
          updatedAt: "2025-04-11T15:45:00Z",
          createdBy: "API User",
          createdById: 1
        }
      }, null, 2),
      curlExample: `curl -X PATCH "http://localhost:5001/api/v1/leads/12" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "Qualified",
    "budget": "฿5,200,000",
    "phone": "+1 (555) 987-6544"
  }'`,
      jsExample: `// Using fetch
const apiKey = "your_api_key_here";
const leadId = 12;
const url = \`http://localhost:5001/api/v1/leads/\${leadId}\`;
const data = {
  status: "Qualified",
  budget: "฿5,200,000",
  phone: "+1 (555) 987-6544"
};

fetch(url, {
  method: "PATCH",
  headers: {
    "X-API-Key": apiKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`
    }
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold mb-2">API Documentation</h1>
        <p className="text-gray-500">เอกสารอ้างอิงการใช้งาน API สำหรับนักพัฒนา</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="authentication">การยืนยันตัวตน</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="errors">การจัดการข้อผิดพลาด</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>ภาพรวมของ API</CardTitle>
              <CardDescription>
                ข้อมูลพื้นฐานเกี่ยวกับ API สำหรับระบบจัดการลูกค้าเป้าหมาย
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">เกี่ยวกับ API</h3>
                <p className="text-gray-600">
                  API ของระบบจัดการลูกค้าเป้าหมายให้บริการเข้าถึงข้อมูลและฟังก์ชันการทำงานของระบบผ่าน REST API
                  ซึ่งช่วยให้นักพัฒนาสามารถเชื่อมต่อระบบภายนอกเข้ากับระบบจัดการลูกค้าเป้าหมายได้อย่างง่ายดาย
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-sm text-pink-600">http://localhost:5001</code>
                </div>
                <p className="mt-2 text-gray-600">
                  URL หลักสำหรับเรียกใช้งาน API ทั้งหมด ในการใช้งานจริงให้แทนที่ด้วย URL ของเซิร์ฟเวอร์ของคุณ
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">รูปแบบข้อมูล</h3>
                <p className="text-gray-600">
                  API ใช้รูปแบบข้อมูล JSON (JavaScript Object Notation) ในการรับและส่งข้อมูลทั้งหมด
                  ดังนั้นเมื่อส่งข้อมูลไปยัง API ให้ตั้งค่า header <code>Content-Type: application/json</code>
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">เวอร์ชันของ API</h3>
                <p className="text-gray-600">
                  เวอร์ชันปัจจุบันของ API คือ v1 ซึ่งจะระบุในพาธของ URL เช่น <code>/api/v1/leads</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>การยืนยันตัวตน</CardTitle>
              <CardDescription>
                วิธีการยืนยันตัวตนเพื่อเข้าถึง API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Key Authentication</h3>
                <p className="text-gray-600">
                  ทุก API endpoints ต้องการการยืนยันตัวตนด้วย API Key โดยคุณสามารถสร้าง API Key ได้จากหน้า API Management
                  ในระบบจัดการลูกค้าเป้าหมาย
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">การส่ง API Key</h3>
                <p className="text-gray-600 mb-2">
                  ส่ง API Key ในรูปแบบของ HTTP header ดังนี้:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-sm text-pink-600">X-API-Key: your_api_key_here</code>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <h4 className="font-semibold text-yellow-800">คำเตือนด้านความปลอดภัย</h4>
                <p className="text-yellow-700 text-sm">
                  เก็บรักษา API Key ไว้อย่างปลอดภัย อย่าแชร์กับบุคคลที่ไม่เกี่ยวข้อง
                  หากคุณสงสัยว่า API Key ของคุณรั่วไหล ให้ลบและสร้างใหม่ทันที
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">ตัวอย่างการยืนยันตัวตน</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">ตัวอย่าง request ด้วย cURL:</p>
                  <div className="bg-gray-100 p-3 rounded-md relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode(`curl -X GET "http://saletrack.softnix.co.th:5001/api/v1/leads/search" \\
  -H "X-API-Key: your_api_key_here"`)}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <pre className="text-sm whitespace-pre-wrap">
{`curl -X GET "http://localhost:5001/api/v1/leads/search" \\
  -H "X-API-Key: your_api_key_here"`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                รายละเอียดของ Endpoints ทั้งหมดที่มีให้บริการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {apiEndpoints.map((endpoint) => (
                  <AccordionItem key={endpoint.id} value={endpoint.id}>
                    <AccordionTrigger>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.method === "GET" 
                            ? "bg-blue-100 text-blue-800" 
                            : endpoint.method === "POST" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="font-medium">{endpoint.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-2">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Endpoint</h4>
                          <div className="bg-gray-100 p-3 rounded-md">
                            <code className="text-sm text-pink-600">
                              {endpoint.method} {endpoint.endpoint}
                            </code>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">รายละเอียด</h4>
                          <p className="text-gray-600">{endpoint.description}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">พารามิเตอร์</h4>
                          <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำเป็น</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {endpoint.parameters.map((param, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{param.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                                    <td className="px-4 py-2 text-sm">
                                      {param.required ? (
                                        <span className="text-red-600">ต้องระบุ</span>
                                      ) : (
                                        <span className="text-gray-500">ไม่บังคับ</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {endpoint.requestExample && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">ตัวอย่างข้อมูลที่ส่ง</h4>
                            <div className="bg-gray-100 p-3 rounded-md relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleCopyCode(endpoint.requestExample)}
                              >
                                <Code className="h-4 w-4" />
                              </Button>
                              <pre className="text-sm overflow-x-auto text-pink-600">{endpoint.requestExample}</pre>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">ตัวอย่างผลลัพธ์</h4>
                          <div className="bg-gray-100 p-3 rounded-md relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => handleCopyCode(endpoint.responseExample)}
                            >
                              <Code className="h-4 w-4" />
                            </Button>
                            <pre className="text-sm overflow-x-auto text-pink-600">{endpoint.responseExample}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">ตัวอย่างโค้ด</h4>
                          <Tabs defaultValue="curl">
                            <TabsList className="mb-4">
                              <TabsTrigger value="curl">cURL</TabsTrigger>
                              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            </TabsList>
                            <TabsContent value="curl">
                              <div className="bg-gray-100 p-3 rounded-md relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => handleCopyCode(endpoint.curlExample)}
                                >
                                  <Code className="h-4 w-4" />
                                </Button>
                                <pre className="text-sm whitespace-pre-wrap">{endpoint.curlExample}</pre>
                              </div>
                            </TabsContent>
                            <TabsContent value="javascript">
                              <div className="bg-gray-100 p-3 rounded-md relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => handleCopyCode(endpoint.jsExample)}
                                >
                                  <Code className="h-4 w-4" />
                                </Button>
                                <pre className="text-sm whitespace-pre-wrap">{endpoint.jsExample}</pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>การจัดการข้อผิดพลาด</CardTitle>
              <CardDescription>
                ข้อมูลเกี่ยวกับรหัสข้อผิดพลาดและข้อความที่อาจเกิดขึ้น
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">รูปแบบข้อผิดพลาด</h3>
                <p className="text-gray-600 mb-4">
                  เมื่อเกิดข้อผิดพลาด API จะตอบกลับด้วยรหัส HTTP ที่เหมาะสมและข้อความ JSON ที่มีรายละเอียดของข้อผิดพลาด
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-sm overflow-x-auto text-pink-600">{`{
  "message": "คำอธิบายข้อผิดพลาด",
  "error": "รายละเอียดข้อผิดพลาด (ถ้ามี)"
}`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">รหัสข้อผิดพลาด HTTP</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">400</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Bad Request</td>
                        <td className="px-4 py-2 text-sm text-gray-500">คำขอไม่ถูกต้อง เช่น พารามิเตอร์ไม่ครบหรือรูปแบบไม่ถูกต้อง</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">401</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Unauthorized</td>
                        <td className="px-4 py-2 text-sm text-gray-500">ไม่มีการยืนยันตัวตนหรือ API Key ไม่ถูกต้อง</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">403</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Forbidden</td>
                        <td className="px-4 py-2 text-sm text-gray-500">ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">404</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Not Found</td>
                        <td className="px-4 py-2 text-sm text-gray-500">ไม่พบทรัพยากรที่ระบุ</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">429</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Too Many Requests</td>
                        <td className="px-4 py-2 text-sm text-gray-500">มีการเรียกใช้ API มากเกินไปในช่วงเวลาที่กำหนด</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">500</td>
                        <td className="px-4 py-2 text-sm text-gray-500">Internal Server Error</td>
                        <td className="px-4 py-2 text-sm text-gray-500">เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">ข้อผิดพลาดจากการตรวจสอบข้อมูล</h3>
                <p className="text-gray-600 mb-4">
                  เมื่อข้อมูลที่ส่งไปไม่ผ่านการตรวจสอบความถูกต้อง API จะส่งข้อผิดพลาดแบบละเอียดดังนี้
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-sm overflow-x-auto text-pink-600">{`{
  "message": "Validation error",
  "errors": [
    {
      "path": "name",
      "message": "ต้องระบุชื่อลูกค้าเป้าหมาย"
    },
    {
      "path": "email",
      "message": "รูปแบบอีเมลไม่ถูกต้อง"
    }
  ]
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ApiDocumentation;