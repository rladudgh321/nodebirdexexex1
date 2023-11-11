const Sequelize = require('sequelize');

class User extends Sequelize.Model{
    static initiate(sequelize){
        User.init({
            email:{
                type:Sequelize.STRING(100),
                allowNull:false,
                unique:true,
            },
            password:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            nickname:{
                type:Sequelize.STRING(20),
                allowNull:false,
            },
        },{
            sequelize,
            timestamps:true,
            underscored:false,
            modelName:'User',
            tableName:'users',
            paranoid:true,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Comment);
        db.User.belongsToMany(db.User, { through:'Follow', as:'Followings', foreignKey:'FollowerId' });
        db.User.belongsToMany(db.User, { through:'Follow', as:'Followers', foreignKey:'FollowingId' });
        db.User.belongsToMany(db.Post, { through:'Like', as:'Liked' });
    }
}

module.exports = User;