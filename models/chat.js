"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Chat.belongsToMany(models.Person, {
        through: models.PersonChat,
      });
      models.Chat.hasMany(models.Message);
    }
  }
  Chat.init(
    {},
    {
      sequelize,
      modelName: "Chat",
    }
  );
  return Chat;
};
