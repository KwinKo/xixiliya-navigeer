import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public bookmarkLimit!: number;
  public disabled!: boolean;
  public siteName!: string;
  public siteDesc!: string;
  public bgMode!: string;
  public bgColor!: string;
  public bgImage!: string;
  public enableParticles!: boolean;
  public particleStyle!: string;
  public particleColor!: string;
  public cardColor!: string;
  public cardOpacity!: number;
  public cardTextColor!: string;
  public enableMinimalMode!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 验证密码
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  // 移除密码字段
  override toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'user',
    },
    bookmarkLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    siteName: {
      type: DataTypes.STRING(100),
      defaultValue: 'My Navigation',
    },
    siteDesc: {
      type: DataTypes.TEXT,
      defaultValue: 'Personal bookmark collection',
    },
    bgMode: {
      type: DataTypes.STRING(20),
      defaultValue: 'gradient',
    },
    bgColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#667eea',
    },
    bgImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enableParticles: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    particleStyle: {
      type: DataTypes.STRING(20),
      defaultValue: 'stars',
    },
    particleColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#ffffff',
    },
    cardColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#ffffff',
    },
    cardOpacity: {
      type: DataTypes.INTEGER,
      defaultValue: 85,
    },
    cardTextColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#333333',
    },
    enableMinimalMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

// 密码加密
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;