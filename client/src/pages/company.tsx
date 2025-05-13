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
              <div className="col-span-2">{user?.company_name || "Your Company"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Domain:</div>
              <div className="col-span-2">{user?.company_domain || "yourcompany.com"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Admin:</div>
              <div className="col-span-2">{user?.name}</div>
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
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    toast({
                      title: "Challenge Created",
                      description: "The new challenge has been created successfully."
                    });
                    setIsAddChallengeOpen(false);
                  }}>Create Challenge</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="pt-6">
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
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    toast({
                      title: "Reward Added",
                      description: "The new reward has been added successfully."
                    });
                    setIsAddRewardOpen(false);
                  }}>Add Reward</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPage;