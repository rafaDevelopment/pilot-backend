"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Volunteers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      senior: {
        type: Sequelize.BOOLEAN,
      },
      adult: {
        type: Sequelize.BOOLEAN,
      },
      adolescence: {
        type: Sequelize.BOOLEAN,
      },
      children: {
        type: Sequelize.BOOLEAN,
      },
      accompaniment: {
        type: Sequelize.STRING,
      },
      matches: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      PersonId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: "People", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Volunteers");
  },
};
