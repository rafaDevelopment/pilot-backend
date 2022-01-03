"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Volunteer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Volunteer.belongsTo(models.Person);
      models.Volunteer.belongsToMany(models.PersonalInterest, {
        through: models.VolunteerPersonalInterest,
      });
      models.Volunteer.belongsToMany(models.Coordinator, {
        through: models.VolunteerCoordinator,
        as: "gcoordinators"
      });
      models.Volunteer.hasOne(models.Coordinator);
      models.Volunteer.hasMany(models.Match);
      models.Volunteer.hasMany(models.Monday);
      models.Volunteer.hasMany(models.Tuesday);
      models.Volunteer.hasMany(models.Wednesday);
      models.Volunteer.hasMany(models.Thursday);
      models.Volunteer.hasMany(models.Friday);
      models.Volunteer.hasMany(models.Saturday);
      models.Volunteer.hasMany(models.Sunday);
      models.Volunteer.belongsToMany(models.User, {
        through: models.UserVolunteer,
      });
      models.Volunteer.hasMany(models.Help);
    }
  }
  Volunteer.init(
    {
      senior: DataTypes.BOOLEAN,
      adult: DataTypes.BOOLEAN,
      adolescence: DataTypes.BOOLEAN,
      children: DataTypes.BOOLEAN,
      accompaniment: DataTypes.STRING,
      matches: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Volunteer",
    }
  );
  return Volunteer;
};
