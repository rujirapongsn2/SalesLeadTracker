import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Copy, Key } from "lucide-react";

// Type definitions
type ApiKey = {
  id: number;
  key: string;
  name: string;
  userId: number;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
};

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
};

export const ApiManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch API keys
  const {
    data: apiKeysData,
    isLoading: isLoadingApiKeys,
    error: apiKeysError,
  } = useQuery<{ apiKeys: ApiKey[] }>({
    queryKey: ["/api/api-keys"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/api-keys");
      return response.json();
    },
  });

  // Fetch users for selection
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  // Function to get full API key
  const getFullApiKey = async (id: number) => {
    try {
      const response = await apiRequest("GET", `/api/api-keys/${id}/full`);
      const data = await response.json();
      return data.apiKey.key;
    } catch (error) {
      console.error("Error fetching full API key:", error);
      throw error;
    }
  };

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { name: string; userId: number }) => {
      const response = await apiRequest("POST", "/api/api-keys", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setCreatedApiKey(data.apiKey.key);
      toast({
        title: "การสร้าง API Key สำเร็จ",
        description: "API Key ใหม่ถูกสร้างขึ้นแล้ว โปรดบันทึกไว้เนื่องจากจะไม่แสดงอีกครั้ง",
      });
    },
    onError: (error) => {
      toast({
        title: "การสร้าง API Key ล้มเหลว",
        description: (error as Error).message || "เกิดข้อผิดพลาดในการสร้าง API Key",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "ลบ API Key สำเร็จ",
        description: "API Key ถูกลบเรียบร้อยแล้ว",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "การลบ API Key ล้มเหลว",
        description: (error as Error).message || "เกิดข้อผิดพลาดในการลบ API Key",
        variant: "destructive",
      });
    },
  });

  // Handle creating a new API key
  const handleCreateApiKey = () => {
    if (!newKeyName || !selectedUserId) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อ API Key และเลือกผู้ใช้งาน",
        variant: "destructive",
      });
      return;
    }

    createApiKeyMutation.mutate({
      name: newKeyName,
      userId: selectedUserId,
    });
  };

  // Handle copying API key to clipboard
  const handleCopyApiKey = async (id: number | string) => {
    try {
      const fullKey = await getFullApiKey(typeof id === 'string' ? parseInt(id) : id);
      await navigator.clipboard.writeText(fullKey);
      toast({
        title: "คัดลอก API Key สำเร็จ",
        description: "API Key ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    } catch (error) {
      toast({
        title: "การคัดลอก API Key ล้มเหลว",
        description: "ไม่สามารถคัดลอก API Key ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  // Reset form when dialog is closed
  const handleDialogClose = () => {
    setNewKeyName("");
    setSelectedUserId(null);
    setCreatedApiKey(null);
    setIsNewKeyDialogOpen(false);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "ไม่เคยใช้งาน";
    return new Date(dateString).toLocaleString();
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteKeyId) {
      deleteApiKeyMutation.mutate(deleteKeyId);
    }
  };

  if (isLoadingApiKeys || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (apiKeysError || usersError) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
        <p className="text-gray-500">
          ไม่สามารถโหลดข้อมูล API Keys หรือผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold mb-2">API Management</h1>
        <p className="text-gray-500">จัดการ API Keys สำหรับการเข้าถึง API ภายนอก</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>จัดการ API Keys สำหรับเข้าถึง API ของระบบจากภายนอก</CardDescription>
          </div>
          <Button
            onClick={() => setIsNewKeyDialogOpen(true)}
            className="bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้าง API Key ใหม่
          </Button>
        </CardHeader>
        <CardContent>
          {apiKeysData?.apiKeys && apiKeysData.apiKeys.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ API Key</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>ผู้ใช้งาน</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead>ใช้งานล่าสุด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeysData.apiKeys.map((apiKey) => {
                    // Find user name
                    const user = usersData?.users.find((u) => u.id === apiKey.userId);
                    
                    return (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell className="max-w-md">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate">{apiKey.key}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => handleCopyApiKey(apiKey.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{user?.name || `User ID: ${apiKey.userId}`}</TableCell>
                        <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                        <TableCell>{formatDate(apiKey.lastUsed)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              apiKey.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {apiKey.isActive ? "ใช้งานได้" : "ปิดใช้งาน"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteKeyId(apiKey.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <Key className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">ไม่พบ API Keys</h3>
              <p className="text-gray-500 mb-4">คุณยังไม่มี API Keys สร้างใหม่เพื่อเข้าถึง API</p>
              <Button
                onClick={() => setIsNewKeyDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                สร้าง API Key ใหม่
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={isNewKeyDialogOpen} onOpenChange={setIsNewKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้าง API Key ใหม่</DialogTitle>
            <DialogDescription>
              สร้าง API Key เพื่อเข้าถึง API ของระบบจากภายนอก
            </DialogDescription>
          </DialogHeader>

          {createdApiKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="font-semibold text-green-800 mb-2">API Key สร้างสำเร็จ!</p>
                <p className="text-green-700 text-sm mb-4">
                  โปรดบันทึก API Key นี้เก็บไว้ เนื่องจากจะไม่แสดงอีกครั้ง
                </p>
                <div className="relative">
                  <Input
                    readOnly
                    value={createdApiKey}
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0"
                    onClick={() => {
                      if (createdApiKey) {
                        navigator.clipboard.writeText(createdApiKey)
                          .then(() => {
                            toast({
                              title: "คัดลอก API Key สำเร็จ",
                              description: "API Key ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "การคัดลอก API Key ล้มเหลว",
                              description: "ไม่สามารถคัดลอก API Key ได้ กรุณาลองใหม่อีกครั้ง",
                              variant: "destructive",
                            });
                          });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={handleDialogClose}>
                ปิด
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">ชื่อ API Key</Label>
                  <Input
                    id="api-key-name"
                    placeholder="เช่น Sales App API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-id">เลือกผู้ใช้งาน</Label>
                  <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) => setSelectedUserId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกผู้ใช้งาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersData?.users?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={createApiKeyMutation.isPending}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleCreateApiKey}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500"
                  disabled={createApiKeyMutation.isPending}
                >
                  {createApiKeyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังสร้าง...
                    </>
                  ) : (
                    "สร้าง API Key"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ API Key</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบ API Key นี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              และแอปพลิเคชันใดๆ ที่ใช้ API Key นี้จะไม่สามารถเข้าถึง API ได้อีกต่อไป
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteApiKeyMutation.isPending}
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteApiKeyMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                "ลบ API Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApiManagement;