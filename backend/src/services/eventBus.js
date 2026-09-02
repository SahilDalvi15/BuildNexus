import { EventEmitter } from 'events';

class EventBus extends EventEmitter {}
const eventBus = new EventBus();

// Increase max listeners if needed
eventBus.setMaxListeners(20);

export default eventBus;
