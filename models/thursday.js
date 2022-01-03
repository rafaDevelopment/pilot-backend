'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Thursday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Thursday.belongsTo(models.Volunteer);
    }
  };
  Thursday.init({
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Thursday',
  });
  return Thursday;
};