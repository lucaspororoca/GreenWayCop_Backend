const authService = require('../../services/auth.service');
const db = require('../../config/db');
const logger = require('../../config/logger');

jest.mock('../../config/db');
jest.mock('../../config/logger');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('deve retornar token para credenciais válidas', async () => {
      const mockUser = { id: 1, email: 'test@example.com', senha: '123456' };
      db.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      const token = await authService.authenticate('test@example.com', '123456');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('deve lançar erro para credenciais inválidas', async () => {
      db.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      await expect(authService.authenticate('invalid@example.com', 'wrong'))
        .rejects
        .toThrow('Credenciais inválidas');
    });
  });
});