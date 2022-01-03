"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity.belongsTo(models.Match)
    }
  }
  Activity.init(
    {
      description: DataTypes.STRING,
      report: DataTypes.STRING,
      accompanimentType: DataTypes.STRING,
      userComment: DataTypes.STRING,
      date: DataTypes.DATE,
      userRating: DataTypes.INTEGER,
      mood: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Activity",
    }
  );
  return Activity;
};
