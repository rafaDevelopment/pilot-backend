"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Person.hasOne(models.User);
      models.Person.hasOne(models.Volunteer);
      models.Person.hasMany(models.Message);
      models.Person.hasMany(models.Report, {
        as: "reportsAsReported",
        foreignKey: "reportedId",
      });
      models.Person.hasMany(models.Report, {
        as: "reportsAsReporter",
        foreignKey: "reporterId",
      });
      models.Person.hasMany(models.Token);
    }
  }
  Person.init(
    {
      rut: DataTypes.STRING,
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      birthDate: DataTypes.DATE,
      comuna: DataTypes.STRING,
      country: DataTypes.STRING,
      civilState: DataTypes.STRING,
      status: DataTypes.INTEGER,
      address: DataTypes.STRING,
      gender: DataTypes.STRING,
      banned: DataTypes.BOOLEAN,
      pictureUrl: DataTypes.STRING,
      role: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        validate: {
          len: [6, 1024],
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Person",
    }
    // TODO: Añadir region
  );
  return Person;
};
