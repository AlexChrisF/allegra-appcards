export {
  fetchGitHubProjects,
  fetchAllegraProjects,
  fetchGitHubColumns,
  fetchGitHubColumn,
  fetchGitHubProjectCards,
  fetchGitHubIssues,
  fetchAllegraItems,
  fetchGitHubProjectCard,
  fetchGitHubCollaborators,
  createGitHubIssue,
  createGitHubProjectCard,
  updateGitHubIssue,
  updateGitHubProjectCard,
} from "./github";

export {
  insertAppCards,
  removeSelectedItem,
  insertGitHubAppCards,
  insertAllegraAppCards,
} from "./miro";

export { supabase } from "./supabase";

export const getStatusColor = async (status: string) => {
  let color;

  switch (status) {
    case "To Do":
      color = "#E53935";
      break;
    case "In Progress":
      color = "#FFB300";
      break;
    case "Done":
      color = "#7CB342";
      break;
    default:
      color = "#C3C4C3";
      break;
  }

  return color;
};
