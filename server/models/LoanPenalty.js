module.exports = (sequelize, DataTypes) => {
    const LoanPenalty = sequelize.define("LoanPenalty", {
        penalty_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        loan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        penalty_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        penalty_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        penalty_reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        penalty_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "unpaid"
        }
    }, {
        tableName: "loan_penalties",
        timestamps: false
    })

//association
    LoanPenalty.associate = (models) => {
        LoanPenalty.belongsTo(models.Loan, { foreignKey: "loan_id" })
    }
    return LoanPenalty
}
