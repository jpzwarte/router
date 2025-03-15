/**
 * Represents a route with a path pattern and optional parameters
 */
export interface Route {
  /**
   * The path pattern for the route (e.g., "/users/:id")
   */
  path: string;

  /**
   * Optional metadata associated with the route
   */
  meta?: Record<string, unknown>;

  /**
   * Optional action to execute when the route matches
   */
  action?(match: RouteMatch): Promise<void>;

  /**
   * Optional nested routes
   */
  children?: Route[];
}

/**
 * Represents a matched route with extracted parameters
 */
export interface RouteMatch {
  /**
   * The original route that matched
   */
  route: Route;

  /**
   * Parameters extracted from the URL
   */
  params: Record<string, string>;

  /**
   * The matched path segments
   */
  segments: string[];
}