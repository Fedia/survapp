import mailer from "nodemailer";
import { loginEmail } from "./_emails";

const emails = process.env.USER_EMAILS;
const domains = process.env.USER_DOMAINS;
const allowEmails = [];
const allowDomains = [];
const split = str => str.split(/ +/).filter(Boolean);
if (emails) {
  allowEmails.push(...split(emails));
}
if (domains) {
  allowDomains.push(...split(domains));
}

function allowedEmail(email) {
  if (allowEmails.includes(email)) return true;
  const parts = email.split("@");
  if (allowDomains.includes(parts[1])) return true;
  if (!allowDomains.length && !allowEmails.length) return true;
  return false;
}

const baseurl = req =>
  //  `${req.connection.encrypted ? "https" : "http"}://${req.headers.host}`;
  "https://" + req.headers.host;

const randString = l =>
  [...Array(l)].map(() => ((Math.random() * 36) | 0).toString(36)).join("");

function sendLink(email, link) {
  if (!process.env.MAIL_CONN) throw new Error("MAIL_CONN is empty");
  const transport = mailer.createTransport(process.env.MAIL_CONN);
  return transport.sendMail(
    loginEmail({
      email,
      link,
      username: email.split("@")[0],
      application: process.env.APP_NAME || "surv.app"
    })
  );
}

export async function post(req, res) {
  const { email } = req.body;
  if (email) {
    if (!allowedEmail(email)) {
      res.sendStatus(400);
      return;
    }
    const token = randString(8);
    req.session.login = { token, email };
    const link = `${baseurl(req)}${req.path}?token=${token}`;
    try {
      await sendLink(email, link);
      res.send({ status: "ok" });
    } catch (e) {
      console.error(e);
      res.status(500).send({ status: "error" });
    }
  } else {
    res.sendStatus(400);
  }
}

export async function get(req, res) {
  const { token } = req.query;
  const { login } = req.session;
  if (token && login) {
    if (login.token === token) {
      req.session.login = null;
      req.session.user = { email: login.email };
    }
  }
  // BUG in express - cookie not set with redirect header: https://github.com/expressjs/session/issues/660
  // res.redirect(`${req.path}/../`);
  res.send(
    `<html><head><meta http-equiv="refresh" content="0;URL=${req.path}/../"></head></html>`
  );
}
