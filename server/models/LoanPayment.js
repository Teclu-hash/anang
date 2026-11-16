module.exports = (sequelize, DataTypes) => {
    const LoanPayment = sequelize.define("LoanPayment", {
        payment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        loan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        amount_paid: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        principal_paid: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        interest_paid: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "cash"
        },
        payment_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "paid"
        }
    }, {
        tableName: "loan_payments",
        timestamps: false
    })

//association
    LoanPayment.associate = (models) => {
        LoanPayment.belongsTo(models.Loan, { foreignKey: "loan_id" })
        LoanPayment.belongsTo(models.User, { foreignKey: "user_id" })
    }
    return LoanPayment
}
