import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

await fastify.listen({ port: parseInt(process.env.PORT) || 8080 });
