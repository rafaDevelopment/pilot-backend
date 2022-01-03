"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Caregiver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Caregiver.belongsTo(models.User);
      models.Caregiver.belongsTo(models.CesfamCoordinator);
      models.Caregiver.belongsToMany(models.Patient, {
        through: models.PatientCaregiver,
      });
    }
  }
  Caregiver.init(
    {},
    {
      sequelize,
      modelName: "Caregiver",
    }
  );
  return Caregiver;
};
