"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PersonalInterest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.PersonalInterest.belongsToMany(models.User, {
        through: models.UserPersonalInterest,
      });
      models.PersonalInterest.belongsToMany(models.Volunteer, {
        through: models.VolunteerPersonalInterest,
      });
    }
  }
  PersonalInterest.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PersonalInterest",
    }
  );
  return PersonalInterest;
};
