const dummy = blogs => {
    return 1;
};

const totalLikes = blogs => {
    const reducer = (acc, curr) => {
        return acc + curr.likes;
    };

    return blogs.reduce(reducer, 0);
};

const favoriteBlog = blogs => {
    if(blogs.length === 0){
        return {};
    }

    const max = Math.max(...blogs.map(b => b.likes));
    const foundBlog = blogs.find(b => b.likes === max);

    const result = {
        title: foundBlog.title,
        author: foundBlog.author,
        likes: foundBlog.likes
    };
    
    return result;
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
};
