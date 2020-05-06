function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const loginEmail = ({
  from,
  email,
  username,
  application,
  link,
  useragent,
  ip,
}) => ({
  from,
  to: email,
  subject: `[${application}] Sign in`,
  html: `
    <p><b>Hi ${escapeHTML(username)}!</b></p>
    <p>Login request from <tt>${escapeHTML(ip)}</tt> using ${escapeHTML(
    useragent
  )}</p>
    <p>Click the link if that is you: <a href="${link}">${link}</a></p>
    <p>It would be valid for 10 minutes.<p>`,
});
