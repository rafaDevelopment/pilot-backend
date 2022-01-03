'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tuesday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Tuesday.belongsTo(models.Volunteer);
    }
  };
  Tuesday.init({
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tuesday',
  });
  return Tuesday;
};