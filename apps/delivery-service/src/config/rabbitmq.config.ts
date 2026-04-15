export default () => ({
  uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
  exchanges: [
    { name: 'delivery.events', type: 'topic' },
    { name: 'commerce.events', type: 'topic' },
    { name: 'barter.events', type: 'topic' },
  ],
});
