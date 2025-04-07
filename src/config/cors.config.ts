export const corsConfig = {
  origin: [process.env.CORS_ORIGIN1, process.env.CORS_ORIGIN2, process.env.CORS_ORIGIN3],
  methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  credentials: true,
};

