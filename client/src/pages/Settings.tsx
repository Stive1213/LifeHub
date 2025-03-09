import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Mail, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Shield, 
  Layout, 
  Save,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { UserProfile } from '@/lib/types';
import useDarkMode from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { darkMode, setDarkMode } = useDarkMode();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { data: user } = useQuery<UserProfile>({ 
    queryKey: ['/api/user/profile'],
  });
  
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    username: ''
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'system',
    dashboardLayout: [] as number[],
    notifications: {
      email: true,
      inApp: true,
      taskReminders: true,
      eventReminders: true
    },
    privacy: {
      shareData: false,
      showOnlineStatus: true
    }
  });
  
  // Update form state when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || '',
        email: user.email || '',
        username: user.username
      });
      
      if (user.preferences) {
        setPreferences({
          ...preferences,
          ...user.preferences,
          theme: user.preferences.theme || 'system',
          dashboardLayout: user.preferences.dashboardLayout || []
        });
      }
    }
  }, [user]);
  
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      return await apiRequest('PATCH', '/api/user/preferences', { preferences: newPreferences });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      showSuccessMessage('Preferences saved successfully');
    }
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { displayName?: string; email?: string }) => {
      return await apiRequest('PATCH', '/api/user/profile', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      showSuccessMessage('Profile updated successfully');
    }
  });
  
  const handleThemeChange = (theme: string) => {
    setPreferences({ ...preferences, theme });
    
    if (theme === 'light') {
      setDarkMode(false);
    } else if (theme === 'dark') {
      setDarkMode(true);
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  };
  
  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };
  
  const handleSaveProfile = () => {
    const updates = {
      displayName: profileForm.displayName,
      email: profileForm.email
    };
    
    updateProfileMutation.mutate(updates);
  };
  
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    toast({
      title: "Success",
      description: message,
      variant: "default"
    });
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Customize your LifeHub experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <nav className="space-y-1">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'profile' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'appearance' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('appearance')}
              >
                <Sun className="h-5 w-5 mr-2" />
                Appearance
              </Button>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'notifications' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'privacy' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('privacy')}
              >
                <Shield className="h-5 w-5 mr-2" />
                Privacy
              </Button>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'dashboard' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('dashboard')}
              >
                <Layout className="h-5 w-5 mr-2" />
                Dashboard Layout
              </Button>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  activeTab === 'account' && "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                )}
                onClick={() => setActiveTab('account')}
              >
                <Key className="h-5 w-5 mr-2" />
                Account Security
              </Button>
            </nav>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              {activeTab === 'profile' && "Profile Settings"}
              {activeTab === 'appearance' && "Appearance Settings"}
              {activeTab === 'notifications' && "Notification Preferences"}
              {activeTab === 'privacy' && "Privacy Settings"}
              {activeTab === 'dashboard' && "Dashboard Layout"}
              {activeTab === 'account' && "Account Security"}
            </CardTitle>
            <CardDescription>
              {activeTab === 'profile' && "Manage your personal information"}
              {activeTab === 'appearance' && "Customize how LifeHub looks"}
              {activeTab === 'notifications' && "Control how you receive notifications"}
              {activeTab === 'privacy' && "Manage your privacy preferences"}
              {activeTab === 'dashboard' && "Customize your dashboard layout"}
              {activeTab === 'account' && "Manage your account and security settings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-semibold text-2xl">
                    {profileForm.displayName ? profileForm.displayName.charAt(0).toUpperCase() : profileForm.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Picture</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={profileForm.displayName}
                        onChange={e => setProfileForm({...profileForm, displayName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={profileForm.username}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex space-x-4">
                      <button 
                        className={cn(
                          "w-full p-4 border rounded-md flex items-center justify-center flex-col gap-2",
                          preferences.theme === 'light' 
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                            : "border-neutral-200 dark:border-neutral-700"
                        )}
                        onClick={() => handleThemeChange('light')}
                      >
                        <Sun className="h-8 w-8 text-amber-500" />
                        <span>Light</span>
                      </button>
                      <button 
                        className={cn(
                          "w-full p-4 border rounded-md flex items-center justify-center flex-col gap-2",
                          preferences.theme === 'dark' 
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                            : "border-neutral-200 dark:border-neutral-700"
                        )}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <Moon className="h-8 w-8 text-blue-500" />
                        <span>Dark</span>
                      </button>
                      <button 
                        className={cn(
                          "w-full p-4 border rounded-md flex items-center justify-center flex-col gap-2",
                          preferences.theme === 'system' 
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                            : "border-neutral-200 dark:border-neutral-700"
                        )}
                        onClick={() => handleThemeChange('system')}
                      >
                        <Monitor className="h-8 w-8 text-green-500" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Scheme</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'].map(color => (
                        <button 
                          key={color}
                          className={cn(
                            "h-10 rounded-md border",
                            "border-neutral-200 dark:border-neutral-700"
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Color ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={updatePreferencesMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">In-App Notifications</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Receive notifications within the app
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.inApp}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          inApp: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Task Reminders</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Get reminded about upcoming tasks
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.taskReminders}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          taskReminders: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Event Reminders</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Get reminded about upcoming events
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.eventReminders}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          eventReminders: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={updatePreferencesMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Anonymized Data Sharing</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Share anonymous usage data to help improve LifeHub
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.privacy.shareData}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          shareData: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Online Status</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Allow others to see when you're online
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.privacy.showOnlineStatus}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          showOnlineStatus: checked
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={updatePreferencesMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Layout */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    You can customize your dashboard layout directly from the Dashboard page using the "Customize" button.
                    Drag and drop widgets to rearrange them according to your preferences.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Default Widgets</Label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox id="widget-tasks" defaultChecked />
                      <Label htmlFor="widget-tasks" className="ml-2">Tasks</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="widget-calendar" defaultChecked />
                      <Label htmlFor="widget-calendar" className="ml-2">Calendar</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="widget-budget" defaultChecked />
                      <Label htmlFor="widget-budget" className="ml-2">Budget</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="widget-habits" defaultChecked />
                      <Label htmlFor="widget-habits" className="ml-2">Habits</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="widget-journal" defaultChecked />
                      <Label htmlFor="widget-journal" className="ml-2">Journal</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="widget-tools" defaultChecked />
                      <Label htmlFor="widget-tools" className="ml-2">Quick Tools</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Account Security */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Key className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <h3 className="font-medium text-lg mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="text-amber-500 border-amber-500">
                      Export All Data
                    </Button>
                    <Button variant="outline" className="text-red-500 border-red-500">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success message */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {successMessage}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
