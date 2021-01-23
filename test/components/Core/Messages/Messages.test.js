const assert = require('chai').assert;
const Messages = require('../../../../xiera/components/Core/Messages/Messages').Messages;
const Message = new Messages();

describe('Messages', () => {
  describe('1) New Messages', () => {
    it ('A new message is empty', () => {
      assert.isEmpty(Message.getMessage());
    });
  });
  describe('2) Adding messages without a new line', () => {
    describe('A) Adding normal messages', () => {
      it ('Adding \'matoi\' produces a message containing \'matoi\'', () => {
        Message.addMessage('matoi');
        assert.equal('matoi', Message.getMessage());
      });
      it ('Adding \'acookie\' produces a message containing \'matoiacookie\'', () => {
        Message.addMessage('acookie');
        assert.equal('matoiacookie', Message.getMessage());
      });
    });
    describe('B) Adding header messages', () => {
      it('Adding \'give\' as a header produces a message containing \'give\\nmatoiacookie\'', () => {
        Message.addHeaderMessage('give');
        assert.equal('give\nmatoiacookie', Message.getMessage());
      });
    });
  });
  describe('3) Adding messages with a new line', () => {
    describe('A) Adding normal messages', () => {
      it('Adding \'andxiaotoo\' produces a message containing \'give\\nmatoiacookieandnxiaotoo\\n\'', () => {
        Message.addMessageln('andxiaotoo');
        assert.equal('give\nmatoiacookieandxiaotoo\n', Message.getMessage());
      });
    });
    describe('B) Adding header messages', () => {
      it('Adding \'attention\' produces a message containing \'attention\\n\\ngive\\nmatoiacookieandxiaotoo\\n\'', () => {
        Message.addHeaderMessageln('attention');
        assert.equal('attention\n\ngive\nmatoiacookieandxiaotoo\n', Message.getMessage());
      });
    });
  });
});
