export default (ctx) => ({
  map: ctx.options.map,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? { cssnano: { preset: 'default' } }
      : {}),
  },
})
