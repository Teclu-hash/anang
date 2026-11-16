module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "staff"
        }
    }, {
        tableName: "users",
        timestamps: false
    })

//association
    User.associate = (models) => {
        //manages
        User.hasMany(models.Loan, { foreignKey: "user_id" })
        //records
        User.hasMany(models.LoanPayment, { foreignKey: "user_id" })
    }
    return User
}
