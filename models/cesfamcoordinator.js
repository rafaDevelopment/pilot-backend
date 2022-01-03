'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CesfamCoordinator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.CesfamCoordinator.hasMany(models.Patient)
      models.CesfamCoordinator.hasMany(models.Caregiver)
      models.CesfamCoordinator.hasMany(models.TokenCesfam)
    }
  };
  CesfamCoordinator.init({
    cesfam: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CesfamCoordinator',
  });
  return CesfamCoordinator;
};