import { useState } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateReward, useAllRewards } from "@/hooks/use-rewards";
import { useCreateChallenge, useAllChallenges } from "@/hooks/use-challenges";
import { CommuteType } from "@/lib/types";

import { useQuery } from "@tanstack/react-query";

// Mock data for company members (to be replaced with real API data)
const initialMembers = [
  { id: 1, name: "Tristan Clarke", email: "tristan@embracewellness.com", role: "Admin" },
];

const CompanyPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "User" });
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
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
  
  const createRewardMutation = useCreateReward(user?.id || 0);
  const createChallengeMutation = useCreateChallenge(user?.id || 0);
  const { data: rewards, isLoading: isLoadingRewards } = useAllRewards(user?.id || 0);
  const { data: challenges, isLoading: isLoadingChallenges } = useAllChallenges(user?.id || 0);
  
  // Check if user has admin role
  const isAdmin = user?.role === "admin";
  
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need administrator privileges to access the company management page.</p>
      </div>
    );
  }
  
  // Handle adding a new member
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Please enter name and email for the new member.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would be an API call
    const newId = members.length + 1;
    setMembers([...members, { id: newId, ...newMember }]);
    setNewMember({ name: "", email: "", role: "User" });
    setIsAddMemberOpen(false);
    
    toast({
      title: "Member Added",
      description: `${newMember.name} has been added to your company.`,
    });
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
      
      <Tabs defaultValue="members">
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
                    Add a new member to your company. They will receive an email invitation.
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
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="col-span-3"
                    />
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
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
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
                        <td className="py-3 px-4">{member.role}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <span className="material-icons text-sm text-red-500">delete</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
                        <Button variant="ghost" size="sm">
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="sm">
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
    </div>
  );
};

export default CompanyPage;