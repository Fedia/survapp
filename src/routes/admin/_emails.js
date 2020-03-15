function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const loginEmail = ({
  email,
  username,
  application,
  link,
  useragent,
  ip
}) => ({
  from: application,
  to: email,
  subject: `[${application}] Sign in`,
  html: `
    <p><b>Hi ${escapeHTML(username)}!</b></p>
    <p>Login request from <tt>${escapeHTML(ip)}</tt> ${escapeHTML(
    useragent
  )}</p>
    <p>Click the link <u>if that is you</u>: <a href="${link}">${link}</a></p>
    <p>It would be valid for 10 minutes only.<p>`
});
