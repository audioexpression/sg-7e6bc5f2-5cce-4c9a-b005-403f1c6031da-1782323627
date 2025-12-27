import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // Run migration on app load
  useEffect(() => {
    // Migrate "Masters" team to "Masters 45+"
    const migrateTeamData = () => {
      // Migrate members
      const membersData = localStorage.getItem("members");
      if (membersData) {
        const members = JSON.parse(membersData);
        const updatedMembers = members.map((member: any) => ({
          ...member,
          teamAssignment: member.teamAssignment === "Masters" ? "Masters 45+" : member.teamAssignment
        }));
        localStorage.setItem("members", JSON.stringify(updatedMembers));
      }

      // Migrate teams in settings
      const teamsData = localStorage.getItem("teams");
      if (teamsData) {
        const teams = JSON.parse(teamsData);
        // Remove any "Masters" team and ensure only "Masters 45+" exists
        const filteredTeams = teams.filter((team: any) => team.name !== "Masters");
        // Check if Masters 45+ exists, if not add it
        const hasMasters45 = filteredTeams.some((team: any) => team.name === "Masters 45+");
        if (!hasMasters45) {
          filteredTeams.push({
            id: "masters-45",
            name: "Masters 45+",
            category: "Adult",
            monthlyFee: 0
          });
        }
        localStorage.setItem("teams", JSON.stringify(filteredTeams));
      }
    };

    migrateTeamData();
  }, []);

  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}
