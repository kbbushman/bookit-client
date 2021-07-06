const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return User.sendError(res, {
      status: 422,
      title: 'Login Error',
      message: 'Email and password are required',
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return User.sendError(res, {
        status: 422,
        title: 'Login Error',
        message: 'Email or password is incorrect',
      });
    }

    if (!user.hasSamePassword(password)) {
      return User.sendError(res, {
        status: 422,
        title: 'Login Error',
        message: 'Email or password is incorrect',
      });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    User.sendError(res, {
      status: 500,
      title: 'Login Error',
      message: 'Something went wrong, please try again',
    });
  }
};

exports.register = async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password) {
    return User.sendError(res, {
      status: 422,
      title: 'Registration Error',
      message: 'Username, email, and password are required',
    });
  }

  if (password !== passwordConfirm) {
    return User.sendError(res, {
      status: 422,
      title: 'Registration Error',
      message: 'Passwords do not match',
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return User.sendError(res, {
        status: 422,
        title: 'Registration Error',
        message: 'Email address has already been registered',
      });
    }

    await User.create({ username, email, password });

    res.status(201).json({ message: 'Registration success' });
  } catch (err) {
    User.sendError(res, {
      status: 500,
      title: 'Registration Error',
      message: 'Something went wrong, please try again',
    });
  }
};

exports.verifyAuth = (req, res) => {
  res.json({ message: 'Auth Verified.', userId: res.locals.user._id });
};

exports.authRequired = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return notAuthorized(res);
  }

  const { decodedToken, tokenError } = parseToken(token);

  if (tokenError) {
    return notAuthorized(res);
  }

  try {
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return notAuthorized(res);
    }

    res.locals.user = user;
    next();
  } catch (err) {
    User.sendError(res, {
      status: 500,
      title: 'Registration Error',
      message: 'Something went wrong, please try again',
    });
  }
};

function parseToken(token) {
  try {
    const decodedToken = jwt.verify(token.split(' ')[1], config.JWT_SECRET);
    return { decodedToken };
  } catch (err) {
    return { tokenError: 'Token could not be parsed' };
  }
}

function notAuthorized(res) {
  return res.status(401).json({
    errors: [
      {
        title: 'Not Authorized',
        message:
          'You do not have permission to access this resource. Please login and try again',
      },
    ],
  });
}
