const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({username: 'root', passwordHash});

    await user.save();
});

describe('tests for proper username and passwords', () => {
    test('succeeds with valid username and password', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "lina",
            password: "salainen"
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);
        
        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });

    test('fails with missing unique username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "root",
            password: "salainen"
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain("Username must be unique.");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('fails with short username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "r",
            password: "salainen"
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain("Username and password must be at least 3 characters.");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test('fails with short password', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "roo",
            password: "sn"
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain("Username and password must be at least 3 characters.");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });
});