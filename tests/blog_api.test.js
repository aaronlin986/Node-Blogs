const mongoose = require('mongoose');
const supertest = require('supertest');
const Blog = require('../models/blog');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map(b => new Blog(b));
    const promiseArray = blogObjects.map(b => b.save());
    await Promise.all(promiseArray);
});

test('get all blogs', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('verifies that id is an existing property of blogs', async () => {
    const response = await api.get('/api/blogs');

    response.body.map(b => expect(b.id).toBeDefined);
});

test('adds a blog to the db', async () => {
    const newBlog = {
        title: "Test",
        author: "Tester",
        url: "asklfa",
        likes: 0
    };

    await api
        .post('/api/blogs')
        .send(newBlog);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain('Test');
});

test('default property likes is zero', async () => {
    const newBlog = {
        title: "Test",
        author: "Tester",
        url: "asllqp"
    };

    await api  
        .post('/api/blogs')
        .send(newBlog);

    const blogsAtEnd = await Blog.find({});
    const blog = blogsAtEnd.find(b => b.url === "asllqp");
    expect(blog.likes).toBe(0);
});

test('missing title and url', async () => {
    const newBlog = {
        author: "Tester",
        likes: 10
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);
});

test('deletion of a blog', async () => {
    const blogsAtStart = await Blog.find({});
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const url = blogsAtEnd.map(b => b.url);
    expect(url).not.toContain(blogToDelete.url);
});

test('updating of a blog', async () => {
    const blogsAtStart = await Blog.find({});
    const blogToUpdate = blogsAtStart[0];

    const updatedBlog = {
        ...blogToUpdate,
        url: "123"
    };

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog);

    const blogsAtEnd = await Blog.find({});
    const foundBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id);
    expect(foundBlog.url).not.toBe(blogToUpdate.url);
});

afterAll(() => {
    mongoose.connection.close();
});