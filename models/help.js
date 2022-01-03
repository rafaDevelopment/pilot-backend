'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Help extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Help.belongsTo(models.User)
      models.Help.belongsTo(models.Volunteer)
    }
  };
  Help.init({
    startDate: DataTypes.DATE,
    description: DataTypes.STRING,
    endDate: DataTypes.DATE,
    evaluation: DataTypes.STRING,
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Help',
  });
  return Help;
};