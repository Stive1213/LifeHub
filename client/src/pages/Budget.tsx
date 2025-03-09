import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@/components/ui';
import { 
  Plus, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

// Helper to format cents to dollars
const formatAmount = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};

export default function Budget() {
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isIncome: false
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: { 
      amount: number; 
      description: string; 
      category?: string; 
      date: Date;
      isIncome: boolean; 
    }) => {
      return await apiRequest('POST', '/api/transactions', transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setNewTransaction({
        amount: '',
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        isIncome: false
      });
      setIsAddTransactionDialogOpen(false);
    }
  });

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.description) {
      const amountInCents = Math.round(parseFloat(newTransaction.amount) * 100);
      
      createTransactionMutation.mutate({
        amount: amountInCents,
        description: newTransaction.description,
        category: newTransaction.category || undefined,
        date: new Date(newTransaction.date),
        isIncome: newTransaction.isIncome
      });
    }
  };

  // Calculate budget metrics
  const totalIncome = transactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;
  
  // Group expenses by category for the pie chart
  const expensesByCategory = transactions
    .filter(t => !t.isIncome)
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  
  const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare data for the income vs expenses chart (by month)
  const transactionsByMonth = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = format(date, 'MMM yyyy');
    
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
    }
    
    if (transaction.isIncome) {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);
  
  const lineChartData = Object.values(transactionsByMonth).map(data => ({
    ...data,
    income: data.income / 100, // Convert to dollars for better display
    expenses: data.expenses / 100
  }));

  // Category options
  const categories = [
    'Housing', 'Food', 'Transport', 'Entertainment', 'Utilities', 
    'Healthcare', 'Education', 'Shopping', 'Other'
  ];

  // Filter transactions for the transactions list
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by category
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Filter by date range
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);
    
    if (dateRange === 'thisMonth' && transactionDate < thisMonth) {
      return false;
    } else if (dateRange === 'lastMonth' && (transactionDate < lastMonth || transactionDate >= thisMonth)) {
      return false;
    } else if (dateRange === 'thisYear' && transactionDate < thisYear) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Budget</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Track your income and expenses
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddTransactionDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">
              {formatAmount(netBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-sm",
              netBalance >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {netBalance >= 0 ? "You're doing great!" : "Spending exceeds income"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-2xl text-green-500">
              {formatAmount(totalIncome)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Total income from all sources
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-500">
              {formatAmount(totalExpenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Total spending across all categories
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={1}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatAmount(Number(value))} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    No expense data to display
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Income vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lineChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    No data to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <div className="flex flex-wrap gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                    >
                      <div className="flex items-start">
                        <div className={cn(
                          "rounded-full p-2 mr-3",
                          transaction.isIncome 
                            ? "bg-green-100 dark:bg-green-900/20 text-green-500"
                            : "bg-red-100 dark:bg-red-900/20 text-red-500"
                        )}>
                          {transaction.isIncome 
                            ? <ArrowUpRight className="h-5 w-5" />
                            : <ArrowDownRight className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-2">
                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                            {transaction.category && (
                              <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs">
                                {transaction.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "font-semibold",
                        transaction.isIncome ? "text-green-500" : "text-red-500"
                      )}>
                        {transaction.isIncome ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No transactions found for the selected filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pieChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value / 100}`} />
                        <Tooltip formatter={(value) => formatAmount(Number(value))} />
                        <Bar dataKey="value" fill="#4F46E5">
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    No expense data to display
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Income Breakdown</h4>
                    <div className="space-y-2">
                      {transactions
                        .filter(t => t.isIncome)
                        .reduce((acc, transaction) => {
                          const category = transaction.category || 'Other';
                          if (!acc[category]) {
                            acc[category] = 0;
                          }
                          acc[category] += transaction.amount;
                          return acc;
                        }, {} as Record<string, number>)
                        .map((amount, category) => (
                          <div key={category} className="flex justify-between items-center">
                            <span>{category}</span>
                            <span className="font-medium text-green-500">{formatAmount(amount)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Top Expenses</h4>
                    <div className="space-y-2">
                      {Object.entries(expensesByCategory)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span>{category}</span>
                            <span className="font-medium text-red-500">{formatAmount(amount)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="is-income">Income</Label>
              <Switch 
                id="is-income" 
                checked={newTransaction.isIncome}
                onCheckedChange={(checked) => 
                  setNewTransaction({ ...newTransaction, isIncome: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">
                {newTransaction.isIncome ? 'Income' : 'Expense'} Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input 
                  id="transaction-amount" 
                  value={newTransaction.amount} 
                  onChange={(e) => {
                    // Only allow numbers and decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setNewTransaction({ ...newTransaction, amount: value });
                  }}
                  placeholder="0.00"
                  className="pl-7"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-description">Description</Label>
              <Input 
                id="transaction-description" 
                value={newTransaction.description} 
                onChange={(e) => 
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
                placeholder="Enter transaction description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-category">Category</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) => 
                  setNewTransaction({ ...newTransaction, category: value })
                }
              >
                <SelectTrigger id="transaction-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Date</Label>
              <Input
                id="transaction-date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => 
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTransaction} 
              disabled={!newTransaction.amount || !newTransaction.description}
            >
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
