import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Edit3,
  RefreshCw,
  Eye,
  Trash2,
  Folder,
  Plus,
  Copy,
} from "lucide-react";
import { MappingListItem } from "../types";
import { api } from "../api/client";

function MappingManager() {
  const [mappings, setMappings] = useState<MappingListItem[]>([]);
  const [currentMapping, setCurrentMapping] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load mappings and system status
  const loadMappings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [mappingsData, statusData] = await Promise.all([
        api.mappings.getAll(),
        api.system.getStatus(),
      ]);

      setMappings(mappingsData);
      setCurrentMapping(statusData.currentMapping);
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to load mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const filteredMappings = mappings.filter(
    (mapping) =>
      mapping.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mapping.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleSwitchMapping = async (mappingName: string): Promise<void> => {
    try {
      setError(null);
      await api.mappings.switchActive(mappingName);

      // Update local state
      setCurrentMapping(mappingName);
      setMappings((prev) =>
        prev.map((mapping) => ({
          ...mapping,
          isActive: mapping.name === mappingName,
        })),
      );
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to switch mapping:", err);
    }
  };

  const handleDuplicate = async (mapping: MappingListItem): Promise<void> => {
    try {
      const baseName = mapping.name.replace(".json", "");
      const newName = `${baseName}-copy.json`;
      const newTitle = `${mapping.title} Copy`;

      await api.mappings.duplicate(mapping.name, newName, newTitle);
      await loadMappings(); // Refresh the list
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to duplicate mapping:", err);
    }
  };

  const handleDelete = async (mapping: MappingListItem): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete "${mapping.title}"?`)) {
      try {
        await api.mappings.delete(mapping.name);
        await loadMappings(); // Refresh the list
      } catch (err) {
        setError(api.utils.getErrorMessage(err));
        console.error("Failed to delete mapping:", err);
      }
    }
  };

  const handleCreateNew = async (): Promise<void> => {
    try {
      const name = prompt("Enter mapping name:");
      if (!name) return;

      const title = prompt("Enter mapping title:") || name;
      const description = prompt("Enter mapping description (optional):") || "";

      const filename = name.endsWith(".json") ? name : `${name}.json`;
      await api.mappings.create(filename, title, description);
      await loadMappings(); // Refresh the list
    } catch (err) {
      setError(api.utils.getErrorMessage(err));
      console.error("Failed to create mapping:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-96 text-secondary">
          Loading mappings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Mapping Manager</h1>
        <p className="text-secondary m-0">
          Manage your LED light show mappings
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search mappings..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full bg-gray-850 border border-default rounded-md px-3 py-3 pl-10 text-sm text-primary transition-all duration-200 focus:outline-none focus:border-primary-600 focus:shadow-sm placeholder:text-muted"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium text-sm transition-all duration-200 inline-flex items-center gap-2 hover:bg-primary-700 hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Create New
          </button>
          <button
            onClick={loadMappings}
            className="px-4 py-2 bg-gray-700 text-secondary rounded-md hover:bg-gray-600 hover:text-primary transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Active Mapping */}
      {currentMapping && (
        <div
          className="bg-gray-850 border border-primary-600 rounded-lg p-6 mb-6 transition-all duration-200"
          style={{ backgroundColor: "rgba(0, 102, 204, 0.1)" }}
        >
          <div className="mb-4 pb-4 border-b border-default">
            <h3 className="text-lg font-semibold m-0">Currently Active</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">
                {mappings.find((m) => m.name === currentMapping)?.title ||
                  currentMapping}
              </div>
              <div className="text-secondary text-sm">
                {mappings.find((m) => m.name === currentMapping)?.description ||
                  "No description available"}
              </div>
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(40, 167, 69, 0.2)",
                color: "var(--success)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Active
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="bg-gray-850 border border-red-500 rounded-lg p-6 mb-6 transition-all duration-200"
          style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}
        >
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Mappings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMappings.map((mapping) => (
          <div
            key={mapping.name}
            className="bg-gray-850 border border-default rounded-lg p-6 transition-all duration-200 hover:border-light hover:shadow-lg"
          >
            <div className="mb-4 pb-4 border-b border-default">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold m-0">{mapping.title}</h3>
                  <p className="text-secondary text-sm mt-2 m-0">
                    {mapping.description}
                  </p>
                </div>
                {mapping.isActive && (
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(40, 167, 69, 0.2)",
                      color: "var(--success)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    Active
                  </div>
                )}
              </div>
            </div>

            {/* Mapping Stats */}
            <div className="flex gap-6 mb-6">
              <div>
                <div className="text-xs text-muted">Presets</div>
                <div className="font-semibold">{mapping.presetCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Modified</div>
                <div className="font-semibold text-sm">
                  {mapping.lastModified}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {!mapping.isActive ? (
                <button
                  onClick={() => handleSwitchMapping(mapping.name)}
                  className="px-6 py-3 bg-green-600 text-white rounded-md font-medium text-sm transition-all duration-200 inline-flex items-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 w-full justify-center"
                >
                  <Zap size={16} />
                  Activate
                </button>
              ) : (
                <Link
                  to={`/mappings/${mapping.name.replace(".json", "")}`}
                  className="w-full no-underline"
                >
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium text-sm transition-all duration-200 inline-flex items-center gap-2 hover:bg-primary-700 hover:-translate-y-0.5 w-full justify-center">
                    <Edit3 size={16} />
                    Edit
                  </button>
                </Link>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicate(mapping)}
                  className="px-4 py-2 bg-gray-850 border border-default text-secondary rounded-md font-medium text-xs transition-all duration-200 inline-flex items-center gap-2 hover:bg-hover hover:border-light hover:text-primary flex-1 justify-center"
                >
                  <Copy size={16} />
                  Duplicate
                </button>
                <Link
                  to={`/mappings/${mapping.name.replace(".json", "")}`}
                  className="flex-1 no-underline"
                >
                  <button className="px-4 py-2 bg-gray-850 border border-default text-secondary rounded-md font-medium text-xs transition-all duration-200 inline-flex items-center gap-2 hover:bg-hover hover:border-light hover:text-primary w-full justify-center">
                    <Eye size={16} />
                    View
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(mapping)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-xs transition-all duration-200 inline-flex items-center gap-2 hover:bg-red-700 flex-1 justify-center"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMappings.length === 0 && !loading && (
        <div className="bg-gray-850 border border-default rounded-lg p-6 transition-all duration-200 hover:border-light hover:shadow-lg text-center py-12">
          <div className="mb-4">
            <Folder size={64} className="mx-auto text-secondary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No mappings found</h3>
          <p className="text-secondary mb-8">
            {searchTerm
              ? `No mappings match "${searchTerm}"`
              : "Create your first mapping to get started"}
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium text-sm transition-all duration-200 inline-flex items-center gap-2 hover:bg-primary-700 hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Create New Mapping
          </button>
        </div>
      )}
    </div>
  );
}

export default MappingManager;
