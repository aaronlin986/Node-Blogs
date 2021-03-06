const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1});
    response.json(blogs);
});

blogsRouter.post('/', async (request, response, next) => {
    if(!request.body.title || !request.body.url){
        response.status(400).end();
        return;
    }
    try{
        const decodedToken = jwt.verify(request.token, process.env.SECRET);

        if(!decodedToken.id){
            return response.status(401).json({error: "token missing or invalid"});
        }
    
        const user = await User.findById(decodedToken.id);
    
        const blog = new Blog(request.body);
        blog.user = user.id;
    
        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();
        response.status(201).json(savedBlog);
    }
    catch(error){
        next(error);
    }
});

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id);

    if(request.user !== blog.user.toString()){
        return response.status(401).json({error: "invalid token or invalid user"});
    }

    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body;

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    };

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true});
    response.json(updatedBlog);
});

module.exports = blogsRouter;