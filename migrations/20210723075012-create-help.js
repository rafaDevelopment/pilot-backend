'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Help', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startDate: {
        type: Sequelize.DATE
      },
      description: {
        type: Sequelize.STRING
      },
      endDate: {
        type: Sequelize.DATE
      },
      evaluation: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      UserId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: "Users", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      VolunteerId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: "Volunteers", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Help');
  }
};