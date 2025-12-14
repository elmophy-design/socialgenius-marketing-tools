import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('Authentication Tests', () => {
    const API_URL = 'http://localhost:4000/api/auth';
    
    it('should return health check', async () => {
        const response = await fetch('http://localhost:4000/health');
        const data = await response.json();
        assert.strictEqual(data.status, 'OK');
    });

    it('should test auth routes exist', async () => {
        const response = await fetch(`${API_URL}/test`);
        const data = await response.json();
        assert.strictEqual(data.success, true);
    });

    // Add more tests as needed
});