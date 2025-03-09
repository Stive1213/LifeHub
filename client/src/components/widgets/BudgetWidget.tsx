import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, DollarSign, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Transaction } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BudgetWidget() {
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: '',
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
      isIncome: boolean; 
    }) => {
      return await apiRequest('POST', '/api/transactions', {
        ...transaction,
        date: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setNewTransaction({
        amount: '',
        description: '',
        category: '',
        isIncome: false
      });
      setIsAddTransactionDialogOpen(false);
    }
  });

  // Calculate budget metrics
  const monthlyBudget = 250000; // $2,500.00 in cents
  const totalIncome = transactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remaining = monthlyBudget - totalExpenses;
  const percentSpent = Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 100);
  
  // Group expenses by category for "Top Expenses"
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
  
  // Sort categories by expense amount
  const topExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Helper to format cents to dollars
  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.description) {
      const amountInCents = Math.round(parseFloat(newTransaction.amount) * 100);
      
      createTransactionMutation.mutate({
        amount: amountInCents,
        description: newTransaction.description,
        category: newTransaction.category || undefined,
        isIncome: newTransaction.isIncome
      });
    }
  };

  // Category options
  const categories = [
    'Housing', 'Food', 'Transport', 'Entertainment', 'Utilities', 
    'Healthcare', 'Education', 'Shopping', 'Other'
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <CardTitle className="font-semibold text-neutral-900 dark:text-white flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary-500" />
          Budget Overview
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Detailed Budget</DropdownMenuItem>
            <DropdownMenuItem>Generate Report</DropdownMenuItem>
            <DropdownMenuItem>Set Budget Limit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Budget</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatAmount(monthlyBudget)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Spent</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatAmount(totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Remaining</span>
            <span className="text-sm font-medium text-green-500">
              {formatAmount(remaining)}
            </span>
          </div>
        </div>

        <Progress 
          value={percentSpent} 
          className="h-2 bg-neutral-200 dark:bg-neutral-700 mb-4" 
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-md bg-neutral-100 dark:bg-neutral-700 p-3">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Income</div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white">{formatAmount(totalIncome)}</div>
            <div className="text-xs text-green-500">This Month</div>
          </div>
          <div className="rounded-md bg-neutral-100 dark:bg-neutral-700 p-3">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Expenses</div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white">{formatAmount(totalExpenses)}</div>
            <div className="text-xs text-amber-500">This Month</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Top Expenses</h4>
          <div className="space-y-2">
            {topExpenses.map(([category, amount], index) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ 
                      backgroundColor: 
                        index === 0 ? 'var(--primary)' : 
                        index === 1 ? 'hsl(35, 92%, 51%)' : // amber
                        'hsl(142, 71%, 45%)' // green
                    }}
                  ></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{category}</span>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{formatAmount(amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          variant="link" 
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0"
          onClick={() => setIsAddTransactionDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Transaction
        </Button>
      </CardContent>

      <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
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
    </Card>
  );
}
