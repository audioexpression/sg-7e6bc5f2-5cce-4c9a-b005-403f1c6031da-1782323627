import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, Users } from "lucide-react";
import { ImageModal } from "@/components/ImageModal";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  teamAssignment: string;
  category: string;
  type: string;
  role: string;
  photoUrl?: string;
}

interface TeamStats {
  name: string;
  totalPlayers: number;
  members: number;
  sponsored: number;
  scholarships: number;
  players: Member[];
}

export default function TeamsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
  }, []);

  const teamStats: TeamStats[] = [];
  const teamMap = new Map<string, Member[]>();

  members.forEach((member) => {
    if (member.teamAssignment && member.teamAssignment !== "-") {
      if (!teamMap.has(member.teamAssignment)) {
        teamMap.set(member.teamAssignment, []);
      }
      teamMap.get(member.teamAssignment)!.push(member);
    }
  });

  teamMap.forEach((players, teamName) => {
    const totalPlayers = players.length;
    const membersCount = players.filter((m) => m.type === "Member").length;
    const sponsoredCount = players.filter((m) => m.type === "Sponsored").length;
    const scholarshipCount = players.filter((m) => m.type === "Scholarship").length;

    teamStats.push({
      name: teamName,
      totalPlayers,
      members: membersCount,
      sponsored: sponsoredCount,
      scholarships: scholarshipCount,
      players,
    });
  });

  teamStats.sort((a, b) => b.totalPlayers - a.totalPlayers);

  const filteredTeams = teamStats.filter((team) => {
    const matchesSearch = searchTerm === "" || team.name.toLowerCase().includes(searchTerm.toLowerCase()) || team.players.some(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || team.players.some(p => p.type === typeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <>
      <SEO title="Team Roster - Bali Bulldogs" description="View all teams and their members" />
      
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Roster</h1>
            <p className="text-sm text-gray-500">{teamStats.length} teams • {members.filter(m => m.teamAssignment && m.teamAssignment !== "-").length} assigned members</p>
          </div>
          <Button onClick={() => router.push("/members")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Sponsored">Sponsored</SelectItem>
                <SelectItem value="Scholarship">Scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-500 mb-4">No members have been assigned to teams yet</p>
            <Button onClick={() => router.push("/members")} className="bg-blue-600">
              Go to Members
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.name} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {team.totalPlayers} {team.totalPlayers === 1 ? "Player" : "Players"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      {team.members} Members
                    </span>
                    {team.sponsored > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        {team.sponsored} Sponsored
                      </span>
                    )}
                    {team.scholarships > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {team.scholarships} Scholarships
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.players.map((player) => (
                      <div key={player.id} className="bg-gray-50 p-4 rounded-lg w-full text-left">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${player.photoUrl ? 'cursor-pointer hover:opacity-80' : 'bg-blue-100'}`}>
                            {player.photoUrl ? (
                              <img 
                                src={player.photoUrl} 
                                alt={`${player.firstName} ${player.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {player.firstName} {player.lastName}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {player.role}
                              </Badge>
                              {player.type !== "Member" && (
                                <Badge variant="secondary" className="text-xs">
                                  {player.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage?.url || ""}
        name={selectedImage?.name || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}