import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Bookmark extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
  public url!: string;
  public description!: string;
  public icon!: string;
  public categoryId!: number;
  public isPublic!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Bookmark.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(10),
      defaultValue: '🔗',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'bookmarks',
  }
);

export default Bookmark;