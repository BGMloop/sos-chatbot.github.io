export default {
  providers: [
    {
      domain: "model-gull-69.clerk.accounts.dev",
      applicationID: "convex",
      userFields: ["email", "firstName", "lastName", "id"],
      defaultUser: {
        name: "Anonymous User",
        role: "user"
      }
    },
  ]
}; 