'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface SettingsClientProps {
  currentUser: any
}

export default function SettingsClient({ currentUser }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    bio: currentUser.bio || ''
  })

  const handleSave = async () => {
    // Implementation for saving user settings
    console.log('Saving user settings:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-200">Manage your account and application preferences</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">Profile</TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-white/20">Account</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">Notifications</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-white/20">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-200">
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {currentUser.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{currentUser.name}</h3>
                      <p className="text-gray-300">{currentUser.role?.name}</p>
                      <p className="text-gray-400">{currentUser.department?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-200 text-sm font-medium block mb-2">
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>

                    <div>
                      <label className="text-gray-200 text-sm font-medium block mb-2">
                        Email Address
                      </label>
                      <Input
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="text-gray-200 text-sm font-medium block mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>

                    <div>
                      <label className="text-gray-200 text-sm font-medium block mb-2">
                        Status
                      </label>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {currentUser.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Details</CardTitle>
                  <CardDescription className="text-gray-200">
                    View your account information and organizational details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Employee ID</label>
                        <div className="text-white font-medium">{currentUser.id}</div>
                      </div>
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Role</label>
                        <div className="text-white font-medium">{currentUser.role?.name}</div>
                      </div>
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Department</label>
                        <div className="text-white font-medium">{currentUser.department?.name}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Manager</label>
                        <div className="text-white font-medium">
                          {currentUser.manager?.name || 'No manager assigned'}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Join Date</label>
                        <div className="text-white font-medium">
                          {new Date(currentUser.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-200 text-sm font-medium">Last Updated</label>
                        <div className="text-white font-medium">
                          {new Date(currentUser.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-200">
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-300">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2zM4 7h8V5H4v2z" />
                    </svg>
                    <p>Notification preferences coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-200">
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-300">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p>Security settings coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
