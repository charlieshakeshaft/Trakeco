import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/lib/types";

interface TeamSectionProps {
  userId: number;
  companyId: number | null;
}

interface InviteMemberFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  company_id: number;
}

const TeamSection = ({ userId, companyId }: TeamSectionProps) => {
  const queryClient = useQueryClient();

  // Only load team members if user is part of a company
  const { data: teamMembers, isLoading } = useQuery<User[]>({
    queryKey: [`/api/company/members?companyId=${companyId}`],
    enabled: !!companyId,
  });

  // If not part of a company, don't show team section
  if (!companyId) {
    return null;
  }

  const navigateToTeamMembers = () => {
    window.location.href = "/company?tab=members";
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Team Members</h2>
        <Button 
          variant="outline" 
          className="text-primary border-primary hover:bg-primary/10"
          onClick={navigateToTeamMembers}
        >
          <span className="material-icons text-sm mr-1">person_add</span>
          Invite Team Member
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="p-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ) : teamMembers && teamMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">@{member.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <span className="material-icons text-4xl mb-2 text-gray-300">group</span>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No team members yet</h3>
            <p className="text-sm mb-4">Invite your colleagues to track their sustainable commutes</p>
            <Button 
              onClick={navigateToTeamMembers}
              className="inline-flex items-center"
            >
              <span className="material-icons text-sm mr-1">person_add</span>
              Invite Your First Team Member
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;