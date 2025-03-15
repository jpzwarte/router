/// <reference types="urlpattern-polyfill" />
import { Route, RouteMatch } from './route';

export class Resolver {
  #patterns: Map<Route, URLPattern>;
  #routes: Route[];

  /**
   * Creates a new Resolver instance
   */
  constructor(routes: Route[]) {
    this.#routes = routes;
    this.#patterns = new Map();
    this.#processRoutes(routes);
  }

  /**
   * Resolves a path against the registered routes
   */
  resolve(path: string): RouteMatch | null {
    const normalizedPath = this.#normalizePath(path);

    for (const [route, pattern] of this.#patterns) {
      const result = pattern.exec({ pathname: normalizedPath });
      if (result?.pathname.groups) {
        return {
          route,
          params: result.pathname.groups as Record<string, string>,
          segments: normalizedPath.split('/').filter(Boolean)
        };
      }
    }

    return null;
  }

  /**
   * Normalizes a path by removing trailing slashes and ensuring leading slash
   */
  #normalizePath(path: string): string {
    return '/' + path.replace(/^\/+|\/+$/g, '');
  }

  /**
   * Processes routes recursively to build URLPattern objects
   */
  #processRoutes(routes: Route[], parentPath = ''): void {
    for (const route of routes) {
      const fullPath = this.#normalizePath(parentPath + route.path);
      this.#patterns.set(route, new URLPattern({ pathname: fullPath }));

      if (route.children?.length) {
        this.#processRoutes(route.children, fullPath);
      }
    }
  }
}