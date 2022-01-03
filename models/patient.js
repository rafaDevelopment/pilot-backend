"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Patient.belongsTo(models.User);
      models.Patient.belongsTo(models.CesfamCoordinator);
      models.Patient.hasMany(models.EmergencyContact);
      models.Patient.belongsToMany(models.Caregiver, {
        through: models.PatientCaregiver,
      });
    }
  }
  Patient.init(
    {
      hospital: DataTypes.STRING,
      religion: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Patient",
    }
  );
  return Patient;
};
