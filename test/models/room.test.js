const assert = require('assert');
const Room = require('../../app/models/Room');

describe('Room Model', function () {
  it('should create a valid Room instance', function () {
    const room = new Room({ name: 'Team Standup', roomId: '123' });
    const error = room.validateSync();
    assert.strictEqual(room.name, 'Team Standup');
    assert.strictEqual(room.roomId, '123');
    assert.strictEqual(error, undefined);
  });

  it('should throw validation error for missing name', function () {
    const room = new Room({ roomId: '123' });
    const error = room.validateSync();
    assert(error);
    assert(error.errors['name']);
  });

  it('should throw validation error for missing roomId', function () {
    const room = new Room({ name: 'Team Standup' });
    const error = room.validateSync();
    assert(error);
    assert(error.errors['roomId']);
  });
});
