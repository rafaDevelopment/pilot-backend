'use strict';
const db = require("../models");
const bcrypt = require("bcrypt");
const faker = require('faker');
const cliProgress = require('cli-progress');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // coordCesfams.push(
    //   (await db.CesfamCoordinator.create({
    //     email: 'vicentevegaulloa@cesfam.com',
    //     cesfam: 'Cesfam Bernardita',
    //     password,
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }))
    // )
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
