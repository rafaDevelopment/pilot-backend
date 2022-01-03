"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Coordinator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Coordinator.belongsTo(models.Volunteer);
      models.Coordinator.belongsToMany(models.Volunteer, {
        through: models.VolunteerCoordinator,
        as: "volunteerees"
      });
    }
  }
  Coordinator.init(
    {},
    {
      sequelize,
      modelName: "Coordinator",
    }
  );
  return Coordinator;
};
