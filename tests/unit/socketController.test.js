jest.mock('../../src/services/messageService', () => ({
  getMessages: jest.fn(),
  addMessage: jest.fn(),
  addN8nResponse: jest.fn(),
  addSystemMessage: jest.fn(),
  getTotalMessages: jest.fn()
}));

const SocketController = require('../../src/controllers/socketController');
const messageService = require('../../src/services/messageService');

describe('SocketController', () => {
  describe('sendRecentMessages', () => {
    it('emits chat history to the connected socket', () => {
      const ioMock = { on: jest.fn() };
      const controller = new SocketController(ioMock);
      const socket = { emit: jest.fn(), id: 'socket-1' };
      const messages = [{ text: 'Hello', sender: 'Tester', timestamp: '2024-01-01T00:00:00.000Z' }];

      messageService.getMessages.mockReturnValue(messages);

      controller.sendRecentMessages(socket);

      expect(messageService.getMessages).toHaveBeenCalledWith(10);
      expect(socket.emit).toHaveBeenCalledWith('chat_history', messages);
    });
  });
});
