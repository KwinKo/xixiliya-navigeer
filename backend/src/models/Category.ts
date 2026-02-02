import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Category extends Model {
  public id!: number;
  public userId!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Category.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    indexes: [
      { unique: true, fields: ['userId', 'name'] }
    ]
  }
);

export default Category;