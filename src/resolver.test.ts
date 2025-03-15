import { describe, it, expect } from 'vitest';
import { Resolver } from './resolver';
import { type Route } from './route';

describe('Resolver', () => {
  const routes: Route[] = [
    { path: '/' },
    { path: '/about' },
    { path: '/users/:id' },
    { path: '/posts/:postId/comments/:commentId' },
    {
      path: '/admin',
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      children: [
        { path: '/profile' },
        {
          path: '/settings',
          children: [
            { path: '/account' },
            { path: '/notifications' }
          ]
        }
      ]
    },
    {
      path: '/organizations/:orgId',
      children: [
        { path: '/members/:memberId' },
        {
          path: '/projects/:projectId',
          children: [
            { path: '/tasks/:taskId' },
            { path: '/settings' }
          ]
        }
      ]
    }
  ];

  const resolver = new Resolver(routes);

  it('should match root path', () => {
    const match = resolver.resolve('/');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/');
    expect(match?.params).toEqual({});
  });

  it('should match static paths', () => {
    const match = resolver.resolve('/about');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/about');
    expect(match?.params).toEqual({});
  });

  it('should match paths with parameters', () => {
    const match = resolver.resolve('/users/123');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/users/:id');
    expect(match?.params).toEqual({ id: '123' });
  });

  it('should match paths with multiple parameters', () => {
    const match = resolver.resolve('/posts/123/comments/456');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/posts/:postId/comments/:commentId');
    expect(match?.params).toEqual({ postId: '123', commentId: '456' });
  });

  it('should handle trailing slashes', () => {
    const match = resolver.resolve('/about/');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/about');
  });

  it('should handle multiple leading slashes', () => {
    const match = resolver.resolve('//about');
    expect(match).not.toBeNull();
    expect(match?.route.path).toBe('/about');
  });

  it('should return null for non-matching paths', () => {
    expect(resolver.resolve('/nonexistent')).toBeNull();
    expect(resolver.resolve('/users')).toBeNull();
    expect(resolver.resolve('/users/123/extra')).toBeNull();
  });

  it('should preserve route metadata', () => {
    const match = resolver.resolve('/admin');
    expect(match).not.toBeNull();
    expect(match?.route.meta).toEqual({ requiresAuth: true });
  });

  it('should match nested routes', () => {
    const profileMatch = resolver.resolve('/dashboard/profile');
    expect(profileMatch).not.toBeNull();
    expect(profileMatch?.route.path).toBe('/profile');
    expect(profileMatch?.segments).toEqual(['dashboard', 'profile']);

    const accountMatch = resolver.resolve('/dashboard/settings/account');
    expect(accountMatch).not.toBeNull();
    expect(accountMatch?.route.path).toBe('/account');
    expect(accountMatch?.segments).toEqual(['dashboard', 'settings', 'account']);
  });

  it('should not match partial nested routes', () => {
    expect(resolver.resolve('/dashboard/nonexistent')).toBeNull();
    expect(resolver.resolve('/dashboard/settings/nonexistent')).toBeNull();
  });

  it('should match nested routes with parameters', () => {
    const memberMatch = resolver.resolve('/organizations/123/members/456');
    expect(memberMatch).not.toBeNull();
    expect(memberMatch?.route.path).toBe('/members/:memberId');
    expect(memberMatch?.params).toEqual({ orgId: '123', memberId: '456' });
    expect(memberMatch?.segments).toEqual(['organizations', '123', 'members', '456']);
  });

  it('should match deeply nested routes with parameters', () => {
    const taskMatch = resolver.resolve('/organizations/123/projects/456/tasks/789');
    expect(taskMatch).not.toBeNull();
    expect(taskMatch?.route.path).toBe('/tasks/:taskId');
    expect(taskMatch?.params).toEqual({
      orgId: '123',
      projectId: '456',
      taskId: '789'
    });
    expect(taskMatch?.segments).toEqual([
      'organizations', '123',
      'projects', '456',
      'tasks', '789'
    ]);
  });

  it('should match nested routes with mixed static and parameter segments', () => {
    const settingsMatch = resolver.resolve('/organizations/123/projects/456/settings');
    expect(settingsMatch).not.toBeNull();
    expect(settingsMatch?.route.path).toBe('/settings');
    expect(settingsMatch?.params).toEqual({
      orgId: '123',
      projectId: '456'
    });
    expect(settingsMatch?.segments).toEqual([
      'organizations', '123',
      'projects', '456',
      'settings'
    ]);
  });
});