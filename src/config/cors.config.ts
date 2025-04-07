export const corsConfig = {
  origin: "https://solo-leveling-rho.vercel.app",
  methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  credentials: true,
};
export const corsConfigDev = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  credentials: true,
};
