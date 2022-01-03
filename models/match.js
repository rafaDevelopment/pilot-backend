'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Match.belongsTo(models.User)
      models.Match.belongsTo(models.Volunteer)
      models.Match.hasMany(models.Activity)
    }
  };
  Match.init({
    date: DataTypes.DATE,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};