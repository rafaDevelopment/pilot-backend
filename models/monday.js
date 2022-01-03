'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Monday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Monday.belongsTo(models.Volunteer);
    }
  };
  Monday.init({
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Monday',
  });
  return Monday;
};