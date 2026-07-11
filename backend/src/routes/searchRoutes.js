const express = require('express');

/**
 * Registers search-related routes on the Express app.
 */
function registerSearchRoutes(app, searchController) {
  const router = express.Router();

  router.post('/search-users', searchController.searchUsers);
  router.post('/lookup-user', searchController.lookupUser);
  router.get('/users/:username', searchController.getUserDetails);
  router.get('/health', searchController.health);

  app.use(router);
}

module.exports = registerSearchRoutes;
