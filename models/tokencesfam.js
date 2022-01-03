'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenCesfam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.TokenCesfam.belongsTo(models.CesfamCoordinator)
    }
  };
  TokenCesfam.init({
    token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TokenCesfam',
  });
  return TokenCesfam;
};