import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateReward, useAllRewards } from "@/hooks/use-rewards";
import { 
  useCreateChallenge, 
  useAllChallenges, 
  useUpdateChallenge,
  useDeleteChallenge 
} from "@/hooks/use-challenges";
import { useLocation } from "wouter";
import { CommuteType, Challenge } from "@/lib/types";

import { useQuery } from "@tanstack/react-query";

// Import type for User
import { User } from "@/lib/types";

const CompanyPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch company data
  const { data: company, isLoading: isLoadingCompany } = useQuery<any>({
    queryKey: [`/api/companies/${user?.company_id}`],
    enabled: !!user?.company_id,
  });
  
  // Fetch company members from API
  const { data: members = [], isLoading: isLoadingMembers, refetch: refetchMembers } = useQuery<any[]>({
    queryKey: [`/api/company/members?companyId=${user?.company_id}`],
    enabled: !!user?.company_id,
  });
  const [newMember, setNewMember] = useState({ 
    name: "", 
    email: "", 
    username: "",
    password: "",
    role: "user" 
  });
  
  // State for validation errors
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Functions for validation
  const validateEmailDomain = (email: string) => {
    if (!email || !company?.domain) return true;
    
    // Extract domain from email (after @)
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;
    
    const emailDomain = emailParts[1];
    // Check if email domain matches company domain
    return emailDomain.toLowerCase() === company.domain.toLowerCase();
  };
  
  const checkUsernameUniqueness = (username: string, userId?: number) => {
    if (!username) return true;
    
    // Check if username exists in the members list
    return !members.some(member => 
      member.username.toLowerCase() === username.toLowerCase() &&
      member.id !== userId // Skip current user when editing
    );
  };
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false);
  const [isEditChallengeOpen, setIsEditChallengeOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [newReward, setNewReward] = useState({
    title: "",
    description: "",
    cost_points: 100,
    quantity_limit: 0
  });
  
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    points_reward: 500,
    goal_type: "distance",
    goal_value: 100,
    commute_type: "cycle" as CommuteType, // Use type from client-side types
    company_id: null
  });
  
  // Get user ID from auth context
  const userId = user?.id || 0;
  

  
  // Create mutations and fetch data
  const createRewardMutation = useCreateReward(userId);
  const createChallengeMutation = useCreateChallenge(userId);
  const updateChallengeMutation = useUpdateChallenge(userId);
  const deleteChallengeMutation = useDeleteChallenge(userId);
  const { data: rewards, isLoading: isLoadingRewards } = useAllRewards(userId);
  const { data: challenges, isLoading: isLoadingChallenges } = useAllChallenges(userId);
  
  // State for active tab with URL parameter support
  const [activeTab, setActiveTab] = useState("members");
  
  // Handle tab parameter from URL
  useEffect(() => {
    // Extract tab parameter from the URL if it exists
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    // Set the active tab if a valid tab parameter is provided
    if (tabParam && ['members', 'challenges', 'rewards'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  
  // Check if user has admin role
  const isAdmin = user?.role === "admin";
  
  // Handler for editing a challenge
  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge({
      ...challenge,
      // Ensure dates are in the right format for the form
      start_date: new Date(challenge.start_date).toISOString().split('T')[0],
      end_date: new Date(challenge.end_date).toISOString().split('T')[0],
    });
    setIsEditChallengeOpen(true);
  };
  
  // Handler for saving edited challenge
  const handleSaveChallenge = () => {
    if (!editingChallenge) return;
    
    updateChallengeMutation.mutate({
      id: editingChallenge.id,
      data: {
        title: editingChallenge.title,
        description: editingChallenge.description,
        start_date: editingChallenge.start_date,
        end_date: editingChallenge.end_date,
        points_reward: editingChallenge.points_reward,
        goal_type: editingChallenge.goal_type,
        goal_value: editingChallenge.goal_value,
        commute_type: editingChallenge.commute_type,
      }
    });
    
    setIsEditChallengeOpen(false);
  };
  
  // Handler for deleting a challenge
  const handleDeleteClick = (challenge: Challenge) => {
    setChallengeToDelete(challenge);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for confirming challenge deletion
  const handleConfirmDelete = () => {
    if (!challengeToDelete) return;
    
    deleteChallengeMutation.mutate(challengeToDelete.id);
    setIsDeleteDialogOpen(false);
    setChallengeToDelete(null);
  };
  
  // Handle editing a member
  const handleEditMember = (member: any) => {
    // Create a copy without password (we don't want to show or update the current password)
    const { password, ...memberWithoutPassword } = member;
    setMemberToEdit({
      ...memberWithoutPassword,
      password: '', // Empty password means it won't be updated
    });
    setIsEditMemberOpen(true);
  };
  
  // Handle saving edited member
  const handleSaveMember = async () => {
    if (!memberToEdit) return;
    
    // Validate required fields
    if (!memberToEdit.name || !memberToEdit.email || !memberToEdit.username) {
      toast({
        title: "Error",
        description: "Name, email, and username are required.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email domain
    if (!validateEmailDomain(memberToEdit.email)) {
      toast({
        title: "Invalid Email",
        description: `Email must use company domain: @${company?.domain}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check username uniqueness (pass the current member's ID to exclude it from the check)
    if (!checkUsernameUniqueness(memberToEdit.username, memberToEdit.id)) {
      toast({
        title: "Username Taken",
        description: "This username is already in use by another team member.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const dataToSend = { ...memberToEdit };
      
      // Only include password if it was provided
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      const response = await fetch(`/api/company/members/${memberToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update member');
      }
      
      // Refresh the members list
      refetchMembers();
      
      setIsEditMemberOpen(false);
      setMemberToEdit(null);
      setShowPassword(false);
      
      toast({
        title: "Member Updated",
        description: `${memberToEdit.name}'s details have been updated.`,
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update member",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a member
  const handleDeleteMember = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteMemberDialogOpen(true);
  };
  
  // Handle confirming member deletion
  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      const response = await fetch(`/api/company/members/${memberToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete member');
      }
      
      // Refresh the members list
      refetchMembers();
      
      setIsDeleteMemberDialogOpen(false);
      setMemberToDelete(null);
      
      toast({
        title: "Member Deleted",
        description: `${memberToDelete.name} has been removed from your company.`,
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete member",
        variant: "destructive",
      });
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need administrator privileges to access the company management page.</p>
      </div>
    );
  }
  
  // Handle adding a new member
  const handleAddMember = async () => {
    // Check for required fields
    if (!newMember.name || !newMember.email || !newMember.username || !newMember.password) {
      toast({
        title: "Error",
        description: "Please enter all required fields for the new member.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for email domain validation
    if (!validateEmailDomain(newMember.email)) {
      toast({
        title: "Invalid Email",
        description: `Email must use company domain: @${company?.domain}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check for username uniqueness
    if (!checkUsernameUniqueness(newMember.username)) {
      toast({
        title: "Username Taken",
        description: "This username is already in use. Please choose a different username.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/company/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMember,
          company_id: user?.company_id
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add member');
      }
      
      const result = await response.json();
      
      // Refresh the members list
      refetchMembers();
      
      // Reset the form
      setNewMember({ 
        name: "", 
        email: "", 
        username: "",
        password: "",
        role: "user" 
      });
      setIsAddMemberOpen(false);
      
      toast({
        title: "Member Added",
        description: `${newMember.name} has been added to your company.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Company Management</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Company Name:</div>
              <div className="col-span-2">{user?.company_id ? "Embrace Wellness Ltd" : "Your Company"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Domain:</div>
              <div className="col-span-2">{user?.email ? user.email.split('@')[1] : "yourcompany.com"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Admin:</div>
              <div className="col-span-2">{user?.name || user?.username}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Update URL when tab changes
        window.history.replaceState(null, '', `/company?tab=${value}`);
      }}>
        <TabsList className="mb-6">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <span className="material-icons mr-2 text-sm">person_add</span>
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to your company. Provide a temporary password - they will be required to change it on their first login.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        let suggestedUsername = '';
                        
                        // Generate username based on name (if name is provided)
                        if (name) {
                          // Convert to lowercase, replace spaces with dots, remove special characters
                          suggestedUsername = name.toLowerCase()
                            .replace(/\s+/g, '.')
                            .replace(/[^a-z0-9.]/g, '');
                        }
                        
                        // Check if generated username is unique
                        const isUsernameUnique = checkUsernameUniqueness(suggestedUsername);
                        
                        // Only update username error if auto-generating a username
                        if (suggestedUsername && !isUsernameUnique && 
                           (newMember.username === '' || 
                            newMember.username === newMember.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, ''))) {
                          setUsernameError("This username is already taken");
                        } else if (newMember.username === '' || 
                                  newMember.username === newMember.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')) {
                          setUsernameError("");
                        }
                        
                        setNewMember({
                          ...newMember, 
                          name: name,
                          // Only auto-update username if it's empty or was auto-generated before
                          username: newMember.username === '' || 
                                   newMember.username === newMember.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') 
                                   ? suggestedUsername : newMember.username
                        });
                      }}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input
                        id="email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => {
                          const email = e.target.value;
                          setNewMember({...newMember, email});
                          
                          // Validate email domain
                          if (email && !validateEmailDomain(email)) {
                            setEmailError(`Email must use company domain: @${company?.domain}`);
                          } else {
                            setEmailError("");
                          }
                        }}
                        className={emailError ? "border-red-500" : ""}
                      />
                      {emailError && (
                        <p className="text-sm text-red-500">{emailError}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input
                        id="username"
                        value={newMember.username}
                        onChange={(e) => {
                          const username = e.target.value;
                          setNewMember({...newMember, username});
                          
                          // Check username uniqueness
                          if (username && !checkUsernameUniqueness(username)) {
                            setUsernameError("This username is already taken");
                          } else {
                            setUsernameError("");
                          }
                        }}
                        className={usernameError ? "border-red-500" : ""}
                      />
                      {usernameError && (
                        <p className="text-sm text-red-500">{usernameError}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Temporary Password
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newMember.password}
                        onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-icons text-gray-500" style={{ fontSize: '18px' }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <select
                      id="role"
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                {isLoadingMembers ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                    <p className="mt-2 text-gray-600">Loading team members...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-600">No team members found.</p>
                    <p className="text-gray-600 mt-1">Add your first team member to get started.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Username</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b">
                          <td className="py-3 px-4">{member.name}</td>
                          <td className="py-3 px-4">{member.email}</td>
                          <td className="py-3 px-4">{member.username}</td>
                          <td className="py-3 px-4">{member.role}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${member.is_new_user ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                              {member.is_new_user ? "New User" : "Active"}
                            </span>
                            {member.needs_password_change && (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Password Change Required
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditMember(member)}
                              disabled={user?.id === member.id} // Can't edit yourself
                              title={user?.id === member.id ? "You cannot edit your own account" : "Edit member"}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteMember(member)}
                              disabled={user?.id === member.id} // Can't delete yourself
                              title={user?.id === member.id ? "You cannot delete your own account" : "Delete member"}
                            >
                              <span className="material-icons text-sm text-red-500">delete</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Edit Member Dialog */}
          <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team Member</DialogTitle>
                <DialogDescription>
                  Update the member's information. Leave the password field empty to keep the current password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={memberToEdit?.name || ''}
                    onChange={(e) => setMemberToEdit({...memberToEdit, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="edit-email"
                      type="email"
                      value={memberToEdit?.email || ''}
                      onChange={(e) => {
                        const email = e.target.value;
                        setMemberToEdit({...memberToEdit, email});
                        
                        // Check email domain
                        if (email && !validateEmailDomain(email)) {
                          setEmailError(`Email must use company domain: @${company?.domain}`);
                        } else {
                          setEmailError("");
                        }
                      }}
                      className={emailError ? "border-red-500" : ""}
                    />
                    {emailError && (
                      <p className="text-sm text-red-500">{emailError}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">
                    Username
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="edit-username"
                      value={memberToEdit?.username || ''}
                      onChange={(e) => {
                        const username = e.target.value;
                        setMemberToEdit({...memberToEdit, username});
                        
                        // Check username uniqueness
                        if (username && !checkUsernameUniqueness(username, memberToEdit?.id)) {
                          setUsernameError("This username is already taken");
                        } else {
                          setUsernameError("");
                        }
                      }}
                      className={usernameError ? "border-red-500" : ""}
                    />
                    {usernameError && (
                      <p className="text-sm text-red-500">{usernameError}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-password" className="text-right">
                    New Password
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? "text" : "password"}
                      value={memberToEdit?.password || ''}
                      onChange={(e) => setMemberToEdit({...memberToEdit, password: e.target.value})}
                      className="pr-10"
                      placeholder="Leave empty to keep current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-icons text-gray-500" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <select
                    id="edit-role"
                    value={memberToEdit?.role || 'user'}
                    onChange={(e) => setMemberToEdit({...memberToEdit, role: e.target.value})}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">User Status</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is-new-user"
                        checked={memberToEdit?.is_new_user || false}
                        onChange={(e) => setMemberToEdit({...memberToEdit, is_new_user: e.target.checked})}
                        className="mr-2"
                      />
                      <Label htmlFor="is-new-user" className="text-sm font-normal">
                        New User (Shows welcome screen)
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needs-password-change"
                        checked={memberToEdit?.needs_password_change || false}
                        onChange={(e) => setMemberToEdit({...memberToEdit, needs_password_change: e.target.checked})}
                        className="mr-2"
                      />
                      <Label htmlFor="needs-password-change" className="text-sm font-normal">
                        Requires Password Change
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsEditMemberOpen(false);
                  setMemberToEdit(null);
                  setShowPassword(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMember}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Member Dialog */}
          <AlertDialog open={isDeleteMemberDialogOpen} onOpenChange={setIsDeleteMemberDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently remove {memberToDelete?.name} from your company. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsDeleteMemberDialogOpen(false);
                  setMemberToDelete(null);
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeleteMember} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
        
        <TabsContent value="challenges">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Challenges</h2>
            <Dialog open={isAddChallengeOpen} onOpenChange={setIsAddChallengeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <span className="material-icons mr-2 text-sm">add_circle</span>
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                  <DialogDescription>
                    Design a new challenge for your company members.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="challenge-title"
                      placeholder="e.g., Bike to Work Week"
                      className="col-span-3"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-desc" className="text-right">
                      Description
                    </Label>
                    <textarea
                      id="challenge-desc"
                      placeholder="Describe the challenge..."
                      className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-start" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      id="challenge-start"
                      type="date"
                      className="col-span-3"
                      value={newChallenge.start_date}
                      onChange={(e) => setNewChallenge({...newChallenge, start_date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-end" className="text-right">
                      End Date
                    </Label>
                    <Input
                      id="challenge-end"
                      type="date"
                      className="col-span-3"
                      value={newChallenge.end_date}
                      onChange={(e) => setNewChallenge({...newChallenge, end_date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-points" className="text-right">
                      Points Reward
                    </Label>
                    <Input
                      id="challenge-points"
                      type="number"
                      placeholder="500"
                      className="col-span-3"
                      value={newChallenge.points_reward}
                      onChange={(e) => setNewChallenge({...newChallenge, points_reward: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-goal-type" className="text-right">
                      Goal Type
                    </Label>
                    <select
                      id="challenge-goal-type"
                      className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={newChallenge.goal_type}
                      onChange={(e) => setNewChallenge({...newChallenge, goal_type: e.target.value})}
                    >
                      <option value="distance">Distance (km)</option>
                      <option value="days">Days</option>
                      <option value="co2">CO2 Saved (kg)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-goal-value" className="text-right">
                      Goal Target
                    </Label>
                    <Input
                      id="challenge-goal-value"
                      type="number"
                      placeholder="100"
                      className="col-span-3"
                      value={newChallenge.goal_value}
                      onChange={(e) => setNewChallenge({...newChallenge, goal_value: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="challenge-commute-type" className="text-right">
                      Commute Type
                    </Label>
                    <select
                      id="challenge-commute-type"
                      className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={newChallenge.commute_type}
                      onChange={(e) => setNewChallenge({...newChallenge, commute_type: e.target.value as CommuteType})}
                    >
                      <option value="walk">Walking</option>
                      <option value="cycle">Cycling</option>
                      <option value="public_transport">Public Transport</option>
                      <option value="carpool">Carpooling</option>
                      <option value="electric_vehicle">Electric Vehicle</option>
                      <option value="gas_vehicle">Gas Vehicle</option>
                      <option value="remote_work">Remote Work</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    // Set the company_id field to the user's company_id
                    const challengeData = {
                      ...newChallenge,
                      commute_type: newChallenge.commute_type as CommuteType,
                      company_id: user?.company_id || null
                    };
                    
                    // Submit the data
                    createChallengeMutation.mutate(challengeData);
                    
                    // Reset form and close dialog
                    setNewChallenge({
                      title: "",
                      description: "",
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      points_reward: 500,
                      goal_type: "distance",
                      goal_value: 100,
                      commute_type: "cycle" as CommuteType,
                      company_id: null
                    });
                    setIsAddChallengeOpen(false);
                  }}>Create Challenge</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {isLoadingChallenges ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-primary mb-2">
                    <span className="material-icons text-4xl">cached</span>
                  </div>
                  <p>Loading challenges...</p>
                </div>
              ) : challenges && challenges.length > 0 ? (
                <div className="space-y-4">
                  {challenges.map(challenge => (
                    <div key={challenge.id} className="border rounded-lg p-4 flex items-start">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                        <span className="material-icons">emoji_events</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                          <div>
                            <span className="font-medium">Start:</span> {new Date(challenge.start_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {new Date(challenge.end_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Reward:</span> {challenge.points_reward} pts
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditChallenge(challenge)}>
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(challenge)}>
                          <span className="material-icons text-sm text-red-500">delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <span className="material-icons text-4xl">emoji_events</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
                  <p className="text-gray-500 mb-4">Create your first company challenge to motivate your team.</p>
                  <Button onClick={() => setIsAddChallengeOpen(true)}>
                    Create Challenge
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Rewards</h2>
            <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
              <DialogTrigger asChild>
                <Button>
                  <span className="material-icons mr-2 text-sm">card_giftcard</span>
                  Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Reward</DialogTitle>
                  <DialogDescription>
                    Create a new reward that team members can redeem with their points.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reward-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="reward-title"
                      placeholder="e.g., Free Coffee Voucher"
                      className="col-span-3"
                      value={newReward.title}
                      onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reward-desc" className="text-right">
                      Description
                    </Label>
                    <textarea
                      id="reward-desc"
                      placeholder="Describe the reward..."
                      className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newReward.description}
                      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reward-points" className="text-right">
                      Points Cost
                    </Label>
                    <Input
                      id="reward-points"
                      type="number"
                      placeholder="200"
                      className="col-span-3"
                      value={newReward.cost_points}
                      onChange={(e) => setNewReward({...newReward, cost_points: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reward-quantity" className="text-right">
                      Quantity Limit
                    </Label>
                    <Input
                      id="reward-quantity"
                      type="number"
                      placeholder="50"
                      className="col-span-3"
                      value={newReward.quantity_limit}
                      onChange={(e) => setNewReward({...newReward, quantity_limit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      // Validate form
                      if (!newReward.title) {
                        toast({
                          title: "Missing information",
                          description: "Please enter a title for the reward",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Submit the form
                      createRewardMutation.mutate({
                        title: newReward.title,
                        description: newReward.description,
                        cost_points: newReward.cost_points,
                        quantity_limit: newReward.quantity_limit || null,
                        company_id: user?.company_id || null
                      }, {
                        onSuccess: () => {
                          // Show success toast
                          toast({
                            title: "Reward Added",
                            description: `"${newReward.title}" has been added successfully.`,
                          });
                          
                          // Reset form and close dialog
                          setNewReward({
                            title: "",
                            description: "",
                            cost_points: 100,
                            quantity_limit: 0
                          });
                          setIsAddRewardOpen(false);
                        },
                        onError: (error) => {
                          toast({
                            title: "Error Creating Reward",
                            description: error.message || "There was a problem adding the reward.",
                            variant: "destructive"
                          });
                        }
                      });
                    }} 
                    disabled={createRewardMutation.isPending}
                  >
                    {createRewardMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full inline-block"></span>
                        Adding...
                      </>
                    ) : "Add Reward"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {isLoadingRewards ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : rewards && rewards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{reward.title}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="mt-2 flex items-center text-sm">
                        <span className="font-semibold">{reward.cost_points} points</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {reward.quantity_limit ? `${reward.quantity_limit} available` : 'Unlimited'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <span className="material-icons text-4xl">redeem</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No rewards yet</h3>
                  <p className="text-gray-500 mb-4">Create your first company reward to motivate your team.</p>
                  <Button onClick={() => setIsAddRewardOpen(true)}>
                    Add Reward
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Challenge Dialog */}
      <Dialog open={isEditChallengeOpen} onOpenChange={setIsEditChallengeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>
              Update challenge details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                className="col-span-3"
                value={editingChallenge?.title || ""}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, title: e.target.value} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                className="col-span-3"
                value={editingChallenge?.description || ""}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, description: e.target.value} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-start-date"
                type="date"
                className="col-span-3"
                value={editingChallenge?.start_date || ""}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, start_date: e.target.value} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="edit-end-date"
                type="date"
                className="col-span-3"
                value={editingChallenge?.end_date || ""}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, end_date: e.target.value} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-points" className="text-right">
                Points
              </Label>
              <Input
                id="edit-points"
                type="number"
                className="col-span-3"
                value={editingChallenge?.points_reward || 0}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, points_reward: parseInt(e.target.value)} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-goal-type" className="text-right">
                Goal Type
              </Label>
              <select
                id="edit-goal-type"
                className="col-span-3 p-2 border rounded"
                value={editingChallenge?.goal_type || "distance"}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, goal_type: e.target.value} : prev
                  )
                }
              >
                <option value="distance">Distance (km)</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-goal-value" className="text-right">
                Goal Value
              </Label>
              <Input
                id="edit-goal-value"
                type="number"
                className="col-span-3"
                value={editingChallenge?.goal_value || 0}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, goal_value: parseInt(e.target.value)} : prev
                  )
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-commute-type" className="text-right">
                Commute Type
              </Label>
              <select
                id="edit-commute-type"
                className="col-span-3 p-2 border rounded"
                value={editingChallenge?.commute_type || "cycle"}
                onChange={(e) => 
                  setEditingChallenge(prev => 
                    prev ? {...prev, commute_type: e.target.value as CommuteType} : prev
                  )
                }
              >
                <option value="cycle">Cycling</option>
                <option value="walk">Walking</option>
                <option value="run">Running</option>
                <option value="public_transport">Public Transport</option>
                <option value="carpool">Carpooling</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveChallenge}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Challenge Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the challenge
              "{challengeToDelete?.title}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyPage;