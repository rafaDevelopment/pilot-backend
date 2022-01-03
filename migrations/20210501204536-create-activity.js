"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Activities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATE,
      },
      report: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      accompanimentType: {
        type: Sequelize.STRING,
      },
      userComment: {
        type: Sequelize.STRING,
      },
      userRating: {
        type: Sequelize.INTEGER,
      },
      mood: {
        type: Sequelize.INTEGER,
      },
      MatchId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: "Matches", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Activities");
  },
};
