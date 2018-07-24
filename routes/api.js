// vim: tabstop=2 shiftwidth=2 expandtab
//

const express = require('express');
const router = express.Router();
const debug = require('debug')('nvrapp:api');
const passport = require('passport');
var Strategy = require('passport-local').Strategy;
const cel = require('connect-ensure-login');

const dbAuth = require('../file-db-auth');
const auth_path = process.env.AUTH_PATH || '/data/auth';
const auth = new dbAuth(auth_path);

router.use(require('express-session')({ secret: auth.getPrivateKey(), resave: false, saveUninitialized: false }));

passport.use(new Strategy(
  function(username, password, cb) {
    auth.authenticate(username, password)
    .then((userInfo) => {
      return cb(null, userInfo);
    })
    .catch((err) => {
      return cb(err);
    });
  }
));

passport.serializeUser(function(userInfo, cb) {
  cb(null, userInfo.username);
});

passport.deserializeUser(function(username, cb) {
  auth.getUserInfo(username)
  .then((userInfo) => {
    return cb(null, userInfo);
  })
  .catch((err) => {
    return cb(err);
  });
});

router.use(passport.initialize());
router.use(passport.session());

const expressGraphQL = require('express-graphql');
//import {
//  GraphQLSchema,
//  GraphQLObjectType,
//  GraphQLString,
//} from 'graphql';
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');

const myGraphQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
	},
      },
    },
  }),
});

// Enable CORS routes for debug only
if (debug.enabled) {
  router.use(function(req, res, next) {
    //res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-API-Key");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });
  router.options(function(req, res, next) {
    res.status(200).end();
  });
}

router.use('/graphql', cel.ensureLoggedIn(), expressGraphQL({
  schema: myGraphQLSchema,
  graphiql: true,
}));

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('graphql');
});

router.get('/login', 
  passport.authenticate('local', { failureRedirect: 'test' }),
  function(req, res) {
    res.redirect('graphql');
});

router.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('test');
});

/**
 * @swagger
 * /image:
 *   get:
 *     description: Download the image
 *       Authentication token for requested info is required
 *     parameters:
 *       - name: album
 *         in: query
 *         description: Album name
 *         schema:
 *           type: string
 *           required: true
 *       - name: image
 *         in: query
 *         description: image name
 *         schema:
 *           type: string
 *           required: true
 *       - name: thumb
 *         in: query
 *         description: an optional thumb dimension (e.g. "50x50")
 *         schema:
 *           type: string
 *           required: false
 *     responses:
 *       200:
 *         description: Returns the download
 *     security:
 *       - ApiKeyAuth: []
 */
router.get('/image', cel.ensureLoggedIn(), function(req, res, next) {

  let album = req.query.album;
  let image = req.query.image;
  let thumb = req.query.thumb;

  handler.image(album, image, thumb, (err, image_buffer, content_type) => {
    if (err) {
      res.status(500);
      res.json(err);
      res.end();
      return;
    }
    res.set('Content-Type', content_type);
    res.send(image_buffer);
    res.end();
  });

});

/**
 * @swagger
 * /video:
 *   get:
 *     description: Download
 *       Authentication token for requested info is required
 *     parameters:
 *       - name: album
 *         in: query
 *         description: Album name
 *         schema:
 *           type: string
 *           required: true
 *       - name: image
 *         in: query
 *         description: image name
 *         schema:
 *           type: string
 *           required: true
 *     responses:
 *       200:
 *         description: Returns the download
 *     security:
 *       - ApiKeyAuth: []
 */
router.get('/video', cel.ensureLoggedIn(), function(req, res, next) {

  let album = req.query.album;
  //TODO probably rename to video or something instead of image
  let image = req.query.image;

  handler.video(album, image, (err, video_file) => {
    if (err) {
      res.status(500);
      res.json(err);
      res.end();
      return;
    }
    res.download(video_file);
  });

});

module.exports = router;

