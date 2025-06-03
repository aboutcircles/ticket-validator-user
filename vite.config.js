export default defineConfig({
  base: "/ticket-validator-user/", // 👈 ADD THIS
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
