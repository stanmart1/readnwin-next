interface RouteTest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  requiredPermission?: string;
  expectedStatus: number;
}

export const routeTests: RouteTest[] = [
  { path: '/api/dashboard/library', method: 'GET', requiresAuth: true, expectedStatus: 200 },
  { path: '/api/dashboard/stats', method: 'GET', requiresAuth: true, expectedStatus: 200 },
  { path: '/api/admin/books', method: 'GET', requiresAuth: true, requiredPermission: 'books.read', expectedStatus: 200 },
  { path: '/api/admin/users', method: 'GET', requiresAuth: true, requiredPermission: 'users.read', expectedStatus: 200 },
];

export async function testRoutes() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const results = [];
  
  for (const test of routeTests) {
    try {
      const response = await fetch(`${baseUrl}${test.path}`, { method: test.method });
      const passed = response.status === test.expectedStatus;
      
      results.push({
        ...test,
        actualStatus: response.status,
        passed
      });
    } catch (error) {
      results.push({
        ...test,
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false
      });
    }
  }
  
  return results;
}