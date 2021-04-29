/* eslint-disable */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const chai = require('chai');
const request = require('supertest');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

before((done) => {
    require("../index").init();
    done()
  });

const server = "http://127.0.0.1:5000/"

const ERR = {
    USERNAME_EXISTS: "Username exists",
}

var cookie;

function loginUser(cookie) {
    return function(done) {
        request(server)
            .post('/auth')
            .send({
                username: 'user',
                passw: 'PASSWORD1'
            })
            .expect(200)
            .end(onResponse);

        function onResponse(err, res) {
            cookie = res.headers["set-cookie"][0];
            return done();
        }
    };
}

describe('POST User', () => {
    it('should create a user', (done) => {
        request(server)
        .post('api/users_create')
        .send({ username: "user1", passw: "PASSWORD1", agb: true }) // sends a JSON post body
        .expect(200)
        .set('accept', 'json')
        .end((err, res) => {
            const text = JSON.parse(res.res.text);
            if(text){
                expect(err).to.be.null;
                expect(text).to.have.property("users_id");
            }
            done();
        });
    });

    it('should not recreate the user', (done) => {
        request(server)
        .post('api/users_create')
        .send({ username: "user", passw: "PASSWORD1", agb: true }) // sends a JSON post body
        .expect(200)
        .set('accept', 'json')
        .end((err, res) => {
            const text = JSON.parse(res.res.text);
            if(text){
                expect(err).to.be.null;
                expect(text.error).to.be.an('array').that.does.include(ERR.USERNAME_EXISTS);
            }
            done();
        });
    });

    before(loginUser(cookie));
    console.log(cookie)

    it('should delete the user', (done) => {
        request(server)
        .post('api/a_users_delete')
        .send({ username: "user", passw: "PASSWORD1", agb: true }) // sends a JSON post body
        .set('Cookie', cookie)
        .expect(200)
        .set('accept', 'json')
        .end((err, res) => {
            const text = res.res.text;
            if(text){
                expect(err).to.be.null;
                expect(text.error).to.equal(true)
            }
            done();
        });
    });

});

