const Sequelize = require('sequelize');

class Post extends Sequelize.Model{
    static initiate(sequelize){
        Post.init({
            content:{
                type: Sequelize.STRING(140),
                allowNull:false,
            },
        },{
            sequelize,
            timestamps:true,
            underscored:false,
            modelName:'Post',
            tableName:'posts',
            paranoid:false,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    static associate(db){
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.User, { through: 'Like', as:'Likers' });
        db.Post.hasMany(db.Comment);
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
        db.Post.hasMany(db.Image);
        db.Post.belongsTo(db.Post, { as:'Retweet' });
    }
}

module.exports = Post;