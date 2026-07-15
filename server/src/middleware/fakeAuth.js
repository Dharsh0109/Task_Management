const fakeAuth = (req, res, next) => {
  req.user = {
    _id: process.env.FAKE_USER_ID || '000000000000000000000000',
  };

  next();
};

module.exports = fakeAuth;
