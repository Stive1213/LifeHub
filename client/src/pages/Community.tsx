import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  User,
  Calendar as CalendarIcon,
  Tag,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { CommunityTip } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Community() {
  const [isAddTipDialogOpen, setIsAddTipDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('popular');
  
  const [newTip, setNewTip] = useState({
    title: '',
    content: '',
    category: 'productivity'
  });

  const { data: tips = [] } = useQuery<CommunityTip[]>({
    queryKey: ['/api/community-tips'],
  });

  const createTipMutation = useMutation({
    mutationFn: async (tip: { title: string; content: string; category: string }) => {
      return await apiRequest('POST', '/api/community-tips', tip);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-tips'] });
      setNewTip({
        title: '',
        content: '',
        category: 'productivity'
      });
      setIsAddTipDialogOpen(false);
    }
  });

  const voteTipMutation = useMutation({
    mutationFn: async ({ id, vote }: { id: number; vote: boolean }) => {
      return await apiRequest('POST', `/api/community-tips/${id}/vote`, { vote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-tips'] });
    }
  });

  const handleAddTip = () => {
    if (newTip.title.trim() && newTip.content.trim()) {
      createTipMutation.mutate({
        title: newTip.title,
        content: newTip.content,
        category: newTip.category
      });
    }
  };

  const handleVote = (id: number, vote: boolean) => {
    voteTipMutation.mutate({ id, vote });
  };

  // Filter tips
  const filteredTips = tips.filter(tip => {
    // Filter by search query
    if (searchQuery && 
        !tip.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tip.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && tip.category !== categoryFilter) {
      return false;
    }
    
    return true;
  });

  // Sort tips based on active tab
  const sortedTips = [...filteredTips].sort((a, b) => {
    if (activeTab === 'popular') {
      return b.votes - a.votes;
    } else if (activeTab === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (activeTab === 'controversial') {
      // For demo purposes, just random sort for "controversial"
      return Math.random() - 0.5;
    }
    return 0;
  });

  // Get unique categories for filters
  const categories = Array.from(
    new Set(
      tips.map(tip => tip.category)
    )
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Community Tips</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Share and discover life hacks, tips, and advice
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddTipDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Share a Tip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Browse Tips</CardTitle>
              <CardDescription>
                {filteredTips.length} tips found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search tips..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="popular" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="controversial">Controversial</TabsTrigger>
              </TabsList>
              <TabsContent value="popular" className="mt-4">
                {renderTipsList(sortedTips, handleVote)}
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                {renderTipsList(sortedTips, handleVote)}
              </TabsContent>
              <TabsContent value="controversial" className="mt-4">
                {renderTipsList(sortedTips, handleVote)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div 
                  className={`px-3 py-2 rounded-md cursor-pointer ${categoryFilter === null ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  onClick={() => setCategoryFilter(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All Categories</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{tips.length}</span>
                  </div>
                </div>
                {categories.map(category => (
                  <div 
                    key={category}
                    className={`px-3 py-2 rounded-md cursor-pointer ${categoryFilter === category ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {tips.filter(tip => tip.category === category).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(
                  tips.reduce((acc, tip) => {
                    if (!acc.has(tip.userId)) {
                      acc.set(tip.userId, { 
                        userId: tip.userId, 
                        tipCount: 1, 
                        totalVotes: tip.votes 
                      });
                    } else {
                      const user = acc.get(tip.userId)!;
                      user.tipCount += 1;
                      user.totalVotes += tip.votes;
                    }
                    return acc;
                  }, new Map())
                )
                  .sort((a, b) => b[1].totalVotes - a[1].totalVotes)
                  .slice(0, 5)
                  .map(([userId, { tipCount, totalVotes }]) => (
                    <div key={userId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 flex items-center justify-center font-semibold">
                          U{userId}
                        </div>
                        <div className="ml-2">
                          <div className="font-medium">User {userId}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {tipCount} tips shared
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm font-medium text-amber-500">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {totalVotes}
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddTipDialogOpen} onOpenChange={setIsAddTipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share a Tip</DialogTitle>
            <DialogDescription>
              Share your knowledge and life hacks with the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tip-title">Title</Label>
              <Input
                id="tip-title"
                value={newTip.title}
                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                placeholder="Enter a clear, descriptive title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip-content">Content</Label>
              <Textarea
                id="tip-content"
                value={newTip.content}
                onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
                placeholder="Share your tip in detail..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip-category">Category</Label>
              <select 
                id="tip-category"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
                value={newTip.category}
                onChange={(e) => setNewTip({ ...newTip, category: e.target.value })}
              >
                <option value="productivity">Productivity</option>
                <option value="finance">Finance</option>
                <option value="health">Health & Wellness</option>
                <option value="technology">Technology</option>
                <option value="cooking">Cooking</option>
                <option value="organization">Organization</option>
                <option value="education">Education</option>
                <option value="career">Career</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTipDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTip}
              disabled={!newTip.title.trim() || !newTip.content.trim() || createTipMutation.isPending}
            >
              {createTipMutation.isPending ? 'Sharing...' : 'Share Tip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function renderTipsList(tips: CommunityTip[], handleVote: (id: number, vote: boolean) => void) {
  if (tips.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
        No tips found. Be the first to share one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tips.map(tip => (
        <div 
          key={tip.id}
          className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <div className="flex">
            <div className="flex flex-col items-center mr-4 space-y-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-neutral-500 hover:text-primary-500"
                onClick={() => handleVote(tip.id, true)}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className={cn(
                "font-medium",
                tip.votes > 0 ? "text-primary-500" : 
                tip.votes < 0 ? "text-red-500" : ""
              )}>
                {tip.votes}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-neutral-500 hover:text-red-500"
                onClick={() => handleVote(tip.id, false)}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{tip.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-3">{tip.content}</p>
              <div className="flex flex-wrap items-center text-xs text-neutral-500 dark:text-neutral-400 gap-3">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  User {tip.userId}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {format(new Date(tip.date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  <span className="capitalize">{tip.category}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  0 comments
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2 ml-auto">
                  <Flag className="h-3 w-3 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
