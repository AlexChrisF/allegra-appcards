import * as React from "react";
import ReactDOM from "react-dom";
import {
  GitHubIssueHeader,
  GitHubIssueRow,
  Select,
  Loader,
} from "./components";
import {
  fetchGitHubProjects,
  fetchAllegraProjects,
  fetchGitHubColumns,
  fetchGitHubProjectCards,
  fetchGitHubIssues,
  fetchAllegraItems,
  insertGitHubAppCards,
  insertAllegraAppCards,
} from "./utils";
import type {
  GitHubProject,
  AllegraProject,
  GitHubColumns,
  GitHubProjectCard,
  GitHubIssue,
  AllegraItem,
} from "./types";
import { username, repo } from "./constants";

function Modal() {
  // Store loading state of GitHub Cards
  const [loading, setLoading] = React.useState<boolean>(true);

  const [selectedGitHubIssues, setSelectedGitHubIssues] = React.useState<
    GitHubIssue[]
  >([]);

  const [selectedAllegraItems, setSelectedAllegraItems] = React.useState<
  AllegraItem[]
>([]);

  /**
   * Store information pulled from GitHub API
   */
  const [gitHubProjects, setGitHubProjects] = React.useState<GitHubProject[]>(
    [],
  );
  const [allegraProjects, setAllegraProjects] = React.useState<AllegraProject[]>(
    [],
  );

  const [gitHubColumns, setGitHubColumns] = React.useState<GitHubColumns[]>([]);
  const [gitHubProjectCards, setGitHubProjectCards] = React.useState<
    GitHubProjectCard[]
  >([]);
  const [gitHubIssues, setGitHubIssues] = React.useState<GitHubIssue[]>([]);

  const [allegraItems, setAllegraItems] = React.useState<AllegraItem[]>([]);

  /**
   * Store selection options
   */
  const [selectedProject, setSelectedProject] = React.useState<GitHubProject>({
    name: "",
    body: "",
    id: 0,
  });

  // Fetch  GitHub Projects 
  React.useEffect(() => {
    const getGitHubProjects = async () => {
      try {
        const gitHubProjects = await fetchGitHubProjects(username, repo);

        setGitHubProjects([...gitHubProjects]);
      } catch (error) {
        console.error(error);
      }
    };

    getGitHubProjects();
  }, []);

  // Fetch  Allegra Projects DONE 
  React.useEffect(() => {
    const getAllegraProjects = async () => {
      try {
        const allegraProjects = await fetchAllegraProjects();
        setAllegraProjects([...allegraProjects]);
      } catch (error) {
        console.error(error);
      }
    };
    getAllegraProjects();
  }, []);


  // Fetch GitHub Issues
  React.useEffect(() => {
    const getGitHubIssues = async () => {
      try {
        const gitHubIssues = await fetchGitHubIssues(username, repo);
        setGitHubIssues([...gitHubIssues]);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    getGitHubIssues();
  }, [gitHubProjects]);


  // Fetch Allegra Items
  React.useEffect(() => {
    const getAllegraItems = async () => {
      try {
        let allegraItems = await fetchAllegraItems(selectedProject.id);
        console.log("xxx", allegraItems);
        if(allegraItems?.items === undefined) {
          allegraItems = [];
        }
        allegraItems = allegraItems.items.map((item: any) => {
          console.log(item);
          return {
            id: item.id,
            title: item.fieldValues.fSynopsis,
            created_at: item.fieldValues.fCreateDate_Raw,
            state: item.fieldValues.fStatus,
            url: item.fieldValues.fSynopsis,
          };
        });
        console.log("aksdlöakd", allegraItems);
        setAllegraItems([...allegraItems]);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getAllegraItems();
  }, [selectedProject]);




  // Fetch GitHub Cards
  React.useEffect(() => {
    const getGitHubCards = () => {
      if (gitHubColumns.length > 0) {
        gitHubColumns.map(async (column) => {
          try {
            const gitHubCards = await fetchGitHubProjectCards(
              column.id.toString(),
            );

            setGitHubProjectCards((previousState) => [
              ...previousState,
              ...gitHubCards,
            ]);
          } catch (error) {
            console.error(error);
          }
        });
      }
    };

    getGitHubCards();
  }, [gitHubColumns]);

  // Fetch GitHub Issues
  React.useEffect(() => {
    const getGitHubIssues = async () => {
      try {
        const gitHubIssues = await fetchGitHubIssues(username, repo);
        setGitHubIssues([...gitHubIssues]);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    getGitHubIssues();
  }, [gitHubProjectCards]);

  const filterGitHubIssues = () => {
    // Filter out issues that aren't in the current GitHub project
    const filteredGitHubIssues = gitHubIssues.filter((issue) => {
      return gitHubProjectCards.some((gitHubProjectCard) => {
        return gitHubProjectCard.content_url === issue.url;
      });
    });

    const filteredGitHubIssuesWithStatus = filteredGitHubIssues
      .map((issue) => {
        // Find matching GitHub Project Card for Issue
        const matchingGitHubProjectCard = gitHubProjectCards.find(
          (card) => card.content_url === issue.url,
        );

        if (matchingGitHubProjectCard === undefined) {
          return null;
        }

        // Find Project Column ID the card lives in
        const columnId = matchingGitHubProjectCard.column_url
          .split("https://api.github.com/projects/columns/")
          .pop();

        // Find the name of the column
        const status = gitHubColumns.find(
          (column) => column.id.toString() === columnId,
        );

        // Return issue with column and card attached
        return {
          ...issue,
          status: status || { name: "", id: null },
          gitHubProjectCard: matchingGitHubProjectCard,
        };
      })
      .filter(Boolean);

    return filteredGitHubIssuesWithStatus;
  };

  // Handle when a GitHubIssueRow is selected or not
  const handleAllegraItemSelect = (isChecked: boolean, item: AllegraItem) => {
    //  Set ore remove issue into selected state
    if (isChecked) {
      setSelectedAllegraItems((previousState) => [...previousState, item]);
    } else {
      const updatedAllegraItems = selectedGitHubIssues.filter(
        (currentItem) => currentItem.id !== item.id,
      );
      setSelectedGitHubIssues([...updatedAllegraItems]);
    }
  };

  // Handle importing and converting GitHub issues to App Cards
  const handleImportClick = async () => {
    try {
      await insertAllegraAppCards(selectedAllegraItems);

      await miro.board.ui.closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-container wrapper">
      <h2>Choose from Allegra</h2>
      <Select
        label="Select Allegra Project"
        required={true}
        options={allegraProjects}
        onChange={(e) => setSelectedProject(JSON.parse(e.target.value))}
      />
      <div className="modal-grid">
        <GitHubIssueHeader />

        {loading ? (
          <div className="loader-container">
            <Loader />
          </div>
        ) : (
          <>
            {allegraItems.map((item, index) => (
              <GitHubIssueRow
                title={item.title}
                date={item.created_at}
                status={item.status}
                onSelect={(value) => handleAllegraItemSelect(value, item)}
                key={index}
              />
            ))}
          </>
        )}
      </div>
      <button
        className="button button-primary"
        type="button"
        onClick={handleImportClick}
        disabled={selectedAllegraItems.length === 0}
      >
        Import
      </button>
    </div>
  );
}

ReactDOM.render(<Modal />, document.getElementById("modal-root"));
