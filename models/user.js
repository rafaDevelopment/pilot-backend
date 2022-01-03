"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.belongsTo(models.Person);
      models.User.hasOne(models.Patient);
      models.User.hasOne(models.Caregiver);
      models.User.belongsToMany(models.PersonalInterest, {
        through: models.UserPersonalInterest,
      });
      models.User.belongsToMany(models.Volunteer, {
        through: models.UserVolunteer,
      });
      models.User.hasMany(models.Match);
      models.User.hasMany(models.Help);
    }
  }
  User.init(
    {},
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
