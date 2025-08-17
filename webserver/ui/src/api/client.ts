// API Client for LED Mapping System
// Handles all communication with the Go backend

import {
  SystemStatus,
  MappingListItem,
  MappingFile,
  SwitchMappingRequest,
} from "../types";

// Base API configuration
const API_BASE_URL = "/api";

// Error handling for API responses
class APIError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        errorText || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
      );
    }

    // Handle empty responses (like DELETE operations)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing errors
    throw new APIError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0,
    );
  }
}

// System Status API
export const systemAPI = {
  // Get current system status
  getStatus: (): Promise<SystemStatus> => {
    return apiRequest<SystemStatus>("/status");
  },
};

// Mapping Management API
export const mappingAPI = {
  // Get list of all available mappings
  getAll: (): Promise<MappingListItem[]> => {
    return apiRequest<MappingListItem[]>("/mappings");
  },

  // Get specific mapping by name
  get: (name: string): Promise<MappingFile> => {
    const mappingName = name.endsWith(".json") ? name : `${name}.json`;
    return apiRequest<MappingFile>(
      `/mappings/${encodeURIComponent(mappingName)}`,
    );
  },

  // Save/update a mapping
  save: (name: string, mapping: MappingFile): Promise<{ status: string }> => {
    const mappingName = name.endsWith(".json") ? name : `${name}.json`;
    return apiRequest<{ status: string }>(
      `/mappings/${encodeURIComponent(mappingName)}`,
      {
        method: "PUT",
        body: JSON.stringify(mapping),
      },
    );
  },

  // Delete a mapping
  delete: (name: string): Promise<{ status: string }> => {
    const mappingName = name.endsWith(".json") ? name : `${name}.json`;
    return apiRequest<{ status: string }>(
      `/mappings/${encodeURIComponent(mappingName)}`,
      {
        method: "DELETE",
      },
    );
  },

  // Switch active mapping
  switchActive: (filename: string): Promise<void> => {
    const request: SwitchMappingRequest = { file: filename };
    return apiRequest<void>("/switchMapping", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Create a new mapping
  create: (
    name: string,
    title: string,
    description?: string,
  ): Promise<{ status: string }> => {
    const newMapping: MappingFile = {
      name: title,
      description: description || "",
      presets: [],
    };

    return mappingAPI.save(name, newMapping);
  },

  // Duplicate an existing mapping
  duplicate: async (
    originalName: string,
    newName: string,
    newTitle?: string,
  ): Promise<{ status: string }> => {
    const originalMapping = await mappingAPI.get(originalName);
    const duplicatedMapping: MappingFile = {
      ...originalMapping,
      name: newTitle || `${originalMapping.name} Copy`,
      description: `Copy of ${originalMapping.description || originalMapping.name}`,
    };

    return mappingAPI.save(newName, duplicatedMapping);
  },
};

// Utility functions for API operations
export const apiUtils = {
  // Check if the API is available
  healthCheck: async (): Promise<boolean> => {
    try {
      await systemAPI.getStatus();
      return true;
    } catch {
      return false;
    }
  },

  // Get error message from API error
  getErrorMessage: (error: unknown): string => {
    if (error instanceof APIError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  },

  // Check if error is a specific HTTP status
  isErrorStatus: (error: unknown, status: number): boolean => {
    return error instanceof APIError && error.status === status;
  },

  // Retry function for failed requests
  retryRequest: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Don't retry client errors (4xx)
        if (
          error instanceof APIError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          break;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  },
};

// Effects Management API
export const effectsAPI = {
  // Trigger a preset effect manually
  trigger: (
    note: number,
    velocity: number = 127,
  ): Promise<{ status: string; note: string }> => {
    return apiRequest<{ status: string; note: string }>("/trigger", {
      method: "POST",
      body: JSON.stringify({ note, velocity, on: true }),
    });
  },

  // Turn off a preset effect manually
  triggerOff: (
    note: number,
    velocity: number = 0,
  ): Promise<{ status: string; note: string }> => {
    return apiRequest<{ status: string; note: string }>("/trigger", {
      method: "POST",
      body: JSON.stringify({ note, velocity, on: false }),
    });
  },

  // Clear all active effects
  clearAll: (): Promise<{ status: string }> => {
    return apiRequest<{ status: string }>("/trigger/clear", {
      method: "POST",
    });
  },

  // Preview an effect on LEDs without saving a mapping
  preview: (
    first: number,
    last: number,
    step: number,
    color: string,
    effect: string,
    options: any,
  ): Promise<{ status: string; effect: string }> => {
    return apiRequest<{ status: string; effect: string }>("/preview-effect", {
      method: "POST",
      body: JSON.stringify({
        first,
        last,
        step,
        color,
        effect,
        options,
        on: true,
      }),
    });
  },

  // Turn off preview effect
  previewOff: (
    first: number,
    last: number,
    step: number,
    color: string,
    effect: string,
    options: any,
  ): Promise<{ status: string; effect: string }> => {
    return apiRequest<{ status: string; effect: string }>("/preview-effect", {
      method: "POST",
      body: JSON.stringify({
        first,
        last,
        step,
        color,
        effect,
        options,
        on: false,
      }),
    });
  },

  // Clear all preview effects
  clearPreview: (): Promise<{ status: string }> => {
    return apiRequest<{ status: string }>("/preview-effect/clear", {
      method: "POST",
    });
  },
};

// Export everything as a unified API client
export const api = {
  system: systemAPI,
  mappings: mappingAPI,
  effects: effectsAPI,
  utils: apiUtils,
};

export default api;

// Type exports for convenience
export type { APIError };
