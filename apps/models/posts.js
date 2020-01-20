var db = require("../common/database");

function addNewPost(entity) {
    return db.add('posts', entity);
}

function deletePostById(id) {
    return db.deleteById('posts', id);
}

function findAll() {
    return db.findAll('posts');
}

function getPage(limit, offset) {
    var sql = `SELECT p.*, c.name as category_name from posts p LEFT JOIN categories c on p.category_id = c.id LIMIT ${limit} OFFSET ${offset}`;
    return db.excute(sql);
}

function countPage() {
    var sql = `SELECT COUNT(*) as total from posts`;
    return db.excute(sql);
}

function findById(id) {
    return db.findById('posts', id);
}

//Find all posts
function findAllPost() {
    return new Promise((resolve, reject) => {
        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID
        FROM posts ,users, categories 
        WHERE posts.created_by = users.id AND posts.category_id = categories.id 
        ORDER BY posts.post_date DESC`;
        var conn = db.getConnection();
        conn.connect();
        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        });
    })
}

//number of posts 
function getNumberOfPost(){
    return new Promise((resolve, reject) => {
        var sql = `SELECT COUNT(*) as max
        FROM posts 
        WHERE posts.status = 1`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value[0]);
            conn.end();
        });
    })
}

//number of comments
function getNumberOfComments(){
    return new Promise((resolve, reject) => {
        var sql = `SELECT posts.id as postID, COUNT(comments.id) as numberOfComment
        FROM posts
        LEFT JOIN comments ON posts.id = comments.post_id
        GROUP BY posts.id`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        });
    })
}

//Get Top 10 of hot new posts
function displayHotNews() {
    return new Promise((resolve, reject) => {
        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID
        FROM posts ,users, categories 
        WHERE posts.created_by = users.id AND posts.category_id = categories.id AND posts.status = 1
        ORDER BY posts.post_date DESC
        LIMIT 12`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(value);
            }
            conn.end();
        })
    })
}

//Get top 10 posts having high view
function displayTopView() {
    return new Promise((resolve, reject) => {

        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID
        FROM posts ,users, categories 
        WHERE posts.created_by = users.id AND posts.category_id = categories.id AND posts.status = 1
        ORDER BY posts.views DESC
        LIMIT 10`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        })
    })
}

//Find a post by ID
function findByPostId(id) {
    return new Promise((resolve, reject) => {

        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID
        from posts,users, categories 
        WHERE posts.id = ? AND posts.created_by = users.id AND posts.category_id = categories.id`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, id, (err, value) => {
            if (err) reject(err);
            else {
                resolve(value[0]);
            }
            conn.end();
        });
    });
}

//Pagination
function findLimit(begin, perpage) {
    return new Promise((resolve, reject) => {
        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID, post_tageds.tag_name as tagName, post_tageds.tag_id as tagID
        FROM posts ,users, categories , post_tageds 
        WHERE posts.created_by = users.id AND posts.category_id = categories.id AND posts.status = 1 AND post_tageds.post_id = posts.id
        LIMIT ${perpage} OFFSET ${begin}`;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        });
    })
}

function getAllPostsEditorManage(status, editorId) {
    var conn = db.getConnection();
    return new Promise((resolve, reject) => {
        conn.connect();
        var sql = `SELECT categories.name,  users.username, posts.id, posts.avatar, posts.content, posts.summary_content, posts.thumb_img, posts.title, posts.created_at
        FROM categories, posts, users
        WHERE categories.id = posts.category_id AND posts.status = ? AND posts.created_by = users.id AND categories.id IN (SELECT manage_categories.category_manage_id FROM manage_categories WHERE manage_categories.editor_id = ?)`;
        conn.query(sql, [status, editorId], (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        });
    });
}
function getAllPostsApprovedEditorManage(editorId) {
    var conn = db.getConnection();
    return new Promise((resolve, reject) => {
        conn.connect();
        var sql = `SELECT categories.name,  users.username, posts.id, posts.avatar, posts.content, posts.summary_content, posts.thumb_img, posts.title, posts.created_at
        FROM categories, posts, users
        WHERE categories.id = posts.category_id AND (posts.status = 1 OR posts.status = 0) AND posts.created_by = users.id AND categories.id IN (SELECT manage_categories.category_manage_id FROM manage_categories WHERE manage_categories.editor_id = ?)`;
        conn.query(sql, [editorId], (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        });
    });
}
function updatePost(entity, id) {
    return db.update('posts', entity, id);
}

function getTopPostOfWeek(){
    return new Promise((resolve, reject) => {
        var sql = `SELECT posts.*, users.pseudonym as userName, categories.name as catName,categories.id as catID
        FROM posts ,users, categories 
        WHERE posts.created_by = users.id AND posts.category_id = categories.id AND posts.status = 1
        ORDER BY posts.views DESC, posts.post_date DESC `;

        var conn = db.getConnection();
        conn.connect();

        conn.query(sql, (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        })
    })
}

function getAllPostWriter(created_by, status){
    var conn = db.getConnection();
    return new Promise((resolve, reject) => {
        var sql = `SELECT * FROM posts WHERE posts.created_by = ? AND posts.status = ? `;
        conn.connect();
        conn.query(sql,[created_by, status], (err, value) => {
            if (err) reject(err);
            else resolve(value);
            conn.end();
        })
    })}

function searchPosts(search) {
    var sql = `SELECT * FROM posts WHERE MATCH(title, content, summary_content) AGAINST('${search}') ORDER BY premium_status DESC`;
    return db.excute(sql);
}

module.exports = {
    // Lấy tất cả những bài post ở status = 0 do editor quản lí
    getAllPostsEditorManage: getAllPostsEditorManage,
    updatePost: updatePost,
    findAllPost: findAllPost,
    getTopHot: displayHotNews,
    getTopView: displayTopView,
    findLimit: findLimit,
    findByPostId: findByPostId,
    getTopPostOfWeek: getTopPostOfWeek,
    deletePostById: deletePostById,
    findAll: findAll,
    findById: findById,
    addNewPost: addNewPost,
    getNumberOfPost: getNumberOfPost,
    getNumberOfComments: getNumberOfComments,
    getAllPostWriter: getAllPostWriter,
    getPage,
    countPage,
    searchPosts,
    getAllPostsApprovedEditorManage: getAllPostsApprovedEditorManage
}
