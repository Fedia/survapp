export const loginEmail = ({ email, username, application, link }) => ({
  from: application,
  to: email,
  subject: `[${application}] Sign in`,
  html: `
    <p><b>Hi ${username}!</b></p>
    <p>Click the link to login: <a href="${link}">${link}</a></p>`
});
