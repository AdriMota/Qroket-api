import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";
import User from "../models/user.js"

let johnDoe;
let janeDoe;
let user;
let admin;
let other;

beforeEach(cleanUpDatabase);

describe('POST /users', function() {
    it('should create a user', async function() {
        const res = await supertest(app)
            .post('/users')
            .send({
                firstname: 'John',
                lastname: 'Doe',
                phone: '0041780000000',
                email: 'john@doe.ch',
                password: 'password',
                role: 'user',
                location: '63725379e0cac34a8803fdcc'
            })
            .expect(200)
            .expect('Content-Type', /json/);

        // Check that the response body is a JSON object with exactly the properties we expect.
        expect(res.body).toBeObject();
        expect(res.body.id).toMatch(/^[0-9a-f]{24}$/);
        expect(res.body.firstname).toEqual('John');
        expect(res.body.lastname).toEqual('Doe');
        expect(res.body.phone).toEqual(41780000000);
        expect(res.body.email).toEqual('john@doe.ch');
        expect(res.body.role).toEqual('user');
        expect(res.body.location).toEqual('63725379e0cac34a8803fdcc');
        expect(res.body).toContainAllKeys(['firstname', 'lastname', 'phone', 'email', 'role', 'location', 'id']);
    });
});

describe('GET /users', function() {
    beforeEach(async function() {
        // Create 2 users before retrieving the list.
        [ johnDoe, janeDoe ] = await Promise.all([
            User.create({ firstname: 'John', lastname: 'Doe', email: 'john@doe.ch', password: 'password' }),
            User.create({ firstname: 'Jane', lastname: 'Doe', email: 'jane@doe.ch', password: 'password' })
        ]);
    });

    it('should retrieve the list of users', async function() {
        const token = await generateValidJwt(johnDoe);

        const res = await supertest(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.data).toBeArray();
        expect(res.body.data).toHaveLength(2);

        expect(res.body.data[0]).toBeObject();
        expect(res.body.data[0].id).toEqual(janeDoe.id);
        expect(res.body.data[0].firstname).toEqual('Jane');
        expect(res.body.data[0].lastname).toEqual('Doe');
        expect(res.body.data[0].email).toEqual('jane@doe.ch');
        expect(res.body.data[0]).toContainAllKeys(['id', 'firstname', 'lastname', 'role', 'email']);

        expect(res.body.data[1]).toBeObject();
        expect(res.body.data[1].id).toEqual(johnDoe.id);
        expect(res.body.data[1].firstname).toEqual('John');
        expect(res.body.data[1].lastname).toEqual('Doe');
        expect(res.body.data[1].email).toEqual('john@doe.ch');
        expect(res.body.data[1]).toContainAllKeys(['id', 'firstname', 'lastname', 'role', 'email']);
    });
});

describe('PATCH /users/:id', function() {
    beforeEach(async function() {
        // Create 2 users before retrieving the list.
        user = await User.create({ firstname: 'Jakelin', lastname: 'Doe', email: 'jaqueline@doe.ch', password: 'password' });
    });
    
    it('should partially update a user if admin or own informations', async function() {
        const token = await generateValidJwt(user);

        const res = await supertest(app)
            .patch(`/users/${user.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstname: 'Jaqueline'
            })
            .expect(200)
            .expect('Content-Type', /json/);

    })

    it('should not update the role if not an admin', async function() {
        const token = await generateValidJwt(user);

        const res = await supertest(app)
            .patch(`/users/${user.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                role: 'admin'
            })
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");

    })
});

describe('DELETE /users/:id', function() {
    beforeEach(async function() {
        // Create 2 users before retrieving the list.
        user = await User.create({ firstname: 'Jaqueline', lastname: 'Doe', email: 'jaqueline@doe.ch', password: 'password' });
        other = await User.create({ firstname: 'Other', lastname: 'One', email: 'other@one.ch', password: 'password' });
        admin = await User.create({ firstname: 'Admin', lastname: 'Control', email: 'admin@control.ch', role: 'admin', password: 'Admin$00' });
    });

    it('should not delete a user if user', async function() {
        const token = await generateValidJwt(user);

        const res = await supertest(app)
            .delete(`/users/${other.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");
    });

    /* it('should delete a user if admin', async function() {
        const token = await generateValidJwt(admin);

        const res = await supertest(app)
            .delete(`/users/${other.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type',  /json/);
    }); */
});

afterAll(async () => {
  await mongoose.disconnect();
});