const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  year: DataTypes.INTEGER,
  genre: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  poster: DataTypes.STRING,
  trailer: DataTypes.STRING,
  duration: DataTypes.INTEGER,
  rating: DataTypes.FLOAT,
  country: DataTypes.STRING,
  language: DataTypes.STRING,
  streams: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'movies'
});

module.exports = Movie;