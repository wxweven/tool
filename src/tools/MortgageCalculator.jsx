import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(30);
  const [loanTermMonths, setLoanTermMonths] = useState(360);
  const [interestRate, setInterestRate] = useState(3.5);
  const [lprRate, setLprRate] = useState(3.5);
  const [additionalPoints, setAdditionalPoints] = useState(-0.3);
  const [paymentType, setPaymentType] = useState("equal-principal-interest");
  const [termType, setTermType] = useState("years");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [paymentSchedule, setPaymentSchedule] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // 年份选项
  const yearOptions = [5, 10, 15, 20, 25, 30];

  // 当LPR或加点变化时，自动计算利率
  useEffect(() => {
    setInterestRate(parseFloat((lprRate + additionalPoints).toFixed(3)));
  }, [lprRate, additionalPoints]);

  // 当年数变化时，自动计算月数
  useEffect(() => {
    if (termType === "years") {
      setLoanTermMonths(loanTerm * 12);
    }
  }, [loanTerm, termType]);

  // 计算等额本息每月还款
  const calculateEqualPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths) / 
                          (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    
    const totalPayment = monthlyPayment * loanTermMonths;
    const totalInterest = totalPayment - loanAmount;
    
    // 生成还款计划
    const schedule = [];
    let remainingPrincipal = loanAmount;
    
    for (let i = 1; i <= loanTermMonths; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingPrincipal -= principalPayment;
      
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal : 0
      });
    }
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule
    };
  };
  
  // 计算等额本金每月还款
  const calculateEqualPrincipal = () => {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPrincipal = loanAmount / loanTermMonths;
    
    // 生成还款计划
    const schedule = [];
    let remainingPrincipal = loanAmount;
    let totalPayment = 0;
    
    for (let i = 1; i <= loanTermMonths; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      remainingPrincipal -= monthlyPrincipal;
      const payment = monthlyPrincipal + interestPayment;
      totalPayment += payment;
      
      schedule.push({
        month: i,
        payment: payment,
        principal: monthlyPrincipal,
        interest: interestPayment,
        remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal : 0
      });
    }
    
    const totalInterest = totalPayment - loanAmount;
    
    return {
      monthlyPayment: schedule[0].payment, // 首月还款金额
      totalPayment,
      totalInterest,
      schedule
    };
  };
  
  const handleCalculate = () => {
    let result;
    
    if (paymentType === "equal-principal-interest") {
      result = calculateEqualPayment();
    } else {
      result = calculateEqualPrincipal();
    }
    
    setMonthlyPayment(result.monthlyPayment);
    setTotalPayment(result.totalPayment);
    setTotalInterest(result.totalInterest);
    setPaymentSchedule(result.schedule);
    setHasCalculated(true);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', { 
      style: 'currency', 
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="loan-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loan-info">贷款信息</TabsTrigger>
              <TabsTrigger value="payment-schedule" disabled={!hasCalculated}>还款计划</TabsTrigger>
            </TabsList>
            
            <TabsContent value="loan-info" className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="loan-amount">贷款金额 (元)</Label>
                    <Input
                      id="loan-amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>贷款期限</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <RadioGroup 
                        value={termType} 
                        onValueChange={setTermType}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="years" id="years" />
                          <Label htmlFor="years">按年</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="months" id="months" />
                          <Label htmlFor="months">按月</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {termType === "years" ? (
                      <div className="mt-2">
                        <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择年数" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year} 年
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Input
                          type="number"
                          value={loanTermMonths || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLoanTermMonths(value === "" ? "" : parseInt(value) || 0);
                          }}
                          placeholder="输入月数"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>利率设置 (年利率 %)</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="lpr-rate" className="text-sm">LPR (%)</Label>
                        <Input
                          id="lpr-rate"
                          type="number"
                          step="0.01"
                          value={lprRate}
                          onChange={(e) => setLprRate(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="additional-points" className="text-sm">加点 (%)</Label>
                        <Input
                          id="additional-points"
                          type="number"
                          step="0.01"
                          value={additionalPoints}
                          onChange={(e) => setAdditionalPoints(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-sm">最终年利率: {interestRate}%</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label>还款方式</Label>
                    <RadioGroup 
                      value={paymentType} 
                      onValueChange={setPaymentType}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="equal-principal-interest" id="equal-payment" />
                        <Label htmlFor="equal-payment">等额本息</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="equal-principal" id="equal-principal" />
                        <Label htmlFor="equal-principal">等额本金</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleCalculate} className="w-full">计算</Button>
              
              {hasCalculated && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">月供 (首月)</div>
                        <div className="text-2xl font-bold mt-1">{formatCurrency(monthlyPayment)}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">总还款</div>
                        <div className="text-2xl font-bold mt-1">{formatCurrency(totalPayment)}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">总利息</div>
                        <div className="text-2xl font-bold mt-1">{formatCurrency(totalInterest)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payment-schedule">
              {hasCalculated && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>期数</TableHead>
                        <TableHead>月供</TableHead>
                        <TableHead>本金</TableHead>
                        <TableHead>利息</TableHead>
                        <TableHead>剩余本金</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentSchedule.slice(0, 12).map((payment) => (
                        <TableRow key={payment.month}>
                          <TableCell>{payment.month}</TableCell>
                          <TableCell>{formatCurrency(payment.payment)}</TableCell>
                          <TableCell>{formatCurrency(payment.principal)}</TableCell>
                          <TableCell>{formatCurrency(payment.interest)}</TableCell>
                          <TableCell>{formatCurrency(payment.remainingPrincipal)}</TableCell>
                        </TableRow>
                      ))}
                      {paymentSchedule.length > 12 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            显示前12期，共{paymentSchedule.length}期
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MortgageCalculator; 