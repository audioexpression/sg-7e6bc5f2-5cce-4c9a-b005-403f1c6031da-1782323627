import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Send,
  Users,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Team {
  id: string;
  name: string;
  category: "Junior" | "Youth" | "Adult";
  whatsappLink?: string;
}

export default function Communication() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      try {
        setTeams(JSON.parse(savedTeams));
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    }
  }, []);

  const handleCopyAndGo = async (teamName: string, link: string) => {
    if (!message.trim()) {
      toast({
        title: "Message empty",
        description: "Please write a message first.",
        variant: "destructive",
      });
      return;
    }

    if (!link) {
      toast({
        title: "No Link Found",
        description: `Please add a WhatsApp link for ${teamName} in Settings.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(message);

      toast({
        title: "✅ Message Copied!",
        description: "WhatsApp is opening... simply PASTE your message there.",
        duration: 4000,
      });

      // Open WhatsApp Group
      setTimeout(() => {
        window.open(link, "_blank");
      }, 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Clipboard Error",
        description: "Could not copy text. Please copy manually.",
        variant: "destructive",
      });
      // Still open the link
      setTimeout(() => {
        window.open(link, "_blank");
      }, 1000);
    }
  };

  const categories = ["All", "Junior", "Youth", "Adult"];
  const filteredTeams = teams.filter(t => selectedCategory === "All" || t.category === selectedCategory);

  return (
    <>
      <SEO 
        title="Communication Hub - Bali Bulldogs"
        description="Broadcast messages to team WhatsApp groups"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Communication Hub</h1>
              <p className="text-gray-600">Broadcast messages to team WhatsApp groups</p>
            </div>
            <Button onClick={() => router.push("/settings")} variant="outline">
              Manage Team Links
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Message Composer */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle>Compose Message</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    Write your announcement here
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Type your message here... (e.g. Training cancelled due to rain 🌧️)"
                    className="min-h-[300px] text-lg p-4 mb-4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  
                  <Alert className="bg-blue-50 border-blue-200 mb-4">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 text-sm">
                      <strong>How it works (WhatsApp Groups Restriction):</strong>
                      <ol className="list-decimal ml-4 mt-2 space-y-1">
                        <li>Write your message above.</li>
                        <li>Click <strong>"Copy & Go"</strong> for your target team.</li>
                        <li>When WhatsApp opens, <strong>PASTE</strong> the message and send.</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{message.length} characters</span>
                    {message && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMessage("")}
                        className="text-red-500 hover:text-red-700"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Team Selector */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="All" onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTeams.map((team) => (
                      <Card key={team.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{team.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {team.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              {team.whatsappLink ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" /> Link Connected
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> No Link Set
                                </span>
                              )}
                            </p>
                          </div>
                          
                          <Button
                            onClick={() => handleCopyAndGo(team.name, team.whatsappLink || "")}
                            disabled={!team.whatsappLink}
                            className={`gap-2 ${team.whatsappLink ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-400'}`}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy & Go</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredTeams.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No teams found in this category.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}