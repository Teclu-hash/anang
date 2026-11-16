module.exports = (sequelize, DataTypes) => {
    const BorrowerReference = sequelize.define("BorrowerReference", {
        reference_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        borrower_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reference_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        relationship: {
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
        }
    }, {
        tableName: "borrower_references",
        timestamps: false
    })

//association
    BorrowerReference.associate = (models) => {
        BorrowerReference.belongsTo(models.Borrower, { foreignKey: "borrower_id" })
    }
    return BorrowerReference
}
