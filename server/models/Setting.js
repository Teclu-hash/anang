//simple key/value table for admin settings (interest rate, interest type)
module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define("Setting", {
        setting_key: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        setting_value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "settings",
        timestamps: false
    })
    return Setting
}
