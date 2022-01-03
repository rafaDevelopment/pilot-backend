'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Patients', // name of Source model
      'CesfamCoordinatorId', // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'CesfamCoordinators', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    ).then(() => {
      // Order hasMany Product
      return queryInterface.addColumn(
        'Caregivers', // name of Source model
        'CesfamCoordinatorId', // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'CesfamCoordinators', // name of Target model
            key: 'id', // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }
      );
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
