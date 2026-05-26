function isValidEmail(email) {
  const regex = /^[\w]+@[\w]+\.[\w]+$/;

  return regex.test(email);
}

module.exports = { isValidEmail };
