export interface ToolExecutionContext {
  user: {
    userId: string;
    email: string;
    name: string;
  };
  sessionId: string;
}

export interface ErrorResponse {
  type: 'error';
  error: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}
