'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const personalInterests = [];

    personalInterests.push({
      name: "Cine",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Música",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Deporte",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Jardinería",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Manualidades",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Juegos de mesa",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    personalInterests.push({
      name: "Animales",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return queryInterface.bulkInsert("PersonalInterests", personalInterests);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
