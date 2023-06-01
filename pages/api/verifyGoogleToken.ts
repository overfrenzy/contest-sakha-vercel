const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

const verifyGoogleToken = async (req, res, next) => {
  try {
    const token = req.headers.session; // Retrieve the token from the request headers or any other location

    if (!token) {
      throw new Error('Google ID token missing');
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'YOUR_GOOGLE_CLIENT_ID',
    });

    const payload = ticket.getPayload();
    // Validate the payload as needed (e.g., check user's email, ID, etc.)

    // Attach the authenticated user information to the request object if needed
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google ID token' });
  }
};

module.exports = verifyGoogleToken;
