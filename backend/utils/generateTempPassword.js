// Generate a random temporary password (8-12 characters)
const generateTempPassword = () => {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let tempPassword = '';
  
  for (let i = 0; i < length; i++) {
    tempPassword += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return tempPassword;
};

module.exports = generateTempPassword;
