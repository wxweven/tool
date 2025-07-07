import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, Trash2Icon, EditIcon, BellRing, PillIcon, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from '@/components/ui/textarea';

const timeSlots = ["早上", "中午", "晚上", "睡前"];

const MedicineReminder = () => {
    const { toast } = useToast();
    const [medicines, setMedicines] = useState([]);
    const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
    const [currentMedicine, setCurrentMedicine] = useState(null);
    const [formState, setFormState] = useState({
        name: '',
        dosage: '',
        unit: '片',
        times: ['早上'],
        meal: '餐后',
        mealTimeOffset: '30',
        duration: '',
        startDate: new Date().toISOString().split('T')[0],
        remarks: '',
    });
    const [dailyPlan, setDailyPlan] = useState([]);
    const [checkIns, setCheckIns] = useState({});

    useEffect(() => {
        const savedMedicines = localStorage.getItem('medicines');
        if (savedMedicines) {
            setMedicines(JSON.parse(savedMedicines));
        }
        const savedCheckIns = localStorage.getItem('medicine_checkins');
        if (savedCheckIns) {
            setCheckIns(JSON.parse(savedCheckIns));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('medicines', JSON.stringify(medicines));
        generateDailyPlan();
    }, [medicines]);

    useEffect(() => {
        localStorage.setItem('medicine_checkins', JSON.stringify(checkIns));
    }, [checkIns]);

    useEffect(() => {
        generateDailyPlan();
    }, [medicines]);
    
    const generateDailyPlan = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const plan = [];

        medicines.forEach(med => {
            const startDate = new Date(med.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + parseInt(med.duration, 10));

            if (today >= startDate && today < endDate) {
                med.times.forEach(time => {
                    plan.push({ ...med, doseTime: time });
                });
            }
        });
        
        const groupedPlan = timeSlots.reduce((acc, slot) => {
            const medsForSlot = plan.filter(p => p.doseTime === slot);
            if (medsForSlot.length > 0) {
                acc[slot] = medsForSlot;
            }
            return acc;
        }, {});
        setDailyPlan(groupedPlan);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (time) => {
        setFormState(prev => {
            const newTimes = prev.times.includes(time)
                ? prev.times.filter(t => t !== time)
                : [...prev.times, time];
            return { ...prev, times: newTimes };
        });
    };

    const handleSelectChange = (name, value) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormState({
            name: '',
            dosage: '',
            unit: '片',
            times: ['早上'],
            meal: '餐后',
            mealTimeOffset: '30',
            duration: '',
            startDate: new Date().toISOString().split('T')[0],
            remarks: '',
        });
        setCurrentMedicine(null);
    };

    const handleAddOrUpdateMedicine = () => {
        if (!formState.name || !formState.dosage || !formState.duration || formState.times.length === 0) {
            toast({
                title: "错误",
                description: "请填写所有必填项，并至少选择一个用药时间。",
                variant: "destructive",
            });
            return;
        }

        if (currentMedicine) {
            setMedicines(medicines.map(med => med.id === currentMedicine.id ? { ...formState, id: med.id } : med));
            toast({ title: "成功", description: "药品信息已更新。" });
        } else {
            setMedicines([...medicines, { ...formState, id: Date.now() }]);
            toast({ title: "成功", description: "药品已添加。" });
        }
        setAddEditDialogOpen(false);
        resetForm();
    };

    const openEditDialog = (medicine) => {
        setCurrentMedicine(medicine);
        setFormState(medicine);
        setAddEditDialogOpen(true);
    };

    const openAddDialog = () => {
        resetForm();
        setAddEditDialogOpen(true);
    };
    
    const handleDeleteMedicine = (id) => {
        setMedicines(medicines.filter(med => med.id !== id));
        toast({ title: "成功", description: "药品已删除。" });
    };

    const handleCheckIn = (medId, doseTime) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const key = `${todayStr}-${medId}-${doseTime}`;
        setCheckIns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "早上好";
        if (hour < 18) return "下午好";
        return "晚上好";
    };
    
    const getTimeOfDay = (index) => {
        const total = parseInt(dailyPlan.filter(p => p.id === dailyPlan[index].id).length, 10);
        if (total === 1) return "每日";
        if (total === 2) return ["早上", "晚上"][index];
        if (total === 3) return ["早上", "中午", "晚上"][index];
        return `第 ${index + 1} 次`;
    };

    const getMealInfo = (med) => {
        if (med.meal === '餐前' || med.meal === '餐后') {
            return `${med.meal} ${med.mealTimeOffset || ''} 分钟`;
        }
        return med.meal;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="container mx-auto p-4 text-base">
            <h1 className="text-3xl font-bold mb-4">用药提醒</h1>

            <Tabs defaultValue="plan">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="plan"><CalendarDays className="mr-2 h-4 w-4" />今日用药计划</TabsTrigger>
                    <TabsTrigger value="medicines"><PillIcon className="mr-2 h-4 w-4" />我的药品</TabsTrigger>
                </TabsList>
                <TabsContent value="plan">
                    <Card>
                        <CardHeader>
                            <CardTitle>{getGreeting()}！这是您今天的用药计划：</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.keys(dailyPlan).length === 0 ? (
                                <p className="text-center text-gray-500 py-8">今天没有用药计划哦，去"我的药品"添加吧！</p>
                            ) : (
                                Object.entries(dailyPlan).map(([slot, meds]) => (
                                    <div key={slot}>
                                        <h3 className="font-semibold text-lg mb-2 border-b pb-1">{slot}</h3>
                                        <div className="space-y-4">
                                            {meds.map((med, index) => {
                                                const key = `${todayStr}-${med.id}-${med.doseTime}`;
                                                const isChecked = !!checkIns[key];
                                                return (
                                                    <div key={index} className={`flex items-start justify-between p-4 rounded-lg ${isChecked ? 'bg-green-100' : 'bg-white'}`}>
                                                        <div className="flex items-start">
                                                            <Checkbox id={key} checked={isChecked} onCheckedChange={() => handleCheckIn(med.id, med.doseTime)} className="mr-4 mt-1" />
                                                            <div>
                                                                <p className={`text-lg font-semibold ${isChecked ? 'line-through text-gray-500' : ''}`}>{med.name}</p>
                                                                <p className="text-gray-600">
                                                                    服用 <span className="font-bold text-blue-500">{med.dosage} {med.unit}</span> - {getMealInfo(med)}
                                                                </p>
                                                                {med.remarks && <p className="font-bold text-red-600 mt-1">备注: {med.remarks}</p>}
                                                            </div>
                                                        </div>
                                                        <CheckCircle2 className={`h-6 w-6 ${isChecked ? 'text-green-500' : 'text-gray-300'}`} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="medicines">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>我的药品列表</CardTitle>
                            <Button onClick={openAddDialog}><PlusIcon className="mr-2 h-4 w-4" /> 添加药品</Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {medicines.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">暂无药品，请点击右上角添加。</p>
                            ) : (
                                medicines.map(med => (
                                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="text-lg font-semibold">{med.name}</p>
                                            <p className="text-gray-600">
                                                {med.times.join('、')}, <span className="font-bold text-blue-500">{med.dosage}{med.unit}/次</span>, 共{med.duration}天
                                            </p>
                                            {med.remarks && <p className="text-sm text-red-500">备注: {med.remarks}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(med)}><EditIcon className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMedicine(med.id)}><Trash2Icon className="h-4 w-4 text-blue-500" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">{currentMedicine ? '编辑药品' : '添加新药品'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-base">药品名称*</Label>
                            <Input id="name" name="name" value={formState.name} onChange={handleFormChange} className="col-span-3 text-base" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dosage" className="text-right text-base">服用量*</Label>
                            <Input id="dosage" name="dosage" type="number" value={formState.dosage} onChange={handleFormChange} className="col-span-2 text-base" />
                            <Select name="unit" value={formState.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                                <SelectTrigger className="col-span-1 text-base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="片">片</SelectItem>
                                    <SelectItem value="粒">粒</SelectItem>
                                    <SelectItem value="袋">袋</SelectItem>
                                    <SelectItem value="瓶">瓶</SelectItem>
                                    <SelectItem value="支">支</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-base">用药时间*</Label>
                            <div className="col-span-3 flex items-center gap-4">
                                {timeSlots.map(time => (
                                    <div key={time} className="flex items-center">
                                        <Checkbox
                                            id={`time-${time}`}
                                            checked={formState.times.includes(time)}
                                            onCheckedChange={() => handleCheckboxChange(time)}
                                        />
                                        <Label htmlFor={`time-${time}`} className="ml-2 text-base">{time}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="meal" className="text-right text-base">服用时间</Label>
                             <Select name="meal" value={formState.meal} onValueChange={(value) => handleSelectChange('meal', value)}>
                                <SelectTrigger className="col-span-2 text-base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="餐前">餐前</SelectItem>
                                    <SelectItem value="餐后">餐后</SelectItem>
                                    <SelectItem value="随餐">随餐</SelectItem>
                                    <SelectItem value="任意时间">任意时间</SelectItem>
                                </SelectContent>
                            </Select>
                            {(formState.meal === '餐前' || formState.meal === '餐后') && (
                                <div className="col-span-1 flex items-center gap-2">
                                    <Input id="mealTimeOffset" name="mealTimeOffset" type="number" value={formState.mealTimeOffset} onChange={handleFormChange} placeholder="分钟" className="text-base" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right text-base">服用天数*</Label>
                            <Input id="duration" name="duration" type="number" value={formState.duration} onChange={handleFormChange} className="col-span-3 text-base" placeholder="例如: 7" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right text-base">开始日期</Label>
                            <Input id="startDate" name="startDate" type="date" value={formState.startDate} onChange={handleFormChange} className="col-span-3 text-base" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="remarks" className="text-right text-base">备注</Label>
                            <Textarea id="remarks" name="remarks" value={formState.remarks} onChange={handleFormChange} className="col-span-3 text-base" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddEditDialogOpen(false)}>取消</Button>
                        <Button onClick={handleAddOrUpdateMedicine}>{currentMedicine ? '保存更新' : '确认添加'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MedicineReminder; 