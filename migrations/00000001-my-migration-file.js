"use strict";
const { Op } = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("auth_user", {
      id: {
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        type: Sequelize.INTEGER,
      },
      password: { allowNull: true, type: Sequelize.STRING(128) },
      last_login: { allowNull: true, type: Sequelize.DATE },
      is_superuser: { allowNull: false, type: Sequelize.BOOLEAN },
      username: { allowNull: true, type: Sequelize.STRING(150) },
      first_name: { allowNull: false, type: Sequelize.STRING(150) },
      last_name: { allowNull: false, type: Sequelize.STRING(150) },
      email: { allowNull: false, type: Sequelize.STRING(254) },
      is_staff: { allowNull: true, type: Sequelize.BOOLEAN },
      is_active: { allowNull: false, type: Sequelize.BOOLEAN },
      date_joined: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("auth_user");
  },
};
