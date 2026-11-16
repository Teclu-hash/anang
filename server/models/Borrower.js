module.exports = (sequelize, DataTypes) => {
    const Borrower = sequelize.define("Borrower", {
        borrower_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        valid_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        monthly_income: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        date_registered: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "borrowers",
        timestamps: false
    })

//association
    Borrower.associate = (models) => {
        //applies_for
        Borrower.hasMany(models.Loan, { foreignKey: "borrower_id" })
        //provides
        Borrower.hasMany(models.BorrowerReference, { foreignKey: "borrower_id" })
    }
    return Borrower
}
