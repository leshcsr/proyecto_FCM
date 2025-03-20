const bcrypt = require('bcrypt');
const User = require('../models/usermodel.js');
const Badges = require('../models/badgemodel');

// routes/user.routes.js
const express = require('express');
const UserController = require('../controllers/user.controller.js');
const router = express.Router();
const { isAdmin, isAuthenticated } = require('../middlewares/auth.js');

/* GET */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Debugging route to test session data
// Route to test session, provided by claude.com
router.get('/session-test', (req, res) => {
    const sessionInfo = {
        views: req.session.views ? ++req.session.views : 1,
        sessionID: req.sessionID,
        userSession: {
            loggedIn: !!req.session.user,
            userData: req.session.user ? {
                id: req.session.user._id,
                username: req.session.user.username,
                email: req.session.user.email,
                score: req.session.user.score,
                admin: req.session.user.admin,
                completedSkills: req.session.user.completedSkills || [],
            } : 'No user logged in'
        }
    };
    if (!req.session.views) {
        req.session.views = 1;
    }
    // Format the response for better readability
    const formattedResponse = {
        ...sessionInfo,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };

    res.json(formattedResponse);
});

// Test route to verify session data
router.get('/test-session', (req, res) => {
    console.log('Current session:', {
        id: req.sessionID,
        user: req.session.user,
        isAuthenticated: !!req.session.user
    });
    
    res.json({
        sessionID: req.sessionID,
        user: req.session.user || 'No user in session',
        completedSkills: req.session.user ? req.session.user.completedSkills : [],
        isAuthenticated: !!req.session.user
    });
});

router.get('/debug-session', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Session = mongoose.connection.collection('sessions');
        
        // Find current session
        const session = await Session.findOne({ _id: req.sessionID });
        
        res.json({
            currentSessionID: req.sessionID,
            sessionFromDB: session,
            currentSession: req.session,
            user: req.session.user
        });
    } catch (err) {
        res.json({
            error: err.message,
            sessionID: req.sessionID,
            session: req.session
        });
    }
});

router.post('/register', async (req, res) => {
    const { username, password, passwordConfirm, email } = req.body;
    
    console.log('Registration attempt:', { username, email }); // Debug log

    // Validation checks
    if (password !== passwordConfirm) {
        return res.status(400).send('Las contraseñas no coinciden.');
    }

    if (password.length < 6) {
        return res.status(400).send('La contraseña debe tener al menos 6 caracteres.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Formato de email inválido.');
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('El nombre de usuario o email ya está en uso.');
        }

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        // Create new user with admin status based on whether they're first
        const newUser = new User({
            username,
            email,
            password, // Password hashing handled by schema
            score: 0,
            admin: isFirstUser, // Set admin true if first user
            completedSkills: []
        });

        await newUser.save();
        
        console.log('User registered successfully:', username, 
                    isFirstUser ? '(as admin)' : ''); // Enhanced debug log

        res.redirect('/users/login');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Error del servidor.');
    }
});

//we have this route because when we initialize the page the component is expecting an error
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    
    try {
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('No user found with username:', username);
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos',
                username
            });
        }

        console.log('User found:', username);
        
        // Direct bcrypt comparison
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos',
                username
            });
        }

        // Create session user
        const sessionUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            score: user.score,
            admin: user.admin,
            completedSkills: user.completedSkills
        };

        req.session.user = sessionUser;
        
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.redirect('/skills');

    } catch (err) {
        console.error('Login error:', err);
        res.render('login', {
            error: 'Error del servidor. Por favor, inténtelo de nuevo.',
            username
        });
    }
});

router.get('/logout', (req, res) => {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/skills');
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid');
            
            // Redirect to login page
            res.redirect('/users/login');
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.redirect('/users/login');
    }
});

router.get('/leaderboard', isAdmin, isAuthenticated, async (req, res) => {
    try {
        // Get all users and sort by score
        const users = await User.find({}).sort({ score: -1 });
        
        // Get all badges sorted by minimum points
        const badges = await Badges.find({}).sort({ bitpoints_min: 1 });
        
        // Group users by badge level
        const usersByBadge = {};
        
        // Initialize badge groups
        badges.forEach(badge => {
            usersByBadge[badge.rango] = {
                badge: badge,
                users: []
            };
        });
        
        // Assign users to their highest badge level
        users.forEach(user => {
            // Find the highest badge the user qualifies for
            const qualifyingBadge = badges.filter(badge => 
                user.score >= badge.bitpoints_min && 
                user.score <= badge.bitpoints_max
            ).pop();
            
            if (qualifyingBadge) {
                usersByBadge[qualifyingBadge.rango].users.push({
                    username: user.username,
                    score: user.score,
                    badge: qualifyingBadge
                });
            }
        });



    } catch (error) {
        console.error('Error in leaderboard:', error);
        res.status(500).render('error', { 
            message: 'Error loading leaderboard',
            error: { status: 500, stack: error.stack }
        });
    }
});

module.exports = router;