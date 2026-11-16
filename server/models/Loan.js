module.exports = (sequelize, DataTypes) => {
    const Loan = sequelize.define("Loan", {
        loan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        borrower_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        principal_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        interest_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "simple"
        },
        loan_term: {
            //number of months
            type: DataTypes.INTEGER,
            allowNull: false
        },
        loan_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        due_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        remaining_balance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        loan_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "active"
        }
    }, {
        tableName: "loans",
        timestamps: false
    })

//association
    Loan.associate = (models) => {
        Loan.belongsTo(models.Borrower, { foreignKey: "borrower_id" })
        Loan.belongsTo(models.User, { foreignKey: "user_id" })
        //receives
        Loan.hasMany(models.LoanPayment, { foreignKey: "loan_id" })
        //incurs
        Loan.hasMany(models.LoanPenalty, { foreignKey: "loan_id" })
    }
    return Loan
}
